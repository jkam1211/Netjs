﻿// Copyright 2014-2016 Frank A. Krueger
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//    http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Diagnostics;
using System.IO;
using System.Linq;
using ICSharpCode.Decompiler;
using ICSharpCode.Decompiler.Ast;
using Mono.Cecil;

namespace Netjs
{
	public class App : IAssemblyResolver
	{
		class Config
		{
			public List<string> AssembliesToDecompile = new List<string> ();
			public List<string> ScriptsToLink = new List<string> ();
			public bool ShowHelp = false;
			public bool ES3Compatible = false;
			public bool IncludeRefs = false;
			public string OutputJsPath = null;
		}

		public static int Main (string[] args)
		{
			var config = new Config ();
			for (int i = 0; i < args.Length; i++) {
				var a = args[i];
				switch (a) {
					case "--includerefs":
					case "-r":
						config.IncludeRefs = true;
						break;
					case "--help":
					case "-h":
					case "-?":
					case "/?":
						config.ShowHelp = true;
						break;
					case "--es3":
						config.ES3Compatible = true;
						break;
					case "--outjs":
					case "-j" when i + 1 < args.Length:
						config.OutputJsPath = args[i+1];
						i++;
						break;
					default:
						if (!a.StartsWith ("-")) {
							var ext = Path.GetExtension (a).ToLowerInvariant ();
							if (ext == ".dll" || ext == ".exe")
								config.AssembliesToDecompile.Add (a);
							else if (ext == ".js" || ext == ".ts")
								config.ScriptsToLink.Add (a);
						}
						break;
				}
			}
			try {
				return new App ().Run (config);
			} catch (Exception ex) {
				Error ("{0}", ex);
				return 1;
			}
		}

		int Run (Config config)
		{
			Stopwatch sw = new Stopwatch ();
			sw.Start ();

			if (config.AssembliesToDecompile.Count == 0) {
				config.ShowHelp = true;
			}

			if (config.ShowHelp) {
				Console.WriteLine ($"Netjs compiler, Copyright 2014-{DateTime.Now.Year} Frank A. Krueger");
				Console.WriteLine ("Compiles .NET assemblies to TypeScript and JavaScript");
				Console.WriteLine ();
				Console.WriteLine ("Syntax: netjs [options] assemblies [scripts]");
				Console.WriteLine ();
				Console.WriteLine ("Examples: netjs App.exe");
				Console.WriteLine ("          netjs --outjs app.js App.exe ads.ts");
				Console.WriteLine ();
				Console.WriteLine ("Options:");
				Console.WriteLine ("   --es3                Output ECMAScript 3 compatible code");
				Console.WriteLine ("   --help, -h           Show usage information");
				Console.WriteLine ("   --includerefs, -r    Decompile referenced assemblies");
				Console.WriteLine ("   --outjs, -j FILE     Output JavaScript to FILE by linking the generated TypeScript and");
				Console.WriteLine ("                        and other .js and .ts scripts given on the command line");
				return 2;
			}

			string outPath = "";
			var asmPaths = new List<string> ();

			foreach (var asmRelPath in config.AssembliesToDecompile) {
				var asmPath = Path.GetFullPath (asmRelPath);
				asmPaths.Add (asmPath);

				if (string.IsNullOrEmpty (outPath)) {
					outPath = Path.ChangeExtension (asmPath, ".ts");
				}

				var asmDir = Path.GetDirectoryName (asmPath);
				if (!asmSearchPaths.Exists (x => x.Item1 == asmDir)) {
					asmSearchPaths.Add (Tuple.Create (asmDir, config.IncludeRefs));
				}
			}

			Step ("Reading IL");
			globalReaderParameters.AssemblyResolver = this;
			globalReaderParameters.ReadingMode = ReadingMode.Immediate;

			var libDir = Path.GetDirectoryName (typeof (String).Assembly.Location);
			asmSearchPaths.Add (Tuple.Create(libDir, false));
			asmSearchPaths.Add (Tuple.Create(Path.Combine (libDir, "Facades"), false));

			AssemblyDefinition firstAsm = null;
			foreach (var asmPath in asmPaths) {
				Info ("  Reading {0}", asmPath);
				var asm = AssemblyDefinition.ReadAssembly (asmPath, globalReaderParameters);
				if (firstAsm == null)
					firstAsm = asm;
				referencedAssemblies[asm.Name.Name] = asm;
				decompileAssemblies.Add (asm);
			}

			Step ("Decompiling IL");
			var context = new DecompilerContext (firstAsm.MainModule);
			context.Settings.ForEachStatement = false;
			context.Settings.ObjectOrCollectionInitializers = false;
			context.Settings.UsingStatement = false;
			context.Settings.AsyncAwait = false;
			context.Settings.AutomaticProperties = true;
			context.Settings.AutomaticEvents = true;
			context.Settings.QueryExpressions = false;
			context.Settings.AlwaysGenerateExceptionVariableForCatchBlocks = true;
			context.Settings.UsingDeclarations = false;
			context.Settings.FullyQualifyAmbiguousTypeNames = true;
			context.Settings.YieldReturn = false;
			var builder = new AstBuilder (context);
			var decompiled = new HashSet<string> ();
			for (;;) {
				var a = decompileAssemblies.FirstOrDefault (x => !decompiled.Contains (x.FullName));
				if (a != null) {
					Info ("  Decompiling {0}", a.FullName);
					builder.AddAssembly (a);
					decompiled.Add (a.FullName);
				}
				else {
					break;
				}
			}
			builder.RunTransformations ();

			Step ("Compiling TypeScript");
			new CsToTs (config.ES3Compatible).Run (builder.SyntaxTree);

			Step ("Writing TypeScript");
			Info ("  Writing {0}", outPath);
			using (var outputWriter = new StreamWriter (outPath)) {
				var output = new PlainTextOutput (outputWriter);
				builder.GenerateCode (output, (s, e) => new TsOutputVisitor (s, e));
			}

			if (!string.IsNullOrEmpty (config.OutputJsPath)) {
				Step ("Compiling JavaScript");
				var tscArgs = new List<string> {
					"--allowJs",
					"-t",
					config.ES3Compatible ? "ES3" : "ES5",
					"--outFile",
					config.OutputJsPath,
					outPath,
				};
				var tscStartInfo = new ProcessStartInfo ("tsc", string.Join (" ", tscArgs.Select (x => $"\"{x}\"")));
				var tscProcess = Process.Start (tscStartInfo);
				tscProcess.WaitForExit ();
				Error ("Failed to compile JavaScript");
				return 3;
			}

			Step ("Done in " + sw.Elapsed);
			return 0;
		}

		#region Logging

		public static void Step (string message)
		{
			Console.ForegroundColor = ConsoleColor.Cyan;
			Console.WriteLine (message);
			Console.ResetColor ();
		}

		public static void Warning (string format, params object[] args)
		{
			Warning (string.Format (format, args));
		}

		public static void Warning (string message)
		{
			Console.ForegroundColor = ConsoleColor.Yellow;
			Console.WriteLine (message);
			Console.ResetColor ();
		}

		public static void Error (string format, params object[] args)
		{
			Console.ForegroundColor = ConsoleColor.Red;
			Console.WriteLine (format, args);
			Console.ResetColor ();
		}

		public static void Info (string format, params object[] args)
		{
			Console.WriteLine (format, args);
		}

		public static void InfoDetail (string format, params object[] args)
		{
			Console.ForegroundColor = ConsoleColor.DarkGray;
			Console.WriteLine (format, args);
			Console.ResetColor ();
		}

		#endregion

		#region IAssemblyResolver implementation

		public void Dispose () {}
		
		readonly ReaderParameters globalReaderParameters = new ReaderParameters ();
		readonly List<Tuple<string, bool>> asmSearchPaths = new List<Tuple<string, bool>> ();
		readonly Dictionary<string, AssemblyDefinition> referencedAssemblies = new Dictionary<string, AssemblyDefinition> ();
		readonly List<AssemblyDefinition> decompileAssemblies = new List<AssemblyDefinition> ();

		public AssemblyDefinition Resolve (AssemblyNameReference name)
		{
			//Info ("R1: {0}", name);
			return Resolve (name, globalReaderParameters);
		}
		public AssemblyDefinition Resolve (AssemblyNameReference name, ReaderParameters parameters)
		{
			//Info ("R2: {0}", name);
			var n = name.Name;
			AssemblyDefinition asm;
			if (!referencedAssemblies.TryGetValue (n, out asm)) {
				foreach (var x in asmSearchPaths) {
					var asmDir = x.Item1;
					var fn = Path.Combine (asmDir, name.Name + ".dll");
					if (File.Exists (fn)) {
						asm = AssemblyDefinition.ReadAssembly (fn, parameters);
						referencedAssemblies[n] = asm;
						if (x.Item2) {
							decompileAssemblies.Add (asm);
						}
						InfoDetail ("    Loaded {0} (decompile={1})", fn, x.Item2);
						break;
					}
				}
				if (asm == null) {
					Error ("    Could not find assembly {0}", name);
				}
			}
			return asm;
		}
		public AssemblyDefinition Resolve (string fullName)
		{
			//Info ("R3: {0}", fullName);
			return null;
		}
		public AssemblyDefinition Resolve (string fullName, ReaderParameters parameters)
		{
			//Info ("R4: {0}", fullName);
			return null;
		}

		#endregion
	}
}

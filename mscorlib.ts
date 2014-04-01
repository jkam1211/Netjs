// Copyright 2014 Frank A. Krueger
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

class NObject
{
	Equals(other: NObject): boolean
	{
		return this === other;
	}
	GetHashCode(): number
	{
		return NString.GetHashCode (this.toString ());
	}
	ToString(): string
	{
		return this.GetType ().Name;
	}
	toString(): string
	{
		return this.ToString ();
	}
	GetType(): Type
	{
		return new Type (this.constructor.toString().match(/function (\w*)/)[1]);
	}
	static ReferenceEquals(x: NObject, y: NObject): boolean
	{
		return x === y;
	}
	static GenericEquals(x: any, y: any): boolean
	{
		if (typeof x === "object") return x.Equals(y);
		return x === y;
	}
	static GenericToString(x: any): string
	{
		if (typeof x === "object") return x.ToString();
		return x.toString ();
	}
	static GenericGetHashCode(x: any): number
	{		
		if (typeof x === "object") return x.GetHashCode();
		return NString.GetHashCode (this.toString ());
	}
}

class Exception extends NObject
{
	Message: string;
	constructor(message: string = "")
	{
		super();
		this.Message = message;
	}
	ToString(): string
	{
		return "Exception: " + this.Message;
	}
}

class NEvent<T>
{
	private listeners: T[] = new Array<T> ();

	Add(listener: T): void
	{
		this.listeners.push(listener);
	}

	Remove(listener: T): void
	{
		var index = this.listeners.indexOf(listener);
		if (index < 0) return;
		this.listeners.splice(index, 1);
	}

	ToMulticastFunction(): any
	{
		if (this.listeners.length === 0)
			return null;
		return function() {
			for (var i in this.listeners) {
				this.listeners[i].call (arguments);
			}
		};
	}
}

class NArray
{
	static IndexOf<T> (values: T[], value: T): number
	{
		var i,
		    n = values.length;
		for (i = 0; i < n; i++) {
			if (values[i] === value)
				return i;
		}
		return -1;
	}
	static ToEnumerable<T> (array: T[]): IEnumerable<T>
	{
		return new Array_Enumerable<T> (array);
	}
	static Resize<T> (parray: T[][], newLength: number): void
	{
		if (parray[0] === null) {
			parray[0] = new Array<T> (newLength);
			return;
		}
		if (parray[0].length === newLength) {
			return;
		}
		throw new NotImplementedException ();
	}
}

class NNumber
{
	static Parse(text: string): number
	static Parse(text: string, style: NumberStyles, provider: IFormatProvider): number
	static Parse(text: string, provider: IFormatProvider): number
	static Parse(text: string, styleOrProvider?: any, provider?: IFormatProvider): number
	{
		return parseFloat(text);
	}

	static ToString(num: number): string
	static ToString(num: number, provider: IFormatProvider): string
	static ToString(num: number, format: string, provider: IFormatProvider): string
	static ToString(num: number, providerOrFormat?: any, provider?: IFormatProvider): string
	{
		return num.toString();
	}
	static GetHashCode(num: number): number
	{
		return num;
	}
	static IsInfinity(num: number): boolean
	{
		return num === Infinity;
	}
	static TryParse(str: string, pvalue: number[]): boolean
	{
		throw new NotImplementedException ();
	}
	static IsNaN(num: number): boolean
	{
		return isNaN (num);
	}
}

class NBoolean
{
	static TryParse(str: string, pbool: boolean[]): boolean
	{
		throw new NotImplementedException;
	}
	static GetHashCode(bool: boolean): number
	{
		return bool ? 1 : 0;
	}
}

class NChar
{
	static IsWhiteSpace(ch: number): boolean
	{
		return ch === 32 || (ch >= 9 && ch <= 13) || ch === 133 || ch === 160;
	}
	static IsLetter(ch: number): boolean
	{
		return (65 <= ch && ch <=  90) || (97 <= ch && ch <= 122) || (ch >= 128 && ch !== 133 && ch !== 160);
	}
	static IsLetterOrDigit(ch: number): boolean
	{
		return (48 <= ch && ch <= 57) || (65 <= ch && ch <=  90) || (97 <= ch && ch <= 122) || (ch >= 128 && ch !== 133 && ch !== 160);
	}
	static IsDigit(ch: number): boolean
	static IsDigit(str: string, index: number): boolean
	static IsDigit(chOrStr: any, index?: number): boolean
	{
		if (arguments.length == 1) {
			return 48 <= chOrStr && chOrStr <= 57;
		}
		else {
			var ch = chOrStr.charCodeAt(index);
			return 48 <= ch && ch <= 57;
		}
	}
}

class NString
{
	static IndexOf (str: string, ch: number): number
	static IndexOf (str: string, ch: number, startIndex: number): number
	static IndexOf (str: string, sub: string): number
	static IndexOf (str: string, sub: string, startIndex: number): number
	static IndexOf (str: string, chOrSub: any, startIndex?: number): number
	{
		var sub: string;
		if (chOrSub.constructor == Number) {
			sub = String.fromCharCode (chOrSub);
		}
		else {
			sub = chOrSub;
		}
		return str.indexOf(sub);
	}
	static IndexOfAny (str: string, subs: number[]): number
	{
		for (var i = 0; i < str.length; ++i) {
			var c = str.charCodeAt(i);
			for (var j = 0; j < subs.length; ++j) {
				if (c == subs[j])
					return i;
			}
		}
		return -1;
	}
	static GetHashCode(str: string): number
	{
		var hash = 0, i, l, ch;
		if (str.length == 0) return hash;
		for (i = 0, l = str.length; i < l; i++) {
			ch  = str.charCodeAt(i);
			hash  = ((hash<<5)-hash) + ch;
			hash |= 0; // Convert to 32bit integer
		}
		return hash;
	}
	static Replace(str: string, pattern: number, replacement: number): string
	static Replace(str: string, pattern: string, replacement: string): string
	static Replace(str: string, pattern: any, replacement: any): string
	{
		var ps = (pattern.constructor === Number) ? String.fromCharCode (pattern) : pattern;
		var rs = (replacement.constructor === Number) ? String.fromCharCode (replacement) : replacement;
		return str.replace(ps, rs);
	}
	static Substring(str: string, startIndex: number): string
	static Substring(str: string, startIndex: number, length: number): string
	static Substring(str: string, startIndex: number, length: number = -1): string
	{
		return length < 0 ? str.substr(startIndex) : str.substr(startIndex, length);
	}
	static Remove(str: string, startIndex: number): string
	static Remove(str: string, startIndex: number, length: number): string
	static Remove(str: string, startIndex: number, length?: number): string
	{
		throw new NotImplementedException();
	}	
	static Trim(str: string): string
	{
		return str.trim();
	}
	static TrimStart(str: string, trimChars: number[]): string
	{
		throw new NotImplementedException();
	}
	static TrimEnd(str: string, trimChars: number[]): string
	{
		throw new NotImplementedException();
	}
	static ToUpperInvariant(str: string): string
	{
		return str.toUpperCase ();
	}
	static ToLowerInvariant(str: string): string
	{
		return str.toLowerCase ();
	}
	static StartsWith(str: string, sub: string): boolean
	static StartsWith(str: string, sub: string, comp: StringComparison): boolean
	static StartsWith(str: string, sub: string, comp?: StringComparison): boolean
	{
		throw new NotImplementedException();
	}

	static Format(provider: IFormatProvider, format: string, args: any[]): string;
	static Format(format: string, arg0: any): string;
	static Format(format: string, arg0: any, arg1: any): string;
	static Format(format: string, arg0: any, arg1: any, arg2: any): string;
	static Format(providerOrFormat: any, formatOrArg0?: any, argsOrArg1?: any, arg2?: any): string
	{
		throw new NotImplementedException ();
	}
	static IsNullOrEmpty(str: string): boolean
	{
		return !str;
	}
	static Join(separator: string, parts: string[]): string
	{
		throw new NotImplementedException();
	}
	static Concat(parts: any[]): string
	{
		throw new NotImplementedException();
	}

	static FromChars(ch: number, count: number): string
	static FromChars(chars: number[]): string
	static FromChars(chOrChars: any, count: number = 1): string
	{
		if (chOrChars.constructor === Number) {
			var r = String.fromCharCode (chOrChars);
			for (var i = 2; i < count; i++) {
				r += String.fromCharCode (chOrChars);
			}
			return r;
		}
		throw new NotImplementedException ();
	}
}

enum StringComparison
{
	InvariantCultureIgnoreCase,
	Ordinal,
}

class NMath extends NObject
{
	static Truncate (value: number): number
	{
		return value >= 0 ? Math.floor(value) : Math.ceil(value);
	}
	static Log (a: number): number
	static Log (a: number, newBase: number): number
	static Log (a: number, newBase: number = Math.E): number
	{
		if (newBase === Math.E)
			return Math.log (a);
		return Math.log(a) / Math.log(newBase);
	}
	static Round (a: number): number
	static Round (a: number, decimals: number): number
	static Round (a: number, decimals: number = 0): number
	{
		if (decimals === 0)
			return Math.round(a);
		var s = Math.pow(10, decimals);
		return Math.round(a * s) / s;
	}
	static Cosh (x: number): number
	{
		throw new NotImplementedException ();
	}
	static Sinh (x: number): number
	{
		throw new NotImplementedException ();
	}
	static Tanh (x: number): number
	{
		throw new NotImplementedException ();
	}
}

//
// System
//

class Type extends NObject
{
	constructor(public Name: string)
	{
		super();
	}
	Equals(obj: any): boolean
	{
		return (obj instanceof Type) && ((<Type>obj).Name === this.Name);
	}
}

class Nullable<T> extends NObject
{
	Value: T;
	get HasValue(): boolean { return this.Value != null; }
	constructor(value: T = null)
	{
		super();
		this.Value = value;
	}
}

enum DateTimeKind
{
	Local,
	Unspecified,
	Utc
}

class DateTime extends NObject
{
	private dt: Date;
	private kind: DateTimeKind;
	get Kind(): DateTimeKind { return this.kind; }	
	get Year(): number { return this.kind === DateTimeKind.Utc ? this.dt.getUTCFullYear() : this.dt.getFullYear(); }
	get Month(): number { return this.kind === DateTimeKind.Utc ? this.dt.getUTCMonth()+1 : this.dt.getMonth()+1; }
	get Day(): number { return this.kind === DateTimeKind.Utc ? this.dt.getUTCDate() : this.dt.getDate(); }
	constructor()
	constructor(year: number, month: number, day: number)
	constructor(year: number = 1, month: number = 1, day: number = 1)
	{
		super();
		this.dt = new Date(year, month-1, day);
		this.kind = DateTimeKind.Unspecified;
	}	
	ToString(): string
	{
		return this.kind === DateTimeKind.Utc ? this.dt.toUTCString() : this.dt.toString();
	}
	static get UtcNow(): DateTime
	{
		var d = new DateTime();
		d.dt = new Date();
		d.kind = DateTimeKind.Utc;
		return d;
	}
	static get Now(): DateTime
	{
		var d = new DateTime();
		d.dt = new Date();
		d.kind = DateTimeKind.Local;
		return d;
	}
	static op_Subtraction(x: DateTime, y: DateTime): TimeSpan
	{
		return TimeSpan.FromSeconds ((x.dt.getTime() - y.dt.getTime()) / 1000);
	}
	static op_GreaterThanOrEqual(x: DateTime, y: DateTime): boolean
	{
		return x.dt >= y.dt;
	}
}

class TimeSpan extends NObject
{
	private ticks: number;
	constructor(ticks: number)
	{
		super();
		this.ticks = ticks;
	}
	get TotalDays(): number
	{
		throw new NotImplementedException ();
	}
	get Days(): number
	{
		throw new NotImplementedException ();
	}
	get Hours(): number
	{
		throw new NotImplementedException ();
	}
	get Minutes(): number
	{
		throw new NotImplementedException ();
	}
	get Seconds(): number
	{
		throw new NotImplementedException ();	
	}
	static FromSeconds(seconds: number): TimeSpan
	{
		return new TimeSpan (seconds * 100e9);
	}
	static FromDays(days: number): TimeSpan
	{
		var hours = days*24;
		var minutes = 60*hours;
		return TimeSpan.FromSeconds (60*minutes);
	}
	static op_GreaterThanOrEqual(x: TimeSpan, y: TimeSpan)
	{
		return x.ticks >= y.ticks;
	}
}

class NConsole extends NObject
{
	static WriteLine (line: string)
	static WriteLine (format: string, arg0: any)
	static WriteLine (lineOrFormat: string, arg0?: any)
	{
		throw new NotImplementedException ();
	}
	static Out: TextWriter;
}

class ArgumentException extends Exception
{
	constructor(name: string)
	constructor(message: string, name: string)
	constructor(nameOrMessage: string, name?: string)
	{
		super();
	}
}

class ArgumentNullException extends ArgumentException
{
	constructor(name: string)
	{
		super(name);
	}
}

class ArgumentOutOfRangeException extends ArgumentException
{
	constructor(name: string)
	{
		super(name);
	}
}

class EventArgs extends NObject
{
	
}

class EventHandler extends NObject
{
	Invoke (sender: any, e: EventArgs): void
	{		
	}
}


class InvalidOperationException extends Exception
{

}

class Environment
{
	static NewLine: string = "\n";
}

class Convert extends NObject
{
	static ToString (num: number, radix: number): string
	static ToString (num: number, provider: IFormatProvider): string
	static ToString (num: number, radixOrProvider: any): string
	{
		throw new NotImplementedException ();
	}
}

class NumberFormatInfo extends NObject
{
	NumberDecimalSeparator: string = ".";
	NumberGroupSeparator: string = ",";
}


interface IFormatProvider
{
	GetFormat(type: Type): any;
}

enum NumberStyles
{
	HexNumber
}

class Encoding extends NObject
{
	static UTF8: Encoding = new Encoding();
}

class CultureInfo extends NObject implements IFormatProvider
{
	static InvariantCulture: CultureInfo = new CultureInfo("Invariant");
	static CurrentCulture: CultureInfo = CultureInfo.InvariantCulture;

	Name: string = "Invariant";

	private nfi: NumberFormatInfo = new NumberFormatInfo ();

	GetFormat(type: Type): any
	{
		if (type.Name === "NumberFormatInfo") {
			return this.nfi;
		}
		return null;
	}

	constructor(name: string)
	{
		super();
	}
}

class NotImplementedException extends Exception
{
	constructor(message: string = "Not implemented")
	{
		super(message);
	}
}

class NotSupportedException extends Exception
{
	constructor(message: string = "Not supported")
	{
		super(message);
	}
}

class OverflowException extends Exception
{
	constructor()
	{
		super("Overflow");
	}
}


//
// System.Collections.Generic
//

interface IEnumerable<T>
{
	GetEnumerator(): IEnumerator<T>;
}

interface IEnumerator<T> extends IDisposable
{
	MoveNext(): boolean;
	Current: T;
}

interface IDisposable
{
	Dispose(): void;
}

interface IList<T>
{
	Count: number;
	get_Item(index: number): T;
	set_Item(index: number, value: T): void;
}

class List<T> extends NObject implements IList<T>, IEnumerable<T>
{
	array: T[] = new Array<T> (); // Public to help the enumerator

	constructor();
	constructor(capactiy: number);
	constructor(items: IEnumerable<T>);
	constructor(itemsOrCapacity?: any)
	{
		super();
		if (arguments.length == 1 && itemsOrCapacity.constructor !== Number) {
			this.AddRange (itemsOrCapacity);
		}
	}

	Add (item: T)
	{
		this.array.push(item);
	}

	AddRange (items: IEnumerable<T>)
	{
		var e = items.GetEnumerator ();
		while (e.MoveNext ()) {
			this.Add (e.Current);
		}
	}

	get Count(): number
	{
		return this.array.length;
	}

	get_Item(index: number): T
	{
		return this.array[index];
	}

	set_Item(index: number, value: T): void
	{
		this.array[index] = value;
	}

	GetEnumerator(): List_Enumerator<T>
	{
		return new List_Enumerator<T> (this);
	}

	RemoveAt(index: number): void
	{
		this.array.splice(index, 1);
	}

	RemoveRange(index: number, count: number): void
	{
		throw new NotImplementedException ();
	}

	Insert(index: number, item: T): void
	{
		this.array.splice(index, 0, item);
	}

	Clear(): void
	{
		this.array = new Array<T> ();
	}

	ToArray(): T[]
	{
		return this.array.slice(0);
	}

	RemoveAll(predicate: (item: T)=>boolean): void
	{
		var newArray: T[] = new Array<T> ();

		for (var i = 0; i < this.array.length; i++) {
			if (!predicate(this.array[i]))
				newArray.push(this.array[i]);
		}

		this.array = newArray;
	}

	Reverse(): void
	{
		throw new NotImplementedException ();
	}

	IndexOf(item: T): number
	{
		return this.array.indexOf(item);
	}
}

class Array_Enumerator<T> extends NObject implements IEnumerator<T>, IDisposable
{
	private array: T[];
	private index: number = -1;
	constructor (array: T[])
	{
		super();
		this.array = array;
	}
	MoveNext(): boolean
	{
		this.index++;
		return this.index < this.array.length;
	}
	get Current(): T
	{
		return this.array[this.index];
	}
	Dispose(): void
	{
	}
}

class Array_Enumerable<T> extends NObject implements IEnumerable<T>
{
	private array: T[];
	constructor (array: T[])
	{
		super();
		this.array = array;
	}
	GetEnumerator(): Array_Enumerator<T>
	{
		return new Array_Enumerator<T> (this.array);
	}
}

class List_Enumerator<T> extends Array_Enumerator<T>
{
	constructor (list: List<T>)
	{
		super(list.array);
	}
}

class Stack<T> extends List<T>
{
	Push(item: T): void
	{
		this.Add(item);
	}
	Pop(): T
	{
		throw new NotImplementedException ();	
	}
}

class HashSet<T> extends NObject implements IEnumerable<T>
{
	private store = {};

	Add(item: T): void
	{
		throw new NotImplementedException ();	
	}

	GetEnumerator(): HashSet_Enumerator<T>
	{
		throw new NotImplementedException ();
	}

	Contains(item: T): boolean
	{
		throw new NotImplementedException ();
	}

	get Count(): number
	{
		throw new NotImplementedException ();
	}
}

class HashSet_Enumerator<T> extends NObject implements IEnumerator<T>, IDisposable
{
	MoveNext(): boolean
	{
		throw new NotImplementedException ();
	}
	get Current(): T
	{
		throw new NotImplementedException ();	
	}
	Dispose(): void
	{
	}
}

class KeyValuePair<K, V> extends NObject
{
	Key: K;
	Value: V;

	constructor(key: K, value: V)
	{
		super();
		this.Key = key;
		this.Value = value;
	}
}

interface IDictionary<K, V>
{

}

class Dictionary<K, V> extends NObject implements IDictionary<K, V>, IEnumerable<KeyValuePair<K, V>>
{	
	private keys = {};
	private values = {};

	constructor();
	constructor(other: IDictionary<K, V>);
	constructor(other?: IDictionary<K, V>)
	{
		super();
	}

	get_Item(key: K): V
	{
		return <V>this.values[this.GetKeyString (key)];
	}

	set_Item(key: K, value: V)
	{
		var ks = this.GetKeyString (key);
		if (!this.values.hasOwnProperty(ks)) {
			this.keys[ks] = key;
		}
		this.values[ks] = value;
	}

	Add(key: K, value: V)
	{
		var ks = this.GetKeyString (key);
		if (this.values.hasOwnProperty(ks)) {
			throw new InvalidOperationException ();
		}
		else {
			this.keys[ks] = key;
			this.values[ks] = value;
		}
	}

	private GetKeyString(key: K): string
	{
		if (key === null)
			return "null";
		if (typeof key === "undefined")
			return "undefined";
		return key+"";
	}

	ContainsKey (key: K): boolean
	{
		return this.values.hasOwnProperty(this.GetKeyString (key));
	}

	TryGetValue(key: K, pvalue: V[]): boolean
	{
		var ks = this.GetKeyString (key);
		if (this.values.hasOwnProperty(ks)) {
			pvalue[0] = this.values[ks];
			return true;
		}
		else {
			pvalue[0] = null;
			return false;
		}
	}

	Remove(key: K): void
	{
		var ks = this.GetKeyString (key);
		delete this.values[ks];
		delete this.keys[ks];
	}

	Clear(): void
	{
		this.values = {};
		this.keys = {};
	}

	get Count(): number
	{
		return Object.keys(this.values).length;
	}
	GetEnumerator(): Dictionary_Enumerator<K,V>
	{
		var kvs = new List<KeyValuePair<K,V>>();
		for (var ks in this.values) {
			kvs.Add (new KeyValuePair<K,V> (this.keys[ks], this.values[ks]));
		}
		return new Dictionary_Enumerator<K,V> (kvs);
	}
	get Keys(): Dictionary_KeyCollection<K, V>
	{
		var keys = new Dictionary_KeyCollection<K, V> ();
		for (var ks in this.keys) {
			keys.Add (this.keys[ks]);
		}
		return keys;
	}
	get Values(): Dictionary_ValueCollection<K, V>
	{
		var vals = new Dictionary_ValueCollection<K, V> ();
		for (var ks in this.values) {
			vals.Add (this.values[ks]);
		}
		return vals;
	}
}

class Dictionary_Enumerator<K, V> extends List_Enumerator<KeyValuePair<K,V>>
{
	constructor (list: List<KeyValuePair<K,V>>)
	{
		super(list);
	}
}

class Dictionary_KeyCollection<K, V> extends List<K>
{
}

class Dictionary_KeyCollection_Enumerator<K, V> extends List_Enumerator<K>
{
	constructor (list: List<K>)
	{
		super(list);
	}
}

class Dictionary_ValueCollection<K, V> extends List<V>
{
}

class Dictionary_ValueCollection_Enumerator<K, V> extends List_Enumerator<V>
{
	constructor (list: List<V>)
	{
		super(list);
	}
}

class Regex extends NObject
{
	private re: RegExp;
	constructor(pattern: string)
	{
		super();
		this.re = new RegExp(pattern, "g");
	}

	Match(input: string): Match
	{
		var m = new Match();
		var r = this.re.exec(input);
		if (r) {
			var loc = r.index;
			for (var i = 0; i < r.length; ++i) {
				var text = "";
				if (typeof r[i] === "undefined") {}
				else if (r[i].constructor === String)
					text = r[i];
				m.Groups.Add (new Group (text, loc));
				if (i !== 0)
					loc += text.length;
			}
			m.Success = true;
		}
		return m;
	}

	Replace(input: string, repl: string): string
	{
		return input.replace(this.re, repl);
	}

	IsMatch(input: string): boolean
	{
		return this.re.test(input);
	}
}

class Match extends NObject
{
	Groups: List<Group> = new List<Group> ();
	Success: boolean = false;
}

class Group extends NObject
{
	Length: number = 0;
	Value: string = "";
	Index: number = 0;
	constructor(value: string, index: number)
	{
		super();
		this.Value = value||"";
		this.Length = this.Value.length;
		this.Index = index;
	}
}

class Stream extends NObject
{
}

class MemoryStream extends Stream
{
	ToArray(): number[]
	{
		throw new NotImplementedException ();
	}
}

class TextWriter extends NObject implements IDisposable
{
	Write(text: string): void
	{
		throw new NotSupportedException();
	}
	WriteLine(): void
	WriteLine(text: string): void
	WriteLine(text?: string): void
	{
		this.Write(text + Environment.NewLine);
	}
	Flush(): void
	{
		throw new NotSupportedException();
	}
	Dispose(): void
	{
	}
}

class StreamWriter extends TextWriter
{
	constructor(path: string);
	constructor(stream: Stream, encoding: Encoding);
	constructor(streamOrPath: any, encoding?: Encoding)
	{
		super();
	}
}

class BinaryWriter extends NObject
{
	BaseStream: Stream;

	constructor(baseStream: Stream)
	constructor(baseStream: Stream, encoding: Encoding)
	constructor(baseStream: Stream, encoding?: Encoding)
	{
		super();
	}

	Write(n: number): void
	Write(n: number[]): void
	Write(n: any): void
	{
		throw new NotImplementedException ();
	}

	Flush(): void
	{
		throw new NotImplementedException ();
	}	
}


class StringBuilder extends NObject
{
	private parts: string[] = new Array<string> ();

	Append(text: string): void
	Append(char: number): void
	Append(textOrChar: any): void
	{
		var text: string = (textOrChar.constructor == Number) ? String.fromCharCode (textOrChar) : textOrChar;
		this.parts.push(text);
	}

	AppendLine(): void
	AppendLine(text: string): void
	AppendLine(text: string = null): void
	{
		if (text !== null) {
			this.parts.push(text);
		}
		this.parts.push(Environment.NewLine);
	}

	AppendFormat(text: string): void
	AppendFormat(format: string, arg0: any): void
	AppendFormat(format: string, arg0: any, arg1: any): void
	AppendFormat(format: string, arg0: any, arg1: any, arg2: any): void
	AppendFormat(textOrFormat: string, arg0?: any, arg1?: any, arg2?: any): void
	{
		throw new NotImplementedException ();
	}

	ToString(): string
	{
		return this.parts.join("");
	}

	get Length(): number
	{
		var len = 0;
		for (var i = 0; i < this.parts.length; i++) {
			len += this.parts[i].length;
		}
		return len;
	}

	get_Item(index: number): number
	{
		var o = 0;
		for (var i = 0; i < this.parts.length; ++i) {
			var p = this.parts[i];
			if (index < o + p.length) {
				return p.charCodeAt (index - o);
			}
			o += p.length;
		}
		return 0;
	}
}

class TextReader extends NObject implements IDisposable
{
	ReadLine(): string
	{
		throw new NotSupportedException ();	
	}
	ReadToEnd(): string
	{
		throw new NotSupportedException ();
	}
	Dispose(): void
	{		
	}
}

class StringReader extends TextReader
{
	private str: string;
	private pos: number;	
	constructor(str: string)
	{
		super();
		this.str = str;
		this.pos = 0;
	}
	ReadLine(): string
	{
		var p = this.pos;
		if (p >= this.str.length)
			return null;
		var end = p;
		while (end < this.str.length && this.str.charCodeAt(end) !== 10) {
			end++;
		}
		var tend = end;
		if (tend > p && this.str.charCodeAt(tend-1) == 13) {
			tend--;
		}
		var r = this.str.substr(p, tend - p);
		this.pos = end + 1;
		return r;
	}
}

class StringWriter extends TextWriter
{

}

//
// System.Linq
//

class Enumerable extends NObject
{
	static ToArray<T>(e: IEnumerable<T>): T[]
	{
		throw new NotImplementedException ();
	}

	static ToList<T>(e: IEnumerable<T>): List<T>
	{
		return new List<T>(e);
	}

	static Empty<T>(): IEnumerable<T>
	{
		return new List<T> ();
	}

	static Select<T,U>(e: IEnumerable<T>, selector: (T)=>U): IEnumerable<U>
	{
		throw new NotImplementedException ();
	}

	static SelectMany<T,U>(e: T[], selector: (T)=>IEnumerable<U>): IEnumerable<U>
	static SelectMany<TSource,TResult>(e: IEnumerable<TSource>, selector: (TSource)=>IEnumerable<TResult>): IEnumerable<TResult>
	static SelectMany<TSource,TResult>(e: IEnumerable<TSource>, selector: (TSource, number)=>IEnumerable<TResult>): IEnumerable<TResult>
	static SelectMany<TSource,TCollection,TResult>(e: IEnumerable<TSource>, selector: (TSource)=>IEnumerable<TCollection>, comb: (TSource,TCollection)=>TResult): IEnumerable<TResult>
	static SelectMany<T,U>(e: any, selector: any, comb?: any): IEnumerable<U>
	{
		throw new NotImplementedException ();
	}

	static Where<T>(e: T[], p: (a: T)=>boolean): IEnumerable<T>
	static Where<T>(e: IEnumerable<T>, p: (a: T)=>boolean): IEnumerable<T>
	static Where<T>(e: any, p: (a: T)=>boolean): IEnumerable<T>
	{
		throw new NotImplementedException ();
	}

	static OrderBy<T, U>(e: IEnumerable<T>, s: (a: T)=>U): IEnumerable<T>
	{
		throw new NotImplementedException ();		
	}
	static ThenBy<T, U>(e: IEnumerable<T>, s: (a: T)=>U): IEnumerable<T>
	{
		throw new NotImplementedException ();		
	}

	static Concat<T>(x: T[], y: T[]): IEnumerable<T>
	static Concat<T>(x: IEnumerable<T>, y: IEnumerable<T>): IEnumerable<T>
	static Concat<T>(x: any, y: any): IEnumerable<T>
	{
		throw new NotImplementedException ();
	}

	static Take<T>(x: T[], count: number): IEnumerable<T>
	static Take<T>(x: IEnumerable<T>, count: number): IEnumerable<T>
	static Take<T>(x: any, count: number): IEnumerable<T>
	{
		throw new NotImplementedException ();
	}

	static Skip<T>(x: T[], count: number): IEnumerable<T>
	static Skip<T>(x: IEnumerable<T>, count: number): IEnumerable<T>
	static Skip<T>(x: any, count: number): IEnumerable<T>
	{
		throw new NotImplementedException ();
	}

	static Distinct<T>(e: IEnumerable<T>): IEnumerable<T>
	{
		throw new NotImplementedException ();
	}

	static Cast<T>(e: IEnumerable<T>): IEnumerable<T>
	{
		return e;
	}

	static FirstOrDefault<T>(e: T[]): T
	static FirstOrDefault<T>(e: IEnumerable<T>): T
	static FirstOrDefault<T>(e: IEnumerable<T>, p: (a: T)=>boolean): T
	static FirstOrDefault<T>(e: any, p?: (a: T)=>boolean): T
	{
		throw new NotImplementedException ();
	}

	static First<T>(e: T[]): T
	static First<T>(e: IEnumerable<T>): T
	static First<T>(e: IEnumerable<T>, p: (a: T)=>boolean): T
	static First<T>(e: any, p?: (a: T)=>boolean): T
	{
		throw new NotImplementedException ();
	}

	static Any<T>(e: IEnumerable<T>, s: (a: T)=>boolean): boolean
	static Any<T>(e: T[], s: (a: T)=>boolean): boolean
	static Any<T>(e: any, s: (a: T)=>boolean): boolean
	{
		throw new NotImplementedException ();
	}

	static All<T>(e: IEnumerable<T>, s: (a: T)=>boolean): boolean
	static All<T>(e: T[], s: (a: T)=>boolean): boolean
	static All<T>(e: any, s: (a: T)=>boolean): boolean
	{
		throw new NotImplementedException ();
	}

	static Count<T>(e: IEnumerable<T>): number
	static Count<T>(e: T[]): number
	static Count<T>(e: any): number
	{
		throw new NotImplementedException ();
	}

	static Sum<T>(e: IEnumerable<T>, s: (a: T)=>number): number
	static Sum<T>(e: T[], s: (a: T)=>number): number
	static Sum<T>(e: any, s: (a: T)=>number): number
	{
		throw new NotImplementedException ();
	}

	static Max<T>(e: IEnumerable<T>): number
	static Max<T>(e: T[]): number
	static Max<T>(e: IEnumerable<T>, s: (a: T)=>number): number
	static Max<T>(e: T[], s: (a: T)=>number): number
	static Max<T>(e: any, s?: (a: T)=>number): number
	{
		throw new NotImplementedException ();
	}

	static Min<T>(e: IEnumerable<T>): number
	static Min<T>(e: T[]): number
	static Min<T>(e: IEnumerable<T>, s: (a: T)=>number): number
	static Min<T>(e: T[], s: (a: T)=>number): number
	static Min<T>(e: any, s?: (a: T)=>number): number
	{
		throw new NotImplementedException ();
	}

	static ToDictionary<T,K,V>(e: IEnumerable<T>, k: (T)=>K, v: (T)=>V): Dictionary<K,V>
	{
		throw new NotImplementedException ();
	}
}


interface INotifyPropertyChanged
{
	PropertyChanged: NEvent<(sender: any, e: PropertyChangedEventArgs) => void>;
}

class PropertyChangedEventArgs extends EventArgs
{
	constructor(name: string)
	{
		super();
	}
}


class Debug extends NObject
{
	static WriteLine (text: string): void
	{
		console.log(text);
	}
}

class Thread extends NObject
{
	private static nextId: number = 1;
	static CurrentThread: Thread = new Thread();	
	ManagedThreadId: number;
	constructor()
	{
		super();
		this.ManagedThreadId = Thread.nextId++;
	}
}

class ThreadPool extends NObject
{
	static QueueUserWorkItem (workItem: (a:any)=>void): void
	{
		throw new NotImplementedException ();
	}
}

class Monitor extends NObject
{
	static Enter(lock: any): void
	{
	}
	static Exit(lock: any): void
	{
	}
}

class Interlocked extends NObject
{
	static CompareExchange(location1: number[], value: number, comparand: number): number
	{
		var v: number = location1[0];
		if (v === comparand)
			location1[0] = value;
		return v;
	}
}

class WebClient extends NObject
{
	DownloadString(url: string): string
	{
		throw new NotImplementedException ();
	}
}


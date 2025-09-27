import { test } from "node:test";
import assert from "node:assert";

import { oneChar, literal, oneCharOf, parseString, chain, optional, repeat, prefix, suffix, surround, oneOf, integer, Parser, digitNonZero, digit, pattern, patterns, inputString, float, oneCharExcept, repeatAtLeastOnce } from "./index.js";


test('simple tests', (t) => {
	{
		const input = "a";
		const expectedResult = "a";
		const parser = oneChar();
		assert.deepStrictEqual(parseString(input, parser), expectedResult);
	}
	{
		const input = "";
		const expectedResult = undefined;
		const parser = oneChar();
		assert.deepStrictEqual(parseString(input, parser), expectedResult);
	}
	{
		const input = "a";
		const expectedResult = "a";
		const parser = oneCharOf("abc");
		assert.deepStrictEqual(parseString(input, parser), expectedResult);
	}
	{
		const input = "a";
		const expectedResult = undefined;
		const parser = oneCharOf("");
		assert.deepStrictEqual(parseString(input, parser), expectedResult);
	}
	{
		const input = "b";
		const expectedResult = "b";
		const parser = oneCharExcept("a");
		assert.deepStrictEqual(parseString(input, parser), expectedResult);
	}
	{
		const input = "a";
		const expectedResult = undefined;
		const parser = oneCharExcept("a");
		assert.deepStrictEqual(parseString(input, parser), expectedResult);
	}
	{
		const input = "";
		const expectedResult = undefined;
		const parser = oneCharExcept("a");
		assert.deepStrictEqual(parseString(input, parser), expectedResult);
	}
	{
		const input = "a";
		const expectedResult = "a";
		const parser = oneCharExcept("");
		assert.deepStrictEqual(parseString(input, parser), expectedResult);
	}
	{
		const input = "Hello";
		const expectedResult = "Hello";
		const parser = literal("Hello");
		assert.deepStrictEqual(parseString(input, parser), expectedResult);
	}
	{
		const input = "";
		const expectedResult = "";
		const parser = literal("");
		assert.deepStrictEqual(parseString(input, parser), expectedResult);
	}
});

test('chain tests', (t) => {
	{
		const input = "Hello";
		const expectedResult = ["Hello"];
		const parser = chain(literal("Hello"));
		assert.deepStrictEqual(parseString(input, parser), expectedResult);
	}
	{
		const input = "HelloWorld";
		const expectedResult = ["Hello", "World"];
		const parser = chain(literal("Hello"), literal("World"));
		assert.deepStrictEqual(parseString(input, parser), expectedResult);
	}
	{
		const input = "HelloBla";
		const expectedResult = undefined;
		const parser = chain(literal("Hello"), literal("World"));
		assert.deepStrictEqual(parseString(input, parser), expectedResult);
	}
	{
		const input = "Bla";
		const expectedResult = undefined;
		const parser = chain(literal("Hello"), literal("World"));
		assert.deepStrictEqual(parseString(input, parser), expectedResult);
	}
	{
		const input = "HelloWorld";
		const expectedResult = undefined;
		const parser = chain<Parser<string, unknown>[]>();
		assert.deepStrictEqual(parseString(input, parser), expectedResult);
	}
	{
		const input = "Hello42World";
		const expectedResult = 42;
		const parser = pattern`Hello${integer()}World`;
		assert.deepStrictEqual(parseString(input, parser), expectedResult);
	}
	{
		const input = "Hello42";
		const expectedResult = 42;
		const parser = pattern`Hello${integer()}`;
		assert.deepStrictEqual(parseString(input, parser), expectedResult);
	}
	{
		const input = "42World";
		const expectedResult = 42;
		const parser = pattern`${integer()}World`;
		assert.deepStrictEqual(parseString(input, parser), expectedResult);
	}
	{
		const input = "a21b42c";
		const expectedResult = [21, 42];
		const parser = patterns`a${integer()}b${integer()}c`;
		assert.deepStrictEqual(parseString(input, parser), expectedResult);
	}
	{
		const input = "a21b42";
		const expectedResult = [21, 42];
		const parser = patterns`a${integer()}b${integer()}`;
		assert.deepStrictEqual(parseString(input, parser), expectedResult);
	}
	{
		const input = "21b42c";
		const expectedResult = [21, 42];
		const parser = patterns`${integer()}b${integer()}c`;
		assert.deepStrictEqual(parseString(input, parser), expectedResult);
	}
	{
		const input = "21b42";
		const expectedResult = [21, 42];
		const parser = patterns`${integer()}b${integer()}`;
		assert.deepStrictEqual(parseString(input, parser), expectedResult);
	}
	{
		const input = "21";
		const expectedResult = [21];
		const parser = patterns`${integer()}`;
		assert.deepStrictEqual(parseString(input, parser), expectedResult);
	}
	{
		const input = "";
		const expectedResult: unknown[] = [];
		const parser = patterns``;
		assert.deepStrictEqual(parseString(input, parser), expectedResult);
	}
});

test('repeat tests', (t) => {
	{
		const input = "";
		const expectedResult: string[] = [];
		const parser = repeat(literal("Hello"));
		assert.deepStrictEqual(parseString(input, parser), expectedResult);
	}
	{
		const input = "";
		const expectedResult = undefined;
		const parser = repeatAtLeastOnce(literal("Hello"));
		assert.deepStrictEqual(parseString(input, parser), expectedResult);
	}
	{
		const input = "HelloHello";
		const expectedResult = ["Hello", "Hello"];
		const parser = repeat(literal("Hello"));
		assert.deepStrictEqual(parseString(input, parser), expectedResult);
	}

});

test('choice tests', (t) => {
	{
		const input = "";
		const expectedResult = undefined;
		const parser = optional(literal("Hello"));
		assert.deepStrictEqual(parseString(input, parser), expectedResult);
	}
	{
		const input = "Hello";
		const expectedResult = "Hello";
		const parser = optional(literal("Hello"));
		assert.deepStrictEqual(parseString(input, parser), expectedResult);
	}
	{
		const input = "Hello";
		const expectedResult = undefined;
		const parser = optional(literal("World"));
		assert.deepStrictEqual(parseString(input, parser), expectedResult);
	}
	{
		const input = "Hello";
		const expectedResult = "Hello";
		const parser = optional(oneOf(literal("Hello"), literal("Hello")));
		assert.deepStrictEqual(parseString(input, parser), expectedResult);
	}
	{
		const input = "World";
		const expectedResult = "World";
		const parser = oneOf(literal("Hello"), literal("World"));
		assert.deepStrictEqual(parseString(input, parser), expectedResult);
	}
	{
		const input = "World";
		const expectedResult = undefined;
		const parser = oneOf<Parser<string, unknown>[]>();
		assert.deepStrictEqual(parseString(input, parser), expectedResult);
	}
});

test('additional tests', (t) => {
	{
		const input = "_Hello";
		const expectedResult = "Hello";
		const parser = prefix(literal("_"), literal("Hello"));
		assert.deepStrictEqual(parseString(input, parser), expectedResult);
	}
	{
		const input = "Hello_";
		const expectedResult = "Hello";
		const parser = suffix(literal("Hello"), literal("_"));
		assert.deepStrictEqual(parseString(input, parser), expectedResult);
	}
	{
		const input = "_Hello_";
		const expectedResult = "Hello";
		const parser = surround(literal("_"), literal("Hello"), literal("_"));
		assert.deepStrictEqual(parseString(input, parser), expectedResult);
	}
});

test('number tests', (t) => {
	{
		const input = "0";
		const expectedResult = undefined;
		const parser = digitNonZero();
		assert.deepStrictEqual(parseString(input, parser), expectedResult);
	}
	{
		const input = "0";
		const expectedResult = "0";
		const parser = digit();
		assert.deepStrictEqual(parseString(input, parser), expectedResult);
	}
	{
		const input = "123";
		const expectedResult = 123;
		const parser = integer();
		assert.deepStrictEqual(parseString(input, parser), expectedResult);
	}
	{
		const input = "123";
		const expectedResult = 123;
		const parser = integer(false);
		assert.deepStrictEqual(parseString(input, parser), expectedResult);
	}
	{
		const input = "0123";
		const expectedResult = 123;
		const parser = integer();
		assert.deepStrictEqual(parseString(input, parser), expectedResult);
	}
	{
		const input = "0123";
		const expectedResult = undefined;
		const parser = integer(false);
		assert.deepStrictEqual(parseString(input, parser), expectedResult);
	}
	{
		const input = "1";
		const expectedResult = 1;
		const parser = float();
		assert.deepStrictEqual(parseString(input, parser), expectedResult);
	}
	{
		const input = "1.5";
		const expectedResult = 1.5;
		const parser = float();
		assert.deepStrictEqual(parseString(input, parser), expectedResult);
	}
	{
		const input = "01.5";
		const expectedResult = 1.5;
		const parser = float();
		assert.deepStrictEqual(parseString(input, parser), expectedResult);
	}
	{
		const input = "01.5";
		const expectedResult = undefined;
		const parser = float({ allowLeadingZero: false });
		assert.deepStrictEqual(parseString(input, parser), expectedResult);
	}
	{
		const input = "3,14";
		const expectedResult = 3.14;
		const parser = float({ decimalSeparator: "," });
		assert.deepStrictEqual(parseString(input, parser), expectedResult);
	}
});

test('combined tests', (t) => {
	{
		const input = "HelloHelloWorld";
		const expectedResult = [["Hello", "Hello"], "World"];
		const parser = chain(repeat(literal("Hello")), literal("World"));
		assert.deepStrictEqual(parseString(input, parser), expectedResult);
	}
	{
		const input = "HelloWorld";
		const expectedResult = ["Hello", "World"];
		const parser = chain(optional(literal("Hello")), literal("World"));
		assert.deepStrictEqual(parseString(input, parser), expectedResult);
	}
	{
		const input = "World";
		const expectedResult = [undefined, "World"];
		const parser = chain(optional(literal("Hello")), literal("World"));
		assert.deepStrictEqual(parseString(input, parser), expectedResult);
	}
	{
		const input = "ABCD";
		const expectedResult = ["A", "B", "C", "D"];
		const parser = optional(repeatAtLeastOnce(oneCharOf("ABCD")));
		assert.deepStrictEqual(parseString(input, parser), expectedResult);
	}
	{
		const input = "ABCD";
		const expectedResult = ["A", "B", "C", "D"];
		const parser = oneOf(repeatAtLeastOnce(oneCharOf("ABCD")), repeat(oneCharOf("DEF")));
		assert.deepStrictEqual(parseString(input, parser), expectedResult);
	}
	{
		const input = "abbb";
		const expectedResult = ["a", ["b", "b", "b"]];
		const parser = chain(literal("a"), repeatAtLeastOnce(literal("b")));
		assert.deepStrictEqual(parseString(input, parser), expectedResult);
	}
	{
		const input = "Hello";
		const expectedResult = ["H", "e", "l", "l", "o"];
		const parser = repeatAtLeastOnce(oneChar());
		assert.deepStrictEqual(parseString(input, parser), expectedResult);
	}
	{
		const input = "Hello";
		const expectedResult = "Hello";
		const parser = inputString(repeatAtLeastOnce(oneChar()));
		assert.deepStrictEqual(parseString(input, parser), expectedResult);
	}
	{
		const input = "Hello";
		const expectedResult = undefined;
		const parser = inputString(literal("World"));
		assert.deepStrictEqual(parseString(input, parser), expectedResult);
	}
	{
		const input = "abcd";
		const expectedResult = [["a", "b", "c"], "d"];
		const parser = chain(repeatAtLeastOnce(oneCharOf("abc")), oneCharExcept("abc"));
		assert.deepStrictEqual(parseString(input, parser), expectedResult);
	}
	{
		const input = "abcd";
		const expectedResult = [["a", "b", "c"], "d"];
		const parser = chain(repeatAtLeastOnce(oneCharExcept("d")), oneCharOf("d"));
		assert.deepStrictEqual(parseString(input, parser), expectedResult);
	}
});
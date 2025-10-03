import { test } from "node:test";
import assert from "node:assert";

import { oneChar, literal, oneCharOf, chain, optional, repeat, prefix, suffix, surround, oneOf, integer, Parser, digitNonZero, digit, pattern, patterns, inputString, float, oneCharExcept, repeatAtLeastOnce, parseStringUnique, parseStringAll, separatedBy, parseString, whitespaces, mapConst, recursive } from "./index.js";


test("simple tests", () => {
	{
		const input = "a";
		const expectedResult = "a";
		const parser = oneChar();
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
	{
		const input = "";
		const expectedResult = undefined;
		const parser = oneChar();
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
	{
		const input = "a";
		const expectedResult = "a";
		const parser = oneCharOf("abc");
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
	{
		const input = "a";
		const expectedResult = undefined;
		const parser = oneCharOf("");
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
	{
		const input = "b";
		const expectedResult = "b";
		const parser = oneCharExcept("a");
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
	{
		const input = "a";
		const expectedResult = undefined;
		const parser = oneCharExcept("a");
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
	{
		const input = "";
		const expectedResult = undefined;
		const parser = oneCharExcept("a");
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
	{
		const input = "a";
		const expectedResult = "a";
		const parser = oneCharExcept("");
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
	{
		const input = "Hello";
		const expectedResult = "Hello";
		const parser = literal("Hello");
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
	{
		const input = "";
		const expectedResult = "";
		const parser = literal("");
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
});

test("chain tests", () => {
	{
		const input = "Hello";
		const expectedResult = ["Hello"];
		const parser = chain(literal("Hello"));
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
	{
		const input = "HelloWorld";
		const expectedResult = ["Hello", "World"];
		const parser = chain(literal("Hello"), literal("World"));
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
	{
		const input = "HelloBla";
		const expectedResult = undefined;
		const parser = chain(literal("Hello"), literal("World"));
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
	{
		const input = "Bla";
		const expectedResult = undefined;
		const parser = chain(literal("Hello"), literal("World"));
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
	{
		const input = "HelloWorld";
		const expectedResult = undefined;
		const parser = chain<Parser<string, unknown>[]>();
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
	{
		const input = "Hello42World";
		const expectedResult = 42;
		const parser = pattern`Hello${integer()}World`;
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
	{
		const input = "Hello42";
		const expectedResult = 42;
		const parser = pattern`Hello${integer()}`;
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
	{
		const input = "42World";
		const expectedResult = 42;
		const parser = pattern`${integer()}World`;
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
	{
		const input = "a21b42c";
		const expectedResult = [21, 42];
		const parser = patterns`a${integer()}b${integer()}c`;
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
	{
		const input = "a21b42";
		const expectedResult = [21, 42];
		const parser = patterns`a${integer()}b${integer()}`;
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
	{
		const input = "21b42c";
		const expectedResult = [21, 42];
		const parser = patterns`${integer()}b${integer()}c`;
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
	{
		const input = "21b42";
		const expectedResult = [21, 42];
		const parser = patterns`${integer()}b${integer()}`;
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
	{
		const input = "21";
		const expectedResult = [21];
		const parser = patterns`${integer()}`;
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
	{
		const input = "";
		const expectedResult: unknown[] = [];
		const parser = patterns``;
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
});

test("repeat tests", () => {
	{
		const input = "";
		const expectedResult: string[] = [];
		const parser = repeat(literal("Hello"));
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
	{
		const input = "";
		const expectedResult = undefined;
		const parser = repeatAtLeastOnce(literal("Hello"));
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
	{
		const input = "HelloHello";
		const expectedResult = ["Hello", "Hello"];
		const parser = repeat(literal("Hello"));
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
	{
		const input = "a,a,a";
		const expectedResult = ["a", "a", "a"];
		const parser = separatedBy(literal("a"), literal(","), { allowTrailingSeparator: false });
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
	{
		const input = "a,a,a,";
		const expectedResult = ["a", "a", "a"];
		const parser = separatedBy(literal("a"), literal(","), { allowTrailingSeparator: true });
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
	{
		const input = "a,a,a,";
		const expectedResult = undefined;
		const parser = separatedBy(literal("a"), literal(","), { allowTrailingSeparator: false });
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
	{
		const input = "";
		const expectedResult: undefined[] = [];
		const parser = separatedBy(literal("a"), literal(","), { allowTrailingSeparator: false });
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
	{
		const input = ",";
		const expectedResult = undefined;
		const parser = separatedBy(literal("a"), literal(","), { allowTrailingSeparator: true });
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
});

test("choice tests", () => {
	{
		const input = "";
		const expectedResult = undefined;
		const parser = optional(literal("Hello"));
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
	{
		const input = "Hello";
		const expectedResult = "Hello";
		const parser = optional(literal("Hello"));
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
	{
		const input = "Hello";
		const expectedResult = undefined;
		const parser = optional(literal("World"));
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
	{
		const input = "Hello";
		const expectedResult = ["Hello", "Hello"];
		const parser = optional(oneOf(literal("Hello"), literal("Hello")));
		assert.deepStrictEqual(parseStringAll(input, parser), expectedResult);
	}
	{
		const input = "World";
		const expectedResult = "World";
		const parser = oneOf(literal("Hello"), literal("World"));
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
	{
		const input = "World";
		const expectedResult = undefined;
		const parser = oneOf<Parser<string, unknown>[]>();
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
});

test("greed tests", () => {
	{
		const input = "aaa";
		const expectedResult = [["a", "a", "a"], []];
		const parser = chain(repeat(literal("a"), { greedy: true }), repeat(literal("a"), { greedy: true }));
		assert.deepStrictEqual(parseString(input, parser), expectedResult);
	}
	{
		const input = "aaa";
		const expectedResult = [[], ["a", "a", "a"]];
		const parser = chain(repeat(literal("a"), { greedy: false }), repeat(literal("a"), { greedy: false }));
		assert.deepStrictEqual(parseString(input, parser), expectedResult);
	}
	{
		const input = "aaa";
		const expectedResult = [[], ["a", "a", "a"]];
		const parser = chain(repeat(literal("a"), { greedy: false }), repeat(literal("a"), { greedy: true }));
		assert.deepStrictEqual(parseString(input, parser), expectedResult);
	}
});

test("utils tests", () => {
	{
		const input = " 	42";
		const expectedResult = 42;
		const parser = prefix(whitespaces(), integer());
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
	{
		const input = " 	42  ";
		const expectedResult = 42;
		const parser = surround(whitespaces(), integer(), whitespaces());
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
	{
		const input = "Hello";
		const expectedResult = 42;
		const parser = mapConst(literal("Hello"), 42);
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
	{
		const input = "[[[Hello]]]";
		const expectedResult = "Hello";
		const parser: Parser<string, string> = oneOf(
			literal("Hello"),
			surround(literal("["), recursive(() => parser), literal("]")),
		);
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
});

test("additional tests", () => {
	{
		const input = "_Hello";
		const expectedResult = "Hello";
		const parser = prefix(literal("_"), literal("Hello"));
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
	{
		const input = "Hello_";
		const expectedResult = "Hello";
		const parser = suffix(literal("Hello"), literal("_"));
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
	{
		const input = "_Hello_";
		const expectedResult = "Hello";
		const parser = surround(literal("_"), literal("Hello"), literal("_"));
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
	{
		const input = "Hello";
		const expectedResult = undefined;
		const parser = oneOf() as Parser<string, string>;
		assert.deepStrictEqual(parseString(input, parser), expectedResult);
	}
	{
		const input = "Hello";
		const expectedResult = undefined;
		const parser = oneOf(
			literal("Hello"),
			literal("Hello"),
		);
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
});

test("number tests", () => {
	{
		const input = "0";
		const expectedResult = undefined;
		const parser = digitNonZero();
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
	{
		const input = "0";
		const expectedResult = "0";
		const parser = digit();
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
	{
		const input = "123";
		const expectedResult = 123;
		const parser = integer();
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
	{
		const input = "123";
		const expectedResult = 123;
		const parser = integer(false);
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
	{
		const input = "0123";
		const expectedResult = 123;
		const parser = integer();
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
	{
		const input = "0123";
		const expectedResult = undefined;
		const parser = integer(false);
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
	{
		const input = "1";
		const expectedResult = 1;
		const parser = float();
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
	{
		const input = "1.5";
		const expectedResult = 1.5;
		const parser = float();
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
	{
		const input = "01.5";
		const expectedResult = 1.5;
		const parser = float();
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
	{
		const input = "01.5";
		const expectedResult = undefined;
		const parser = float({ allowLeadingZero: false });
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
	{
		const input = "3,14";
		const expectedResult = 3.14;
		const parser = float({ decimalSeparator: "," });
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
});

test("combined tests", () => {
	{
		const input = "HelloHelloWorld";
		const expectedResult = [["Hello", "Hello"], "World"];
		const parser = chain(repeat(literal("Hello")), literal("World"));
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
	{
		const input = "HelloWorld";
		const expectedResult = ["Hello", "World"];
		const parser = chain(optional(literal("Hello")), literal("World"));
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
	{
		const input = "World";
		const expectedResult = [undefined, "World"];
		const parser = chain(optional(literal("Hello")), literal("World"));
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
	{
		const input = "ABCD";
		const expectedResult = ["A", "B", "C", "D"];
		const parser = optional(repeatAtLeastOnce(oneCharOf("ABCD")));
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
	{
		const input = "ABCD";
		const expectedResult = ["A", "B", "C", "D"];
		const parser = oneOf(repeatAtLeastOnce(oneCharOf("ABCD")), repeat(oneCharOf("DEF")));
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
	{
		const input = "abbb";
		const expectedResult = ["a", ["b", "b", "b"]];
		const parser = chain(literal("a"), repeatAtLeastOnce(literal("b")));
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
	{
		const input = "Hello";
		const expectedResult = ["H", "e", "l", "l", "o"];
		const parser = repeatAtLeastOnce(oneChar());
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
	{
		const input = "Hello";
		const expectedResult = "Hello";
		const parser = inputString(repeatAtLeastOnce(oneChar()));
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
	{
		const input = "Hello";
		const expectedResult = undefined;
		const parser = inputString(literal("World"));
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
	{
		const input = "abcd";
		const expectedResult = [["a", "b", "c"], "d"];
		const parser = chain(repeatAtLeastOnce(oneCharOf("abc")), oneCharExcept("abc"));
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
	{
		const input = "abcd";
		const expectedResult = [["a", "b", "c"], "d"];
		const parser = chain(repeatAtLeastOnce(oneCharExcept("d")), oneCharOf("d"));
		assert.deepStrictEqual(parseStringUnique(input, parser), expectedResult);
	}
});
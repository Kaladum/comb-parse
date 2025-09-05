import { test } from "node:test";
import assert from "node:assert";

import { literal, parseString } from "./index";
import { chain, optional, repeat, prefix, suffix, surround, oneOf } from "./combiner";


test('literal tests', (t) => {
	{
		const input = "Hello";
		const expectedResult = "Hello";
		const parser = literal("Hello");
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
});

test('repeat tests', (t) => {
	{
		const input = "";
		const expectedResult: string[] = [];
		const parser = repeat(literal("Hello"));
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
		const input = "World";
		const expectedResult = "World";
		const parser = oneOf(literal("Hello"), literal("World"));
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
});
import test from "node:test";
import assert from "node:assert";
import { Parser, parseString } from "./base.js";
import { oneOf } from "./combiner/choice.js";
import { float } from "./number.js";
import { map, mapConst, recursive, whitespaces } from "./utils.js";
import { literal, oneCharExcept } from "./simple.js";
import { suffix, surround } from "./combiner/additional.js";
import { chain, repeat, separatedBy } from "./combiner/multi.js";

type SimpleJsonValue = string | number | boolean | null;
type JsonArray = JsonValue[];
//The interface style is required to allow recursion
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface JsonObject extends Record<string, JsonValue> { }
type JsonValue = SimpleJsonValue | JsonArray | JsonObject;

function jsonNumber(): Parser<string, number> {
	//TODO Allow exponents
	return float({ allowLeadingZero: false });
}

function jsonString(): Parser<string, string> {
	const stringContent = oneOf(
		oneCharExcept("\\\""),
		mapConst(literal("\\\""), "\""),
		mapConst(literal("\\\\"), "\\"),
		mapConst(literal("\\/"), "/"),
		mapConst(literal("\\b"), "\b"),
		mapConst(literal("\\f"), "\f"),
		mapConst(literal("\\n"), "\n"),
		mapConst(literal("\\r"), "\r"),
		mapConst(literal("\\t"), "\t"),
		//TODO Add 4HEX Digit Escape
	);

	return surround(
		literal("\""),
		map(repeat(stringContent), v => v.join("")),
		literal("\""),
	);
}

function jsonArray(): Parser<string, JsonArray> {
	return surround(
		literal("["),
		suffix(separatedBy(recursive(() => jsonValue()), literal(","), { allowTrailingSeparator: true }), whitespaces()),
		literal("]"),
	);
}

function jsonObject(): Parser<string, JsonObject> {
	const keyValuePairParser = map(
		chain(whitespaces(), jsonString(), whitespaces(), literal(":"), recursive(() => jsonValue())),
		([, key, , , value]) => [key, value] as const,
	);
	const jsonObjectContent = map(
		separatedBy(keyValuePairParser, literal(","), { allowTrailingSeparator: true }),
		v => Object.fromEntries(v),
	);
	return surround(
		literal("{"),
		oneOf(
			jsonObjectContent,
			map(whitespaces(), () => ({})),
		),
		literal("}"),
	);
}

export function jsonValue(): Parser<string, JsonValue> {
	return surround(whitespaces(), oneOf(
		mapConst(literal("true"), true),
		mapConst(literal("false"), false),
		mapConst(literal("null"), null),
		jsonString(),
		jsonArray(),
		jsonObject(),
		jsonNumber(),
	), whitespaces());
}


test("json tests", () => {
	{
		const input = "42";
		const expectedResult = 42;
		assert.deepStrictEqual(parseString(input, jsonValue()), expectedResult);
	}
	{
		const input = " 42";
		const expectedResult = 42;
		assert.deepStrictEqual(parseString(input, jsonValue()), expectedResult);
	}
	{
		const input = "\"Hello\"";
		const expectedResult = "Hello";
		assert.deepStrictEqual(parseString(input, jsonValue()), expectedResult);
	}
	{
		const input = "\"Hello\\tWorld\"";
		const expectedResult = "Hello\tWorld";
		assert.deepStrictEqual(parseString(input, jsonValue()), expectedResult);
	}
	{
		const input = "[]";
		const expectedResult: undefined[] = [];
		assert.deepStrictEqual(parseString(input, jsonValue()), expectedResult);
	}
	{
		const input = "[\t]";
		const expectedResult: undefined[] = [];
		assert.deepStrictEqual(parseString(input, jsonValue()), expectedResult);
	}
	{
		const input = "[42]";
		const expectedResult = [42];
		assert.deepStrictEqual(parseString(input, jsonValue()), expectedResult);
	}
	{
		const input = "[ 42 ]";
		const expectedResult = [42];
		assert.deepStrictEqual(parseString(input, jsonValue()), expectedResult);
	}
	{
		const input = "[42,]";
		const expectedResult = [42];
		assert.deepStrictEqual(parseString(input, jsonValue()), expectedResult);
	}
	{
		const input = "[ 42 , ]";
		const expectedResult = [42];
		assert.deepStrictEqual(parseString(input, jsonValue()), expectedResult);
	}
	{
		const input = "[ 42 ,false ]";
		const expectedResult = [42, false];
		assert.deepStrictEqual(parseString(input, jsonValue()), expectedResult);
	}
});
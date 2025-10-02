import { Parser } from "./base.js";
import { repeat } from "./combiner/multi.js";
import { oneCharOf } from "./simple.js";

/**
 * Transforms the result of a parser using a callback function.
 * @param parser The parser whose result will be transformed.
 * @param callback Function to transform the parser's result.
 * @returns A parser yielding the transformed result.
 */
export function map<TInput, TIntermediate, TOutput>(parser: Parser<TInput, TIntermediate>, callback: (input: TIntermediate) => TOutput): Parser<TInput, TOutput> {
	return function* (input) {
		for (const [value, state] of parser(input)) {
			yield [callback(value), state];
		}
	};
}

/**
 * Maps the result of a parser to a constant value.
 * @param parser The parser to run.
 * @param value The constant value to yield.
 * @returns A parser yielding the constant value.
 */
export function mapConst<TInput, TOutput>(parser: Parser<TInput, unknown>, value: TOutput): Parser<TInput, TOutput> {
	return function* (input) {
		for (const [_, state] of parser(input)) {
			yield [value, state];
		}
	};
}

/**
 * Yields the substring of the input that was consumed by the given parser.
 * @param parser The parser to run.
 * @returns A parser yielding the consumed substring.
 */
export function inputString(parser: Parser<string, unknown>): Parser<string, string> {
	return function* (input) {
		for (const [_, state] of parser(input)) {
			yield [input.data.substring(input.position, state.position), state];
		}
	};
}

/**
 * Allows for recursive parser definitions by deferring parser creation.
 * @param parserProvider Function that returns a parser.
 * @returns A parser that delegates to the provided parser.
 */
export function recursive<TInput, TOutput>(parserProvider: () => Parser<TInput, TOutput>): Parser<TInput, TOutput> {
	return function* (input) {
		const parser = parserProvider();
		for (const value of parser(input)) {
			yield value;
		}
	};
}

/**
 * Parser that matches a single whitespace character (space, tab, carriage return, or newline).
 * @returns A parser yielding a single whitespace character.
 */
export function whitespace() {
	return oneCharOf(" \t\r\n");
}

/**
 * Parser that matches zero or more whitespace characters.
 * @returns A parser yielding an array of whitespace characters.
 */
export function whitespaces() {
	return repeat(whitespace());
} 
import { Parser } from "./base.js";
import { repeat } from "./combiner/multi.js";
import { oneCharOf } from "./simple.js";

export function map<TInput, TIntermediate, TOutput>(parser: Parser<TInput, TIntermediate>, callback: (input: TIntermediate) => TOutput): Parser<TInput, TOutput> {
	return function* (input) {
		for (const [value, state] of parser(input)) {
			yield [callback(value), state];
		}
	};
}

export function mapConst<TInput, TOutput>(parser: Parser<TInput, unknown>, value: TOutput): Parser<TInput, TOutput> {
	return function* (input) {
		for (const [_, state] of parser(input)) {
			yield [value, state];
		}
	};
}

export function inputString(parser: Parser<string, unknown>): Parser<string, string> {
	return function* (input) {
		for (const [_, state] of parser(input)) {
			yield [input.data.substring(input.position, state.position), state];
		}
	};
}

export function recursive<TInput, TOutput>(parserProvider: () => Parser<TInput, TOutput>): Parser<TInput, TOutput> {
	return function* (input) {
		const parser = parserProvider();
		for (const value of parser(input)) {
			yield value;
		}
	};
}

export function whitespace() {
	return oneCharOf(" \t\r\n");
}

export function whitespaces() {
	return repeat(whitespace());
} 
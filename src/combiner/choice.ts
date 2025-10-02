import { Parser } from "../base.js";

/**
 * Creates a parser that matches the given parser optionally.
 * @param parser The parser to make optional.
 * @returns A parser yielding the result or undefined.
 */
export function optional<TInput, TOutput>(parser: Parser<TInput, TOutput>): Parser<TInput, TOutput | undefined> {
	return function* (input) {
		for (const parsed of parser(input)) {
			yield parsed;
		}
		yield [undefined, input];
	};
}

type ResultByParsers<TParsers> = TParsers extends Parser<infer TInput, infer TOutput>[] ? TOutput : never;
type InputByParsers<TParsers> = TParsers extends Parser<infer TInput, infer TOutput>[] ? TInput : never;

/**
 * Creates a parser that tries each parser in order and yields results from any that match.
 * @param parsers Array of parsers to try.
 * @returns A parser yielding results all matching parsers.
 */
export function oneOf<TParsers extends Parser<any, unknown>[]>(...parsers: TParsers): Parser<InputByParsers<TParsers>, ResultByParsers<TParsers>> {
	return function* (input) {
		for (const parser of parsers) {
			for (const [value, newState] of parser(input)) {
				yield [value as ResultByParsers<TParsers>, newState];
			}
		}
	};
}
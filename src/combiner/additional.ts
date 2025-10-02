import { Parser } from "../base.js";
import { chain } from "./multi.js";
import { map } from "../utils.js";

/**
 * Creates a parser that matches a prefix followed by the main parser, returning only the main parser's result.
 * @param prefix Parser to match before the main parser.
 * @param parser Main parser whose result is returned.
 * @returns A parser yielding the result of the main parser.
 */
export function prefix<TInput, TOutput>(prefix: Parser<TInput, unknown>, parser: Parser<TInput, TOutput>): Parser<TInput, TOutput> {
	return map(chain(prefix, parser), ([_, value]) => value);
}

/**
 * Creates a parser that matches the main parser followed by a suffix, returning only the main parser's result.
 * @param parser Main parser whose result is returned.
 * @param suffix Parser to match after the main parser.
 * @returns A parser yielding the result of the main parser.
 */
export function suffix<TInput, TOutput>(parser: Parser<TInput, TOutput>, suffix: Parser<TInput, unknown>): Parser<TInput, TOutput> {
	return map(chain(parser, suffix), ([value, _]) => value);
}

/**
 * Creates a parser that matches a prefix, the main parser, and a suffix, returning only the main parser's result.
 * @param prefix Parser to match before the main parser.
 * @param parser Main parser whose result is returned.
 * @param suffix Parser to match after the main parser.
 * @returns A parser yielding the result of the main parser.
 */
export function surround<TInput, TOutput>(prefix: Parser<TInput, unknown>, parser: Parser<TInput, TOutput>, suffix: Parser<TInput, unknown>): Parser<TInput, TOutput> {
	return map(chain(prefix, parser, suffix), ([_prefix, value, _suffix]) => value);
}
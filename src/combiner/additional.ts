import { Parser } from "../base.js";
import { chain } from "./multi.js";
import { map } from "../utils.js";

export function prefix<TInput, TOutput>(prefix: Parser<TInput, unknown>, parser: Parser<TInput, TOutput>): Parser<TInput, TOutput> {
	return map(chain(prefix, parser), ([_, value]) => value);
}

export function suffix<TInput, TOutput>(parser: Parser<TInput, TOutput>, suffix: Parser<TInput, unknown>): Parser<TInput, TOutput> {
	return map(chain(parser, suffix), ([value, _]) => value);
}

export function surround<TInput, TOutput>(prefix: Parser<TInput, unknown>, parser: Parser<TInput, TOutput>, suffix: Parser<TInput, unknown>): Parser<TInput, TOutput> {
	return map(chain(prefix, parser, suffix), ([_prefix, value, _suffix]) => value);
}
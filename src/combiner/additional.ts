import { Parser } from "../base";
import { chain } from "./multi";
import { map } from "./utils";

export const prefix = <TInput, TOutput>(prefix: Parser<TInput, unknown>, parser: Parser<TInput, TOutput>): Parser<TInput, TOutput> => {
	return map(chain(prefix, parser), ([_, value]) => value);
}

export const suffix = <TInput, TOutput>(parser: Parser<TInput, TOutput>, suffix: Parser<TInput, unknown>): Parser<TInput, TOutput> => {
	return map(chain(parser, suffix), ([value, _]) => value);
}

export const surround = <TInput, TOutput>(prefix: Parser<TInput, unknown>, parser: Parser<TInput, TOutput>, suffix: Parser<TInput, unknown>): Parser<TInput, TOutput> => {
	return map(chain(prefix, parser, suffix), ([_prefix, value, _suffix]) => value);
}
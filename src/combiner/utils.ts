import { Parser } from "../base.js";

export function map<TInput, TIntermediate, TOutput>(parser: Parser<TInput, TIntermediate>, callback: (input: TIntermediate) => TOutput): Parser<TInput, TOutput> {
	return function* (input) {
		for (const [value, state] of parser(input)) {
			yield [callback(value), state];
		}
	}
}
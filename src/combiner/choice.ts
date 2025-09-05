import { Parser } from "../base";

export const optional = <TInput, TOutput>(parser: Parser<TInput, TOutput>): Parser<TInput, TOutput | undefined> => {
	return function* (input) {
		for (const parsed of parser(input)) {
			yield parsed;
		}
		yield [undefined, input];
	}
}

type ResultByParsers<TParsers> = TParsers extends Parser<infer TInput, infer TOutput>[] ? TOutput : never;
type InputByParsers<TParsers> = TParsers extends Parser<infer TInput, infer TOutput>[] ? TInput : never;

export const oneOf = <TParsers extends Parser<any, unknown>[]>(...parsers: TParsers): Parser<InputByParsers<TParsers>, ResultByParsers<TParsers>> => {
	if (parsers.length === 0) {
		throw new Error("There must be at lease one parser provided");
	}

	return function* (input) {
		for (const parser of parsers) {
			for (const [value, newState] of parser(input)) {
				yield [value as ResultByParsers<TParsers>, newState];
			}
		}
	};
}
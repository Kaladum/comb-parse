import { Parser, ParserResult, ParseState } from "../base.js";

type ResultByParsers<TParsers> = {
	[key in keyof TParsers]: ParserResult<TParsers[key]>
};

type InputByParsers<TParsers> = TParsers extends Parser<infer TInput, infer TOutput>[] ? TInput : never;

export function chain<TParsers extends Parser<any, unknown>[]>(...parsers: TParsers): Parser<InputByParsers<TParsers>, ResultByParsers<TParsers>> {
	return function* (input) {
		if (parsers.length === 0) {
			yield [[] as ResultByParsers<TParsers>, input];
		} else {
			const [firstParser, ...otherParsers] = parsers;
			for (const [value, newState] of firstParser(input)) {
				for (const [value2, newState2] of chain(...otherParsers)(newState)) {
					yield [[value, ...value2] as ResultByParsers<TParsers>, newState2];
				}
			}
		}
	};
}

export function repeat<TInput, TOutput>(parser: Parser<TInput, TOutput>): Parser<TInput, TOutput[]> {
	return function* (input) {
		const tasks: [TOutput[], ParseState<TInput>][] = [[[], input]];

		while (tasks.length > 0) {
			const [valueSoFar, stateSoFar] = tasks.shift()!;
			yield [valueSoFar, stateSoFar];

			for (const [value, newState] of parser(stateSoFar)) {
				tasks.push([[...valueSoFar, value], newState]);
			}
		}
	}
}
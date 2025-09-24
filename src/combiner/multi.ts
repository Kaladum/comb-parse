import { Parser, ParserResult, ParseState } from "../base.js";
import { empty, literal } from "../simple.js";
import { prefix, suffix } from "./additional.js";
import { map } from "../utils.js";
import { oneOf, optional } from "./choice.js";

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

export function pattern<TOutput>(strings: TemplateStringsArray, parser: Parser<string, TOutput>): Parser<string, TOutput> {
	return map(
		chain(literal(strings[0]), parser, literal(strings[1])),
		([_pre, value, _post]) => value
	);
}

export function patterns<TParsers extends Parser<string, unknown>[]>(strings: TemplateStringsArray, ...parsers: TParsers): Parser<string, ResultByParsers<TParsers>> {
	return suffix(chain(
		...parsers.map((p, i) => prefix(literal(strings[i]), p))
	), literal(strings.at(-1)!)) as Parser<string, ResultByParsers<TParsers>>;
}

export function repeat<TInput, TOutput>(parser: Parser<TInput, TOutput>, minRepeat: number = 0): Parser<TInput, TOutput[]> {
	return function* (input) {
		const tasks: [TOutput[], ParseState<TInput>][] = [[[], input]];

		while (tasks.length > 0) {
			const [valueSoFar, stateSoFar] = tasks.shift()!;
			if (valueSoFar.length >= minRepeat) {
				yield [valueSoFar, stateSoFar];
			}

			for (const [value, newState] of parser(stateSoFar)) {
				tasks.push([[...valueSoFar, value], newState]);
			}
		}
	};
}

export function separatedBy<TInput, TOutput>(parser: Parser<TInput, TOutput>, separator: Parser<TInput, unknown>, { allowTrailingSeparator = false } = {}): Parser<TInput, TOutput[]> {
	if (allowTrailingSeparator) {
		return oneOf(
			map(
				chain(
					parser,
					repeat(prefix(separator, parser)),
					optional(separator),
				),
				([firstValue, moreValues]) => [firstValue, ...moreValues]
			),
			map(parser, v => [v]),
			map(empty<TInput>(), () => [] as TOutput[]),
		);
	} else {
		return oneOf(
			map(
				chain(
					parser,
					repeat(prefix(separator, parser))
				),
				([firstValue, moreValues]) => [firstValue, ...moreValues]
			),
			map(parser, v => [v]),
			map(empty<TInput>(), () => [] as TOutput[]),
		);
	}
}

export function repeatAtLeastOnce<TInput, TOutput>(parser: Parser<TInput, TOutput>): Parser<TInput, TOutput[]> {
	return repeat(parser, 1);
}
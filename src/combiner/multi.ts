import { InvalidParserError, Parser, ParserResult, ParseState } from "../base.js";
import { empty, literal } from "../simple.js";
import { prefix, suffix } from "./additional.js";
import { map, mapConst } from "../utils.js";
import { oneOf, optional } from "./choice.js";

type ResultByParsers<TParsers> = {
	[key in keyof TParsers]: ParserResult<TParsers[key]>
};

type InputByParsers<TParsers> = TParsers extends Parser<infer TInput, infer _TOutput>[] ? TInput : never;

/**
 * Creates a parser that runs multiple parsers in sequence, yielding an array of their results.
 * @param parsers The parsers to run in sequence.
 * @returns A parser yielding an array of results.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

/**
 * Creates a parser that uses a string with a placeholder to parse a text and return the parsing result of the placeholder.
 * @param strings Template string.
 * @param parser Parser to match the placeholder.
 * @returns A parser yielding the placeholder parse results.
 */
export function pattern<TOutput>(strings: TemplateStringsArray, parser: Parser<string, TOutput>): Parser<string, TOutput> {
	return map(
		chain(literal(strings[0]), parser, literal(strings[1])),
		([_pre, value, _post]) => value,
	);
}

/**
 * Creates a parser that uses a string with multiple placeholders to parse a text and return the parsing results of the placeholder.
 * @param strings Template string.
 * @param parsers Parsers to match the placeholders.
 * @returns A parser yielding an array of results from the inner parsers.
 */
export function patterns<TParsers extends Parser<string, unknown>[]>(strings: TemplateStringsArray, ...parsers: TParsers): Parser<string, ResultByParsers<TParsers>> {
	return suffix(chain(
		...parsers.map((p, i) => prefix(literal(strings[i]), p)),
	), literal(strings.at(-1)!)) as Parser<string, ResultByParsers<TParsers>>;
}

/**
 * Creates a parser that matches a parser zero or more times.
 * @param parser The parser to repeat.
 * @param options Options for minRepeat, maxRepeat, and greedy (longest match first).
 * @returns A parser yielding arrays of results.
 */
export function repeat<TInput, TOutput>(parser: Parser<TInput, TOutput>, { minRepeat = 0, maxRepeat = Infinity, greedy = true } = {}): Parser<TInput, TOutput[]> {
	if (greedy) {
		return repeatGreedy(parser, { minRepeat, maxRepeat });
	} else {
		return repeatNonGreedy<TInput, TOutput>(parser, { minRepeat, maxRepeat });
	}
}

function repeatGreedy<TInput, TOutput>(parser: Parser<TInput, TOutput>, { minRepeat = 0, maxRepeat = Infinity } = {}): Parser<TInput, TOutput[]> {
	const safeParser = validateNonInfiniteLoop(parser);
	return function* (input) {
		const tasks: [TOutput[], ParseState<TInput>, Iterator<[TOutput, ParseState<TInput>]>][] = [[[], input, parser(input)[Symbol.iterator]()]];

		while (tasks.length > 0) {
			const [valueSoFar, stateSoFar, childIterator] = tasks.pop()!;

			if (valueSoFar.length < maxRepeat) {
				const { value: childValue, done } = childIterator.next();

				if (done) {
					if (valueSoFar.length >= minRepeat) {
						yield [valueSoFar, stateSoFar];
					}
				} else {
					const [newValue, newState] = childValue;
					tasks.push([[...valueSoFar, newValue], newState, safeParser(newState)[Symbol.iterator]()]);
				}
			} else {
				yield [valueSoFar, stateSoFar];
			}
		}
	};
}

function repeatNonGreedy<TInput, TOutput>(parser: Parser<TInput, TOutput>, { minRepeat = 0, maxRepeat = 0 } = {}): Parser<TInput, TOutput[]> {
	const safeParser = validateNonInfiniteLoop(parser);
	return function* (input) {
		const tasks: [TOutput[], ParseState<TInput>][] = [[[], input]];

		while (tasks.length > 0) {
			const [valueSoFar, stateSoFar] = tasks.shift()!;
			if (valueSoFar.length >= minRepeat) {
				yield [valueSoFar, stateSoFar];
			}

			if (valueSoFar.length < maxRepeat) {
				for (const [value, newState] of safeParser(stateSoFar)) {
					tasks.push([[...valueSoFar, value], newState]);
				}
			}
		}
	};
}

function validateNonInfiniteLoop<TInput, TOutput>(parser: Parser<TInput, TOutput>): Parser<TInput, TOutput> {
	return function* (input) {
		for (const [value, newState] of parser(input)) {
			if (newState.position === input.position) {
				throw new InvalidParserError("Infinite loop detected: Parser did not consume any input.");
			}
			yield [value, newState];
		}
	};
}

/**
 * Creates a parser that matches a sequence of values separated by a separator parser.
 * @param parser The parser for values.
 * @param separator The parser for separators.
 * @param options Options for allowing trailing separator and greedy matching.
 * @returns A parser yielding arrays of results.
 */
export function separatedBy<TInput, TOutput>(parser: Parser<TInput, TOutput>, separator: Parser<TInput, unknown>, { allowTrailingSeparator = false, greedy = true } = {}): Parser<TInput, TOutput[]> {
	if (allowTrailingSeparator) {
		return oneOf(
			map(
				chain(
					parser,
					repeat(prefix(separator, parser), { greedy }),
					optional(separator),
				),
				([firstValue, moreValues]) => [firstValue, ...moreValues],
			),
			map(parser, v => [v]),
			mapConst(empty<TInput>(), [] as TOutput[]),
		);
	} else {
		return oneOf(
			map(
				chain(
					parser,
					repeat(prefix(separator, parser), { greedy }),
				),
				([firstValue, moreValues]) => [firstValue, ...moreValues],
			),
			map(parser, v => [v]),
			mapConst(empty<TInput>(), [] as TOutput[]),
		);
	}
}

/**
 * Creates a parser that matches a parser one or more times.
 * @param parser The parser to repeat.
 * @param options Options for greedy and maxRepeat.
 * @returns A parser yielding arrays of results.
 */
export function repeatAtLeastOnce<TInput, TOutput>(parser: Parser<TInput, TOutput>, { greedy = true, maxRepeat = Infinity } = {}): Parser<TInput, TOutput[]> {
	return repeat(parser, { minRepeat: 1, greedy, maxRepeat });
}

/**
 * Creates a parser that applies the given parser exactly count times in sequence.
 * @param parser - The parser to be applied repeatedly.
 * @param count - The exact number of times to apply the parser.
 * @returns A parser that returns an array of results from each successful application of the parser.
 */
export function repeatExactly<TInput, TOutput, TCount extends number>(parser: Parser<TInput, TOutput>, count: TCount): Parser<TInput, TOutput[] & { length: TCount }> {
	return repeat(parser, { minRepeat: count, maxRepeat: count }) as Parser<TInput, TOutput[] & { length: TCount }>;
}
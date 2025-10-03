/**
 * Represents the state of a parser at a given position.
 * @template T The type of data being parsed.
 */
export interface ParseState<T> {
	readonly position: number,
	readonly data: T,
	readonly length: number,
	advance(): [T, ParseState<T>] | undefined,
	isEnd(): boolean,
}

/**
 * ParseState implementation for string input.
 */
export class StringParseState implements ParseState<string> {
	public constructor(
		public readonly data: string,
		public readonly position = 0,
	) { }

	public get length() { return this.data.length; }
	public isEnd() {
		return this.position >= this.length;
	}
	public advance(): [string, ParseState<string>] | undefined {
		if (!this.isEnd()) {
			return [this.data[this.position], new StringParseState(this.data, this.position + 1)];
		} else {
			return undefined;
		}
	}
}

/**
 * A parser function takes the current ParseState as an input and can yields possible parsing results with there resulting states.
 * @template TInput The type of the parsed data.
 * @template TOutput The type of the parse result.
 */
export type Parser<TInput, TOutput> = (input: ParseState<TInput>) => Iterable<[TOutput, ParseState<TInput>]>;

/**
 * Parses a string input using the provided parser and returns the first successfully parse result or undefined.
 * @param input The string to parse.
 * @param parser The parser to use.
 * @returns The parsed result or undefined if parsing fails.
 */
export function parseString<TResult>(input: string, parser: Parser<string, TResult>): TResult | undefined {
	const state = new StringParseState(input);
	for (const [result, newState] of parser(state)) {
		if (newState.isEnd()) {
			return result;
		}
	}
	return undefined;
}

/**
 * Parses a string input and returns all possible parsing results.
 * @param input The string to parse.
 * @param parser The parser to use.
 * @returns An array of all parsed results.
 */
export function parseStringAll<TResult>(input: string, parser: Parser<string, TResult>): TResult[] {
	const state = new StringParseState(input);
	const results: TResult[] = [];
	for (const [result, newState] of parser(state)) {
		if (newState.isEnd()) {
			results.push(result);
		}
	}
	return results;
}

/**
 * Parses a string input and returns the parse result if there is exactly one. In case of no or multiple parse results the function returns undefined..
 * @param input The string to parse.
 * @param parser The parser to use.
 * @returns The unique parsing result or undefined if parsing fails or the parsing is not unique.
 */
export function parseStringUnique<TResult>(input: string, parser: Parser<string, TResult>): TResult | undefined {
	const state = new StringParseState(input);
	let found = false;
	let uniqueResult: TResult | undefined = undefined;
	for (const [result, newState] of parser(state)) {
		if (newState.isEnd()) {
			if (found) {
				return undefined; // not unique
			}
			found = true;
			uniqueResult = result;
		}
	}
	return found ? uniqueResult : undefined;
}

/**
 * Infers the input type of a Parser.
 * @template T The parser type.
 */
export type ParserInput<T> = T extends Parser<infer TInput, infer _TOutput> ? TInput : never;
/**
 * Infers the result type of a Parser.
 * @template T The parser type.
 */
export type ParserResult<T> = T extends Parser<infer _TInput, infer TOutput> ? TOutput : never;
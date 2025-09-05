export interface ParseState<T> {
	peek(): T | undefined;
	advance(): [T, ParseState<T>] | undefined;
	isEnd(): boolean;
}

export class StringParseState implements ParseState<string> {
	public constructor(
		private readonly data: string,
		private readonly position = 0,
	) { }

	public readonly isEnd = () => this.position >= this.data.length;
	public readonly peek = (): string | undefined => this.data[this.position];
	public readonly advance = (): [string, ParseState<string>] | undefined => {
		if (!this.isEnd()) {
			return [this.data[this.position], new StringParseState(this.data, this.position + 1)];
		} else {
			return undefined;
		}
	}
}

export type Parser<TInput, TOutput> = (input: ParseState<TInput>) => Iterable<[TOutput, ParseState<TInput>]>;

export const parseString = <TResult>(input: string, parser: Parser<string, TResult>): TResult | undefined => {
	const state = new StringParseState(input);
	for (const [result, newState] of parser(state)) {
		if (newState.isEnd()) {
			return result;
		}
	}
	return undefined;
}

export type ParserInput<T> = T extends Parser<infer TInput, infer TOutput> ? TInput : never;
export type ParserResult<T> = T extends Parser<infer TInput, infer TOutput> ? TOutput : never;
export interface ParseState<T> {
	readonly position: number;
	readonly data: T;
	readonly length: number;
	advance(): [T, ParseState<T>] | undefined;
	isEnd(): boolean;
}

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

export type Parser<TInput, TOutput> = (input: ParseState<TInput>) => Iterable<[TOutput, ParseState<TInput>]>;

export function parseString<TResult>(input: string, parser: Parser<string, TResult>): TResult | undefined {
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
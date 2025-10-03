import { Parser } from "./base.js";

/**
 * Parser that matches a single character from the input.
 * @returns A parser yielding one character if available.
 */
export function oneChar(): Parser<string, string> {
	return function* (input) {
		const next = input.advance();
		if (next !== undefined) {
			yield next;
		}
	};
}

/**
 * Parser that matches a specific string literal from the input (case sensitive).
 * @param content The string to match.
 * @returns A parser yielding the matched string if successful.
 */
export function literal<TString extends string>(content: TString): Parser<string, TString> {
	return function* (input) {
		let state = input;
		for (const c of content) {
			const next = state.advance();
			if (next === undefined || next[0] !== c) {
				return;
			}
			state = next[1];
		}
		yield [content, state];
	};
}

/**
 * Parser that matches a single character from a set of valid characters.
 * @param allValidChars String containing all valid characters.
 * @returns A parser yielding the matched character if valid.
 */
export function oneCharOf(allValidChars: string): Parser<string, string> {
	return function* (input) {
		const next = input.advance();
		if (next !== undefined && allValidChars.indexOf(next[0]) >= 0) {
			yield next;
		}
	};
};

/**
 * Parser that matches a single character except those in the invalid set.
 * @param allInvalidChars String containing all invalid characters.
 * @returns A parser yielding the matched character if not invalid.
 */
export function oneCharExcept(allInvalidChars: string): Parser<string, string> {
	return function* (input) {
		const next = input.advance();
		if (next !== undefined && allInvalidChars.indexOf(next[0]) < 0) {
			yield next;
		}
	};
};

/**
 * Parser that always matches without consuming any input.
 * @returns A parser yielding undefined and the current state.
 */
export function empty<TInput>(): Parser<TInput, undefined> {
	return function* (input) {
		yield [undefined, input];
	};
}
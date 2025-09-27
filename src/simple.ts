import { Parser } from "./base.js";

export function oneChar(): Parser<string, string> {
	return function* (input) {
		let state = input;
		const next = state.advance();
		if (next !== undefined) {
			yield next;
		}
	};
}

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

export function oneCharOf(allValidChars: string): Parser<string, string> {
	return function* (input) {
		let state = input;
		const next = state.advance();
		if (next !== undefined && allValidChars.indexOf(next[0]) >= 0) {
			yield next;
		}
	};
};

export function oneCharExcept(allInvalidChars: string): Parser<string, string> {
	return function* (input) {
		let state = input;
		const next = state.advance();
		if (next !== undefined && allInvalidChars.indexOf(next[0]) < 0) {
			yield next;
		}
	};
};

export function empty<TInput>(): Parser<TInput, undefined> {
	return function* (input) {
		yield [undefined, input];
	};
}
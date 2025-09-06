import { Parser } from "./base.js";

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

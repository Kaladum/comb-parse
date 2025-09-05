import { Parser } from "./base";

export const literal = <TString extends string>(content: TString): Parser<string, TString> => {
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
	}
}
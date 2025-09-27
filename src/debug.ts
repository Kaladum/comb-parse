import { styleText } from "node:util";
import { Parser } from "./base.js";

export function debugStringParser<TOutput>(parser: Parser<string, TOutput>): Parser<string, TOutput> {
    return function* (input) {
        const displayPreviousStartPosition = Math.max(input.position - 10, 0);
        const pre = input.data.substring(displayPreviousStartPosition, input.position);
        const result = [...parser(input)];

        console.log("Debug parser results");
        for (const [i, [_value, state]] of result.entries()) {
            const position = state.position;
            const parsedText = input.data.substring(input.position, position);
            const displayEndPosition = Math.min(position + 10, state.length);
            const post = input.data.substring(position, displayEndPosition);
            const styled = styleText("blue", pre) + styleText("green", parsedText) + post;
            console.log(`[${i + 1}]=>${styled}`);
        }
        for (const value of result) {
            yield value;
        }
    };
}
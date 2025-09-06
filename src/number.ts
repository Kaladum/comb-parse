import { Parser } from "./base.js";
import { chain, inputString, map, repeat, repeatAtLeastOnce } from "./combiner/index.js";
import { oneCharOf } from "./simple.js";

type DigitNonZero = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
type Digit = "0" | DigitNonZero;

export function digitNonZero(): Parser<string, DigitNonZero> {
	return map(oneCharOf("123456789"), v => v as DigitNonZero);
}

export function digit(): Parser<string, Digit> {
	return map(oneCharOf("0123456789"), v => v as Digit);
}

export function integer(allowLeadingZero = true): Parser<string, number> {
	if (allowLeadingZero) {
		return map(inputString(repeatAtLeastOnce(digit())), parseInt);
	} else {
		return map(inputString(chain(digitNonZero(), repeat(digit()))), parseInt);
	}
}
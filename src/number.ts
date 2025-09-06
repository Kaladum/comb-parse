import { Parser } from "./base.js";
import { chain, inputString, map, oneOf, repeat, repeatAtLeastOnce } from "./combiner/index.js";
import { literal, oneCharOf } from "./simple.js";

type DigitNonZero = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
type Digit = "0" | DigitNonZero;

export function digitNonZero(): Parser<string, DigitNonZero> {
	return map(oneCharOf("123456789"), v => v as DigitNonZero);
}

export function digit(): Parser<string, Digit> {
	return map(oneCharOf("0123456789"), v => v as Digit);
}

function integerSequence(allowLeadingZero: boolean): Parser<string, string> {
	if (allowLeadingZero) {
		return inputString(repeatAtLeastOnce(digit()));
	} else {
		return inputString(chain(digitNonZero(), repeat(digit())));
	}
}

export function integer(allowLeadingZero = true): Parser<string, number> {
	return map(integerSequence(allowLeadingZero), parseInt);
}

export function float({ allowLeadingZero = true, decimalSeparator = "." } = {}): Parser<string, number> {
	const integerPart = integerSequence(allowLeadingZero);
	const fractionalPart = inputString(repeatAtLeastOnce(digit()));

	return oneOf(
		map(integerPart, parseInt),
		map(
			chain(integerPart, literal(decimalSeparator), fractionalPart),
			([integer, _, fraction]) => parseFloat(integer + "." + fraction)
		),
	);
}
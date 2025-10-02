import { Parser } from "./base.js";
import { chain, inputString, map, oneOf, repeat, repeatAtLeastOnce } from "./combiner/index.js";
import { literal, oneCharOf } from "./simple.js";

type DigitNonZero = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
type Digit = "0" | DigitNonZero;

/**
 * Parser for a single non-zero digit character (1-9).
 * @returns A parser consuming exactly one non-zero digit.
 */
export function digitNonZero(): Parser<string, DigitNonZero> {
	return map(oneCharOf("123456789"), v => v as DigitNonZero);
}

/**
 * Parser for a single digit character (0-9).
 * @returns A parser consuming exactly one digit.
 */
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

/**
 * Parser for an integer number.
 * @param allowLeadingZero Whether to allow leading zeros (default: true).
 * @returns A parser parsing one integer number.
 */
export function integer(allowLeadingZero = true): Parser<string, number> {
	return map(integerSequence(allowLeadingZero), parseInt);
}

/**
 * Parser for a floating-point number.
 * @param allowLeadingZero Whether to allow leading zeros in the integer part (default: true).
 * @param decimalSeparator The character used as the decimal separator (default: ".").
 * @returns A parser parsing a floating-point number.
 */
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
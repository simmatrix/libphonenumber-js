import {
	MIN_LENGTH_FOR_NSN,
	VALID_DIGITS,
	VALID_PUNCTUATION,
	PLUS_CHARS
} from './constants'

import { EXTN_PATTERNS_FOR_PARSING } from './extension'

//  Regular expression of viable phone numbers. This is location independent.
//  Checks we have at least three leading digits, and only valid punctuation,
//  alpha characters and digits in the phone number. Does not include extension
//  data. The symbol 'x' is allowed here as valid punctuation since it is often
//  used as a placeholder for carrier codes, for example in Brazilian phone
//  numbers. We also allow multiple '+' characters at the start.
//
//  Corresponds to the following:
//  [digits]{minLengthNsn}|
//  plus_sign*
//  (([punctuation]|[star])*[digits]){3,}([punctuation]|[star]|[digits]|[alpha])*
//
//  The first reg-ex is to allow short numbers (two digits long) to be parsed if
//  they are entered as "15" etc, but only if there is no punctuation in them.
//  The second expression restricts the number of digits to three or more, but
//  then allows them to be in international form, and to have alpha-characters
//  and punctuation. We split up the two reg-exes here and combine them when
//  creating the reg-ex VALID_PHONE_NUMBER_PATTERN itself so we can prefix it
//  with ^ and append $ to each branch.
//
//  "Note VALID_PUNCTUATION starts with a -,
//   so must be the first in the range" (c) Google devs.
//  (wtf did they mean by saying that; probably nothing)
//
const MIN_LENGTH_PHONE_NUMBER_PATTERN = '[' + VALID_DIGITS + ']{' + MIN_LENGTH_FOR_NSN + '}'
//
// And this is the second reg-exp:
// (see MIN_LENGTH_PHONE_NUMBER_PATTERN for a full description of this reg-exp)
//
const VALID_PHONE_NUMBER =
	'[' + PLUS_CHARS + ']{0,1}' +
	'(?:' +
		'[' + VALID_PUNCTUATION + ']*' +
		'[' + VALID_DIGITS + ']' +
	'){3,}' +
	'[' +
		VALID_PUNCTUATION +
		VALID_DIGITS +
	']*'

// The combined regular expression for valid phone numbers:
//
const VALID_PHONE_NUMBER_PATTERN = new RegExp
(
	// Either a short two-digit-only phone number
	'^' +
		MIN_LENGTH_PHONE_NUMBER_PATTERN +
	'$' +
	'|' +
	// Or a longer fully parsed phone number (min 3 characters)
	'^' +
		VALID_PHONE_NUMBER +
		// Phone number extensions
		'(?:' + EXTN_PATTERNS_FOR_PARSING + ')?' +
	'$'
,
'i')

// Checks to see if the string of characters could possibly be a phone number at
// all. At the moment, checks to see that the string begins with at least 2
// digits, ignoring any punctuation commonly found in phone numbers. This method
// does not require the number to be normalized in advance - but does assume
// that leading non-number symbols have been removed, such as by the method
// `extract_possible_number`.
//
export default function isViablePhoneNumber(number)
{
	return number.length >= MIN_LENGTH_FOR_NSN &&
		VALID_PHONE_NUMBER_PATTERN.test(number)
}
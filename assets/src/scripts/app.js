/**
 * Adds a vue component and implements logic to convert decimal numbers to two's complement.
 *
 * @license MIT
 * @author Joshua Westerheide <dev@jdoubleu.de>
 */

(function(w,d,V) {

	/**
	 * Regexp for a correct decimal number (as input)
	 * @type {RegExp}
	 */
	const numberPattern = /^(\+|-)?(0|[1-9]+[0-9]*)$/i;

	/**
	 * Checks whether the given number is valid
	 * @param number
	 * @returns {boolean}
	 * @see numberPattern
	 */
	const checkNumber = number => {
		return number.toString().match(numberPattern) != null;
	};

	/**
	 * Converts all numbers larger than 9 to a letter/symbol
	 * @param n
	 * @returns {string}
	 */
	const repr = n => {
		return n > 9 ? String.fromCharCode(65 /* 65 is A */ + n - 10) : n;
	};

	/**
	 * Turns a given letter/symbol/number into a number
	 * @param {string} s
	 * @returns {number}
	 * @see repr
	 */
	const reprReverse = s => {
		s = s.toString();
		return s.charCodeAt(0) > 65 /* 65 is A */ ? s.charCodeAt(0)	- 65 + 10 : parseInt(s);
	};

	/**
	 * Converts a positive! decimal number into a number to the provided base.
	 * @param {number} number
	 * @param base
	 * @returns {String}
	 */
	const convertDecimalToBase = (number, base = 10) => {
		let rep = "",
			rem = number;

		// Converts the given number using the base into its new representation
		do {
			rep = repr(rem % base) + rep;
			rem = Math.floor(rem / base);
		} while(rem / base > 0);

		// Remove leading zeros
		return rep.replace(/^0+(?!\.|$)/, '');
	};

	/**
	 * Converts a number of the given base to a decimal number
	 * @param {string} number
	 * @param base
	 * @returns {number}
	 */
	const convertBaseToDecimal = (number, base = 2) => {
		let ret = 0;

		for(let i = number.length; i > 0; i--) {
			let pos = number.length - i;
			ret +=	reprReverse(number.charAt(i - 1)) * Math.pow(base, pos);
		}

		return ret;
	};

	/**
	 * Inverts a binary number according to two's complement
	 * @param {string} bin
	 */
	const invertBinary = bin => {
		// Flip all bits
		let b = bin.split('').map(v => {
			return v == '1' ? '0' : '1';
		});

		let i = b.length - 1,
			car = 1;
		// Add +1
		while(car == 1 && i >= 0) {
			if(b[i] == '1')
				b[i] = '0';
			else {
				b[i] = '1';
				car = 0;
			}
			i--;
		}

		return b.join('');
	};

	/**
	 * Converts a number to two's complement
	 * @param number
	 * @param base
	 * @returns {String}
	 */
	const twosComplement = (number, base = 10) => {
		let res = number = number.toString(),
			sign = "+";

		if(["+", "-"].indexOf(number.charAt(0)) !== -1) {
			sign = number.charAt(0);
			res = number.substr(1);
		}

		res = convertDecimalToBase(parseInt(res), 2);

		if(sign === "-")
			res = invertBinary(res);

		return convertDecimalToBase(convertBaseToDecimal(res, 2), base);
	};

	/**
	 * Calculator vue app
	 * Implements the calculation logic and UI
	 * @type {Vue}
	 */
	new V({
		el: '#app',
		data: {
			value: 0,
			result: {
				bin: 0,
				oct: 0,
				hex: 0
			}
		},
		computed: {
			result: function() {
				return checkNumber(this.value) ? {
					bin: twosComplement(this.value, 2),
					oct: twosComplement(this.value, 8),
					hex: twosComplement(this.value, 16)
				} : {bin:'?',oct:'?',hex:'?'};
			}
		}
	});

}(window, document, Vue));
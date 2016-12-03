/**
 * Adds a vue component and implements logic to convert decimal numbers to two's complement.
 *
 * @license MIT
 * @author Joshua Westerheide <dev@jdoubleu.de>
 */

(function(w,d,V) {

	/**
	 * Invalid value text
	 * @type {string}
	 */
	const invalidValue = '?';

	/**
	 * Regexp for a correct decimal number (as input)
	 * @type {RegExp}
	 */
	const numberPattern = /^(\+|-)?(0|[1-9]+[0-9]*)$/i;

	/**
	 * Length of the displayed binary numbers (aka byte length)
	 * @type {number}
	 */
	let wordLength = 8;

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
		let rep = '',
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
	 * Converts a number to two's complement in binary format
	 * @param number
	 * @returns {String}
	 * @throws RangeError
	 */
	const twosComplement = (number) => {
		let res = number.toString(),
			sign = '+';

		if(['+', '-'].indexOf(res.charAt(0)) !== -1) {
			sign = res.charAt(0);
			res = res.substr(1);
		}

		if((sign == '+' && res >= Math.pow(2, wordLength - 1)) || (res > Math.pow(2, wordLength - 1)))
			throw new RangeError('Given number can\'t be represented by current word bit length (' + wordLength + ').');

		res = convertDecimalToBase(parseInt(res), 2);

		// Fill up to word length
		while(wordLength > res.length)
			res = '0' + res;

		if(sign === '-')
			res = invertBinary(res);

		return res;
	};

	const gettwcs = (value) => {
		let tc,
			res = {
				bin: invalidValue,
				oct: invalidValue,
				hex: invalidValue
			};

		const _convertAndFill = (base) => {
			let res = convertDecimalToBase(convertBaseToDecimal(tc, 2), base);

			// Fill result with zeros from left to its maximal length according to word length
			while(Math.ceil(wordLength / Math.log2(base)) > res.length)
				res = '0' + res;

			return res;
		};

		try {
			tc = twosComplement(value);

			if(checkNumber(value) && tc.length <= wordLength)
				res = {
					bin: tc,
					oct: _convertAndFill(8),
					hex: _convertAndFill(16)
				};
		} catch(e) {
			if(e instanceof RangeError)
				(res = {
					bin: invalidValue + invalidValue,
					oct: invalidValue + invalidValue,
					hex: invalidValue + invalidValue
				}) && console.log(e.message);
		}

		return res;
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
			blength: 8,
			result: {
				bin: 0,
				oct: 0,
				hex: 0
			},
			error: ''
		},
		computed: {
			result: function() {
				wordLength = parseInt(this.blength);
				return this.gettwcs(this.value);
			}
		},
		watch: {
			error: function() {
				if(this.error) {
					this.$el.querySelector('#result-error').MaterialSnackbar.showSnackbar({
						timeout: 3000,
						message: this.error
					});
					setTimeout(() => this.error = '', 3000);
				}
			}
		},
		methods: {
			gettwcs: function(value) {
				let tc,
					res = {
						bin: invalidValue,
						oct: invalidValue,
						hex: invalidValue
					};

				const _convertAndFill = (base) => {
					let res = convertDecimalToBase(convertBaseToDecimal(tc, 2), base);

					// Fill result with zeros from left to its maximal length according to word length
					while(Math.ceil(wordLength / Math.log2(base)) > res.length)
						res = '0' + res;

					return res;
				};

				try {
					tc = twosComplement(value);

					if(checkNumber(value) && tc.length <= wordLength)
						res = {
							bin: tc,
							oct: _convertAndFill(8),
							hex: _convertAndFill(16)
						};
				} catch(e) {
					if(e instanceof RangeError) {
						res = {
							bin: invalidValue,
							oct: invalidValue,
							hex: invalidValue
						};
						this.error = e.message;
					}
				}

				return res;
			}
		}
	});

}(window, document, Vue));
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
					bin: this.value * 2,
					oct: this.value * 8,
					hex: this.value * 16
				} : {bin:'?',oct:'?',hex:'?'};
			}
		}
	});

}(window, document, Vue));
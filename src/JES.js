/*globals console, define, module, window*/
/*jslint bitwise:true*/

(function () {
	"use strict";

	var JES = {
		sbox: {
			norm: [],
			inv: []
		},
		matrix: {
			norm: [
				[2, 3, 1, 1],
				[1, 2, 3, 1],
				[1, 1, 2, 3],
				[3, 1, 1, 2]
			],
			inv: [
				[14, 11, 13, 9],
				[9, 14, 11, 13],
				[13, 9, 14, 11],
				[11, 13, 9, 14]
			]
		},
		rcon: [
            0x8d, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36, 0x6c, 0xd8, 0xab, 0x4d, 0x9a
        ],
		error: function (errors) {
			var variable,
				conditions = [],
				message = "",
				i = 0,
				j = 0,
				k = 0;

			for (i in errors) {
				if (errors.hasOwnProperty(i)) {
					variable = errors[i].variable;
					conditions = errors[i].conditions;
					message = errors[i].message;

					for (j = 0, k = conditions.length; j < k; j += 1) {
						if (variable === conditions[j]) {
							console.warn(message);
							return true;
						}
					}
				}
			}

			return false;
		},
		clone: function (obj) {
			var new_obj = (obj instanceof Array) ? [] : {},
				i = 0;

			for (i in obj) {
				if (obj.hasOwnProperty(i)) {
                    new_obj[i] = (obj[i] && typeof obj[i] === "object") ? JES.clone(obj[i]) : obj[i];
				}
			}

			return new_obj;
		},
		blockXOR: function () {
			var args = arguments,
				output = this.clone(args[0]),
				i = 0,
				l = 0,
				x = 0,
				y = 0;

			if (args.length < 2) {
				return args;
			}

			for (x = 0; x < output.length; x += 1) {
				for (y = 0; y < output[x].length; y += 1) {
					for (i = 1, l = args.length; i < l; i += 1) {
						output[x][y] ^= args[i][x][y];
					}
				}
			}

			return output;
		},
		output: function (output_array, output_type) {
			var out = [],
				hex = "",
				i = 0,
				l = 0;

			output_type = output_type || "ascii/string";

			switch (output_type) {
			case "hex/array":
				for (i = 0, l = output_array.length; i < l; i += 1) {
					hex = parseInt(output_array[i], 10).toString(16);
					out.push((hex.length < 2) ? "0" + hex : hex);
				}

				return out;
			case "hex/string":
				for (i = 0, l = output_array.length; i < l; i += 1) {
					hex = parseInt(output_array[i], 10).toString(16);
					out.push((hex.length < 2) ? "0" + hex : hex);
				}

				return out.join("");
			case "ascii/array":
				for (i = 0, l = output_array.length; i < l; i += 1) {
					out.push(String.fromCharCode(output_array[i]));
				}

				return out;
			case "int/array":
				return output_array;
			default:
				for (i = 0, l = output_array.length; i < l; i += 1) {
					out.push(String.fromCharCode(output_array[i]));
				}

				return out.join("");
			}
		},
		subBytes: function (state, inv) {
			var sbox = (!inv) ? this.sbox.norm : this.sbox.inv,
				x = 0,
				y = 0;

			for (x = 0; x < state.length; x += 1) {
				for (y = 0; y < state[x].length; y += 1) {
                    state[x][y] = sbox[state[x][y]];
				}
			}

			return state;
		},
		shiftRows: function (state, inv) {
			var shift = [],
				i = 0;

			inv = (!inv) ? 0 : state.length;

			for (i = 0; i < state.length; i += 1) {
				shift = state[i].splice(Math.abs(inv - i), state.length);
				state[i] = shift.concat(state[i]);
			}

			return state;
		},
		mixColumns: function (state, inv) {
			var matrix = (!inv) ? this.matrix.norm : this.matrix.inv,
				mult = function (a, b) {
					var bit = 0,
						result = 0x00,
						i = 0;

					for (i = 0; i < 8; i += 1) {
						result ^= ((b & 1) === 1) ? a : 0;
						bit = a & 128;

						a <<= 1;
						a ^= (bit === 0x80) ? 0x1b : 0;

						b >>= 1;
					}

					return result % 0x100;
				},
				val = 0,
				vals = [],
				i = 0,
				x = 0,
				y = 0;

			for (y = 0; y < state.length; y += 1) {
				for (i = 0; i < matrix.length; i += 1) {
					val = 0;

					for (x = 0; x < state.length; x += 1) {
						val ^= mult(state[x][y], matrix[i][x]);
					}

					vals.push(val);
				}
			}

			i = 0;

			for (y = 0; y < state.length; y += 1) {
				for (x = 0; x < state.length; x += 1) {
					state[x][y] = vals[i];
					i += 1;
				}
			}

			return state;
		},
		addRoundKey: function (state, key) {
			return this.blockXOR(state, key);
		},
		keySchedule: function (key, rounds) {
			var keys = [],
				words = [],
				last_word = [],
				rot = [],
				round_rcon = [0, 0, 0, 0],
				new_key = [],
				output = [],
				i = 0,
				j = 0,
				k = 0,
				x = 0,
				y = 0;

			keys.push(key);

			for (i = 1; i <= rounds; i += 1) {
				key = keys[i - 1];
				words = [[], [], [], []];
				last_word = [];
				rot = [];
				round_rcon = [this.rcon[i % 0xff], 0, 0, 0];
				new_key = [[], [], [], []];
				output = [[], [], [], []];

				for (x = 0; x < key.length; x += 1) {
					for (y = 0; y < key.length; y += 1) {
						words[x].push(key[y][x]);
					}
				}

				/* RotWord */
				last_word = words[3].slice(0);
				rot = last_word.splice(1, last_word.length - 1);
				last_word = rot.concat(last_word);

				/* SubBytes */
				last_word = this.subBytes([last_word])[0];

				/* Rcon */
				for (j = 0; j < words[0].length; j += 1) {
					new_key[0][j] = words[0][j] ^ last_word[j] ^ round_rcon[j];
				}

				/* Finish new key */
				for (j = 1; j < words.length; j += 1) {
					for (k = 0; k < words[j].length; k += 1) {
						new_key[j][k] = words[j][k] ^ new_key[j - 1][k];
					}
				}

				/* Flip x and y */
				for (x = 0; x < new_key.length; x += 1) {
					for (y = 0; y < new_key[x].length; y += 1) {
						output[x][y] = new_key[y][x];
					}
				}

				keys.push(output);
			}

			return keys;
		},
		toKey: function (pass) {
			var key = [[], [], [], []],
				arr = [],
				pad = "0",
				i = 0,
				l = 0,
				x = 0,
				y = 0;

			/* Pad key */
			while (pass.length < 32) {
				pass = pass + pad;
			}

			pass = pass.substring(0, 32);

			for (i = 0, l = pass.length; i < l; i += 2) {
				arr.push(parseInt(pass.substring(i, i + 2), 16));
			}

			i = 0;

			for (y = 0; y < 4; y += 1) {
				for (x = 0; x < 4; x += 1) {
					key[x][y] = arr[i];

					i += 1;
				}
			}

			return key;
		},
		toBlocks: function (input, decrypt) {
			var inputs = [],
				block = [[], [], [], []],
				blocks = [],
				pad = 0x00,
				i = 0,
				j = 0,
				l = 0,
				x = 0,
				y = 0;

			for (i = 0, l = input.length; i < l; i += 16) {
				inputs.push(input.substring(i, i + 16));
			}

			/* Pad final block */
			pad = String.fromCharCode(0x10 - inputs[inputs.length - 1].length);
			while (inputs[inputs.length - 1].length < 16) {
				inputs[inputs.length - 1] = inputs[inputs.length - 1] + pad;
			}

			if (!decrypt) {
				if (pad.charCodeAt(0) === 0) {
					inputs[inputs.length] = "";

					for (i = 0, l = 16; i < l; i += 1) {
						inputs[inputs.length - 1] += String.fromCharCode(16);
					}
				}
			}

			for (i = 0, l = inputs.length; i < l; i += 1) {
				j = 0;
				block = [[], [], [], []];

				for (y = 0; y < 4; y += 1) {
					for (x = 0; x < 4; x += 1) {
						block[x][y] = inputs[i].charCodeAt(j);
						j += 1;
					}
				}

				blocks.push(block);
			}

			return blocks;
		},
		encrypt: function (opts, output_type, decrypt) {
			var blocks = [],
				keys = [],
				iv = [],
				state = [],
				outputs = [],
				output_array = [],
				pad = 0,
				error = false,
				i = 0,
				j = 0,
				k = 0,
				l = 0,
				x = 0,
				y = 0;

			opts.input = opts.plaintext || opts.ciphertext;

			error = this.error({
				"opts": {
					variable: opts,
					conditions: [undefined, false],
					message: "Missing variables"
				},
				"opts.input": {
					variable: opts.input,
					conditions: [undefined, false, ""],
					message: "Missing input"
				},
				"opts.key": {
					variable: opts.key,
					conditions: [undefined, false, ""],
					message: "Missing key"
				},
				"opts.iv": {
					variable: opts.iv,
					conditions: [undefined, false, ""],
					message: "Missing initialization vector"
				}
			});

			if (error) {
				return false;
			}

			blocks = this.toBlocks(opts.input, decrypt);
			keys = this.keySchedule(this.toKey(opts.key), 10);
			iv = this.toKey(opts.iv);

			for (i = 0, j = blocks.length; i < j; i += 1) {
				state = this.clone(blocks[i]);

				if (!decrypt) {
					state = this.blockXOR(state, (i === 0) ? iv : outputs[outputs.length - 1]);

					state = this.addRoundKey(state, keys[0]);

					for (k = 1, l = 9; k <= l; k += 1) {
						state = this.addRoundKey(this.mixColumns(this.shiftRows(this.subBytes(state))), keys[k]);
					}

					state = this.addRoundKey(this.shiftRows(this.subBytes(state)), keys[k]);
				} else {
					state = this.subBytes(this.shiftRows(this.addRoundKey(state, keys[10]), true), true);

					for (k = 9, l = 1; k >= l; k -= 1) {
						state = this.subBytes(this.shiftRows(this.mixColumns(this.addRoundKey(state, keys[k]), true), true), true);
					}

					state = this.addRoundKey(state, keys[k]);

					state = this.blockXOR(state, (i === 0) ? iv : blocks[i - 1]);
				}

				outputs.push(state);
			}

			for (i = 0, l = outputs.length; i < l; i += 1) {
				for (x = 0; x < outputs[i].length; x += 1) {
					for (y = 0; y < outputs[i].length; y += 1) {
						output_array.push(outputs[i][y][x]);
					}
				}
			}

			if (decrypt) {
				/* Remove padding */
				pad = output_array[output_array.length - 1];
				if (output_array[output_array.length - pad] === pad) {
					output_array = output_array.slice(0, output_array.length - pad);
				}
			}

			return this.output(output_array, output_type);
		},
		decrypt: function (opts, output_type) {
			return this.encrypt(opts, output_type, true);
		}
	};

    (function () {
        var byte = 0,
            d = [],
            i = 0,
            x = 0,
            y = 0;

        for (i = 0; i < 256; i += 1) {
            d[i] = (i < 128) ? i << 1 : (i << 1) ^ 0x11b;
        }

        for (i = 0; i < 256; i += 1) {
            byte = y ^ (y << 1) ^ (y << 2) ^ (y << 3) ^ (y << 4);
            byte = (byte >>> 8) ^ (byte & 0xff) ^ 0x63;

            JES.sbox.norm[x] = byte;
            JES.sbox.inv[byte] = x;

            if (!x) {
                x = 1;
                y = 1;
            } else {
                x = d[x] ^ d[d[d[d[d[d[x]]] ^ d[x]]]];
                y ^= d[d[y]];
            }
        }
    }());

	if (typeof module === "object" && module && typeof module.exports === "object") {
		module.exports = JES;
	} else {
		window.JES = JES;

		if (typeof define === "function" && define.amd) {
			define("JES", [], function () {
				return JES;
			});
		}
	}
}());
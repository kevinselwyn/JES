/*globals document, JES, window*/

(function (document, window) {
	"use strict";

	window.onload = function () {
		var input = document.getElementById("input"),
			key = document.getElementById("key"),
			iv = document.getElementById("iv"),
			encrypted = document.getElementById("encrypted"),
			encrypt_btn = document.getElementById("encrypt"),
			decrypt_btn = document.getElementById("decrypt"),
			result = [],
			results = [],
			arr = [],
			str = "",
			i = 0,
			l = 0;

		encrypt_btn.onclick = function () {
			results = [];
			result = JES.encrypt({
				input: input.value,
				pass: key.value,
				iv: iv.value
			}, "hex/array");

			for (i = 0, l = result.length; i < l; i += 16) {
				results.push(result.slice(i, i + 16).join(", "));
			}

			encrypted.value = results.join(",\n");
		};

		decrypt_btn.onclick = function () {
			str = "";
			arr = encrypted.value.replace(/\s/g, "").split(/,/);

			for (i = 0, l = arr.length; i < l; i += 1) {
				str += String.fromCharCode(parseInt(arr[i], 16));
			}

			input.value = JES.decrypt({
				input: str,
				pass: key.value,
				iv: iv.value
			}, "ascii/string");
		};
	};
}(document, window));
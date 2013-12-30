#JES

Javascript implementation of the [Advanced Encryption Standard](http://en.wikipedia.org/wiki/Advanced_Encryption_Standard) (AES-128-CBC)

##Demo

[JES](http://kevinselwyn.com/JES/)

##Usage

Include the script in your document:

```html
<script src="dist/JES.min.js"></script>
```

If you are using a module loader like [RequireJS](http://requirejs.org/), require the module:

```js
require(["dist/JES.min.js"], function (JES) {
	
});
```

###Encryption

```js
JES.encrypt({
	input: "Attack at dawn!!",
	key: "6162636465666768696a6b6c6d6e6f70",
	iv: "7172737475767778797a7b7c7d7e7f80"
}, output_type);
```

`input`: The plaintext to encode<br />
`key`: A 16-byte hexadecimal string<br />
`iv`: The initialization vector<br />
`output_type`: Choice of output type

*	"hex/array": An array of single-byte hexadecimal strings
*	"hex/string": A continuous, 16-byte string
*	"ascii/array": An array of single-character strings
*	"ascii/string": A continuous string
*	"int/array": An array of single-byte integers

###Decryption

```js
JES.decrypt({
	intput: String.fromCharCode(0xd7, 0x9f, 0x73, 0xc1, 0x46, 0x19, 0xe3, 0x78, 0xb0, 0x2a, 0xea, 0xe3, 0x5d, 0x8f, 0xf4, 0x3f, 0x5e, 0xae, 0x3d, 0x97, 0xf3, 0xe6, 0x38, 0x40, 0xed, 0x20, 0x69, 0xde, 0xad, 0xa0, 0xb2, 0x21),
	key: "6162636465666768696a6b6c6d6e6f70",
	iv: "7172737475767778797a7b7c7d7e7f80"
}, output_type);
```

The variables are the same as encryption.

##Support

*	Chrome
*	Firefox
*	Safari
*	Opera
*	IE8+ <sup>*</sup>

<sup>*</sup> There is functionality in the demo that is not supported on IE8
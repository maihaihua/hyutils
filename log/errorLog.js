const mkdirp = require('../file/mkdirp');
const fs = require('fs');
const path = require('path');

module.exports = function(file) {
	let filedir = path.dirname(file);
	let args = Array.prototype.slice.call(arguments, 1);
	mkdirp(filedir, function(err) {
		if (err) {
			throw err;
		} else {
			let logText = (args || []).map(value => {
				return JSON.stringify(value);
			})
			logText = `${new Date()} | ${logText.join(' | ')}\n`;
			fs.appendFile(file, logText, function() {});
		}
	})
}
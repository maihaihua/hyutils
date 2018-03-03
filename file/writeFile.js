const fs = require('fs');
const path = require('path');
const mkdirp = require('./mkdirp');

function writeFile(filepath, content, cb) {
	mkdirp(path.dirname(filepath), function(err) {
		if (!err) {
			fs.writeFile(filepath, content, cb || function() {});
		}
	})
}

module.exports = writeFile;
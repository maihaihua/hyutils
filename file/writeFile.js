const fs = require('fs');
const path = require('path');
const mkdirp = require('./mkdirp');

function writeFile(filepath, content, cb) {
	mkdirp(path.dirname(filepath), function(err) {
		if (!err || (err && err.code == 'EEXIST')) {
			fs.writeFile(filepath, content, cb || function() {});
		} else {
			(typeof cb === 'function') && cb(err, null)
		}
	})
}

module.exports = writeFile;
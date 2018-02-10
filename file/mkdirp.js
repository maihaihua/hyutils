const fs = require('fs');
const path = require('path');

function runCb(callback, err) {
	if (typeof callback === 'function') {
		callback(err);
	}
}

function mkdirp(filepath, cb) {
	fs.mkdir(filepath, function(err) {
		if (!err) {
			runCb(cb, err)
		} else {
			switch (err.code) {
				case 'ENOENT':
					mkdirp(path.dirname(filepath), function(err) {
						fs.mkdir(filepath, cb);
					})
					break;
				case 'EEXIST':
					runCb(cb, null);
				default:
					runCb(cb, err);
			}
		}
	})
}

module.exports = mkdirp
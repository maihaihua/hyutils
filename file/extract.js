const fs = require('fs');
const path = require('path');

function chkIsDirectory(path) {
	return fs.lstatSync(path).isDirectory();
}

function getAllFile(target) {
	let files = fs.readdirSync(target);
	files = files.reduce((list, file) => {
		if (chkIsDirectory(path.join(target, file))) {
			return list.concat(getAllFile(path.join(target, file)));
		} else {
			return list.concat([path.join(target, file)]);
		}
	}, []);
	return files;
}

function filterFiles(files, options) {

	for (let i = 0; i < options.length; i++) {
		if (typeof options === 'object') {

		} else if (typeof options === 'string') {

		}
	}
}

function getFilterRegxs(options) {
	if (!options.base || (options.include !== undefined && !(options.include instanceof Array)) || (options.exclude !== undefined && !(options.exclude instanceof Array))) {
		throw new Error('options uncorrect: ' + JSON.stringify(options))
	}
	let regxs = {
		includes: [],
		excludes: []
	};
	if (options.include) {
		for (let i = 0; i < options.include.length; i++) {
			let include = options.include[i];
			if (typeof include === 'string') {
				regxs.includes.push(include.replace(/\./g, '\\.'));
			} else {
				let tmp = getFilterRegxs(include);
				regxs.includes = regxs.includes.concat(tmp.includes || []);
				regxs.excludes = regxs.excludes.concat(tmp.excludes || []);
			}
		}
	}
	if (options.exclude) {
		for (let i = 0; i < options.exclude.length; i++) {
			let exclude = options.exclude[i];
			if (typeof exclude === 'string') {
				regxs.excludes.push(exclude.replace(/\./g, '\\.'));
			} else {
				let tmp = getFilterRegxs(exclude);
				regxs.excludes = regxs.excludes.concat(tmp.excludes || []);
			}
		}
	}
	regxs.includes = regxs.includes.map(include => {
		let temp = path.join(options.base, include).replace(/\*/g, '.+').replace(new RegExp('\\' + path.sep, 'g'), '\\' + path.sep);
		let regx = new RegExp(`^(\.{1,2}\${path.sep})+`)
		if (regx.test(temp)) {
			let pre = temp.match(regx)[0];
			let sub = temp.slice(pre.length, temp.length);
			return pre + sub.replace(/\./g, '\\.').replace(/\\\\\.\+/g, '\\.+');
		} else {
			return temp;
		}
	});
	regxs.excludes = regxs.excludes.map(exclude => {
		let temp = path.join(options.base, exclude).replace(/\*/g, '.+').replace(new RegExp('\\' + path.sep, 'g'), '\\' + path.sep);
		let regx = new RegExp(`^(\.{1,2}\${path.sep})+`)
		if (regx.test(temp)) {
			let pre = temp.match(regx)[0];
			let sub = temp.slice(pre.length, temp.length);
			return pre + sub.replace(/\./g, '\\.').replace(/\\\\\.\+/g, '\\.+');
		} else {
			return temp;
		}
	});
	return regxs;
}

function main(src, options) {
	let files = [];
	let regxs = getFilterRegxs(options);
	console.log(regxs)
	files = files.filter(file => {
		for (let i = 0; i < regxs.includes.length; i++) {
			let regx = new RegExp('^' + regxs.includes[i]);
			if (regx.test(file)) {
				return true;
			}
		}
		return false;
	});
	files = files.filter(file => {
		for (let i = 0; i < regxs.excludes.length; i++) {
			let regx = new RegExp('^' + regxs.excludes[i]);
			if (regx.test(file)) {
				return false;
			}
		}
		return true;
	});
	return files;
}
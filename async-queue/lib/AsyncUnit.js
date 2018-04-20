var defer = require("promise-defer")
// Promise.defer = function() {
// 	let defer = {};
// 	let promise = new Promise(function(resolve, reject) {
// 		defer.resolve = resolve;
// 		defer.reject = reject;
// 	});
// 	defer.promise = promise;
// 	return defer;
// }
class AsyncUnit {
	constructor(promiseGenrator, options) {
		if (typeof promiseGenrator !== 'function') {
			throw new Error('AsyncUnit constructor should have a function as first params while it is ');
		}

		this.promiseGenrator = promiseGenrator;
		this.options = Object.assign({
			auto: false,
			retry: 3,
			timeout: 3000
		}, options);
		this.deferred = defer();
		this.retryCount = 0;

		if (this.options.auto) {
			this.run();
		}
	}
	run() {
		this.timeout = this.timeout || setTimeout(() => {
			this.deferred.reject(new Error('Timeout!'));
			this.retryCount = this.options.retry;
		}, this.options.timeout);
		try {
			let promise = new Promise(this.promiseGenrator);
			promise.then(data => {
				this.deferred.resolve(data);
				this.finish();
			}).catch(err => {
				this.retry(err)
			})
		} catch (err) {
			this.retry(err);
		}
	}
	retry(err) {
		this.retryCount++;
		this.retryCount < this.options.retry ? this.run() : this.deferred.reject(err);
		this.retryCount < this.options.retry ? null : this.finish();
	}
	getPromise() {
		return this.deferred.promise;
	}
	then(func) {
		return this.deferred.promise.then.call(this.deferred.promise, ...arguments);
	}
	catch (func) {
		return this.deferred.promise.catch(this.deferred.promise, ...arguments);
	}
	finish() {
		this.timeout && clearTimeout(this.timeout);
	}
}

module.exports = AsyncUnit;
// let count = 0;
// let a = new AsyncUnit((resolve, reject) => {
// 	count == 2 ? resolve(count) : reject(count);
// 	console.log(count++);
// }, {
// 	auto: true
// }).then((data) => {
// 	console.log('success', data)
// 	return 123;
// }).catch(err => {
// 	console.log('err', err);
// });
// a.then(data => {
// 	console.log('other', data)
// })
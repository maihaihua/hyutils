let AsyncUnit = require('./lib/AsyncUnit');
let AsyncQueue = require('./lib/AsyncQueue');

module.exports = {
	AsyncUnit,
	AsyncQueue
}

// let queue = new AsyncQueue();
// for (let i = 0; i < 100; i++) {
// 	let unit = new AsyncUnit((resolve, reject) => {
// 		setTimeout(() => {
// 			console.log(i)
// 			i % 2 ? resolve(i) : reject(i);
// 		}, 100)
// 	});
// 	// i++;
// 	unit.then(data => {
// 		console.log('done', data);
// 	}).catch(err => {
// 		console.log('catch', err)
// 	});
// 	queue.push(unit);
// }
const EventEmitter = require('events');

class AsyncQueue extends EventEmitter {
	constructor(options) {
		super();
		this.options = Object.assign({
			parallLimit: 10
		}, options);
		this.queue = [];
		this.doingCount = [];

		this.initEvent();
	}
	push(asyncUnit) {
		this.queue.push(asyncUnit);
		this.emit('trigger');
	}
	initEvent() {
		this.on('trigger', (data) => {
			if (this.queue.length > 0 && this.doingCount < this.options.parallLimit) {
				let asyncUnit = this.queue.shift();
				asyncUnit.then(data => {
					this.doingCount--;
					this.emit('trigger', data);
				}).catch(err => {
					this.doingCount--;
					this.emit('error', err, asyncUnit);
				});
				this.doingCount++;
				asyncUnit.run();
			} else if (this.queue.length == 0) {
				this.emit('empty');
			}
			return data;
		});
		this.on('error', (err, asyncUnit) => {
			this.emit('trigger');
			console.log('error', err);
		})
	}
}

module.exports = AsyncQueue;
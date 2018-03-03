var EventEmitter = require('events');
var request = require('request');
var uuid = require('uuid');
class DownloadUtil {
    constructor(options) {
        this.queue = [];
        this.doings = [];
        this.errors = [];
        this.eventBus = new EventEmitter();
        this.init();
    }
    init(options) {
        var self = this;
        this.retry = 10;
        this.queueLimit = 10;
        if (typeof options === 'object') {
            this.retry = options.retry || 10;
            this.queueLimit = options.queueLimit || 10;
        }
        this.eventBus.on('next', function() {
            if (self.queue.length > 0) {
                var request = self.queue.shift();
                request.requestId = uuid();
                self.doings.push(request);
                self._download(request);
            } else if (self.doings.length <= 0) {
                self.eventBus.emit('finish', self.errors);
            }
        });
        this.eventBus.on('done', function(requestId, body, headers) {
            var request;
            var index = self._findRequestId(requestId);
            if (index !== -1) {
                request = self.doings.splice(index, 1)[0];
                if (request.callback && typeof request.callback === 'function') {
                    request.callback.call(null, body, headers);
                }
            }
            self.eventBus.emit('next');
        });
        this.eventBus.on('error', function(err, requestId) {
            var index = self._findRequestId(requestId);
            if (index !== -1) {
                var request = self.doings.splice(index, 1)[0];
                var errCount = request.errCount || 0;
                request.errCount = errCount + 1;
                request.err = err;
                if (request.errCount < self.retry) {
                    self.queue.push(request);
                } else {
                    if (typeof request.error === 'function') {
                        request.error(err);
                    }
                    self.errors.push(request);
                }
            }
            self.eventBus.emit('next');
        });
        this.eventBus.on('start', function() {
            for (var i = 0; i < self.queueLimit; i++) {
                self.eventBus.emit('next');
            }
        })
        // this.eventBus.on('finish', function() {
        //     console.log('finish', self.errors);
        // });
    }
    _findRequestId(requestId) {
        var index = -1;
        for (var i = 0; i < this.doings.length; i++) {
            if (requestId === this.doings[i].requestId) {
                index = i;
                break;
            }
        }
        return index;
    }
    push(requests) {
        if (requests instanceof Array) {
            this.queue = this.queue.concat(requests);
        } else {
            this.queue.push(requests);
        }
    }
    on(event, callback) {
        this.eventBus.on(event, callback);
    }
    start(options) {
        this.eventBus.emit('start');
    }
    _download(requestParams) {
        var self = this;
        request(requestParams, function(err, rsp, body) {
            if (err) {
                self.eventBus.emit('error', requestParams.requestId, err);
            } else {
                if (rsp.statusCode >= 200 && rsp.statusCode < 300) {
                    let res = rsp.toJSON();
                    self.eventBus.emit('done', requestParams.requestId, body, res.headers);
                } else {
                    self.eventBus.emit('error', rsp.statusCode, requestParams.requestId);
                }
            }
        })
    }
}
module.exports = DownloadUtil;
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
        if (typeof options === 'object') {
            this.retry = options.retry || 10;
            this.queue = options.queue || 10;
        }
        this.eventBus.on('next', function() {
            if (self.queue.length > 0) {
                var request = self.queue.shift();
                request.requestId = uuid();
                self.doings.push(request);
                self._download(request);
            } else if (self.doings.length <= 0) {
                self.eventBus.emit('finish');
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
        this.eventBus.on('error', function(requestId, err) {
            var index = self._findRequestId(requestId);
            if (index !== -1) {
                request = self.doings = self.doings.splice(index, 1);
                var errCount = request.errCount || 0;
                request.errCount = errCount++;
                request.err = err;
                if (request.errCount < self.retry) {
                    self.queue.push(request);
                } else {
                    this.errors.push(request);
                }
            }
            self.eventBus.emit('next');
        });
        this.eventBus.on('start', function() {
            for (var i = 0; i < self.queue.length; i++) {
                self.eventBus.emit('next');
            }
        })
        this.eventBus.on('finish', function() {
            console.log('finish', self.errors);
        });
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
    start(options) {
        this.eventBus.emit('start');
    }
    _download(requestParams) {
        var self = this;
        request(requestParams, function(err, rsp, body) {
            if (err) {
                self.eventBus.emit('error', requestParams.requestId, err);
            } else {
                let res = rsp.toJSON();
                self.eventBus.emit('done', requestParams.requestId, body, res.headers);
            }
        })
    }
}
module.exports = DownloadUtil;
var util = new DownloadUtil();
util.push({
    url: 'http://nodejs.cn/api/events.html#events_class_eventemitter',
    callback: function(data, headers) {
        console.log(data, headers);
    }
});
util.start();
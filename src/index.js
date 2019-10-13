const events = require('events');
const net = require('net');
const Promise = require('bluebird');

module.exports = class Telnet extends events.EventEmitter {
  constructor() {
    super();

    this.socket = null;
    this.state = null;
  }

  connect(opts) {

    let promise;
    return promise = new Promise((resolve, reject) => {

      const host = (typeof opts.host !== 'undefined' ? opts.host : '127.0.0.1');
      const port = (typeof opts.port !== 'undefined' ? opts.port : '127.0.0.1');
      this.timeout = (typeof opts.timeout !== 'undefined' ? opts.timeout : 500);

      this.waitPrompt = (typeof opts.waitPrompt !== 'undefined' ? opts.waitPrompt : 'username:');
      this.username = (typeof opts.username !== 'undefined' ? opts.username : 'root');
      this.password = (typeof opts.password !== 'undefined' ? opts.password : 'root');
      this.ors = (typeof opts.ors !== 'undefined' ? opts.ors : '\r');
      this.sendTimeout = (typeof opts.sendTimeout !== 'undefined' ? opts.sendTimeout : 2000);

      this.socket = net.createConnection({
        port,
        host,
      }, () => {
        this.state = 'start';
        this.emit('connect');

        //maybe default LFCR
      });

      this.inputBuffer = '';

      this.socket.setTimeout(this.timeout, () => {
        if (promise.isPending()) {
          if (this.listeners('error').length > 0)
          this.emit('error', 'Cannot Connect');

          this.socket.destroy();
          return reject(new Error('timeout'));
        }
      });

      this.socket.on('data', data => {
          if (this.state === 'start') {
            resolve(data.toString());
            return;
          }
      
          return this.emit('data', data);
      });

      this.socket.on('error', error => {
        if (this.listeners('error').length > 0)
          this.emit('error', error);

        if (promise.isPending())
          reject(error);
      });

      this.socket.on('end', () => {
        this.emit('end');

        if (promise.isPending())
          reject(new Error('Socket ends'));
      });

      this.socket.on('close', () => {
        this.emit('close');

        if (promise.isPending())
          reject(new Error('Socket closes'));
      });
    });
  }

  send(data, opts, callback) {
    if(opts &&opts instanceof Object) {
      this.ors = opts.ors || this.ors;
      this.sendTimeout = opts.sendTimeout || this.sendTimeout;
      this.waitfor = (opts.waitfor ? (opts.waitfor instanceof RegExp ? opts.waitfor : RegExp(opts.waitfor)): false);
    }

    data += this.ors;

    return new Promise((resolve, reject) => {
      if (this.socket.writable) {
        this.socket.write(data, () => {
          let response = '';
          this.state = 'standby';

          this.on('data', sendHandler);

          if(!this.waitfor || !opts) {
            setTimeout(() => {
              if(response === '') {
                this.removeListener('data', sendHandler);
                reject(new Error('response not received'));
                return;
              }

              this.removeListener('data', sendHandler);
              resolve(response);
            }, this.sendTimeout);
          }

          const self = this;

          function sendHandler(data) {
            response = data.toString();

            if(self.waitfor) {
              if(!self.waitfor.test(response)) return;

              self.removeListener('data', sendHandler);
              resolve(response)
            }
          }
        });
      }
    }).asCallback(callback);
  }

  destroy() {
    return new Promise(resolve => {
      this.socket.destroy();
      resolve();
    });
  }
}

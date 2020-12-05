const io = require('@pm2/io');                            // pm2 functions

io.init({
  transactions: true,
  http: true
});

/**
 * sends error message to PM2 io.app
 *
 * @param {String} err - the error message
 * @param {String} line - one line of the log file being parsed
 */
function ioError(err, line) {
  new Error(err, line.red);
  io.notifyError(new Error(`${err}: ${line}`), {
    custom: {
      error: err
    }
  });
}

module.exports = ioError;
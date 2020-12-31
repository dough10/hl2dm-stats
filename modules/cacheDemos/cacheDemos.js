/**
 * @module modules/cacheDemos
 * @requires path
 * @requires fs
 * @requires colors
 * @requires modules/printer
 * @requires modules/Timer
 * @exports cacheDemos
 */
const config = require('../loadConfig.js')();                     // config file location
const path = require('path');                             // merger file / url names
const fs = require('fs');                                 // work with the file system
const colors = require('colors');                         // colorize text
const print = require('../printer/printer.js');
const Timer = require('../Timer/Timer.js');


/**
 * returns created date of a file
 *
 * @param {String} file - path to the file
 * 
 * @returns {String} date file was modified
 * 
 * @example <caption>Example usage of createdDate() function.</caption>
 * var created = createdDate('somedemo.dem');
 * // console.log(created); = '2020-12-29T07:45:12.737Z'
 */
function createdDate(file) {
  const stats = fs.statSync(file);
  return stats.mtime;
}

/**
 * returns file size in bytes
 *
 * @param {String} filename - file path
 * 
 * @returns {Number} file size in bytes
 * 
 * @example <caption>Example usage of getFilesileInBytes() function.</caption>
 * var bytes = getFilesileInBytes('somedemo.dem');
 * // console.log(bytes); = 14567809
 */
function getFilesizeInBytes(filename) {
  var stats = fs.statSync(filename);
  var fileSizeInBytes = stats.size;
  return fileSizeInBytes;
}

/**
 * converts bytes to a readable string
 *
 * @param {Number} bytes - file size yay
 * 
 * @returns {String} readable file size
 * 
 * @example <caption>Example usage of bytesToSize() function.</caption>
 * var size = bytesToSize('somedemo.dem');
 * // console.log(size); = '13MB'
 */
function bytesToSize(bytes) {
   var sizes = [
     'Bytes',
     'KB',
     'MB',
     'GB',
     'TB'
   ];
   if (bytes === 0) {
     return '0 Byte';
   }
   var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
   return `${Math.round(bytes / Math.pow(1024, i), 2)} ${sizes[i]}`;
}

/**
 * returns array of demo files from game server dir
 * 
 * @returns {Promise<Arrray>} list of demo files
 * 
 * @example <caption>Example usage of getDemos() function.</caption>
 * getDemos().then(demos => {
 * // demos = [ list of demo files ];
 * });
 */
function getDemos() {
  return new Promise((resolve, reject) => {
    var demos = [];
    fs.readdir(config.gameServerDir, (err, files) => {
      if (err) {
        reject('Unable to scan directory', err);
        return;
      }
      for (var i = 0; i < files.length; i++) {
        if (path.extname(files[i]) === '.dem') {
          demos.push(files[i]);
        }
      }
      resolve(demos);
    });
  });
}

/**
 * caches list of avaliable demo files
 * 
 * @returns {Promise<Array>} list of files with readable date and file size
 * 
 * @example <caption>Example usage of cacheDemos() function.</caption>
 * cacheDemos().then(demoList => {
 * // demoList = [ list of demos with readable details ];
 * });
 */
function cacheDemos() {
  return new Promise((resolve, reject) => {
    var t = new Timer();
    var arr = [];
    getDemos().then(demos => {
      for (var i = 0; i < demos.length; i++) {
        if (i !== demos.length - 1) {
          var filepath = path.join(config.gameServerDir, demos[i]);
          arr.push([
            demos[i],
            bytesToSize(getFilesizeInBytes(filepath)),
            createdDate(filepath)
          ]);
        }
      }
      arr.reverse();
      resolve(arr);
      print(`demo file list cached ` + `${t.end()[2]} seconds`.cyan + ` to complete`);
    }).catch(reject);
  });
}

module.exports = cacheDemos;
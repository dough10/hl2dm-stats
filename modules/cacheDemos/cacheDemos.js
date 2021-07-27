/**
 * @fileOverview query demo files from drive to cache
 * @module modules/cacheDemos
 * @requires path
 * @requires fs
 * @requires colors
 * @requires modules/printer
 * @requires modules/Timer
 * @exports cacheDemos
 */
const config = require('../loadConfig/loadConfig.js')();                     // config file location
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
 * const created = createdDate('somedemo.dem');
 * // console.log(created); = '2020-12-29T07:45:12.737Z'
 */
function createdDate(filename) {
  const stats = fs.statSync(filename);
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
 * const bytes = getFilesileInBytes('somedemo.dem');
 * // console.log(bytes); = 14567809
 */
function getFilesizeInBytes(filename) {
  const stats = fs.statSync(filename);
  const fileSizeInBytes = stats.size;
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
 * const size = bytesToSize('somedemo.dem');
 * // console.log(size); = '13MB'
 */
function bytesToSize(bytes) {
   const sizes = [
     'Bytes',
     'KB',
     'MB',
     'GB',
     'TB'
   ];
   if (bytes === 0) {
     return '0 Byte';
   }
   const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
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
    const demos = [];
    fs.readdir(config.gameServerDir, (err, files) => {
      if (err) {
        reject('Unable to scan directory', err);
        return;
      }
      files.map(file => {
        if (path.extname(file) === '.dem') {
          demos.push(file);
        }
      });
      // for (let i = 0; i < files.length; i++) {
      //   if (path.extname(files[i]) === '.dem') {
      //     demos.push(files[i]);
      //   }
      // }
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
  return new Promise(async (resolve, reject) => {
    try {
      const t = new Timer();
      const arr = [];
      let demos = await getDemos();
      demos.map(demo => {
        const filepath = path.join(config.gameServerDir, demo);
        if (!fs.existsSync(filepath)) {
          return;
        }
        const size = getFilesizeInBytes(filepath);
        arr.push([
          demo,
          bytesToSize(size),
          createdDate(filepath)
        ]);
      });
      // for (let i = 0; i < demos.length; i++) {
      //   if (i !== demos.length - 1) {
      //     const filepath = path.join(config.gameServerDir, demos[i]);
      //     if (!fs.existsSync(filepath)) {
      //       return;
      //     }
      //     const size = getFilesizeInBytes(filepath);
      //     arr.push([
      //       demos[i],
      //       bytesToSize(size),
      //       createdDate(filepath)
      //     ]);
      //   }
      // }
      arr.reverse();
      resolve(arr);
      print(`demo file list cached ${t.endString().cyan} to complete`);
    } catch(e) {
      reject(e);
    }
  });
}

module.exports = cacheDemos;
#!/usr/bin/env node
var config = require(`../config-win.json`);                    // config file location
const path = require('path');                             // merger file / url names
const fs = require('fs');                                 // work with the file system
const colors = require('colors');                         // colorize text
const print = require(path.join(__dirname, 'printer.js'));
const Timer = require(path.join(__dirname, 'Timer.js'));


/**
 * returns created date of a file
 *
 * @param {String} file - path to the file
 */
function createdDate(file) {
  const stats = fs.statSync(file)
  return stats.mtime
}

/**
 * returns file size in bytes
 *
 * @param {String} filename - file path
 */
function getFilesizeInBytes(filename) {
  var stats = fs.statSync(filename)
  var fileSizeInBytes = stats["size"]
  return fileSizeInBytes
}

/**
 * makes bytes readable
 *
 * @param {Number} bytes - file size yay
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
 */
function cacheDemos() {
  return new Promise((resolve, reject) => {
    var t = new Timer();
    var arr = [];
    getDemos().then(demos => {
      for (var i = 0; i < demos.length; i++) {
        if (i !== demos.length - 1) {
          var filepath = path.join(config.gameServerDir, demos[i])
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
  })
}

module.exports = cacheDemos;
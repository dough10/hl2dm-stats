const path = require('path');
const fs = require('fs');
const config = require(`${__dirname}/config.json`);
const logFolder = path.join(config.gameServerDir, 'logs');


function cleanUp() {
  console.count('cleanup-function')
  console.log(`${new Date()} - Running file clean up`);
  var numFiles = 0;
  fs.readdir(logFolder, (err, files) => {
    numFiles = numFiles + files.length;
    files.forEach(console.log);
    fs.readdir(config.gameServerDir, (err, files) => {
      files.forEach(file => {
        numFiles = numFiles + files.length;
        if (path.extname(file) === '.dem') {
          console.log(file);
        }
      });
    });
  });
  console.log(`${new Date()} - Clean up complete. Removed ${numFiles} files`);
;}

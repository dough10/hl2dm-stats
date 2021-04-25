/**
 * incriment the version number of the package.json file
 * @module modules/incriment-version
 * @author Jimmy Doughten <https://github.com/dough10>
 * @requires fs
 * @requires version-incrimenter
 * @requires package.json
 * @example <caption>Example usage of incriment-version.js file.</caption>
 * node modules/incriment-version
 */

const fs = require('fs');                                 // work with the file system
var pack = require('../../package.json');
var newVersion = require('version-incrementer').increment(pack.version);
var updated = JSON.stringify({...pack, version: newVersion}, null, 2);

fs.writeFile('package.json', updated, e => {
  if (e) throw e;
  console.log(newVersion);
});
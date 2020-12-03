var uglifycss = require('uglifycss');
var uglified = uglifycss.processFiles(
  [ 'src/css/base.css'],
  { maxLineLen: 500, expandVars: true }
);
 
console.log(uglified);
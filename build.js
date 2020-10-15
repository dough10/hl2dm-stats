var fs = require( 'fs' );
var esperanto = require( 'esperanto' );
var uglifyJS = require('uglify-es');
var uglifycss = require('uglifycss');
var minify = require('html-minifier').minify;
var autoprefixer = require('autoprefixer');
var postcss = require('postcss');


const files = [
  'favicon.ico',
  'manifest.json',
  'sw.js',
  'images/avatar.png',
  'images/logo.png',
  'images/logo192.png',
  'images/logo152.png',
  'css/paper-ripple.min.css',
  'css/paper-ripple.css.min.map',
  'js/paper-ripple.min.js',
  'js/paper-ripple.js.min.map',
  'fonts/roboto-v15-latin-regular.woff2',
  'fonts/roboto-v15-latin-regular.woff',
  'fonts/roboto-v15-latin-regular.ttf',
  'fonts/roboto-v15-latin-regular.svg',
  'fonts/roboto-v15-latin-regular.eot',
  'fonts/halflife2.ttf',
  'fonts/hl2mp.ttf'
];


function copyFile(filePath) {
  fs.createReadStream(`./src/${filePath}`).pipe(fs.createWriteStream(`./html/${filePath}`));
}


function bundleImports() {
  return new Promise((resolve, reject) => {
    esperanto.bundle({
      base: 'src/js', // optional, defaults to current dir
      entry: 'main.js' // the '.js' is optional
    }).then(bundle => {
      var cjs = bundle.toCjs();
      resolve(cjs.code);
    });
  });
}


function minifyHTML() {
  return new Promise((resolve, reject) => {
    fs.readFile('./src/index.html', 'utf8', (err, html) => {
      var smallHTML = minify(html, {
        removeAttributeQuotes: true,
        collapseWhitespace: true,
        minifyCSS: true,
        minifyURLs: true,
        removeComments: true
      });
      fs.writeFile( './html/index.html', smallHTML, resolve);
    });
  });
}


function prefixCSS() {
  return new Promise((resolve, reject) => {
    fs.readFile('./src/css/base.css', 'utf8', (err, css) => {
      postcss([ autoprefixer ]).process(css).then(result => {
        result.warnings().forEach(warn => {
          console.warn(warn.toString());
          return;
        });
        fs.writeFile( './tmp/base.css', result.css, resolve);
      });
    });
  });
}


function uglifyJavaScript(js) {
  return new Promise((resolve, reject) => {
    var uglyCode = uglifyJS.minify(js);
    if (uglyCode.error) {
      console.log(uglyCode.error)
      return;
    }
    fs.writeFile( './html/js/main.js', uglyCode.code, resolve);
  });
}


function uglyCSS() {
  return new Promise((resolve, reject) => {
    var uglified = uglifycss.processFiles(
        [
          './tmp/base.css'
        ],
        {
          maxLineLen: 500,
          expandVars: true
        }
    );
    fs.writeFile( './html/css/base.css', uglified, _ => {
      fs.unlink('./tmp/base.css', (err) => {
        if (err) throw err;
        resolve();
      });
    });
  });
}

var imgFolder = './html/images';
var cssFolder = './html/css';
var fontFolder ='./html/fonts';
var jsFolder = './html/js';

if (!fs.existsSync(imgFolder)){
  fs.mkdirSync(imgFolder);
}
if (!fs.existsSync(cssFolder)){
  fs.mkdirSync(cssFolder);
}
if (!fs.existsSync(fontFolder)){
  fs.mkdirSync(fontFolder);
}
if (!fs.existsSync(jsFolder)){
  fs.mkdirSync(jsFolder);
}
bundleImports()
.then(uglifyJavaScript)
.then(minifyHTML)
.then(_ => files.forEach(copyFile));

var fs = require( 'fs' );
var esperanto = require( 'esperanto' );
var uglifyJS = require('uglify-es');
var minify = require('html-minifier').minify;
var uglifycss = require('uglifycss');


const files = [
  'favicon.ico',
  'manifest.json',
  'sw.js',
  'robots.txt',
  'images/avatar.webp',
  'images/logo.webp',
  'images/yeeeeeehawwwwwwmf.webp',
  'images/offline.webp',
  'images/maskable_icon.png',
  'images/404.png',
  'css/paper-ripple.min.css',
  'js/paper-ripple.min.js',
  'js/analytics.js',
  'js/page.min.js',
  // 'js/tv.js',
  // 'css/tv.css',
  // 'css/base.css',
  'fonts/roboto-v15-latin-regular.woff2',
  'fonts/roboto-v15-latin-regular.woff',
  'fonts/roboto-v15-latin-regular.ttf',
  'fonts/roboto-v15-latin-regular.svg',
  'fonts/roboto-v15-latin-regular.eot',
  'fonts/halflife2.ttf',
  'fonts/hl2mp.ttf',
  'fonts/csd.ttf',
  'hoedowntv.html',
  '404.html'
];


function copyFile(filePath) {
  fs.createReadStream(`./src/${filePath}`).pipe(fs.createWriteStream(`./html/${filePath}`));
}


function bundleImports() {
  return new Promise((resolve) => {
    esperanto.bundle({
      base: 'src/js', // optional, defaults to current dir
      entry: 'main.js' // the '.js' is optional
    }).then(bundle => {
      var cjs = bundle.toCjs();
      resolve(cjs.code);
    });
  });
}


function minifyHTML(file) {
  return new Promise((resolve) => {
    fs.readFile(`./src/${file}.html`, 'utf8', (err, html) => {
      if (err) {
        throw new Error(err);
      }
      var smallHTML = minify(html, {
        removeAttributeQuotes: true,
        useShortDoctype: true,
        removeRedundantAttributes: true,
        collapseWhitespace: true,
        removeOptionalTags: true,
        minifyCSS: true,
        minifyJS: true,
        minifyURLs: true,
        removeEmptyAttributes: true,
        removeComments: true
      });
      fs.writeFile( `./html/${file}.html`, smallHTML, resolve);
    });
  });
}


function uglifyJavaScript(js) {
  return new Promise((resolve) => {
    var uglyCode = uglifyJS.minify(js);
    if (uglyCode.error) {
      console.log(uglyCode.error)
      return;
    }
    fs.writeFile( './html/js/main.js', uglyCode.code, resolve);
  });
}

function uglyCss() {
  return new Promise((resolve) => {
    var uglified = uglifycss.processFiles(
      [ './src/css/base.css'],
      { maxLineLen: 50000, expandVars: true }
    );
    fs.writeFile( './html/css/base.css', uglified, resolve);
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
.then(uglyCss)
.then(_ => {
  minifyHTML('index').then(_ => {
    minifyHTML('hoedowntv').then(_ => {
      return;
    });
  })
})
.then(_ => files.forEach(copyFile));

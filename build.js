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


function bundleImports(file) {
  return new Promise((resolve) => {
    esperanto.bundle({
      base: 'src/js', // optional, defaults to current dir
      entry: `${file}.js` // the '.js' is optional
    }).then(bundle => {
      var cjs = bundle.toCjs();
      resolve([
        cjs.code, 
        file
      ]);
    });
  });
}


function minifyHTML(file) {
  return new Promise((resolve) => {
    fs.readFile(`./src/${file}.html`, 'utf8', (err, html) => {
      if (err) {
        reject(err);
        return;
      }
      
      var smallHTML = minify(html, {
        removeAttributeQuotes: true,
        useShortDoctype: true,
        removeRedundantAttributes: true,
        collapseWhitespace: true,
        removeOptionalTags: true,
        minifyCSS: true,
        minifyURLs: true,
        removeEmptyAttributes: true,
        removeComments: true
      });
      fs.writeFile( `./html/${file}.html`, smallHTML, resolve);
    });
  });
}


function uglifyJavaScript(arr) {
  return new Promise((resolve) => {
    var js = arr[0];
    var file = arr[1];
    var uglyCode = uglifyJS.minify(js);
    if (uglyCode.error) {
      reject(uglyCode.error)
      return;
    }
    fs.writeFile( `./html/js/${file}.js`, uglyCode.code, resolve);
  });
}


function bundleMainJs() {
  return new Promise((resolve, reject) => {
    bundleImports('main').then(uglifyJavaScript).then(resolve).catch(reject);
  });
}

function bundleTvJs() {
  return new Promise((resolve, reject) => {
    bundleImports('tv').then(uglifyJavaScript).then(resolve).catch(reject);
  });
}

function uglyCss(file) {
  return new Promise((resolve) => {
    var uglified = uglifycss.processFiles(
      [`./src/css/${file}.css`],
      {debug: true}
    );
    fs.writeFile( `./html/css/${file}.css`, uglified, resolve);
  });
}

function uglyBaseCss() {
  return new Promise((resolve) => {
    uglyCss('base').then(resolve);
  });
}

function uglyTvCss() {
  return new Promise((resolve) => {
    uglyCss('tv').then(resolve);
  });
}

function minifyIndex() {
  return new Promise((resolve, reject) => {
    minifyHTML('index').then(resolve).catch(reject);
  });
}

function minifyTV() {
  return new Promise((resolve, reject) => {
    minifyHTML('hoedowntv').then(resolve).catch(reject);
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

bundleMainJs()
.then(minifyIndex)
.then(uglyBaseCss)
.then(bundleTvJs)
.then(minifyTV)
.then(uglyTvCss)
.then(_ => {
  files.forEach(copyFile);
}).catch(e => {
  throw new Error(e);
});

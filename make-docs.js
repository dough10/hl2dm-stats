/**
 * @file processes javascript files creating markdown documentation from comments
 * @author Jimmy Doughten <https://github.com/dough10>
 * @requires fs
 * @requires jsdoc-to-markdown
 */
const jsdoc2md = require('jsdoc-to-markdown');
const fs = require('fs');
const pack = require('./package.json');


/** 
 * list of javascript files to process for docs without the file extension
 */
let files = [
  'make-docs',
  'api',
  'modules/auth/auth',
  'modules/Timer/Timer',
  'modules/data-model/data-model',
  'modules/cacheDemos/cacheDemos',
  'modules/fileCleanup/fileCleanup',
  'modules/lineScanner/lineScanner'
];


/**
 * save a file
 * @param {String} name filename
 * @param {String} md text content to be writen to file
 * 
 * @returns {Promise<String>} string confirming successful file save
 * 
 * @example <caption>Example usage of writeFile() function.</caption>
 * writeFile('awesomefile-doc.md', '# Awesome File').then(console.log);
 * // returns `awesomefile-doc.md saved to disk`
 * // awesomefile-doc.md contains '# Awesome File'
 */
function writeFile(name, md) {
  return new Promise((resolve, reject) => {
    fs.writeFile(name, md, e => {
      if (e) {
        throw e;
      }
      if (!fs.existsSync(name)){
        throw new Error('Error saving markdown!! aka. Shits broke.');
      }
      resolve(`${name} saved to disk`);
    });
  });
}

/**
 * renders a markdown document file from javascript comment
 * @param {String} filename name of the file being processed
 * 
 * @returns {Void} nothing
 * 
 * @example <caption>Example usage of renderDoc() function.</caption>
 * renderDoc('awesomefile.js');
 */
function renderDoc(filename) {
  if (!fs.existsSync(`${filename}.js`)){
    throw new Error(`${filename}.js does not exist`);
  }
  jsdoc2md.render({ 
    files: `${filename}.js`
  }).then(md => {
    writeFile(`${filename}-doc.md`, md).then(console.log);
  });
}

/**
 * output dependencies as a string
 * @returns {String} list of dependencies
 * 
 * @example <caption>Example usage of dependencies() function.</caption>
 * var dep = dependencies();
 */
function dependencies() {
  var dep = pack.dependencies;
  var output = '## Dependencies\n\n';
  for (var item in dep) {
    output = output + `- ${item}: ${dep[item]}\n`;
  }
  return output;
}

/**
 * output dev dependencies as a string
 * @returns {String} list of dev dependencies
 * 
 * @example <caption>Example usage of devDependencies() function.</caption>
 * var dev = devDependencies();
 */
function devDependencies() {
  var dep = pack.devDependencies;
  var output = '## Dev Dependencies\n\n';
  for (var item in dep) {
    output = output + `- ${item}: ${dep[item]}\n`;
  }
  return output;
}

/**
 * parse through files array and generate docs.
 * 
 * @returns {String} list of files
 * 
 * @example <caption>Example usage of processDocs() function.</caption>
 * var processedDocs = processDocs();
 */
function processDocs() {
  var output = '\n## Documentation\n\n';
  for (var i = 0; i < files.length; i++) {
    renderDoc(files[i]);
    var str = `- [${files[i]}-doc.md](${files[i]}-doc.md)\n`;
    if (i <= 1) {
      output = output + str;
    } else {
      output = output + `  ` + str;
    }
  }
  return output;
}

/**
 * call all functions and smash their outputs into 1 string
 * @returns {String} README.md contents
 * 
 * @example <caption>Example usage of hulkSmash() function.</caption>
 * writeFile('README.md', hulkSmash()).then(console.log);
 * // outputs 'README.md saved to disk'
 */
function hulkSmash() {
  const head = fs.readFileSync('./assets/head.txt').toString();
  const foot = fs.readFileSync('./assets/foot.txt').toString();
  return `# ${pack.name} V:${pack.version}\n` + head + processDocs() + '\n' + foot + '\n' + dependencies() + '\n' + devDependencies();
}

writeFile('README.md', hulkSmash()).then(console.log);


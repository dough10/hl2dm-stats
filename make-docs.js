/**
 * @fileOverview processes javascript files creating markdown documentation from comments. Edit head.txt and foot.txt to customize the generated [README.md](./README.md) file
 * @author Jimmy Doughten <https://github.com/dough10>
 * @exports make-doc.js
 * @requires fs
 * @requires jsdoc-to-markdown
 * @requires package.json
 */
const jsdoc2md = require('jsdoc-to-markdown');
const fs = require('fs');
const pack = require('./package.json');

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
 * renders a markdown document file from javascript comments
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
  }).then(md => writeFile(`${filename}-doc.md`, md).then(console.log));
}

/**
 * output dependencies from package.json to markdown unindexed list
 * @returns {String} list of dependencies
 * 
 * @example <caption>Example usage of dependencies() function.</caption>
 * let dep = dependencies();
 */
function dependencies() {
  let dep = pack.dependencies;
  let output = '## Dependencies\n\n';
  for (let item in dep) {
    output += `- ${item}: ${dep[item]}\n`;
  }
  if (!dep || Object.keys(dep).length === 0) {
    output += "No Dependencies\n";
  }
  return output;
}

/**
 * output dev dependencies from package.json to markdown unindexed list
 * @returns {String} list of dev dependencies
 * 
 * @example <caption>Example usage of devDependencies() function.</caption>
 * let dev = devDependencies();
 */
function devDependencies() {
  let dep = pack.devDependencies;
  let output = '## Dev Dependencies\n\n';
  for (let item in dep) {
    output += `- ${item}: ${dep[item]}\n`;
  }
  if (!dep) {
    output += "No Dev Dependencies\n";
  }
  return output;
}

/**
 * parse through files array and generate docs.
 * 
 * @returns {String} list of files
 * 
 * @example <caption>Example usage of processDocs() function.</caption>
 * let processedDocs = processDocs();
 */
function processDocs() {
  let files = require('./assets/files.js');
  let output = '\n## Documentation\n\n';
  for (let i = 0; i < files.length; i++) {
    renderDoc(files[i]);
    let str = `- [${files[i]}-doc.md](${files[i]}-doc.md)\n`;
    if (i <= 0) {
      output += str;
    } else {
      output += `  ${str}`;
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
  return `# ${pack.name} V:${pack.version}\n${head}\n${processDocs()}\n${foot}\n${dependencies()}\n${devDependencies()}`;
}

writeFile('README.md', hulkSmash()).then(console.log);


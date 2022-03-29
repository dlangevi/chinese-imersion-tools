import fs from 'fs';
import upath from 'upath';
import pug from 'pug';
import sh from 'shelljs';
import prettier from 'prettier';

export default function renderPug(filePath) {
  const destPath = filePath.replace(/src\/pug\/\pages/, 'dist').replace(
      /\.pug$/, '.html');
  const srcPath = upath.resolve('./src');

  console.log(`### INFO: Rendering ${filePath} to ${destPath}`);
  const html = pug.renderFile(filePath, {
    doctype: 'html',
    filename: filePath,
    basedir: srcPath,
  });

  const destPathDirname = upath.dirname(destPath);
  if (!sh.test('-e', destPathDirname)) {
    sh.mkdir('-p', destPathDirname);
  }

  const prettified = prettier.format(html, {
    printWidth: 1000,
    tabWidth: 4,
    singleQuote: true,
    proseWrap: 'preserve',
    endOfLine: 'lf',
    parser: 'html',
    htmlWhitespaceSensitivity: 'ignore',
  });

  fs.writeFileSync(destPath, prettified);
};

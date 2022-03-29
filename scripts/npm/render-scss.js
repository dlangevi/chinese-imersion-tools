import autoprefixer from 'autoprefixer';
import fs from 'fs';
import upath from 'upath';
import postcss from 'postcss';
import sass from 'sass';
import sh from 'shelljs';

const packageJSON = JSON.parse(fs.readFileSync('./package.json'));

const stylesPath = '../src/scss/styles.scss';
const destPath = upath.resolve('./dist/css/styles.css');

export default function renderSCSS() {

  const results = sass.renderSync({
    data: entryPoint,
    includePaths: [
      upath.resolve('./node_modules')
    ],
  });

  const destPathDirname = upath.dirname(destPath);
  if (!sh.test('-e', destPathDirname)) {
    sh.mkdir('-p', destPathDirname);
  }

  postcss([autoprefixer]).process(results.css, {
    from: 'styles.css',
    to: 'styles.css'
  }).then(result => {
    result.warnings().forEach(warn => {
      console.warn(warn.toString())
    })
    fs.writeFileSync(destPath, result.css.toString());
  })

};

const entryPoint = `/*!
* Start Bootstrap - ${packageJSON.title} v${packageJSON.version} (${packageJSON.homepage})
* Copyright 2013-${new Date().getFullYear()} ${packageJSON.author}
* Licensed under ${packageJSON.license} (https://github.com/StartBootstrap/${packageJSON.name}/blob/master/LICENSE)
*/
@import "${stylesPath}"
`

import sh from 'shelljs';
import upath from 'upath';

const destPath = upath.resolve('./dist');

sh.rm('-rf', `${destPath}/*`);


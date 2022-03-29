import fs from 'fs';
import upath from 'upath';
import sh from 'shelljs';

export default function renderAssets() {
    const sourcePath = upath.resolve('./src/assets');
    const destPath = upath.resolve('./dist/.');
    
    sh.cp('-R', sourcePath, destPath)
};

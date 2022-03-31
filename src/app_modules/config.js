import fs from 'fs';
const config = JSON.parse(fs.readFileSync('./config.json', 'UTF-8', 'r'));
export default config;

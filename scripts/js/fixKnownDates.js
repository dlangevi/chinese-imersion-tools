import fs from 'fs';
const config = JSON.parse(fs.readFileSync('./config.json', 'UTF-8', 'r'));
const known = JSON.parse(fs.readFileSync(
    config.knownWordsJson, 'UTF-8', 'r'));

function fixDateString(string) {
  let [year, month, day] = string.split('-');
  const d = new Date(year, month - 1, day);
  year = d.getFullYear();
  month = d.getMonth() + 1;
  if (month < 10) {
    month = `0${month}`
  }
  day = d.getDate()
  if (day < 10) {
    day = `0${day}`
  }
  return `${year}-${month}-${day}`;
}

Object.entries(known).forEach(([key, val]) => {
  let newDate = fixDateString(val.added);
  val.added = newDate;
});


fs.writeFileSync(config.knownWordsJson, JSON.stringify(known));

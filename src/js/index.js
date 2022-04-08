async function main() {
  // TODO load some info from anki + from our set of words to display here
  const stats = document.querySelector('#myStats');

  const response = await fetch('/stats');
  const data = await response.json();
  console.log(data);
  stats.innerHTML = `
  <p>Known words ${data.totalWords}</p>
  <p>Known chars ${data.totalChars}</p>
  `

}
main();

import {fetchUser} from './shared.js';

async function main() {
  // TODO load some info from anki + from our set of words to display here
  const stats = document.querySelector('#myStats');

  const response = await fetchUser('/stats');
  const data = await response.json();
  console.log(data);
  stats.innerHTML = `
  <p>Known words ${data.totalWords}</p>
  <p>Known chars ${data.totalChars}</p>
  `;

  // Area Chart Example
  const ctxArea = document.getElementById('myAreaChart');
  new Chart(ctxArea, {
    type: 'line',
    data: {
      labels: data.tableData.lables,
      datasets: [{
        label: 'Words',
        lineTension: 0.6,
        backgroundColor: 'rgba(2,117,216,0.2)',
        borderColor: 'rgba(2,117,216,1)',
        pointRadius: 0,
        pointBackgroundColor: 'rgba(2,117,216,1)',
        pointBorderColor: 'rgba(255,255,255,0.8)',
        pointHoverRadius: 0,
        pointHoverBackgroundColor: 'rgba(2,117,216,1)',
        pointHitRadius: 50,
        pointBorderWidth: 2,
        data: data.tableData.data,
      }],
    },
    options: {
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'month',
          },
        },
      },
      legend: {
        display: false,
      },
    },
  });
}
main();

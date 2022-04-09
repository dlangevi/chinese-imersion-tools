async function main() {
  // TODO load some info from anki + from our set of words to display here
  const stats = document.querySelector('#myStats');

  const response = await fetch('/stats');
  const data = await response.json();
  console.log(data);
  stats.innerHTML = `
  <p>Known words ${data.totalWords}</p>
  <p>Known chars ${data.totalChars}</p>
  `;

  // Set new default font family and font color to mimic Bootstrap's default styling
  Chart.defaults.global.defaultFontFamily = '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
  Chart.defaults.global.defaultFontColor = '#292b2c';

  // Area Chart Example
  const ctxArea = document.getElementById('myAreaChart');
  const myLineChartArea = new Chart(ctxArea, {
    type: 'line',
    data: {
      labels: data.tableData.lables,
      datasets: [{
        label: 'Words',
        lineTension: 0.3,
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
        xAxes: [{
          time: {
            unit: 'date',
          },
          gridLines: {
            display: false,
          },
          ticks: {
            maxTicksLimit: 100,
          },
        }],
        yAxes: [{
          ticks: {
            min: 0,
            max: 5000,
            maxTicksLimit: 10,
          },
          gridLines: {
            color: 'rgba(0, 0, 0, .125)',
          },
        }],
      },
      legend: {
        display: false,
      },
    },
  });
}
main();

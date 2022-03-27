async function post(endpoint, object) {
  let response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': "application/json;charset=utf-8"
    },
    body: JSON.stringify(object)
  });
  return response ;
}

function ObserveTable(divId, table) {
  var tableDiv = document.querySelector(divId);
  var resizeObserver = new ResizeObserver(entries => {
    for (let entry of entries) {
      console.log('resized')
      console.log(entry)
      let tableWidth = entry.contentBoxSize[0].inlineSize
      table.columnApi.sizeColumnsToFit(tableWidth - 10)
    }
  });
  resizeObserver.observe(tableDiv);

}

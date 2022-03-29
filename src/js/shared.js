async function post(endpoint, object) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify(object),
  });
  return response;
}

function observeTable(divId, table) {
  const tableDiv = document.querySelector(divId);
  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const tableWidth = entry.contentBoxSize[0].inlineSize;
      table.columnApi.sizeColumnsToFit(tableWidth - 10);
    }
  });
  resizeObserver.observe(tableDiv);
}

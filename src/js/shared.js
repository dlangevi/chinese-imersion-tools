export async function post(endpoint, object) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'authorization': 'dlangevi',
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify(object),
  });
  return response;
}

export async function fetchUser(endpoint) {
  const response = await fetch(endpoint, {
    headers: {
      'authorization': 'dlangevi',
    },
  });
  return response;
}


export function observeTable(divId, table) {
  const tableDiv = document.querySelector(divId);
  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const tableWidth = entry.contentBoxSize[0].inlineSize;
      table.columnApi.sizeColumnsToFit(tableWidth - 10);
    }
  });
  resizeObserver.observe(tableDiv);
}

export function migakuParse() {
  const migakuParse = document.querySelector('#migaku-toolbar-po-parse');
  if (migakuParse) {
    migakuParse.click();
  } else {
    console.log('Consider installing Migaku');
  }
}

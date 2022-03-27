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

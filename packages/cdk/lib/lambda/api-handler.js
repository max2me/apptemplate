exports.handler = async function(event) {
  const now = new Date();
  
  const response = {
    message: 'API response',
    timestamp: now.getTime(),
    date: now.toISOString(),
    formattedDate: now.toLocaleString(),
    path: event.path || '/',
    method: event.httpMethod || 'GET'
  };
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    },
    body: JSON.stringify(response)
  };
};

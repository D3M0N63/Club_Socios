const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json',
};

const ok = (data, statusCode = 200) => ({
  statusCode,
  headers: CORS,
  body: JSON.stringify(data),
});

const err = (statusCode, message) => ({
  statusCode,
  headers: CORS,
  body: JSON.stringify({ error: message }),
});

const cors = () => ({ statusCode: 204, headers: CORS, body: '' });

const body = (event) => {
  try { return JSON.parse(event.body || '{}'); }
  catch { return {}; }
};

module.exports = { ok, err, cors, body };

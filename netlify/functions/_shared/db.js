const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('NETLIFY_DATABASE_URL no está definida en las variables de entorno');
}

const sql = neon(DATABASE_URL);

module.exports = { sql };

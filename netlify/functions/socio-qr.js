const { sql } = require('./_shared/db');
const { ok, err, cors } = require('./_shared/response');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return cors();
  if (event.httpMethod !== 'GET') return err(405, 'Método no permitido');

  try {
    const { id } = event.queryStringParameters || {};
    if (!id) return err(400, 'id es requerido');

    const [socio] = await sql`
      SELECT id, numero_socio, nombre, apellido, categoria, estado, fecha_alta
      FROM socios
      WHERE id = ${id}
    `;

    if (!socio) return err(404, 'Socio no encontrado');

    return ok(socio);
  } catch (e) {
    console.error('socio-qr error:', e);
    return err(500, 'Error interno del servidor');
  }
};

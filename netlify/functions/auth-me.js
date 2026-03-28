const { sql } = require('./_shared/db');
const { verifyToken } = require('./_shared/auth');
const { ok, err, cors } = require('./_shared/response');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return cors();
  if (event.httpMethod !== 'GET') return err(405, 'Método no permitido');

  try {
    const decoded = verifyToken(event);

    const [user] = await sql`
      SELECT u.id, u.email, u.role,
             s.id AS socio_id, s.nombre, s.apellido, s.numero_socio, s.estado, s.categoria
      FROM users u
      LEFT JOIN socios s ON s.user_id = u.id
      WHERE u.id = ${decoded.sub}
    `;

    if (!user) return err(404, 'Usuario no encontrado');

    return ok({
      id: user.id,
      email: user.email,
      role: user.role,
      socioId: user.socio_id,
      nombre: user.nombre,
      apellido: user.apellido,
      numeroSocio: user.numero_socio,
      estado: user.estado,
      categoria: user.categoria,
    });
  } catch (e) {
    if (e.status) return err(e.status, e.message);
    console.error('auth-me error:', e);
    return err(500, 'Error interno del servidor');
  }
};

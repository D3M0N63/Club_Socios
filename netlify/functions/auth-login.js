const bcrypt = require('bcryptjs');
const { sql } = require('./_shared/db');
const { signToken } = require('./_shared/auth');
const { ok, err, cors, body } = require('./_shared/response');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return cors();
  if (event.httpMethod !== 'POST') return err(405, 'Método no permitido');

  try {
    const { email, password } = body(event);
    if (!email || !password) return err(400, 'Email y contraseña son requeridos');

    const [user] = await sql`
      SELECT u.id, u.email, u.password_hash, u.role,
             s.id AS socio_id, s.nombre, s.apellido, s.numero_socio, s.estado AS socio_estado
      FROM users u
      LEFT JOIN socios s ON s.user_id = u.id
      WHERE u.email = ${email.toLowerCase().trim()}
    `;

    if (!user) return err(401, 'Credenciales inválidas');

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return err(401, 'Credenciales inválidas');

    const token = signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      socioId: user.socio_id,
      nombre: user.nombre,
      apellido: user.apellido,
    });

    return ok({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        socioId: user.socio_id,
        nombre: user.nombre,
        apellido: user.apellido,
        numeroSocio: user.numero_socio,
        socioEstado: user.socio_estado,
      },
    });
  } catch (e) {
    if (e.status) return err(e.status, e.message);
    console.error('auth-login error:', e);
    return err(500, 'Error interno del servidor');
  }
};

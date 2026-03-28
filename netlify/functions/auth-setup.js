const bcrypt = require('bcryptjs');
const { sql } = require('./_shared/db');
const { ok, err, cors, body } = require('./_shared/response');

// Crea el primer admin — sólo funciona si no existe ningún admin en la BD
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return cors();
  if (event.httpMethod !== 'POST') return err(405, 'Método no permitido');

  try {
    const [adminCount] = await sql`SELECT COUNT(*)::int AS count FROM users WHERE role = 'admin'`;
    if (adminCount.count > 0) {
      return err(403, 'Ya existe un administrador. Usa el login normal.');
    }

    const { email, password, nombre, apellido } = body(event);
    if (!email || !password) return err(400, 'Email y contraseña son requeridos');
    if (password.length < 8) return err(400, 'La contraseña debe tener al menos 8 caracteres');

    const hash = await bcrypt.hash(password, 10);
    const [newUser] = await sql`
      INSERT INTO users (email, password_hash, role)
      VALUES (${email.toLowerCase().trim()}, ${hash}, 'admin')
      RETURNING id, email, role
    `;

    return ok({
      message: 'Administrador creado exitosamente. Ya puedes iniciar sesión.',
      user: { id: newUser.id, email: newUser.email, role: newUser.role },
    }, 201);
  } catch (e) {
    if (e.status) return err(e.status, e.message);
    if (e.code === '23505') return err(409, 'Ese email ya está registrado');
    console.error('auth-setup error:', e);
    return err(500, 'Error interno del servidor');
  }
};

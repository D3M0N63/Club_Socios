const bcrypt = require('bcryptjs');
const { sql } = require('./_shared/db');
const { verifyToken, requireAdmin } = require('./_shared/auth');
const { ok, err, cors, body } = require('./_shared/response');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return cors();

  try {
    const user = verifyToken(event);
    const { id } = event.queryStringParameters || {};
    const method = event.httpMethod;

    // GET /api/socios  — lista todos (admin) o solo el propio (socio)
    if (method === 'GET' && !id) {
      if (user.role === 'admin') {
        const rows = await sql`
          SELECT id, numero_socio, nombre, apellido, dni, email, telefono,
                 fecha_nacimiento, fecha_alta, estado, categoria, notas, created_at
          FROM socios
          ORDER BY apellido, nombre
        `;
        return ok(rows);
      } else {
        // Socio solo ve sus propios datos
        const [row] = await sql`
          SELECT id, numero_socio, nombre, apellido, dni, email, telefono,
                 fecha_nacimiento, fecha_alta, estado, categoria, notas
          FROM socios WHERE user_id = ${user.sub}
        `;
        return ok(row ? [row] : []);
      }
    }

    // GET /api/socios?id=xxx
    if (method === 'GET' && id) {
      const [row] = await sql`
        SELECT s.id, s.numero_socio, s.nombre, s.apellido, s.dni, s.email, s.telefono,
               s.fecha_nacimiento, s.fecha_alta, s.estado, s.categoria, s.notas,
               s.user_id, u.email AS user_email
        FROM socios s
        LEFT JOIN users u ON u.id = s.user_id
        WHERE s.id = ${id}
      `;
      if (!row) return err(404, 'Socio no encontrado');
      // Socio solo puede ver sus propios datos
      if (user.role !== 'admin' && row.user_id !== user.sub) return err(403, 'Acceso denegado');
      return ok(row);
    }

    // POST /api/socios — crear socio (admin only)
    if (method === 'POST') {
      requireAdmin(user);
      const { nombre, apellido, dni, email, telefono, fecha_nacimiento,
              fecha_alta, estado, categoria, notas,
              crear_usuario, password_usuario } = body(event);

      if (!nombre || !apellido) return err(400, 'Nombre y apellido son requeridos');

      let userId = null;

      if (crear_usuario && email) {
        if (!password_usuario || password_usuario.length < 8)
          return err(400, 'La contraseña debe tener al menos 8 caracteres');
        const hash = await bcrypt.hash(password_usuario, 10);
        const [newUser] = await sql`
          INSERT INTO users (email, password_hash, role)
          VALUES (${email.toLowerCase().trim()}, ${hash}, 'socio')
          RETURNING id
        `;
        userId = newUser.id;
      }

      const [socio] = await sql`
        INSERT INTO socios (user_id, nombre, apellido, dni, email, telefono,
                            fecha_nacimiento, fecha_alta, estado, categoria, notas)
        VALUES (
          ${userId},
          ${nombre}, ${apellido},
          ${dni || null}, ${email || null}, ${telefono || null},
          ${fecha_nacimiento || null},
          ${fecha_alta || null},
          ${estado || 'activo'},
          ${categoria || 'general'},
          ${notas || null}
        )
        RETURNING *
      `;
      return ok(socio, 201);
    }

    // PUT /api/socios?id=xxx — actualizar (admin) o datos propios (socio)
    if (method === 'PUT' && id) {
      const [existing] = await sql`SELECT * FROM socios WHERE id = ${id}`;
      if (!existing) return err(404, 'Socio no encontrado');
      if (user.role !== 'admin' && existing.user_id !== user.sub) return err(403, 'Acceso denegado');

      const { nombre, apellido, dni, email, telefono, fecha_nacimiento,
              fecha_alta, estado, categoria, notas } = body(event);

      const [updated] = await sql`
        UPDATE socios SET
          nombre           = COALESCE(${nombre || null},           nombre),
          apellido         = COALESCE(${apellido || null},         apellido),
          dni              = COALESCE(${dni || null},              dni),
          email            = COALESCE(${email || null},            email),
          telefono         = COALESCE(${telefono || null},         telefono),
          fecha_nacimiento = COALESCE(${fecha_nacimiento || null}, fecha_nacimiento),
          fecha_alta       = COALESCE(${fecha_alta || null},       fecha_alta),
          estado           = COALESCE(${user.role === 'admin' ? (estado || null) : null}, estado),
          categoria        = COALESCE(${user.role === 'admin' ? (categoria || null) : null}, categoria),
          notas            = COALESCE(${notas || null},            notas),
          updated_at       = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
      return ok(updated);
    }

    // DELETE /api/socios?id=xxx (admin only)
    if (method === 'DELETE' && id) {
      requireAdmin(user);
      await sql`DELETE FROM socios WHERE id = ${id}`;
      return ok({ message: 'Socio eliminado' });
    }

    return err(400, 'Solicitud inválida');
  } catch (e) {
    if (e.status) return err(e.status, e.message);
    if (e.code === '23505') return err(409, 'Ya existe un socio con ese DNI o email');
    console.error('socios error:', e);
    return err(500, 'Error interno del servidor');
  }
};

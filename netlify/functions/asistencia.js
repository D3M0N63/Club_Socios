const { sql } = require('./_shared/db');
const { verifyToken, requireAdmin } = require('./_shared/auth');
const { ok, err, cors, body } = require('./_shared/response');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return cors();

  try {
    const user = verifyToken(event);
    const { id, socio_id, evento_id, fecha } = event.queryStringParameters || {};
    const method = event.httpMethod;

    // GET /api/asistencia
    if (method === 'GET') {
      if (user.role === 'admin') {
        let rows;
        if (socio_id) {
          rows = await sql`
            SELECT a.*, s.nombre, s.apellido, s.numero_socio,
                   e.nombre AS evento_nombre
            FROM asistencia a
            JOIN socios s ON s.id = a.socio_id
            LEFT JOIN eventos e ON e.id = a.evento_id
            WHERE a.socio_id = ${socio_id}
            ORDER BY a.fecha DESC, a.hora_entrada DESC
          `;
        } else if (evento_id) {
          rows = await sql`
            SELECT a.*, s.nombre, s.apellido, s.numero_socio
            FROM asistencia a
            JOIN socios s ON s.id = a.socio_id
            WHERE a.evento_id = ${evento_id}
            ORDER BY s.apellido, s.nombre
          `;
        } else if (fecha) {
          rows = await sql`
            SELECT a.*, s.nombre, s.apellido, s.numero_socio,
                   e.nombre AS evento_nombre
            FROM asistencia a
            JOIN socios s ON s.id = a.socio_id
            LEFT JOIN eventos e ON e.id = a.evento_id
            WHERE a.fecha = ${fecha}
            ORDER BY a.hora_entrada DESC
          `;
        } else {
          // Última semana por defecto
          rows = await sql`
            SELECT a.*, s.nombre, s.apellido, s.numero_socio,
                   e.nombre AS evento_nombre
            FROM asistencia a
            JOIN socios s ON s.id = a.socio_id
            LEFT JOIN eventos e ON e.id = a.evento_id
            WHERE a.fecha >= CURRENT_DATE - INTERVAL '7 days'
            ORDER BY a.fecha DESC, a.hora_entrada DESC
            LIMIT 200
          `;
        }
        return ok(rows);
      } else {
        // Socio ve su propio historial
        const [socio] = await sql`SELECT id FROM socios WHERE user_id = ${user.sub}`;
        if (!socio) return ok([]);
        const rows = await sql`
          SELECT a.*, e.nombre AS evento_nombre
          FROM asistencia a
          LEFT JOIN eventos e ON e.id = a.evento_id
          WHERE a.socio_id = ${socio.id}
          ORDER BY a.fecha DESC
          LIMIT 50
        `;
        return ok(rows);
      }
    }

    // POST /api/asistencia — registrar entrada
    if (method === 'POST') {
      const { socio_id: sid, evento_id: eid, fecha: f, hora_entrada, notas } = body(event);

      // Socios solo pueden auto-registrarse
      if (user.role !== 'admin') {
        const [socio] = await sql`SELECT id FROM socios WHERE user_id = ${user.sub}`;
        if (!socio || socio.id !== sid) return err(403, 'Solo puedes registrar tu propia asistencia');
      }

      if (!sid) return err(400, 'socio_id es requerido');

      const [registro] = await sql`
        INSERT INTO asistencia (socio_id, evento_id, fecha, hora_entrada, registrado_por, notas)
        VALUES (
          ${sid},
          ${eid || null},
          ${f || null},
          ${hora_entrada || null},
          ${user.sub},
          ${notas || null}
        )
        RETURNING *
      `;
      return ok(registro, 201);
    }

    // DELETE /api/asistencia?id=xxx (admin only)
    if (method === 'DELETE' && id) {
      requireAdmin(user);
      await sql`DELETE FROM asistencia WHERE id = ${id}`;
      return ok({ message: 'Registro de asistencia eliminado' });
    }

    return err(400, 'Solicitud inválida');
  } catch (e) {
    if (e.status) return err(e.status, e.message);
    if (e.code === '23505') return err(409, 'Ya existe un registro de asistencia para ese socio en esa fecha y evento');
    console.error('asistencia error:', e);
    return err(500, 'Error interno del servidor');
  }
};

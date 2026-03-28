const { sql } = require('./_shared/db');
const { verifyToken, requireAdmin } = require('./_shared/auth');
const { ok, err, cors, body } = require('./_shared/response');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return cors();

  try {
    const user = verifyToken(event);
    const { id } = event.queryStringParameters || {};
    const method = event.httpMethod;

    // GET /api/eventos — todos pueden ver
    if (method === 'GET' && !id) {
      const rows = await sql`
        SELECT e.*,
               COUNT(a.id)::int AS inscriptos
        FROM eventos e
        LEFT JOIN asistencia a ON a.evento_id = e.id
        GROUP BY e.id
        ORDER BY e.fecha_inicio DESC
      `;
      return ok(rows);
    }

    // GET /api/eventos?id=xxx
    if (method === 'GET' && id) {
      const [evento] = await sql`
        SELECT e.*,
               COUNT(a.id)::int AS inscriptos
        FROM eventos e
        LEFT JOIN asistencia a ON a.evento_id = e.id
        WHERE e.id = ${id}
        GROUP BY e.id
      `;
      if (!evento) return err(404, 'Evento no encontrado');

      const asistentes = await sql`
        SELECT a.id, a.fecha, a.hora_entrada, a.notas,
               s.nombre, s.apellido, s.numero_socio
        FROM asistencia a
        JOIN socios s ON s.id = a.socio_id
        WHERE a.evento_id = ${id}
        ORDER BY s.apellido, s.nombre
      `;
      return ok({ ...evento, asistentes });
    }

    // POST /api/eventos (admin only)
    if (method === 'POST') {
      requireAdmin(user);
      const { nombre, descripcion, fecha_inicio, fecha_fin, lugar,
              tipo, capacidad_max, estado } = body(event);

      if (!nombre || !fecha_inicio) return err(400, 'Nombre y fecha de inicio son requeridos');

      const [evento] = await sql`
        INSERT INTO eventos (nombre, descripcion, fecha_inicio, fecha_fin, lugar,
                             tipo, capacidad_max, estado, creado_por)
        VALUES (
          ${nombre}, ${descripcion || null},
          ${fecha_inicio}, ${fecha_fin || null},
          ${lugar || null},
          ${tipo || 'social'},
          ${capacidad_max || null},
          ${estado || 'programado'},
          ${user.sub}
        )
        RETURNING *
      `;
      return ok(evento, 201);
    }

    // PUT /api/eventos?id=xxx (admin only)
    if (method === 'PUT' && id) {
      requireAdmin(user);
      const { nombre, descripcion, fecha_inicio, fecha_fin, lugar,
              tipo, capacidad_max, estado } = body(event);

      const [updated] = await sql`
        UPDATE eventos SET
          nombre        = COALESCE(${nombre || null},        nombre),
          descripcion   = COALESCE(${descripcion || null},   descripcion),
          fecha_inicio  = COALESCE(${fecha_inicio || null},  fecha_inicio),
          fecha_fin     = COALESCE(${fecha_fin || null},     fecha_fin),
          lugar         = COALESCE(${lugar || null},         lugar),
          tipo          = COALESCE(${tipo || null},          tipo),
          capacidad_max = COALESCE(${capacidad_max || null}, capacidad_max),
          estado        = COALESCE(${estado || null},        estado),
          updated_at    = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
      if (!updated) return err(404, 'Evento no encontrado');
      return ok(updated);
    }

    // DELETE /api/eventos?id=xxx (admin only)
    if (method === 'DELETE' && id) {
      requireAdmin(user);
      await sql`DELETE FROM eventos WHERE id = ${id}`;
      return ok({ message: 'Evento eliminado' });
    }

    return err(400, 'Solicitud inválida');
  } catch (e) {
    if (e.status) return err(e.status, e.message);
    console.error('eventos error:', e);
    return err(500, 'Error interno del servidor');
  }
};

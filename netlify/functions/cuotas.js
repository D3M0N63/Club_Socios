const { sql } = require('./_shared/db');
const { verifyToken, requireAdmin } = require('./_shared/auth');
const { ok, err, cors, body } = require('./_shared/response');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return cors();

  try {
    const user = verifyToken(event);
    const { id, socio_id, periodo, anio } = event.queryStringParameters || {};
    const method = event.httpMethod;

    // GET /api/cuotas
    if (method === 'GET') {
      if (user.role === 'admin') {
        if (socio_id) {
          // Cuotas de un socio específico
          const rows = await sql`
            SELECT c.*, s.nombre, s.apellido, s.numero_socio
            FROM cuotas c
            JOIN socios s ON s.id = c.socio_id
            WHERE c.socio_id = ${socio_id}
            ORDER BY c.periodo DESC
          `;
          return ok(rows);
        }
        if (periodo) {
          // Cuotas de un periodo (ej: '2026-03')
          const rows = await sql`
            SELECT c.*, s.nombre, s.apellido, s.numero_socio, s.estado AS socio_estado
            FROM cuotas c
            JOIN socios s ON s.id = c.socio_id
            WHERE c.periodo = ${periodo}
            ORDER BY s.apellido, s.nombre
          `;
          return ok(rows);
        }
        // Resumen: socios con cuotas del periodo actual o recientes
        const rows = await sql`
          SELECT c.*, s.nombre, s.apellido, s.numero_socio, s.estado AS socio_estado
          FROM cuotas c
          JOIN socios s ON s.id = c.socio_id
          ORDER BY c.periodo DESC, s.apellido
          LIMIT 200
        `;
        return ok(rows);
      } else {
        // Socio ve sus propias cuotas
        const [socio] = await sql`SELECT id FROM socios WHERE user_id = ${user.sub}`;
        if (!socio) return ok([]);
        const rows = await sql`
          SELECT * FROM cuotas WHERE socio_id = ${socio.id} ORDER BY periodo DESC
        `;
        return ok(rows);
      }
    }

    // POST /api/cuotas — registrar pago (admin only)
    if (method === 'POST') {
      requireAdmin(user);
      const { socio_id: sid, periodo: per, monto, fecha_pago,
              metodo_pago, comprobante, notas } = body(event);

      if (!sid || !per || !monto) return err(400, 'socio_id, periodo y monto son requeridos');
      if (!/^\d{4}-\d{2}$/.test(per)) return err(400, 'Formato de periodo inválido (esperado: YYYY-MM)');

      const [cuota] = await sql`
        INSERT INTO cuotas (socio_id, periodo, monto, fecha_pago, metodo_pago, comprobante, registrado_por, notas)
        VALUES (
          ${sid}, ${per}, ${monto},
          ${fecha_pago || null},
          ${metodo_pago || 'efectivo'},
          ${comprobante || null},
          ${user.sub},
          ${notas || null}
        )
        RETURNING *
      `;
      return ok(cuota, 201);
    }

    // PUT /api/cuotas?id=xxx — actualizar cuota (admin only)
    if (method === 'PUT' && id) {
      requireAdmin(user);
      const { monto, fecha_pago, metodo_pago, comprobante, notas } = body(event);
      const [updated] = await sql`
        UPDATE cuotas SET
          monto       = COALESCE(${monto || null},       monto),
          fecha_pago  = COALESCE(${fecha_pago || null},  fecha_pago),
          metodo_pago = COALESCE(${metodo_pago || null}, metodo_pago),
          comprobante = COALESCE(${comprobante || null}, comprobante),
          notas       = COALESCE(${notas || null},       notas)
        WHERE id = ${id}
        RETURNING *
      `;
      if (!updated) return err(404, 'Cuota no encontrada');
      return ok(updated);
    }

    // DELETE /api/cuotas?id=xxx (admin only)
    if (method === 'DELETE' && id) {
      requireAdmin(user);
      await sql`DELETE FROM cuotas WHERE id = ${id}`;
      return ok({ message: 'Cuota eliminada' });
    }

    return err(400, 'Solicitud inválida');
  } catch (e) {
    if (e.status) return err(e.status, e.message);
    if (e.code === '23505') return err(409, 'Ya existe una cuota para ese socio en ese periodo');
    console.error('cuotas error:', e);
    return err(500, 'Error interno del servidor');
  }
};

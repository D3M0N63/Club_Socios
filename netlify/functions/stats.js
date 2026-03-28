const { sql } = require('./_shared/db');
const { verifyToken, requireAdmin } = require('./_shared/auth');
const { ok, err, cors } = require('./_shared/response');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return cors();
  if (event.httpMethod !== 'GET') return err(405, 'Método no permitido');

  try {
    const user = verifyToken(event);
    requireAdmin(user);

    const periodoActual = new Date().toISOString().slice(0, 7); // 'YYYY-MM'

    const [
      sociosStats,
      cuotasStats,
      asistenciaMes,
      proximosEventos,
      cuotasMorosas,
      recaudacionUltimos6,
    ] = await Promise.all([
      // Total socios por estado
      sql`
        SELECT estado, COUNT(*)::int AS total
        FROM socios
        GROUP BY estado
        ORDER BY estado
      `,
      // Cuotas del mes actual
      sql`
        SELECT
          COUNT(*)::int                                      AS total_pagos,
          COALESCE(SUM(monto), 0)::numeric                  AS total_recaudado,
          COUNT(*) FILTER (WHERE metodo_pago = 'efectivo')::int   AS efectivo,
          COUNT(*) FILTER (WHERE metodo_pago = 'transferencia')::int AS transferencia,
          COUNT(*) FILTER (WHERE metodo_pago = 'tarjeta')::int    AS tarjeta
        FROM cuotas
        WHERE periodo = ${periodoActual}
      `,
      // Asistencias del mes actual
      sql`
        SELECT COUNT(*)::int AS total
        FROM asistencia
        WHERE DATE_TRUNC('month', fecha::timestamptz) = DATE_TRUNC('month', NOW())
      `,
      // Próximos 5 eventos
      sql`
        SELECT id, nombre, fecha_inicio, tipo, estado,
               (SELECT COUNT(*)::int FROM asistencia WHERE evento_id = e.id) AS inscriptos
        FROM eventos e
        WHERE fecha_inicio >= NOW()
          AND estado NOT IN ('cancelado', 'finalizado')
        ORDER BY fecha_inicio
        LIMIT 5
      `,
      // Socios sin cuota del mes actual (morosos)
      sql`
        SELECT COUNT(*)::int AS total
        FROM socios s
        WHERE s.estado = 'activo'
          AND NOT EXISTS (
            SELECT 1 FROM cuotas c
            WHERE c.socio_id = s.id AND c.periodo = ${periodoActual}
          )
      `,
      // Recaudación últimos 6 meses
      sql`
        SELECT periodo, SUM(monto)::numeric AS total
        FROM cuotas
        WHERE periodo >= TO_CHAR(NOW() - INTERVAL '5 months', 'YYYY-MM')
        GROUP BY periodo
        ORDER BY periodo
      `,
    ]);

    const totalSocios = sociosStats.reduce((acc, r) => acc + r.total, 0);
    const activosStat = sociosStats.find(r => r.estado === 'activo');

    return ok({
      socios: {
        total: totalSocios,
        porEstado: sociosStats,
        activos: activosStat?.total || 0,
      },
      cuotasMes: {
        ...cuotasStats[0],
        sinPagar: cuotasMorosas[0]?.total || 0,
        periodo: periodoActual,
      },
      asistenciaMes: asistenciaMes[0]?.total || 0,
      proximosEventos,
      recaudacionUltimos6,
    });
  } catch (e) {
    if (e.status) return err(e.status, e.message);
    console.error('stats error:', e);
    return err(500, 'Error interno del servidor');
  }
};

import { useQuery } from '@tanstack/react-query';
import { get } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Users, CreditCard, CalendarCheck, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import Badge from '../components/ui/Badge';

function StatCard({ icon: Icon, label, value, sub, color = 'blue' }) {
  const colors = {
    blue:   'bg-blue-50 text-blue-700',
    green:  'bg-green-50 text-green-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    red:    'bg-red-50 text-red-700',
  };
  return (
    <div className="card flex items-start gap-4">
      <div className={`p-3 rounded-xl ${colors[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: () => get('/stats'),
  });

  if (isLoading) return <div className="text-gray-400 text-sm">Cargando estadísticas...</div>;
  if (!data) return null;

  const chartData = data.recaudacionUltimos6.map(r => ({
    mes: r.periodo,
    total: Number(r.total),
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Socios activos" value={data.socios.activos}
          sub={`${data.socios.total} en total`} color="blue" />
        <StatCard icon={CreditCard} label="Recaudado este mes" value={`$${Number(data.cuotasMes.total_recaudado).toLocaleString('es-AR')}`}
          sub={`${data.cuotasMes.total_pagos} pagos registrados`} color="green" />
        <StatCard icon={AlertCircle} label="Sin cuota este mes" value={data.cuotasMes.sinPagar}
          sub="Socios activos sin pago" color="red" />
        <StatCard icon={CalendarCheck} label="Asistencias este mes" value={data.asistenciaMes}
          color="yellow" />
      </div>

      {/* Chart + Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Recaudación últimos 6 meses
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={v => `$${v.toLocaleString('es-AR')}`} />
              <Bar dataKey="total" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Próximos eventos
          </h2>
          {data.proximosEventos.length === 0 ? (
            <p className="text-sm text-gray-400">No hay eventos próximos</p>
          ) : (
            <ul className="space-y-3">
              {data.proximosEventos.map(ev => (
                <li key={ev.id} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex flex-col items-center justify-center text-blue-700 shrink-0">
                    <span className="text-xs font-bold leading-none">
                      {format(parseISO(ev.fecha_inicio), 'dd')}
                    </span>
                    <span className="text-xs uppercase leading-none">
                      {format(parseISO(ev.fecha_inicio), 'MMM', { locale: es })}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{ev.nombre}</p>
                    <Badge value={ev.tipo} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Socios por estado */}
      <div className="card">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Socios por estado</h2>
        <div className="flex flex-wrap gap-4">
          {data.socios.porEstado.map(s => (
            <div key={s.estado} className="flex items-center gap-2">
              <Badge value={s.estado} />
              <span className="text-gray-700 font-semibold">{s.total}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SocioDashboard() {
  const { user } = useAuth();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        Bienvenido, {user?.nombre} {user?.apellido}
      </h1>
      <div className="card">
        <p className="text-gray-500 text-sm">
          Usá el menú lateral para ver tus cuotas, asistencia y eventos del club.
        </p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { isAdmin } = useAuth();
  return isAdmin ? <AdminDashboard /> : <SocioDashboard />;
}

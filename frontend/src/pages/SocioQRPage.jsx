import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Loader2, UserCircle, CalendarCheck, CheckCircle2, Shield } from 'lucide-react';
import { get, post } from '../api/client';
import { getEventos } from '../api/eventos';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/ui/Badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function SocioQRPage() {
  const { id } = useParams();
  const { token, isAdmin } = useAuth();

  const [eventoId, setEventoId] = useState('');
  const [registrado, setRegistrado] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { data: socio, isLoading, isError } = useQuery({
    queryKey: ['socio-qr', id],
    queryFn: () => get('/socio-qr', { id }),
  });

  const { data: eventos = [] } = useQuery({
    queryKey: ['eventos'],
    queryFn: getEventos,
    enabled: !!isAdmin,
  });

  const eventosActivos = eventos.filter(e =>
    e.estado === 'programado' || e.estado === 'en_curso'
  );

  const registrarMut = useMutation({
    mutationFn: () => post('/asistencia', {
      socio_id: id,
      evento_id: eventoId || null,
      fecha: format(new Date(), 'yyyy-MM-dd'),
    }),
    onSuccess: () => setRegistrado(true),
    onError: (e) => setErrorMsg(e.message),
  });

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  );

  if (isError || !socio) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <UserCircle className="w-16 h-16 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">Socio no encontrado</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">

        {/* Header */}
        <div className="bg-blue-700 px-6 py-5 text-white text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-200 mb-1">
            Club Deportivo y Social
          </p>
          <h1 className="text-lg font-bold">Saltos del Guairá</h1>
        </div>

        {/* Datos del socio */}
        <div className="px-6 py-6 text-center border-b border-gray-100">
          <div className="w-16 h-16 rounded-full bg-blue-700 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
            {socio.nombre[0]}{socio.apellido[0]}
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            {socio.nombre} {socio.apellido}
          </h2>
          <p className="font-mono text-blue-600 font-semibold mt-1">{socio.numero_socio}</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Badge value={socio.estado} />
            <span className="text-xs text-gray-400 capitalize">{socio.categoria}</span>
          </div>
        </div>

        {/* Panel de registro — solo admin */}
        <div className="px-6 py-5">
          {!token && (
            <div className="flex items-center gap-2 text-xs text-gray-400 justify-center py-2">
              <Shield className="w-3.5 h-3.5" />
              Solo administradores pueden registrar asistencia
            </div>
          )}

          {token && isAdmin && !registrado && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-blue-600" />
                Registrar asistencia
              </p>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Evento (opcional)</label>
                <select
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={eventoId}
                  onChange={e => setEventoId(e.target.value)}
                >
                  <option value="">— Acceso general —</option>
                  {eventosActivos.map(e => (
                    <option key={e.id} value={e.id}>{e.nombre}</option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-gray-400">
                Fecha: {format(new Date(), "dd 'de' MMMM yyyy", { locale: es })}
              </p>
              {errorMsg && <p className="text-xs text-red-500">{errorMsg}</p>}
              <button
                onClick={() => registrarMut.mutate()}
                disabled={registrarMut.isPending}
                className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                {registrarMut.isPending
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <CalendarCheck className="w-4 h-4" />
                }
                Confirmar asistencia
              </button>
            </div>
          )}

          {token && isAdmin && registrado && (
            <div className="text-center py-2">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <p className="font-semibold text-gray-800">¡Asistencia registrada!</p>
              <p className="text-xs text-gray-400 mt-1">
                {format(new Date(), "dd/MM/yyyy HH:mm")}
              </p>
              <button
                onClick={() => { setRegistrado(false); setErrorMsg(''); }}
                className="mt-3 text-xs text-blue-600 hover:underline"
              >
                Registrar otra asistencia
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

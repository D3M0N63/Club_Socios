import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Loader2, MapPin, Clock, Users } from 'lucide-react';
import { getEvento } from '../../api/eventos';
import Badge from '../../components/ui/Badge';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export default function EventoDetail() {
  const { id } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ['evento', id],
    queryFn: () => getEvento(id),
  });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>;
  if (!data) return <div className="text-gray-500">Evento no encontrado</div>;

  const { asistentes = [], ...evento } = data;
  const fecha = parseISO(evento.fecha_inicio);

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link to="/eventos" className="btn-ghost py-1.5 px-2"><ArrowLeft className="w-4 h-4" /></Link>
        <h1 className="text-2xl font-bold text-gray-900 flex-1">{evento.nombre}</h1>
      </div>

      <div className="card space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge value={evento.tipo} />
          <Badge value={evento.estado} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
            <div>
              <p className="text-gray-500 text-xs">Inicio</p>
              <p className="font-medium">{format(fecha, "dd 'de' MMMM 'de' yyyy, HH:mm 'hs'", { locale: es })}</p>
            </div>
          </div>
          {evento.lugar && (
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-gray-500 text-xs">Lugar</p>
                <p className="font-medium">{evento.lugar}</p>
              </div>
            </div>
          )}
          <div className="flex items-start gap-2">
            <Users className="w-4 h-4 text-gray-400 mt-0.5" />
            <div>
              <p className="text-gray-500 text-xs">Inscriptos</p>
              <p className="font-medium">
                {asistentes.length}
                {evento.capacidad_max ? ` / ${evento.capacidad_max}` : ''}
              </p>
            </div>
          </div>
        </div>

        {evento.descripcion && <p className="text-gray-600 text-sm leading-relaxed">{evento.descripcion}</p>}
      </div>

      {asistentes.length > 0 && (
        <div className="card p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 font-semibold text-gray-900 text-sm">
            Lista de asistentes ({asistentes.length})
          </div>
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-medium text-gray-600">Nro</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Nombre</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Hora entrada</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {asistentes.map(a => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-blue-600 text-xs">{a.numero_socio}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{a.apellido}, {a.nombre}</td>
                  <td className="px-4 py-3 text-gray-400 hidden sm:table-cell">{a.hora_entrada || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

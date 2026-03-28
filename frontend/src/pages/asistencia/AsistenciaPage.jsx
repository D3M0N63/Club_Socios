import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, UserCheck, Loader2, Trash2 } from 'lucide-react';
import { getAsistencia, createAsistencia, deleteAsistencia } from '../../api/asistencia';
import { getSocios } from '../../api/socios';
import { getEventos } from '../../api/eventos';
import { useAuth } from '../../context/AuthContext';
import { format, parseISO } from 'date-fns';

const hoy = new Date().toISOString().slice(0, 10);

export default function AsistenciaPage() {
  const { isAdmin, user } = useAuth();
  const qc = useQueryClient();

  const [fecha, setFecha] = useState(hoy);
  const [searchSocio, setSearchSocio] = useState('');
  const [selectedSocio, setSelectedSocio] = useState(null);
  const [selectedEvento, setSelectedEvento] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { data: registros = [], isLoading } = useQuery({
    queryKey: ['asistencia', fecha],
    queryFn: () => getAsistencia({ fecha }),
    enabled: isAdmin,
  });

  const { data: socios = [] } = useQuery({
    queryKey: ['socios'],
    queryFn: getSocios,
    enabled: isAdmin,
  });

  const { data: eventos = [] } = useQuery({
    queryKey: ['eventos'],
    queryFn: getEventos,
  });

  const createMut = useMutation({
    mutationFn: createAsistencia,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['asistencia'] });
      setSelectedSocio(null);
      setSearchSocio('');
      setError('');
      setSuccess('Asistencia registrada');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (e) => { setError(e.message); setSuccess(''); },
  });

  const deleteMut = useMutation({
    mutationFn: deleteAsistencia,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['asistencia'] }),
  });

  const sociosFiltrados = socios.filter(s => {
    const q = searchSocio.toLowerCase();
    return q && (`${s.nombre} ${s.apellido} ${s.numero_socio}`.toLowerCase().includes(q));
  }).slice(0, 6);

  const registrar = () => {
    if (!selectedSocio && isAdmin) { setError('Selecciona un socio'); return; }
    const socio_id = isAdmin ? selectedSocio?.id : user?.socioId;
    if (!socio_id) { setError('No se pudo identificar el socio'); return; }
    createMut.mutate({
      socio_id,
      evento_id: selectedEvento || null,
      fecha,
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900">Asistencia</h1>

      {/* Check-in form */}
      <div className="card space-y-4">
        <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-blue-600" /> Registrar entrada
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Fecha</label>
            <input type="date" className="input" value={fecha} onChange={e => setFecha(e.target.value)} />
          </div>
          <div>
            <label className="label">Evento (opcional)</label>
            <select className="input" value={selectedEvento} onChange={e => setSelectedEvento(e.target.value)}>
              <option value="">— Entrada a instalaciones —</option>
              {eventos.filter(e => e.estado !== 'cancelado').map(ev => (
                <option key={ev.id} value={ev.id}>{ev.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        {isAdmin && (
          <div className="relative">
            <label className="label">Buscar socio *</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                className="input pl-10"
                placeholder="Nombre, apellido o número de socio..."
                value={selectedSocio ? `${selectedSocio.apellido}, ${selectedSocio.nombre} (${selectedSocio.numero_socio})` : searchSocio}
                onChange={e => { setSearchSocio(e.target.value); setSelectedSocio(null); }}
                onFocus={() => { if (selectedSocio) { setSearchSocio(''); setSelectedSocio(null); } }}
              />
            </div>
            {sociosFiltrados.length > 0 && !selectedSocio && (
              <ul className="absolute z-10 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                {sociosFiltrados.map(s => (
                  <li key={s.id}>
                    <button
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 flex justify-between"
                      onClick={() => { setSelectedSocio(s); setSearchSocio(''); }}
                    >
                      <span className="font-medium">{s.apellido}, {s.nombre}</span>
                      <span className="text-gray-400 font-mono text-xs">{s.numero_socio}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {error && <div className="text-sm text-red-600">{error}</div>}
        {success && <div className="text-sm text-green-600">{success}</div>}

        <button
          className="btn-primary"
          onClick={registrar}
          disabled={createMut.isPending}
        >
          {createMut.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          Registrar asistencia
        </button>
      </div>

      {/* Lista del día (admin) */}
      {isAdmin && (
        <div className="card p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-800">
              Registros del {format(parseISO(fecha), 'dd/MM/yyyy')}
              <span className="ml-2 text-sm font-normal text-gray-400">({registros.length})</span>
            </h2>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-blue-600" /></div>
          ) : registros.length === 0 ? (
            <p className="text-center py-8 text-sm text-gray-400">Sin registros para esta fecha</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Socio</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Evento</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Hora</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {registros.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-900">{r.apellido}, {r.nombre}</span>
                      <span className="ml-2 font-mono text-xs text-blue-600">{r.numero_socio}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{r.evento_nombre || '— Instalaciones —'}</td>
                    <td className="px-4 py-3 text-gray-400">{r.hora_entrada || '—'}</td>
                    <td className="px-4 py-3">
                      <button
                        className="text-red-400 hover:text-red-600 p-1"
                        onClick={() => deleteMut.mutate(r.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

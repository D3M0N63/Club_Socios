import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, UserCircle, QrCode } from 'lucide-react';
import SocioQRCode from '../components/SocioQRCode';
import { getSocios, updateSocio } from '../api/socios';
import { getCuotasSocio } from '../api/cuotas';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/ui/Badge';
import { format, parseISO } from 'date-fns';

const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

export default function MiPerfil() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: socios = [], isLoading } = useQuery({
    queryKey: ['socios'],
    queryFn: getSocios,
  });

  const socio = socios[0]; // el endpoint filtra por user_id para socios

  const { data: cuotas = [] } = useQuery({
    queryKey: ['cuotas', socio?.id],
    queryFn: () => getCuotasSocio(socio.id),
    enabled: !!socio?.id,
  });

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [error, setError] = useState('');

  const startEdit = () => {
    setForm({
      telefono: socio?.telefono || '',
      email: socio?.email || '',
      direccion: socio?.direccion || '',
    });
    setEditMode(true);
  };

  const updateMut = useMutation({
    mutationFn: (data) => updateSocio(socio.id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['socios'] }); setEditMode(false); },
    onError: (e) => setError(e.message),
  });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>;

  if (!socio) return (
    <div className="card text-center py-12">
      <UserCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <p className="text-gray-500">Tu cuenta no tiene un socio asociado. Contacta al administrador.</p>
    </div>
  );

  const anioActual = new Date().getFullYear();
  const cuotasPorPeriodo = Object.fromEntries(cuotas.map(c => [c.periodo, c]));

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>

      {/* Info personal */}
      <div className="card">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-700 flex items-center justify-center text-white text-xl font-bold">
              {socio.nombre[0]}{socio.apellido[0]}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{socio.nombre} {socio.apellido}</h2>
              <p className="text-blue-600 font-mono font-medium">{socio.numero_socio}</p>
            </div>
          </div>
          <Badge value={socio.estado} />
        </div>

        {!editMode ? (
          <div className="grid grid-cols-2 gap-3 text-sm mb-4">
            {[
              ['DNI', socio.dni || '—'],
              ['Categoría', socio.categoria],
              ['Email', socio.email || '—'],
              ['Teléfono', socio.telefono || '—'],
              ['Fecha de alta', socio.fecha_alta ? format(parseISO(socio.fecha_alta), 'dd/MM/yyyy') : '—'],
            ].map(([k, v]) => (
              <div key={k}>
                <p className="text-gray-400 text-xs">{k}</p>
                <p className="text-gray-800 font-medium capitalize">{v}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3 mb-4">
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} />
            </div>
            <div>
              <label className="label">Teléfono</label>
              <input className="input" type="tel" value={form.telefono} onChange={e => setForm(f => ({...f, telefono: e.target.value}))} />
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
          </div>
        )}

        <div className="flex gap-3">
          {!editMode ? (
            <button className="btn-secondary" onClick={startEdit}><Loader2 className="w-0" />Editar datos de contacto</button>
          ) : (
            <>
              <button className="btn-secondary" onClick={() => setEditMode(false)}>Cancelar</button>
              <button className="btn-primary" onClick={() => updateMut.mutate(form)} disabled={updateMut.isPending}>
                {updateMut.isPending && <Loader2 className="w-4 h-4 animate-spin" />} Guardar
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mi QR */}
      <div className="card">
        <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <QrCode className="w-4 h-4" /> Mi código QR
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Mostrá este código para registrar tu asistencia en eventos.
        </p>
        <SocioQRCode
          socioId={socio.id}
          numeroSocio={socio.numero_socio}
          nombre={socio.nombre}
          apellido={socio.apellido}
        />
      </div>

      {/* Mis cuotas */}
      <div className="card">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Mis cuotas — {anioActual}</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {MESES.map((mes, i) => {
            const periodo = `${anioActual}-${String(i + 1).padStart(2, '0')}`;
            const cuota = cuotasPorPeriodo[periodo];
            return (
              <div key={periodo} className={`rounded-lg p-3 text-center text-xs border ${
                cuota ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-400'
              }`}>
                <div className="font-semibold">{mes}</div>
                {cuota
                  ? <div className="font-bold text-sm">${Number(cuota.monto).toLocaleString('es-AR')}</div>
                  : <div className="text-gray-300 mt-1">—</div>
                }
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

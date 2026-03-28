import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Pencil, CreditCard, CalendarCheck, Loader2 } from 'lucide-react';
import { getSocio } from '../../api/socios';
import { getCuotasSocio, createCuota, deleteCuota } from '../../api/cuotas';
import { getAsistencia } from '../../api/asistencia';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import SocioForm from './SocioForm';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

function CuotaGrid({ socioId }) {
  const qc = useQueryClient();
  const anioActual = new Date().getFullYear();
  const [anio, setAnio] = useState(anioActual);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ mes: 1, monto: '', metodo_pago: 'efectivo', comprobante: '' });
  const [error, setError] = useState('');

  const { data: cuotas = [] } = useQuery({
    queryKey: ['cuotas', socioId],
    queryFn: () => getCuotasSocio(socioId),
  });

  const cuotasPorPeriodo = Object.fromEntries(cuotas.map(c => [c.periodo, c]));

  const createMut = useMutation({
    mutationFn: createCuota,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['cuotas', socioId] }); setModalOpen(false); setError(''); },
    onError: (e) => setError(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: deleteCuota,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cuotas', socioId] }),
  });

  const handlePagar = () => {
    const periodo = `${anio}-${String(form.mes).padStart(2, '0')}`;
    createMut.mutate({ socio_id: socioId, periodo, monto: form.monto, metodo_pago: form.metodo_pago, comprobante: form.comprobante });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button className="btn-ghost py-1 px-2" onClick={() => setAnio(a => a - 1)}>‹</button>
          <span className="font-semibold text-gray-800">{anio}</span>
          <button className="btn-ghost py-1 px-2" onClick={() => setAnio(a => a + 1)}>›</button>
        </div>
        <button className="btn-primary text-xs" onClick={() => { setForm(f => ({...f, mes: new Date().getMonth()+1})); setModalOpen(true); }}>
          <CreditCard className="w-3.5 h-3.5" /> Registrar pago
        </button>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {MESES.map((mes, i) => {
          const periodo = `${anio}-${String(i + 1).padStart(2, '0')}`;
          const cuota = cuotasPorPeriodo[periodo];
          return (
            <div key={periodo} className={`rounded-lg p-3 text-center border text-xs ${
              cuota
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-gray-50 border-gray-200 text-gray-400'
            }`}>
              <div className="font-semibold">{mes}</div>
              {cuota ? (
                <>
                  <div className="font-bold text-sm">${Number(cuota.monto).toLocaleString('es-AR')}</div>
                  <div className="capitalize">{cuota.metodo_pago}</div>
                  <button className="text-red-400 hover:text-red-600 text-xs mt-1"
                    onClick={() => deleteMut.mutate(cuota.id)}>✕</button>
                </>
              ) : (
                <div className="text-gray-300 mt-1">—</div>
              )}
            </div>
          );
        })}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Registrar pago de cuota" size="sm">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Mes</label>
              <select className="input" value={form.mes} onChange={e => setForm(f => ({...f, mes: Number(e.target.value)}))}>
                {MESES.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Año</label>
              <input className="input" type="number" value={anio} readOnly />
            </div>
          </div>
          <div>
            <label className="label">Monto ($) *</label>
            <input className="input" type="number" step="0.01" value={form.monto}
              onChange={e => setForm(f => ({...f, monto: e.target.value}))} required />
          </div>
          <div>
            <label className="label">Método de pago</label>
            <select className="input" value={form.metodo_pago} onChange={e => setForm(f => ({...f, metodo_pago: e.target.value}))}>
              {['efectivo','transferencia','tarjeta','otro'].map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Comprobante</label>
            <input className="input" value={form.comprobante} onChange={e => setForm(f => ({...f, comprobante: e.target.value}))} />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <div className="flex justify-end gap-3">
            <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button className="btn-primary" onClick={handlePagar} disabled={!form.monto || createMut.isPending}>
              {createMut.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
              Registrar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function SocioDetail() {
  const { id } = useParams();
  const [editOpen, setEditOpen] = useState(false);

  const { data: socio, isLoading } = useQuery({
    queryKey: ['socio', id],
    queryFn: () => getSocio(id),
  });

  const { data: asistencia = [] } = useQuery({
    queryKey: ['asistencia', id],
    queryFn: () => getAsistencia({ socio_id: id }),
  });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>;
  if (!socio) return <div className="text-gray-500">Socio no encontrado</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link to="/socios" className="btn-ghost py-1.5 px-2">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 flex-1">
          {socio.apellido}, {socio.nombre}
          <span className="ml-3 text-base font-mono text-blue-600">{socio.numero_socio}</span>
        </h1>
        <button className="btn-secondary" onClick={() => setEditOpen(true)}>
          <Pencil className="w-4 h-4" /> Editar
        </button>
      </div>

      {/* Info */}
      <div className="card">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          {[
            ['Estado', <Badge value={socio.estado} />],
            ['Categoría', <span className="capitalize">{socio.categoria}</span>],
            ['DNI', socio.dni || '—'],
            ['Email', socio.email || '—'],
            ['Teléfono', socio.telefono || '—'],
            ['Fecha de alta', socio.fecha_alta ? format(parseISO(socio.fecha_alta), 'dd/MM/yyyy') : '—'],
            ['Fecha de nacimiento', socio.fecha_nacimiento ? format(parseISO(socio.fecha_nacimiento), 'dd/MM/yyyy') : '—'],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-gray-400 text-xs mb-0.5">{label}</p>
              <p className="text-gray-800 font-medium">{value}</p>
            </div>
          ))}
        </div>
        {socio.notas && <p className="mt-4 text-sm text-gray-500 border-t pt-4">{socio.notas}</p>}
      </div>

      {/* Cuotas */}
      <div className="card">
        <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CreditCard className="w-4 h-4" /> Cuotas
        </h2>
        <CuotaGrid socioId={id} />
      </div>

      {/* Asistencia reciente */}
      <div className="card">
        <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CalendarCheck className="w-4 h-4" /> Asistencia reciente
        </h2>
        {asistencia.length === 0 ? (
          <p className="text-sm text-gray-400">Sin registros de asistencia</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {asistencia.slice(0, 10).map(a => (
              <li key={a.id} className="py-2 flex justify-between text-sm">
                <span className="text-gray-700">
                  {a.evento_nombre || 'Instalaciones'}
                </span>
                <span className="text-gray-400">
                  {format(parseISO(a.fecha), 'dd/MM/yyyy')}
                  {a.hora_entrada ? ` — ${a.hora_entrada}` : ''}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Editar Socio" size="lg">
        <SocioForm socio={socio} onClose={() => setEditOpen(false)} />
      </Modal>
    </div>
  );
}

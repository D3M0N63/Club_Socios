import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { createEvento, updateEvento } from '../../api/eventos';

const TIPOS   = ['social', 'deportivo', 'reunion', 'torneo', 'otro'];
const ESTADOS = ['programado', 'en_curso', 'finalizado', 'cancelado'];

export default function EventoForm({ evento, onClose }) {
  const qc = useQueryClient();
  const isEdit = !!evento;

  const [form, setForm] = useState({
    nombre:       evento?.nombre       || '',
    descripcion:  evento?.descripcion  || '',
    fecha_inicio: evento?.fecha_inicio?.slice(0,16) || '',
    fecha_fin:    evento?.fecha_fin?.slice(0,16)    || '',
    lugar:        evento?.lugar        || '',
    tipo:         evento?.tipo         || 'social',
    capacidad_max: evento?.capacidad_max || '',
    estado:       evento?.estado       || 'programado',
  });

  const [error, setError] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const mutation = useMutation({
    mutationFn: isEdit ? (data) => updateEvento(evento.id, data) : createEvento,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['eventos'] }); onClose(); },
    onError: (e) => setError(e.message),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    mutation.mutate({
      ...form,
      capacidad_max: form.capacidad_max ? Number(form.capacidad_max) : null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Nombre del evento *</label>
        <input className="input" value={form.nombre} onChange={e => set('nombre', e.target.value)} required />
      </div>

      <div>
        <label className="label">Descripción</label>
        <textarea className="input" rows={3} value={form.descripcion} onChange={e => set('descripcion', e.target.value)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Fecha y hora de inicio *</label>
          <input className="input" type="datetime-local" value={form.fecha_inicio}
            onChange={e => set('fecha_inicio', e.target.value)} required />
        </div>
        <div>
          <label className="label">Fecha y hora de fin</label>
          <input className="input" type="datetime-local" value={form.fecha_fin}
            onChange={e => set('fecha_fin', e.target.value)} />
        </div>
        <div>
          <label className="label">Lugar</label>
          <input className="input" value={form.lugar} onChange={e => set('lugar', e.target.value)} />
        </div>
        <div>
          <label className="label">Capacidad máxima</label>
          <input className="input" type="number" min={1} value={form.capacidad_max}
            onChange={e => set('capacidad_max', e.target.value)} />
        </div>
        <div>
          <label className="label">Tipo</label>
          <select className="input" value={form.tipo} onChange={e => set('tipo', e.target.value)}>
            {TIPOS.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Estado</label>
          <select className="input" value={form.estado} onChange={e => set('estado', e.target.value)}>
            {ESTADOS.map(s => <option key={s} value={s} className="capitalize">{s.replace('_',' ')}</option>)}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
        <button type="submit" className="btn-primary" disabled={mutation.isPending}>
          {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {isEdit ? 'Guardar cambios' : 'Crear evento'}
        </button>
      </div>
    </form>
  );
}

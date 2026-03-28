import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { createSocio, updateSocio } from '../../api/socios';

const ESTADOS    = ['activo', 'inactivo', 'moroso', 'suspendido'];
const CATEGORIAS = ['general', 'juvenil', 'cadete', 'vitalicio', 'honorario'];

export default function SocioForm({ socio, onClose }) {
  const qc = useQueryClient();
  const isEdit = !!socio;

  const [form, setForm] = useState({
    nombre:           socio?.nombre           || '',
    apellido:         socio?.apellido         || '',
    dni:              socio?.dni              || '',
    email:            socio?.email            || '',
    telefono:         socio?.telefono         || '',
    fecha_nacimiento: socio?.fecha_nacimiento?.slice(0,10) || '',
    fecha_alta:       socio?.fecha_alta?.slice(0,10)       || '',
    estado:           socio?.estado           || 'activo',
    categoria:        socio?.categoria        || 'general',
    notas:            socio?.notas            || '',
    // Solo para alta
    crear_usuario:    false,
    password_usuario: '',
  });

  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const mutation = useMutation({
    mutationFn: isEdit
      ? (data) => updateSocio(socio.id, data)
      : createSocio,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['socios'] });
      onClose();
    },
    onError: (e) => setError(e.message),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const { crear_usuario, password_usuario, ...rest } = form;
    const payload = isEdit
      ? rest
      : { ...rest, crear_usuario, password_usuario: crear_usuario ? password_usuario : undefined };
    mutation.mutate(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Nombre *</label>
          <input className="input" value={form.nombre} onChange={e => set('nombre', e.target.value)} required />
        </div>
        <div>
          <label className="label">Apellido *</label>
          <input className="input" value={form.apellido} onChange={e => set('apellido', e.target.value)} required />
        </div>
        <div>
          <label className="label">DNI</label>
          <input className="input" value={form.dni} onChange={e => set('dni', e.target.value)} />
        </div>
        <div>
          <label className="label">Teléfono</label>
          <input className="input" type="tel" value={form.telefono} onChange={e => set('telefono', e.target.value)} />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} />
        </div>
        <div>
          <label className="label">Fecha de nacimiento</label>
          <input className="input" type="date" value={form.fecha_nacimiento} onChange={e => set('fecha_nacimiento', e.target.value)} />
        </div>
        <div>
          <label className="label">Fecha de alta</label>
          <input className="input" type="date" value={form.fecha_alta} onChange={e => set('fecha_alta', e.target.value)} />
        </div>
        <div>
          <label className="label">Estado</label>
          <select className="input" value={form.estado} onChange={e => set('estado', e.target.value)}>
            {ESTADOS.map(e => <option key={e} value={e} className="capitalize">{e}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Categoría</label>
          <select className="input" value={form.categoria} onChange={e => set('categoria', e.target.value)}>
            {CATEGORIAS.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="label">Notas</label>
        <textarea className="input" rows={2} value={form.notas} onChange={e => set('notas', e.target.value)} />
      </div>

      {/* Crear usuario (solo alta) */}
      {!isEdit && (
        <div className="border border-gray-200 rounded-lg p-4 space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="rounded"
              checked={form.crear_usuario}
              onChange={e => set('crear_usuario', e.target.checked)}
            />
            <span className="text-sm font-medium text-gray-700">Crear acceso al portal para este socio</span>
          </label>
          {form.crear_usuario && (
            <div>
              <label className="label">Contraseña inicial (mín. 8 caracteres)</label>
              <input
                type="password"
                className="input"
                value={form.password_usuario}
                onChange={e => set('password_usuario', e.target.value)}
                minLength={8}
                required={form.crear_usuario}
              />
              <p className="text-xs text-gray-400 mt-1">Usará el email ingresado arriba para iniciar sesión.</p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
        <button type="submit" className="btn-primary" disabled={mutation.isPending}>
          {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {isEdit ? 'Guardar cambios' : 'Crear socio'}
        </button>
      </div>
    </form>
  );
}

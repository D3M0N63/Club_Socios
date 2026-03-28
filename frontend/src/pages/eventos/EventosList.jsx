import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Eye, Pencil, Trash2, Loader2, Calendar } from 'lucide-react';
import { getEventos, deleteEvento } from '../../api/eventos';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import EventoForm from './EventoForm';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export default function EventosList() {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editEvento, setEditEvento] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const { data: eventos = [], isLoading } = useQuery({
    queryKey: ['eventos'],
    queryFn: getEventos,
  });

  const deleteMut = useMutation({
    mutationFn: deleteEvento,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['eventos'] }); setDeleteId(null); },
  });

  const openNew  = () => { setEditEvento(null); setModalOpen(true); };
  const openEdit = (e) => { setEditEvento(e); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditEvento(null); };

  // Separar próximos y pasados
  const ahora = new Date();
  const proximos = eventos.filter(e => new Date(e.fecha_inicio) >= ahora && e.estado !== 'cancelado');
  const pasados  = eventos.filter(e => new Date(e.fecha_inicio) < ahora || e.estado === 'cancelado' || e.estado === 'finalizado');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-900 flex-1">Eventos</h1>
        {isAdmin && (
          <button className="btn-primary" onClick={openNew}>
            <Plus className="w-4 h-4" /> Nuevo evento
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
      ) : (
        <>
          {/* Próximos */}
          {proximos.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Próximos eventos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {proximos.map(ev => (
                  <EventoCard key={ev.id} ev={ev} isAdmin={isAdmin} onEdit={openEdit} onDelete={setDeleteId} />
                ))}
              </div>
            </section>
          )}

          {/* Pasados */}
          {pasados.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Eventos pasados</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 opacity-70">
                {pasados.map(ev => (
                  <EventoCard key={ev.id} ev={ev} isAdmin={isAdmin} onEdit={openEdit} onDelete={setDeleteId} />
                ))}
              </div>
            </section>
          )}

          {eventos.length === 0 && (
            <div className="card text-center py-12">
              <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400">No hay eventos registrados</p>
              {isAdmin && <button className="btn-primary mt-4" onClick={openNew}><Plus className="w-4 h-4" />Crear el primero</button>}
            </div>
          )}
        </>
      )}

      <Modal open={modalOpen} onClose={closeModal} title={editEvento ? 'Editar evento' : 'Nuevo evento'} size="lg">
        <EventoForm evento={editEvento} onClose={closeModal} />
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Eliminar evento" size="sm">
        <p className="text-gray-600 mb-6">¿Eliminar este evento? Se perderán los registros de asistencia asociados.</p>
        <div className="flex justify-end gap-3">
          <button className="btn-secondary" onClick={() => setDeleteId(null)}>Cancelar</button>
          <button className="btn-danger" onClick={() => deleteMut.mutate(deleteId)} disabled={deleteMut.isPending}>
            {deleteMut.isPending && <Loader2 className="w-4 h-4 animate-spin" />} Eliminar
          </button>
        </div>
      </Modal>
    </div>
  );
}

function EventoCard({ ev, isAdmin, onEdit, onDelete }) {
  const fecha = parseISO(ev.fecha_inicio);
  return (
    <div className="card flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-blue-50 flex flex-col items-center justify-center text-blue-700 shrink-0">
          <span className="text-lg font-bold leading-none">{format(fecha, 'dd')}</span>
          <span className="text-xs uppercase leading-none">{format(fecha, 'MMM', { locale: es })}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{ev.nombre}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge value={ev.tipo} />
            <Badge value={ev.estado} />
          </div>
        </div>
      </div>

      {ev.descripcion && <p className="text-sm text-gray-500 line-clamp-2">{ev.descripcion}</p>}

      <div className="text-xs text-gray-400 space-y-0.5">
        {ev.lugar && <p>📍 {ev.lugar}</p>}
        <p>🕐 {format(fecha, "HH:mm 'hs'")}</p>
        {ev.capacidad_max && <p>👥 {ev.inscriptos}/{ev.capacidad_max} inscriptos</p>}
      </div>

      <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
        <Link to={`/eventos/${ev.id}`} className="btn-secondary text-xs py-1.5">
          <Eye className="w-3.5 h-3.5" /> Ver
        </Link>
        {isAdmin && (
          <>
            <button className="btn-ghost text-xs py-1.5" onClick={() => onEdit(ev)}>
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button className="btn-ghost text-xs py-1.5 text-red-500 hover:text-red-700" onClick={() => onDelete(ev.id)}>
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

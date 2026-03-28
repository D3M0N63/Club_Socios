import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Search, Eye, Pencil, Trash2, Loader2 } from 'lucide-react';
import { getSocios, deleteSocio } from '../../api/socios';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import SocioForm from './SocioForm';

export default function SociosList() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editSocio, setEditSocio] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const { data: socios = [], isLoading } = useQuery({
    queryKey: ['socios'],
    queryFn: getSocios,
  });

  const deleteMut = useMutation({
    mutationFn: deleteSocio,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['socios'] });
      setDeleteId(null);
    },
  });

  const filtered = socios.filter(s => {
    const q = search.toLowerCase();
    return (
      s.nombre?.toLowerCase().includes(q) ||
      s.apellido?.toLowerCase().includes(q) ||
      s.numero_socio?.toLowerCase().includes(q) ||
      s.dni?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q)
    );
  });

  const openNew  = () => { setEditSocio(null); setModalOpen(true); };
  const openEdit = (s) => { setEditSocio(s); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditSocio(null); };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-900 flex-1">Socios</h1>
        <button className="btn-primary" onClick={openNew}>
          <Plus className="w-4 h-4" /> Nuevo socio
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          className="input pl-10"
          placeholder="Buscar por nombre, número, DNI o email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Nro</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Nombre</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">DNI</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Categoría</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-gray-400">
                      {search ? 'No se encontraron socios' : 'No hay socios registrados'}
                    </td>
                  </tr>
                )}
                {filtered.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-blue-700 font-medium">{s.numero_socio}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{s.apellido}, {s.nombre}</td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{s.dni || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{s.email || '—'}</td>
                    <td className="px-4 py-3"><Badge value={s.estado} /></td>
                    <td className="px-4 py-3 text-gray-500 capitalize hidden md:table-cell">{s.categoria}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <Link to={`/socios/${s.id}`} className="btn-ghost p-1.5">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button className="btn-ghost p-1.5" onClick={() => openEdit(s)}>
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button className="btn-ghost p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setDeleteId(s.id)}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!isLoading && (
          <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
            {filtered.length} de {socios.length} socios
          </div>
        )}
      </div>

      {/* Modal alta/edición */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editSocio ? `Editar: ${editSocio.nombre} ${editSocio.apellido}` : 'Nuevo Socio'}
        size="lg"
      >
        <SocioForm socio={editSocio} onClose={closeModal} />
      </Modal>

      {/* Modal confirmación borrado */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Eliminar socio" size="sm">
        <p className="text-gray-600 mb-6">
          ¿Estás seguro de eliminar este socio? Se eliminarán también sus cuotas y registros de asistencia.
        </p>
        <div className="flex justify-end gap-3">
          <button className="btn-secondary" onClick={() => setDeleteId(null)}>Cancelar</button>
          <button
            className="btn-danger"
            onClick={() => deleteMut.mutate(deleteId)}
            disabled={deleteMut.isPending}
          >
            {deleteMut.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Eliminar
          </button>
        </div>
      </Modal>
    </div>
  );
}

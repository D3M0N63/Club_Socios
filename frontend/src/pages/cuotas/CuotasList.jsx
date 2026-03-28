import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, CreditCard, Loader2 } from 'lucide-react';
import { getCuotasPeriodo } from '../../api/cuotas';
import { getSocios } from '../../api/socios';
import { Link } from 'react-router-dom';
import Badge from '../../components/ui/Badge';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const hoy = new Date();
const periodoDefault = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;

export default function CuotasList() {
  const [periodo, setPeriodo] = useState(periodoDefault);
  const [search, setSearch] = useState('');
  const [filtro, setFiltro] = useState('todos'); // todos | pagaron | noPagaron

  const { data: cuotasPagadas = [], isLoading: loadingCuotas } = useQuery({
    queryKey: ['cuotas-periodo', periodo],
    queryFn: () => getCuotasPeriodo(periodo),
    enabled: !!periodo,
  });

  const { data: socios = [], isLoading: loadingSocios } = useQuery({
    queryKey: ['socios'],
    queryFn: getSocios,
  });

  const loading = loadingCuotas || loadingSocios;

  // Merge socios con estado de cuota del periodo
  const cuotasPorSocio = Object.fromEntries(cuotasPagadas.map(c => [c.socio_id, c]));
  const sociosActivos = socios.filter(s => s.estado === 'activo');

  const rows = sociosActivos.map(s => ({
    ...s,
    cuota: cuotasPorSocio[s.id] || null,
  }));

  const filtered = rows
    .filter(r => {
      const q = search.toLowerCase();
      if (q && !(`${r.nombre} ${r.apellido} ${r.numero_socio}`.toLowerCase().includes(q))) return false;
      if (filtro === 'pagaron' && !r.cuota) return false;
      if (filtro === 'noPagaron' && r.cuota) return false;
      return true;
    });

  const totalRecaudado = cuotasPagadas.reduce((acc, c) => acc + Number(c.monto), 0);
  const sinPagar = sociosActivos.length - cuotasPagadas.length;

  const [anio, mes] = periodo.split('-').map(Number);
  const nombreMes = new Date(anio, mes - 1).toLocaleString('es-AR', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-900 flex-1">Cuotas</h1>
        <input
          type="month"
          className="input w-auto"
          value={periodo}
          onChange={e => setPeriodo(e.target.value)}
        />
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-xs text-gray-400 mb-1">Pagaron</p>
          <p className="text-2xl font-bold text-green-600">{cuotasPagadas.length}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-gray-400 mb-1">Sin pagar</p>
          <p className="text-2xl font-bold text-red-500">{sinPagar}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-gray-400 mb-1">Recaudado</p>
          <p className="text-2xl font-bold text-blue-700">${totalRecaudado.toLocaleString('es-AR')}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input pl-10" placeholder="Buscar socio..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1">
          {[['todos','Todos'], ['pagaron','Pagaron'], ['noPagaron','Sin pagar']].map(([val, lbl]) => (
            <button key={val}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filtro === val ? 'bg-blue-700 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}
              onClick={() => setFiltro(val)}>{lbl}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 text-sm font-medium text-gray-600 capitalize">
          {nombreMes}
        </div>
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Nro</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Socio</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Monto</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Método</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Fecha pago</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-8 text-gray-400">Sin resultados</td></tr>
                )}
                {filtered.map(r => (
                  <tr key={r.id} className={`hover:bg-gray-50 ${!r.cuota ? 'opacity-70' : ''}`}>
                    <td className="px-4 py-3 font-mono text-blue-700 text-xs">{r.numero_socio}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{r.apellido}, {r.nombre}</td>
                    <td className="px-4 py-3">
                      {r.cuota
                        ? <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Pagado</span>
                        : <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Pendiente</span>
                      }
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                      {r.cuota ? `$${Number(r.cuota.monto).toLocaleString('es-AR')}` : '—'}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {r.cuota ? <Badge value={r.cuota.metodo_pago} /> : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs hidden lg:table-cell">
                      {r.cuota?.fecha_pago ? format(parseISO(r.cuota.fecha_pago), 'dd/MM/yyyy') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Link to={`/socios/${r.id}`} className="text-blue-600 hover:underline text-xs">
                        <CreditCard className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

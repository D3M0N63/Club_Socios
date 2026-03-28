import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Trophy, Loader2, CheckCircle } from 'lucide-react';
import { setup } from '../api/auth';

export default function Setup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', nombre: '', apellido: '' });
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await setup(form);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.message || 'Error al crear el administrador');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-gray-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-700 rounded-2xl flex items-center justify-center mb-4">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Configuración inicial</h1>
          <p className="text-gray-500 text-sm mt-1">Crear el primer administrador</p>
        </div>

        {success ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <CheckCircle className="w-12 h-12 text-green-500" />
            <p className="text-green-700 font-medium">¡Administrador creado!</p>
            <p className="text-gray-500 text-sm">Redirigiendo al login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Nombre</label>
                <input className="input" value={form.nombre}
                  onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required />
              </div>
              <div>
                <label className="label">Apellido</label>
                <input className="input" value={form.apellido}
                  onChange={e => setForm(f => ({ ...f, apellido: e.target.value }))} required />
              </div>
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Contraseña (mín. 8 caracteres)</label>
              <input type="password" className="input" value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                minLength={8} required />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary w-full justify-center py-3" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Creando...' : 'Crear administrador'}
            </button>
          </form>
        )}

        <p className="text-center text-xs text-gray-400 mt-6">
          <Link to="/login" className="text-blue-600 hover:underline">Volver al login</Link>
        </p>
      </div>
    </div>
  );
}

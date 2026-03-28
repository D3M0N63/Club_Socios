import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Trophy, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { login } from '../api/auth';

export default function Login() {
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      authLogin(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-gray-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-700 rounded-2xl flex items-center justify-center mb-4">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Club Deportivo</h1>
          <p className="text-gray-500 text-sm mt-1">Sistema de Socios</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              placeholder="tu@email.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="label">Contraseña</label>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary w-full justify-center py-3" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          ¿Primera vez?{' '}
          <Link to="/setup" className="text-blue-600 hover:underline">
            Configurar administrador
          </Link>
        </p>
      </div>
    </div>
  );
}

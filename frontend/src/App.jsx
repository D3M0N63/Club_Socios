import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppShell from './components/layout/AppShell';
import Login from './pages/Login';
import Setup from './pages/Setup';
import Dashboard from './pages/Dashboard';
import SociosList from './pages/socios/SociosList';
import SocioDetail from './pages/socios/SocioDetail';
import CuotasList from './pages/cuotas/CuotasList';
import AsistenciaPage from './pages/asistencia/AsistenciaPage';
import EventosList from './pages/eventos/EventosList';
import EventoDetail from './pages/eventos/EventoDetail';
import MiPerfil from './pages/MiPerfil';

function ProtectedRoute({ children, adminOnly = false }) {
  const { token, isAdmin } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  const { token } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/setup" element={<Setup />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route path="/" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route path="dashboard"  element={<Dashboard />} />
        <Route path="socios"     element={<ProtectedRoute adminOnly><SociosList /></ProtectedRoute>} />
        <Route path="socios/:id" element={<ProtectedRoute adminOnly><SocioDetail /></ProtectedRoute>} />
        <Route path="cuotas"     element={<ProtectedRoute adminOnly><CuotasList /></ProtectedRoute>} />
        <Route path="asistencia" element={<AsistenciaPage />} />
        <Route path="eventos"    element={<EventosList />} />
        <Route path="eventos/:id" element={<EventoDetail />} />
        <Route path="mi-perfil"  element={<MiPerfil />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

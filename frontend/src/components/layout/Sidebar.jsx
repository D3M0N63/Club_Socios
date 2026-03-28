import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, CreditCard, CalendarCheck,
  Calendar, UserCircle, Trophy, X,
} from 'lucide-react';

const adminLinks = [
  { to: '/dashboard',  label: 'Dashboard',   icon: LayoutDashboard },
  { to: '/socios',     label: 'Socios',       icon: Users },
  { to: '/cuotas',     label: 'Cuotas',       icon: CreditCard },
  { to: '/asistencia', label: 'Asistencia',   icon: CalendarCheck },
  { to: '/eventos',    label: 'Eventos',      icon: Calendar },
];

const socioLinks = [
  { to: '/dashboard',  label: 'Inicio',       icon: LayoutDashboard },
  { to: '/asistencia', label: 'Mi Asistencia',icon: CalendarCheck },
  { to: '/eventos',    label: 'Eventos',      icon: Calendar },
  { to: '/mi-perfil',  label: 'Mi Perfil',    icon: UserCircle },
];

export default function Sidebar({ open, onClose }) {
  const { isAdmin, logout } = useAuth();
  const links = isAdmin ? adminLinks : socioLinks;

  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 left-0 h-full z-30 w-64 bg-gray-900 flex flex-col
        transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Trophy className="text-blue-400 w-6 h-6" />
            <span className="text-white font-bold text-lg leading-tight">Club<br/>
              <span className="text-xs font-normal text-gray-400">Sistema de Socios</span>
            </span>
          </div>
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-700 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-gray-700">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <UserCircle className="w-5 h-5" />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}

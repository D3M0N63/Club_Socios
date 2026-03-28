import { Menu, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Topbar({ onMenuClick }) {
  const { user, isAdmin } = useAuth();

  const initials = user
    ? `${user.nombre?.[0] || ''}${user.apellido?.[0] || ''}`.toUpperCase() || user.email?.[0]?.toUpperCase()
    : '?';

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 gap-4 shrink-0">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <span className="hidden sm:block text-sm text-gray-600">
          {user?.nombre} {user?.apellido}
          <span className="ml-2 text-xs text-gray-400 capitalize">({isAdmin ? 'Admin' : 'Socio'})</span>
        </span>
        <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-white text-xs font-bold">
          {initials}
        </div>
      </div>
    </header>
  );
}

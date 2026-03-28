import { Link } from 'react-router-dom';
import { Users, CreditCard, Calendar, BarChart3, Shield } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 text-white">

      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 rounded-xl p-2">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Club Deportivo y Social</span>
        </div>
        <Link
          to="/admin"
          className="bg-white text-blue-800 font-semibold px-5 py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm"
        >
          Acceso administración
        </Link>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-8 pt-20 pb-24 text-center">
        <h1 className="text-5xl font-extrabold mb-5 leading-tight">
          Bienvenido a nuestro club
        </h1>
        <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-10">
          Somos un espacio dedicado al deporte, la cultura y la comunidad.
          Sumate y disfrutá de todas nuestras actividades y servicios.
        </p>
        <Link
          to="/admin"
          className="inline-block bg-white text-blue-800 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors text-lg shadow-lg"
        >
          Ingresar al sistema
        </Link>
      </section>

      {/* Features */}
      <section className="bg-white/10 backdrop-blur-sm py-16">
        <div className="max-w-6xl mx-auto px-8">
          <h2 className="text-2xl font-bold text-center mb-10 text-white">
            Gestión integral del club
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Users,     title: 'Socios',      desc: 'Registro y seguimiento de todos los socios del club.' },
              { icon: CreditCard,title: 'Cuotas',      desc: 'Control de pagos y estado de las cuotas mensuales.' },
              { icon: Calendar,  title: 'Asistencia',  desc: 'Registro de presencia en actividades y eventos.' },
              { icon: BarChart3, title: 'Estadísticas',desc: 'Reportes y métricas para la toma de decisiones.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white/10 rounded-2xl p-6 text-center hover:bg-white/20 transition-colors">
                <div className="bg-white/20 rounded-xl w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{title}</h3>
                <p className="text-blue-100 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-blue-200 text-sm">
        © {new Date().getFullYear()} Club Deportivo y Social — Todos los derechos reservados
      </footer>
    </div>
  );
}

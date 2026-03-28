import { MapPin, Phone, Mail, Clock, Facebook, Instagram, CheckCircle } from 'lucide-react';

const planes = [
  {
    nombre: 'Juvenil',
    precio: '15.000',
    descripcion: 'Para menores de 18 años',
    beneficios: ['Acceso a piscina', 'Deportes grupales', 'Actividades recreativas'],
    destacado: false,
  },
  {
    nombre: 'Individual',
    precio: '25.000',
    descripcion: 'Para mayores de 18 años',
    beneficios: ['Acceso a todas las instalaciones', 'Gimnasio', 'Piscina', 'Deportes grupales'],
    destacado: true,
  },
  {
    nombre: 'Familiar',
    precio: '45.000',
    descripcion: 'Grupo familiar (hasta 5 integrantes)',
    beneficios: ['Acceso total para toda la familia', 'Gimnasio', 'Piscina', 'Eventos exclusivos', 'Descuentos en actividades'],
    destacado: false,
  },
];

const actividades = [
  { emoji: '⚽', nombre: 'Fútbol', horario: 'Lun, Mié, Vie — 17:00 a 21:00' },
  { emoji: '🏊', nombre: 'Natación', horario: 'Mar, Jue, Sáb — 08:00 a 12:00' },
  { emoji: '🏐', nombre: 'Vóley', horario: 'Lun, Mié — 19:00 a 21:00' },
  { emoji: '🎾', nombre: 'Tenis', horario: 'Mar, Jue, Sáb — 07:00 a 11:00' },
  { emoji: '🏋️', nombre: 'Gimnasio', horario: 'Lun a Sáb — 06:00 a 22:00' },
  { emoji: '🎭', nombre: 'Eventos sociales', horario: 'Consultar calendario' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* Header */}
      <header className="bg-blue-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold leading-tight">Club Deportivo y Social</h1>
            <p className="text-blue-300 text-sm font-medium">Saltos del Guairá</p>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-blue-200">
            <a href="#actividades" className="hover:text-white transition-colors">Actividades</a>
            <a href="#planes" className="hover:text-white transition-colors">Planes</a>
            <a href="#contacto" className="hover:text-white transition-colors">Contacto</a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 text-white py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-extrabold mb-5 leading-tight">
            Deporte, cultura y comunidad
          </h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
            Somos el espacio de encuentro de Saltos del Guairá. Un lugar para hacer deporte,
            compartir momentos y crecer en comunidad.
          </p>
          <a
            href="#planes"
            className="inline-block bg-white text-blue-900 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors text-lg shadow-lg"
          >
            Ver planes y precios
          </a>
        </div>
      </section>

      {/* Actividades */}
      <section id="actividades" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Nuestras actividades</h2>
            <p className="text-gray-500">Algo para cada miembro de la familia</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {actividades.map((a) => (
              <div key={a.nombre} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-start gap-4">
                <span className="text-3xl">{a.emoji}</span>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{a.nombre}</h3>
                  <p className="text-gray-400 text-sm mt-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {a.horario}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Planes */}
      <section id="planes" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Planes de membresía</h2>
            <p className="text-gray-500">Elegí el plan que mejor se adapta a vos</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {planes.map((plan) => (
              <div
                key={plan.nombre}
                className={`rounded-2xl p-8 border-2 flex flex-col ${
                  plan.destacado
                    ? 'border-blue-600 bg-blue-600 text-white shadow-xl scale-105'
                    : 'border-gray-200 bg-white text-gray-900'
                }`}
              >
                {plan.destacado && (
                  <span className="text-xs font-bold uppercase tracking-widest bg-white/20 text-white rounded-full px-3 py-1 self-start mb-4">
                    Más popular
                  </span>
                )}
                <h3 className={`text-xl font-bold mb-1 ${plan.destacado ? 'text-white' : 'text-gray-900'}`}>
                  {plan.nombre}
                </h3>
                <p className={`text-sm mb-5 ${plan.destacado ? 'text-blue-100' : 'text-gray-400'}`}>
                  {plan.descripcion}
                </p>
                <div className="mb-6">
                  <span className={`text-4xl font-extrabold ${plan.destacado ? 'text-white' : 'text-blue-700'}`}>
                    ₲ {plan.precio}
                  </span>
                  <span className={`text-sm ml-1 ${plan.destacado ? 'text-blue-100' : 'text-gray-400'}`}>/mes</span>
                </div>
                <ul className="space-y-2 flex-1">
                  {plan.beneficios.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm">
                      <CheckCircle className={`w-4 h-4 mt-0.5 shrink-0 ${plan.destacado ? 'text-white' : 'text-blue-500'}`} />
                      <span className={plan.destacado ? 'text-blue-50' : 'text-gray-600'}>{b}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="#contacto"
                  className={`mt-8 text-center font-semibold py-3 rounded-xl transition-colors ${
                    plan.destacado
                      ? 'bg-white text-blue-700 hover:bg-blue-50'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  Asociarme
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contacto */}
      <section id="contacto" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Contacto</h2>
            <p className="text-gray-500">Estamos para ayudarte</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: MapPin,  label: 'Dirección',  value: 'Av. Principal 1234, Saltos del Guairá' },
              { icon: Phone,   label: 'Teléfono',   value: '+595 646 123 456' },
              { icon: Mail,    label: 'Email',      value: 'info@clubsaltos.com.py' },
              { icon: Clock,   label: 'Horario',    value: 'Lun–Sáb: 06:00–22:00\nDom: 08:00–14:00' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
                <div className="bg-blue-100 rounded-xl w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-5 h-5 text-blue-700" />
                </div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">{label}</p>
                <p className="text-gray-700 text-sm whitespace-pre-line">{value}</p>
              </div>
            ))}
          </div>

          {/* Redes sociales */}
          <div className="flex justify-center gap-4 mt-10">
            <a href="#" className="flex items-center gap-2 bg-blue-700 text-white px-5 py-2.5 rounded-xl hover:bg-blue-800 transition-colors text-sm font-medium">
              <Facebook className="w-4 h-4" /> Facebook
            </a>
            <a href="#" className="flex items-center gap-2 bg-pink-600 text-white px-5 py-2.5 rounded-xl hover:bg-pink-700 transition-colors text-sm font-medium">
              <Instagram className="w-4 h-4" /> Instagram
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-blue-300 text-center py-6 text-sm">
        © {new Date().getFullYear()} Club Deportivo y Social Saltos del Guairá — Todos los derechos reservados
      </footer>

    </div>
  );
}

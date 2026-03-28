const variants = {
  activo:      'bg-green-100 text-green-800',
  inactivo:    'bg-gray-100 text-gray-600',
  moroso:      'bg-red-100 text-red-800',
  suspendido:  'bg-orange-100 text-orange-800',
  programado:  'bg-blue-100 text-blue-800',
  en_curso:    'bg-green-100 text-green-800',
  finalizado:  'bg-gray-100 text-gray-600',
  cancelado:   'bg-red-100 text-red-800',
  efectivo:    'bg-green-100 text-green-700',
  transferencia: 'bg-blue-100 text-blue-700',
  tarjeta:     'bg-purple-100 text-purple-700',
  admin:       'bg-yellow-100 text-yellow-800',
  socio:       'bg-blue-100 text-blue-800',
  deportivo:   'bg-green-100 text-green-700',
  social:      'bg-pink-100 text-pink-700',
  reunion:     'bg-orange-100 text-orange-700',
  torneo:      'bg-indigo-100 text-indigo-700',
  otro:        'bg-gray-100 text-gray-600',
};

export default function Badge({ value, label }) {
  const text = label || value;
  const cls  = variants[value] || 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${cls}`}>
      {text}
    </span>
  );
}

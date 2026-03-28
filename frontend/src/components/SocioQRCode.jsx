import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, QrCode } from 'lucide-react';

export default function SocioQRCode({ socioId, numeroSocio, nombre, apellido }) {
  const svgRef = useRef(null);
  const url = `${window.location.origin}/qr/${socioId}`;

  const handleDownload = () => {
    const svg = svgRef.current?.querySelector('svg');
    if (!svg) return;
    const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `qr-${numeroSocio}.svg`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div ref={svgRef} className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
        <QRCodeSVG
          value={url}
          size={160}
          level="M"
          includeMargin={false}
        />
      </div>
      <div className="text-center">
        <p className="font-mono text-sm font-semibold text-blue-700">{numeroSocio}</p>
        <p className="text-xs text-gray-500">{nombre} {apellido}</p>
      </div>
      <button
        onClick={handleDownload}
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 transition-colors"
      >
        <Download className="w-3.5 h-3.5" /> Descargar QR
      </button>
    </div>
  );
}

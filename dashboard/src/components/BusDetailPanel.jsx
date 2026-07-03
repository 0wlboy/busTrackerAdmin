import {
  X,
  Bus,
  User,
  MapPin,
  Armchair,
  Image as ImageIcon,
} from "lucide-react";

/**
 * Panel lateral derecho que muestra el detalle de un autobús seleccionado.
 *
 * Props:
 *  - bus:     objeto del bus con forma { vehicle, route, driverName, lat, lng, speed }
 *  - onClose: función para cerrar el panel
 */
export default function BusDetailPanel({ bus, onClose }) {
  if (!bus) return null;

  const { vehicle, route, driverName, lat, lng } = bus;

  return (
    <>
      {/* ── Backdrop (mobile) ─────────────────────────────────────── */}
      <div
        className="md:hidden fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />

      {/* ── Panel ─────────────────────────────────────────────────── */}
      <aside
        className="
          fixed md:relative right-0 top-0 md:top-auto
          h-full md:h-auto
          w-72 shrink-0
          flex flex-col
          bg-[#FFF3AD] border-l border-[#2D1E2F]/10
          shadow-xl md:shadow-none
          z-50 md:z-auto
          overflow-hidden
        "
        style={{ animation: "slideInRight 0.22s ease" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-[#2D1E2F]/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#EFCC01] flex items-center justify-center shrink-0">
              <Bus className="w-4 h-4 text-[#2D1E2F]" />
            </div>
            <div>
              <p className="text-[#2D1E2F] font-bold text-sm leading-tight">
                Detalle del vehículo
              </p>
              <p className="text-[#2D1E2F]/40 text-xs">
                Información en tiempo real
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#2D1E2F]/40 hover:text-[#2D1E2F] hover:bg-[#2D1E2F]/8 transition-all cursor-pointer"
            aria-label="Cerrar panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {/* Vehicle image */}
          <div className="w-full aspect-video bg-[#2D1E2F]/5 border-b border-[#2D1E2F]/10 overflow-hidden flex items-center justify-center relative">
            {vehicle.imageUrl ? (
              <img
                src={vehicle.imageUrl}
                alt={`Foto del vehículo ${vehicle.plate}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
            ) : null}
            {/* Fallback placeholder */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-2"
              style={{ display: vehicle.imageUrl ? "none" : "flex" }}
            >
              <ImageIcon className="w-10 h-10 text-[#2D1E2F]/20" />
              <p className="text-[#2D1E2F]/30 text-xs">Sin foto disponible</p>
            </div>

            {/* Plate badge */}
            <div className="absolute bottom-2 left-2 bg-[#2D1E2F] text-[#EFCC01] text-xs font-bold px-2.5 py-1 rounded-lg tracking-widest shadow-md">
              {vehicle.plate}
            </div>

            {/* Online indicator */}
            <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-xs font-medium text-green-600 px-2 py-1 rounded-full shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              En línea
            </div>
          </div>

          {/* Info cards */}
          <div className="p-4 space-y-3">
            <InfoRow
              icon={<User className="w-4 h-4 text-[#2D1E2F]" />}
              label="Conductor"
              value={driverName ?? "Sin nombre registrado"}
            />

            <InfoRow
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 text-[#2D1E2F]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="7" width="20" height="14" rx="2" />
                  <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                  <line x1="12" y1="12" x2="12" y2="16" />
                  <line x1="10" y1="14" x2="14" y2="14" />
                </svg>
              }
              label="Placa"
              value={vehicle.plate}
              accent
            />

            <InfoRow
              icon={<Armchair className="w-4 h-4 text-[#2D1E2F]" />}
              label="Asientos"
              value={
                vehicle.seats != null
                  ? `${vehicle.seats} asientos`
                  : "No especificado"
              }
            />

            {/* Coordinates */}
            <div className="pt-2 border-t border-[#2D1E2F]/10">
              <p className="text-[#2D1E2F]/40 text-xs mb-2 font-medium uppercase tracking-wide">
                Posición actual
              </p>
              <div className="bg-[#FFF9D6] border border-[#2D1E2F]/10 rounded-xl px-3 py-2.5 font-mono text-xs text-[#2D1E2F]/60">
                {lat?.toFixed(6)}, {lng?.toFixed(6)}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Slide-in keyframe */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </>
  );
}

// ─── Info row helper ──────────────────────────────────────────────────────────
function InfoRow({ icon, label, value, accent }) {
  return (
    <div
      className={`flex items-start gap-3 px-3 py-2.5 rounded-xl border ${
        accent
          ? "bg-[#EFCC01]/20 border-[#EFCC01]/40"
          : "bg-[#FFF9D6] border-[#2D1E2F]/8"
      }`}
    >
      <div className="w-7 h-7 rounded-lg bg-[#EFCC01]/30 flex items-center justify-center shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[#2D1E2F]/40 text-[10px] font-medium uppercase tracking-wide leading-none mb-0.5">
          {label}
        </p>
        <p className="text-[#2D1E2F] text-sm font-semibold truncate">{value}</p>
      </div>
    </div>
  );
}

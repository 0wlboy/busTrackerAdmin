import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, User, AlertCircle, Loader2 } from "lucide-react";

/**
 * Input de selección de conductor con búsqueda por nombre o cédula.
 * Props:
 *  - value: string (driverId seleccionado)
 *  - onChange: (driverId: string) => void
 *  - drivers: array de conductores disponibles
 *  - loading: boolean
 *  - error: string | null (mensaje de error de validación)
 *  - hasError: boolean
 */
export default function DriverSearchInput({
  value,
  onChange,
  drivers = [],
  loading = false,
  error,
  hasError = false,
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // Nombre del conductor seleccionado para mostrarlo en el input
  const selectedDriver = drivers.find((d) => d.id === value);

  // Filtrar por nombre o cédula
  const filtered = drivers.filter((driver) => {
    const q = query.toLowerCase();
    const name = (driver.userName || "").toLowerCase();
    const cedula = String(driver.cedula ?? "").toLowerCase();
    return name.includes(q) || cedula.includes(q);
  });

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (driver) => {
    onChange(driver.id);
    setQuery("");
    setOpen(false);
  };

  const inputBorderClass = hasError
    ? "border-[#EF4444] focus-within:ring-[#EF4444]/20 focus-within:border-[#EF4444]"
    : "border-[#2D1E2F]/15 focus-within:border-[#EFCC01] focus-within:ring-[#EFCC01]/20";

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger / Input */}
      <div
        className={`flex items-center gap-2 w-full bg-[#FFF9D6] border rounded-xl px-4 py-3 text-sm cursor-pointer focus-within:outline-none focus-within:ring-2 transition-all ${inputBorderClass}`}
        onClick={() => setOpen((prev) => !prev)}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 text-[#2D1E2F]/40 animate-spin shrink-0" />
        ) : (
          <User className="w-4 h-4 text-[#2D1E2F]/40 shrink-0" />
        )}

        {open ? (
          <input
            autoFocus
            className="flex-1 bg-transparent outline-none text-[#2D1E2F] placeholder-[#2D1E2F]/30"
            placeholder="Buscar por nombre o cédula..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className={`flex-1 ${selectedDriver || value ? "text-[#2D1E2F]" : "text-[#2D1E2F]/30"}`}>
            {selectedDriver
              ? `${selectedDriver.userName || "Sin nombre"} — ${selectedDriver.cedula ? `C.I. ${selectedDriver.cedula}` : "Sin cédula"}`
              : loading
              ? "Cargando información del conductor..."
              : value
              ? `Conductor ID: ${value}`
              : "Seleccionar conductor..."}
          </span>
        )}

        <ChevronDown
          className={`w-4 h-4 text-[#2D1E2F]/40 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 right-0 mt-1.5 z-20 bg-[#FFF9D6] border border-[#2D1E2F]/10 rounded-xl shadow-xl overflow-hidden max-h-56 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-6 text-[#2D1E2F]/50 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Cargando conductores...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-6 text-center text-[#2D1E2F]/40 text-sm">
              {query
                ? "No se encontraron conductores con ese criterio."
                : "No hay conductores disponibles sin vehículo asignado."}
            </div>
          ) : (
            filtered.map((driver) => (
              <button
                key={driver.id}
                type="button"
                onClick={() => handleSelect(driver)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm hover:bg-[#EFCC01]/20 transition-colors border-b border-[#2D1E2F]/5 last:border-0 ${
                  driver.id === value ? "bg-[#EFCC01]/15" : ""
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-[#EFCC01]/20 border border-[#EFCC01]/30 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-[#2D1E2F]/60" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#2D1E2F] truncate">
                    {driver.userName || "Sin nombre"}
                  </p>
                  <p className="text-[#2D1E2F]/50 text-xs">
                    Cédula: {driver.cedula || "N/A"}
                  </p>
                </div>
                {driver.id === value && (
                  <span className="text-xs font-semibold text-[#EFCC01] bg-[#EFCC01]/15 px-2 py-0.5 rounded-full shrink-0">
                    Actual
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex gap-2 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl p-3 text-[#991B1B] text-xs mt-1.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#EF4444] mt-0.5" />
          <div>
            <span className="font-semibold block">Alerta en Conductor</span>
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  );
}

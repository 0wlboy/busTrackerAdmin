import { useEffect, useRef, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useGetTracking } from "../../hooks/useGetTracking";
import { useGetRoutes } from "../../hooks/useGetRoutes";
import BusDetailPanel from "../../components/BusDetailPanel";
import {
  Bus,
  RefreshCw,
  Wifi,
  WifiOff,
  MapPin,
  Clock,
  Navigation,
  LayoutGrid,
  Route,
} from "lucide-react";

// ─── Fix Leaflet default icon paths (Vite asset issue) ───────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// ─── Custom bus icon using the brand colors ────────────────────────────────
const createBusIcon = () =>
  L.divIcon({
    className: "",
    html: `
      <div style="
        width: 38px;
        height: 38px;
        background: #EFCC01;
        border: 3px solid #2D1E2F;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(45,30,47,0.35);
        position: relative;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2D1E2F" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/>
          <path d="M19 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/>
          <path d="M13 16V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10l2 2h10zM13 6l3 5h3l1 2v3h-1m-3-10v10"/>
        </svg>
        <span style="
          position: absolute;
          top: -6px;
          right: -6px;
          width: 10px;
          height: 10px;
          background: #22c55e;
          border: 2px solid white;
          border-radius: 50%;
        "></span>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -22],
  });

// ─── Component to auto-fit map to visible markers ─────────────────────────
function FitBounds({ buses }) {
  const map = useMap();
  const prevKey = useRef(null);

  useEffect(() => {
    if (buses.length === 0) return;
    // Build a key from the ids; re-fit whenever the visible set changes
    const key = buses.map((b) => b.id).join(",");
    if (key === prevKey.current) return;
    prevKey.current = key;

    const bounds = L.latLngBounds(buses.map((b) => [b.lat, b.lng]));
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
  }, [buses, map]);

  return null;
}

// ─── Stat badge ──────────────────────────────────────────────────────────────
function StatBadge({ icon: Icon, label, value, accent }) {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm ${
        accent
          ? "bg-[#EFCC01] border-[#EFCC01]/60 text-[#2D1E2F]"
          : "bg-[#FFF3AD] border-[#2D1E2F]/10 text-[#2D1E2F]"
      }`}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span className="font-semibold">{value}</span>
      <span className="opacity-60 font-normal">{label}</span>
    </div>
  );
}

// ─── Route filter button ───────────────────────────────────────────────────
function RouteFilterBtn({ label, count, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between gap-2 w-full px-3 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
        active
          ? "bg-[#2D1E2F] text-[#EFCC01] border-[#2D1E2F] shadow-sm"
          : "bg-[#FFF9D6] text-[#2D1E2F]/70 border-[#2D1E2F]/10 hover:border-[#EFCC01]/50 hover:text-[#2D1E2F]"
      }`}
    >
      <span className="truncate text-left">{label}</span>
      {count !== undefined && (
        <span
          className={`shrink-0 min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center text-[10px] font-bold ${
            active
              ? "bg-[#EFCC01] text-[#2D1E2F]"
              : "bg-[#2D1E2F]/10 text-[#2D1E2F]/60"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

// ─── Sidebar bus card ─────────────────────────────────────────────────────────
function BusCard({ bus, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-xl border transition-all cursor-pointer ${
        selected
          ? "bg-[#EFCC01] border-[#EFCC01]/60 shadow-md"
          : "bg-[#FFF3AD] border-[#2D1E2F]/10 hover:border-[#EFCC01]/50 hover:bg-[#FFF9D6]"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
            selected
              ? "bg-[#2D1E2F]"
              : "bg-[#EFCC01]/20 border border-[#EFCC01]/40"
          }`}
        >
          <Bus
            className={`w-4 h-4 ${selected ? "text-[#EFCC01]" : "text-[#2D1E2F]"}`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={`font-semibold text-sm truncate ${
              selected ? "text-[#2D1E2F]" : "text-[#2D1E2F]"
            }`}
          >
            {bus.vehicle.plate}
          </p>
          <p
            className={`text-xs truncate mt-0.5 ${
              selected ? "text-[#2D1E2F]/70" : "text-[#2D1E2F]/50"
            }`}
          >
            {bus.route.name ?? bus.route.id ?? "Sin ruta asignada"}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span
            className={`text-xs font-medium ${selected ? "text-[#2D1E2F]/70" : "text-green-600"}`}
          >
            En línea
          </span>
        </div>
      </div>
    </button>
  );
}

// ─── Main Map Page ─────────────────────────────────────────────────────────────
export default function Maps() {
  const { buses, loading, error, lastUpdated, busCount } = useGetTracking();
  // Rutas obtenidas desde el hook centralizado (routeList = [{ id, name }])
  const { routeList: routes, loading: routesLoading } = useGetRoutes();
  const [selectedBus, setSelectedBus] = useState(null);
  const [detailBus, setDetailBus] = useState(null); // bus cuyo panel está abierto
  const [activeRoute, setActiveRoute] = useState(null); // null = "Todos"
  const mapRef = useRef(null);
  const markersRef = useRef({});

  // ── Derived: buses visible after filter ──────────────────────────────────
  const visibleBuses =
    activeRoute === null
      ? buses
      : buses.filter((b) => b.route.id === activeRoute);

  // ── Count buses per route for the filter badges ──────────────────────────
  const countByRoute = useCallback(
    (routeId) => buses.filter((b) => b.route.id === routeId).length,
    [buses],
  );

  // Format last updated time
  const formattedTime = lastUpdated
    ? lastUpdated.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "--:--:--";

  // When a bus card is clicked, fly to it and open detail panel
  const handleSelectBus = (bus) => {
    setSelectedBus(bus.id);
    setDetailBus(bus);
    const map = mapRef.current;
    if (map && bus.lat && bus.lng) {
      map.flyTo([bus.lat, bus.lng], 16, { duration: 1.2 });
    }
  };

  // When switching route, clear selected bus and close detail panel
  const handleRouteFilter = (routeId) => {
    setActiveRoute(routeId);
    setSelectedBus(null);
    setDetailBus(null);
  };

  return (
    <div
      className="flex h-full bg-[#FFF9D6]"
      style={{ height: "calc(100vh - 53px)" }}
    >
      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className="w-72 shrink-0 flex flex-col bg-[#FFF3AD] border-r border-[#2D1E2F]/10 overflow-hidden">
        {/* Header */}
        <div className="px-4 py-4 border-b border-[#2D1E2F]/10">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-5 h-5 text-[#2D1E2F]" />
            <h1 className="text-[#2D1E2F] font-bold text-base">Mapa en Vivo</h1>
          </div>
          <p className="text-[#2D1E2F]/50 text-xs">
            Seguimiento en tiempo real de la flota
          </p>

          {/* Stats row */}
          <div className="flex gap-2 mt-3 flex-wrap">
            <StatBadge
              icon={Bus}
              label="activos"
              value={visibleBuses.length}
              accent={visibleBuses.length > 0}
            />
          </div>
        </div>

        {/* ── Route filter section ────────────────────────────────── */}
        <div className="px-3 pt-3 pb-2 border-b border-[#2D1E2F]/10">
          <div className="flex items-center gap-1.5 mb-2 px-1">
            <Route className="w-3.5 h-3.5 text-[#2D1E2F]/40" />
            <span className="text-[#2D1E2F]/40 text-xs font-medium uppercase tracking-wide">
              Filtrar por ruta
            </span>
          </div>

          <div className="space-y-1">
            {/* "Todos" button */}
            <RouteFilterBtn
              label="Todos los vehículos"
              count={busCount}
              active={activeRoute === null}
              onClick={() => handleRouteFilter(null)}
            />

            {/* Per-route buttons */}
            {routesLoading ? (
              <div className="flex items-center gap-2 px-3 py-2">
                <RefreshCw className="w-3 h-3 text-[#EFCC01] animate-spin" />
                <span className="text-[#2D1E2F]/30 text-xs">
                  Cargando rutas…
                </span>
              </div>
            ) : routes.length === 0 ? (
              <p className="text-[#2D1E2F]/30 text-xs px-3 py-1">
                Sin rutas registradas
              </p>
            ) : (
              routes.map((route) => (
                <RouteFilterBtn
                  key={route.id}
                  label={route.name}
                  count={countByRoute(route.id)}
                  active={activeRoute === route.id}
                  onClick={() => handleRouteFilter(route.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Last updated */}
        <div className="px-4 py-2 border-b border-[#2D1E2F]/10 flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-[#2D1E2F]/40" />
          <span className="text-[#2D1E2F]/40 text-xs">
            Actualizado: {formattedTime}
          </span>
          {loading && (
            <RefreshCw className="w-3 h-3 text-[#EFCC01] animate-spin ml-auto" />
          )}
        </div>

        {/* Bus list */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
          {loading && buses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <RefreshCw className="w-8 h-8 text-[#EFCC01] animate-spin" />
              <p className="text-[#2D1E2F]/50 text-sm text-center">
                Cargando datos de tracking…
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3 px-2">
              <WifiOff className="w-8 h-8 text-red-400" />
              <p className="text-[#2D1E2F]/60 text-sm text-center">
                Error al obtener datos de tracking
              </p>
              <p className="text-[#2D1E2F]/30 text-xs text-center">
                {error.message}
              </p>
            </div>
          ) : visibleBuses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3 px-2">
              <div className="w-14 h-14 rounded-2xl bg-[#EFCC01]/20 border border-[#EFCC01]/30 flex items-center justify-center">
                {activeRoute !== null ? (
                  <LayoutGrid className="w-7 h-7 text-[#2D1E2F]/40" />
                ) : (
                  <Bus className="w-7 h-7 text-[#2D1E2F]/40" />
                )}
              </div>
              <p className="text-[#2D1E2F]/60 text-sm text-center font-medium">
                {activeRoute !== null
                  ? "Sin vehículos en esta ruta"
                  : "Sin autobuses en línea"}
              </p>
              <p className="text-[#2D1E2F]/30 text-xs text-center leading-relaxed">
                {activeRoute !== null
                  ? "No hay vehículos activos en esta ruta en este momento."
                  : "No hay vehículos activos en este momento. Los autobuses aparecerán aquí cuando estén en línea."}
              </p>
              {activeRoute !== null && (
                <button
                  onClick={() => handleRouteFilter(null)}
                  className="text-xs text-[#2D1E2F]/50 underline underline-offset-2 hover:text-[#2D1E2F] transition-colors cursor-pointer"
                >
                  Ver todos los vehículos
                </button>
              )}
            </div>
          ) : (
            visibleBuses.map((bus) => (
              <BusCard
                key={bus.id}
                bus={bus}
                selected={selectedBus === bus.id}
                onClick={() => handleSelectBus(bus)}
              />
            ))
          )}
        </div>

        {/* Footer note */}
        <div className="px-4 py-3 border-t border-[#2D1E2F]/10">
          <p className="text-[#2D1E2F]/30 text-xs text-center">
            Las coordenadas se actualizan en tiempo real
          </p>
        </div>
      </aside>

      {/* ── Map ─────────────────────────────────────────────────── */}
      <div className="flex-1 relative">
        {/* Overlay while loading */}
        {loading && buses.length === 0 && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#FFF9D6]/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#EFCC01] flex items-center justify-center shadow-lg animate-pulse">
                <MapPin className="w-8 h-8 text-[#2D1E2F]" />
              </div>
              <p className="text-[#2D1E2F] font-semibold">Cargando mapa…</p>
            </div>
          </div>
        )}

        <MapContainer
          center={[8.266821486293944, -62.7636681807467]}
          zoom={20}
          style={{ width: "100%", height: "100%" }}
          ref={mapRef}
          zoomControl={false}
        >
          {/* Zoom controls top-right */}
          <div
            style={{ position: "absolute", top: 12, right: 12, zIndex: 999 }}
          />

          {/* Tile layer — CartoDB Positron (clean, light style) */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />

          {/* Auto-fit whenever visible buses change */}
          {visibleBuses.length > 0 && <FitBounds buses={visibleBuses} />}

          {/* Bus markers — only for visibleBuses */}
          {visibleBuses.map((bus) => (
            <Marker
              key={bus.id}
              position={[bus.lat, bus.lng]}
              icon={createBusIcon()}
              ref={(ref) => {
                if (ref) markersRef.current[bus.id] = ref;
              }}
              eventHandlers={{
                click: () => handleSelectBus(bus),
              }}
            />
          ))}
        </MapContainer>

        {/* Active route banner (shown when a route filter is active) */}
        {activeRoute !== null && (
          <div
            style={{
              position: "absolute",
              top: 16,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 1000,
            }}
            className="flex items-center gap-2 bg-[#2D1E2F] text-white text-xs px-4 py-2 rounded-2xl shadow-lg border border-white/10"
          >
            <Route className="w-3.5 h-3.5 text-[#EFCC01]" />
            <span>
              Ruta:{" "}
              <strong className="text-[#EFCC01]">
                {routes.find((r) => r.id === activeRoute)?.name ?? activeRoute}
              </strong>
            </span>
            <button
              onClick={() => handleRouteFilter(null)}
              className="ml-2 text-white/50 hover:text-white transition-colors cursor-pointer text-xs font-medium"
              title="Quitar filtro"
            >
              ✕
            </button>
          </div>
        )}

        {/* Bus count overlay badge */}
        {visibleBuses.length > 0 && (
          <div
            style={{
              position: "absolute",
              bottom: 24,
              right: 16,
              zIndex: 1000,
            }}
            className="flex items-center gap-2 bg-[#2D1E2F] text-white text-sm px-4 py-2 rounded-2xl shadow-lg border border-white/10"
          >
            <Bus className="w-4 h-4 text-[#EFCC01]" />
            <span>
              <strong className="text-[#EFCC01]">{visibleBuses.length}</strong>{" "}
              {visibleBuses.length === 1 ? "autobús" : "autobuses"} en línea
            </span>
          </div>
        )}
      </div>

      {/* ── Bus detail panel (right sidebar) ───────────────────── */}
      {detailBus && (
        <BusDetailPanel
          bus={detailBus}
          onClose={() => {
            setDetailBus(null);
            setSelectedBus(null);
          }}
        />
      )}
    </div>
  );
}

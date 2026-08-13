import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useGetRoutes } from "../../hooks/useGetRoutes";
import DeleteModal from "../../components/modals/DeleteModal";
import {
  Search,
  Plus,
  Filter,
  ChevronDown,
  Circle,
  MapPin,
  Truck,
  Loader2,
  Trash2,
  Pencil,
  Palette,
  X,
  Bus,
} from "lucide-react";

const STATUSES = ["Todos", "Activa", "Inactiva"];

export default function RoutesPage() {
  const { routes, loading, error, refresh } = useGetRoutes();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [showFilters, setShowFilters] = useState(false);
  const [updating, setUpdating] = useState(null);

  // Estados para eliminación de ruta
  const [routeToDelete, setRouteToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Estados para edición de ruta
  const [routeToEdit, setRouteToEdit] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    origin: "",
    destination: "",
    color: "#EFCC01",
    strokeColor: "#2D1E2F",
  });
  const [savingEdit, setSavingEdit] = useState(false);

  const openEditModal = (route) => {
    setRouteToEdit(route);
    setEditFormData({
      name: route.name || "",
      origin: route.origin || "",
      destination: route.destination || "",
      color: route.color || "#EFCC01",
      strokeColor: route.strokeColor || "#2D1E2F",
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!routeToEdit) return;
    setSavingEdit(true);
    try {
      const routeRef = doc(db, "vehicleRoutes", routeToEdit.id);
      await updateDoc(routeRef, {
        name: editFormData.name.trim(),
        origin: editFormData.origin.trim(),
        destination: editFormData.destination.trim(),
        color: editFormData.color,
        strokeColor: editFormData.strokeColor || "#2D1E2F",
      });
      setRouteToEdit(null);
      refresh();
    } catch (err) {
      console.error("Error al actualizar ruta:", err);
      alert("Hubo un error al guardar los cambios de la ruta.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleToggleStatus = async (routeId, currentStatus) => {
    if (updating) return;
    setUpdating(routeId);
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      const routeRef = doc(db, "vehicleRoutes", routeId);
      await updateDoc(routeRef, { status: newStatus });
      refresh();
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Hubo un error al actualizar el estado de la ruta");
    } finally {
      setUpdating(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!routeToDelete) return;
    setDeleting(true);
    try {
      const routeRef = doc(db, "vehicleRoutes", routeToDelete.id);
      await updateDoc(routeRef, { isDeleted: true });
      setShowDeleteModal(false);
      setRouteToDelete(null);
      refresh();
    } catch (err) {
      console.error("Error al eliminar ruta:", err);
      alert("Hubo un error al eliminar la ruta.");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = routes.filter((r) => {
    if (r.isDeleted === true) return false;

    const routeName = r.name || "";
    const routeOrigin = r.origin || "";
    const routeDest = r.destination || "";

    const matchSearch =
      routeName.toLowerCase().includes(search.toLowerCase()) ||
      routeOrigin.toLowerCase().includes(search.toLowerCase()) ||
      routeDest.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      filterStatus === "Todos" ||
      (filterStatus === "Activa" && r.status === "active") ||
      (filterStatus === "Inactiva" && r.status === "inactive");

    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#2D1E2F] text-2xl">Rutas</h1>
          <p className="text-[#2D1E2F]/50 text-sm mt-1">
            {routes.length} rutas registradas ·{" "}
            {routes.filter((r) => r.status === "active").length} activas
          </p>
        </div>
        <button
          onClick={() => navigate("/rutas/nueva")}
          className="flex items-center gap-2 bg-[#EFCC01] hover:bg-[#EFCC01]/85 text-[#2D1E2F] rounded-xl px-4 py-2.5 text-sm transition-colors shadow-md shadow-[#EFCC01]/20"
        >
          <Plus className="w-4 h-4" />
          Agregar ruta
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-[#FFF3AD] border border-[#2D1E2F]/10 rounded-2xl p-4 space-y-3">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2D1E2F]/30" />
            <input
              type="text"
              placeholder="Buscar por nombre, origen o destino..."
              value={search}
              maxLength={50}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#FFF9D6] border border-[#2D1E2F]/15 text-[#2D1E2F] placeholder-[#2D1E2F]/30 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#EFCC01] focus:ring-2 focus:ring-[#EFCC01]/20 transition-all"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm transition-colors ${
              showFilters || filterStatus !== "Todos"
                ? "bg-[#EFCC01]/20 border-[#EFCC01]/50 text-[#2D1E2F]"
                : "bg-[#FFF9D6] border-[#2D1E2F]/15 text-[#2D1E2F]/60 hover:text-[#2D1E2F]"
            }`}
          >
            <Filter className="w-4 h-4" />
            Filtros
            <ChevronDown
              className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-4 pt-3 border-t border-[#2D1E2F]/10">
            <div>
              <label className="text-[#2D1E2F]/40 text-xs mb-1.5 block">
                Estado
              </label>
              <div className="flex gap-2">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                      filterStatus === s
                        ? "bg-[#2D1E2F] text-white"
                        : "bg-[#FFF9D6] text-[#2D1E2F]/60 hover:text-[#2D1E2F] border border-[#2D1E2F]/15"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            {filterStatus !== "Todos" && (
              <button
                onClick={() => setFilterStatus("Todos")}
                className="self-end text-xs text-red-500 hover:text-red-600 px-2 py-1.5"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        )}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 relative min-h-[200px]">
        {loading && routes.length === 0 ? (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-2xl border border-[#2D1E2F]/10">
            <Loader2 className="w-8 h-8 text-[#EFCC01] animate-spin mb-2" />
            <span className="text-sm text-[#2D1E2F]/70 font-medium">
              Cargando rutas...
            </span>
          </div>
        ) : error ? (
          <div className="col-span-1 md:col-span-2 xl:col-span-3 text-center text-red-500 py-16 text-sm">
            Error al cargar: {error.message}
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-1 md:col-span-2 xl:col-span-3 text-center text-[#2D1E2F]/30 py-16 text-sm">
            No se encontraron rutas
          </div>
        ) : (
          filtered.map((route) => {
            const pct =
              route.totalVehicles > 0
                ? (route.activeVehicles / route.totalVehicles) * 100
                : 0;
            return (
              <div
                key={route.id}
                className="bg-[#FFF3AD] border border-[#2D1E2F]/10 rounded-2xl p-5 hover:border-[#2D1E2F]/20 transition-all space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-xs"
                      style={{
                        backgroundColor: route.color || "#EFCC01",
                        border: `2px solid ${route.strokeColor || "#2D1E2F"}`,
                      }}
                      title={`Fondo: ${route.color || "#EFCC01"} | Borde: ${route.strokeColor || "#2D1E2F"}`}
                    >
                      <Bus
                        className="w-4 h-4"
                        style={{ color: route.strokeColor || "#2D1E2F" }}
                      />
                    </div>
                    <div>
                      <h3 className="text-[#2D1E2F] text-base font-semibold">
                        {route.name}
                      </h3>
                      <p className="text-[#2D1E2F]/40 text-xs mt-0.5">
                        {route.distance}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(route)}
                      className="p-1.5 text-[#2D1E2F]/70 bg-[#FFF9D6] hover:bg-[#FFF9D6]/80 border border-[#2D1E2F]/15 rounded-lg transition-colors cursor-pointer"
                      title="Editar ruta"
                      type="button"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(route.id, route.status)}
                      disabled={updating === route.id}
                      className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full shrink-0 transition-colors ${
                        route.status === "active"
                          ? "bg-[#EFCC01]/25 hover:bg-[#EFCC01]/40 text-[#2D1E2F] border border-[#EFCC01]/50 cursor-pointer"
                          : "bg-[#2D1E2F]/8 hover:bg-[#2D1E2F]/15 text-[#2D1E2F]/60 border border-transparent cursor-pointer"
                      } ${updating === route.id ? "opacity-50 pointer-events-none" : ""}`}
                      title={
                        route.status === "active"
                          ? "Haz clic para desactivar"
                          : "Haz clic para activar"
                      }
                    >
                      {updating === route.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Circle className="w-1.5 h-1.5 fill-current" />
                      )}
                      {route.status === "active" ? "Activa" : "Inactiva"}
                    </button>
                    <button
                      onClick={() => {
                        setRouteToDelete(route);
                        setShowDeleteModal(true);
                      }}
                      className="p-1.5 text-red-500 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors cursor-pointer"
                      title="Eliminar ruta"
                      type="button"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[#2D1E2F]/60 text-xs">
                    <MapPin className="w-3.5 h-3.5 text-[#2D1E2F] shrink-0" />
                    <span className="truncate">
                      <span className="text-[#2D1E2F]/40">Origen: </span>
                      {route.origin}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[#2D1E2F]/60 text-xs">
                    <MapPin className="w-3.5 h-3.5 text-[#EFCC01] shrink-0" />
                    <span className="truncate">
                      <span className="text-[#2D1E2F]/40">Destino: </span>
                      {route.destination}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-1.5 text-[#2D1E2F]/50 text-xs">
                      <Truck className="w-3.5 h-3.5" />
                      Vehículos activos
                    </span>
                    <span className="text-[#2D1E2F] text-xs">
                      {route.activeVehicles}/{route.totalVehicles}
                    </span>
                  </div>
                  <div className="h-1.5 bg-[#2D1E2F]/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        backgroundColor:
                          pct === 100
                            ? "#22c55e"
                            : pct >= 50
                              ? "#EFCC01"
                              : pct > 0
                                ? "#f97316"
                                : "#2D1E2F20",
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="text-[#2D1E2F]/35 text-xs">
        Mostrando {filtered.length} de {routes.length} rutas
      </div>

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setRouteToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        loading={deleting}
      />

      {/* Modal para Editar Ruta */}
      {routeToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-[#FFF3AD] border border-[#2D1E2F]/15 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-5 relative">
            <button
              onClick={() => setRouteToEdit(null)}
              className="absolute right-4 top-4 p-1.5 text-[#2D1E2F]/40 hover:text-[#2D1E2F] rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-[#2D1E2F] font-bold text-lg">Editar Ruta</h2>
              <p className="text-[#2D1E2F]/50 text-xs mt-0.5">
                Modifica los datos y el color oficial de la ruta
              </p>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#2D1E2F]/80 mb-1">
                  Nombre de la Ruta
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) =>
                    setEditFormData((p) => ({ ...p, name: e.target.value }))
                  }
                  required
                  className="w-full bg-[#FFF9D6] border border-[#2D1E2F]/15 rounded-xl px-3 py-2 text-sm text-[#2D1E2F] focus:outline-none focus:border-[#EFCC01] focus:ring-2 focus:ring-[#EFCC01]/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#2D1E2F]/80 mb-1">
                    Origen
                  </label>
                  <input
                    type="text"
                    value={editFormData.origin}
                    onChange={(e) =>
                      setEditFormData((p) => ({ ...p, origin: e.target.value }))
                    }
                    required
                    className="w-full bg-[#FFF9D6] border border-[#2D1E2F]/15 rounded-xl px-3 py-2 text-sm text-[#2D1E2F] focus:outline-none focus:border-[#EFCC01] focus:ring-2 focus:ring-[#EFCC01]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#2D1E2F]/80 mb-1">
                    Destino
                  </label>
                  <input
                    type="text"
                    value={editFormData.destination}
                    onChange={(e) =>
                      setEditFormData((p) => ({
                        ...p,
                        destination: e.target.value,
                      }))
                    }
                    required
                    className="w-full bg-[#FFF9D6] border border-[#2D1E2F]/15 rounded-xl px-3 py-2 text-sm text-[#2D1E2F] focus:outline-none focus:border-[#EFCC01] focus:ring-2 focus:ring-[#EFCC01]/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#2D1E2F]/80 mb-1 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-[#EFCC01]" />
                  Color de Fondo de la Ruta
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={editFormData.color}
                    onChange={(e) =>
                      setEditFormData((p) => ({ ...p, color: e.target.value }))
                    }
                    className="w-10 h-9 rounded-lg border border-[#2D1E2F]/15 cursor-pointer p-0.5 bg-[#FFF9D6]"
                  />
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2D1E2F]/40 text-xs font-mono">
                      #
                    </span>
                    <input
                      type="text"
                      value={editFormData.color.replace("#", "")}
                      maxLength={6}
                      onChange={(e) => {
                        const raw = e.target.value
                          .replace(/[^0-9A-Fa-f]/g, "")
                          .slice(0, 6);
                        setEditFormData((p) => ({ ...p, color: `#${raw}` }));
                      }}
                      className="w-full bg-[#FFF9D6] border border-[#2D1E2F]/15 rounded-xl pl-7 pr-3 py-2 text-xs font-mono text-[#2D1E2F] focus:outline-none focus:border-[#EFCC01]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#2D1E2F]/80 mb-1 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-[#2D1E2F]" />
                  Color del Borde e Ícono (Stroke)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={editFormData.strokeColor}
                    onChange={(e) =>
                      setEditFormData((p) => ({ ...p, strokeColor: e.target.value }))
                    }
                    className="w-10 h-9 rounded-lg border border-[#2D1E2F]/15 cursor-pointer p-0.5 bg-[#FFF9D6]"
                  />
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2D1E2F]/40 text-xs font-mono">
                      #
                    </span>
                    <input
                      type="text"
                      value={editFormData.strokeColor.replace("#", "")}
                      maxLength={6}
                      onChange={(e) => {
                        const raw = e.target.value
                          .replace(/[^0-9A-Fa-f]/g, "")
                          .slice(0, 6);
                        setEditFormData((p) => ({ ...p, strokeColor: `#${raw}` }));
                      }}
                      className="w-full bg-[#FFF9D6] border border-[#2D1E2F]/15 rounded-xl pl-7 pr-3 py-2 text-xs font-mono text-[#2D1E2F] focus:outline-none focus:border-[#EFCC01]"
                    />
                  </div>
                  <div
                    className="w-9 h-9 rounded-lg shadow-xs shrink-0 flex items-center justify-center"
                    style={{
                      backgroundColor: editFormData.color,
                      border: `2px solid ${editFormData.strokeColor}`,
                    }}
                  >
                    <Bus
                      className="w-4 h-4"
                      style={{ color: editFormData.strokeColor }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#2D1E2F]/10">
                <button
                  type="button"
                  onClick={() => setRouteToEdit(null)}
                  className="px-4 py-2 text-xs font-medium text-[#2D1E2F]/60 bg-[#FFF9D6] border border-[#2D1E2F]/15 rounded-xl hover:bg-[#2D1E2F]/5"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 text-xs font-medium text-[#2D1E2F] bg-[#EFCC01] hover:bg-[#EFCC01]/80 rounded-xl shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                >
                  {savingEdit ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar Cambios"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

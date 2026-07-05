import { useState } from "react";
import { usePaginatedVehicles } from "../../hooks/usePaginatedVehicles.js";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Bus,
  Plus,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function VehicleView() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const {
    vehicles,
    loading,
    error,
    totalCount,
    currentPage,
    isFirstPage,
    isLastPage,
    nextPage,
    prevPage,
    cedulas = {},
  } = usePaginatedVehicles({
    pageSize: 10,
    orderByField: "createdAt",
    orderDirection: "desc",
  });

  // Filtramos en el cliente (búsqueda de texto)
  const filtered = vehicles.filter((v) => {
    const route = v.routeId || v.route || "Sin ruta";
    const driverId = v.driverId || "Sin conductor";
    const cedula = cedulas[v.driverId] || "";

    const matchSearch =
      route.toLowerCase().includes(search.toLowerCase()) ||
      driverId.toLowerCase().includes(search.toLowerCase()) ||
      cedula.toLowerCase().includes(search.toLowerCase());

    return matchSearch;
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Reporte de Vehículos", 14, 15);

    // Preparar los datos
    const tableColumn = ["ID", "Ruta", "Asientos", "Cédula"];
    const tableRows = [];

    filtered.forEach((vehicle) => {
      const vehicleData = [
        vehicle.id || "Sin ID",
        vehicle.routeId || "Sin ruta",
        vehicle.seats || "Sin asientos",
        cedulas[vehicle.driverId] || "Sin cédula",
        vehicle.createdAt
          ? new Date(
              vehicle.createdAt.seconds
                ? vehicle.createdAt.seconds * 1000
                : vehicle.createdAt,
            ).toLocaleDateString()
          : "N/A",
        vehicle.lastUpdate
          ? new Date(
              vehicle.lastUpdate.seconds
                ? vehicle.lastUpdate.seconds * 1000
                : vehicle.lastUpdate,
            ).toLocaleDateString()
          : "N/A",
      ];
      tableRows.push(vehicleData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save("vehiculos_vista_actual.pdf");
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#2D1E2F] text-2xl">Vehículos</h1>
          <p className="text-[#2D1E2F]/50 text-sm mt-1">
            {totalCount !== undefined ? totalCount : "Cargando"} vehículos en
            total
          </p>
        </div>
        <div className="flex gap-2">
          {/* Botón para descargar PDF */}
          <button
            onClick={exportToPDF}
            disabled={loading || filtered.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#EFCC01] text-[#2D1E2F] rounded-xl hover:bg-[#F2D72B] transition-colors font-medium text-sm disabled:opacity-50 disabled:pointer-events-none"
          >
            <FileText className="w-4 h-4" />
            Descargar PDF
          </button>

          {/*Boton para añadir vehiculo */}
          <button
            onClick={() => navigate("/vehiculos/nuevo")}
            className="bg-[#EFCC01] hover:bg-[#EFCC01]/85 text-[#2D1E2F] px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Añadir Vehículo
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-[#FFF3AD] border border-[#2D1E2F]/10 rounded-2xl p-4 space-y-3">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2D1E2F]/30" />
            <input
              type="text"
              placeholder="Buscar por ruta o ID del conductor en esta página..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#FFF9D6] border border-[#2D1E2F]/15 text-[#2D1E2F] placeholder-[#2D1E2F]/30 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#EFCC01] focus:ring-2 focus:ring-[#EFCC01]/20 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#FFF3AD] border border-[#2D1E2F]/10 rounded-2xl overflow-hidden flex flex-col">
        {error && (
          <div className="p-4 bg-red-50 text-red-600 text-sm border-b border-red-100">
            Error al cargar: {error.message}
          </div>
        )}

        <div className="overflow-x-auto relative">
          {loading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-[#EFCC01] animate-spin mb-2" />
              <span className="text-sm text-[#2D1E2F]/70 font-medium">
                Cargando vehículos...
              </span>
            </div>
          )}
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2D1E2F]/10">
                <th className="text-left text-[#2D1E2F]/40 text-xs px-5 py-3.5 uppercase tracking-wider">
                  Vehículo
                </th>
                <th className="text-left text-[#2D1E2F]/40 text-xs px-5 py-3.5 uppercase tracking-wider">
                  Ruta
                </th>
                <th className="text-left text-[#2D1E2F]/40 text-xs px-5 py-3.5 uppercase tracking-wider">
                  Asientos
                </th>
                <th className="text-left text-[#2D1E2F]/40 text-xs px-5 py-3.5 uppercase tracking-wider">
                  Placa
                </th>
                <th className="text-left text-[#2D1E2F]/40 text-xs px-5 py-3.5 uppercase tracking-wider">
                  Registrado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2D1E2F]/8">
              {!loading && filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center text-[#2D1E2F]/40 py-12 text-sm"
                  >
                    No se encontraron vehículos en esta página
                  </td>
                </tr>
              ) : (
                filtered.map((v) => {
                  const route = v.routeName || "Sin ruta";
                  const seats = v.seats || "N/A";

                  return (
                    <tr
                      key={v.id}
                      className="hover:bg-[#2D1E2F]/5 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {v.imageUri ? (
                            <img
                              src={v.imageUri}
                              alt="Vehículo"
                              className="w-10 h-10 rounded-lg object-cover border border-[#2D1E2F]/10"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-[#EFCC01]/20 border border-[#EFCC01]/40 flex items-center justify-center shrink-0">
                              <Bus className="w-5 h-5 text-[#2D1E2F]/50" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-[#2D1E2F] text-sm font-medium">
                          {route}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-[#2D1E2F]/50 text-sm">
                        {seats}
                      </td>
                      <td className="px-5 py-4 text-[#2D1E2F]/50 text-sm">
                        <span className="text-xs font-mono bg-[#2D1E2F]/5 px-2 py-1 rounded">
                          {v.plate || (loading ? "Cargando..." : "N/A")}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-[#2D1E2F]/50 text-sm">
                        {v.createdAt
                          ? new Date(
                              v.createdAt.seconds
                                ? v.createdAt.seconds * 1000
                                : v.createdAt,
                            ).toLocaleDateString()
                          : "N/A"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[#2D1E2F]/8 bg-[#FFF9D6]/30">
          <p className="text-[#2D1E2F]/40 text-xs font-medium">
            Página {currentPage} de {Math.max(1, Math.ceil(totalCount / 10))}
          </p>
          <div className="flex gap-2">
            <button
              onClick={prevPage}
              disabled={isFirstPage || loading}
              className="p-1.5 rounded-lg border border-[#2D1E2F]/15 text-[#2D1E2F]/60 hover:text-[#2D1E2F] hover:bg-[#2D1E2F]/5 disabled:opacity-50 disabled:pointer-events-none transition-colors"
              title="Página anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextPage}
              disabled={isLastPage || loading}
              className="p-1.5 rounded-lg border border-[#2D1E2F]/15 text-[#2D1E2F]/60 hover:text-[#2D1E2F] hover:bg-[#2D1E2F]/5 disabled:opacity-50 disabled:pointer-events-none transition-colors"
              title="Página siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

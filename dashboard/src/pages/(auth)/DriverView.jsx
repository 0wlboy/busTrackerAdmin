import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePaginatedUsers } from "../../hooks/usePaginatedUsers.js";
import {
  Search,
  Plus,
  Filter,
  ChevronDown,
  Circle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  FileText,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
// Opcional, si necesitas usar el contexto de autenticación:
// import { useAuth } from "../../context/AuthContext";

const CONNECTIONS = [
  { label: "Todos", value: null },
  { label: "Conectado", value: true },
  { label: "Desconectado", value: false },
];
const STATUSES = ["Todos", "Activo", "Inactivo"];

export default function DriverView() {
  // const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterOnline, setFilterOnline] = useState(null);
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [showFilters, setShowFilters] = useState(false);

  const {
    users,
    loading,
    error,
    totalCount,
    currentPage,
    isFirstPage,
    isLastPage,
    nextPage,
    prevPage,
  } = usePaginatedUsers({
    role: "Conductor",
    pageSize: 10,
    orderByField: "createdAt",
    orderDirection: "desc",
    isOnline: filterOnline,
  });

  // Filtramos en el cliente (búsqueda de texto y estado) sobre los resultados de la página actual
  const filtered = users.filter((u) => {
    const userName = u.name || "Sin nombre";
    const userEmail = u.email || "Sin correo";

    const matchSearch =
      userName.toLowerCase().includes(search.toLowerCase()) ||
      userEmail.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      filterStatus === "Todos" ||
      (filterStatus === "Activo"
        ? u.status === "active"
        : u.status === "inactive");

    return matchSearch && matchStatus;
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Reporte de Conductores", 14, 15);

    // Preparar los datos
    const tableColumn = [
      "Usuario",
      "Correo",
      "Conexión",
      "Estado",
      "Registrado",
      "Último acceso",
    ];
    const tableRows = [];

    filtered.forEach((user) => {
      const userData = [
        user.name || "Sin nombre",
        user.email || "Sin correo",
        user.isOnline ? "Conectado" : "Desconectado",
        user.status === "active" ? "Activo" : "Inactivo",
        user.createdAt
          ? new Date(
              user.createdAt.seconds
                ? user.createdAt.seconds * 1000
                : user.createdAt,
            ).toLocaleDateString()
          : "N/A",
        user.lastLogin
          ? new Date(
              user.lastLogin.seconds
                ? user.lastLogin.seconds * 1000
                : user.lastLogin,
            ).toLocaleDateString()
          : "N/A",
      ];
      tableRows.push(userData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save("conductores_vista_actual.pdf");
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#2D1E2F] text-2xl">Conductores</h1>
          <p className="text-[#2D1E2F]/50 text-sm mt-1">
            {totalCount !== undefined ? totalCount : "Cargando"} conductores en
            total
          </p>
        </div>

        {/* Botón para descargar PDF */}
        <button
          onClick={exportToPDF}
          disabled={loading || filtered.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#EFCC01] text-[#2D1E2F] rounded-xl hover:bg-[#F2D72B] transition-colors font-medium text-sm disabled:opacity-50 disabled:pointer-events-none"
        >
          <FileText className="w-4 h-4" />
          Descargar PDF
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-[#FFF3AD] border border-[#2D1E2F]/10 rounded-2xl p-4 space-y-3">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2D1E2F]/30" />
            <input
              type="text"
              placeholder="Buscar por nombre o correo en esta página..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#FFF9D6] border border-[#2D1E2F]/15 text-[#2D1E2F] placeholder-[#2D1E2F]/30 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#EFCC01] focus:ring-2 focus:ring-[#EFCC01]/20 transition-all"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm transition-colors ${
              showFilters || filterOnline !== null || filterStatus !== "Todos"
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
          <div className="flex flex-wrap gap-3 pt-3 border-t border-[#2D1E2F]/10">
            <div>
              <label className="text-[#2D1E2F]/40 text-xs mb-1.5 block">
                Conexión (Filtrado en servidor)
              </label>
              <div className="flex gap-2 flex-wrap">
                {CONNECTIONS.map((c) => (
                  <button
                    key={c.label}
                    onClick={() => setFilterOnline(c.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                      filterOnline === c.value
                        ? "bg-[#2D1E2F] text-white"
                        : "bg-[#FFF9D6] text-[#2D1E2F]/60 hover:text-[#2D1E2F] border border-[#2D1E2F]/15"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[#2D1E2F]/40 text-xs mb-1.5 block">
                Estado (Filtrado local)
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
            {(filterOnline !== null || filterStatus !== "Todos") && (
              <button
                onClick={() => {
                  setFilterOnline(null);
                  setFilterStatus("Todos");
                }}
                className="self-end text-xs text-red-500 hover:text-red-600 px-2 py-1.5"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        )}
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
                Cargando conductores...
              </span>
            </div>
          )}
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2D1E2F]/10">
                <th className="text-left text-[#2D1E2F]/40 text-xs px-5 py-3.5 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="text-left text-[#2D1E2F]/40 text-xs px-5 py-3.5 uppercase tracking-wider">
                  Conexión
                </th>
                <th className="text-left text-[#2D1E2F]/40 text-xs px-5 py-3.5 uppercase tracking-wider">
                  Estado
                </th>
                <th className="text-left text-[#2D1E2F]/40 text-xs px-5 py-3.5 uppercase tracking-wider">
                  Registrado
                </th>
                <th className="text-left text-[#2D1E2F]/40 text-xs px-5 py-3.5 uppercase tracking-wider">
                  Último acceso
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
                    No se encontraron conductores en esta página
                  </td>
                </tr>
              ) : (
                filtered.map((user) => {
                  const userName = user.name || "Sin nombre";
                  const initials =
                    userName !== "Sin nombre"
                      ? userName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()
                      : "SN";

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-[#2D1E2F]/5 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#EFCC01]/20 border border-[#EFCC01]/40 flex items-center justify-center shrink-0">
                            <span className="text-[#2D1E2F] text-xs font-bold">
                              {initials}
                            </span>
                          </div>
                          <div>
                            <p className="text-[#2D1E2F] text-sm font-medium">
                              {userName}
                            </p>
                            <p className="text-[#2D1E2F]/40 text-xs">
                              {user.email || "Sin correo"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`flex items-center gap-1.5 text-xs w-fit px-2.5 py-1 rounded-full ${
                            user.isOnline
                              ? "bg-green-100/80 text-green-700 border border-green-200"
                              : "bg-[#2D1E2F]/8 text-[#2D1E2F]/50 border border-[#2D1E2F]/10"
                          }`}
                        >
                          <Circle
                            className={`w-1.5 h-1.5 fill-current ${user.isOnline ? "text-green-500" : "text-[#2D1E2F]/30"}`}
                          />
                          {user.isOnline ? "Conectado" : "Desconectado"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`flex items-center gap-1.5 text-xs w-fit px-2.5 py-1 rounded-full ${
                            user.status === "active"
                              ? "bg-[#EFCC01]/25 text-[#2D1E2F] border border-[#EFCC01]/50"
                              : "bg-[#2D1E2F]/8 text-[#2D1E2F]/40"
                          }`}
                        >
                          <Circle className="w-1.5 h-1.5 fill-current" />
                          {user.status === "active" ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-[#2D1E2F]/50 text-sm">
                        {user.createdAt
                          ? new Date(
                              user.createdAt.seconds
                                ? user.createdAt.seconds * 1000
                                : user.createdAt,
                            ).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="px-5 py-4 text-[#2D1E2F]/50 text-sm">
                        {user.lastLogin
                          ? new Date(
                              user.lastLogin.seconds
                                ? user.lastLogin.seconds * 1000
                                : user.lastLogin,
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

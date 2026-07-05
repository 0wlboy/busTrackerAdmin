//import { useAuth } from "../../context/AuthContext";
import { Users, UserCheck, Truck, MapPin, Activity } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import StatCard from "../../components/UI/StatCard";
import CustomTooltip from "../../components/UI/CustomTooltip";
import { usePaginatedVehicles } from "../../hooks/usePaginatedVehicles";
import { usePaginatedUsers } from "../../hooks/usePaginatedUsers";
import { useGetRoutes } from "../../hooks/useGetRoutes";
import { useGetTracking } from "../../hooks/useGetTracking";

export default function Home() {
  //const { currentUser } = useAuth();

  // Conteos reales de vehículos desde Firestore
  const { totalCount: vehiclesLength, activeVehicleCount: activeVehicles } =
    usePaginatedVehicles();

  // Conteos reales de usuarios desde Firestore
  const {
    globalTotalUsers: totalUsers,
    totalDrivers,
    totalPassengers,
    activePassengersCount: activePassengers,
    activeDriversCount: activeDrivers,
    activeUsersList,
    hourlyActiveUsers: hourlyData,
  } = usePaginatedUsers();

  // Obtener rutas de Firestore
  const { routes: dbRoutes, topRoute } = useGetRoutes();

  // Obtener los vehículos en seguimiento que están online
  const { buses: trackingBuses } = useGetTracking();

  // Función para obtener el día de la semana abreviado ("Lun", "Mar", etc.) de una fecha o timestamp
  const getDayOfWeek = (dateVal) => {
    if (!dateVal) return null;
    let date;
    if (dateVal.seconds) {
      date = new Date(dateVal.seconds * 1000);
    } else if (dateVal.toDate) {
      date = dateVal.toDate();
    } else {
      date = new Date(dateVal);
    }
    if (isNaN(date.getTime())) return null;

    const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    return days[date.getDay()];
  };

  // Agrupar usuarios y vehículos por día de la semana
  const weeklyData = [
    { dia: "Lun", usuarios: 0, vehiculos: 0 },
    { dia: "Mar", usuarios: 0, vehiculos: 0 },
    { dia: "Mié", usuarios: 0, vehiculos: 0 },
    { dia: "Jue", usuarios: 0, vehiculos: 0 },
    { dia: "Vie", usuarios: 0, vehiculos: 0 },
    { dia: "Sáb", usuarios: 0, vehiculos: 0 },
    { dia: "Dom", usuarios: 0, vehiculos: 0 },
  ];

  // Sumar usuarios activos
  if (Array.isArray(activeUsersList)) {
    activeUsersList.forEach((user) => {
      const day = getDayOfWeek(user.lastLogin) || getDayOfWeek(new Date());
      if (day) {
        const target = weeklyData.find((d) => d.dia === day);
        if (target) {
          target.usuarios += 1;
        }
      }
    });
  }

  // Sumar vehículos activos
  if (Array.isArray(trackingBuses)) {
    trackingBuses.forEach((bus) => {
      const day = getDayOfWeek(bus.lastUpdated) || getDayOfWeek(new Date());
      if (day) {
        const target = weeklyData.find((d) => d.dia === day);
        if (target) {
          target.vehiculos += 1;
        }
      }
    });
  }

  const topRouteName = topRoute ? topRoute.name || topRoute.id : "Ninguna";
  const topRouteVehicles = topRoute ? topRoute.activeVehicles : 0;

  const routes = dbRoutes.map((r) => ({
    id: r.id,
    name: r.name || r.id,
    activeVehicles: r.activeVehicles || 0,
    totalVehicles: r.totalVehicles || 0,
    status: r.status || (r.activeVehicles > 0 ? "active" : "inactive"),
  }));

  const stats = [
    {
      title: "Conductores Activos",
      value: activeDrivers,
      subtitle: `De ${totalDrivers} registrados en el Sistema`,
      icon: <Users className="w-5 h-5 text-[#2D1E2F]" />,
      accent: false,
    },
    {
      title: "Pasajeros Activos",
      value: activePassengers,
      subtitle: `De ${totalPassengers} registrados en el Sistema`,
      icon: <UserCheck className="w-5 h-5 text-[#EFCC01]" />,
      accent: true,
    },
    {
      title: "Vehículos Activos",
      value: activeVehicles,
      subtitle: `De ${vehiclesLength} Registrados en el Sistema`,
      icon: <Truck className="w-5 h-5 text-[#2D1E2F]" />,
      accent: false,
    },
    {
      title: "Ruta con más vehículos",
      value: topRouteName,
      subtitle: `${topRouteVehicles} vehículos activos`,
      icon: <MapPin className="w-5 h-5 text-[#EFCC01]" />,
      accent: true,
    },
  ];

  const today = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[#2D1E2F] text-2xl">Dashboard</h1>
        <p className="text-[#2D1E2F]/50 text-sm mt-1">
          Resumen general del sistema — {today}
        </p>
        <p className="text-[#2D1E2F]/60 text-sm mt-2">
          Bienvenido{" "}
          <strong>
            {/*currentUser ? currentUser?.email : */ "admin@empresa.com"}
          </strong>
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <StatCard key={i} {...s} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Main chart */}
        <div className="xl:col-span-2 bg-[#FFF3AD] border border-[#2D1E2F]/10 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-[#2D1E2F] text-base font-semibold">
                Sesiones activas por hora
              </h2>
              <p className="text-[#2D1E2F]/40 text-xs mt-0.5">
                Usuarios con sesión activa durante el día
              </p>
            </div>
            <div className="flex items-center gap-2 bg-[#2D1E2F]/8 rounded-lg px-3 py-1.5">
              <Activity className="w-4 h-4 text-[#2D1E2F]" />
              <span className="text-[#2D1E2F] text-xs font-medium">Hoy</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={hourlyData}
                margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="sessionGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EFCC01" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#EFCC01" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#2D1E2F"
                  strokeOpacity={0.08}
                />
                <XAxis
                  dataKey="hora"
                  tick={{ fill: "#2D1E2F", fillOpacity: 0.4, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#2D1E2F", fillOpacity: 0.4, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="sesiones"
                  name="Sesiones"
                  stroke="#EFCC01"
                  strokeWidth={2.5}
                  fill="url(#sessionGrad)"
                  dot={{ fill: "#EFCC01", r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: "#2D1E2F" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly comparison */}
        <div className="bg-[#FFF3AD] border border-[#2D1E2F]/10 rounded-2xl p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="text-[#2D1E2F] text-base font-semibold">
              Actividad semanal
            </h2>
            <p className="text-[#2D1E2F]/40 text-xs mt-0.5">
              Usuarios y vehículos esta semana
            </p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={weeklyData}
                margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
                barSize={8}
                barGap={3}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#2D1E2F"
                  strokeOpacity={0.08}
                  vertical={false}
                />
                <XAxis
                  dataKey="dia"
                  tick={{ fill: "#2D1E2F", fillOpacity: 0.4, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#2D1E2F", fillOpacity: 0.4, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: "11px", color: "#2D1E2F" }}
                  iconType="circle"
                  iconSize={8}
                />
                <Bar
                  dataKey="usuarios"
                  name="Usuarios"
                  fill="#2D1E2F"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="vehiculos"
                  name="Vehículos"
                  fill="#EFCC01"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Routes summary */}
      <div className="bg-[#FFF3AD] border border-[#2D1E2F]/10 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[#2D1E2F] text-base font-semibold">
            Estado de rutas
          </h2>
          <span className="text-[#2D1E2F]/40 text-xs">
            {routes.filter((r) => r.status === "active").length} rutas activas
          </span>
        </div>
        <div className="space-y-3">
          {routes.map((route) => {
            const pct =
              route.totalVehicles > 0
                ? (route.activeVehicles / route.totalVehicles) * 100
                : 0;
            return (
              <div key={route.id} className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[#2D1E2F] text-sm truncate font-medium">
                      {route.name}
                    </span>
                    <span className="text-[#2D1E2F]/60 text-xs ml-2 shrink-0">
                      {route.activeVehicles}/{route.totalVehicles} vehículos
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
                              : "#f97316",
                      }}
                    />
                  </div>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full shrink-0 font-medium ${
                    route.status === "active"
                      ? "bg-[#EFCC01]/20 text-[#2D1E2F] border border-[#EFCC01]/40"
                      : "bg-[#2D1E2F]/8 text-[#2D1E2F]/50"
                  }`}
                >
                  {route.status === "active" ? "Activa" : "Inactiva"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

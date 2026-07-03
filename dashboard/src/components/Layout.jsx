import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  Truck,
  Map,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Bus,
  Ticket,
  Navigation2,
} from "lucide-react";

const navItems = [
  { to: "/home", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/passenger-view", label: "Pasajeros", icon: Users, end: false },
  { to: "/driver-view", label: "Conductores", icon: Truck, end: false },
  { to: "/vehicle-view", label: "Vehículos", icon: Bus, end: false },
  { to: "/ticket-price", label: "Precio de Pasaje", icon: Ticket, end: false },
  { to: "/routes-view", label: "Rutas", icon: Map, end: false },
  { to: "/maps", label: "Mapa en Vivo", icon: Navigation2, end: false },
  { to: "/usuarios/nuevo", label: "Crear Usuarios", icon: Users, end: false },
];

export default function Layout() {
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div
        className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 ${collapsed ? "justify-center" : ""}`}
      >
        <div className="w-9 h-9 rounded-xl bg-[#EFCC01] flex items-center justify-center shrink-0 shadow-md">
          <svg
            className="w-5 h-5 text-[#2D1E2F]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h10zM13 6l3 5h3l1 2v3h-1m-3-10v10"
            />
          </svg>
        </div>
        {!collapsed && (
          <div>
            <p className="text-white text-sm">FleetControl</p>
            <p className="text-white/40 text-xs">Panel Admin</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all group ${
                collapsed ? "justify-center" : ""
              } ${
                isActive
                  ? "bg-[#EFCC01] text-[#2D1E2F]"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={`w-5 h-5 shrink-0 ${isActive ? "text-[#2D1E2F]" : "text-white/60 group-hover:text-white"}`}
                />
                {!collapsed && (
                  <>
                    <span className="flex-1">{item.label}</span>
                  </>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User / Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <div
          className={`flex items-center gap-3 px-3 py-2.5 mb-2 ${collapsed ? "justify-center" : ""}`}
        >
          <div className="w-8 h-8 rounded-full bg-[#EFCC01]/20 border border-[#EFCC01]/40 flex items-center justify-center shrink-0 overflow-hidden">
            <span className="text-[#EFCC01] text-xs font-bold uppercase">
              {currentUser?.email ? currentUser.email.substring(0, 2) : "AD"}
            </span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm truncate">
                {currentUser?.email || "Usuario"}
              </p>
              <p className="text-white/40 text-xs truncate">Administrador</p>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-white/50 hover:bg-white/10 hover:text-white transition-all text-sm cursor-pointer ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#FFF9D6] overflow-hidden">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-[#2D1E2F] border-r border-white/10 transition-all duration-300 shrink-0 ${
          collapsed ? "w-16" : "w-60"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-60 bg-[#2D1E2F] border-r border-white/10 flex flex-col z-10">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 py-3 bg-[#FFF3AD] border-b border-[#2D1E2F]/10 shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden text-[#2D1E2F]/60 hover:text-[#2D1E2F] transition-colors cursor-pointer"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              className="hidden md:flex text-[#2D1E2F]/60 hover:text-[#2D1E2F] transition-colors cursor-pointer"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? (
                <Menu className="w-5 h-5" />
              ) : (
                <X className="w-5 h-5" />
              )}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[#2D1E2F]/60 text-sm">Sistema operativo</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

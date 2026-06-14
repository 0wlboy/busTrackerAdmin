import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

// Public pages
import Login from "./pages/(public)/login";

// Protected pages (auth)
import {
  Home,
  PassengerView,
  DriverView,
  RoutesView,
  AddRoute,
  AddUser,
  VehicleView,
  AddVehicule,
  TicketPrice,
} from "./pages/(auth)/exporter";

/**
 * Componente principal de la aplicación que define el enrutamiento.
 *
 * Se utiliza react-router-dom para el manejo de rutas.
 * Las rutas están divididas en públicas y protegidas.
 * Las rutas protegidas están envueltas en un Layout (que contiene la navbar lateral)
 * y un ProtectedRoute (que verifica si el usuario está autenticado).
 */
function App() {
  return (
    // Proveedor de contexto para la autenticación en toda la app
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Redirección por defecto: Si entra a la raíz, lo enviamos al home. 
              Si no está logueado, ProtectedRoute lo redirigirá al login. */}
          <Route path="/" element={<Navigate to="/home" replace />} />

          {/* =======================
              RUTAS PÚBLICAS
              ======================= */}
          <Route path="/login" element={<Login />} />

          {/* =======================
              RUTAS PROTEGIDAS (AUTH)
              ======================= */}
          {/* 
            Al usar una ruta padre con el componente Layout, 
            la barra lateral (Sidebar) se mantendrá visible en todas las rutas hijas.
            El componente ProtectedRoute asegura que solo usuarios logueados accedan.
          */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Rutas hijas que se renderizarán dentro del <Outlet /> del Layout */}
            <Route path="/home" element={<Home />} />
            <Route path="/passenger-view" element={<PassengerView />} />
            <Route path="/driver-view" element={<DriverView />} />
            <Route path="/routes-view" element={<RoutesView />} />
            <Route path="/rutas/nueva" element={<AddRoute />} />
            <Route path="/usuarios/nuevo" element={<AddUser />} />
            <Route path="/vehicle-view" element={<VehicleView />} />
            <Route path="/vehiculos/nuevo" element={<AddVehicule />} />
            <Route path="/ticket-price" element={<TicketPrice />} />
          </Route>

          {/* Redirección para cualquier otra ruta no encontrada (404) */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

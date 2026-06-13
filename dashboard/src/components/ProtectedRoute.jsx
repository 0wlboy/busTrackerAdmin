import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();

  // Si no hay un usuario logueado, redirigir a la página de login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Si está logueado, permitir el acceso a las rutas hijas (las páginas dentro de auth)
  return children;
}

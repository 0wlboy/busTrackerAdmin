import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Eye, EyeOff, LogIn, AlertCircle } from "lucide-react";

export default function Login() {
  const { login, currentUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@empresa.com");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Si el usuario ya está logueado, redirigir a /home
  useEffect(() => {
    if (currentUser) {
      navigate("/home", { replace: true });
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Por favor, ingresa tu email y contraseña.");
      setLoading(false);
      return;
    }

    // Expresiones regulares de validación
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^.{6,}$/;

    if (!emailRegex.test(email.trim())) {
      setError("El correo electrónico no es válido.");
      setLoading(false);
      return;
    }

    if (!passwordRegex.test(password)) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      setLoading(false);
      return;
    }

    try {
      await login(email, password);
      // El login fue exitoso, no necesitamos quitar el loading porque nos vamos de la página
      navigate("/home", { replace: true });
    } catch (err) {
      console.error("Error detallado durante el login:", err);
      const errorMessage = err.message || "Error desconocido";
      setError("Error al iniciar sesión: " + errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#2D1E2F] flex items-center justify-center p-4">
      {/* Decorative background circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#EFCC01]/5" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[#EFCC01]/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#EFCC01]/3" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#EFCC01] mb-4 shadow-lg shadow-[#EFCC01]/20">
            <svg
              className="w-8 h-8 text-[#2D1E2F]"
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
          <h1 className="text-white text-3xl mb-1">FleetControl</h1>
          <p className="text-white/40 text-sm">Panel de administración</p>
        </div>

        {/* Card */}
        <div className="bg-[#FFF3AD] rounded-2xl p-8 shadow-2xl shadow-black/30">
          <h2 className="text-[#2D1E2F] text-xl mb-1">Iniciar sesión</h2>
          <p className="text-[#2D1E2F]/50 text-sm mb-6">
            Ingresa tus credenciales para continuar
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[#2D1E2F] text-sm mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@empresa.com"
                className="w-full bg-[#FFF9D6] border border-[#2D1E2F]/15 text-[#2D1E2F] placeholder-[#2D1E2F]/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#EFCC01] focus:ring-2 focus:ring-[#EFCC01]/30 transition-all"
              />
            </div>

            <div>
              <label className="block text-[#2D1E2F] text-sm mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#FFF9D6] border border-[#2D1E2F]/15 text-[#2D1E2F] placeholder-[#2D1E2F]/30 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-[#EFCC01] focus:ring-2 focus:ring-[#EFCC01]/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2D1E2F]/40 hover:text-[#2D1E2F] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#EFCC01] hover:bg-[#EFCC01]/90 disabled:opacity-60 disabled:cursor-not-allowed text-[#2D1E2F] rounded-xl px-4 py-3 text-sm flex items-center justify-center gap-2 transition-colors shadow-md shadow-[#EFCC01]/20"
            >
              {loading ? (
                <svg
                  className="w-4 h-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
          </form>

          <div className="mt-6 flex flex-col gap-2 items-center text-sm">
            <p className="text-[#2D1E2F]/60">
              ¿No tienes cuenta?{" "}
              <Link
                to="/registro"
                className="text-[#2D1E2F] font-semibold hover:underline"
              >
                Registrarse
              </Link>
            </p>
            <Link
              to="/forgot-password"
              className="text-[#2D1E2F]/60 hover:text-[#2D1E2F] hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

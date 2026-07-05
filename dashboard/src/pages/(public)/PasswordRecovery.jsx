import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Mail, ArrowLeft, AlertCircle, CheckCircle2, SendHorizonal } from "lucide-react";

export default function PasswordRecovery() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Por favor, ingresa tu correo electrónico.");
      return;
    }

    if (!emailRegex.test(email.trim())) {
      setError("El correo electrónico no es válido.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        setError("No existe ninguna cuenta asociada a ese correo.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Demasiados intentos. Por favor, espera un momento e inténtalo de nuevo.");
      } else {
        setError("Ocurrió un error al enviar el correo. Inténtalo de nuevo.");
      }
    } finally {
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

          {sent ? (
            /* ── Estado de éxito ── */
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <div className="w-14 h-14 rounded-full bg-[#EFCC01]/20 border border-[#EFCC01]/40 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-[#2D1E2F]" />
              </div>
              <div>
                <h2 className="text-[#2D1E2F] text-xl mb-1">Correo enviado</h2>
                <p className="text-[#2D1E2F]/60 text-sm leading-relaxed">
                  Hemos enviado un enlace de recuperación a{" "}
                  <span className="font-semibold text-[#2D1E2F]">{email}</span>.
                  Revisa tu bandeja de entrada y sigue las instrucciones.
                </p>
              </div>
              <p className="text-[#2D1E2F]/40 text-xs">
                ¿No recibiste nada? Revisa tu carpeta de spam.
              </p>
              <Link
                to="/login"
                className="mt-2 flex items-center gap-2 text-[#2D1E2F] text-sm font-semibold hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al inicio de sesión
              </Link>
            </div>
          ) : (
            /* ── Formulario ── */
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#2D1E2F]/8 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-[#2D1E2F]/60" />
                </div>
                <div>
                  <h2 className="text-[#2D1E2F] text-xl">Recuperar contraseña</h2>
                  <p className="text-[#2D1E2F]/50 text-sm">
                    Te enviaremos un enlace a tu correo
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[#2D1E2F] text-sm mb-1.5">
                    Correo electrónico
                  </label>
                  <input
                    id="recovery-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="admin@empresa.com"
                    autoComplete="email"
                    className="w-full bg-[#FFF9D6] border border-[#2D1E2F]/15 text-[#2D1E2F] placeholder-[#2D1E2F]/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#EFCC01] focus:ring-2 focus:ring-[#EFCC01]/30 transition-all"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  id="send-recovery-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#EFCC01] hover:bg-[#EFCC01]/90 disabled:opacity-60 disabled:cursor-not-allowed text-[#2D1E2F] rounded-xl px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors shadow-md shadow-[#EFCC01]/20"
                >
                  {loading ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
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
                    <SendHorizonal className="w-4 h-4" />
                  )}
                  {loading ? "Enviando..." : "Enviar enlace de recuperación"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-[#2D1E2F]/60 hover:text-[#2D1E2F] text-sm transition-colors hover:underline"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver al inicio de sesión
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

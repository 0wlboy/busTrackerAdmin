import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { UserPlus, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";

export default function SignIn() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
    cedula: "",
    phone: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState(false);

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setSubmitError("");
  };

  const validate = () => {
    const e = {};
    const userNameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,50}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cedulaRegex = /^\d+$/;
    const phoneRegex = /^\+?[0-9\s\-]{7,15}$/;
    const passwordRegex = /^.{6,20}$/;

    if (!form.userName.trim()) {
      e.userName = "El nombre de usuario es requerido. Para solucionarlo, ingresa tu nombre completo usando solo letras y espacios.";
    } else if (!userNameRegex.test(form.userName.trim())) {
      e.userName = "El nombre de usuario debe contener únicamente letras y espacios, y tener una longitud de entre 3 y 50 caracteres.";
    }

    if (!form.email.trim()) {
      e.email = "El correo electrónico es requerido. Asegúrate de ingresar tu correo corporativo o personal.";
    } else if (!emailRegex.test(form.email.trim())) {
      e.email = "El formato de correo electrónico no es válido. Asegúrate de incluir el carácter '@' seguido de un dominio (ej. admin@empresa.com).";
    }

    if (!form.cedula.trim()) {
      e.cedula = "La cédula es requerida. Ingresa tu número de identificación nacional.";
    } else if (!cedulaRegex.test(form.cedula.trim())) {
      e.cedula = "La cédula debe contener únicamente dígitos numéricos. Elimina cualquier letra, punto, espacio o guion.";
    }

    if (form.phone.trim() && !phoneRegex.test(form.phone.trim())) {
      e.phone = "El número telefónico no es válido. Debe tener entre 7 y 15 dígitos y puede comenzar con el símbolo '+' (ej. +584120000000).";
    }

    if (!form.password) {
      e.password = "La contraseña es requerida. Ingresa una clave segura para proteger tu cuenta.";
    } else if (!passwordRegex.test(form.password)) {
      e.password = "La contraseña debe tener una longitud de entre 6 y 20 caracteres.";
    }

    if (!form.confirmPassword) {
      e.confirmPassword = "Es necesario confirmar la contraseña. Por favor, vuelve a escribir la clave.";
    } else if (form.password !== form.confirmPassword) {
      e.confirmPassword = "Las contraseñas no coinciden. Asegúrate de escribir exactamente los mismos caracteres en ambos campos.";
    }

    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      await register({
        userName: form.userName.trim(),
        email: form.email.trim(),
        password: form.password,
        cedula: form.cedula.trim(),
        phone: form.phone.trim(),
      });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setErrors((prev) => ({
          ...prev,
          email: "Este correo electrónico ya está registrado en el sistema. Para solucionarlo, usa un correo electrónico diferente o recupera la contraseña si la has olvidado.",
        }));
      } else if (err.code === "auth/weak-password") {
        setErrors((prev) => ({
          ...prev,
          password: "La contraseña ingresada es muy débil. Intenta usar una combinación de letras, números y caracteres especiales (mínimo 6 caracteres).",
        }));
      } else if (err.code === "auth/invalid-email") {
        setErrors((prev) => ({
          ...prev,
          email: "El formato del correo es inválido. Verifica que no tenga espacios adicionales y que incluya un dominio correcto.",
        }));
      } else {
        setSubmitError("Ocurrió un error inesperado al registrar la cuenta. Inténtalo de nuevo más tarde.");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (hasError) =>
    `w-full bg-[#FFF9D6] border text-[#2D1E2F] placeholder-[#2D1E2F]/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all ${
      hasError
        ? "border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/20"
        : "border-[#2D1E2F]/15 focus:border-[#EFCC01] focus:ring-[#EFCC01]/30"
    }`;

  return (
    <div className="min-h-screen bg-[#2D1E2F] flex items-center justify-center p-4">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#EFCC01]/5" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[#EFCC01]/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#EFCC01]/3" />
      </div>

      <div className="w-full max-w-lg relative z-10 py-8">
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h10zM13 6l3 5h3l1 2v3h-1m-3-10v10" />
            </svg>
          </div>
          <h1 className="text-white text-3xl mb-1">FleetControl</h1>
          <p className="text-white/40 text-sm">Registrar administrador</p>
        </div>

        {/* Card */}
        <div className="bg-[#FFF3AD] rounded-2xl p-8 shadow-2xl shadow-black/30">

          {success ? (
            /* ── Estado de éxito ── */
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <div className="w-14 h-14 rounded-full bg-[#EFCC01]/20 border border-[#EFCC01]/40 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-[#2D1E2F]" />
              </div>
              <div>
                <h2 className="text-[#2D1E2F] text-xl mb-1">¡Cuenta creada!</h2>
                <p className="text-[#2D1E2F]/60 text-sm">
                  El administrador <span className="font-semibold text-[#2D1E2F]">{form.userName}</span> ha sido registrado correctamente.
                  Redirigiendo al inicio de sesión…
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#2D1E2F]/8 flex items-center justify-center shrink-0">
                  <UserPlus className="w-5 h-5 text-[#2D1E2F]/60" />
                </div>
                <div>
                  <h2 className="text-[#2D1E2F] text-xl">Nueva cuenta</h2>
                  <p className="text-[#2D1E2F]/50 text-sm">
                    Rol asignado automáticamente:{" "}
                    <span className="font-semibold text-[#2D1E2F]">Administrador</span>
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Nombre de usuario */}
                <div>
                  <label className="block text-[#2D1E2F] text-sm mb-1.5">
                    Nombre de usuario *
                  </label>
                  <input
                    id="signin-username"
                    type="text"
                    value={form.userName}
                    onChange={(e) => set("userName", e.target.value)}
                    placeholder="Ej. Juan Pérez"
                    className={inputClass(!!errors.userName)}
                  />
                  {errors.userName && (
                    <div className="flex gap-2 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl p-3 text-[#991B1B] text-xs mt-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0 text-[#EF4444] mt-0.5" />
                      <div>
                        <span className="font-semibold block">Alerta en nombre de usuario</span>
                        <span>{errors.userName}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[#2D1E2F] text-sm mb-1.5">
                    Correo electrónico *
                  </label>
                  <input
                    id="signin-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="admin@empresa.com"
                    autoComplete="email"
                    className={inputClass(!!errors.email)}
                  />
                  {errors.email && (
                    <div className="flex gap-2 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl p-3 text-[#991B1B] text-xs mt-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0 text-[#EF4444] mt-0.5" />
                      <div>
                        <span className="font-semibold block">Alerta en correo electrónico</span>
                        <span>{errors.email}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Cédula y Teléfono en fila */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#2D1E2F] text-sm mb-1.5">
                      Cédula *
                    </label>
                    <input
                      id="signin-cedula"
                      type="text"
                      value={form.cedula}
                      onChange={(e) => set("cedula", e.target.value.replace(/\D/g, ""))}
                      placeholder="12345678"
                      className={inputClass(!!errors.cedula)}
                    />
                    {errors.cedula && (
                      <div className="flex gap-2 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl p-3 text-[#991B1B] text-xs mt-1.5">
                        <AlertCircle className="w-4 h-4 shrink-0 text-[#EF4444] mt-0.5" />
                        <div>
                          <span className="font-semibold block">Alerta en cédula</span>
                          <span>{errors.cedula}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[#2D1E2F] text-sm mb-1.5">
                      Teléfono
                    </label>
                    <input
                      id="signin-phone"
                      type="tel"
                      value={form.phone}
                      onChange={(e) => set("phone", e.target.value)}
                      placeholder="+1 234 567 8900"
                      className={inputClass(!!errors.phone)}
                    />
                    {errors.phone && (
                      <div className="flex gap-2 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl p-3 text-[#991B1B] text-xs mt-1.5">
                        <AlertCircle className="w-4 h-4 shrink-0 text-[#EF4444] mt-0.5" />
                        <div>
                          <span className="font-semibold block">Alerta en teléfono</span>
                          <span>{errors.phone}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contraseña */}
                <div>
                  <label className="block text-[#2D1E2F] text-sm mb-1.5">
                    Contraseña *
                  </label>
                  <div className="relative">
                    <input
                      id="signin-password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => set("password", e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      autoComplete="new-password"
                      className={inputClass(!!errors.password) + " pr-12"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2D1E2F]/40 hover:text-[#2D1E2F] transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <div className="flex gap-2 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl p-3 text-[#991B1B] text-xs mt-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0 text-[#EF4444] mt-0.5" />
                      <div>
                        <span className="font-semibold block">Alerta en contraseña</span>
                        <span>{errors.password}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirmar Contraseña */}
                <div>
                  <label className="block text-[#2D1E2F] text-sm mb-1.5">
                    Confirmar contraseña *
                  </label>
                  <div className="relative">
                    <input
                      id="signin-confirm-password"
                      type={showConfirm ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={(e) => set("confirmPassword", e.target.value)}
                      placeholder="Repite tu contraseña"
                      autoComplete="new-password"
                      className={inputClass(!!errors.confirmPassword) + " pr-12"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2D1E2F]/40 hover:text-[#2D1E2F] transition-colors"
                    >
                      {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <div className="flex gap-2 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl p-3 text-[#991B1B] text-xs mt-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0 text-[#EF4444] mt-0.5" />
                      <div>
                        <span className="font-semibold block">Alerta en confirmación</span>
                        <span>{errors.confirmPassword}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Error general */}
                {submitError && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {submitError}
                  </div>
                )}

                {/* Botón submit */}
                <button
                  id="signin-submit-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#EFCC01] hover:bg-[#EFCC01]/90 disabled:opacity-60 disabled:cursor-not-allowed text-[#2D1E2F] rounded-xl px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors shadow-md shadow-[#EFCC01]/20"
                >
                  {loading ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )}
                  {loading ? "Registrando..." : "Registrar administrador"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-[#2D1E2F]/60 text-sm">
                  ¿Ya tienes una cuenta?{" "}
                  <Link
                    to="/login"
                    className="text-[#2D1E2F] font-semibold hover:underline"
                  >
                    Iniciar sesión
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAddUser } from "../../hooks/useAddUser";
import { ArrowLeft, UserPlus, Check, Loader2, Eye, EyeOff } from "lucide-react";

export default function AddUser() {
  const { addUser, loading, hookError } = useAddUser();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "",
    status: "active",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "El nombre es requerido";
    if (!form.email.trim()) e.email = "El correo es requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Correo inválido";
    if (!form.password) e.password = "La contraseña es requerida";
    else if (form.password.length < 6) e.password = "Mínimo 6 caracteres";
    if (form.password !== form.confirmPassword)
      e.confirmPassword = "Las contraseñas no coinciden";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("AddUser: Formulario enviado. Iniciando validación...");
    setSubmitError(null);

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      console.warn("AddUser: Validación fallida con errores:", errs);
      setErrors(errs);
      return;
    }

    console.log(
      "AddUser: Validación superada. Llamando a addUser con los datos del formulario...",
    );

    // Llamar al hook
    const result = await addUser(form);

    if (result.success) {
      console.log("AddUser: ✅ Usuario creado correctamente. Redirigiendo...");
      setSubmitted(true);
      setTimeout(() => navigate("/usuarios"), 1500);
    } else {
      console.error(
        "AddUser: ❌ Hubo un error devuelto por el hook:",
        result.error,
      );
      setSubmitError(result.error.message);
    }
  };

  const set = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: "" }));
    console.log(
      `AddUser: Campo '${field}' actualizado a:`,
      field === "password" || field === "confirmPassword"
        ? "[REDACTED]"
        : value,
    );
  };

  const inputClass = (hasError) =>
    `w-full bg-[#FFF9D6] border text-[#2D1E2F] placeholder-[#2D1E2F]/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all ${
      hasError
        ? "border-red-400 focus:border-red-400 focus:ring-red-200"
        : "border-[#2D1E2F]/15 focus:border-[#EFCC01] focus:ring-[#EFCC01]/20"
    }`;

  const selectClass =
    "w-full bg-[#FFF9D6] border border-[#2D1E2F]/15 text-[#2D1E2F] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#EFCC01] focus:ring-2 focus:ring-[#EFCC01]/20 transition-all";

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6 bg-[#FFF9D6]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-[#EFCC01]/20 border border-[#EFCC01]/50 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-[#2D1E2F]" />
          </div>
          <h2 className="text-[#2D1E2F] text-xl mb-2">Usuario creado</h2>
          <p className="text-[#2D1E2F]/50 text-sm">
            Redirigiendo a la lista...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => {
            console.log("AddUser: Botón regresar presionado");
            navigate(-1);
          }}
          className="p-2 rounded-xl text-[#2D1E2F]/50 hover:text-[#2D1E2F] hover:bg-[#FFF3AD] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-[#2D1E2F] text-2xl">Agregar usuario</h1>
          <p className="text-[#2D1E2F]/50 text-sm mt-0.5">
            Completa los campos para registrar un nuevo usuario
          </p>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-[#FFF3AD] border border-[#2D1E2F]/10 rounded-2xl p-6 space-y-5"
      >
        {submitError && (
          <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm border border-red-100 flex items-center gap-2">
            <span className="font-bold">Error:</span> {submitError}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2">
            <label className="block text-[#2D1E2F] text-sm mb-1.5">
              Nombre completo *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Ej. Juan Pérez"
              className={inputClass(!!errors.name)}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[#2D1E2F] text-sm mb-1.5">
              Correo electrónico *
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="usuario@empresa.com"
              className={inputClass(!!errors.email)}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-[#2D1E2F] text-sm mb-1.5">
              Teléfono
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+1 234 567 8900"
              className={inputClass(false)}
            />
          </div>

          <div>
            <label className="block text-[#2D1E2F] text-sm mb-1.5">Rol *</label>
            <select
              value={form.role}
              onChange={(e) => set("role", e.target.value)}
              className={selectClass}
            >
              <option value="Operador">Conductor</option>
              <option value="Supervisor">Pasajero</option>
              <option value="Administrador">Administrador</option>
            </select>
          </div>

          <div>
            <label className="block text-[#2D1E2F] text-sm mb-1.5">
              Contraseña *
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className={inputClass(!!errors.password)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2/3 transform -translate-y-1/2"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Eye className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          <div>
            <label className="block text-[#2D1E2F] text-sm mb-1.5">
              Confirmar contraseña *
            </label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => set("confirmPassword", e.target.value)}
              placeholder="Repite la contraseña"
              className={inputClass(!!errors.confirmPassword)}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2 border-t border-[#2D1E2F]/10">
          <button
            type="button"
            onClick={() => {
              console.log("AddUser: Cancelando operación y regresando...");
              navigate(-1);
            }}
            className="flex-1 bg-[#FFF9D6] hover:bg-[#2D1E2F]/8 text-[#2D1E2F]/60 rounded-xl px-4 py-3 text-sm transition-colors border border-[#2D1E2F]/15"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-[#EFCC01] hover:bg-[#EFCC01]/85 text-[#2D1E2F] rounded-xl px-4 py-3 text-sm flex items-center justify-center gap-2 transition-colors shadow-md shadow-[#EFCC01]/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Crear usuario
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

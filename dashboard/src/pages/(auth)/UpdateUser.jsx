import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUpdateUser } from "../../hooks/exporter";
import DeleteModal from "../../components/modals/DeleteModal";
import {
  ArrowLeft,
  Check,
  Loader2,
  AlertCircle,
  Trash2,
  Save,
} from "lucide-react";

export default function UpdateUser() {
  const { id } = useParams(); // ID/UID del usuario a editar
  const navigate = useNavigate();

  // Hooks
  const {
    getUser,
    updateUser,
    deleteUser,
    loading: saving,
    error: hookError,
  } = useUpdateUser();

  const [initialLoading, setInitialLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    cedula: "",
    role: "",
    telefono: "",
  });
  const [originalForm, setOriginalForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Cargar datos iniciales del usuario
  useEffect(() => {
    async function loadUser() {
      if (!id) return;
      const res = await getUser(id);
      if (res.success && res.data) {
        const loaded = {
          name: String(res.data.userName || ""),
          email: String(res.data.email || ""),
          cedula: String(res.data.cedula ?? ""),
          role: String(res.data.role || ""),
          telefono: String(res.data.telefono || ""),
        };
        setForm(loaded);
        setOriginalForm(loaded);
      } else {
        setSubmitError(
          res.error?.message || "No se pudo cargar la información del usuario.",
        );
      }
      setInitialLoading(false);
    }
    loadUser();
  }, [id]);

  const validate = () => {
    const e = {};

    // Expresiones regulares de validación
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cedulaRegex = /^\d+$/;
    const phoneRegex = /^\+?[0-9\s\-]{7,15}$/;

    // Nombre completo
    if (!form.name.trim()) {
      e.name =
        "El nombre completo es requerido. Por favor, ingresa tu nombre y apellido.";
    } else if (form.name.trim().length < 2 || form.name.trim().length > 80) {
      e.name = "El nombre debe tener entre 2 y 80 caracteres.";
    }

    // Correo electrónico
    if (!form.email.trim()) {
      e.email =
        "El correo electrónico es requerido. Ingresa una dirección válida.";
    } else if (!emailRegex.test(form.email.trim())) {
      e.email =
        "El formato de correo no es válido. Asegúrate de incluir el carácter '@' y un dominio correcto (ej. nombre@correo.com).";
    }

    // Cédula
    const cedulaStr = String(form.cedula ?? "");
    if (!cedulaStr.trim()) {
      e.cedula =
        "La cédula es requerida. Por favor, ingresa tu documento de identidad.";
    } else if (!cedulaRegex.test(cedulaStr.trim())) {
      e.cedula =
        "La cédula debe contener únicamente números. Remueve cualquier letra, espacio, guión o punto.";
    }

    // Teléfono (opcional)
    const telefonoStr = String(form.telefono ?? "");
    if (telefonoStr.trim() && !phoneRegex.test(telefonoStr.trim())) {
      e.telefono =
        "El número telefónico no es válido. Asegúrate de ingresar entre 7 y 15 dígitos numéricos (ej. +584120000000).";
    }

    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    // Verificar que al menos un campo haya cambiado
    const hasChanged =
      form.name.trim() !== (originalForm?.name || "") ||
      form.email.trim() !== (originalForm?.email || "") ||
      form.cedula.trim() !== (originalForm?.cedula || "") ||
      form.role !== (originalForm?.role || "") ||
      form.telefono.trim() !== (originalForm?.telefono || "");

    if (!hasChanged) {
      setSubmitError("Debes modificar al menos un campo antes de guardar.");
      return;
    }

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setSubmitError("Revisa los campos marcados en rojo antes de guardar.");
      return;
    }

    const result = await updateUser(id, form);

    if (result.success) {
      setSubmitted(true);
      console.log("se actualizo el usuario");
      // Redirigir de regreso
      setTimeout(() => navigate(-1), 1500);
    } else {
      setSubmitError(result.error?.message || "Error al guardar los cambios.");
    }
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    const result = await deleteUser(id);
    if (result.success) {
      setShowDeleteModal(false);
      setSubmitted(true);
      setTimeout(() => navigate(-1), 1500);
    } else {
      setShowDeleteModal(false);
      setSubmitError(result.error?.message || "Error al eliminar el usuario.");
    }
  };

  const set = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: "" }));
  };

  const inputClass = (hasError) =>
    `w-full bg-[#FFF9D6] border text-[#2D1E2F] placeholder-[#2D1E2F]/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all ${
      hasError
        ? "border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/20"
        : "border-[#2D1E2F]/15 focus:border-[#EFCC01] focus:ring-[#EFCC01]/20"
    }`;

  const selectClass =
    "w-full bg-[#FFF9D6] border border-[#2D1E2F]/15 text-[#2D1E2F] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#EFCC01] focus:ring-2 focus:ring-[#EFCC01]/20 transition-all";

  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-6">
        <Loader2 className="w-10 h-10 text-[#EFCC01] animate-spin mb-4" />
        <span className="text-sm text-[#2D1E2F]/70 font-medium">
          Cargando detalles del usuario...
        </span>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6 bg-[#FFF9D6]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-[#EFCC01]/20 border border-[#EFCC01]/50 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-[#2D1E2F]" />
          </div>
          <h2 className="text-[#2D1E2F] text-xl mb-2">Operación completada</h2>
          <p className="text-[#2D1E2F]/50 text-sm">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl text-[#2D1E2F]/50 hover:text-[#2D1E2F] hover:bg-[#FFF3AD] transition-colors"
          type="button"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-[#2D1E2F] text-2xl">Editar usuario</h1>
          <p className="text-[#2D1E2F]/50 text-sm mt-0.5">
            Modifica los detalles del perfil de usuario en el sistema
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
              Nombre completo
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Ej. Juan Pérez"
              className={inputClass(!!errors.name)}
            />
            {errors.name && (
              <div className="flex gap-2 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl p-3 text-[#991B1B] text-xs mt-1.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#EF4444] mt-0.5" />
                <div>
                  <span className="font-semibold block">
                    Alerta en nombre completo
                  </span>
                  <span>{errors.name}</span>
                </div>
              </div>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[#2D1E2F] text-sm mb-1.5">
              Correo electrónico
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="usuario@empresa.com"
              className={inputClass(!!errors.email)}
            />
            {errors.email && (
              <div className="flex gap-2 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl p-3 text-[#991B1B] text-xs mt-1.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#EF4444] mt-0.5" />
                <div>
                  <span className="font-semibold block">
                    Alerta en correo electrónico
                  </span>
                  <span>{errors.email}</span>
                </div>
              </div>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[#2D1E2F] text-sm mb-1.5">
              Cédula
            </label>
            <input
              type="text"
              value={form.cedula}
              onChange={(e) => set("cedula", e.target.value.replace(/\D/g, ""))}
              placeholder="Ej. 12345678"
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
              type="tel"
              value={form.telefono}
              onChange={(e) => set("telefono", e.target.value)}
              placeholder="+1 234 567 8900"
              className={inputClass(!!errors.telefono)}
            />
            {errors.telefono && (
              <div className="flex gap-2 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl p-3 text-[#991B1B] text-xs mt-1.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#EF4444] mt-0.5" />
                <div>
                  <span className="font-semibold block">
                    Alerta en teléfono
                  </span>
                  <span>{errors.telefono}</span>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-[#2D1E2F] text-sm mb-1.5">Rol</label>
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
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-[#2D1E2F]/10 mt-6">
          <button
            type="button"
            onClick={handleDelete}
            disabled={saving}
            className="w-full sm:w-auto px-4 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-red-600/10"
          >
            <Trash2 className="w-4 h-4" />
            Eliminar Usuario
          </button>
          <div className="hidden sm:block flex-1" />
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={saving}
            className="w-full sm:w-auto bg-[#FFF9D6] hover:bg-[#2D1E2F]/8 text-[#2D1E2F]/60 rounded-xl px-4 py-3 text-sm transition-colors border border-[#2D1E2F]/15"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto bg-[#EFCC01] hover:bg-[#EFCC01]/85 text-[#2D1E2F] rounded-xl px-4 py-3 text-sm flex items-center justify-center gap-2 transition-colors shadow-md shadow-[#EFCC01]/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </form>
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        loading={saving}
      />
    </div>
  );
}

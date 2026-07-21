import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetRoutes, useUpdateVehicle, useAvailableDrivers } from "../../hooks/exporter";
import DriverSearchInput from "../../components/ui/DriverSearchInput";
import {
  ArrowLeft,
  Check,
  Loader2,
  Upload,
  Bus,
  Image as ImageIcon,
  AlertCircle,
  Trash2,
} from "lucide-react";

export default function UpdateVehicle() {
  const { id } = useParams(); // ID del vehículo a editar (que es el driverId viejo)
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Hooks
  const { routes, loading: loadingRoutes } = useGetRoutes();
  const {
    getVehicle,
    updateVehicle,
    deleteVehicle,
    loading: saving,
    error: hookError,
  } = useUpdateVehicle();

  const [initialLoading, setInitialLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentDriverId, setCurrentDriverId] = useState(id); // para useAvailableDrivers
  const [form, setForm] = useState({
    driverId: "",
    routeId: "",
    plate: "",
    seats: "",
    imageFile: null,
  });
  const [originalForm, setOriginalForm] = useState(null);
  const [existingImageUri, setExistingImageUri] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);

  // excludeDriverId: el conductor actual puede seguir siendo elegido
  const { drivers: availableDrivers, loading: loadingDrivers } = useAvailableDrivers(currentDriverId);

  // Cargar datos iniciales del vehículo
  useEffect(() => {
    async function loadVehicle() {
      if (!id) return;
      const res = await getVehicle(id);
      if (res.success && res.data) {
        const loaded = {
          driverId: res.data.driverId || "",
          routeId: res.data.routeId || "",
          plate: res.data.plate || "",
          seats: String(res.data.seats || ""),
          imageFile: null,
        };
        setForm(loaded);
        setOriginalForm(loaded);
        setCurrentDriverId(res.data.driverId || null);
        setExistingImageUri(res.data.imageUri || null);
        setImagePreview(res.data.imageUri || null);
      } else {
        setSubmitError(
          res.error?.message ||
            "No se pudo cargar la información del vehículo.",
        );
      }
      setInitialLoading(false);
    }
    loadVehicle();
  }, [id]);

  // Inicializar routeId una vez se cargan las rutas si está vacío
  useEffect(() => {
    if (routes && routes.length > 0 && !form.routeId) {
      setForm((p) => ({ ...p, routeId: routes[0].id }));
    }
  }, [routes, form.routeId]);

  const validate = () => {
    const e = {};
    const plateRegex = /^[a-zA-Z0-9\-]{5,10}$/;

    if (!form.driverId.trim()) {
      e.driverId =
        "El ID del conductor es requerido. Por favor, ingresa el identificador único (UID) del conductor registrado.";
    }
    if (!form.plate.trim()) {
      e.plate =
        "La placa del vehículo es requerida. Por favor, escribe la combinación alfanumérica oficial.";
    } else if (!plateRegex.test(form.plate.trim())) {
      e.plate =
        "El formato de la placa no es válido o no cumple con la longitud. Debe tener entre 5 y 10 caracteres y contener solo letras, números o guion (ej. ABC-1234).";
    }
    if (!form.routeId) {
      e.routeId =
        "Debes seleccionar una ruta. Asigna una ruta del menú desplegable para continuar.";
    }
    if (!form.seats) {
      e.seats = "La cantidad de asientos es requerida.";
    } else if (isNaN(form.seats) || Number(form.seats) <= 0) {
      e.seats =
        "La cantidad de asientos debe ser un número entero positivo válido mayor a cero. Por favor, corrígelo.";
    }
    if (!form.imageFile && !imagePreview) {
      e.imageFile =
        "Debes subir una foto del vehículo. Selecciona una imagen desde tus archivos para poder identificar la unidad.";
    }
    return e;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((p) => ({ ...p, imageFile: file }));
      setErrors((p) => ({ ...p, imageFile: "" }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    // Verificar que al menos un campo haya cambiado
    const hasChanged =
      form.imageFile !== null ||
      form.driverId.trim() !== (originalForm?.driverId || "") ||
      form.routeId !== (originalForm?.routeId || "") ||
      form.plate.trim() !== (originalForm?.plate || "") ||
      String(form.seats) !== String(originalForm?.seats || "");

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

    setUploading(true);
    try {
      const res = await updateVehicle(id, {
        imgFile: form.imageFile,
        driverId: form.driverId.trim(),
        routeId: form.routeId,
        plate: form.plate,
        seats: form.seats,
        existingImageUri: existingImageUri,
      });

      if (!res.success) {
        throw new Error(
          res.error?.message || "Error al actualizar los datos del vehículo.",
        );
      }

      setSubmitted(true);
      setTimeout(() => navigate("/vehicle-view"), 1500);
    } catch (err) {
      const msg = err.message || "";
      if (
        msg.includes("conductor ya tiene un vehículo") ||
        msg.includes("already has")
      ) {
        setErrors((prev) => ({
          ...prev,
          driverId:
            "Este conductor ya tiene un vehículo asignado. Para solucionarlo, ingresa el UID de un conductor diferente sin asignaciones.",
        }));
      } else if (
        msg.includes("no existe") ||
        msg.includes("not exist") ||
        msg.includes("not found")
      ) {
        setErrors((prev) => ({
          ...prev,
          driverId:
            "El ID del conductor ingresado no existe en la base de datos de usuarios. Por favor, verifica el UID o regístralo primero.",
        }));
      } else {
        setSubmitError(msg);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "¿Estás completamente seguro de que deseas eliminar este vehículo?",
      )
    ) {
      return;
    }
    setUploading(true);
    try {
      const res = await deleteVehicle(id);
      if (res.success) {
        setSubmitted(true);
        setTimeout(() => navigate("/vehicle-view"), 1500);
      } else {
        throw new Error(res.error?.message || "Error al eliminar el vehículo");
      }
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const setField = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: "" }));
  };

  const inputClass = (hasError) =>
    `w-full bg-[#FFF9D6] border text-[#2D1E2F] placeholder-[#2D1E2F]/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all ${
      hasError
        ? "border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/20"
        : "border-[#2D1E2F]/15 focus:border-[#EFCC01] focus:ring-[#EFCC01]/20"
    }`;

  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-6">
        <Loader2 className="w-10 h-10 text-[#EFCC01] animate-spin mb-4" />
        <span className="text-sm text-[#2D1E2F]/70 font-medium">
          Cargando detalles del vehículo...
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
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl text-[#2D1E2F]/50 hover:text-[#2D1E2F] hover:bg-[#FFF3AD] transition-colors"
          type="button"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-[#2D1E2F] text-2xl">Editar Vehículo</h1>
          <p className="text-[#2D1E2F]/50 text-sm mt-0.5">
            Modifica los detalles y guarda los cambios para la unidad de
            transporte.
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
          {/* Photo Upload */}
          <div className="sm:col-span-2">
            <label className="block text-[#2D1E2F] text-sm mb-1.5">
              Foto del vehículo
            </label>
            <div
              className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                errors.imageFile
                  ? "border-red-400 bg-red-50/50"
                  : "border-[#2D1E2F]/20 hover:border-[#EFCC01] bg-[#FFF9D6]"
              } overflow-hidden`}
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-[#2D1E2F]/40 space-y-2">
                  <ImageIcon className="w-10 h-10" />
                  <p className="text-sm">
                    Toca para seleccionar una nueva imagen
                  </p>
                </div>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
            {errors.imageFile && (
              <div className="flex gap-2 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl p-3 text-[#991B1B] text-xs mt-1.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#EF4444] mt-0.5" />
                <div>
                  <span className="font-semibold block">
                    Alerta en foto del vehículo
                  </span>
                  <span>{errors.imageFile}</span>
                </div>
              </div>
            )}
          </div>

          {/* Driver Search */}
          <div className="sm:col-span-2">
            <label className="block text-[#2D1E2F] text-sm mb-1.5">
              Conductor
            </label>
            <DriverSearchInput
              value={form.driverId}
              onChange={(id) => setField("driverId", id)}
              drivers={availableDrivers}
              loading={loadingDrivers}
              hasError={!!errors.driverId}
              error={errors.driverId}
            />
            <p className="text-[#2D1E2F]/40 text-xs mt-1">
              Solo se muestran conductores sin vehículo asignado. Si se cambia, se transferirá el vehículo.
            </p>
          </div>

          {/* Plate */}
          <div className="sm:col-span-2">
            <label className="block text-[#2D1E2F] text-sm mb-1.5">
              Placa del Vehiculo
            </label>
            <input
              type="text"
              value={form.plate}
              onChange={(e) => setField("plate", e.target.value)}
              placeholder="Escribe la placa del vehiculo..."
              className={inputClass(!!errors.plate)}
            />
            <p className="text-[#2D1E2F]/40 text-xs mt-1">
              La placa del vehiculo.
            </p>
            {errors.plate && (
              <div className="flex gap-2 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl p-3 text-[#991B1B] text-xs mt-1.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#EF4444] mt-0.5" />
                <div>
                  <span className="font-semibold block">
                    Alerta en placa del vehículo
                  </span>
                  <span>{errors.plate}</span>
                </div>
              </div>
            )}
          </div>

          {/* Seats */}
          <div>
            <label className="block text-[#2D1E2F] text-sm mb-1.5">
              Cantidad de Asientos
            </label>
            <input
              type="number"
              value={form.seats}
              onChange={(e) => setField("seats", e.target.value)}
              placeholder="Ej. 24"
              min="1"
              className={inputClass(!!errors.seats)}
            />
            {errors.seats && (
              <div className="flex gap-2 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl p-3 text-[#991B1B] text-xs mt-1.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#EF4444] mt-0.5" />
                <div>
                  <span className="font-semibold block">
                    Alerta en cantidad de asientos
                  </span>
                  <span>{errors.seats}</span>
                </div>
              </div>
            )}
          </div>

          {/* Route */}
          <div>
            <label className="block text-[#2D1E2F] text-sm mb-1.5">Ruta</label>
            <select
              value={form.routeId}
              onChange={(e) => setField("routeId", e.target.value)}
              disabled={loadingRoutes}
              className={inputClass(!!errors.routeId)}
            >
              {loadingRoutes ? (
                <option value="">Cargando rutas...</option>
              ) : routes.length > 0 ? (
                routes.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.routeName || route.name || route.id}
                  </option>
                ))
              ) : (
                <option value="">No hay rutas disponibles</option>
              )}
            </select>
            {errors.routeId && (
              <div className="flex gap-2 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl p-3 text-[#991B1B] text-xs mt-1.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#EF4444] mt-0.5" />
                <div>
                  <span className="font-semibold block">Alerta en ruta</span>
                  <span>{errors.routeId}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-[#2D1E2F]/10 mt-6">
          <button
            type="button"
            onClick={handleDelete}
            disabled={uploading || saving}
            className="w-full sm:w-auto px-4 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-red-600/10"
          >
            <Trash2 className="w-4 h-4" />
            Eliminar Vehículo
          </button>
          <div className="hidden sm:block flex-1" />
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={uploading || saving}
            className="w-full sm:w-auto bg-[#FFF9D6] hover:bg-[#2D1E2F]/8 text-[#2D1E2F]/60 rounded-xl px-4 py-3 text-sm transition-colors border border-[#2D1E2F]/15"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={uploading || saving}
            className="w-full sm:w-auto bg-[#EFCC01] hover:bg-[#EFCC01]/85 text-[#2D1E2F] rounded-xl px-4 py-3 text-sm flex items-center justify-center gap-2 transition-colors shadow-md shadow-[#EFCC01]/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading || saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

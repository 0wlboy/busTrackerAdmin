import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useGetRoutes, useAddVehicle } from "../../hooks/exporter";
import {
  ArrowLeft,
  Check,
  Loader2,
  Upload,
  Bus,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react";

export default function AddVehicule() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Hooks
  const { routes, loading: loadingRoutes } = useGetRoutes();

  const { addVehicle } = useAddVehicle();

  const [submitted, setSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    driverId: "",
    routeId: "",
    plate: "",
    seats: "",
    imageFile: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);

  // Initialize routeId once routes are loaded if it's empty
  useEffect(() => {
    if (routes && routes.length > 0 && !form.routeId) {
      setForm((p) => ({ ...p, routeId: routes[0].id }));
    }
  }, [routes, form.routeId]);

  const validate = () => {
    const e = {};
    const plateRegex = /^[a-zA-Z0-9\-]{5,10}$/;

    if (!form.driverId.trim()) {
      e.driverId = "El ID del conductor es requerido. Por favor, ingresa el identificador único (UID) del conductor registrado.";
    }
    if (!form.plate.trim()) {
      e.plate = "La placa del vehículo es requerida. Por favor, escribe la combinación alfanumérica oficial.";
    } else if (!plateRegex.test(form.plate.trim())) {
      e.plate = "El formato de la placa no es válido o no cumple con la longitud. Debe tener entre 5 y 10 caracteres y contener solo letras, números o guion (ej. ABC-1234).";
    }
    if (!form.routeId) {
      e.routeId = "Debes seleccionar una ruta. Asigna una ruta del menú desplegable para continuar.";
    }
    if (!form.seats) {
      e.seats = "La cantidad de asientos es requerida.";
    } else if (isNaN(form.seats) || Number(form.seats) <= 0) {
      e.seats = "La cantidad de asientos debe ser un número entero positivo válido mayor a cero. Por favor, corrígelo.";
    }
    if (!form.imageFile) {
      e.imageFile = "Debes subir una foto del vehículo. Selecciona una imagen desde tus archivos para poder identificar la unidad.";
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

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setUploading(true);
    try {
      // 1. Save vehicle and connect to driver
      const addResult = await addVehicle({
        driverId: form.driverId.trim(),
        routeId: form.routeId,
        seats: form.seats,
        imgFile: form.imageFile,
      });

      if (!addResult.success) {
        throw new Error(
          addResult.error?.message ||
            "Error al enlazar el vehículo con el usuario.",
        );
      }

      // Success
      setSubmitted(true);
      setTimeout(() => navigate("/vehicle-view"), 1500);
    } catch (err) {
      const msg = err.message || "";
      if (msg.includes("conductor ya tiene un vehículo") || msg.includes("already has")) {
        setErrors((prev) => ({
          ...prev,
          driverId: "Este conductor ya tiene un vehículo asignado. Para solucionarlo, ingresa el UID de un conductor diferente sin asignaciones.",
        }));
      } else if (msg.includes("no existe") || msg.includes("not exist") || msg.includes("not found")) {
        setErrors((prev) => ({
          ...prev,
          driverId: "El ID del conductor ingresado no existe en la base de datos de usuarios. Por favor, verifica el UID o regístralo primero.",
        }));
      } else {
        setSubmitError(msg);
      }
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

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6 bg-[#FFF9D6]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-[#EFCC01]/20 border border-[#EFCC01]/50 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-[#2D1E2F]" />
          </div>
          <h2 className="text-[#2D1E2F] text-xl mb-2">Vehículo registrado</h2>
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
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-[#2D1E2F] text-2xl">Agregar Vehículo</h1>
          <p className="text-[#2D1E2F]/50 text-sm mt-0.5">
            Ingresa los detalles y conecta el vehículo a un conductor.
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
              Foto del vehículo *
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
                  <p className="text-sm">Toca para seleccionar una imagen</p>
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
                  <span className="font-semibold block">Alerta en foto del vehículo</span>
                  <span>{errors.imageFile}</span>
                </div>
              </div>
            )}
          </div>

          {/* Driver ID */}
          <div className="sm:col-span-2">
            <label className="block text-[#2D1E2F] text-sm mb-1.5">
              ID del Conductor *
            </label>
            <input
              type="text"
              value={form.driverId}
              onChange={(e) => setField("driverId", e.target.value)}
              placeholder="Pega el UID del usuario aquí..."
              className={inputClass(!!errors.driverId)}
            />
            <p className="text-[#2D1E2F]/40 text-xs mt-1">
              El usuario debe existir y tener el rol de conductor.
            </p>
            {errors.driverId && (
              <div className="flex gap-2 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl p-3 text-[#991B1B] text-xs mt-1.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#EF4444] mt-0.5" />
                <div>
                  <span className="font-semibold block">Alerta en ID del Conductor</span>
                  <span>{errors.driverId}</span>
                </div>
              </div>
            )}
          </div>

          {/* Plate */}
          <div className="sm:col-span-2">
            <label className="block text-[#2D1E2F] text-sm mb-1.5">
              Placa del Vehiculo *
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
                  <span className="font-semibold block">Alerta en placa del vehículo</span>
                  <span>{errors.plate}</span>
                </div>
              </div>
            )}
          </div>

          {/* Seats */}
          <div>
            <label className="block text-[#2D1E2F] text-sm mb-1.5">
              Cantidad de Asientos *
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
                  <span className="font-semibold block">Alerta en cantidad de asientos</span>
                  <span>{errors.seats}</span>
                </div>
              </div>
            )}
          </div>

          {/* Route */}
          <div>
            <label className="block text-[#2D1E2F] text-sm mb-1.5">
              Ruta *
            </label>
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
        <div className="flex items-center gap-3 pt-4 border-t border-[#2D1E2F]/10 mt-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 bg-[#FFF9D6] hover:bg-[#2D1E2F]/8 text-[#2D1E2F]/60 rounded-xl px-4 py-3 text-sm transition-colors border border-[#2D1E2F]/15"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={uploading}
            className="flex-1 bg-[#EFCC01] hover:bg-[#EFCC01]/85 text-[#2D1E2F] rounded-xl px-4 py-3 text-sm flex items-center justify-center gap-2 transition-colors shadow-md shadow-[#EFCC01]/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Registrar vehículo
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

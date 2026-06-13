import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAddRoute } from "../../hooks/useAddRoute";
import { Input } from "../../components/ui/Input";
import { Loader2, ArrowLeft, Save, MapPin, Route, Map } from "lucide-react";

export default function AddRoute() {
  const navigate = useNavigate();
  // Extraemos las funcionalidades del hook useAddRoute
  const { addRoute, loading, error } = useAddRoute();

  // Estado local para los campos del formulario
  const [formData, setFormData] = useState({
    name: "",
    origin: "",
    destination: "",
    status: "active",
  });

  // Manejador de cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    console.log(`AddRoute: Campo '${name}' actualizado a:`, value);
  };

  // Manejador del envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("AddRoute: Formulario enviado. Datos actuales:", formData);

    // Validación de campos básicos
    if (!formData.name || !formData.origin || !formData.destination) {
      console.warn("AddRoute: Validación fallida - Faltan campos obligatorios");
      alert("Por favor completa todos los campos requeridos.");
      return;
    }

    console.log("AddRoute: Llamando a addRoute del hook...");
    // Intentamos agregar la ruta usando el hook
    const result = await addRoute(formData);

    if (result.success) {
      console.log(
        "AddRoute: Ruta agregada correctamente, redirigiendo a /routes-view",
      );
      navigate("/routes-view"); // Regresa a la vista principal de rutas
    } else {
      console.error(
        "AddRoute: Error en la creación devuelto por el hook:",
        result.error,
      );
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Encabezado */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => {
            console.log("AddRoute: Botón regresar clickeado");
            navigate(-1);
          }}
          className="p-2 hover:bg-[#2D1E2F]/5 rounded-xl transition-colors"
          title="Regresar"
        >
          <ArrowLeft className="w-5 h-5 text-[#2D1E2F]" />
        </button>
        <div>
          <h1 className="text-[#2D1E2F] text-2xl font-medium">
            Agregar Nueva Ruta
          </h1>
          <p className="text-[#2D1E2F]/50 text-sm mt-1">
            Completa los detalles para registrar una nueva ruta en el sistema
          </p>
        </div>
      </div>

      {/* Tarjeta del Formulario */}
      <div className="bg-[#FFF3AD] border border-[#2D1E2F]/10 rounded-3xl p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mensaje de Error (si existe desde el hook) */}
          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm border border-red-100 flex items-center gap-2">
              <span className="font-bold">Error:</span>{" "}
              {error.message || "Ocurrió un error al guardar la ruta."}
            </div>
          )}

          {/* Nombre de la Ruta */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#2D1E2F]/80 flex items-center gap-2">
              <Route className="w-4 h-4 text-[#EFCC01]" />
              Nombre de la Ruta <span className="text-red-500">*</span>
            </label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ej. Ruta Norte - Centro"
              className="bg-[#FFF9D6] border-[#2D1E2F]/15 focus-visible:ring-[#EFCC01]/30 focus-visible:border-[#EFCC01] text-[#2D1E2F]"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Origen */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#2D1E2F]/80 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#2D1E2F]" />
                Origen <span className="text-red-500">*</span>
              </label>
              <Input
                name="origin"
                value={formData.origin}
                onChange={handleChange}
                placeholder="Punto de partida (Ej. Estación Central)"
                className="bg-[#FFF9D6] border-[#2D1E2F]/15 focus-visible:ring-[#EFCC01]/30 focus-visible:border-[#EFCC01] text-[#2D1E2F]"
                required
              />
            </div>

            {/* Destino */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#2D1E2F]/80 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#EFCC01]" />
                Destino <span className="text-red-500">*</span>
              </label>
              <Input
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                placeholder="Punto de llegada (Ej. Terminal Norte)"
                className="bg-[#FFF9D6] border-[#2D1E2F]/15 focus-visible:ring-[#EFCC01]/30 focus-visible:border-[#EFCC01] text-[#2D1E2F]"
                required
              />
            </div>
          </div>

          {/* Estado por defecto */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#2D1E2F]/80">
              Estado Inicial
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full flex h-10 rounded-md border border-[#2D1E2F]/15 bg-[#FFF9D6] px-3 py-2 text-sm text-[#2D1E2F] outline-none focus-visible:border-[#EFCC01] focus-visible:ring-[3px] focus-visible:ring-[#EFCC01]/30 transition-all"
            >
              <option value="active">Activa</option>
              <option value="inactive">Inactiva</option>
            </select>
          </div>

          {/* Acciones */}
          <div className="pt-6 flex justify-end gap-3 border-t border-[#2D1E2F]/10">
            <button
              type="button"
              onClick={() => {
                console.log("AddRoute: Cancelando y regresando...");
                navigate(-1);
              }}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-[#2D1E2F]/70 hover:bg-[#2D1E2F]/10 hover:text-[#2D1E2F] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-[#EFCC01] hover:bg-[#EFCC01]/85 text-[#2D1E2F] px-6 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-md shadow-[#EFCC01]/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Guardar Ruta
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAddRoute } from "../../hooks/useAddRoute";
import { Input } from "../../components/ui/Input";
import { Loader2, ArrowLeft, Save, MapPin, Route, Map, Palette } from "lucide-react";

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
    color: "#EFCC01",
    strokeColor: "#2D1E2F",
  });

  // Valida que el hex ingresado sea un color válido
  const isValidHex = (val) => /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(val);

  // Sincroniza el hex input con el color picker y viceversa
  const handleColorChange = (hex) => {
    setFormData((prev) => ({ ...prev, color: hex }));
  };

  const handleStrokeColorChange = (hex) => {
    setFormData((prev) => ({ ...prev, strokeColor: hex }));
  };

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

          {/* Color de Fondo de la Ruta */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#2D1E2F]/80 flex items-center gap-2">
              <Palette className="w-4 h-4 text-[#EFCC01]" />
              Color de Fondo de la Ruta
            </label>
            <div className="flex items-center gap-3">
              {/* Native color picker */}
              <div className="relative shrink-0">
                <input
                  type="color"
                  value={isValidHex(formData.color) ? formData.color : "#EFCC01"}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-12 h-10 rounded-lg border border-[#2D1E2F]/15 cursor-pointer p-0.5 bg-[#FFF9D6]"
                  title="Seleccionar color de fondo"
                />
              </div>
              {/* Hex text input */}
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2D1E2F]/40 text-sm font-mono select-none">#</span>
                <input
                  type="text"
                  value={formData.color.replace("#", "")}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9A-Fa-f]/g, "").slice(0, 6);
                    handleColorChange(`#${raw}`);
                  }}
                  placeholder="EFCC01"
                  maxLength={6}
                  className="w-full h-10 rounded-md border border-[#2D1E2F]/15 bg-[#FFF9D6] pl-7 pr-3 text-sm font-mono text-[#2D1E2F] outline-none focus-visible:border-[#EFCC01] focus:ring-2 focus:ring-[#EFCC01]/30 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Color del Borde e Ícono (Stroke) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#2D1E2F]/80 flex items-center gap-2">
              <Palette className="w-4 h-4 text-[#2D1E2F]" />
              Color del Borde e Ícono (Stroke)
            </label>
            <div className="flex items-center gap-3">
              {/* Native color picker */}
              <div className="relative shrink-0">
                <input
                  type="color"
                  value={isValidHex(formData.strokeColor) ? formData.strokeColor : "#2D1E2F"}
                  onChange={(e) => handleStrokeColorChange(e.target.value)}
                  className="w-12 h-10 rounded-lg border border-[#2D1E2F]/15 cursor-pointer p-0.5 bg-[#FFF9D6]"
                  title="Seleccionar color de borde e ícono"
                />
              </div>
              {/* Hex text input */}
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2D1E2F]/40 text-sm font-mono select-none">#</span>
                <input
                  type="text"
                  value={formData.strokeColor.replace("#", "")}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9A-Fa-f]/g, "").slice(0, 6);
                    handleStrokeColorChange(`#${raw}`);
                  }}
                  placeholder="2D1E2F"
                  maxLength={6}
                  className="w-full h-10 rounded-md border border-[#2D1E2F]/15 bg-[#FFF9D6] pl-7 pr-3 text-sm font-mono text-[#2D1E2F] outline-none focus-visible:border-[#EFCC01] focus:ring-2 focus:ring-[#EFCC01]/30 transition-all"
                />
              </div>
              {/* Color preview chip — replica del marcador del mapa */}
              <div className="shrink-0 relative" style={{ width: 40, height: 40 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    background: isValidHex(formData.color) ? formData.color : "#EFCC01",
                    border: `3px solid ${isValidHex(formData.strokeColor) ? formData.strokeColor : "#2D1E2F"}`,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 12px rgba(45,30,47,0.35)",
                    position: "relative",
                  }}
                  title={`Fondo: ${formData.color} | Borde: ${formData.strokeColor}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={isValidHex(formData.strokeColor) ? formData.strokeColor : "#2D1E2F"}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/>
                    <path d="M19 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/>
                    <path d="M13 16V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10l2 2h10zM13 6l3 5h3l1 2v3h-1m-3-10v10"/>
                  </svg>
                  <span style={{
                    position: "absolute",
                    top: -5,
                    right: -5,
                    width: 10,
                    height: 10,
                    background: "#22c55e",
                    border: "2px solid white",
                    borderRadius: "50%",
                  }} />
                </div>
              </div>
            </div>
            <p className="text-[#2D1E2F]/40 text-xs">
              Estos colores personalizarán la chapa del autobús en el mapa y la app.
            </p>
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
              className="flex items-center gap-2 bg-[#EFCC01] hover:bg-[#EFCC01]/50 text-[#2D1E2F] px-6 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-md shadow-[#EFCC01]/20 disabled:opacity-50 disabled:cursor-not-allowed"
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

import { useState, useEffect } from "react";
import { useGetPrice, useAddPrice } from "../../hooks/exporter";
import { Input } from "../../components/ui/Input";
import {
  Ticket,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Loader2,
  Calendar,
  Clock,
  Coins,
  AlertCircle,
} from "lucide-react";
import ExportDropdown from "../../components/ExportDropdown.jsx";

export default function TicketPrice() {
  const { prices, loading, error: getPriceError } = useGetPrice();
  const { addPrice, loading: saving, error: addPriceError } = useAddPrice();
  const [newPrice, setNewPrice] = useState("");
  const [localError, setLocalError] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  const error = getPriceError || addPriceError || localError;

  // Ocultar mensaje de éxito después de unos segundos
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  // Obtener precio actual y anterior
  const latestDoc = prices.length > 0 ? prices[0] : null;
  const currentActualPrice = latestDoc ? latestDoc.actualPrice : 0;
  const currentPrevPrice = latestDoc ? latestDoc.prevPrice : 0;

  // Función para calcular la diferencia de porcentaje
  const calculateChange = (actual, prev) => {
    if (prev === undefined || prev === null || prev === 0) {
      return { text: "N/A", type: "neutral", percent: 0 };
    }
    const diff = actual - prev;
    const percent = (diff / prev) * 100;

    if (diff > 0) {
      return {
        text: `+${percent.toFixed(2)}%`,
        type: "up",
        percent,
      };
    } else if (diff < 0) {
      return {
        text: `${percent.toFixed(2)}%`,
        type: "down",
        percent,
      };
    } else {
      return {
        text: "0.00%",
        type: "neutral",
        percent,
      };
    }
  };

  // Formatear fechas
  const formatDate = (dateVal) => {
    if (!dateVal) return "N/A";
    try {
      const dateObj = new Date(
        dateVal.seconds ? dateVal.seconds * 1000 : dateVal,
      );
      if (isNaN(dateObj.getTime())) return "Fecha inválida";
      return dateObj.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (e) {
      return "N/A";
    }
  };

  const formatTime = (dateVal) => {
    if (!dateVal) return "";
    try {
      const dateObj = new Date(
        dateVal.seconds ? dateVal.seconds * 1000 : dateVal,
      );
      if (isNaN(dateObj.getTime())) return "";
      return dateObj.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "";
    }
  };

  // Enviar nuevo precio
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMsg("");

    const parsedPrice = parseFloat(newPrice);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      alert("Por favor ingresa un precio válido mayor a 0.");
      return;
    }

    try {
      console.log(
        "TicketPrice: Llamando a addPrice del hook con valor:",
        parsedPrice,
      );
      const result = await addPrice(parsedPrice, currentActualPrice);

      if (result.success) {
        setNewPrice("");
        setSuccessMsg("¡Precio actualizado exitosamente en el sistema!");
        console.log("TicketPrice: Tarifa actualizada correctamente.");
      } else {
        setLocalError(result.error);
      }
    } catch (err) {
      setLocalError(err);
    }
  };

  // Calcular la variación del precio actual
  const currentChange = calculateChange(currentActualPrice, currentPrevPrice);

  const exportColumns = [
    {
      header: "Fecha",
      getValue: (item) => `${formatDate(item.createdAt)} ${formatTime(item.createdAt)}`,
    },
    {
      header: "Precio Anterior",
      getValue: (item) =>
        item.prevPrice !== undefined
          ? `Bs ${item.prevPrice.toFixed(2)}`
          : "Bs 0.00",
    },
    {
      header: "Nuevo Precio",
      getValue: (item) =>
        item.actualPrice !== undefined
          ? `Bs ${item.actualPrice.toFixed(2)}`
          : "Bs 0.00",
    },
    {
      header: "Variación",
      getValue: (item) => calculateChange(item.actualPrice, item.prevPrice).text,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#2D1E2F] text-2xl font-semibold flex items-center gap-2">
            <Coins className="w-7 h-7 text-[#EFCC01]" />
            Tarifa de Ticket
          </h1>
          <p className="text-[#2D1E2F]/50 text-sm mt-1">
            Visualiza y gestiona el costo oficial de los pasajes de transporte.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div>
            <span className="font-bold">Error del sistema:</span>{" "}
            {error.message || "Ocurrió un error inesperado"}
          </div>
        </div>
      )}

      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-2xl text-sm font-medium animate-fade-in">
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUMNA DE PRECIO ACTUAL Y FORMULARIO */}
        <div className="space-y-6 lg:col-span-1">
          {/* Tarjeta de Precio Actual (Diseño Premium) */}
          <div className="bg-[#2D1E2F] text-white rounded-3xl p-6 border border-[#2D1E2F] shadow-lg flex flex-col justify-between relative overflow-hidden h-52">
            {/* Adorno visual de fondo */}
            <div className="absolute -right-10 -bottom-10 w-36 h-36 bg-[#EFCC01]/10 rounded-full blur-2xl" />

            <div className="flex justify-between items-start z-10">
              <div>
                <p className="text-white/50 text-xs uppercase tracking-wider font-semibold">
                  TARIFA ACTUAL
                </p>
                {loading ? (
                  <div className="h-10 w-24 bg-white/10 rounded animate-pulse mt-2" />
                ) : (
                  <h2 className="text-4xl font-bold text-[#EFCC01] mt-1">
                    Bs {currentActualPrice.toFixed(2)}
                  </h2>
                )}
              </div>
              <div className="p-3 bg-[#EFCC01]/10 rounded-2xl border border-[#EFCC01]/20">
                <Ticket className="w-6 h-6 text-[#EFCC01]" />
              </div>
            </div>

            <div className="border-t border-white/10 pt-4 z-10 flex justify-between items-center">
              <div>
                <p className="text-white/40 text-[10px] uppercase tracking-wider">
                  PRECIO ANTERIOR
                </p>
                {loading ? (
                  <div className="h-4 w-12 bg-white/10 rounded animate-pulse mt-1" />
                ) : (
                  <p className="text-sm text-white/80 font-medium mt-0.5">
                    Bs {currentPrevPrice.toFixed(2)}
                  </p>
                )}
              </div>

              {!loading && currentChange.text !== "N/A" && (
                <span
                  className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold ${
                    currentChange.type === "up"
                      ? "bg-green-500/20 text-green-300 border border-green-500/30"
                      : currentChange.type === "down"
                        ? "bg-red-500/20 text-red-300 border border-red-500/30"
                        : "bg-white/10 text-white/60"
                  }`}
                >
                  {currentChange.type === "up" && (
                    <TrendingUp className="w-3.5 h-3.5" />
                  )}
                  {currentChange.type === "down" && (
                    <TrendingDown className="w-3.5 h-3.5" />
                  )}
                  {currentChange.text}
                </span>
              )}
            </div>
          </div>

          {/* Formulario de Modificación de Tarifa */}
          <div className="bg-[#FFF3AD] border border-[#2D1E2F]/10 rounded-3xl p-6 shadow-sm">
            <h3 className="text-[#2D1E2F] font-semibold text-lg mb-2">
              Modificar Tarifa
            </h3>
            <p className="text-[#2D1E2F]/60 text-xs mb-4">
              Ingresa el nuevo costo para actualizar el precio del boleto. El
              valor actual se guardará automáticamente como referencia anterior.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#2D1E2F]/70 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" />
                  Nueva Tarifa (Bs)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#2D1E2F]/40 font-medium">
                    Bs
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    disabled={loading || saving}
                    required
                    className="pl-8 bg-[#FFF9D6] border-[#2D1E2F]/15 focus-visible:ring-[#EFCC01]/30 focus-visible:border-[#EFCC01] text-[#2D1E2F] font-semibold h-11"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || saving || !newPrice}
                className="w-full flex items-center justify-center gap-2 bg-[#EFCC01] hover:bg-[#EFCC01]/90 text-[#2D1E2F] py-3 px-4 rounded-xl text-sm font-semibold transition-colors shadow-md shadow-[#EFCC01]/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Establecer Nueva Tarifa
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* COLUMNA DE HISTORIAL */}
        <div className="lg:col-span-2">
          <div className="bg-[#FFF3AD] border border-[#2D1E2F]/10 rounded-3xl overflow-hidden flex flex-col shadow-sm">
            <div className="p-5 border-b border-[#2D1E2F]/10 flex justify-between items-center">
              <div>
                <h3 className="text-[#2D1E2F] font-semibold text-lg">
                  Historial de Tarifas
                </h3>
                <p className="text-[#2D1E2F]/55 text-xs">
                  Registro histórico de modificaciones en el precio del ticket
                </p>
              </div>
              <div className="flex items-center gap-3">
                <ExportDropdown
                  data={prices}
                  columns={exportColumns}
                  fileName="historial_tarifas"
                  title="Historial de Tarifas"
                  disabled={loading}
                />
                <span className="bg-[#2D1E2F] text-[#EFCC01] text-xs font-semibold px-2.5 py-1 rounded-full shrink-0">
                  {prices.length} Cambios
                </span>
              </div>
            </div>

            <div className="overflow-x-auto relative">
              {loading && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex flex-col items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 text-[#EFCC01] animate-spin mb-2" />
                  <span className="text-sm text-[#2D1E2F]/70 font-medium">
                    Cargando historial...
                  </span>
                </div>
              )}

              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-[#2D1E2F]/8 text-[#2D1E2F]/50 text-xs font-semibold tracking-wider text-left">
                    <th className="px-6 py-4 uppercase">Fecha y Hora</th>
                    <th className="px-6 py-4 uppercase text-right">
                      Precio Anterior
                    </th>
                    <th className="px-6 py-4 uppercase text-right">
                      Nuevo Precio
                    </th>
                    <th className="px-6 py-4 uppercase text-center">
                      Variación
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2D1E2F]/5 text-sm text-[#2D1E2F]">
                  {!loading && prices.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-center text-[#2D1E2F]/40 py-12"
                      >
                        No hay registros de precios de tickets disponibles.
                      </td>
                    </tr>
                  ) : (
                    prices.map((item) => {
                      const change = calculateChange(
                        item.actualPrice,
                        item.prevPrice,
                      );
                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-[#2D1E2F]/5 transition-colors"
                        >
                          {/* Fecha y Hora */}
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-semibold flex items-center gap-1 text-[#2D1E2F]/80">
                                <Calendar className="w-3.5 h-3.5 text-[#EFCC01]" />
                                {formatDate(item.createdAt)}
                              </span>
                              <span className="text-xs text-[#2D1E2F]/50 flex items-center gap-1.5 mt-0.5 ml-0.5">
                                <Clock className="w-3 h-3" />
                                {formatTime(item.createdAt)}
                              </span>
                            </div>
                          </td>

                          {/* Precio Anterior */}
                          <td className="px-6 py-4 text-right font-medium text-[#2D1E2F]/60">
                            Bs
                            {item.prevPrice !== undefined
                              ? item.prevPrice.toFixed(2)
                              : "0.00"}
                          </td>

                          {/* Nuevo Precio */}
                          <td className="px-6 py-4 text-right">
                            <span className="font-bold text-[#2D1E2F] bg-[#EFCC01]/10 px-2 py-1 rounded-lg">
                              Bs {item.actualPrice.toFixed(2)}
                            </span>
                          </td>

                          {/* Variación */}
                          <td className="px-6 py-4">
                            <div className="flex justify-center">
                              <span
                                className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold w-fit ${
                                  change.type === "up"
                                    ? "bg-green-100 text-green-700 border border-green-200"
                                    : change.type === "down"
                                      ? "bg-red-100 text-red-700 border border-red-200"
                                      : "bg-[#2D1E2F]/8 text-[#2D1E2F]/50 border border-[#2D1E2F]/10"
                                }`}
                              >
                                {change.type === "up" && (
                                  <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                                )}
                                {change.type === "down" && (
                                  <TrendingDown className="w-3.5 h-3.5 text-red-600" />
                                )}
                                {change.text}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

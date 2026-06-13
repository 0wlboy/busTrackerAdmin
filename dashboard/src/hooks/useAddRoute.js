import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase/config";

/**
 * Hook para permitir al administrador agregar nuevas rutas a la colección 'vehicleRoutes'.
 * Gestiona el estado de carga y errores durante el proceso, e incluye console.logs
 * para depuración.
 */
export function useAddRoute() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addRoute = async (routeData) => {
    console.log("useAddRoute: Iniciando el proceso de agregar ruta...");
    console.log("useAddRoute: Datos recibidos del componente:", routeData);
    setLoading(true);
    setError(null);

    try {
      // 1. Preparar los datos que irán a Firestore
      const newRoute = {
        name: routeData.name,
        origin: routeData.origin,
        destination: routeData.destination,
        status: routeData.status || "active",
        createdAt: new Date().toISOString(),
      };

      console.log(
        "useAddRoute: Datos estructurados para Firestore listos:",
        newRoute,
      );

      // 2. Referencia a la colección 'vehicleRoutes'
      const routesCollectionRef = collection(db, "vehicleRoutes");

      // 3. Añadir documento
      const docRef = await addDoc(routesCollectionRef, newRoute);

      console.log(
        "useAddRoute: ✅ Ruta agregada exitosamente. ID generado por Firestore:",
        docRef.id,
      );

      // Retornamos éxito y el ID generado
      return { success: true, id: docRef.id };
    } catch (err) {
      console.error(
        "useAddRoute: ❌ Error al agregar la ruta en Firestore:",
        err,
      );
      setError(err);
      return { success: false, error: err };
    } finally {
      setLoading(false);
      console.log("useAddRoute: Proceso de agregar ruta finalizado.");
    }
  };

  return { addRoute, loading, error };
}

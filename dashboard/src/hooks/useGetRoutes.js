import { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  getDocs,
  where,
  getDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase/config";

export function useGetRoutes() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRoutes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Obtener todas las rutas
      const routesSnapshot = await getDocs(collection(db, "vehicleRoutes"));
      const routesData = [];

      for (const routeDoc of routesSnapshot.docs) {
        const routeId = routeDoc.id;
        const routeData = routeDoc.data();
        let totalVehicles = 0;
        let activeVehicles = 0;

        // 2. Obtener vehículos asignados a esta ruta
        const vehiclesQuery = query(
          collection(db, "vehicles"),
          where("routeId", "==", routeId),
        );
        const vehiclesSnapshot = await getDocs(vehiclesQuery);
        totalVehicles = vehiclesSnapshot.size;

        // 3. Revisar el estado de cada vehículo en la colección 'tracking'
        const trackingPromises = vehiclesSnapshot.docs.map(
          async (vehicleDoc) => {
            const vehicleData = vehicleDoc.data();
            if (vehicleData.driverId) {
              const trackingDocRef = doc(db, "tracking", vehicleData.driverId);
              const trackingDoc = await getDoc(trackingDocRef);

              if (trackingDoc.exists()) {
                const trackingData = trackingDoc.data();
                // Revisamos tanto 'isTracking' como 'online' por compatibilidad
                if (
                  trackingData.isTracking === true ||
                  trackingData.online === true
                ) {
                  return 1;
                }
              }
            }
            return 0;
          },
        );

        const trackingResults = await Promise.all(trackingPromises);
        activeVehicles = trackingResults.reduce((acc, curr) => acc + curr, 0);

        routesData.push({
          id: routeId,
          ...routeData,
          totalVehicles,
          activeVehicles,
        });
      }

      setRoutes(routesData);
    } catch (err) {
      console.error("Error fetching routes:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  /**
   * Lista ligera derivada: solo { id, name } por cada ruta.
   * Útil para construir filtros/botones sin necesidad de
   * una consulta adicional a Firestore.
   */
  const routeList = routes.map((r) => ({
    id: r.id,
    name: r.name ?? r.id,
  }));

  const topRoute = routes.length > 0
    ? [...routes].reduce((max, r) => (r.totalVehicles > max.totalVehicles ? r : max), routes[0])
    : null;

  return {
    routes,      // Array completo con totalVehicles, activeVehicles, etc.
    routeList,   // Array ligero { id, name } para filtros de UI
    topRoute,    // Ruta con más vehículos registrados
    loading,
    error,
    refresh: fetchRoutes,
  };
}

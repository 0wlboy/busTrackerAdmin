import { useState, useEffect, useCallback, useRef } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";

/**
 * Hook que obtiene en tiempo real todos los documentos de la colección "tracking"
 * donde online === true, cruza con la colección "vehiculos" (usando userId === driverId)
 * y actualiza las coordenadas automáticamente cada minuto.
 *
 * @returns {{ buses: Array, loading: boolean, error: Error|null, lastUpdated: Date|null }}
 */
export function useGetTracking() {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Cache de datos de vehículos para no repetir consultas
  const vehicleCache = useRef({});

  /**
   * Dado un driverId, busca en la colección "vehiculos" el documento
   * cuyo campo "userId" coincida con ese driverId.
   * Usa un caché en memoria para evitar consultas repetidas.
   */
  const fetchVehicleByDriverId = useCallback(async (driverId) => {
    if (vehicleCache.current[driverId]) {
      return vehicleCache.current[driverId];
    }

    try {
      // Buscar en colección "vehiculos" donde userId == driverId
      const vehiculosRef = collection(db, "vehiculos");
      const q = query(vehiculosRef, where("userId", "==", driverId));

      // También intentar en "vehicles" como fallback
      const { getDocs } = await import("firebase/firestore");
      const snapshot = await getDocs(q);

      let vehicleData = null;

      if (!snapshot.empty) {
        const vehicleDoc = snapshot.docs[0];
        vehicleData = { id: vehicleDoc.id, ...vehicleDoc.data() };
      } else {
        // Fallback: colección "vehicles"
        const vehiclesRef = collection(db, "vehicles");
        const qFallback = query(vehiclesRef, where("userId", "==", driverId));
        const snapshotFallback = await getDocs(qFallback);

        if (!snapshotFallback.empty) {
          const vehicleDoc = snapshotFallback.docs[0];
          vehicleData = { id: vehicleDoc.id, ...vehicleDoc.data() };
        } else {
          // Intentar buscar por driverId directamente
          const qDriver = query(vehiclesRef, where("driverId", "==", driverId));
          const snapshotDriver = await getDocs(qDriver);
          if (!snapshotDriver.empty) {
            const vehicleDoc = snapshotDriver.docs[0];
            vehicleData = { id: vehicleDoc.id, ...vehicleDoc.data() };
          }
        }
      }

      vehicleCache.current[driverId] = vehicleData;
      return vehicleData;
    } catch (err) {
      console.error(
        `Error al obtener vehículo para driverId ${driverId}:`,
        err,
      );
      return null;
    }
  }, []);

  /**
   * Procesa los documentos de tracking y los enriquece con los datos del vehículo.
   */
  const processTrackingDocs = useCallback(
    async (docs) => {
      const enrichedBuses = await Promise.all(
        docs.map(async (trackingDoc) => {
          const data = trackingDoc.data();
          const driverId = trackingDoc.id; // El doc ID en "tracking" suele ser el userId del conductor

          // Extraer coordenadas (con encadenamiento opcional para evitar errores)
          const lat = data.location?.latitude ?? null;
          const lng = data.location?.longitude ?? null;

          // Obtener datos del vehículo cruzando con "vehiculos"
          const vehicleData = await fetchVehicleByDriverId(driverId);

          // Obtener nombre del conductor desde la colección "users"
          let driverName = data.driverName ?? null;
          if (!driverName && driverId) {
            try {
              const userSnap = await getDoc(doc(db, "users", driverId));
              if (userSnap.exists()) {
                const u = userSnap.data();
                driverName = u.userName ?? null;
              }
            } catch (_) {
              // silenciar — el nombre simplemente quedará null
            }
          }

          let routeId = vehicleData?.routeId ?? null;
          let routeName = "Sin ruta asignada";

          if (routeId) {
            try {
              const routeSnap = await getDoc(doc(db, "vehicleRoutes", routeId));
              if (routeSnap.exists()) {
                const routeData = routeSnap.data();
                routeName = routeData.name ?? "Sin nombre de ruta";
              }
            } catch (error) {
              console.error("Error obteniendo ruta:", error);
            }
          }

          // Sub-objeto con datos del vehículo
          const vehicle = {
            plate: vehicleData?.plate ?? "Sin placa",
            type: vehicleData?.type ?? "Bus",
            imageUrl: vehicleData?.imageUri ?? null,
            seats: vehicleData?.seats ?? null,
          };

          // Sub-objeto con datos de la ruta
          const route = {
            id: routeId ?? "Sin ruta asignada",
            name: routeName ?? "Sin ruta asignada",
          };

          return {
            id: trackingDoc.id,
            driverId,
            driverName,
            lat,
            lng,
            online: data.online ?? data.isTracking ?? false,
            lastUpdated: data.lastUpdated ?? null,
            vehicle,
            route,
          };
        }),
      );

      // Filtrar buses que tengan coordenadas válidas
      return enrichedBuses.filter((b) => b.lat !== null && b.lng !== null);
    },
    [fetchVehicleByDriverId],
  );

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Suscripción en tiempo real a "tracking" donde online === true
    const trackingRef = collection(db, "tracking");
    const q = query(trackingRef, where("online", "==", true));

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        try {
          if (snapshot.empty) {
            setBuses([]);
            setLastUpdated(new Date());
            setLoading(false);
            return;
          }

          const enriched = await processTrackingDocs(snapshot.docs);
          setBuses(enriched);
          setLastUpdated(new Date());
        } catch (err) {
          console.error("Error procesando datos de tracking:", err);
          setError(err);
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        // Si falla el query con "online", intentar sin filtro y filtrar manualmente
        console.warn(
          "Query con filtro 'online' falló, intentando sin filtro:",
          err.message,
        );

        const unsubFallback = onSnapshot(
          trackingRef,
          async (snapshot) => {
            try {
              const onlineDocs = snapshot.docs.filter((d) => {
                const data = d.data();
                return data.online === true || data.isTracking === true;
              });

              if (onlineDocs.length === 0) {
                setBuses([]);
                setLastUpdated(new Date());
                setLoading(false);
                return;
              }

              const enriched = await processTrackingDocs(onlineDocs);
              setBuses(enriched);
              setLastUpdated(new Date());
            } catch (innerErr) {
              console.error("Error en fallback de tracking:", innerErr);
              setError(innerErr);
            } finally {
              setLoading(false);
            }
          },
          (innerErr) => {
            setError(innerErr);
            setLoading(false);
          },
        );

        // Devolver el unsub del fallback (se sobreescribe abajo)
        return unsubFallback;
      },
    );

    // Actualización forzada cada 60 segundos (para refrescar datos aunque no haya cambios)
    const intervalId = setInterval(() => {
      setLastUpdated(new Date());
    }, 60000);

    return () => {
      unsubscribe();
      clearInterval(intervalId);
    };
  }, [processTrackingDocs]);

  return {
    buses,
    loading,
    error,
    lastUpdated,
    busCount: buses.length,
  };
}

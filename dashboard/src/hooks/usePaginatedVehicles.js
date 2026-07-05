import { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  getCountFromServer,
  startAfter,
  endBefore,
  limitToLast,
  doc,
  getDoc,
  where
} from "firebase/firestore";
import { db } from "../firebase/config";

/**
 * Hook para obtener vehiculos paginados de Firestore
 * @param {Object} options Configuración de la búsqueda
 * @param {number} options.pageSize Número de resultados por página
 * @param {string} options.orderByField Campo por el cual ordenar
 * @param {string} options.orderDirection Dirección ("asc" o "desc")
 */
export function usePaginatedVehicles({
  pageSize = 10,
  orderByField = "createdAt",
  orderDirection = "desc",
} = {}) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [activeVehicleCount, setActiveVehicleCount] = useState(0);

  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [firstVisible, setFirstVisible] = useState(null);
  const [lastVisible, setLastVisible] = useState(null);

  // Mapeo de cédulas de conductores
  const [cedulas, setCedulas] = useState({});

  useEffect(() => {
    const fetchCedulas = async () => {
      if (!vehicles || vehicles.length === 0) return;
      
      const newCedulas = { ...cedulas };
      let updated = false;

      for (const v of vehicles) {
        const dId = v.driverId;
        if (dId && !newCedulas[dId]) {
          try {
            // Intentar primero en la colección "users"
            const docRef = doc(db, "users", dId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              newCedulas[dId] = docSnap.data().cedula || "Sin cédula";
            } else {
              // Intentar en la colección "driver" como fallback / opción indicada en la solicitud
              const driverRef = doc(db, "driver", dId);
              const driverSnap = await getDoc(driverRef);
              if (driverSnap.exists()) {
                newCedulas[dId] = driverSnap.data().cedula || "Sin cédula";
              } else {
                newCedulas[dId] = "No encontrado";
              }
            }
          } catch (err) {
            console.error(`Error al obtener cédula del conductor ${dId}:`, err);
            newCedulas[dId] = "Error";
          }
          updated = true;
        }
      }

      if (updated) {
        setCedulas(newCedulas);
      }
    };

    fetchCedulas();
  }, [vehicles]);

  // Derivados
  const isFirstPage = currentPage === 1;
  const isLastPage = vehicles.length === 0 || vehicles.length < pageSize || (currentPage * pageSize >= totalCount && totalCount > 0);

  // Helper para construir la query base
  const buildBaseQuery = useCallback(() => {
    const vehiclesRef = collection(db, "vehicles");
    const constraints = [orderBy(orderByField, orderDirection)];
    return query(vehiclesRef, ...constraints);
  }, [orderByField, orderDirection]);

  // Cargar el conteo total de vehiculos para la consulta dada
  const fetchTotalCount = useCallback(async () => {
    try {
      const vehiclesRef = collection(db, "vehicles");
      const countQuery = query(vehiclesRef);
      const snapshot = await getCountFromServer(countQuery);
      setTotalCount(snapshot.data().count);
    } catch (err) {
      console.error("Error al obtener el conteo total:", err);
    }
  }, []);

  /**
   * Cuenta los vehículos activos:
   * - Obtiene todos los documentos de "tracking" donde online === true
   * - Cada documento en "tracking" usa el driverId como ID y se relaciona
   *   con un vehículo a través de su campo driverId en "vehicles"
   * - Cuenta cuántos de esos driverIds tienen un vehículo registrado
   */
  const fetchActiveVehicleCount = useCallback(async () => {
    try {
      // 1. Obtener todos los docs de tracking donde online === true
      const trackingRef = collection(db, "tracking");
      const onlineQuery = query(trackingRef, where("online", "==", true));
      const trackingSnap = await getDocs(onlineQuery);

      if (trackingSnap.empty) {
        setActiveVehicleCount(0);
        return;
      }

      // 2. Recopilar los driverIds que están online
      const onlineDriverIds = trackingSnap.docs.map((d) => d.id);

      // 3. Verificar cuáles de esos driverIds tienen un vehículo registrado
      //    (un vehículo cuyo campo driverId coincide con el ID del doc tracking)
      const vehiclesRef = collection(db, "vehicles");
      const vehiclesSnap = await getDocs(query(vehiclesRef));

      const registeredDriverIds = new Set(
        vehiclesSnap.docs
          .map((d) => d.data().driverId)
          .filter(Boolean)
      );

      const activeCount = onlineDriverIds.filter((id) =>
        registeredDriverIds.has(id)
      ).length;

      setActiveVehicleCount(activeCount);
    } catch (err) {
      console.error("Error al obtener el conteo de vehículos activos:", err);
    }
  }, []);

  // Ejecutar query
  const executeQuery = async (q) => {
    setLoading(true);
    setError(null);
    try {
      const snapshot = await getDocs(q);

      const vehiclesData = [];
      snapshot.forEach((doc) => {
        vehiclesData.push({ id: doc.id, ...doc.data() });
      });

      setVehicles(vehiclesData);

      if (!snapshot.empty) {
        setFirstVisible(snapshot.docs[0]);
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      } else {
        setFirstVisible(null);
        setLastVisible(null);
      }
    } catch (err) {
      console.error("Error ejecutando la consulta de vehiculos:", err);
      if (err.message && err.message.includes("The query requires an index")) {
        console.warn(
          "ATENCIÓN: Necesitas crear un índice compuesto en Firebase. Revisa la consola y haz clic en el enlace proporcionado por Firebase para crearlo."
        );
      }
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar primera página
  const fetchFirstPage = useCallback(() => {
    setCurrentPage(1);
    const q = query(buildBaseQuery(), limit(pageSize));
    executeQuery(q);
  }, [buildBaseQuery, pageSize]);

  // Navegar a la página siguiente
  const nextPage = () => {
    if (!lastVisible || isLastPage) return;
    const q = query(buildBaseQuery(), startAfter(lastVisible), limit(pageSize));
    setCurrentPage((prev) => prev + 1);
    executeQuery(q);
  };

  // Navegar a la página anterior
  const prevPage = () => {
    if (!firstVisible || isFirstPage) return;
    const q = query(buildBaseQuery(), endBefore(firstVisible), limitToLast(pageSize));
    setCurrentPage((prev) => prev - 1);
    executeQuery(q);
  };

  // Refresh (recargar la primera página)
  const refresh = () => {
    fetchTotalCount();
    fetchActiveVehicleCount();
    fetchFirstPage();
  };

  // Cuando cambian los parámetros de búsqueda, reiniciamos desde la página 1
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildBaseQuery, fetchTotalCount, fetchActiveVehicleCount]);

  return {
    vehicles,
    loading,
    error,
    totalCount,
    activeVehicleCount,
    currentPage,
    isFirstPage,
    isLastPage,
    nextPage,
    prevPage,
    refresh,
    cedulas,
  };
}

import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import { collection, getDocs, query, where } from "firebase/firestore";

/**
 * Devuelve la lista de conductores disponibles (sin vehículo asignado).
 * @param {string|null} excludeDriverId - UID del conductor actual (para UpdateVehicle, se excluye del filtro).
 */
export function useAvailableDrivers(excludeDriverId = null) {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAvailableDrivers() {
      setLoading(true);
      setError(null);
      try {
        // 1. Obtener todos los usuarios con rol Operador / Conductor y no eliminados
        const usersRef = collection(db, "users");
        const usersSnap = await getDocs(usersRef);

        const allDrivers = usersSnap.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((user) => {
            if (user.isDeleted === true) return false;
            const roleStr = String(user.role || "").toLowerCase();
            return roleStr === "operador" || roleStr === "conductor";
          });

        // 2. Obtener todos los driverIds usados en vehículos activos
        const vehiclesRef = collection(db, "vehicles");
        const vehiclesSnap = await getDocs(vehiclesRef);

        const assignedDriverIds = new Set(
          vehiclesSnap.docs
            .filter((doc) => !doc.data().isDeleted) // excluir vehículos borrados
            .map((doc) => doc.data().driverId || doc.id)
            .filter(Boolean)
        );

        // 3. Filtrar conductores que no estén asignados
        // Si excludeDriverId está definido, ese conductor sigue disponible (es el actual del vehículo)
        const available = allDrivers.filter(
          (driver) =>
            !assignedDriverIds.has(driver.id) || driver.id === excludeDriverId
        );

        setDrivers(available);
      } catch (err) {
        console.error("Error al obtener conductores disponibles:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchAvailableDrivers();
  }, [excludeDriverId]);

  return { drivers, loading, error };
}

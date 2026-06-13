import { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getCountFromServer,
  startAfter,
  endBefore,
  limitToLast,
} from "firebase/firestore";
import { db } from "../firebase/config";

/**
 * Hook para obtener usuarios paginados de Firestore
 * @param {Object} options Configuración de la búsqueda
 * @param {string} options.role Rol a buscar ("pasajero" o "conductor")
 * @param {number} options.pageSize Número de resultados por página
 * @param {string} options.orderByField Campo por el cual ordenar
 * @param {string} options.orderDirection Dirección ("asc" o "desc")
 * @param {boolean|null} options.isOnline Filtro opcional para usuarios conectados (null ignora este filtro)
 */
export function usePaginatedUsers({
  role = "Pasajero",
  pageSize = 10,
  orderByField = "createdAt",
  orderDirection = "desc",
  isOnline = null,
} = {}) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [firstVisible, setFirstVisible] = useState(null);
  const [lastVisible, setLastVisible] = useState(null);

  // Derivados
  const isFirstPage = currentPage === 1;
  const isLastPage =
    users.length === 0 ||
    users.length < pageSize ||
    (currentPage * pageSize >= totalCount && totalCount > 0);

  // Helper para construir la query base
  const buildBaseQuery = useCallback(() => {
    const usersRef = collection(db, "users");
    const constraints = [where("role", "==", role)];

    if (isOnline !== null) {
      constraints.push(where("isOnline", "==", isOnline));
    }

    constraints.push(orderBy(orderByField, orderDirection));

    return query(usersRef, ...constraints);
  }, [role, isOnline, orderByField, orderDirection]);

  // Cargar el conteo total de usuarios para la consulta dada
  const fetchTotalCount = useCallback(async () => {
    try {
      const usersRef = collection(db, "users");
      const constraints = [where("role", "==", role)];
      if (isOnline !== null) {
        constraints.push(where("isOnline", "==", isOnline));
      }

      const countQuery = query(usersRef, ...constraints);
      const snapshot = await getCountFromServer(countQuery);
      setTotalCount(snapshot.data().count);
    } catch (err) {
      console.error("Error al obtener el conteo total:", err);
    }
  }, [role, isOnline]);

  // Ejecutar query
  const executeQuery = async (q) => {
    setLoading(true);
    setError(null);
    try {
      const snapshot = await getDocs(q);

      const usersData = [];
      snapshot.forEach((doc) => {
        usersData.push({ id: doc.id, ...doc.data() });
      });

      setUsers(usersData);

      if (!snapshot.empty) {
        setFirstVisible(snapshot.docs[0]);
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      } else {
        setFirstVisible(null);
        setLastVisible(null);
      }
    } catch (err) {
      console.error("Error ejecutando la consulta de usuarios:", err);
      if (err.message && err.message.includes("The query requires an index")) {
        console.warn(
          "ATENCIÓN: Necesitas crear un índice compuesto en Firebase. Revisa la consola y haz clic en el enlace proporcionado por Firebase para crearlo.",
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
    const q = query(
      buildBaseQuery(),
      endBefore(firstVisible),
      limitToLast(pageSize),
    );
    setCurrentPage((prev) => prev - 1);
    executeQuery(q);
  };

  // Refresh (recargar la primera página)
  const refresh = () => {
    fetchTotalCount();
    fetchFirstPage();
  };

  // Cuando cambian los parámetros de búsqueda, reiniciamos desde la página 1
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildBaseQuery, fetchTotalCount]);

  return {
    users,
    loading,
    error,
    totalCount,
    currentPage,
    isFirstPage,
    isLastPage,
    nextPage,
    prevPage,
    refresh,
  };
}

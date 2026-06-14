import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";

/**
 * Hook personalizado para obtener el historial de tarifas ('price') en Firestore en tiempo real.
 */
export function useGetPrice() {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("useGetPrice: Suscribiéndose a la colección 'price'...");
    const q = query(collection(db, "price"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        console.log(`useGetPrice: Se cargaron ${list.length} registros de precios.`);
        setPrices(list);
        setLoading(false);
      },
      (err) => {
        console.error("useGetPrice: Error al obtener datos de 'price' desde Firestore:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => {
      console.log("useGetPrice: Desuscribiendo onSnapshot en useGetPrice.");
      unsubscribe();
    };
  }, []);

  return {
    prices,
    loading,
    error,
  };
}

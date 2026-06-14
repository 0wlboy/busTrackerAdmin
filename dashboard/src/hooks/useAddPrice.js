import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase/config";

/**
 * Hook personalizado para registrar un nuevo precio en la colección 'price' de Firestore.
 * Gestiona el estado de carga y errores de la operación de escritura.
 */
export function useAddPrice() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Guarda un nuevo precio en Firestore.
   * @param {number|string} newActualPrice - El nuevo precio de tarifa.
   * @param {number} currentActualPrice - El precio actual que pasará a ser el anterior (prevPrice).
   */
  const addPrice = async (newActualPrice, currentActualPrice = 0) => {
    const parsedPrice = parseFloat(newActualPrice);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      const err = new Error("El precio debe ser un número válido mayor a 0.");
      console.warn("useAddPrice: Validación fallida -", err.message);
      throw err;
    }

    setLoading(true);
    setError(null);

    try {
      const docData = {
        actualPrice: parsedPrice,
        prevPrice: currentActualPrice,
        createdAt: new Date().toISOString(),
      };

      console.log("useAddPrice: Guardando nuevo precio en la colección 'price':", docData);
      const docRef = await addDoc(collection(db, "price"), docData);
      console.log("useAddPrice: ✅ Precio guardado correctamente con ID:", docRef.id);
      return { success: true, id: docRef.id };
    } catch (err) {
      console.error("useAddPrice: ❌ Error al agregar el precio en Firestore:", err);
      setError(err);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  return {
    addPrice,
    loading,
    error,
  };
}

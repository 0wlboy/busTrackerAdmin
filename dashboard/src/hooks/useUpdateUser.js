import { useState } from "react";
import { db } from "../firebase/config";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export function useUpdateUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getUser = async (uid) => {
    setLoading(true);
    setError(null);
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
      } else {
        throw new Error("El usuario no existe.");
      }
    } catch (err) {
      console.error("Error al obtener usuario:", err);
      setError(err);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (uid, { name, email, role, telefono, cedula }) => {
    setLoading(true);
    setError(null);

    try {
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        userName: name,
        email: email,
        role: role,
        telefono: telefono || "",
        cedula: cedula || "",
        modifiedAt: new Date().toISOString(),
      });
      return { success: true };
    } catch (err) {
      console.error("Error al actualizar usuario:", err);
      setError(err);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (uid) => {
    setLoading(true);
    setError(null);
    try {
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        isDeleted: true,
        modifiedAt: new Date().toISOString(),
      });
      return { success: true };
    } catch (err) {
      console.error("Error al eliminar usuario:", err);
      setError(err);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  return { getUser, updateUser, deleteUser, loading, error };
}

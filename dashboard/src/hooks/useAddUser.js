import { useState } from "react";
import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import app from "../firebase/config";

/**
 * Hook para agregar un nuevo usuario al sistema sin desloguear al administrador actual.
 * Utiliza una instancia secundaria de Firebase para realizar el registro en Authentication,
 * y luego guarda los datos adicionales en la colección 'users' de Firestore.
 */
export function useAddUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addUser = async (userData) => {
    console.log("useAddUser: Iniciando proceso para crear nuevo usuario...");
    console.log("useAddUser: Datos recibidos:", { ...userData, password: "[REDACTED]" });
    setLoading(true);
    setError(null);
    let secondaryApp = null;

    try {
      // 1. Crear una instancia secundaria de Firebase para no afectar la sesión actual (admin)
      console.log("useAddUser: Inicializando aplicación secundaria de Firebase Auth...");
      secondaryApp = initializeApp(app.options, `SecondaryApp_${Date.now()}`);
      const secondaryAuth = getAuth(secondaryApp);

      // 2. Crear usuario en Firebase Authentication (verifica si email/contraseña están libres/válidos)
      console.log("useAddUser: Intentando crear usuario en Authentication con el email:", userData.email);
      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth,
        userData.email,
        userData.password
      );
      
      const user = userCredential.user;
      console.log("useAddUser: Usuario creado exitosamente en Auth. UID asignado:", user.uid);

      // 3. Crear el documento en la colección 'users' de Firestore
      console.log("useAddUser: Guardando datos complementarios en Firestore (colección 'users')...");
      const userDocRef = doc(db, "users", user.uid);
      const newUserData = {
        name: userData.name,
        email: userData.email,
        role: userData.role,
        phone: userData.phone || "",
        cedula: userData.cedula || "",
        status: userData.status || "active",
        createdAt: new Date().toISOString(),
      };
      
      await setDoc(userDocRef, newUserData);
      console.log("useAddUser: ✅ Datos guardados correctamente en Firestore:", newUserData);

      // 4. Limpiar la aplicación secundaria para liberar recursos y cerrar sesión
      console.log("useAddUser: Limpiando recursos de la app secundaria...");
      await signOut(secondaryAuth);
      await deleteApp(secondaryApp);
      console.log("useAddUser: Recursos limpiados exitosamente.");

      return { success: true, uid: user.uid };
    } catch (err) {
      console.error("useAddUser: ❌ Error durante el proceso de creación:", err);
      
      // Traducir los errores más comunes de Firebase a español
      let errorMessage = err.message || "Error al crear el usuario";
      if (err.code === "auth/email-already-in-use") {
        errorMessage = "El correo electrónico ya está en uso por otra cuenta.";
      } else if (err.code === "auth/weak-password") {
        errorMessage = "La contraseña es muy débil (mínimo 6 caracteres).";
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "El formato del correo electrónico es inválido.";
      }
      
      setError(new Error(errorMessage));
      
      // Intentar limpiar la app secundaria si ocurrió un error, para no dejarla colgada
      if (secondaryApp) {
         try {
             await deleteApp(secondaryApp);
             console.log("useAddUser: App secundaria limpiada tras error.");
         } catch (cleanupErr) {
             console.error("useAddUser: Error al limpiar app secundaria tras fallo:", cleanupErr);
         }
      }
      
      return { success: false, error: new Error(errorMessage) };
    } finally {
      setLoading(false);
      console.log("useAddUser: Proceso finalizado.");
    }
  };

  return { addUser, loading, error };
}

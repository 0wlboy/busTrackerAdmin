import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, db } from "../firebase/config";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

// Crear el contexto
const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

// ==========================================
// CONFIGURACIÓN DE SESIÓN EN LOCALSTORAGE
// ==========================================
const SESSION_KEY = "app_auth_session";
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 horas en milisegundos

const getLocalSession = () => {
  const stored = localStorage.getItem(SESSION_KEY);
  if (!stored) return null;

  try {
    const session = JSON.parse(stored);
    const now = Date.now();
    // Validar si han pasado más de 24 horas
    if (now - session.lastActivity > SESSION_TIMEOUT) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session.user;
  } catch (error) {
    return null;
  }
};

const saveLocalSession = (user) => {
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      user,
      lastActivity: Date.now(),
    }),
  );
};

const clearLocalSession = () => {
  localStorage.removeItem(SESSION_KEY);
};

const updateLastActivity = () => {
  const stored = localStorage.getItem(SESSION_KEY);
  if (stored) {
    try {
      const session = JSON.parse(stored);
      session.lastActivity = Date.now();
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch (e) {}
  }
};

export const AuthProvider = ({ children }) => {
  // Inicializamos currentUser directamente con la sesión local si existe
  const [currentUser, setCurrentUser] = useState(getLocalSession());
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error al cerrar sesión en Firebase:", error);
    } finally {
      setCurrentUser(null);
      clearLocalSession();
    }
  }, []);

  const login = async (email, password) => {
    try {
      // Caso especial: Administrador hardcodeado
      if (email === "admin@empresa.com" && password === "admin123") {
        const adminUser = {
          email,
          role: "admin",
          userName: "Administrador General",
          isHardcoded: true,
        };
        setCurrentUser(adminUser);
        saveLocalSession(adminUser);
        return;
      }

      // 1. Verificamos credenciales en Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // 2. Revisar si está en la base de datos y si tiene rol admin
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await signOut(auth);
        const error = new Error("El usuario no existe en la base de datos.");
        error.code = "auth/user-not-found-in-db";
        throw error;
      }

      const userData = userDoc.data();
      if (userData.role !== "admin") {
        await signOut(auth);
        const error = new Error(
          "Acceso denegado: No tienes permisos de administrador.",
        );
        error.code = "auth/not-admin";
        throw error;
      }

      // 3. Guardar en estado local y LocalStorage
      const authUser = {
        uid: user.uid,
        email: user.email,
        role: userData.role,
        userName: userData.userName,
      };

      setCurrentUser(authUser);
      saveLocalSession(authUser);
    } catch (error) {
      if (error.code === "unavailable") {
        alert(
          "No hay conexion a internet, por favor habilita tu internet para poder acceder al sistema.",
        );
      } else {
        console.error("Error de login:", error);
      }
      throw error;
    }
  };

  /**
   * Registra un nuevo administrador en Firebase Auth y guarda sus datos en Firestore.
   * @param {{ userName, email, password, cedula, phone }} userData
   */
  const register = async (userData) => {
    try {
      // 1. Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password,
      );
      const user = userCredential.user;

      // 2. Guardar datos del admin en Firestore
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        userName: userData.userName,
        email: userData.email,
        cedula: userData.cedula || "",
        phone: userData.phone || "",
        role: "admin",
        isOnline: false,
        createdAt: serverTimestamp(),
        modifiedAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      });

      return { uid: user.uid };
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw error;
    }
  };

  // Escuchar estado de Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Traer datos de Firestore para asegurar que siga siendo admin y guardar
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();

            if (userData.role === "admin") {
              const authUser = {
                uid: user.uid,
                email: user.email,
                role: userData.role,
                userName: userData.userName,
              };
              setCurrentUser(authUser);
              saveLocalSession(authUser);
            } else {
              await signOut(auth);
              setCurrentUser(null);
              clearLocalSession();
            }
          } else {
            await signOut(auth);
            setCurrentUser(null);
            clearLocalSession();
          }
        } catch (error) {
          console.error("Error obteniendo info de usuario:", error);
          setCurrentUser(null);
          clearLocalSession();
        }
      } else {
        // Firebase reporta que no hay sesión activa.
        // Verificamos si tenemos al usuario hardcodeado en la sesión local.
        const local = getLocalSession();
        if (local && local.isHardcoded) {
          setCurrentUser(local); // Mantenemos la sesión del admin estático
        } else {
          setCurrentUser(null);
          clearLocalSession();
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Detector de Inactividad (24 horas)
  useEffect(() => {
    let lastUpdate = Date.now();

    const handleActivity = () => {
      const now = Date.now();
      // Throttle: solo actualizamos LocalStorage como máximo una vez por minuto para no saturar rendimiento
      if (now - lastUpdate > 60000) {
        lastUpdate = now;

        const stored = localStorage.getItem(SESSION_KEY);
        if (stored) {
          try {
            const session = JSON.parse(stored);
            if (now - session.lastActivity > SESSION_TIMEOUT) {
              // La sesión expiró por inactividad prolongada
              logout();
            } else {
              // Registramos la nueva actividad
              updateLastActivity();
            }
          } catch (e) {}
        }
      }
    };

    // Agregar listeners a eventos clave que denotan actividad del usuario
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("click", handleActivity);
    window.addEventListener("scroll", handleActivity);

    // Revisión periódica (cada minuto) para desloguear automáticamente si la pestaña se dejó abierta y sin uso
    const intervalId = setInterval(() => {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        try {
          const session = JSON.parse(stored);
          if (Date.now() - session.lastActivity > SESSION_TIMEOUT) {
            logout();
          }
        } catch (e) {}
      }
    }, 60000);

    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("click", handleActivity);
      window.removeEventListener("scroll", handleActivity);
      clearInterval(intervalId);
    };
  }, [logout]);

  const value = {
    currentUser,
    login,
    register,
    logout,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {/* No renderizar los hijos hasta que el check de Firebase Auth se resuelva */}
      {!loading && children}
    </AuthContext.Provider>
  );
};

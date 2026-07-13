import { useState } from "react";
import { db } from "../firebase/config";
import { useUploadImgWeb } from "./useUploadImgWeb";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

export function useUpdateVehicle() {
  const { uploadImage } = useUploadImgWeb();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getVehicle = async (driverId) => {
    setLoading(true);
    setError(null);
    try {
      const docRef = doc(db, "vehicles", driverId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
      } else {
        throw new Error("El vehículo no existe.");
      }
    } catch (err) {
      console.error("Error al obtener vehículo:", err);
      setError(err);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const updateVehicle = async (oldDriverId, { imgFile, driverId, routeId, plate, seats, existingImageUri }) => {
    setLoading(true);
    setError(null);

    try {
      const newDriverId = driverId.trim();

      // 1. Validar que el nuevo conductor exista y tenga el rol correcto
      const userRef = doc(db, "users", newDriverId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        throw new Error(
          "El ID del conductor ingresado no corresponde a ningún usuario registrado.",
        );
      }

      const userData = userSnap.data();
      const role = userData.role?.toLowerCase() || "";
      if (role !== "conductor" && role !== "operador") {
        throw new Error(
          "El usuario especificado existe, pero no tiene el rol de Conductor.",
        );
      }

      // Si el conductor cambió, validar que el nuevo conductor no tenga ya otro vehículo
      if (newDriverId !== oldDriverId) {
        const checkVehicleRef = doc(db, "vehicles", newDriverId);
        const checkVehicleSnap = await getDoc(checkVehicleRef);
        if (checkVehicleSnap.exists() && !checkVehicleSnap.data().isDeleted) {
          throw new Error("El nuevo conductor ya tiene un vehículo asignado.");
        }
      }

      // 2. Subir imagen si se seleccionó una nueva
      let imageUrl = existingImageUri;
      if (imgFile) {
        const uploadResult = await uploadImage(imgFile);
        if (!uploadResult.success) {
          throw new Error(
            "No se pudo subir la imagen del vehículo. " +
              (uploadResult.error?.message || ""),
          );
        }
        imageUrl = uploadResult.url;
      }

      // 3. Si el ID del conductor cambió, debemos eliminar el documento viejo y crear uno nuevo
      if (newDriverId !== oldDriverId) {
        // Crear documento nuevo
        const newVehicleRef = doc(db, "vehicles", newDriverId);
        await setDoc(newVehicleRef, {
          driverId: newDriverId,
          imageUri: imageUrl,
          routeId: routeId,
          plate: plate,
          seats: Number(seats),
          createdAt: serverTimestamp(),
          modifiedAt: serverTimestamp(),
        });

        // Mover tracking
        const oldTrackingRef = doc(db, "tracking", oldDriverId);
        const oldTrackingSnap = await getDoc(oldTrackingRef);
        let trackingData = {
          driverId: newDriverId,
          online: false,
          location: null,
          lastUpdated: serverTimestamp(),
        };
        if (oldTrackingSnap.exists()) {
          trackingData = {
            ...oldTrackingSnap.data(),
            driverId: newDriverId,
            lastUpdated: serverTimestamp(),
          };
        }
        const newTrackingRef = doc(db, "tracking", newDriverId);
        await setDoc(newTrackingRef, trackingData);

        // Eliminar viejos
        const oldVehicleRef = doc(db, "vehicles", oldDriverId);
        await deleteDoc(oldVehicleRef);
        await deleteDoc(oldTrackingRef);
      } else {
        // Si no cambió, solo actualizamos el documento existente
        const vehicleRef = doc(db, "vehicles", oldDriverId);
        await updateDoc(vehicleRef, {
          imageUri: imageUrl,
          routeId: routeId,
          plate: plate,
          seats: Number(seats),
          modifiedAt: serverTimestamp(),
        });
      }

      return { success: true };
    } catch (err) {
      console.error("Error al actualizar vehículo:", err);
      setError(err);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const deleteVehicle = async (driverId) => {
    setLoading(true);
    setError(null);
    try {
      const vehicleRef = doc(db, "vehicles", driverId);
      await updateDoc(vehicleRef, {
        isDeleted: true,
        modifiedAt: serverTimestamp(),
      });
      return { success: true };
    } catch (err) {
      console.error("Error al eliminar vehículo:", err);
      setError(err);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  return { getVehicle, updateVehicle, deleteVehicle, loading, error };
}

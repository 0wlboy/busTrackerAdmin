import { useState } from "react";
import { db } from "../firebase/config";
import { useUploadImgWeb } from "./useUploadImgWeb";
import { setDoc, doc, getDoc, serverTimestamp } from "firebase/firestore";

export function useAddVehicle() {
  const { uploadImage } = useUploadImgWeb();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addVehicle = async ({ imgFile, driverId, routeId, plate, seats }) => {
    setLoading(true);
    setError(null);

    try {
      // 1. Validar que el conductor exista y tenga el rol correcto
      const userRef = doc(db, "users", driverId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        throw new Error(
          "El ID ingresado no corresponde a ningún usuario registrado.",
        );
      }

      const userData = userSnap.data();
      const role = userData.role?.toLowerCase() || "";
      // Validamos tanto "conductor" como "operador" ya que AddUser puede guardarlo como Operador
      if (role !== "conductor" && role !== "operador") {
        throw new Error(
          "El usuario especificado existe, pero no tiene el rol de Conductor.",
        );
      }

      // 2. Upload image to Cloudinary
      const uploadResult = await uploadImage(imgFile);
      if (!uploadResult.success) {
        throw new Error(
          "No se pudo subir la imagen del vehículo. " +
            (uploadResult.error?.message || ""),
        );
      }
      const imageUrl = uploadResult.url;
      console.log("Imagen subida con exito. Url: ", imageUrl);

      // 3. Crear documento de vehículo (el ID del documento es el driverId)
      const vehicleRef = doc(db, "vehicles", driverId);
      await setDoc(vehicleRef, {
        driverId: driverId,
        imageUri: imageUrl,
        routeId: routeId,
        plate: plate,
        seats: Number(seats),
        createdAt: serverTimestamp(),
        modifiedAt: serverTimestamp(),
      });
      // 3. Inicializar el documento de tracking para el conductor
      const trackingRef = doc(db, "tracking", driverId);
      await setDoc(trackingRef, {
        driverId: driverId,
        online: false,
        location: null,
        lastUpdated: serverTimestamp(),
      });
      return { success: true };
    } catch (err) {
      console.error("Error al agregar vehículo:", err);
      setError(err);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  return { addVehicle, loading, error };
}

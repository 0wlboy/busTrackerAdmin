/**
 * Script de migración: agrega el campo `strokeColor` a las rutas existentes
 * en la colección `vehicleRoutes` que no lo tengan.
 *
 * Ejecución: node migrate-strokeColor.mjs
 */

import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA3exvYCBbmxx-Y3pWFyI6Z7PoEemYe0IQ",
  authDomain: "bus-tracker-e8ce9.firebaseapp.com",
  projectId: "bus-tracker-e8ce9",
  storageBucket: "bus-tracker-e8ce9.firebasestorage.app",
  messagingSenderId: "603421472859",
  appId: "1:603421472859:web:40a8c58f0358e4d0f2f55d",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const DEFAULT_STROKE_COLOR = "#2D1E2F";

async function migrate() {
  console.log("🚀 Iniciando migración de strokeColor...\n");

  const snapshot = await getDocs(collection(db, "vehicleRoutes"));
  const total = snapshot.docs.length;
  let updated = 0;
  let skipped = 0;

  for (const routeDoc of snapshot.docs) {
    const data = routeDoc.data();

    if (!("strokeColor" in data)) {
      const routeRef = doc(db, "vehicleRoutes", routeDoc.id);
      await updateDoc(routeRef, { strokeColor: DEFAULT_STROKE_COLOR });
      console.log(`✅ Actualizada ruta "${data.name || routeDoc.id}" → strokeColor: ${DEFAULT_STROKE_COLOR}`);
      updated++;
    } else {
      console.log(`⏭️  Ruta "${data.name || routeDoc.id}" ya tiene strokeColor: ${data.strokeColor}`);
      skipped++;
    }
  }

  console.log(`\n📊 Resultado: ${total} rutas totales | ${updated} actualizadas | ${skipped} sin cambios`);
  console.log("✅ Migración completada.");
  process.exit(0);
}

migrate().catch((err) => {
  console.error("❌ Error en la migración:", err);
  process.exit(1);
});

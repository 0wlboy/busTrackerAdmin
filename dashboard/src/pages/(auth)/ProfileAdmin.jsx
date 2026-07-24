import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useUpdateUser } from "../../hooks/exporter";
import {
  User,
  Phone,
  Mail,
  CreditCard,
  Calendar,
  Pencil,
  Loader2,
  ShieldCheck,
} from "lucide-react";

/**
 * Formatea un timestamp de Firestore o una cadena ISO a una fecha legible.
 */
function formatDate(value) {
  if (!value) return "—";
  let date;
  if (value?.seconds) {
    // Timestamp de Firestore
    date = new Date(value.seconds * 1000);
  } else if (typeof value === "string") {
    date = new Date(value);
  } else {
    return "—";
  }
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("es-VE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function ProfileAdmin() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { getUser } = useUpdateUser();

  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadAdmin() {
      if (!currentUser?.uid) {
        // Usuario hardcodeado — no tiene Firestore doc
        setAdminData({
          userName: currentUser?.userName || "Administrador General",
          email: currentUser?.email || "admin@empresa.com",
          cedula: "—",
          telefono: "—",
          phone: "—",
          createdAt: null,
          role: "admin",
        });
        setLoading(false);
        return;
      }

      const res = await getUser(currentUser.uid);
      if (res.success && res.data) {
        setAdminData(res.data);
      } else {
        setError("No se pudo cargar la información del perfil.");
      }
      setLoading(false);
    }
    loadAdmin();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-6">
        <Loader2 className="w-10 h-10 text-[#EFCC01] animate-spin mb-4" />
        <span className="text-sm text-[#2D1E2F]/70 font-medium">
          Cargando perfil...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-6">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  const phone = adminData?.telefono || adminData?.phone || "—";
  const cedula = adminData?.cedula ? String(adminData.cedula) : "—";
  const joinDate = formatDate(adminData?.createdAt);

  const fields = [
    {
      icon: User,
      label: "Nombre completo",
      value: adminData?.userName || "—",
    },
    {
      icon: Mail,
      label: "Correo electrónico",
      value: adminData?.email || "—",
    },
    {
      icon: Phone,
      label: "Teléfono",
      value: phone,
    },
    {
      icon: CreditCard,
      label: "Cédula",
      value: cedula,
    },
    {
      icon: Calendar,
      label: "Miembro desde",
      value: joinDate,
    },
  ];

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#2D1E2F] text-2xl font-semibold">Mi perfil</h1>
          <p className="text-[#2D1E2F]/50 text-sm mt-0.5">
            Información de tu cuenta de administrador
          </p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-[#FFF3AD] border border-[#2D1E2F]/10 rounded-2xl p-6 space-y-6">
        {/* Avatar & Role Badge */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-[#EFCC01]/30 border-2 border-[#EFCC01]/60 flex items-center justify-center shadow-md">
              <User className="w-9 h-9 text-[#2D1E2F]/70" />
            </div>
            {/* Online dot */}
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#FFF3AD]" />
          </div>

          {/* Name & Role */}
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-[#2D1E2F] text-xl font-semibold">
              {adminData?.userName || "—"}
            </h2>
            <div className="inline-flex items-center gap-1.5 mt-1.5 px-3 py-1 rounded-full bg-[#EFCC01]/25 border border-[#EFCC01]/50">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2D1E2F]/70" />
              <span className="text-xs font-medium text-[#2D1E2F]/70 capitalize">
                {adminData?.role || "Administrador"}
              </span>
            </div>
          </div>

          {/* Edit button — only for Firestore-backed admins */}
          {currentUser?.uid && (
            <button
              onClick={() => navigate(`/admin/${currentUser.uid}/editar`)}
              className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-[#EFCC01] hover:bg-[#EFCC01]/85 text-[#2D1E2F] rounded-xl text-sm font-semibold transition-colors shadow-md shadow-[#EFCC01]/20 cursor-pointer"
            >
              <Pencil className="w-4 h-4" />
              Editar perfil
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-[#2D1E2F]/10" />

        {/* Info Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex items-start gap-3 bg-[#FFF9D6] border border-[#2D1E2F]/10 rounded-xl p-4"
            >
              <div className="mt-0.5 w-8 h-8 rounded-lg bg-[#EFCC01]/20 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-[#2D1E2F]/60" />
              </div>
              <div className="min-w-0">
                <p className="text-[#2D1E2F]/50 text-xs mb-0.5">{label}</p>
                <p className="text-[#2D1E2F] text-sm font-medium break-words">
                  {value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Note for hardcoded admin */}
        {!currentUser?.uid && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-700 text-xs">
            Este perfil corresponde al administrador general del sistema y no
            puede ser editado desde aquí.
          </div>
        )}
      </div>
    </div>
  );
}

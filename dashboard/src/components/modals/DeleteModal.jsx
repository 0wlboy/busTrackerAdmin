import React from "react";
import { Trash2 } from "lucide-react";

export default function DeleteModal({ isOpen, onClose, onConfirm, loading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay Backdrop */}
      <div
        className="fixed inset-0 bg-[#2D1E2F]/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-[#FFF9D6] border border-[#2D1E2F]/10 p-6 text-left align-middle shadow-2xl transition-all z-10">
        {/* Modal Header/Icon */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0 border border-red-200">
            <Trash2 className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex items-center justify-center">
            <h3 className="text-lg font-bold text-[#2D1E2F]">
              ¿Desea continuar con el borrado?
            </h3>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#EFCC01] hover:bg-[#EFCC01]/85 text-[#2D1E2F] font-semibold rounded-xl text-sm transition-colors cursor-pointer shadow-md shadow-[#EFCC01]/10 border border-[#EFCC01]/25 text-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#FFF9D6] hover:bg-[#2D1E2F]/8 text-red-600 font-semibold rounded-xl text-sm transition-colors border border-red-600/25 cursor-pointer  text-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}

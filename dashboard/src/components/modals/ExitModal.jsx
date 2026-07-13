import React from "react";
import { LogOut, X } from "lucide-react";

export default function ExitModal({ isOpen, onClose, onConfirm }) {
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
            <LogOut className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex items-center justify-center">
            <h3 className="text-lg font-bold text-[#2D1E2F]">
              ¿Deseas cerrar sesión?
            </h3>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#EFCC01] hover:bg-[#EFCC01]/85 text-[#2D1E2F] font-semibold rounded-xl text-sm transition-colors cursor-pointer shadow-md shadow-[#EFCC01]/10 border border-[#EFCC01]/25 text-center"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="w-full sm:w-auto px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer shadow-md shadow-red-600/10 text-center"
          >
            Cerrar sesion
          </button>
        </div>
      </div>
    </div>
  );
}

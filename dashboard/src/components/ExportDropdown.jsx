import { useState, useRef, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { Download, ChevronDown, FileSpreadsheet, FileText } from "lucide-react";

export default function ExportDropdown({
  data,
  columns,
  fileName = "reporte",
  title = "Reporte",
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(title, 14, 15);

    const tableColumn = columns.map((col) => col.header);
    const tableRows = data.map((item) =>
      columns.map((col) => col.getValue(item))
    );

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save(`${fileName}.pdf`);
    setIsOpen(false);
  };

  const exportToExcel = () => {
    const rows = data.map((item) => {
      const rowObj = {};
      columns.forEach((col) => {
        rowObj[col.header] = col.getValue(item);
      });
      return rowObj;
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Datos");

    XLSX.writeFile(workbook, `${fileName}.xlsx`);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || !data || data.length === 0}
        className="flex items-center gap-2 px-4 py-2.5 bg-[#EFCC01] text-[#2D1E2F] rounded-xl hover:bg-[#F2D72B] active:bg-[#EFCC01] transition-all font-medium text-sm disabled:opacity-50 disabled:pointer-events-none shadow-sm cursor-pointer"
        type="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Download className="w-4 h-4" />
        <span>Exportar</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 rounded-xl bg-[#FFF9D6] border border-[#2D1E2F]/15 shadow-lg shadow-[#2D1E2F]/5 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="py-1">
            <button
              onClick={exportToPDF}
              className="flex items-center gap-2.5 px-4 py-3 text-sm text-[#2D1E2F] hover:bg-[#EFCC01]/20 w-full text-left transition-colors font-medium cursor-pointer"
            >
              <FileText className="w-4 h-4 text-red-600" />
              <span>Descargar PDF</span>
            </button>
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2.5 px-4 py-3 text-sm text-[#2D1E2F] hover:bg-[#EFCC01]/20 w-full text-left transition-colors border-t border-[#2D1E2F]/5 font-medium cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-green-700" />
              <span>Descargar Excel</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

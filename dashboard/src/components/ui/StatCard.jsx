import { TrendingUp } from "lucide-react";

export default function StatCard({ title, value, subtitle, icon, accent, trend }) {
  return (
    <div className={`rounded-2xl p-5 flex flex-col gap-4 transition-all border ${
      accent
        ? "bg-[#2D1E2F] border-[#2D1E2F]"
        : "bg-[#FFF3AD] border-[#2D1E2F]/10 hover:border-[#2D1E2F]/20"
    }`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-sm ${accent ? "text-white/50" : "text-[#2D1E2F]/50"}`}>{title}</p>
          <p className={`text-3xl mt-1 ${accent ? "text-[#EFCC01]" : "text-[#2D1E2F]"}`}>{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${accent ? "bg-[#EFCC01]/15" : "bg-[#2D1E2F]/8"}`}>
          {icon}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-xs ${accent ? "text-white/40" : "text-[#2D1E2F]/40"}`}>{subtitle}</span>
        {trend && (
          <span className="flex items-center gap-1 text-green-600 text-xs">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}

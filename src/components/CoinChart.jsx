import React from "react";
import { BarChart3, Loader2 } from "lucide-react";
import { useI18n } from "../i18n/index.js";

export default function CoinChart({ chartData, chartLoading }) {
  const { t } = useI18n();
  const max = Math.max(...chartData.map((x) => x.value), 1);

  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-sm font-bold text-[#111827]">
          <BarChart3 size={15} className="text-[#3478F6]" />{" "}
          {t("dash.chartTitle")}
        </p>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
          +{chartData.find((d) => d.isToday)?.value || 0} {t("dash.today")}
        </span>
      </div>

      {chartLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 size={20} className="animate-spin text-[#D1D5DB]" />
        </div>
      ) : chartData.every((d) => d.value === 0) ? (
        <div className="mt-5 flex flex-col items-center justify-center py-6 text-center">
          <BarChart3 size={28} className="text-[#D1D5DB]" />
          <p className="mt-2 text-sm font-medium text-[#9CA3AF]">
            {t("dash.noData")}
          </p>
          <p className="mt-0.5 text-xs text-[#C4CAD2]">
            {t("dash.noDataSub")}
          </p>
        </div>
      ) : (
        <div
          className="mt-5 flex items-end justify-between gap-2"
          style={{ height: "140px" }}
        >
          {chartData.map((d, i) => {
            const heightPct =
              d.value === 0
                ? 20
                : Math.max(20, Math.round((d.value / max) * 100));
            return (
              <div
                key={i}
                className="flex flex-1 flex-col items-center justify-end gap-1.5"
              >
                <span
                  className={`text-[10px] font-bold ${
                    d.value > 0 ? "text-[#374151]" : "text-transparent"
                  }`}
                >
                  {d.value > 0 ? d.value : "0"}
                </span>
                <div className="flex w-full flex-1 items-end">
                  <div
                    className={`w-full rounded-t-md transition-all ${
                      d.isToday
                        ? "bg-gradient-to-t from-[#3478F6] to-[#5B9DF9]"
                        : d.value > 0
                        ? "bg-[#D9E7FD]"
                        : "bg-[#EEF2F7]"
                    }`}
                    style={{ height: `${heightPct}%`, minHeight: "6px" }}
                  />
                </div>
                <span
                  className={`text-[10px] ${
                    d.isToday ? "font-bold text-[#3478F6]" : "text-[#9CA3AF]"
                  }`}
                >
                  {t(`day.${d.dow}`)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
                }

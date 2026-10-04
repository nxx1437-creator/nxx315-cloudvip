import React from "react";
import { BarChart3, Loader2 } from "lucide-react";
import { Panel, SectionLabel } from "./home/HomeSections.jsx";
import { useI18n } from "../i18n/index.js";

export default function CoinChart({ chartData, chartLoading }) {
  const { t } = useI18n();
  const max = Math.max(...chartData.map((x) => x.value), 1);
  const todayValue = chartData.find((d) => d.isToday)?.value || 0;

  return (
    <div>
      <SectionLabel
        right={
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
            +{todayValue} {t("dash.today")}
          </span>
        }
      >
        {t("dash.chartTitle")}
      </SectionLabel>

      <Panel className="p-5">
        {chartLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 size={20} className="animate-spin text-slate-300" />
          </div>
        ) : chartData.every((d) => d.value === 0) ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-50">
              <BarChart3 size={26} className="text-slate-300" />
            </span>
            <p className="mt-3 text-sm font-bold text-slate-600">
              {t("dash.noData")}
            </p>
            <p className="mt-0.5 text-xs text-slate-400">
              {t("dash.noDataSub")}
            </p>
          </div>
        ) : (
          <div
            className="flex items-end justify-between gap-2"
            style={{ height: "150px" }}
          >
            {chartData.map((d, i) => {
              const heightPct =
                d.value === 0
                  ? 18
                  : Math.max(18, Math.round((d.value / max) * 100));
              return (
                <div
                  key={i}
                  className="flex flex-1 flex-col items-center justify-end gap-1.5"
                >
                  <span
                    className={`text-[10px] font-bold ${
                      d.value > 0 ? "text-slate-700" : "text-transparent"
                    }`}
                  >
                    {d.value > 0 ? d.value : "0"}
                  </span>
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className={`w-full rounded-t-xl transition-all ${
                        d.isToday
                          ? "bg-gradient-to-t from-emerald-600 to-emerald-400"
                          : d.value > 0
                          ? "bg-emerald-100"
                          : "bg-slate-100"
                      }`}
                      style={{ height: `${heightPct}%`, minHeight: "6px" }}
                    />
                  </div>
                  <span
                    className={`text-[11px] ${
                      d.isToday
                        ? "font-bold text-emerald-700"
                        : "font-medium text-slate-400"
                    }`}
                  >
                    {t(`day.${d.dow}`)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Panel>
    </div>
  );
}


"use client";

import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { formatEffort } from "@/lib/format";
import type { RequirementStats } from "@/types";

interface EffortSummaryProps {
  stats: RequirementStats;
}

export function EffortSummary({ stats }: EffortSummaryProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <i className="fas fa-chart-pie text-purple-400"></i>
          {t("effortSummary.title")}
        </h2>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Total Active Effort */}
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-4">
            <div className="text-sm text-white/60 mb-1">
              {t("effortSummary.totalActiveEffort")}
            </div>
            <div className="text-3xl font-bold text-white">
              {formatEffort(stats.totalActiveEffort)}
              <span className="text-lg font-normal text-white/60 ml-1">
                {t("common.manDays")}
              </span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-xs text-white/60">
                {t("effortSummary.total")}
              </div>
            </div>
            <div className="bg-green-500/20 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-green-400">
                {stats.active}
              </div>
              <div className="text-xs text-white/60">
                {t("effortSummary.active")}
              </div>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-white/50">
                {stats.inactive}
              </div>
              <div className="text-xs text-white/60">
                {t("effortSummary.inactive")}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

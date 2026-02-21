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
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <i className="fas fa-chart-pie text-indigo-500"></i>
          {t("effortSummary.title")}
        </h2>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Total Active Effort */}
          <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl p-4">
            <div className="text-sm text-gray-500 mb-1">
              {t("effortSummary.totalActiveEffort")}
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {formatEffort(stats.totalActiveEffort)}
              <span className="text-lg font-normal text-gray-500 ml-1">
                {t("common.manDays")}
              </span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-100 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {stats.total}
              </div>
              <div className="text-xs text-gray-500">
                {t("effortSummary.total")}
              </div>
            </div>
            <div className="bg-green-100 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.active}
              </div>
              <div className="text-xs text-gray-500">
                {t("effortSummary.active")}
              </div>
            </div>
            <div className="bg-gray-100 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-gray-400">
                {stats.inactive}
              </div>
              <div className="text-xs text-gray-500">
                {t("effortSummary.inactive")}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

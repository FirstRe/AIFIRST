'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { formatEffort } from '@/lib/format';
import type { RequirementStats } from '@/types';

interface EffortSummaryProps {
  stats: RequirementStats;
}

export function EffortSummary({ stats }: EffortSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <i className="fas fa-chart-pie text-purple-400"></i>
          Effort Summary
        </h2>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Total Active Effort */}
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-4">
            <div className="text-sm text-white/60 mb-1">Total Active Effort</div>
            <div className="text-3xl font-bold text-white">
              {formatEffort(stats.totalActiveEffort)}
              <span className="text-lg font-normal text-white/60 ml-1">man-days</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-xs text-white/60">Total</div>
            </div>
            <div className="bg-green-500/20 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-green-400">{stats.active}</div>
              <div className="text-xs text-white/60">Active</div>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-white/50">{stats.inactive}</div>
              <div className="text-xs text-white/60">Inactive</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


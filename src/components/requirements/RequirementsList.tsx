'use client';

import { Card } from '@/components/ui/Card';
import { RequirementRow } from './RequirementRow';
import { EmptyState } from './EmptyState';
import type { Requirement } from '@/types';

interface RequirementsListProps {
  requirements: Requirement[];
  onToggle: (id: number) => void;
  onUpdate: (id: number, updates: { description?: string; effort?: number }) => { isValid: boolean; error?: string };
  onDelete: (id: number) => void;
}

export function RequirementsList({ requirements, onToggle, onUpdate, onDelete }: RequirementsListProps) {
  if (requirements.length === 0) {
    return (
      <Card>
        <EmptyState />
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              <th className="px-4 py-3 text-center text-sm font-semibold text-white/80 w-16">ID</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-white/80">Description</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-white/80 w-32">Effort</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-white/80 w-24">Status</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-white/80 w-28">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requirements.map((requirement) => (
              <RequirementRow
                key={requirement.id}
                requirement={requirement}
                onToggle={onToggle}
                onUpdate={onUpdate}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}


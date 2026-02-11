'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface RequirementFormProps {
  onSubmit: (description: string, effort: number) => { isValid: boolean; error?: string };
}

export function RequirementForm({ onSubmit }: RequirementFormProps) {
  const [description, setDescription] = useState('');
  const [effort, setEffort] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const effortValue = parseFloat(effort);
    if (isNaN(effortValue)) {
      setError('Please enter a valid effort value');
      return;
    }

    const result = onSubmit(description, effortValue);
    if (!result.isValid) {
      setError(result.error || 'Failed to add requirement');
      return;
    }

    // Reset form
    setDescription('');
    setEffort('');
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <i className="fas fa-plus-circle text-green-400"></i>
          Add Requirement
        </h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter requirement description..."
              rows={3}
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 resize-none"
            />
          </div>

          <Input
            label="Effort (man-days)"
            type="number"
            step="0.01"
            min="0.01"
            max="9999"
            value={effort}
            onChange={(e) => setEffort(e.target.value)}
            placeholder="e.g., 2.5"
          />

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
              <i className="fas fa-exclamation-circle mr-2"></i>
              {error}
            </div>
          )}

          <Button type="submit" className="w-full">
            <i className="fas fa-plus mr-2"></i>
            Add Requirement
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}


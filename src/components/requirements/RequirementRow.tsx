'use client';

import { useState } from 'react';
import { Toggle } from '@/components/ui/Toggle';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { formatEffort } from '@/lib/format';
import type { Requirement } from '@/types';

interface RequirementRowProps {
  requirement: Requirement;
  onToggle: (id: number) => void;
  onUpdate: (id: number, updates: { description?: string; effort?: number }) => { isValid: boolean; error?: string };
  onDelete: (id: number) => void;
}

export function RequirementRow({ requirement, onToggle, onUpdate, onDelete }: RequirementRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editDescription, setEditDescription] = useState(requirement.description);
  const [editEffort, setEditEffort] = useState(String(requirement.effort));
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    setError(null);
    const effortValue = parseFloat(editEffort);
    if (isNaN(effortValue)) {
      setError('Please enter a valid effort value');
      return;
    }

    const result = onUpdate(requirement.id, {
      description: editDescription,
      effort: effortValue,
    });

    if (!result.isValid) {
      setError(result.error || 'Failed to update');
      return;
    }

    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditDescription(requirement.description);
    setEditEffort(String(requirement.effort));
    setError(null);
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete(requirement.id);
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <tr className={`border-b border-white/10 hover:bg-white/5 transition-colors ${!requirement.isActive ? 'opacity-50' : ''}`}>
        {/* ID */}
        <td className="px-4 py-4 text-center">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/20 text-purple-300 font-medium text-sm">
            {requirement.id}
          </span>
        </td>

        {/* Description */}
        <td className="px-4 py-4">
          {isEditing ? (
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
              rows={2}
            />
          ) : (
            <span className={`text-white/90 ${!requirement.isActive ? 'line-through' : ''}`}>
              {requirement.description}
            </span>
          )}
        </td>

        {/* Effort */}
        <td className="px-4 py-4 text-center">
          {isEditing ? (
            <Input
              type="number"
              step="0.01"
              min="0.01"
              value={editEffort}
              onChange={(e) => setEditEffort(e.target.value)}
              className="w-24 text-center text-sm"
            />
          ) : (
            <span className="text-white/90">{formatEffort(requirement.effort)}</span>
          )}
        </td>

        {/* Status Toggle */}
        <td className="px-4 py-4 text-center">
          <Toggle
            checked={requirement.isActive}
            onChange={() => onToggle(requirement.id)}
            label={requirement.isActive ? 'Active' : 'Inactive'}
          />
        </td>

        {/* Actions */}
        <td className="px-4 py-4">
          <div className="flex items-center justify-center gap-2">
            {isEditing ? (
              <>
                <Button variant="primary" size="sm" onClick={handleSave}>
                  <i className="fas fa-check"></i>
                </Button>
                <Button variant="ghost" size="sm" onClick={handleCancel}>
                  <i className="fas fa-times"></i>
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                  <i className="fas fa-edit"></i>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(true)}>
                  <i className="fas fa-trash text-red-400"></i>
                </Button>
              </>
            )}
          </div>
        </td>
      </tr>

      {/* Edit Error */}
      {isEditing && error && (
        <tr>
          <td colSpan={5} className="px-4 py-2">
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-2 text-red-400 text-sm">
              <i className="fas fa-exclamation-circle mr-2"></i>
              {error}
            </div>
          </td>
        </tr>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Requirement"
      >
        <p className="text-white/80 mb-6">
          Are you sure you want to delete requirement #{requirement.id}? This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
}


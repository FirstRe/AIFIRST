"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Toggle } from "@/components/ui/Toggle";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { formatEffort } from "@/lib/format";
import type { Requirement } from "@/types";

interface RequirementRowProps {
  requirement: Requirement;
  onToggle: (id: number) => Promise<void>;
  onUpdate: (
    id: number,
    updates: { description?: string; effort?: number },
  ) => Promise<{ isValid: boolean; error?: string }>;
  onDelete: (id: number) => Promise<void>;
}

export function RequirementRow({
  requirement,
  onToggle,
  onUpdate,
  onDelete,
}: RequirementRowProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editDescription, setEditDescription] = useState(
    requirement.description,
  );
  const [editEffort, setEditEffort] = useState(String(requirement.effort));
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const handleSave = async () => {
    setError(null);
    const effortValue = parseFloat(editEffort);
    if (isNaN(effortValue)) {
      setError(t("errors.invalidEffort"));
      return;
    }

    setIsSaving(true);
    try {
      const result = await onUpdate(requirement.id, {
        description: editDescription,
        effort: effortValue,
      });

      if (!result.isValid) {
        setError(result.error || t("errors.failedToUpdate"));
        return;
      }

      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditDescription(requirement.description);
    setEditEffort(String(requirement.effort));
    setError(null);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(requirement.id);
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      await onToggle(requirement.id);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <>
      <tr
        className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${!requirement.isActive ? "opacity-50" : ""}`}
      >
        {/* ID */}
        <td className="px-4 py-4 text-center">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-medium text-sm">
            {requirement.id}
          </span>
        </td>

        {/* Description */}
        <td className="px-4 py-4">
          {isEditing ? (
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              rows={2}
            />
          ) : (
            <span
              className={`text-gray-700 ${!requirement.isActive ? "line-through" : ""}`}
            >
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
            <span className="text-gray-700">
              {formatEffort(requirement.effort)}
            </span>
          )}
        </td>

        {/* Status Toggle */}
        <td className="px-4 py-4 text-center">
          <Toggle
            checked={requirement.isActive}
            onChange={handleToggle}
            disabled={isToggling}
            label={
              requirement.isActive ? t("status.active") : t("status.inactive")
            }
          />
        </td>

        {/* Actions */}
        <td className="px-4 py-4">
          <div className="flex items-center justify-center gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <i className="fas fa-spinner fa-spin"></i>
                  ) : (
                    <i className="fas fa-check"></i>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  <i className="fas fa-times"></i>
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <i className="fas fa-edit"></i>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                >
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
            <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-red-600 text-sm">
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
        title={t("modal.deleteRequirement")}
      >
        <p className="text-gray-600 mb-6">
          {t("modal.deleteConfirmation", { id: requirement.id })}
        </p>
        <div className="flex gap-3 justify-end">
          <Button
            variant="ghost"
            onClick={() => setShowDeleteConfirm(false)}
            disabled={isDeleting}
          >
            {t("common.cancel")}
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                {t("common.loading")}
              </>
            ) : (
              t("common.delete")
            )}
          </Button>
        </div>
      </Modal>
    </>
  );
}

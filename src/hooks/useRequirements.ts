"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { requirementsApi, projectApi } from "@/lib/api";
import {
  validateDescription,
  validateEffort,
  validateImportData,
} from "@/lib/validation";
import { normalizeEffort } from "@/lib/format";
import type {
  Project,
  Requirement,
  RequirementStats,
  ExportData,
  ValidationResult,
} from "@/types";

export interface UseRequirementsReturn {
  requirements: Requirement[];
  isLoading: boolean;
  error: string | null;
  stats: RequirementStats;
  addRequirement: (
    description: string,
    effort: number,
  ) => Promise<ValidationResult>;
  updateRequirement: (
    id: number,
    updates: Partial<Pick<Requirement, "description" | "effort">>,
  ) => Promise<ValidationResult>;
  deleteRequirement: (id: number) => Promise<void>;
  toggleStatus: (id: number) => Promise<void>;
  exportData: (project: Project | null) => ExportData | null;
  importData: (data: ExportData) => Promise<ValidationResult>;
  refetch: () => Promise<void>;
}

export function useRequirements(): UseRequirementsReturn {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch requirements from API
  const fetchRequirements = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await requirementsApi.getAll();
      setRequirements(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch requirements",
      );
      setRequirements([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load requirements on mount
  useEffect(() => {
    fetchRequirements();
  }, [fetchRequirements]);

  // Compute statistics
  const stats = useMemo((): RequirementStats => {
    const active = requirements.filter((r) => r.isActive);
    const inactive = requirements.filter((r) => !r.isActive);
    const totalActiveEffort = active.reduce((sum, r) => sum + r.effort, 0);

    return {
      total: requirements.length,
      active: active.length,
      inactive: inactive.length,
      totalActiveEffort: normalizeEffort(totalActiveEffort),
    };
  }, [requirements]);

  const addRequirement = useCallback(
    async (description: string, effort: number): Promise<ValidationResult> => {
      // Client-side validation first
      const descValidation = validateDescription(description);
      if (!descValidation.isValid) return descValidation;

      const effortValidation = validateEffort(effort);
      if (!effortValidation.isValid) return effortValidation;

      try {
        setError(null);
        const newRequirement = await requirementsApi.create({
          description: description.trim(),
          effort: normalizeEffort(effort),
        });
        setRequirements((prev) => [...prev, newRequirement]);
        return { isValid: true };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to add requirement";
        setError(errorMessage);
        return { isValid: false, error: errorMessage };
      }
    },
    [],
  );

  const updateRequirement = useCallback(
    async (
      id: number,
      updates: Partial<Pick<Requirement, "description" | "effort">>,
    ): Promise<ValidationResult> => {
      // Client-side validation first
      if (updates.description !== undefined) {
        const validation = validateDescription(updates.description);
        if (!validation.isValid) return validation;
      }

      if (updates.effort !== undefined) {
        const validation = validateEffort(updates.effort);
        if (!validation.isValid) return validation;
      }

      try {
        setError(null);
        const updatedRequirement = await requirementsApi.update(id, {
          ...(updates.description !== undefined && {
            description: updates.description.trim(),
          }),
          ...(updates.effort !== undefined && {
            effort: normalizeEffort(updates.effort),
          }),
        });
        setRequirements((prev) =>
          prev.map((r) => (r.id === id ? updatedRequirement : r)),
        );
        return { isValid: true };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update requirement";
        setError(errorMessage);
        return { isValid: false, error: errorMessage };
      }
    },
    [],
  );

  const deleteRequirement = useCallback(async (id: number): Promise<void> => {
    try {
      setError(null);
      await requirementsApi.delete(id);
      setRequirements((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete requirement";
      setError(errorMessage);
      throw err;
    }
  }, []);

  const toggleStatus = useCallback(async (id: number): Promise<void> => {
    try {
      setError(null);
      const updatedRequirement = await requirementsApi.toggle(id);
      setRequirements((prev) =>
        prev.map((r) => (r.id === id ? updatedRequirement : r)),
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to toggle status";
      setError(errorMessage);
      throw err;
    }
  }, []);

  const exportData = useCallback(
    (project: Project | null): ExportData | null => {
      if (!project) return null;

      return {
        projectName: project.name,
        requirements: requirements.map(
          ({ id, description, effort, isActive, createdAt }) => ({
            id,
            description,
            effort,
            isActive,
            createdAt,
          }),
        ),
        exportDate: new Date().toISOString(),
      };
    },
    [requirements],
  );

  const importData = useCallback(
    async (data: ExportData): Promise<ValidationResult> => {
      const validation = validateImportData(data);
      if (!validation.isValid) return validation;

      try {
        setError(null);

        // Create new project (this deletes existing project and requirements)
        await projectApi.create({ name: data.projectName });

        // Import requirements one by one
        const importedRequirements: Requirement[] = [];
        for (const req of data.requirements) {
          const newReq = await requirementsApi.create({
            description: req.description,
            effort: normalizeEffort(req.effort),
          });
          // If original was inactive, toggle it
          if (req.isActive === false) {
            const toggled = await requirementsApi.toggle(newReq.id);
            importedRequirements.push(toggled);
          } else {
            importedRequirements.push(newReq);
          }
        }

        setRequirements(importedRequirements);
        return { isValid: true };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to import data";
        setError(errorMessage);
        return { isValid: false, error: errorMessage };
      }
    },
    [],
  );

  return {
    requirements,
    isLoading,
    error,
    stats,
    addRequirement,
    updateRequirement,
    deleteRequirement,
    toggleStatus,
    exportData,
    importData,
    refetch: fetchRequirements,
  };
}

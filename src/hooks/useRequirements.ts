'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { storageService } from '@/lib/storage';
import { validateDescription, validateEffort, validateImportData } from '@/lib/validation';
import { normalizeEffort } from '@/lib/format';
import type { Requirement, RequirementStats, ExportData, ValidationResult } from '@/types';

export interface UseRequirementsReturn {
  requirements: Requirement[];
  isLoading: boolean;
  stats: RequirementStats;
  addRequirement: (description: string, effort: number) => ValidationResult;
  updateRequirement: (id: number, updates: Partial<Pick<Requirement, 'description' | 'effort'>>) => ValidationResult;
  deleteRequirement: (id: number) => void;
  toggleStatus: (id: number) => void;
  exportData: () => ExportData | null;
  importData: (data: ExportData) => ValidationResult;
}

export function useRequirements(): UseRequirementsReturn {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load requirements on mount
  useEffect(() => {
    const savedRequirements = storageService.getRequirements();
    setRequirements(savedRequirements);
    setIsLoading(false);
  }, []);

  // Compute statistics
  const stats = useMemo((): RequirementStats => {
    const active = requirements.filter(r => r.isActive);
    const inactive = requirements.filter(r => !r.isActive);
    const totalActiveEffort = active.reduce((sum, r) => sum + r.effort, 0);

    return {
      total: requirements.length,
      active: active.length,
      inactive: inactive.length,
      totalActiveEffort: normalizeEffort(totalActiveEffort),
    };
  }, [requirements]);

  const addRequirement = useCallback((description: string, effort: number): ValidationResult => {
    const descValidation = validateDescription(description);
    if (!descValidation.isValid) return descValidation;

    const effortValidation = validateEffort(effort);
    if (!effortValidation.isValid) return effortValidation;

    const project = storageService.getProject();
    if (!project) return { isValid: false, error: 'No project exists' };

    const newRequirement: Requirement = {
      id: project.nextRequirementId,
      description: description.trim(),
      effort: normalizeEffort(effort),
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    // Update project's nextRequirementId
    storageService.saveProject({
      ...project,
      nextRequirementId: project.nextRequirementId + 1,
      updatedAt: new Date().toISOString(),
    });

    const updatedRequirements = [...storageService.getRequirements(), newRequirement];
    storageService.saveRequirements(updatedRequirements);
    setRequirements(updatedRequirements);

    return { isValid: true };
  }, []);

  const updateRequirement = useCallback((
    id: number,
    updates: Partial<Pick<Requirement, 'description' | 'effort'>>
  ): ValidationResult => {
    if (updates.description !== undefined) {
      const validation = validateDescription(updates.description);
      if (!validation.isValid) return validation;
    }

    if (updates.effort !== undefined) {
      const validation = validateEffort(updates.effort);
      if (!validation.isValid) return validation;
    }

    const currentRequirements = storageService.getRequirements();
    const index = currentRequirements.findIndex(r => r.id === id);
    if (index === -1) return { isValid: false, error: 'Requirement not found' };

    currentRequirements[index] = {
      ...currentRequirements[index],
      ...(updates.description !== undefined && { description: updates.description.trim() }),
      ...(updates.effort !== undefined && { effort: normalizeEffort(updates.effort) }),
    };

    storageService.saveRequirements(currentRequirements);
    setRequirements([...currentRequirements]);

    // Update project timestamp
    const project = storageService.getProject();
    if (project) {
      storageService.saveProject({ ...project, updatedAt: new Date().toISOString() });
    }

    return { isValid: true };
  }, []);

  const deleteRequirement = useCallback((id: number): void => {
    const currentRequirements = storageService.getRequirements();
    const filtered = currentRequirements.filter(r => r.id !== id);
    storageService.saveRequirements(filtered);
    setRequirements(filtered);

    const project = storageService.getProject();
    if (project) {
      storageService.saveProject({ ...project, updatedAt: new Date().toISOString() });
    }
  }, []);

  const toggleStatus = useCallback((id: number): void => {
    const currentRequirements = storageService.getRequirements();
    const index = currentRequirements.findIndex(r => r.id === id);
    if (index === -1) return;

    currentRequirements[index] = {
      ...currentRequirements[index],
      isActive: !currentRequirements[index].isActive,
    };

    storageService.saveRequirements(currentRequirements);
    setRequirements([...currentRequirements]);

    const project = storageService.getProject();
    if (project) {
      storageService.saveProject({ ...project, updatedAt: new Date().toISOString() });
    }
  }, []);

  const exportData = useCallback((): ExportData | null => {
    const project = storageService.getProject();
    if (!project) return null;

    return {
      projectName: project.name,
      requirements: storageService.getRequirements(),
      exportDate: new Date().toISOString(),
    };
  }, []);

  const importData = useCallback((data: ExportData): ValidationResult => {
    const validation = validateImportData(data);
    if (!validation.isValid) return validation;

    // Clear existing and import new data
    storageService.clearAllData();
    storageService.initializeNewProject(data.projectName);

    // Get the newly created project to track IDs
    const project = storageService.getProject();
    if (!project) return { isValid: false, error: 'Failed to initialize project' };

    // Reassign IDs to imported requirements
    let nextId = 1;
    const importedRequirements: Requirement[] = data.requirements.map(req => ({
      id: nextId++,
      description: req.description,
      effort: normalizeEffort(req.effort),
      isActive: req.isActive ?? true,
      createdAt: req.createdAt || new Date().toISOString(),
    }));

    storageService.saveRequirements(importedRequirements);
    storageService.saveProject({ ...project, nextRequirementId: nextId });
    setRequirements(importedRequirements);

    return { isValid: true };
  }, []);

  return {
    requirements,
    isLoading,
    stats,
    addRequirement,
    updateRequirement,
    deleteRequirement,
    toggleStatus,
    exportData,
    importData,
  };
}


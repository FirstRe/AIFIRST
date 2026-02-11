'use client';

import { useState, useEffect, useCallback } from 'react';
import { storageService } from '@/lib/storage';
import { validateProjectName } from '@/lib/validation';
import type { Project, ValidationResult } from '@/types';

export interface UseProjectReturn {
  project: Project | null;
  isLoading: boolean;
  createProject: (name: string) => ValidationResult;
  updateProjectName: (name: string) => ValidationResult;
  clearProject: () => void;
  hasProject: () => boolean;
}

export function useProject(): UseProjectReturn {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load project on mount
  useEffect(() => {
    const savedProject = storageService.getProject();
    setProject(savedProject);
    setIsLoading(false);
  }, []);

  const createProject = useCallback((name: string): ValidationResult => {
    const validation = validateProjectName(name);
    if (!validation.isValid) {
      return validation;
    }

    storageService.initializeNewProject(name.trim());
    const newProject = storageService.getProject();
    setProject(newProject);
    return { isValid: true };
  }, []);

  const updateProjectName = useCallback((name: string): ValidationResult => {
    const validation = validateProjectName(name);
    if (!validation.isValid) {
      return validation;
    }

    const currentProject = storageService.getProject();
    if (!currentProject) {
      return { isValid: false, error: 'No project exists' };
    }

    const updatedProject: Project = {
      ...currentProject,
      name: name.trim(),
      updatedAt: new Date().toISOString(),
    };

    storageService.saveProject(updatedProject);
    setProject(updatedProject);
    return { isValid: true };
  }, []);

  const clearProject = useCallback(() => {
    storageService.clearAllData();
    setProject(null);
  }, []);

  const hasProject = useCallback(() => {
    return storageService.hasExistingProject();
  }, []);

  return {
    project,
    isLoading,
    createProject,
    updateProjectName,
    clearProject,
    hasProject,
  };
}


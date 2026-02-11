"use client";

import { useState, useEffect, useCallback } from "react";
import { projectApi } from "@/lib/api";
import { validateProjectName } from "@/lib/validation";
import type { Project, ValidationResult } from "@/types";

export interface UseProjectReturn {
  project: Project | null;
  isLoading: boolean;
  error: string | null;
  createProject: (name: string) => Promise<ValidationResult>;
  updateProjectName: (name: string) => Promise<ValidationResult>;
  deleteProject: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useProject(): UseProjectReturn {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch project from API
  const fetchProject = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await projectApi.get();
      setProject(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch project");
      setProject(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load project on mount
  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const createProject = useCallback(
    async (name: string): Promise<ValidationResult> => {
      // Client-side validation first
      const validation = validateProjectName(name);
      if (!validation.isValid) {
        return validation;
      }

      try {
        setError(null);
        const newProject = await projectApi.create({ name: name.trim() });
        setProject(newProject);
        return { isValid: true };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create project";
        setError(errorMessage);
        return { isValid: false, error: errorMessage };
      }
    },
    [],
  );

  const updateProjectName = useCallback(
    async (name: string): Promise<ValidationResult> => {
      // Client-side validation first
      const validation = validateProjectName(name);
      if (!validation.isValid) {
        return validation;
      }

      try {
        setError(null);
        const updatedProject = await projectApi.update({ name: name.trim() });
        setProject(updatedProject);
        return { isValid: true };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update project";
        setError(errorMessage);
        return { isValid: false, error: errorMessage };
      }
    },
    [],
  );

  const deleteProject = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      await projectApi.delete();
      setProject(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete project";
      setError(errorMessage);
      throw err;
    }
  }, []);

  return {
    project,
    isLoading,
    error,
    createProject,
    updateProjectName,
    deleteProject,
    refetch: fetchProject,
  };
}

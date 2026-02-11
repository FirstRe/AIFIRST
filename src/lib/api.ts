/**
 * API Client Library
 * Provides typed fetch wrapper functions for all API endpoints
 */

import { API_ENDPOINTS } from './constants';
import type {
  Project,
  Requirement,
  CreateProjectRequest,
  UpdateProjectRequest,
  CreateRequirementRequest,
  UpdateRequirementRequest,
  ApiErrorResponse,
} from '@/types';

/**
 * Generic fetch wrapper with error handling
 */
async function apiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json().catch(() => ({
      error: `HTTP ${response.status}: ${response.statusText}`,
    }));
    throw new Error(errorData.error || 'An error occurred');
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

// ============ Project API ============

export const projectApi = {
  /**
   * Get the current project
   */
  async get(): Promise<Project | null> {
    try {
      return await apiFetch<Project>(API_ENDPOINTS.PROJECT);
    } catch (error) {
      // Return null if no project exists (404)
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Create a new project
   */
  async create(data: CreateProjectRequest): Promise<Project> {
    return apiFetch<Project>(API_ENDPOINTS.PROJECT, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update the current project
   */
  async update(data: UpdateProjectRequest): Promise<Project> {
    return apiFetch<Project>(API_ENDPOINTS.PROJECT, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete the current project
   */
  async delete(): Promise<void> {
    await apiFetch<void>(API_ENDPOINTS.PROJECT, {
      method: 'DELETE',
    });
  },
};

// ============ Requirements API ============

export const requirementsApi = {
  /**
   * Get all requirements for the current project
   */
  async getAll(): Promise<Requirement[]> {
    try {
      return await apiFetch<Requirement[]>(API_ENDPOINTS.REQUIREMENTS);
    } catch (error) {
      // Return empty array if no project exists
      if (error instanceof Error && error.message.includes('404')) {
        return [];
      }
      throw error;
    }
  },

  /**
   * Create a new requirement
   */
  async create(data: CreateRequirementRequest): Promise<Requirement> {
    return apiFetch<Requirement>(API_ENDPOINTS.REQUIREMENTS, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get a single requirement by ID
   */
  async get(id: number): Promise<Requirement> {
    return apiFetch<Requirement>(`${API_ENDPOINTS.REQUIREMENTS}/${id}`);
  },

  /**
   * Update a requirement
   */
  async update(id: number, data: UpdateRequirementRequest): Promise<Requirement> {
    return apiFetch<Requirement>(`${API_ENDPOINTS.REQUIREMENTS}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a requirement
   */
  async delete(id: number): Promise<void> {
    await apiFetch<void>(`${API_ENDPOINTS.REQUIREMENTS}/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Toggle requirement active status
   */
  async toggle(id: number): Promise<Requirement> {
    return apiFetch<Requirement>(`${API_ENDPOINTS.REQUIREMENTS}/${id}/toggle`, {
      method: 'PATCH',
    });
  },
};

// ============ Health API ============

export const healthApi = {
  /**
   * Check API health
   */
  async check(): Promise<{ status: string; timestamp: string }> {
    return apiFetch<{ status: string; timestamp: string }>(API_ENDPOINTS.HEALTH);
  },
};


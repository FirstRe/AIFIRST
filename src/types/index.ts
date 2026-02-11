/**
 * TypeScript Type Definitions
 * Single source of truth for all data models
 */

/**
 * Project entity - stored in PostgreSQL projects table
 */
export interface Project {
  id: number;
  name: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  nextRequirementId: number;
}

/**
 * Requirement entity - stored in PostgreSQL requirements table
 */
export interface Requirement {
  id: number;
  projectId: number;
  description: string;
  effort: number;
  isActive: boolean;
  createdAt: string; // ISO 8601
}

/**
 * User preferences - stored in localStorage (browser only)
 */
export interface UserPreferences {
  showEffortColumn: boolean;
}

/**
 * Export/Import data format
 */
export interface ExportData {
  projectName: string;
  requirements: ExportRequirement[];
  exportDate: string; // ISO 8601
}

/**
 * Requirement format for export (without projectId)
 */
export interface ExportRequirement {
  id: number;
  description: string;
  effort: number;
  isActive: boolean;
  createdAt: string;
}

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Statistics computed from requirements
 */
export interface RequirementStats {
  total: number;
  active: number;
  inactive: number;
  totalActiveEffort: number;
}

// ============ API Request/Response Types ============

/**
 * Request to create a new project
 */
export interface CreateProjectRequest {
  name: string;
}

/**
 * Request to update project
 */
export interface UpdateProjectRequest {
  name?: string;
}

/**
 * Request to create a new requirement
 */
export interface CreateRequirementRequest {
  description: string;
  effort: number;
}

/**
 * Request to update a requirement
 */
export interface UpdateRequirementRequest {
  description?: string;
  effort?: number;
  isActive?: boolean;
}

/**
 * API error response format
 */
export interface ApiErrorResponse {
  error: string;
  details?: string;
}

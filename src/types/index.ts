/**
 * TypeScript Type Definitions
 * Single source of truth for all data models
 */

/**
 * Project entity - stored in ret_project
 */
export interface Project {
  name: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  nextRequirementId: number;
}

/**
 * Requirement entity - stored in ret_requirements array
 */
export interface Requirement {
  id: number;
  description: string;
  effort: number;
  isActive: boolean;
  createdAt: string; // ISO 8601
}

/**
 * User preferences - stored in ret_preferences
 */
export interface UserPreferences {
  showEffortColumn: boolean;
}

/**
 * Export/Import data format
 */
export interface ExportData {
  projectName: string;
  requirements: Requirement[];
  exportDate: string; // ISO 8601
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


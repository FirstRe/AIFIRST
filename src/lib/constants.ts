/**
 * Application Constants
 * Single source of truth for all constant values
 */

/**
 * localStorage key names
 */
export const STORAGE_KEYS = {
  PROJECT: 'ret_project',
  REQUIREMENTS: 'ret_requirements',
  PREFERENCES: 'ret_preferences',
  SCHEMA_VERSION: 'ret_schema_version',
} as const;

/**
 * Validation constraints
 */
export const CONSTRAINTS = {
  PROJECT_NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 100,
  },
  DESCRIPTION: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 500,
  },
  EFFORT: {
    MIN: 0.01,
    MAX: 9999,
    DECIMAL_PLACES: 2,
  },
} as const;

/**
 * Default values
 */
export const DEFAULTS = {
  SHOW_EFFORT_COLUMN: true,
  SCHEMA_VERSION: 1,
  NEXT_REQUIREMENT_ID: 1,
  IS_ACTIVE: true,
} as const;

/**
 * Route paths
 */
export const ROUTES = {
  HOME: '/',
  SETUP: '/setup',
  DASHBOARD: '/dashboard',
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  PROJECT_NAME: {
    REQUIRED: 'Project name is required',
    MAX_LENGTH: 'Project name cannot exceed 100 characters',
    EMPTY: 'Project name cannot be empty',
  },
  DESCRIPTION: {
    REQUIRED: 'Requirement description is required',
    MAX_LENGTH: 'Description cannot exceed 500 characters',
    EMPTY: 'Requirement description cannot be empty',
  },
  EFFORT: {
    REQUIRED: 'Effort value is required',
    INVALID: 'Effort must be a number',
    MIN: 'Effort must be greater than zero',
    MAX: 'Effort cannot exceed 9999',
    DECIMAL: 'Effort can have at most 2 decimal places',
  },
  IMPORT: {
    INVALID_FORMAT: 'Invalid file format',
    READ_ERROR: 'Error reading file',
  },
} as const;


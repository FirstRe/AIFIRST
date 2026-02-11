/**
 * Storage Service - Abstracts localStorage operations
 * All methods are synchronous as localStorage is synchronous
 */

import { STORAGE_KEYS, DEFAULTS } from './constants';
import type { Project, Requirement, UserPreferences } from '@/types';

/**
 * Safely get item from localStorage with JSON parsing
 */
function safeGetItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    console.error(`Error reading ${key} from localStorage`);
    return defaultValue;
  }
}

/**
 * Safely set item in localStorage with JSON stringification
 */
function safeSetItem(key: string, value: unknown): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded');
    }
    return false;
  }
}

/**
 * Storage Service Object
 */
export const storageService = {
  // Project Operations
  getProject(): Project | null {
    return safeGetItem<Project | null>(STORAGE_KEYS.PROJECT, null);
  },

  saveProject(project: Project): boolean {
    return safeSetItem(STORAGE_KEYS.PROJECT, project);
  },

  hasExistingProject(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEYS.PROJECT) !== null;
  },

  // Requirements Operations
  getRequirements(): Requirement[] {
    return safeGetItem<Requirement[]>(STORAGE_KEYS.REQUIREMENTS, []);
  },

  saveRequirements(requirements: Requirement[]): boolean {
    return safeSetItem(STORAGE_KEYS.REQUIREMENTS, requirements);
  },

  // Preferences Operations
  getPreferences(): UserPreferences {
    return safeGetItem<UserPreferences>(STORAGE_KEYS.PREFERENCES, {
      showEffortColumn: DEFAULTS.SHOW_EFFORT_COLUMN,
    });
  },

  savePreferences(preferences: UserPreferences): boolean {
    return safeSetItem(STORAGE_KEYS.PREFERENCES, preferences);
  },

  // Schema Version Operations
  getSchemaVersion(): number {
    return safeGetItem<number>(STORAGE_KEYS.SCHEMA_VERSION, DEFAULTS.SCHEMA_VERSION);
  },

  saveSchemaVersion(version: number): boolean {
    return safeSetItem(STORAGE_KEYS.SCHEMA_VERSION, version);
  },

  // Utility Operations
  clearAllData(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.PROJECT);
    localStorage.removeItem(STORAGE_KEYS.REQUIREMENTS);
    localStorage.removeItem(STORAGE_KEYS.PREFERENCES);
    // Note: Schema version is intentionally kept
  },

  initializeNewProject(name: string): void {
    const project: Project = {
      name: name.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      nextRequirementId: DEFAULTS.NEXT_REQUIREMENT_ID,
    };
    this.saveProject(project);
    this.saveRequirements([]);
    this.savePreferences({ showEffortColumn: DEFAULTS.SHOW_EFFORT_COLUMN });
    this.saveSchemaVersion(DEFAULTS.SCHEMA_VERSION);
  },
};


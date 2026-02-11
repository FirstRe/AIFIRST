/**
 * Validation Utilities
 * All validation functions for user inputs
 */

import { CONSTRAINTS, ERROR_MESSAGES } from './constants';
import type { ValidationResult, ExportData } from '@/types';

/**
 * Validate project name
 */
export function validateProjectName(name: string): ValidationResult {
  const trimmed = name.trim();
  
  if (!trimmed) {
    return { isValid: false, error: ERROR_MESSAGES.PROJECT_NAME.REQUIRED };
  }
  
  if (/^\s+$/.test(name)) {
    return { isValid: false, error: ERROR_MESSAGES.PROJECT_NAME.EMPTY };
  }
  
  if (trimmed.length > CONSTRAINTS.PROJECT_NAME.MAX_LENGTH) {
    return { isValid: false, error: ERROR_MESSAGES.PROJECT_NAME.MAX_LENGTH };
  }
  
  return { isValid: true };
}

/**
 * Validate requirement description
 */
export function validateDescription(description: string): ValidationResult {
  const trimmed = description.trim();
  
  if (!trimmed) {
    return { isValid: false, error: ERROR_MESSAGES.DESCRIPTION.REQUIRED };
  }
  
  if (/^\s+$/.test(description)) {
    return { isValid: false, error: ERROR_MESSAGES.DESCRIPTION.EMPTY };
  }
  
  if (trimmed.length > CONSTRAINTS.DESCRIPTION.MAX_LENGTH) {
    return { isValid: false, error: ERROR_MESSAGES.DESCRIPTION.MAX_LENGTH };
  }
  
  return { isValid: true };
}

/**
 * Validate effort value
 */
export function validateEffort(effort: string | number): ValidationResult {
  if (effort === '' || effort === null || effort === undefined) {
    return { isValid: false, error: ERROR_MESSAGES.EFFORT.REQUIRED };
  }
  
  const numValue = typeof effort === 'string' ? parseFloat(effort) : effort;
  
  if (isNaN(numValue)) {
    return { isValid: false, error: ERROR_MESSAGES.EFFORT.INVALID };
  }
  
  if (numValue <= 0) {
    return { isValid: false, error: ERROR_MESSAGES.EFFORT.MIN };
  }
  
  if (numValue > CONSTRAINTS.EFFORT.MAX) {
    return { isValid: false, error: ERROR_MESSAGES.EFFORT.MAX };
  }
  
  // Check decimal places
  const effortStr = String(effort);
  if (effortStr.includes('.')) {
    const decimalPart = effortStr.split('.')[1];
    if (decimalPart && decimalPart.length > CONSTRAINTS.EFFORT.DECIMAL_PLACES) {
      return { isValid: false, error: ERROR_MESSAGES.EFFORT.DECIMAL };
    }
  }
  
  return { isValid: true };
}

/**
 * Validate import data structure
 */
export function validateImportData(data: unknown): ValidationResult {
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: ERROR_MESSAGES.IMPORT.INVALID_FORMAT };
  }
  
  const importData = data as ExportData;
  
  if (!importData.projectName || typeof importData.projectName !== 'string') {
    return { isValid: false, error: ERROR_MESSAGES.IMPORT.INVALID_FORMAT };
  }
  
  if (!Array.isArray(importData.requirements)) {
    return { isValid: false, error: ERROR_MESSAGES.IMPORT.INVALID_FORMAT };
  }
  
  // Validate each requirement has required fields
  for (const req of importData.requirements) {
    if (typeof req.id !== 'number' ||
        typeof req.description !== 'string' ||
        typeof req.effort !== 'number') {
      return { isValid: false, error: ERROR_MESSAGES.IMPORT.INVALID_FORMAT };
    }
  }
  
  return { isValid: true };
}


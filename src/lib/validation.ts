/**
 * Validation Utilities
 * All validation functions for user inputs
 */

import type { ValidationResult } from "@/types";

/**
 * Validate ingredient name
 */
export function validateIngredientName(name: string): ValidationResult {
  const trimmed = name.trim();

  if (!trimmed) {
    return { isValid: false, error: "Ingredient name is required" };
  }

  if (trimmed.length > 255) {
    return {
      isValid: false,
      error: "Ingredient name cannot exceed 255 characters",
    };
  }

  return { isValid: true };
}

/**
 * Validate cost per unit
 */
export function validateCostPerUnit(cost: string | number): ValidationResult {
  if (cost === "" || cost === null || cost === undefined) {
    return { isValid: false, error: "Cost per unit is required" };
  }

  const numValue = typeof cost === "string" ? parseFloat(cost) : cost;

  if (isNaN(numValue)) {
    return { isValid: false, error: "Cost must be a valid number" };
  }

  if (numValue < 0) {
    return { isValid: false, error: "Cost cannot be negative" };
  }

  return { isValid: true };
}

/**
 * Validate unit
 */
export function validateUnit(unit: string): ValidationResult {
  const trimmed = unit.trim();

  if (!trimmed) {
    return { isValid: false, error: "Unit is required" };
  }

  if (trimmed.length > 50) {
    return { isValid: false, error: "Unit cannot exceed 50 characters" };
  }

  return { isValid: true };
}

/**
 * Validate product name
 */
export function validateProductName(name: string): ValidationResult {
  const trimmed = name.trim();

  if (!trimmed) {
    return { isValid: false, error: "Product name is required" };
  }

  if (trimmed.length > 255) {
    return {
      isValid: false,
      error: "Product name cannot exceed 255 characters",
    };
  }

  return { isValid: true };
}

/**
 * Validate selling price
 */
export function validateSellingPrice(price: string | number): ValidationResult {
  if (price === "" || price === null || price === undefined) {
    return { isValid: false, error: "Selling price is required" };
  }

  const numValue = typeof price === "string" ? parseFloat(price) : price;

  if (isNaN(numValue)) {
    return { isValid: false, error: "Price must be a valid number" };
  }

  if (numValue < 0) {
    return { isValid: false, error: "Price cannot be negative" };
  }

  return { isValid: true };
}

/**
 * Validate quantity used
 */
export function validateQuantityUsed(
  quantity: string | number,
): ValidationResult {
  if (quantity === "" || quantity === null || quantity === undefined) {
    return { isValid: false, error: "Quantity is required" };
  }

  const numValue =
    typeof quantity === "string" ? parseFloat(quantity) : quantity;

  if (isNaN(numValue)) {
    return { isValid: false, error: "Quantity must be a valid number" };
  }

  if (numValue <= 0) {
    return { isValid: false, error: "Quantity must be greater than zero" };
  }

  return { isValid: true };
}

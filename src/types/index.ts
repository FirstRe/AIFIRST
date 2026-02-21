/**
 * TypeScript Type Definitions
 * Single source of truth for all data models
 */

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * API error response format
 */
export interface ApiErrorResponse {
  error: string;
  details?: string;
}

// ============ Shop Back-Office Types ============

/**
 * Ingredient entity
 */
export interface Ingredient {
  id: number;
  name: string;
  costPerUnit: number;
  unit: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Product ingredient with cost breakdown
 */
export interface ProductIngredient {
  id: number;
  ingredientId: number;
  name: string;
  unit: string;
  costPerUnit: number;
  quantityUsed: number;
  costTotal: number;
}

/**
 * Product entity with ingredients
 */
export interface Product {
  id: number;
  name: string;
  sellingPrice: number;
  costTotal: number;
  profitMargin: number;
  createdAt: string;
  updatedAt: string;
  ingredients: ProductIngredient[];
}

/**
 * Request to create/update an ingredient
 */
export interface CreateIngredientRequest {
  name: string;
  costPerUnit: number;
  unit: string;
}

export interface UpdateIngredientRequest {
  name?: string;
  costPerUnit?: number;
  unit?: string;
}

/**
 * Ingredient input for product creation
 */
export interface IngredientInput {
  ingredientId: number;
  quantityUsed: number;
}

/**
 * Request to create a product
 */
export interface CreateProductRequest {
  name: string;
  sellingPrice: number;
  ingredients?: IngredientInput[];
}

/**
 * Request to update a product
 */
export interface UpdateProductRequest {
  name?: string;
  sellingPrice?: number;
}

/**
 * Request to update product ingredients
 */
export interface UpdateProductIngredientsRequest {
  ingredients: IngredientInput[];
}

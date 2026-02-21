/**
 * API Client Library
 * Provides typed fetch wrapper functions for all API endpoints
 */

import { API_ENDPOINTS } from "./constants";
import type {
  ApiErrorResponse,
  Ingredient,
  Product,
  CreateIngredientRequest,
  UpdateIngredientRequest,
  CreateProductRequest,
  UpdateProductRequest,
  UpdateProductIngredientsRequest,
} from "@/types";

/**
 * Generic fetch wrapper with error handling
 */
async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json().catch(() => ({
      error: `HTTP ${response.status}: ${response.statusText}`,
    }));
    throw new Error(errorData.error || "An error occurred");
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

// ============ Health API ============

export const healthApi = {
  /**
   * Check API health
   */
  async check(): Promise<{ status: string; timestamp: string }> {
    return apiFetch<{ status: string; timestamp: string }>(
      API_ENDPOINTS.HEALTH,
    );
  },
};

// ============ Ingredients API ============

export const ingredientsApi = {
  /**
   * Get all ingredients
   */
  async getAll(): Promise<Ingredient[]> {
    return apiFetch<Ingredient[]>(API_ENDPOINTS.INGREDIENTS);
  },

  /**
   * Get a single ingredient by ID
   */
  async get(id: number): Promise<Ingredient> {
    return apiFetch<Ingredient>(`${API_ENDPOINTS.INGREDIENTS}/${id}`);
  },

  /**
   * Create a new ingredient
   */
  async create(data: CreateIngredientRequest): Promise<Ingredient> {
    return apiFetch<Ingredient>(API_ENDPOINTS.INGREDIENTS, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Update an ingredient
   */
  async update(id: number, data: UpdateIngredientRequest): Promise<Ingredient> {
    return apiFetch<Ingredient>(`${API_ENDPOINTS.INGREDIENTS}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete an ingredient
   */
  async delete(id: number): Promise<void> {
    await apiFetch<void>(`${API_ENDPOINTS.INGREDIENTS}/${id}`, {
      method: "DELETE",
    });
  },
};

// ============ Products API ============

export const productsApi = {
  /**
   * Get all products with ingredients
   */
  async getAll(): Promise<Product[]> {
    return apiFetch<Product[]>(API_ENDPOINTS.PRODUCTS);
  },

  /**
   * Get a single product by ID
   */
  async get(id: number): Promise<Product> {
    return apiFetch<Product>(`${API_ENDPOINTS.PRODUCTS}/${id}`);
  },

  /**
   * Create a new product
   */
  async create(data: CreateProductRequest): Promise<Product> {
    return apiFetch<Product>(API_ENDPOINTS.PRODUCTS, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Update a product (name, sellingPrice only)
   */
  async update(id: number, data: UpdateProductRequest): Promise<Product> {
    return apiFetch<Product>(`${API_ENDPOINTS.PRODUCTS}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a product
   */
  async delete(id: number): Promise<void> {
    await apiFetch<void>(`${API_ENDPOINTS.PRODUCTS}/${id}`, {
      method: "DELETE",
    });
  },

  /**
   * Update product ingredients (replace all and recalculate cost)
   */
  async updateIngredients(
    id: number,
    data: UpdateProductIngredientsRequest,
  ): Promise<Product> {
    return apiFetch<Product>(`${API_ENDPOINTS.PRODUCTS}/${id}/ingredients`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
};

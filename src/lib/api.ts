/**
 * API Client Library
 * Provides typed fetch wrapper functions for all API endpoints
 */

import { API_ENDPOINTS } from "./constants";
import type {
  Project,
  Requirement,
  CreateProjectRequest,
  UpdateProjectRequest,
  CreateRequirementRequest,
  UpdateRequirementRequest,
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
      if (error instanceof Error && error.message.includes("404")) {
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
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Update the current project
   */
  async update(data: UpdateProjectRequest): Promise<Project> {
    return apiFetch<Project>(API_ENDPOINTS.PROJECT, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete the current project
   */
  async delete(): Promise<void> {
    await apiFetch<void>(API_ENDPOINTS.PROJECT, {
      method: "DELETE",
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
      if (error instanceof Error && error.message.includes("404")) {
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
      method: "POST",
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
  async update(
    id: number,
    data: UpdateRequirementRequest,
  ): Promise<Requirement> {
    return apiFetch<Requirement>(`${API_ENDPOINTS.REQUIREMENTS}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a requirement
   */
  async delete(id: number): Promise<void> {
    await apiFetch<void>(`${API_ENDPOINTS.REQUIREMENTS}/${id}`, {
      method: "DELETE",
    });
  },

  /**
   * Toggle requirement active status
   */
  async toggle(id: number): Promise<Requirement> {
    return apiFetch<Requirement>(`${API_ENDPOINTS.REQUIREMENTS}/${id}/toggle`, {
      method: "PATCH",
    });
  },
};

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

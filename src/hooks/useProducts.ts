"use client";

import { useState, useEffect, useCallback } from "react";
import { productsApi } from "@/lib/api";
import type {
  Product,
  Ingredient,
  IngredientInput,
  CreateProductRequest,
  UpdateProductRequest,
  ValidationResult,
} from "@/types";

/**
 * Calculate estimated cost for a list of ingredient inputs
 * Used for real-time cost preview in the UI
 */
export function calculateEstimatedCost(
  ingredientInputs: IngredientInput[],
  availableIngredients: Ingredient[],
): number {
  const ingredientMap = new Map(
    availableIngredients.map((ing) => [ing.id, ing.costPerUnit]),
  );

  return ingredientInputs.reduce((total, input) => {
    const costPerUnit = ingredientMap.get(input.ingredientId) || 0;
    return total + costPerUnit * input.quantityUsed;
  }, 0);
}

export interface UseProductsReturn {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  addProduct: (data: CreateProductRequest) => Promise<ValidationResult>;
  updateProduct: (
    id: number,
    data: UpdateProductRequest,
  ) => Promise<ValidationResult>;
  updateProductIngredients: (
    id: number,
    ingredients: IngredientInput[],
  ) => Promise<ValidationResult>;
  deleteProduct: (id: number) => Promise<ValidationResult>;
  refetch: () => Promise<void>;
}

export function useProducts(): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch products from API
  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await productsApi.getAll();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch products");
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load products on mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Add product
  const addProduct = useCallback(
    async (data: CreateProductRequest): Promise<ValidationResult> => {
      if (!data.name?.trim()) {
        return { isValid: false, error: "Product name is required" };
      }
      if (data.sellingPrice < 0) {
        return { isValid: false, error: "Selling price must be non-negative" };
      }

      try {
        setError(null);
        const newProduct = await productsApi.create({
          name: data.name.trim(),
          sellingPrice: data.sellingPrice,
          ingredients: data.ingredients || [],
        });
        setProducts((prev) => [...prev, newProduct]);
        return { isValid: true };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to add product";
        setError(errorMessage);
        return { isValid: false, error: errorMessage };
      }
    },
    [],
  );

  // Update product (name, sellingPrice only)
  const updateProduct = useCallback(
    async (
      id: number,
      data: UpdateProductRequest,
    ): Promise<ValidationResult> => {
      if (data.name !== undefined && !data.name.trim()) {
        return { isValid: false, error: "Product name cannot be empty" };
      }
      if (data.sellingPrice !== undefined && data.sellingPrice < 0) {
        return { isValid: false, error: "Selling price must be non-negative" };
      }

      try {
        setError(null);
        const updatedProduct = await productsApi.update(id, data);
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? updatedProduct : p)),
        );
        return { isValid: true };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update product";
        setError(errorMessage);
        return { isValid: false, error: errorMessage };
      }
    },
    [],
  );

  // Update product ingredients
  const updateProductIngredients = useCallback(
    async (
      id: number,
      ingredients: IngredientInput[],
    ): Promise<ValidationResult> => {
      try {
        setError(null);
        const updatedProduct = await productsApi.updateIngredients(id, {
          ingredients,
        });
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? updatedProduct : p)),
        );
        return { isValid: true };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update ingredients";
        setError(errorMessage);
        return { isValid: false, error: errorMessage };
      }
    },
    [],
  );

  // Delete product
  const deleteProduct = useCallback(
    async (id: number): Promise<ValidationResult> => {
      try {
        setError(null);
        await productsApi.delete(id);
        setProducts((prev) => prev.filter((p) => p.id !== id));
        return { isValid: true };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete product";
        setError(errorMessage);
        return { isValid: false, error: errorMessage };
      }
    },
    [],
  );

  return {
    products,
    isLoading,
    error,
    addProduct,
    updateProduct,
    updateProductIngredients,
    deleteProduct,
    refetch: fetchProducts,
  };
}

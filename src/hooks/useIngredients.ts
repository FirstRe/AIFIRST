"use client";

import { useState, useEffect, useCallback } from "react";
import { ingredientsApi } from "@/lib/api";
import type {
  Ingredient,
  CreateIngredientRequest,
  UpdateIngredientRequest,
  ValidationResult,
} from "@/types";

export interface UseIngredientsReturn {
  ingredients: Ingredient[];
  isLoading: boolean;
  error: string | null;
  addIngredient: (data: CreateIngredientRequest) => Promise<ValidationResult>;
  updateIngredient: (
    id: number,
    data: UpdateIngredientRequest
  ) => Promise<ValidationResult>;
  deleteIngredient: (id: number) => Promise<ValidationResult>;
  refetch: () => Promise<void>;
}

export function useIngredients(): UseIngredientsReturn {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch ingredients from API
  const fetchIngredients = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await ingredientsApi.getAll();
      setIngredients(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch ingredients"
      );
      setIngredients([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load ingredients on mount
  useEffect(() => {
    fetchIngredients();
  }, [fetchIngredients]);

  // Add ingredient
  const addIngredient = useCallback(
    async (data: CreateIngredientRequest): Promise<ValidationResult> => {
      // Basic validation
      if (!data.name?.trim()) {
        return { isValid: false, error: "Name is required" };
      }
      if (data.costPerUnit < 0) {
        return { isValid: false, error: "Cost per unit must be non-negative" };
      }
      if (!data.unit?.trim()) {
        return { isValid: false, error: "Unit is required" };
      }

      try {
        setError(null);
        const newIngredient = await ingredientsApi.create({
          name: data.name.trim(),
          costPerUnit: data.costPerUnit,
          unit: data.unit.trim(),
        });
        setIngredients((prev) => [...prev, newIngredient]);
        return { isValid: true };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to add ingredient";
        setError(errorMessage);
        return { isValid: false, error: errorMessage };
      }
    },
    []
  );

  // Update ingredient
  const updateIngredient = useCallback(
    async (
      id: number,
      data: UpdateIngredientRequest
    ): Promise<ValidationResult> => {
      if (data.name !== undefined && !data.name.trim()) {
        return { isValid: false, error: "Name cannot be empty" };
      }
      if (data.costPerUnit !== undefined && data.costPerUnit < 0) {
        return { isValid: false, error: "Cost per unit must be non-negative" };
      }
      if (data.unit !== undefined && !data.unit.trim()) {
        return { isValid: false, error: "Unit cannot be empty" };
      }

      try {
        setError(null);
        const updatedIngredient = await ingredientsApi.update(id, data);
        setIngredients((prev) =>
          prev.map((ing) => (ing.id === id ? updatedIngredient : ing))
        );
        return { isValid: true };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update ingredient";
        setError(errorMessage);
        return { isValid: false, error: errorMessage };
      }
    },
    []
  );

  // Delete ingredient
  const deleteIngredient = useCallback(
    async (id: number): Promise<ValidationResult> => {
      try {
        setError(null);
        await ingredientsApi.delete(id);
        setIngredients((prev) => prev.filter((ing) => ing.id !== id));
        return { isValid: true };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete ingredient";
        setError(errorMessage);
        return { isValid: false, error: errorMessage };
      }
    },
    []
  );

  return {
    ingredients,
    isLoading,
    error,
    addIngredient,
    updateIngredient,
    deleteIngredient,
    refetch: fetchIngredients,
  };
}


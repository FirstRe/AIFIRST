"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useIngredients } from "@/hooks/useIngredients";
import { calculateEstimatedCost } from "@/hooks/useProducts";
import type { Product, IngredientInput } from "@/types";

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: {
    name: string;
    sellingPrice: number;
    ingredients: IngredientInput[];
  }) => Promise<{ isValid: boolean; error?: string }>;
  submitLabel?: string;
}

export function ProductForm({
  product,
  onSubmit,
  submitLabel = "Save Product",
}: ProductFormProps) {
  const router = useRouter();
  const { ingredients: availableIngredients, isLoading: loadingIngredients } =
    useIngredients();

  const [name, setName] = useState(product?.name || "");
  const [sellingPrice, setSellingPrice] = useState(
    product?.sellingPrice?.toString() || "",
  );
  const [selectedIngredients, setSelectedIngredients] = useState<
    IngredientInput[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showIngredientSelector, setShowIngredientSelector] = useState(false);
  const [selectedIngredientToAdd, setSelectedIngredientToAdd] = useState<
    number | ""
  >("");

  // Initialize selected ingredients from product
  useEffect(() => {
    if (product?.ingredients) {
      setSelectedIngredients(
        product.ingredients.map((ing) => ({
          ingredientId: ing.ingredientId,
          quantityUsed: ing.quantityUsed,
        })),
      );
    }
  }, [product]);

  // Real-time cost calculation
  const estimatedCost = useMemo(() => {
    return calculateEstimatedCost(selectedIngredients, availableIngredients);
  }, [selectedIngredients, availableIngredients]);

  // Profit margin calculation
  const profitMargin = useMemo(() => {
    const price = parseFloat(sellingPrice) || 0;
    return price - estimatedCost;
  }, [sellingPrice, estimatedCost]);

  // Filter ingredients that are not already selected
  const unselectedIngredients = useMemo(() => {
    const existingIds = new Set(selectedIngredients.map((i) => i.ingredientId));
    return availableIngredients.filter((i) => !existingIds.has(i.id));
  }, [availableIngredients, selectedIngredients]);

  const handleToggleIngredientSelector = () => {
    setShowIngredientSelector(!showIngredientSelector);
    setSelectedIngredientToAdd("");
  };

  const handleAddSelectedIngredient = () => {
    if (selectedIngredientToAdd === "") return;
    setSelectedIngredients([
      ...selectedIngredients,
      { ingredientId: selectedIngredientToAdd, quantityUsed: 1 },
    ]);
    setSelectedIngredientToAdd("");
    setShowIngredientSelector(false);
  };

  const handleRemoveIngredient = (index: number) => {
    setSelectedIngredients(selectedIngredients.filter((_, i) => i !== index));
  };

  const handleIngredientChange = (
    index: number,
    field: "ingredientId" | "quantityUsed",
    value: number,
  ) => {
    const updated = [...selectedIngredients];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedIngredients(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await onSubmit({
        name: name.trim(),
        sellingPrice: parseFloat(sellingPrice) || 0,
        ingredients: selectedIngredients,
      });

      if (result.isValid) {
        router.push("/admin/products");
      } else {
        setError(result.error || "An error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingIngredients) {
    return <div className="text-gray-600">Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">
            Product Details
          </h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Strawberry Cake"
            required
          />
          <Input
            label="Selling Price ($)"
            type="number"
            step="0.01"
            min="0"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(e.target.value)}
            placeholder="0.00"
            required
          />
        </CardContent>
      </Card>

      {/* Ingredients Selection */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Ingredients</h3>
            {unselectedIngredients.length > 0 && (
              <Button
                type="button"
                size="sm"
                onClick={handleToggleIngredientSelector}
              >
                {showIngredientSelector ? "Cancel" : "+ Add Ingredient"}
              </Button>
            )}
          </div>
          {showIngredientSelector && (
            <div className="mt-3 flex items-center gap-2">
              <select
                value={selectedIngredientToAdd}
                onChange={(e) =>
                  setSelectedIngredientToAdd(
                    e.target.value ? Number(e.target.value) : "",
                  )
                }
                className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
              >
                <option value="">-- Select ingredient to add --</option>
                {unselectedIngredients.map((ing) => (
                  <option key={ing.id} value={ing.id}>
                    {ing.name} (฿{ing.costPerUnit.toFixed(2)}/{ing.unit})
                  </option>
                ))}
              </select>
              <Button
                type="button"
                size="sm"
                onClick={handleAddSelectedIngredient}
                disabled={selectedIngredientToAdd === ""}
              >
                Add
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {selectedIngredients.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No ingredients added.{" "}
              {unselectedIngredients.length > 0
                ? 'Click "+ Add Ingredient" to start.'
                : "No ingredients available."}
            </p>
          ) : (
            <div className="space-y-3">
              {selectedIngredients.map((selected, index) => {
                const ingredient = availableIngredients.find(
                  (i) => i.id === selected.ingredientId,
                );
                const costForThis = ingredient
                  ? ingredient.costPerUnit * selected.quantityUsed
                  : 0;

                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                  >
                    <select
                      value={selected.ingredientId}
                      onChange={(e) =>
                        handleIngredientChange(
                          index,
                          "ingredientId",
                          parseInt(e.target.value),
                        )
                      }
                      className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg"
                    >
                      {availableIngredients.map((ing) => (
                        <option key={ing.id} value={ing.id}>
                          {ing.name} (${ing.costPerUnit.toFixed(4)}/{ing.unit})
                        </option>
                      ))}
                    </select>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={selected.quantityUsed}
                      onChange={(e) =>
                        handleIngredientChange(
                          index,
                          "quantityUsed",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      className="w-24"
                    />
                    <span className="text-sm text-gray-500 w-20">
                      {ingredient?.unit || ""}
                    </span>
                    <span className="text-sm font-medium w-24 text-right">
                      ${costForThis.toFixed(2)}
                    </span>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => handleRemoveIngredient(index)}
                    >
                      ✕
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cost Summary - Real-time calculation */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">
            💰 Cost Summary (Real-time)
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-red-50 rounded-xl">
              <div className="text-sm text-gray-500">Total Cost</div>
              <div className="text-2xl font-bold text-red-600">
                ${estimatedCost.toFixed(2)}
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl">
              <div className="text-sm text-gray-500">Selling Price</div>
              <div className="text-2xl font-bold text-blue-600">
                ${(parseFloat(sellingPrice) || 0).toFixed(2)}
              </div>
            </div>
            <div
              className={`p-4 rounded-xl ${
                profitMargin >= 0 ? "bg-green-50" : "bg-red-50"
              }`}
            >
              <div className="text-sm text-gray-500">Profit Margin</div>
              <div
                className={`text-2xl font-bold ${
                  profitMargin >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                ${profitMargin.toFixed(2)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error and Submit */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/admin/products")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

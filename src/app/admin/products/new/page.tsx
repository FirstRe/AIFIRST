"use client";

import { ProductForm } from "@/components/products/ProductForm";
import { productsApi } from "@/lib/api";

export default function NewProductPage() {
  const handleSubmit = async (data: {
    name: string;
    sellingPrice: number;
    ingredients: { ingredientId: number; quantityUsed: number }[];
  }) => {
    try {
      await productsApi.create(data);
      return { isValid: true };
    } catch (err) {
      return {
        isValid: false,
        error: err instanceof Error ? err.message : "Failed to create product",
      };
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Create New Product</h2>
      <ProductForm onSubmit={handleSubmit} submitLabel="Create Product" />
    </div>
  );
}


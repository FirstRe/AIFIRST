"use client";

import { useState, useEffect, use } from "react";
import { ProductForm } from "@/components/products/ProductForm";
import { productsApi } from "@/lib/api";
import type { Product } from "@/types";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const { id } = use(params);
  const productId = parseInt(id);

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await productsApi.get(productId);
        setProduct(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load product"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleSubmit = async (data: {
    name: string;
    sellingPrice: number;
    ingredients: { ingredientId: number; quantityUsed: number }[];
  }) => {
    try {
      // Update product details
      await productsApi.update(productId, {
        name: data.name,
        sellingPrice: data.sellingPrice,
      });

      // Update ingredients
      await productsApi.updateIngredients(productId, {
        ingredients: data.ingredients,
      });

      return { isValid: true };
    } catch (err) {
      return {
        isValid: false,
        error: err instanceof Error ? err.message : "Failed to update product",
      };
    }
  };

  if (isLoading) {
    return <div className="text-gray-600">Loading product...</div>;
  }

  if (error || !product) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
        {error || "Product not found"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">
        Edit Product: {product.name}
      </h2>
      <ProductForm
        product={product}
        onSubmit={handleSubmit}
        submitLabel="Update Product"
      />
    </div>
  );
}


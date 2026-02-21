"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useProducts } from "@/hooks/useProducts";

export default function ProductsPage() {
  const { products, isLoading, error, deleteProduct } = useProducts();

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      const result = await deleteProduct(id);
      if (!result.isValid) {
        alert(result.error || "Failed to delete product");
      }
    }
  };

  if (isLoading) {
    return <div className="text-gray-600">Loading products...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">🎂 Products</h2>
        <Link href="/admin/products/new">
          <Button>+ Add Product</Button>
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Products List */}
      <Card>
        <CardContent>
          {products.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No products yet. Create your first product!
            </p>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {product.name}
                      </h3>
                      <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Selling Price:</span>
                          <span className="ml-2 font-medium text-gray-900">
                            ${product.sellingPrice.toFixed(2)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Cost:</span>
                          <span className="ml-2 font-medium text-red-600">
                            ${product.costTotal.toFixed(2)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Profit:</span>
                          <span
                            className={`ml-2 font-medium ${
                              product.profitMargin >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            ${product.profitMargin.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      {/* Ingredients breakdown */}
                      {product.ingredients.length > 0 && (
                        <div className="mt-3">
                          <span className="text-xs text-gray-500">Ingredients:</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {product.ingredients.map((ing) => (
                              <span
                                key={ing.id}
                                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                              >
                                {ing.name}: {ing.quantityUsed} {ing.unit} (${ing.costTotal.toFixed(2)})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/admin/products/${product.id}/edit`}>
                        <Button size="sm" variant="secondary">
                          Edit
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(product.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


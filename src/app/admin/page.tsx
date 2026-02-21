"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ingredients Card */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              🧂 Ingredients
            </h3>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Manage your ingredient inventory with cost tracking.
            </p>
            <Link href="/admin/ingredients">
              <Button>Manage Ingredients</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Products Card */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              🎂 Products
            </h3>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Create and manage products with automatic cost calculation.
            </p>
            <Link href="/admin/products">
              <Button>Manage Products</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Info */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">
            💡 How Cost Calculation Works
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-gray-600">
            <p>
              <strong>Ingredient Cost:</strong> costPerUnit × quantityUsed
            </p>
            <p>
              <strong>Product Total Cost:</strong> Sum of all ingredient costs
            </p>
            <p>
              <strong>Profit Margin:</strong> sellingPrice - costTotal
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


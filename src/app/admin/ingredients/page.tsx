"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useIngredients } from "@/hooks/useIngredients";
import type { Ingredient, CreateIngredientRequest } from "@/types";

export default function IngredientsPage() {
  const {
    ingredients,
    isLoading,
    error,
    addIngredient,
    updateIngredient,
    deleteIngredient,
  } = useIngredients();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CreateIngredientRequest>({
    name: "",
    costPerUnit: 0,
    unit: "",
  });
  const [formError, setFormError] = useState<string | null>(null);

  const resetForm = () => {
    setFormData({ name: "", costPerUnit: 0, unit: "" });
    setEditingId(null);
    setShowForm(false);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    let result;
    if (editingId) {
      result = await updateIngredient(editingId, formData);
    } else {
      result = await addIngredient(formData);
    }

    if (result.isValid) {
      resetForm();
    } else {
      setFormError(result.error || "An error occurred");
    }
  };

  const handleEdit = (ingredient: Ingredient) => {
    setFormData({
      name: ingredient.name,
      costPerUnit: ingredient.costPerUnit,
      unit: ingredient.unit,
    });
    setEditingId(ingredient.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this ingredient?")) {
      const result = await deleteIngredient(id);
      if (!result.isValid) {
        alert(result.error || "Failed to delete ingredient");
      }
    }
  };

  if (isLoading) {
    return <div className="text-gray-600">Loading ingredients...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">🧂 Ingredients</h2>
        <Button onClick={() => setShowForm(true)}>+ Add Ingredient</Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">
              {editingId ? "Edit Ingredient" : "Add New Ingredient"}
            </h3>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Flour"
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Cost per Unit"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.costPerUnit}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      costPerUnit: parseFloat(e.target.value) || 0,
                    })
                  }
                  required
                />
                <Input
                  label="Unit"
                  value={formData.unit}
                  onChange={(e) =>
                    setFormData({ ...formData, unit: e.target.value })
                  }
                  placeholder="e.g., gram, piece"
                  required
                />
              </div>
              {formError && (
                <div className="text-red-600 text-sm">{formError}</div>
              )}
              <div className="flex gap-2">
                <Button type="submit">
                  {editingId ? "Update" : "Add"}
                </Button>
                <Button type="button" variant="secondary" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Ingredients List */}
      <Card>
        <CardContent>
          {ingredients.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No ingredients yet. Add your first ingredient!
            </p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 text-gray-600">Name</th>
                  <th className="text-right py-3 px-2 text-gray-600">Cost/Unit</th>
                  <th className="text-left py-3 px-2 text-gray-600">Unit</th>
                  <th className="text-right py-3 px-2 text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ingredients.map((ingredient) => (
                  <tr key={ingredient.id} className="border-b border-gray-100">
                    <td className="py-3 px-2 font-medium">{ingredient.name}</td>
                    <td className="py-3 px-2 text-right">
                      ${ingredient.costPerUnit.toFixed(4)}
                    </td>
                    <td className="py-3 px-2">{ingredient.unit}</td>
                    <td className="py-3 px-2 text-right">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(ingredient)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(ingredient.id)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


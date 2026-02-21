/**
 * Individual Ingredient API Route
 * Handles GET, PUT, and DELETE operations for a single ingredient
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";
import { recalculateProductsUsingIngredient } from "@/lib/services";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/ingredients/[id]
 * Returns a single ingredient by ID
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const ingredientId = parseInt(id, 10);

    if (isNaN(ingredientId)) {
      return NextResponse.json(
        { error: "Invalid ingredient ID" },
        { status: 400 },
      );
    }

    const ingredient = await prisma.ingredient.findUnique({
      where: { id: ingredientId },
    });

    if (!ingredient) {
      return NextResponse.json(
        { error: "Ingredient not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      id: ingredient.id,
      name: ingredient.name,
      costPerUnit: Number(ingredient.costPerUnit),
      unit: ingredient.unit,
      createdAt: ingredient.createdAt.toISOString(),
      updatedAt: ingredient.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("GET /api/ingredients/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch ingredient" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/ingredients/[id]
 * Updates an existing ingredient
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const ingredientId = parseInt(id, 10);

    if (isNaN(ingredientId)) {
      return NextResponse.json(
        { error: "Invalid ingredient ID" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { name, costPerUnit, unit } = body;

    // Validate name if provided
    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return NextResponse.json(
          { error: "Name must be a non-empty string" },
          { status: 400 },
        );
      }
      if (name.trim().length > 255) {
        return NextResponse.json(
          { error: "Name must be at most 255 characters" },
          { status: 400 },
        );
      }
    }

    // Validate costPerUnit if provided
    if (costPerUnit !== undefined) {
      const costValue = Number(costPerUnit);
      if (isNaN(costValue) || costValue < 0) {
        return NextResponse.json(
          { error: "Cost per unit must be a non-negative number" },
          { status: 400 },
        );
      }
    }

    // Validate unit if provided
    if (unit !== undefined) {
      if (typeof unit !== "string" || unit.trim().length === 0) {
        return NextResponse.json(
          { error: "Unit must be a non-empty string" },
          { status: 400 },
        );
      }
      if (unit.trim().length > 50) {
        return NextResponse.json(
          { error: "Unit must be at most 50 characters" },
          { status: 400 },
        );
      }
    }

    // Check if ingredient exists
    const existing = await prisma.ingredient.findUnique({
      where: { id: ingredientId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Ingredient not found" },
        { status: 404 },
      );
    }

    // Check if costPerUnit is changing
    const isCostChanging =
      costPerUnit !== undefined &&
      Number(costPerUnit) !== Number(existing.costPerUnit);

    // Use transaction to update ingredient and recalculate product costs if needed
    const result = await prisma.$transaction(async (tx) => {
      // Update ingredient
      const ingredient = await tx.ingredient.update({
        where: { id: ingredientId },
        data: {
          ...(name !== undefined && { name: name.trim() }),
          ...(costPerUnit !== undefined && {
            costPerUnit: Number(costPerUnit),
          }),
          ...(unit !== undefined && { unit: unit.trim() }),
        },
      });

      // If cost changed, recalculate all products using this ingredient
      let updatedProductIds: number[] = [];
      if (isCostChanging) {
        updatedProductIds = await recalculateProductsUsingIngredient(
          ingredientId,
          tx,
        );
      }

      return { ingredient, updatedProductIds };
    });

    return NextResponse.json({
      id: result.ingredient.id,
      name: result.ingredient.name,
      costPerUnit: Number(result.ingredient.costPerUnit),
      unit: result.ingredient.unit,
      createdAt: result.ingredient.createdAt.toISOString(),
      updatedAt: result.ingredient.updatedAt.toISOString(),
      ...(result.updatedProductIds.length > 0 && {
        message: `Updated costs for ${result.updatedProductIds.length} product(s)`,
        updatedProductIds: result.updatedProductIds,
      }),
    });
  } catch (error) {
    console.error("PUT /api/ingredients/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update ingredient" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/ingredients/[id]
 * Deletes an ingredient (fails if ingredient is used in products)
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const ingredientId = parseInt(id, 10);

    if (isNaN(ingredientId)) {
      return NextResponse.json(
        { error: "Invalid ingredient ID" },
        { status: 400 },
      );
    }

    // Check if ingredient exists
    const existing = await prisma.ingredient.findUnique({
      where: { id: ingredientId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Ingredient not found" },
        { status: 404 },
      );
    }

    // Delete ingredient (will fail if used in products due to Restrict constraint)
    await prisma.ingredient.delete({
      where: { id: ingredientId },
    });

    return NextResponse.json(
      { message: "Ingredient deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("DELETE /api/ingredients/[id] error:", error);

    // Handle foreign key constraint error (ingredient is used in products)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2003") {
        return NextResponse.json(
          { error: "Cannot delete ingredient that is used in products" },
          { status: 409 },
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to delete ingredient" },
      { status: 500 },
    );
  }
}

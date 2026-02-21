/**
 * Product Ingredients API Route
 * Handles updating ingredients for a product with automatic cost recalculation
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";
import { calculateIngredientCosts } from "@/lib/services";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * PUT /api/products/[id]/ingredients
 * Replaces all ingredients for a product and recalculates costs
 *
 * Request body:
 * {
 *   ingredients: Array<{ ingredientId: number, quantityUsed: number }>
 * }
 *
 * Cost Calculation:
 * 1. For each ingredient: costTotal = ingredient.costPerUnit × quantityUsed
 * 2. Product costTotal = sum of all ingredient costTotals
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const productId = parseInt(id, 10);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { ingredients } = body;

    // Validate ingredients array
    if (!Array.isArray(ingredients)) {
      return NextResponse.json(
        { error: "Ingredients must be an array" },
        { status: 400 },
      );
    }

    // Validate each ingredient entry
    for (const ing of ingredients) {
      if (!ing.ingredientId || typeof ing.ingredientId !== "number") {
        return NextResponse.json(
          { error: "Each ingredient must have a valid ingredientId" },
          { status: 400 },
        );
      }
      if (
        ing.quantityUsed === undefined ||
        typeof ing.quantityUsed !== "number" ||
        ing.quantityUsed <= 0
      ) {
        return NextResponse.json(
          { error: "Each ingredient must have a positive quantityUsed" },
          { status: 400 },
        );
      }
    }

    // Check for duplicate ingredientIds
    const ingredientIds = ingredients.map(
      (ing: { ingredientId: number }) => ing.ingredientId,
    );
    const uniqueIds = new Set(ingredientIds);
    if (uniqueIds.size !== ingredientIds.length) {
      return NextResponse.json(
        { error: "Duplicate ingredientIds are not allowed" },
        { status: 400 },
      );
    }

    // Use transaction to ensure data consistency
    const product = await prisma.$transaction(async (tx) => {
      // Check if product exists
      const existingProduct = await tx.product.findUnique({
        where: { id: productId },
      });

      if (!existingProduct) {
        throw new Error("PRODUCT_NOT_FOUND");
      }

      // Calculate costs using the service layer
      const { productCostTotal, ingredientCosts } =
        await calculateIngredientCosts(ingredients, tx);

      // Delete existing ingredients for this product
      await tx.productIngredient.deleteMany({
        where: { productId },
      });

      // Create new ingredient associations
      if (ingredientCosts.length > 0) {
        await tx.productIngredient.createMany({
          data: ingredientCosts.map((ic) => ({
            productId,
            ingredientId: ic.ingredientId,
            quantityUsed: ic.quantityUsed,
            costTotal: ic.costTotal,
          })),
        });
      }

      // Update product's total cost
      return tx.product.update({
        where: { id: productId },
        data: { costTotal: productCostTotal },
        include: {
          ingredients: {
            include: { ingredient: true },
            orderBy: { ingredient: { name: "asc" } },
          },
        },
      });
    });

    return NextResponse.json({
      id: product.id,
      name: product.name,
      sellingPrice: Number(product.sellingPrice),
      costTotal: Number(product.costTotal),
      profitMargin: Number(
        new Prisma.Decimal(product.sellingPrice).sub(product.costTotal),
      ),
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
      ingredients: product.ingredients.map((pi) => ({
        id: pi.id,
        ingredientId: pi.ingredient.id,
        name: pi.ingredient.name,
        unit: pi.ingredient.unit,
        costPerUnit: Number(pi.ingredient.costPerUnit),
        quantityUsed: Number(pi.quantityUsed),
        costTotal: Number(pi.costTotal),
      })),
    });
  } catch (error) {
    console.error("PUT /api/products/[id]/ingredients error:", error);

    if (error instanceof Error) {
      if (error.message === "PRODUCT_NOT_FOUND") {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 },
        );
      }
      if (error.message.includes("not found")) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json(
      { error: "Failed to update product ingredients" },
      { status: 500 },
    );
  }
}

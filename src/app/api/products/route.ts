/**
 * Products Collection API Route
 * Handles GET all and POST create operations
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";
import { calculateIngredientCosts } from "@/lib/services";

/**
 * GET /api/products
 * Returns all products with their ingredients
 */
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { name: "asc" },
      include: {
        ingredients: {
          include: {
            ingredient: true,
          },
          orderBy: { ingredient: { name: "asc" } },
        },
      },
    });

    return NextResponse.json(
      products.map((product) => ({
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
      })),
    );
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/products
 * Creates a new product with optional ingredients
 *
 * Request body:
 * {
 *   name: string,
 *   sellingPrice: number,
 *   ingredients?: Array<{ ingredientId: number, quantityUsed: number }>
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, sellingPrice, ingredients = [] } = body;

    // Validate name
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Name is required and must be a non-empty string" },
        { status: 400 },
      );
    }

    if (name.trim().length > 255) {
      return NextResponse.json(
        { error: "Name must be at most 255 characters" },
        { status: 400 },
      );
    }

    // Validate sellingPrice
    if (sellingPrice === undefined || sellingPrice === null) {
      return NextResponse.json(
        { error: "Selling price is required" },
        { status: 400 },
      );
    }

    const priceValue = Number(sellingPrice);
    if (isNaN(priceValue) || priceValue < 0) {
      return NextResponse.json(
        { error: "Selling price must be a non-negative number" },
        { status: 400 },
      );
    }

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

    // Use transaction to ensure data consistency
    const product = await prisma.$transaction(async (tx) => {
      // Calculate costs using the service layer
      const { productCostTotal, ingredientCosts } =
        await calculateIngredientCosts(ingredients, tx);

      // Create product with ingredients
      return tx.product.create({
        data: {
          name: name.trim(),
          sellingPrice: priceValue,
          costTotal: productCostTotal,
          ingredients: {
            create: ingredientCosts.map((ic) => ({
              ingredientId: ic.ingredientId,
              quantityUsed: ic.quantityUsed,
              costTotal: ic.costTotal,
            })),
          },
        },
        include: {
          ingredients: {
            include: { ingredient: true },
          },
        },
      });
    });

    return NextResponse.json(
      {
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
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/products error:", error);

    // Handle custom validation error for missing ingredients
    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 },
    );
  }
}

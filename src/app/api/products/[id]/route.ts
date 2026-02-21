/**
 * Individual Product API Route
 * Handles GET, PUT, and DELETE operations for a single product
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * Helper: Format product response with ingredients
 */
function formatProductResponse(product: {
  id: number;
  name: string;
  sellingPrice: Prisma.Decimal;
  costTotal: Prisma.Decimal;
  createdAt: Date;
  updatedAt: Date;
  ingredients: Array<{
    id: number;
    quantityUsed: Prisma.Decimal;
    costTotal: Prisma.Decimal;
    ingredient: {
      id: number;
      name: string;
      unit: string;
      costPerUnit: Prisma.Decimal;
    };
  }>;
}) {
  return {
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
  };
}

/**
 * GET /api/products/[id]
 * Returns a single product with its ingredients
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const productId = parseInt(id, 10);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 },
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        ingredients: {
          include: { ingredient: true },
          orderBy: { ingredient: { name: "asc" } },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(formatProductResponse(product));
  } catch (error) {
    console.error("GET /api/products/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/products/[id]
 * Updates product details (name, sellingPrice only)
 * Use /api/products/[id]/ingredients to update ingredients
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
    const { name, sellingPrice } = body;

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

    // Validate sellingPrice if provided
    if (sellingPrice !== undefined) {
      const priceValue = Number(sellingPrice);
      if (isNaN(priceValue) || priceValue < 0) {
        return NextResponse.json(
          { error: "Selling price must be a non-negative number" },
          { status: 400 },
        );
      }
    }

    // Check if product exists
    const existing = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Update product
    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(sellingPrice !== undefined && {
          sellingPrice: Number(sellingPrice),
        }),
      },
      include: {
        ingredients: {
          include: { ingredient: true },
          orderBy: { ingredient: { name: "asc" } },
        },
      },
    });

    return NextResponse.json(formatProductResponse(product));
  } catch (error) {
    console.error("PUT /api/products/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/products/[id]
 * Deletes a product and all its ingredient associations
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const productId = parseInt(id, 10);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 },
      );
    }

    // Check if product exists
    const existing = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Delete product (cascade will remove ProductIngredient records)
    await prisma.product.delete({
      where: { id: productId },
    });

    return NextResponse.json(
      { message: "Product deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("DELETE /api/products/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 },
    );
  }
}

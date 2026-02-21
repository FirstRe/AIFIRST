/**
 * Ingredients Collection API Route
 * Handles GET all and POST create operations
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

/**
 * GET /api/ingredients
 * Returns all ingredients
 */
export async function GET() {
  try {
    const ingredients = await prisma.ingredient.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json(
      ingredients.map((ingredient) => ({
        id: ingredient.id,
        name: ingredient.name,
        costPerUnit: Number(ingredient.costPerUnit),
        unit: ingredient.unit,
        createdAt: ingredient.createdAt.toISOString(),
        updatedAt: ingredient.updatedAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error("GET /api/ingredients error:", error);
    return NextResponse.json(
      { error: "Failed to fetch ingredients" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ingredients
 * Creates a new ingredient
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, costPerUnit, unit } = body;

    // Validate name
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Name is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    if (name.trim().length > 255) {
      return NextResponse.json(
        { error: "Name must be at most 255 characters" },
        { status: 400 }
      );
    }

    // Validate costPerUnit
    if (costPerUnit === undefined || costPerUnit === null) {
      return NextResponse.json(
        { error: "Cost per unit is required" },
        { status: 400 }
      );
    }

    const costValue = Number(costPerUnit);
    if (isNaN(costValue) || costValue < 0) {
      return NextResponse.json(
        { error: "Cost per unit must be a non-negative number" },
        { status: 400 }
      );
    }

    // Validate unit
    if (!unit || typeof unit !== "string" || unit.trim().length === 0) {
      return NextResponse.json(
        { error: "Unit is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    if (unit.trim().length > 50) {
      return NextResponse.json(
        { error: "Unit must be at most 50 characters" },
        { status: 400 }
      );
    }

    // Create ingredient
    const ingredient = await prisma.ingredient.create({
      data: {
        name: name.trim(),
        costPerUnit: costValue,
        unit: unit.trim(),
      },
    });

    return NextResponse.json(
      {
        id: ingredient.id,
        name: ingredient.name,
        costPerUnit: Number(ingredient.costPerUnit),
        unit: ingredient.unit,
        createdAt: ingredient.createdAt.toISOString(),
        updatedAt: ingredient.updatedAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/ingredients error:", error);
    return NextResponse.json(
      { error: "Failed to create ingredient" },
      { status: 500 }
    );
  }
}


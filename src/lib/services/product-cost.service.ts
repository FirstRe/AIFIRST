/**
 * Product Cost Calculation Service
 *
 * This service provides reusable functions for calculating and updating
 * product costs based on ingredient usage. It can be used across multiple
 * API routes to ensure consistent cost calculation logic.
 *
 * Cost Calculation Formula:
 * ─────────────────────────
 * 1. Ingredient Cost = costPerUnit × quantityUsed
 * 2. Product Total Cost = Σ(Ingredient Costs)
 *
 * Example:
 * ─────────────────────────
 * Flour:      0.05/gram × 200 grams = 10.00
 * Sugar:      0.03/gram × 100 grams =  3.00
 * Strawberry: 0.50/piece × 10 pieces =  5.00
 * ─────────────────────────────────────────
 * Product Total Cost               = 18.00
 */

import { Prisma, PrismaClient } from "@prisma/client";
import prisma from "@/lib/db";

/**
 * Type for Prisma transaction client
 * Allows the service to work within existing transactions
 */
type TransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

/**
 * Input for creating/updating product ingredients
 */
export interface IngredientInput {
  ingredientId: number;
  quantityUsed: number;
}

/**
 * Calculated ingredient cost result
 */
export interface IngredientCostResult {
  ingredientId: number;
  quantityUsed: number;
  costTotal: Prisma.Decimal;
}

/**
 * Result of product cost calculation
 */
export interface ProductCostResult {
  productCostTotal: Prisma.Decimal;
  ingredientCosts: IngredientCostResult[];
}

/**
 * Calculate the cost for a single ingredient usage
 *
 * @param costPerUnit - The cost per unit of the ingredient
 * @param quantityUsed - The quantity of ingredient used
 * @returns The total cost for this ingredient usage
 *
 * @example
 * calculateIngredientCost(new Prisma.Decimal(0.05), 200) // Returns 10.00
 */
export function calculateIngredientCost(
  costPerUnit: Prisma.Decimal,
  quantityUsed: number,
): Prisma.Decimal {
  return new Prisma.Decimal(costPerUnit).mul(quantityUsed);
}

/**
 * Calculate the total product cost from an array of ingredient costs
 *
 * @param ingredientCosts - Array of objects containing costTotal
 * @returns The sum of all ingredient costs
 *
 * @example
 * calculateProductCostTotal([
 *   { costTotal: new Prisma.Decimal(10) },
 *   { costTotal: new Prisma.Decimal(5) }
 * ]) // Returns 15.00
 */
export function calculateProductCostTotal(
  ingredientCosts: Array<{ costTotal: Prisma.Decimal }>,
): Prisma.Decimal {
  return ingredientCosts.reduce(
    (sum, ing) => sum.add(ing.costTotal),
    new Prisma.Decimal(0),
  );
}

/**
 * Calculate costs for multiple ingredients
 *
 * This function fetches ingredient data from the database and calculates
 * the cost for each ingredient based on the quantity used.
 *
 * @param ingredients - Array of ingredient inputs with ingredientId and quantityUsed
 * @param tx - Optional Prisma transaction client (uses default client if not provided)
 * @returns Object containing ingredient costs and total product cost
 * @throws Error if any ingredient is not found in the database
 *
 * @example
 * const result = await calculateIngredientCosts([
 *   { ingredientId: 1, quantityUsed: 200 },
 *   { ingredientId: 2, quantityUsed: 100 }
 * ]);
 * // result.productCostTotal = 13.00
 * // result.ingredientCosts = [{ ingredientId: 1, quantityUsed: 200, costTotal: 10.00 }, ...]
 */
export async function calculateIngredientCosts(
  ingredients: IngredientInput[],
  tx: TransactionClient = prisma,
): Promise<ProductCostResult> {
  // Return zero cost if no ingredients
  if (ingredients.length === 0) {
    return {
      productCostTotal: new Prisma.Decimal(0),
      ingredientCosts: [],
    };
  }

  // Extract ingredient IDs
  const ingredientIds = ingredients.map((ing) => ing.ingredientId);

  // Fetch ingredient data from database
  const ingredientRecords = await tx.ingredient.findMany({
    where: { id: { in: ingredientIds } },
    select: { id: true, costPerUnit: true },
  });

  // Verify all ingredients exist
  if (ingredientRecords.length !== ingredientIds.length) {
    const foundIds = new Set(ingredientRecords.map((i) => i.id));
    const missingIds = ingredientIds.filter((id) => !foundIds.has(id));
    throw new Error(`Ingredients not found: ${missingIds.join(", ")}`);
  }

  // Build a map for quick lookup: ingredientId -> costPerUnit
  const costPerUnitMap = new Map(
    ingredientRecords.map((i) => [i.id, i.costPerUnit]),
  );

  // Calculate cost for each ingredient
  const ingredientCosts: IngredientCostResult[] = ingredients.map((ing) => {
    const costPerUnit = costPerUnitMap.get(ing.ingredientId)!;
    const costTotal = calculateIngredientCost(costPerUnit, ing.quantityUsed);

    return {
      ingredientId: ing.ingredientId,
      quantityUsed: ing.quantityUsed,
      costTotal,
    };
  });

  // Calculate total product cost
  const productCostTotal = calculateProductCostTotal(ingredientCosts);

  return {
    productCostTotal,
    ingredientCosts,
  };
}

/**
 * Recalculate and update a product's total cost based on its current ingredients
 *
 * This function:
 * 1. Fetches all ingredients currently associated with the product
 * 2. Recalculates the cost for each ingredient (costPerUnit × quantityUsed)
 * 3. Sums all ingredient costs to get the product's total cost
 * 4. Updates the product's costTotal field in the database
 * 5. Updates each ProductIngredient's costTotal field
 *
 * Use this function when:
 * - An ingredient's costPerUnit changes
 * - You need to refresh/recalculate costs for a product
 * - Batch recalculation of product costs
 *
 * @param productId - The ID of the product to recalculate
 * @param tx - Optional Prisma transaction client
 * @returns The updated product with recalculated costs
 * @throws Error if product is not found
 *
 * @example
 * // Recalculate a single product's cost
 * const product = await recalculateProductCost(1);
 *
 * @example
 * // Within a transaction
 * await prisma.$transaction(async (tx) => {
 *   await tx.ingredient.update({ where: { id: 1 }, data: { costPerUnit: 0.06 } });
 *   await recalculateProductCost(productId, tx);
 * });
 */
export async function recalculateProductCost(
  productId: number,
  tx: TransactionClient = prisma,
) {
  // Fetch product with its current ingredients
  const product = await tx.product.findUnique({
    where: { id: productId },
    include: {
      ingredients: {
        include: { ingredient: true },
      },
    },
  });

  if (!product) {
    throw new Error(`Product not found: ${productId}`);
  }

  // If no ingredients, set cost to zero
  if (product.ingredients.length === 0) {
    return tx.product.update({
      where: { id: productId },
      data: { costTotal: new Prisma.Decimal(0) },
      include: {
        ingredients: {
          include: { ingredient: true },
        },
      },
    });
  }

  // Recalculate cost for each ingredient and update ProductIngredient records
  let totalCost = new Prisma.Decimal(0);

  for (const pi of product.ingredients) {
    const newCostTotal = calculateIngredientCost(
      pi.ingredient.costPerUnit,
      Number(pi.quantityUsed),
    );

    // Update the ProductIngredient's costTotal
    await tx.productIngredient.update({
      where: { id: pi.id },
      data: { costTotal: newCostTotal },
    });

    totalCost = totalCost.add(newCostTotal);
  }

  // Update the product's total cost
  return tx.product.update({
    where: { id: productId },
    data: { costTotal: totalCost },
    include: {
      ingredients: {
        include: { ingredient: true },
        orderBy: { ingredient: { name: "asc" } },
      },
    },
  });
}

/**
 * Recalculate costs for all products that use a specific ingredient
 *
 * Use this function when an ingredient's costPerUnit changes to update
 * all products that use that ingredient.
 *
 * @param ingredientId - The ID of the ingredient that changed
 * @param tx - Optional Prisma transaction client
 * @returns Array of updated product IDs
 *
 * @example
 * // After updating ingredient price
 * await prisma.$transaction(async (tx) => {
 *   await tx.ingredient.update({
 *     where: { id: flourId },
 *     data: { costPerUnit: 0.06 }
 *   });
 *   await recalculateProductsUsingIngredient(flourId, tx);
 * });
 */
export async function recalculateProductsUsingIngredient(
  ingredientId: number,
  tx: TransactionClient = prisma,
): Promise<number[]> {
  // Find all products using this ingredient
  const productIngredients = await tx.productIngredient.findMany({
    where: { ingredientId },
    select: { productId: true },
    distinct: ["productId"],
  });

  const productIds = productIngredients.map((pi) => pi.productId);

  // Recalculate cost for each product
  for (const productId of productIds) {
    await recalculateProductCost(productId, tx);
  }

  return productIds;
}

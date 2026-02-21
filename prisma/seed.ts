// prisma/seed.ts
// Seed data for Bakery Shop Back-Office System

import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Cost Calculation Logic:
 *
 * 1. Each ingredient has a `costPerUnit` (e.g., 0.05 per gram of flour)
 * 2. When an ingredient is used in a product, we calculate:
 *    - ingredientCost = costPerUnit × quantityUsed
 * 3. The product's total cost is the sum of all ingredient costs:
 *    - productCostTotal = Σ(ingredientCost for each ingredient)
 *
 * Example for Strawberry Cake:
 *    - Flour: 0.05 × 200 = 10.00
 *    - Sugar: 0.03 × 100 = 3.00
 *    - Strawberry: 0.50 × 10 = 5.00
 *    - Total: 10.00 + 3.00 + 5.00 = 18.00
 */

// Helper function to calculate ingredient cost
const calculateIngredientCost = (
  costPerUnit: Prisma.Decimal,
  quantityUsed: number
): Prisma.Decimal => {
  return new Prisma.Decimal(costPerUnit).mul(quantityUsed);
};

// Helper function to calculate total product cost from ingredients
const calculateProductCostTotal = (
  ingredients: Array<{ costTotal: Prisma.Decimal }>
): Prisma.Decimal => {
  return ingredients.reduce(
    (sum, ing) => sum.add(ing.costTotal),
    new Prisma.Decimal(0)
  );
};

async function main() {
  console.log("🌱 Starting seed...");

  // Clear existing data (in reverse order of dependencies)
  await prisma.productIngredient.deleteMany();
  await prisma.product.deleteMany();
  await prisma.ingredient.deleteMany();

  console.log("🧹 Cleared existing data");

  // ============================================
  // Step 1: Create Ingredients
  // ============================================
  const flour = await prisma.ingredient.create({
    data: {
      name: "Flour",
      costPerUnit: 0.05, // 0.05 per gram
      unit: "gram",
    },
  });

  const sugar = await prisma.ingredient.create({
    data: {
      name: "Sugar",
      costPerUnit: 0.03, // 0.03 per gram
      unit: "gram",
    },
  });

  const strawberry = await prisma.ingredient.create({
    data: {
      name: "Strawberry",
      costPerUnit: 0.5, // 0.50 per piece
      unit: "piece",
    },
  });

  console.log("✅ Created ingredients:", { flour, sugar, strawberry });

  // ============================================
  // Step 2: Define recipe for Strawberry Cake
  // ============================================
  const strawberryCakeRecipe = [
    { ingredient: flour, quantityUsed: 200 }, // 200 grams of flour
    { ingredient: sugar, quantityUsed: 100 }, // 100 grams of sugar
    { ingredient: strawberry, quantityUsed: 10 }, // 10 pieces of strawberry
  ];

  // ============================================
  // Step 3: Calculate costs for each ingredient usage
  // ============================================
  const ingredientCosts = strawberryCakeRecipe.map((item) => {
    const costTotal = calculateIngredientCost(
      item.ingredient.costPerUnit,
      item.quantityUsed
    );
    console.log(
      `  📊 ${item.ingredient.name}: ${item.ingredient.costPerUnit} × ${item.quantityUsed} = ${costTotal}`
    );
    return {
      ingredientId: item.ingredient.id,
      quantityUsed: item.quantityUsed,
      costTotal,
    };
  });

  // ============================================
  // Step 4: Calculate total product cost
  // ============================================
  const productCostTotal = calculateProductCostTotal(ingredientCosts);
  console.log(`  💰 Total cost for Strawberry Cake: ${productCostTotal}`);

  // ============================================
  // Step 5: Create product with ingredients in a transaction
  // ============================================
  const strawberryCake = await prisma.product.create({
    data: {
      name: "Strawberry Cake",
      sellingPrice: 35.0, // Selling price (markup over cost)
      costTotal: productCostTotal,
      ingredients: {
        create: ingredientCosts.map((item) => ({
          ingredientId: item.ingredientId,
          quantityUsed: item.quantityUsed,
          costTotal: item.costTotal,
        })),
      },
    },
    include: {
      ingredients: {
        include: {
          ingredient: true,
        },
      },
    },
  });

  console.log("✅ Created product:", strawberryCake.name);
  console.log("   - Selling Price:", strawberryCake.sellingPrice.toString());
  console.log("   - Cost Total:", strawberryCake.costTotal.toString());
  console.log(
    "   - Profit Margin:",
    new Prisma.Decimal(strawberryCake.sellingPrice)
      .sub(strawberryCake.costTotal)
      .toString()
  );

  console.log("\n🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


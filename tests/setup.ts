/**
 * Jest Test Setup
 * Configures test environment and database cleanup
 */

import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

import { PrismaClient } from "@prisma/client";

// Create a single Prisma client instance for all tests
export const prisma = new PrismaClient();

// Base URL for API testing
export const BASE_URL = "http://localhost:3000";

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  // Clean database before each test - order matters due to foreign keys
  await prisma.productIngredient.deleteMany();
  await prisma.product.deleteMany();
  await prisma.ingredient.deleteMany();
});

// Helper function to create an ingredient via API
export async function createIngredientViaAPI(
  name: string,
  costPerUnit: number,
  unit: string,
) {
  const response = await fetch(`${BASE_URL}/api/ingredients`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, costPerUnit, unit }),
  });
  return response.json();
}

// Helper function to create a product via API
export async function createProductViaAPI(
  name: string,
  sellingPrice: number,
  ingredients?: { ingredientId: number; quantityUsed: number }[],
) {
  const response = await fetch(`${BASE_URL}/api/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, sellingPrice, ingredients }),
  });
  return response.json();
}

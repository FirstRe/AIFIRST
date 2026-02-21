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
  await prisma.requirement.deleteMany();
  await prisma.project.deleteMany();
});

// Helper function to create a requirement via API
export async function createRequirementViaAPI(
  description: string,
  effort: number,
) {
  const response = await fetch(`${BASE_URL}/api/requirements`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ description, effort }),
  });
  return response.json();
}

// Helper function to create a project via API
export async function createProjectViaAPI(name: string) {
  const response = await fetch(`${BASE_URL}/api/project`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  return response.json();
}

/**
 * Business Logic Tests - Effort Calculation
 * Tests for total active effort calculation
 */

import {
  BASE_URL,
  createProjectViaAPI,
  createRequirementViaAPI,
} from "../setup";

describe("Total Active Effort Calculation", () => {
  beforeEach(async () => {
    await createProjectViaAPI("Test Project");
  });

  // Helper to calculate total active effort from API
  async function getTotalActiveEffort(): Promise<number> {
    const response = await fetch(`${BASE_URL}/api/requirements`);
    const requirements = await response.json();
    if (!Array.isArray(requirements)) return 0;
    return requirements
      .filter((req: { isActive: boolean }) => req.isActive)
      .reduce(
        (sum: number, req: { effort: number | string }) =>
          sum + Number(req.effort),
        0,
      );
  }

  it("BIZ-EFF-001: should calculate total effort with all active requirements", async () => {
    await createRequirementViaAPI("R1", 5);
    await createRequirementViaAPI("R2", 3);
    await createRequirementViaAPI("R3", 2);

    const totalEffort = await getTotalActiveEffort();
    expect(totalEffort).toBe(10);
  });

  it("BIZ-EFF-002: should calculate total effort with mixed status (excludes inactive)", async () => {
    const req1 = await createRequirementViaAPI("R1", 5);
    const req2 = await createRequirementViaAPI("R2", 3);
    await createRequirementViaAPI("R3", 2);

    // Toggle R2 to inactive
    await fetch(`${BASE_URL}/api/requirements/${req2.id}/toggle`, {
      method: "PATCH",
    });

    const totalEffort = await getTotalActiveEffort();
    expect(totalEffort).toBe(7); // 5 + 2, excluding inactive R2 (3)
  });

  it("BIZ-EFF-003: should return 0 when all requirements are inactive", async () => {
    const req1 = await createRequirementViaAPI("R1", 5);
    const req2 = await createRequirementViaAPI("R2", 3);

    // Toggle both to inactive
    await fetch(`${BASE_URL}/api/requirements/${req1.id}/toggle`, {
      method: "PATCH",
    });
    await fetch(`${BASE_URL}/api/requirements/${req2.id}/toggle`, {
      method: "PATCH",
    });

    const totalEffort = await getTotalActiveEffort();
    expect(totalEffort).toBe(0);
  });

  it("BIZ-EFF-004: should return 0 when no requirements exist", async () => {
    const totalEffort = await getTotalActiveEffort();
    expect(totalEffort).toBe(0);
  });

  it("BIZ-EFF-005: should maintain decimal precision in total calculation", async () => {
    await createRequirementViaAPI("R1", 5.55);
    await createRequirementViaAPI("R2", 3.45);

    const totalEffort = await getTotalActiveEffort();
    expect(totalEffort).toBeCloseTo(9.0, 2);
  });
});

/**
 * Toggle API Tests
 * Tests for PATCH /api/requirements/[id]/toggle
 */

import {
  BASE_URL,
  createProjectViaAPI,
  createRequirementViaAPI,
} from "../setup";

describe("Toggle API - PATCH /api/requirements/[id]/toggle", () => {
  beforeEach(async () => {
    await createProjectViaAPI("Test Project");
  });

  it("REQ-TOG-001: should toggle active requirement to inactive", async () => {
    const requirement = await createRequirementViaAPI("Task", 5);

    const response = await fetch(
      `${BASE_URL}/api/requirements/${requirement.id}/toggle`,
      {
        method: "PATCH",
      },
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.isActive).toBe(false);
  });

  it("REQ-TOG-002: should toggle inactive requirement to active", async () => {
    const requirement = await createRequirementViaAPI("Task", 5);
    // Toggle to inactive first
    await fetch(`${BASE_URL}/api/requirements/${requirement.id}/toggle`, {
      method: "PATCH",
    });

    // Toggle back to active
    const response = await fetch(
      `${BASE_URL}/api/requirements/${requirement.id}/toggle`,
      {
        method: "PATCH",
      },
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.isActive).toBe(true);
  });

  it("REQ-TOG-003: should return 404 for non-existent requirement", async () => {
    const response = await fetch(`${BASE_URL}/api/requirements/99999/toggle`, {
      method: "PATCH",
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Requirement not found");
  });

  it("REQ-TOG-004: should return 400 for invalid ID", async () => {
    const response = await fetch(`${BASE_URL}/api/requirements/abc/toggle`, {
      method: "PATCH",
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid requirement ID");
  });

  it("REQ-TOG-005: should preserve other fields when toggling", async () => {
    const requirement = await createRequirementViaAPI("Original", 7.5);

    const response = await fetch(
      `${BASE_URL}/api/requirements/${requirement.id}/toggle`,
      {
        method: "PATCH",
      },
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.description).toBe("Original");
    expect(Number(data.effort)).toBe(7.5);
    expect(data.isActive).toBe(false);
  });

  it("REQ-TOG-006: should update updatedAt timestamp when toggling", async () => {
    const requirement = await createRequirementViaAPI("Task", 5);

    // Wait a bit to ensure timestamp difference
    await new Promise((resolve) => setTimeout(resolve, 100));

    const response = await fetch(
      `${BASE_URL}/api/requirements/${requirement.id}/toggle`,
      {
        method: "PATCH",
      },
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(new Date(data.updatedAt).getTime()).toBeGreaterThan(
      new Date(requirement.createdAt).getTime(),
    );
  });
});

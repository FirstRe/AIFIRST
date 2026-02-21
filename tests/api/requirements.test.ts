/**
 * Requirements API Tests
 * Tests for GET, POST /api/requirements and GET, PUT, DELETE /api/requirements/[id]
 */

import {
  BASE_URL,
  createProjectViaAPI,
  createRequirementViaAPI,
} from "../setup";
import {
  validRequirement,
  validRequirementMinEffort,
  validRequirementMaxEffort,
  invalidRequirementEmptyDescription,
  invalidRequirementWhitespaceDescription,
  invalidRequirementLongDescription,
  invalidRequirementZeroEffort,
  invalidRequirementNegativeEffort,
  invalidRequirementExceedsMaxEffort,
  invalidRequirementTooManyDecimals,
} from "../fixtures/requirement.fixtures";

describe("Requirements API", () => {
  // Create a project before each test via API
  beforeEach(async () => {
    await createProjectViaAPI("Test Project");
  });

  // ============================================
  // GET /api/requirements Tests
  // ============================================
  describe("GET /api/requirements", () => {
    it("REQ-GET-001: should return empty array when no requirements", async () => {
      const response = await fetch(`${BASE_URL}/api/requirements`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });

    it("REQ-GET-002: should return all requirements for project", async () => {
      await createRequirementViaAPI("Req 1", 5);
      await createRequirementViaAPI("Req 2", 3);

      const response = await fetch(`${BASE_URL}/api/requirements`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(2);
    });

    it("REQ-GET-003: should return requirements ordered by id ascending", async () => {
      await createRequirementViaAPI("First", 5);
      await createRequirementViaAPI("Second", 3);

      const response = await fetch(`${BASE_URL}/api/requirements`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data[0].id).toBeLessThan(data[1].id);
    });

    it("REQ-GET-004: should return 404 when no project exists", async () => {
      // Delete the project via API
      await fetch(`${BASE_URL}/api/project`, { method: "DELETE" });

      const response = await fetch(`${BASE_URL}/api/requirements`);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("No project found");
    });

    it("REQ-GET-005: should return all requirement fields", async () => {
      const created = await createRequirementViaAPI("Test Requirement", 5.5);

      const response = await fetch(`${BASE_URL}/api/requirements`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data[0]).toMatchObject({
        id: expect.any(Number),
        description: "Test Requirement",
        effort: expect.any(Number),
        isActive: true,
        projectId: created.projectId,
        createdAt: expect.any(String),
      });
    });
  });

  // ============================================
  // POST /api/requirements Tests
  // ============================================
  describe("POST /api/requirements", () => {
    it("REQ-POST-001: should create requirement with valid data", async () => {
      const response = await fetch(`${BASE_URL}/api/requirements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validRequirement),
      });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toMatchObject({
        description: validRequirement.description,
        isActive: true,
      });
    });

    it("REQ-POST-002: should create requirement with minimum effort (0.01)", async () => {
      const response = await fetch(`${BASE_URL}/api/requirements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validRequirementMinEffort),
      });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(Number(data.effort)).toBeCloseTo(0.01, 2);
    });

    it("REQ-POST-003: should create requirement with maximum effort (9999)", async () => {
      const response = await fetch(`${BASE_URL}/api/requirements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validRequirementMaxEffort),
      });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(Number(data.effort)).toBe(9999);
    });

    it("REQ-POST-004: should set isActive to true by default", async () => {
      const response = await fetch(`${BASE_URL}/api/requirements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validRequirement),
      });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.isActive).toBe(true);
    });

    it("REQ-POST-005: should reject empty description", async () => {
      const response = await fetch(`${BASE_URL}/api/requirements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invalidRequirementEmptyDescription),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Requirement description is required");
    });

    it("REQ-POST-006: should reject whitespace-only description", async () => {
      const response = await fetch(`${BASE_URL}/api/requirements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invalidRequirementWhitespaceDescription),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Requirement description is required");
    });

    it("REQ-POST-007: should reject description exceeding 500 chars", async () => {
      const response = await fetch(`${BASE_URL}/api/requirements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invalidRequirementLongDescription),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Description cannot exceed 500 characters");
    });

    it("REQ-POST-008: should reject zero effort", async () => {
      const response = await fetch(`${BASE_URL}/api/requirements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invalidRequirementZeroEffort),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Effort must be greater than zero");
    });

    it("REQ-POST-009: should reject negative effort", async () => {
      const response = await fetch(`${BASE_URL}/api/requirements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invalidRequirementNegativeEffort),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Effort must be greater than zero");
    });

    it("REQ-POST-010: should reject effort exceeding 9999", async () => {
      const response = await fetch(`${BASE_URL}/api/requirements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invalidRequirementExceedsMaxEffort),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Effort cannot exceed 9999");
    });

    it("REQ-POST-011: should reject effort with more than 2 decimal places", async () => {
      const response = await fetch(`${BASE_URL}/api/requirements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invalidRequirementTooManyDecimals),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Effort can have at most 2 decimal places");
    });

    it("REQ-POST-012: should increment nextRequirementId in project", async () => {
      await fetch(`${BASE_URL}/api/requirements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validRequirement),
      });

      // Verify via GET project API
      const projectResponse = await fetch(`${BASE_URL}/api/project`);
      const projectData = await projectResponse.json();
      expect(projectData.nextRequirementId).toBe(2);
    });

    it("REQ-POST-013: should return 404 when no project exists", async () => {
      // Delete project via API
      await fetch(`${BASE_URL}/api/project`, { method: "DELETE" });

      const response = await fetch(`${BASE_URL}/api/requirements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validRequirement),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("No project found");
    });

    it("REQ-POST-014: should trim whitespace from description", async () => {
      const response = await fetch(`${BASE_URL}/api/requirements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: "  Padded Description  ",
          effort: 5,
        }),
      });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.description).toBe("Padded Description");
    });
  });

  // ============================================
  // GET /api/requirements/[id] Tests
  // ============================================
  describe("GET /api/requirements/[id]", () => {
    it("REQ-GID-001: should return requirement by ID", async () => {
      const requirement = await createRequirementViaAPI("Test Req", 5);

      const response = await fetch(
        `${BASE_URL}/api/requirements/${requirement.id}`,
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.description).toBe("Test Req");
    });

    it("REQ-GID-002: should return 404 for non-existent requirement", async () => {
      const response = await fetch(`${BASE_URL}/api/requirements/99999`);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Requirement not found");
    });

    it("REQ-GID-003: should return 400 for invalid ID format", async () => {
      const response = await fetch(`${BASE_URL}/api/requirements/abc`);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Invalid requirement ID");
    });

    it("REQ-GID-004: should return 400 for negative ID", async () => {
      const response = await fetch(`${BASE_URL}/api/requirements/-1`);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Invalid requirement ID");
    });
  });

  // ============================================
  // PUT /api/requirements/[id] Tests
  // ============================================
  describe("PUT /api/requirements/[id]", () => {
    let requirementId: number;

    beforeEach(async () => {
      const requirement = await createRequirementViaAPI("Original", 5);
      requirementId = requirement.id;
    });

    it("REQ-PUT-001: should update requirement description", async () => {
      const response = await fetch(
        `${BASE_URL}/api/requirements/${requirementId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description: "Updated Description" }),
        },
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.description).toBe("Updated Description");
    });

    it("REQ-PUT-002: should update requirement effort", async () => {
      const response = await fetch(
        `${BASE_URL}/api/requirements/${requirementId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ effort: 10.5 }),
        },
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Number(data.effort)).toBe(10.5);
    });

    it("REQ-PUT-003: should update both description and effort", async () => {
      const response = await fetch(
        `${BASE_URL}/api/requirements/${requirementId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description: "New", effort: 8 }),
        },
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.description).toBe("New");
      expect(Number(data.effort)).toBe(8);
    });

    it("REQ-PUT-004: should reject empty description on update", async () => {
      const response = await fetch(
        `${BASE_URL}/api/requirements/${requirementId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description: "" }),
        },
      );
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Requirement description is required");
    });

    it("REQ-PUT-005: should reject zero effort on update", async () => {
      const response = await fetch(
        `${BASE_URL}/api/requirements/${requirementId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ effort: 0 }),
        },
      );
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Effort must be greater than zero");
    });

    it("REQ-PUT-006: should reject effort exceeding 9999 on update", async () => {
      const response = await fetch(
        `${BASE_URL}/api/requirements/${requirementId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ effort: 10000 }),
        },
      );
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Effort cannot exceed 9999");
    });

    it("REQ-PUT-007: should return 404 for non-existent requirement", async () => {
      const response = await fetch(`${BASE_URL}/api/requirements/99999`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: "Test" }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Requirement not found");
    });

    it("REQ-PUT-008: should preserve isActive status when updating other fields", async () => {
      // First toggle to inactive
      await fetch(`${BASE_URL}/api/requirements/${requirementId}/toggle`, {
        method: "PATCH",
      });

      const response = await fetch(
        `${BASE_URL}/api/requirements/${requirementId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description: "Updated" }),
        },
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.isActive).toBe(false);
    });

    it("REQ-PUT-009: should update updatedAt timestamp", async () => {
      // Get the current requirement data
      const beforeResponse = await fetch(
        `${BASE_URL}/api/requirements/${requirementId}`,
      );
      const before = await beforeResponse.json();

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 100));

      const response = await fetch(
        `${BASE_URL}/api/requirements/${requirementId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description: "Updated" }),
        },
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(new Date(data.updatedAt).getTime()).toBeGreaterThan(
        new Date(before.updatedAt).getTime(),
      );
    });

    it("REQ-PUT-010: should reject description exceeding 500 chars on update", async () => {
      const response = await fetch(
        `${BASE_URL}/api/requirements/${requirementId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description: "A".repeat(501) }),
        },
      );
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Description cannot exceed 500 characters");
    });
  });

  // ============================================
  // DELETE /api/requirements/[id] Tests
  // ============================================
  describe("DELETE /api/requirements/[id]", () => {
    it("REQ-DEL-001: should delete existing requirement", async () => {
      const requirement = await createRequirementViaAPI("To Delete", 5);

      const response = await fetch(
        `${BASE_URL}/api/requirements/${requirement.id}`,
        {
          method: "DELETE",
        },
      );

      expect(response.status).toBe(204);

      // Verify via API that requirement is deleted
      const getResponse = await fetch(
        `${BASE_URL}/api/requirements/${requirement.id}`,
      );
      expect(getResponse.status).toBe(404);
    });

    it("REQ-DEL-002: should return 404 for non-existent requirement", async () => {
      const response = await fetch(`${BASE_URL}/api/requirements/99999`, {
        method: "DELETE",
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Requirement not found");
    });

    it("REQ-DEL-003: should return 400 for invalid ID", async () => {
      const response = await fetch(`${BASE_URL}/api/requirements/abc`, {
        method: "DELETE",
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Invalid requirement ID");
    });

    it("REQ-DEL-004: should preserve other requirements when deleting", async () => {
      const req1 = await createRequirementViaAPI("Req 1", 5);
      const req2 = await createRequirementViaAPI("Req 2", 3);

      await fetch(`${BASE_URL}/api/requirements/${req1.id}`, {
        method: "DELETE",
      });

      // Verify req2 still exists via API
      const getResponse = await fetch(
        `${BASE_URL}/api/requirements/${req2.id}`,
      );
      expect(getResponse.status).toBe(200);
    });

    it("REQ-DEL-005: should not reset nextRequirementId when deleting", async () => {
      // Create 4 requirements to increment nextRequirementId to 5
      await createRequirementViaAPI("Req 1", 1);
      await createRequirementViaAPI("Req 2", 2);
      await createRequirementViaAPI("Req 3", 3);
      const req4 = await createRequirementViaAPI("Req 4", 4);

      // nextRequirementId should now be 5
      const projectBefore = await fetch(`${BASE_URL}/api/project`);
      const projectDataBefore = await projectBefore.json();
      expect(projectDataBefore.nextRequirementId).toBe(5);

      // Delete the last requirement
      await fetch(`${BASE_URL}/api/requirements/${req4.id}`, {
        method: "DELETE",
      });

      // Verify nextRequirementId is still 5
      const projectAfter = await fetch(`${BASE_URL}/api/project`);
      const projectDataAfter = await projectAfter.json();
      expect(projectDataAfter.nextRequirementId).toBe(5);
    });
  });
});

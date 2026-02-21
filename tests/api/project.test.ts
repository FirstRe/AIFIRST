/**
 * Project API Tests
 * Tests for GET, POST, PUT, DELETE /api/project
 */

import { BASE_URL, createProjectViaAPI } from "../setup";
import {
  validProject,
  validProjectMaxLength,
  invalidProjectEmpty,
  invalidProjectWhitespace,
  invalidProjectTooLong,
  projectWithWhitespacePadding,
} from "../fixtures/project.fixtures";

describe("Project API", () => {
  // ============================================
  // GET /api/project Tests
  // ============================================
  describe("GET /api/project", () => {
    it("PRJ-GET-001: should return existing project with all fields", async () => {
      // Arrange: Create a project via API
      await createProjectViaAPI("Test Project");

      // Act
      const response = await fetch(`${BASE_URL}/api/project`);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data).toMatchObject({
        id: expect.any(Number),
        name: "Test Project",
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        nextRequirementId: 1,
      });
    });

    it("PRJ-GET-002: should return 404 when no project exists", async () => {
      const response = await fetch(`${BASE_URL}/api/project`);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("No project found");
    });

    it("PRJ-GET-003: should return ISO 8601 dates", async () => {
      // Create project via API
      await createProjectViaAPI("Test Project");

      const response = await fetch(`${BASE_URL}/api/project`);
      const data = await response.json();

      expect(response.status).toBe(200);
      // ISO 8601 format check
      expect(new Date(data.createdAt).toISOString()).toBe(data.createdAt);
      expect(new Date(data.updatedAt).toISOString()).toBe(data.updatedAt);
    });
  });

  // ============================================
  // POST /api/project Tests
  // ============================================
  describe("POST /api/project", () => {
    it("PRJ-POST-001: should create project with valid name", async () => {
      const response = await fetch(`${BASE_URL}/api/project`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validProject),
      });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.name).toBe(validProject.name);
      expect(data.nextRequirementId).toBe(1);
    });

    it("PRJ-POST-002: should create project with max length name (100 chars)", async () => {
      const response = await fetch(`${BASE_URL}/api/project`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validProjectMaxLength),
      });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.name).toBe(validProjectMaxLength.name);
      expect(data.name.length).toBe(100);
    });

    it("PRJ-POST-003: should reject empty project name", async () => {
      const response = await fetch(`${BASE_URL}/api/project`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invalidProjectEmpty),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Project name is required");
    });

    it("PRJ-POST-004: should reject whitespace-only project name", async () => {
      const response = await fetch(`${BASE_URL}/api/project`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invalidProjectWhitespace),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Project name is required");
    });

    it("PRJ-POST-005: should reject name exceeding 100 chars", async () => {
      const response = await fetch(`${BASE_URL}/api/project`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invalidProjectTooLong),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Project name cannot exceed 100 characters");
    });

    it("PRJ-POST-006: should reject request without name field", async () => {
      const response = await fetch(`${BASE_URL}/api/project`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Project name is required");
    });

    it("PRJ-POST-007: should delete existing project when creating new one", async () => {
      // Create initial project via API
      await createProjectViaAPI("Old Project");

      // Create new project
      const response = await fetch(`${BASE_URL}/api/project`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "New Project" }),
      });

      expect(response.status).toBe(201);

      // Verify only new project exists by checking the name
      const getResponse = await fetch(`${BASE_URL}/api/project`);
      const data = await getResponse.json();
      expect(data.name).toBe("New Project");
    });

    it("PRJ-POST-008: should trim whitespace from project name", async () => {
      const response = await fetch(`${BASE_URL}/api/project`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectWithWhitespacePadding),
      });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.name).toBe("My Project");
    });
  });

  // ============================================
  // PUT /api/project Tests
  // ============================================
  describe("PUT /api/project", () => {
    it("PRJ-PUT-001: should update project name", async () => {
      // Create project via API
      await createProjectViaAPI("Original Name");

      const response = await fetch(`${BASE_URL}/api/project`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Updated Name" }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.name).toBe("Updated Name");
    });

    it("PRJ-PUT-002: should update project with max length name", async () => {
      await createProjectViaAPI("Original");

      const response = await fetch(`${BASE_URL}/api/project`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validProjectMaxLength),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.name.length).toBe(100);
    });

    it("PRJ-PUT-003: should reject empty name on update", async () => {
      await createProjectViaAPI("Original");

      const response = await fetch(`${BASE_URL}/api/project`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invalidProjectEmpty),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Project name is required");
    });

    it("PRJ-PUT-004: should reject name exceeding 100 chars on update", async () => {
      await createProjectViaAPI("Original");

      const response = await fetch(`${BASE_URL}/api/project`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invalidProjectTooLong),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Project name cannot exceed 100 characters");
    });

    it("PRJ-PUT-005: should return 404 when no project exists", async () => {
      const response = await fetch(`${BASE_URL}/api/project`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "New Name" }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("No project found");
    });

    it("PRJ-PUT-006: should preserve nextRequirementId on update", async () => {
      // Create project and add requirements to increment nextRequirementId
      await createProjectViaAPI("Original");
      // Create 9 requirements to make nextRequirementId = 10
      for (let i = 0; i < 9; i++) {
        await fetch(`${BASE_URL}/api/requirements`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description: `Req ${i}`, effort: 1 }),
        });
      }

      const response = await fetch(`${BASE_URL}/api/project`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Updated" }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.nextRequirementId).toBe(10);
    });
  });

  // ============================================
  // DELETE /api/project Tests
  // ============================================
  describe("DELETE /api/project", () => {
    it("PRJ-DEL-001: should delete existing project", async () => {
      await createProjectViaAPI("To Delete");

      const response = await fetch(`${BASE_URL}/api/project`, {
        method: "DELETE",
      });

      expect(response.status).toBe(204);

      // Verify project is deleted via API
      const getResponse = await fetch(`${BASE_URL}/api/project`);
      expect(getResponse.status).toBe(404);
    });

    it("PRJ-DEL-002: should return 404 when no project exists", async () => {
      const response = await fetch(`${BASE_URL}/api/project`, {
        method: "DELETE",
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("No project found");
    });

    it("PRJ-DEL-003: should cascade delete all requirements", async () => {
      // Create project and requirements via API
      await createProjectViaAPI("Test");
      await fetch(`${BASE_URL}/api/requirements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: "Req 1", effort: 5 }),
      });
      await fetch(`${BASE_URL}/api/requirements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: "Req 2", effort: 3 }),
      });

      const response = await fetch(`${BASE_URL}/api/project`, {
        method: "DELETE",
      });

      expect(response.status).toBe(204);

      // Verify requirements are deleted via API
      const getReqResponse = await fetch(`${BASE_URL}/api/requirements`);
      expect(getReqResponse.status).toBe(404); // No project, so 404
    });
  });
});

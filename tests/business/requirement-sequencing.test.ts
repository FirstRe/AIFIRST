/**
 * Business Logic Tests - Requirement ID Sequencing
 * Tests for sequential ID assignment and non-reuse
 */

import {
  BASE_URL,
  createProjectViaAPI,
  createRequirementViaAPI,
} from "../setup";

describe("Requirement ID Sequencing", () => {
  beforeEach(async () => {
    await createProjectViaAPI("Test Project");
  });

  it("BIZ-SEQ-001: should assign first requirement ID from project nextRequirementId", async () => {
    const response = await fetch(`${BASE_URL}/api/requirements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: "First Requirement", effort: 5 }),
    });

    expect(response.status).toBe(201);

    const projectResponse = await fetch(`${BASE_URL}/api/project`);
    const project = await projectResponse.json();
    expect(project.nextRequirementId).toBe(2);
  });

  it("BIZ-SEQ-002: should increment IDs correctly for sequential requirements", async () => {
    // Create 3 requirements
    for (let i = 1; i <= 3; i++) {
      await fetch(`${BASE_URL}/api/requirements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: `Task ${i}`, effort: i }),
      });
    }

    const projectResponse = await fetch(`${BASE_URL}/api/project`);
    const project = await projectResponse.json();
    expect(project.nextRequirementId).toBe(4);
  });

  it("BIZ-SEQ-003: should not reuse deleted requirement IDs", async () => {
    // Create 3 requirements
    const responses = [];
    for (let i = 1; i <= 3; i++) {
      const res = await fetch(`${BASE_URL}/api/requirements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: `Task ${i}`, effort: i }),
      });
      responses.push(await res.json());
    }

    // Delete the second requirement
    await fetch(`${BASE_URL}/api/requirements/${responses[1].id}`, {
      method: "DELETE",
    });

    // Create a new requirement
    await fetch(`${BASE_URL}/api/requirements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: "New Task", effort: 4 }),
    });

    // Verify nextRequirementId is 5 (not 2)
    const projectResponse = await fetch(`${BASE_URL}/api/project`);
    const project = await projectResponse.json();
    expect(project.nextRequirementId).toBe(5);
  });

  it("BIZ-SEQ-004: should always increment nextRequirementId after create/delete operations", async () => {
    // Create requirement
    const res1 = await fetch(`${BASE_URL}/api/requirements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: "Task 1", effort: 5 }),
    });
    const req1 = await res1.json();

    let projectResponse = await fetch(`${BASE_URL}/api/project`);
    let project = await projectResponse.json();
    expect(project.nextRequirementId).toBe(2);

    // Delete requirement
    await fetch(`${BASE_URL}/api/requirements/${req1.id}`, {
      method: "DELETE",
    });

    projectResponse = await fetch(`${BASE_URL}/api/project`);
    project = await projectResponse.json();
    expect(project.nextRequirementId).toBe(2); // Should still be 2, not reset

    // Create another requirement
    await fetch(`${BASE_URL}/api/requirements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: "Task 2", effort: 3 }),
    });

    projectResponse = await fetch(`${BASE_URL}/api/project`);
    project = await projectResponse.json();
    expect(project.nextRequirementId).toBe(3);
  });
});

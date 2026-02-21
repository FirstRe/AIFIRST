/**
 * Business Logic Tests - Cascade Delete
 * Tests for cascade delete behavior
 */

import {
  BASE_URL,
  createProjectViaAPI,
  createRequirementViaAPI,
} from "../setup";

describe("Cascade Delete Behavior", () => {
  it("BIZ-CAS-001: should delete all requirements when project is deleted", async () => {
    await createProjectViaAPI("Test Project");

    await createRequirementViaAPI("R1", 5);
    await createRequirementViaAPI("R2", 3);
    await createRequirementViaAPI("R3", 2);
    await createRequirementViaAPI("R4", 4);
    await createRequirementViaAPI("R5", 1);

    // Verify 5 requirements exist
    let reqResponse = await fetch(`${BASE_URL}/api/requirements`);
    let requirements = await reqResponse.json();
    expect(requirements).toHaveLength(5);

    // Delete project via API
    await fetch(`${BASE_URL}/api/project`, { method: "DELETE" });

    // Verify all requirements are deleted (will return 404 since no project)
    reqResponse = await fetch(`${BASE_URL}/api/requirements`);
    expect(reqResponse.status).toBe(404);
  });

  it("BIZ-CAS-002: should delete project with no requirements without error", async () => {
    await createProjectViaAPI("Empty Project");

    const response = await fetch(`${BASE_URL}/api/project`, {
      method: "DELETE",
    });

    expect(response.status).toBe(204);

    // Verify project is deleted
    const projectResponse = await fetch(`${BASE_URL}/api/project`);
    expect(projectResponse.status).toBe(404);
  });

  it("BIZ-CAS-003: should not affect project when deleting a single requirement", async () => {
    await createProjectViaAPI("Test Project");

    const req1 = await createRequirementViaAPI("R1", 5);
    const req2 = await createRequirementViaAPI("R2", 3);
    const req3 = await createRequirementViaAPI("R3", 2);

    // Delete one requirement
    await fetch(`${BASE_URL}/api/requirements/${req2.id}`, {
      method: "DELETE",
    });

    // Verify project still exists
    const projectResponse = await fetch(`${BASE_URL}/api/project`);
    const project = await projectResponse.json();
    expect(project.name).toBe("Test Project");

    // Verify only 2 requirements remain
    const reqResponse = await fetch(`${BASE_URL}/api/requirements`);
    const requirements = await reqResponse.json();
    expect(requirements).toHaveLength(2);
  });
});

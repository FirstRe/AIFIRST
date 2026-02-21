/**
 * Business Logic Tests - Single Project Mode
 * Tests for single project constraint
 */

import {
  BASE_URL,
  createProjectViaAPI,
  createRequirementViaAPI,
} from "../setup";

describe("Single Project Mode", () => {
  it("BIZ-SPM-001: should only allow one project at a time", async () => {
    // Create first project
    await fetch(`${BASE_URL}/api/project`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Project A" }),
    });

    // Verify one project exists
    let projectResponse = await fetch(`${BASE_URL}/api/project`);
    let project = await projectResponse.json();
    expect(project.name).toBe("Project A");

    // Create second project
    await fetch(`${BASE_URL}/api/project`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Project B" }),
    });

    // Verify it's the new project
    projectResponse = await fetch(`${BASE_URL}/api/project`);
    project = await projectResponse.json();
    expect(project.name).toBe("Project B");
  });

  it("BIZ-SPM-002: should cascade delete old project requirements when creating new project", async () => {
    // Create first project with requirements
    await fetch(`${BASE_URL}/api/project`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Project A" }),
    });

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

    await fetch(`${BASE_URL}/api/requirements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: "Req 3", effort: 2 }),
    });

    // Verify 3 requirements exist
    let reqResponse = await fetch(`${BASE_URL}/api/requirements`);
    let requirements = await reqResponse.json();
    expect(requirements).toHaveLength(3);

    // Create second project
    await fetch(`${BASE_URL}/api/project`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Project B" }),
    });

    // Verify old requirements are deleted (new project has no requirements)
    reqResponse = await fetch(`${BASE_URL}/api/requirements`);
    requirements = await reqResponse.json();
    expect(requirements).toHaveLength(0);

    // Verify new project has nextRequirementId = 1
    const projectResponse = await fetch(`${BASE_URL}/api/project`);
    const project = await projectResponse.json();
    expect(project.name).toBe("Project B");
    expect(project.nextRequirementId).toBe(1);
  });
});

# Unit Test Cases Document

## Project: Requirement & Effort Tracker MVP

### Document Information

- **Version**: 1.0
- **Last Updated**: 2026-02-11
- **Status**: Draft
- **Related Documents**:
  - [Functional Requirements](./requirement.md)
  - [PostgreSQL Migration Requirements](./requirement-2.md)
  - [Technical Specification](./technical-spec.md)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Test Data Structures](#2-test-data-structures)
3. [Project API Test Cases](#3-project-api-test-cases)
4. [Requirements API Test Cases](#4-requirements-api-test-cases)
5. [Toggle Status API Test Cases](#5-toggle-status-api-test-cases)
6. [Health Check API Test Cases](#6-health-check-api-test-cases)
7. [Validation Test Cases](#7-validation-test-cases)
8. [Business Logic Test Cases](#8-business-logic-test-cases)
9. [Integration Test Cases](#9-integration-test-cases)

---

## 1. Overview

### 1.1 Testing Scope

This document defines comprehensive unit test cases for the Requirement & Effort Tracker application, focusing on:

- **API Endpoint Testing**: All CRUD operations for Project and Requirement entities
- **Validation Testing**: Input validation for all user-provided data
- **Business Logic Testing**: Computed values, constraints, and rules
- **Error Handling Testing**: Edge cases and error scenarios

### 1.2 Testing Standards

| Standard              | Description                                         |
| --------------------- | --------------------------------------------------- |
| **Framework**         | Jest with TypeScript support                        |
| **API Testing**       | Supertest for HTTP endpoint testing                 |
| **Database**          | Test database with Prisma (isolated per test suite) |
| **Coverage Target**   | Minimum 80% code coverage                           |
| **Naming Convention** | `describe` → `it('should...')` pattern              |

### 1.3 Test Environment Setup

```typescript
// tests/setup.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  // Clean database before each test
  await prisma.requirement.deleteMany();
  await prisma.project.deleteMany();
});
```

---

## 2. Test Data Structures

### 2.1 TypeScript Interfaces (Reference)

```typescript
// Based on src/types/index.ts

interface Project {
  id: number;
  name: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  nextRequirementId: number;
}

interface Requirement {
  id: number;
  projectId: number;
  description: string;
  effort: number;
  isActive: boolean;
  createdAt: string; // ISO 8601
}

interface CreateProjectRequest {
  name: string;
}

interface UpdateProjectRequest {
  name?: string;
}

interface CreateRequirementRequest {
  description: string;
  effort: number;
}

interface UpdateRequirementRequest {
  description?: string;
  effort?: number;
  isActive?: boolean;
}

interface ApiErrorResponse {
  error: string;
  details?: string;
}
```

### 2.2 Test Fixtures

```typescript
// tests/fixtures/project.fixtures.ts

export const validProject = {
  name: "Test Project Alpha",
};

export const validProjectMaxLength = {
  name: "A".repeat(100), // Max 100 characters
};

export const invalidProjectEmpty = {
  name: "",
};

export const invalidProjectWhitespace = {
  name: "   ",
};

export const invalidProjectTooLong = {
  name: "A".repeat(101), // Exceeds 100 characters
};
```

```typescript
// tests/fixtures/requirement.fixtures.ts

export const validRequirement = {
  description: "User authentication module",
  effort: 5.5,
};

export const validRequirementMinEffort = {
  description: "Minimal task",
  effort: 0.01,
};

export const validRequirementMaxEffort = {
  description: "Large task",
  effort: 9999,
};

export const invalidRequirementEmptyDescription = {
  description: "",
  effort: 5,
};

export const invalidRequirementZeroEffort = {
  description: "Valid description",
  effort: 0,
};

export const invalidRequirementNegativeEffort = {
  description: "Valid description",
  effort: -1,
};

export const invalidRequirementExceedsMaxEffort = {
  description: "Valid description",
  effort: 10000,
};

export const invalidRequirementTooManyDecimals = {
  description: "Valid description",
  effort: 5.555,
};
```

---

## 3. Project API Test Cases

### 3.1 GET /api/project - Retrieve Project

| Test ID     | Test Case                          | Input                       | Expected Output                                                       | Status Code |
| ----------- | ---------------------------------- | --------------------------- | --------------------------------------------------------------------- | ----------- |
| PRJ-GET-001 | Get existing project               | None (project exists in DB) | Project object with id, name, createdAt, updatedAt, nextRequirementId | 200         |
| PRJ-GET-002 | Get project when none exists       | None (empty DB)             | `{ error: "No project found" }`                                       | 404         |
| PRJ-GET-003 | Get project returns ISO 8601 dates | None                        | createdAt and updatedAt in ISO 8601 format                            | 200         |

```typescript
// tests/api/project.get.test.ts
describe("GET /api/project", () => {
  it("should return existing project with all fields", async () => {
    // Arrange: Create a project
    await prisma.project.create({
      data: { name: "Test Project", nextRequirementId: 1 },
    });

    // Act
    const response = await request(app).get("/api/project");

    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: expect.any(Number),
      name: "Test Project",
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      nextRequirementId: 1,
    });
  });

  it("should return 404 when no project exists", async () => {
    const response = await request(app).get("/api/project");

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("No project found");
  });
});
```

### 3.2 POST /api/project - Create Project

| Test ID      | Test Case                                         | Input                               | Expected Output                                          | Status Code |
| ------------ | ------------------------------------------------- | ----------------------------------- | -------------------------------------------------------- | ----------- |
| PRJ-POST-001 | Create project with valid name                    | `{ name: "My Project" }`            | Project object with generated id                         | 201         |
| PRJ-POST-002 | Create project with max length name (100 chars)   | `{ name: "A".repeat(100) }`         | Project object                                           | 201         |
| PRJ-POST-003 | Create project with empty name                    | `{ name: "" }`                      | `{ error: "Project name is required" }`                  | 400         |
| PRJ-POST-004 | Create project with whitespace-only name          | `{ name: "   " }`                   | `{ error: "Project name cannot be empty" }`              | 400         |
| PRJ-POST-005 | Create project with name exceeding 100 chars      | `{ name: "A".repeat(101) }`         | `{ error: "Project name cannot exceed 100 characters" }` | 400         |
| PRJ-POST-006 | Create project without name field                 | `{}`                                | `{ error: "Project name is required" }`                  | 400         |
| PRJ-POST-007 | Create project deletes existing project           | Valid name (existing project in DB) | New project created, old project deleted                 | 201         |
| PRJ-POST-008 | Create project initializes nextRequirementId to 1 | Valid name                          | `nextRequirementId: 1`                                   | 201         |
| PRJ-POST-009 | Create project trims whitespace from name         | `{ name: "  My Project  " }`        | `name: "My Project"`                                     | 201         |

```typescript
// tests/api/project.post.test.ts
describe("POST /api/project", () => {
  it("should create project with valid name", async () => {
    const response = await request(app)
      .post("/api/project")
      .send({ name: "My Project" });

    expect(response.status).toBe(201);
    expect(response.body.name).toBe("My Project");
    expect(response.body.nextRequirementId).toBe(1);
  });

  it("should reject empty project name", async () => {
    const response = await request(app).post("/api/project").send({ name: "" });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Project name is required");
  });

  it("should delete existing project when creating new one", async () => {
    // Create initial project
    await prisma.project.create({ data: { name: "Old Project" } });

    // Create new project
    const response = await request(app)
      .post("/api/project")
      .send({ name: "New Project" });

    expect(response.status).toBe(201);

    // Verify only one project exists
    const count = await prisma.project.count();
    expect(count).toBe(1);
  });
});
```

### 3.3 PUT /api/project - Update Project

| Test ID     | Test Case                                    | Input                       | Expected Output                                          | Status Code |
| ----------- | -------------------------------------------- | --------------------------- | -------------------------------------------------------- | ----------- |
| PRJ-PUT-001 | Update project name with valid value         | `{ name: "Updated Name" }`  | Updated project object                                   | 200         |
| PRJ-PUT-002 | Update project with empty name               | `{ name: "" }`              | `{ error: "Project name is required" }`                  | 400         |
| PRJ-PUT-003 | Update project with name exceeding 100 chars | `{ name: "A".repeat(101) }` | `{ error: "Project name cannot exceed 100 characters" }` | 400         |
| PRJ-PUT-004 | Update project when none exists              | `{ name: "Name" }`          | `{ error: "No project found" }`                          | 404         |
| PRJ-PUT-005 | Update project updates updatedAt timestamp   | Valid name                  | updatedAt > createdAt                                    | 200         |
| PRJ-PUT-006 | Update project preserves nextRequirementId   | Valid name                  | nextRequirementId unchanged                              | 200         |

```typescript
// tests/api/project.put.test.ts
describe("PUT /api/project", () => {
  it("should update project name", async () => {
    await prisma.project.create({ data: { name: "Original" } });

    const response = await request(app)
      .put("/api/project")
      .send({ name: "Updated" });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe("Updated");
  });

  it("should return 404 when no project exists", async () => {
    const response = await request(app)
      .put("/api/project")
      .send({ name: "Name" });

    expect(response.status).toBe(404);
  });

  it("should preserve nextRequirementId on update", async () => {
    await prisma.project.create({
      data: { name: "Original", nextRequirementId: 5 },
    });

    const response = await request(app)
      .put("/api/project")
      .send({ name: "Updated" });

    expect(response.body.nextRequirementId).toBe(5);
  });
});
```

### 3.4 DELETE /api/project - Delete Project

| Test ID     | Test Case                               | Input                            | Expected Output                      | Status Code |
| ----------- | --------------------------------------- | -------------------------------- | ------------------------------------ | ----------- |
| PRJ-DEL-001 | Delete existing project                 | None (project exists)            | Empty response                       | 204         |
| PRJ-DEL-002 | Delete project cascades to requirements | None (project with requirements) | Project and all requirements deleted | 204         |
| PRJ-DEL-003 | Delete when no project exists           | None (empty DB)                  | Empty response (idempotent)          | 204         |

```typescript
// tests/api/project.delete.test.ts
describe("DELETE /api/project", () => {
  it("should delete project and cascade to requirements", async () => {
    // Create project with requirements
    const project = await prisma.project.create({
      data: { name: "Test" },
    });
    await prisma.requirement.create({
      data: {
        projectId: project.id,
        description: "Test Req",
        effort: 5,
      },
    });

    const response = await request(app).delete("/api/project");

    expect(response.status).toBe(204);

    // Verify cascade delete
    const reqCount = await prisma.requirement.count();
    expect(reqCount).toBe(0);
  });
});
```

---

## 4. Requirements API Test Cases

### 4.1 GET /api/requirements - List All Requirements

| Test ID     | Test Case                               | Input                     | Expected Output                                                              | Status Code |
| ----------- | --------------------------------------- | ------------------------- | ---------------------------------------------------------------------------- | ----------- |
| REQ-GET-001 | Get all requirements for project        | None (requirements exist) | Array of requirement objects                                                 | 200         |
| REQ-GET-002 | Get requirements when none exist        | None (empty)              | Empty array `[]`                                                             | 200         |
| REQ-GET-003 | Get requirements when no project exists | None (no project)         | `{ error: "No project found" }`                                              | 404         |
| REQ-GET-004 | Get requirements returns correct order  | None                      | Requirements ordered by id ASC                                               | 200         |
| REQ-GET-005 | Get requirements includes all fields    | None                      | Each requirement has id, projectId, description, effort, isActive, createdAt | 200         |

```typescript
// tests/api/requirements.get.test.ts
describe("GET /api/requirements", () => {
  it("should return all requirements for project", async () => {
    const project = await prisma.project.create({ data: { name: "Test" } });
    await prisma.requirement.createMany({
      data: [
        { projectId: project.id, description: "Req 1", effort: 5 },
        { projectId: project.id, description: "Req 2", effort: 3 },
      ],
    });

    const response = await request(app).get("/api/requirements");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });

  it("should return empty array when no requirements", async () => {
    await prisma.project.create({ data: { name: "Test" } });

    const response = await request(app).get("/api/requirements");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it("should return 404 when no project exists", async () => {
    const response = await request(app).get("/api/requirements");

    expect(response.status).toBe(404);
  });
});
```

### 4.2 POST /api/requirements - Create Requirement

| Test ID      | Test Case                                          | Input                                         | Expected Output                                          | Status Code |
| ------------ | -------------------------------------------------- | --------------------------------------------- | -------------------------------------------------------- | ----------- |
| REQ-POST-001 | Create requirement with valid data                 | `{ description: "Auth", effort: 5.5 }`        | Requirement object with isActive: true                   | 201         |
| REQ-POST-002 | Create requirement with min effort (0.01)          | `{ description: "Task", effort: 0.01 }`       | Requirement object                                       | 201         |
| REQ-POST-003 | Create requirement with max effort (9999)          | `{ description: "Task", effort: 9999 }`       | Requirement object                                       | 201         |
| REQ-POST-004 | Create requirement with empty description          | `{ description: "", effort: 5 }`              | `{ error: "Requirement description is required" }`       | 400         |
| REQ-POST-005 | Create requirement with whitespace description     | `{ description: "   ", effort: 5 }`           | `{ error: "Requirement description cannot be empty" }`   | 400         |
| REQ-POST-006 | Create requirement with description > 500 chars    | `{ description: "A".repeat(501), effort: 5 }` | `{ error: "Description cannot exceed 500 characters" }`  | 400         |
| REQ-POST-007 | Create requirement with zero effort                | `{ description: "Task", effort: 0 }`          | `{ error: "Effort must be greater than zero" }`          | 400         |
| REQ-POST-008 | Create requirement with negative effort            | `{ description: "Task", effort: -1 }`         | `{ error: "Effort must be greater than zero" }`          | 400         |
| REQ-POST-009 | Create requirement with effort > 9999              | `{ description: "Task", effort: 10000 }`      | `{ error: "Effort cannot exceed 9999" }`                 | 400         |
| REQ-POST-010 | Create requirement with > 2 decimal places         | `{ description: "Task", effort: 5.555 }`      | `{ error: "Effort can have at most 2 decimal places" }`  | 400         |
| REQ-POST-011 | Create requirement when no project exists          | Valid data                                    | `{ error: "No project found. Create a project first." }` | 404         |
| REQ-POST-012 | Create requirement increments nextRequirementId    | Valid data                                    | Project's nextRequirementId incremented                  | 201         |
| REQ-POST-013 | Create requirement defaults isActive to true       | Valid data                                    | `isActive: true`                                         | 201         |
| REQ-POST-014 | Create requirement normalizes effort to 2 decimals | `{ description: "Task", effort: 5.1 }`        | `effort: 5.1` (stored as DECIMAL(6,2))                   | 201         |

```typescript
// tests/api/requirements.post.test.ts
describe("POST /api/requirements", () => {
  let project: Project;

  beforeEach(async () => {
    project = await prisma.project.create({
      data: { name: "Test Project", nextRequirementId: 1 },
    });
  });

  it("should create requirement with valid data", async () => {
    const response = await request(app)
      .post("/api/requirements")
      .send({ description: "User Authentication", effort: 5.5 });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      description: "User Authentication",
      effort: 5.5,
      isActive: true,
    });
  });

  it("should reject empty description", async () => {
    const response = await request(app)
      .post("/api/requirements")
      .send({ description: "", effort: 5 });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Requirement description is required");
  });

  it("should reject effort with more than 2 decimal places", async () => {
    const response = await request(app)
      .post("/api/requirements")
      .send({ description: "Task", effort: 5.555 });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe(
      "Effort can have at most 2 decimal places",
    );
  });

  it("should increment nextRequirementId", async () => {
    await request(app)
      .post("/api/requirements")
      .send({ description: "Task 1", effort: 5 });

    const updatedProject = await prisma.project.findFirst();
    expect(updatedProject?.nextRequirementId).toBe(2);
  });
});
```

### 4.3 GET /api/requirements/[id] - Get Single Requirement

| Test ID     | Test Case                            | Input     | Expected Output                       | Status Code |
| ----------- | ------------------------------------ | --------- | ------------------------------------- | ----------- |
| REQ-GID-001 | Get existing requirement by ID       | Valid ID  | Requirement object                    | 200         |
| REQ-GID-002 | Get requirement with non-existent ID | ID: 99999 | `{ error: "Requirement not found" }`  | 404         |
| REQ-GID-003 | Get requirement with invalid ID      | ID: "abc" | `{ error: "Invalid requirement ID" }` | 400         |
| REQ-GID-004 | Get requirement with negative ID     | ID: -1    | `{ error: "Invalid requirement ID" }` | 400         |

```typescript
// tests/api/requirements.getById.test.ts
describe("GET /api/requirements/[id]", () => {
  it("should return requirement by ID", async () => {
    const project = await prisma.project.create({ data: { name: "Test" } });
    const requirement = await prisma.requirement.create({
      data: { projectId: project.id, description: "Auth", effort: 5 },
    });

    const response = await request(app).get(
      `/api/requirements/${requirement.id}`,
    );

    expect(response.status).toBe(200);
    expect(response.body.description).toBe("Auth");
  });

  it("should return 404 for non-existent requirement", async () => {
    const response = await request(app).get("/api/requirements/99999");

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Requirement not found");
  });
});
```

### 4.4 PUT /api/requirements/[id] - Update Requirement

| Test ID     | Test Case                           | Input                                         | Expected Output                                         | Status Code |
| ----------- | ----------------------------------- | --------------------------------------------- | ------------------------------------------------------- | ----------- |
| REQ-PUT-001 | Update requirement description      | `{ description: "Updated" }`                  | Updated requirement object                              | 200         |
| REQ-PUT-002 | Update requirement effort           | `{ effort: 10.5 }`                            | Updated requirement object                              | 200         |
| REQ-PUT-003 | Update both description and effort  | `{ description: "New", effort: 8 }`           | Updated requirement object                              | 200         |
| REQ-PUT-004 | Update with empty description       | `{ description: "" }`                         | `{ error: "Requirement description is required" }`      | 400         |
| REQ-PUT-005 | Update with invalid effort (zero)   | `{ effort: 0 }`                               | `{ error: "Effort must be greater than zero" }`         | 400         |
| REQ-PUT-006 | Update with invalid effort (> 9999) | `{ effort: 10000 }`                           | `{ error: "Effort cannot exceed 9999" }`                | 400         |
| REQ-PUT-007 | Update non-existent requirement     | Valid data, ID: 99999                         | `{ error: "Requirement not found" }`                    | 404         |
| REQ-PUT-008 | Update preserves isActive status    | `{ description: "New" }` (isActive was false) | `isActive: false` preserved                             | 200         |
| REQ-PUT-009 | Update updates updatedAt timestamp  | Valid data                                    | updatedAt > original updatedAt                          | 200         |
| REQ-PUT-010 | Update with description > 500 chars | `{ description: "A".repeat(501) }`            | `{ error: "Description cannot exceed 500 characters" }` | 400         |

```typescript
// tests/api/requirements.put.test.ts
describe("PUT /api/requirements/[id]", () => {
  let project: Project;
  let requirement: Requirement;

  beforeEach(async () => {
    project = await prisma.project.create({ data: { name: "Test" } });
    requirement = await prisma.requirement.create({
      data: { projectId: project.id, description: "Original", effort: 5 },
    });
  });

  it("should update requirement description", async () => {
    const response = await request(app)
      .put(`/api/requirements/${requirement.id}`)
      .send({ description: "Updated Description" });

    expect(response.status).toBe(200);
    expect(response.body.description).toBe("Updated Description");
  });

  it("should update requirement effort", async () => {
    const response = await request(app)
      .put(`/api/requirements/${requirement.id}`)
      .send({ effort: 10.5 });

    expect(response.status).toBe(200);
    expect(response.body.effort).toBe(10.5);
  });

  it("should preserve isActive when updating other fields", async () => {
    await prisma.requirement.update({
      where: { id: requirement.id },
      data: { isActive: false },
    });

    const response = await request(app)
      .put(`/api/requirements/${requirement.id}`)
      .send({ description: "Updated" });

    expect(response.body.isActive).toBe(false);
  });
});
```

### 4.5 DELETE /api/requirements/[id] - Delete Requirement

| Test ID     | Test Case                               | Input     | Expected Output                       | Status Code |
| ----------- | --------------------------------------- | --------- | ------------------------------------- | ----------- |
| REQ-DEL-001 | Delete existing requirement             | Valid ID  | Empty response                        | 204         |
| REQ-DEL-002 | Delete non-existent requirement         | ID: 99999 | `{ error: "Requirement not found" }`  | 404         |
| REQ-DEL-003 | Delete with invalid ID                  | ID: "abc" | `{ error: "Invalid requirement ID" }` | 400         |
| REQ-DEL-004 | Delete preserves other requirements     | Valid ID  | Other requirements unchanged          | 204         |
| REQ-DEL-005 | Delete does not reset nextRequirementId | Valid ID  | Project's nextRequirementId unchanged | 204         |

```typescript
// tests/api/requirements.delete.test.ts
describe("DELETE /api/requirements/[id]", () => {
  it("should delete requirement by ID", async () => {
    const project = await prisma.project.create({ data: { name: "Test" } });
    const requirement = await prisma.requirement.create({
      data: { projectId: project.id, description: "To Delete", effort: 5 },
    });

    const response = await request(app).delete(
      `/api/requirements/${requirement.id}`,
    );

    expect(response.status).toBe(204);

    const deleted = await prisma.requirement.findUnique({
      where: { id: requirement.id },
    });
    expect(deleted).toBeNull();
  });

  it("should return 404 for non-existent requirement", async () => {
    const response = await request(app).delete("/api/requirements/99999");

    expect(response.status).toBe(404);
  });

  it("should not affect other requirements", async () => {
    const project = await prisma.project.create({ data: { name: "Test" } });
    const req1 = await prisma.requirement.create({
      data: { projectId: project.id, description: "Req 1", effort: 5 },
    });
    const req2 = await prisma.requirement.create({
      data: { projectId: project.id, description: "Req 2", effort: 3 },
    });

    await request(app).delete(`/api/requirements/${req1.id}`);

    const remaining = await prisma.requirement.findUnique({
      where: { id: req2.id },
    });
    expect(remaining).not.toBeNull();
  });
});
```

### 4.6 PATCH /api/requirements/[id]/toggle - Toggle Requirement Status

| Test ID     | Test Case                             | Input                | Expected Output                       | Status Code |
| ----------- | ------------------------------------- | -------------------- | ------------------------------------- | ----------- |
| REQ-TOG-001 | Toggle active requirement to inactive | ID (isActive: true)  | `isActive: false`                     | 200         |
| REQ-TOG-002 | Toggle inactive requirement to active | ID (isActive: false) | `isActive: true`                      | 200         |
| REQ-TOG-003 | Toggle non-existent requirement       | ID: 99999            | `{ error: "Requirement not found" }`  | 404         |
| REQ-TOG-004 | Toggle with invalid ID                | ID: "abc"            | `{ error: "Invalid requirement ID" }` | 400         |
| REQ-TOG-005 | Toggle preserves other fields         | Valid ID             | description and effort unchanged      | 200         |
| REQ-TOG-006 | Toggle updates updatedAt timestamp    | Valid ID             | updatedAt > original updatedAt        | 200         |

```typescript
// tests/api/requirements.toggle.test.ts
describe("PATCH /api/requirements/[id]/toggle", () => {
  it("should toggle active requirement to inactive", async () => {
    const project = await prisma.project.create({ data: { name: "Test" } });
    const requirement = await prisma.requirement.create({
      data: {
        projectId: project.id,
        description: "Task",
        effort: 5,
        isActive: true,
      },
    });

    const response = await request(app).patch(
      `/api/requirements/${requirement.id}/toggle`,
    );

    expect(response.status).toBe(200);
    expect(response.body.isActive).toBe(false);
  });

  it("should toggle inactive requirement to active", async () => {
    const project = await prisma.project.create({ data: { name: "Test" } });
    const requirement = await prisma.requirement.create({
      data: {
        projectId: project.id,
        description: "Task",
        effort: 5,
        isActive: false,
      },
    });

    const response = await request(app).patch(
      `/api/requirements/${requirement.id}/toggle`,
    );

    expect(response.status).toBe(200);
    expect(response.body.isActive).toBe(true);
  });

  it("should preserve other fields when toggling", async () => {
    const project = await prisma.project.create({ data: { name: "Test" } });
    const requirement = await prisma.requirement.create({
      data: {
        projectId: project.id,
        description: "Original",
        effort: 7.5,
        isActive: true,
      },
    });

    const response = await request(app).patch(
      `/api/requirements/${requirement.id}/toggle`,
    );

    expect(response.body.description).toBe("Original");
    expect(response.body.effort).toBe(7.5);
  });
});
```

---

## 5. Health Check API Test Cases

### 5.1 GET /api/health - Health Check Endpoint

| Test ID     | Test Case                     | Input | Expected Output                   | Status Code |
| ----------- | ----------------------------- | ----- | --------------------------------- | ----------- |
| HLT-GET-001 | Health check returns OK       | None  | `{ status: "ok" }` or similar     | 200         |
| HLT-GET-002 | Health check verifies DB conn | None  | Response includes database status | 200         |

```typescript
// tests/api/health.test.ts
describe("GET /api/health", () => {
  it("should return healthy status", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
  });
});
```

---

## 6. Business Logic Test Cases

### 6.1 Total Active Effort Calculation

| Test ID     | Test Case                                   | Setup                                                | Expected Result                 |
| ----------- | ------------------------------------------- | ---------------------------------------------------- | ------------------------------- |
| BIZ-EFF-001 | Calculate total effort with all active      | 3 requirements: effort 5, 3, 2 (all isActive)        | Total = 10                      |
| BIZ-EFF-002 | Calculate total effort with mixed status    | 3 requirements: 5 (active), 3 (inactive), 2 (active) | Total = 7 (excludes inactive)   |
| BIZ-EFF-003 | Calculate total effort with none active     | 2 requirements: both inactive                        | Total = 0                       |
| BIZ-EFF-004 | Calculate total effort with no requirements | Empty requirements list                              | Total = 0                       |
| BIZ-EFF-005 | Decimal precision in total calculation      | 2 requirements: 5.55 and 3.45                        | Total = 9.00 (2 decimal places) |

```typescript
// tests/business/effort-calculation.test.ts
describe("Total Active Effort Calculation", () => {
  it("should sum only active requirements", async () => {
    const project = await prisma.project.create({ data: { name: "Test" } });
    await prisma.requirement.createMany({
      data: [
        { projectId: project.id, description: "R1", effort: 5, isActive: true },
        {
          projectId: project.id,
          description: "R2",
          effort: 3,
          isActive: false,
        },
        { projectId: project.id, description: "R3", effort: 2, isActive: true },
      ],
    });

    const requirements = await prisma.requirement.findMany({
      where: { projectId: project.id, isActive: true },
    });

    const totalEffort = requirements.reduce(
      (sum, req) => sum + Number(req.effort),
      0,
    );
    expect(totalEffort).toBe(7);
  });
});
```

### 6.2 Requirement ID Sequencing

| Test ID     | Test Case                                   | Setup                                | Expected Result                     |
| ----------- | ------------------------------------------- | ------------------------------------ | ----------------------------------- |
| BIZ-SEQ-001 | First requirement gets ID from project      | Project with nextRequirementId: 1    | Requirement ID matches pattern      |
| BIZ-SEQ-002 | Sequential IDs increment correctly          | Create 3 requirements                | nextRequirementId increments to 4   |
| BIZ-SEQ-003 | Deleted requirement ID is not reused        | Create 3 reqs, delete #2, create new | New req gets ID 4, not 2            |
| BIZ-SEQ-004 | Project tracks nextRequirementId accurately | Multiple create/delete operations    | nextRequirementId always increments |

```typescript
// tests/business/requirement-sequencing.test.ts
describe("Requirement ID Sequencing", () => {
  it("should never reuse deleted requirement IDs", async () => {
    const project = await prisma.project.create({
      data: { name: "Test", nextRequirementId: 1 },
    });

    // Create 3 requirements
    const req1 = await createRequirement(project.id);
    const req2 = await createRequirement(project.id);
    const req3 = await createRequirement(project.id);

    // Delete requirement 2
    await prisma.requirement.delete({ where: { id: req2.id } });

    // Create new requirement
    const req4 = await createRequirement(project.id);

    // Verify nextRequirementId is 5 (not 2)
    const updatedProject = await prisma.project.findUnique({
      where: { id: project.id },
    });
    expect(updatedProject?.nextRequirementId).toBe(5);
  });
});
```

### 6.3 Cascade Delete Behavior

| Test ID     | Test Case                                 | Setup                       | Expected Result                    |
| ----------- | ----------------------------------------- | --------------------------- | ---------------------------------- |
| BIZ-CAS-001 | Delete project removes all requirements   | Project with 5 requirements | All 5 requirements deleted         |
| BIZ-CAS-002 | Delete project with no requirements       | Project with 0 requirements | Project deleted, no errors         |
| BIZ-CAS-003 | Delete requirement doesn't affect project | Project with 3 requirements | Project remains after req deletion |

```typescript
// tests/business/cascade-delete.test.ts
describe("Cascade Delete Behavior", () => {
  it("should delete all requirements when project is deleted", async () => {
    const project = await prisma.project.create({ data: { name: "Test" } });
    await prisma.requirement.createMany({
      data: [
        { projectId: project.id, description: "R1", effort: 5 },
        { projectId: project.id, description: "R2", effort: 3 },
        { projectId: project.id, description: "R3", effort: 2 },
      ],
    });

    await prisma.project.delete({ where: { id: project.id } });

    const orphanedReqs = await prisma.requirement.findMany({
      where: { projectId: project.id },
    });
    expect(orphanedReqs).toHaveLength(0);
  });
});
```

### 6.4 Single Project Mode

| Test ID     | Test Case                                              | Setup                           | Expected Result          |
| ----------- | ------------------------------------------------------ | ------------------------------- | ------------------------ |
| BIZ-SPM-001 | Only one project can exist at a time                   | Create project A then B         | Only project B exists    |
| BIZ-SPM-002 | New project cascade deletes old project's requirements | Project A with 3 reqs, create B | A's requirements deleted |

```typescript
// tests/business/single-project-mode.test.ts
describe("Single Project Mode", () => {
  it("should only allow one project at a time", async () => {
    // Create first project with requirements
    await request(app).post("/api/project").send({ name: "Project A" });
    await request(app)
      .post("/api/requirements")
      .send({ description: "R1", effort: 5 });

    // Create second project
    await request(app).post("/api/project").send({ name: "Project B" });

    // Verify only one project exists
    const count = await prisma.project.count();
    expect(count).toBe(1);

    // Verify it's the new project
    const project = await prisma.project.findFirst();
    expect(project?.name).toBe("Project B");

    // Verify old requirements are gone
    const reqCount = await prisma.requirement.count();
    expect(reqCount).toBe(0);
  });
});
```

---

## 7. Integration Test Cases

### 7.1 Export/Import Data Flow

| Test ID     | Test Case                           | Setup                             | Expected Result                          |
| ----------- | ----------------------------------- | --------------------------------- | ---------------------------------------- |
| INT-EXP-001 | Export project with requirements    | Project with 3 requirements       | Valid JSON with all data                 |
| INT-EXP-002 | Export project with no requirements | Project only                      | Valid JSON with empty requirements array |
| INT-EXP-003 | Import valid project data           | Valid export JSON                 | Project and requirements created         |
| INT-EXP-004 | Import replaces existing data       | Existing project, import new data | Old data replaced with imported data     |
| INT-EXP-005 | Import with invalid JSON            | Malformed JSON                    | Error: Invalid import data format        |
| INT-EXP-006 | Import with missing required fields | JSON missing projectName          | Error: Project name is required          |

```typescript
// tests/integration/export-import.test.ts
describe("Export/Import Data Flow", () => {
  it("should export and reimport data correctly", async () => {
    // Create project with requirements
    await request(app).post("/api/project").send({ name: "Original Project" });
    await request(app)
      .post("/api/requirements")
      .send({ description: "R1", effort: 5 });
    await request(app)
      .post("/api/requirements")
      .send({ description: "R2", effort: 3 });

    // Export data
    const exportResponse = await request(app).get("/api/export");
    const exportData = exportResponse.body;

    // Delete project
    await request(app).delete("/api/project");

    // Import data back
    await request(app).post("/api/import").send(exportData);

    // Verify data restored
    const project = await prisma.project.findFirst();
    expect(project?.name).toBe("Original Project");

    const requirements = await prisma.requirement.findMany();
    expect(requirements).toHaveLength(2);
  });
});
```

### 7.2 Multi-Requirement Operations

| Test ID     | Test Case                            | Setup          | Expected Result                          |
| ----------- | ------------------------------------ | -------------- | ---------------------------------------- |
| INT-MRO-001 | Create multiple requirements rapidly | Project exists | All requirements created with unique IDs |
| INT-MRO-002 | Toggle multiple requirements         | 5 requirements | Each toggle affects only target req      |
| INT-MRO-003 | Update multiple requirements         | 3 requirements | Each update independent                  |
| INT-MRO-004 | Delete all requirements one by one   | 5 requirements | Project remains, nextRequirementId = 6   |

```typescript
// tests/integration/multi-requirement.test.ts
describe("Multi-Requirement Operations", () => {
  it("should handle rapid requirement creation", async () => {
    await prisma.project.create({
      data: { name: "Test", nextRequirementId: 1 },
    });

    // Create 10 requirements rapidly
    const promises = Array.from({ length: 10 }, (_, i) =>
      request(app)
        .post("/api/requirements")
        .send({ description: `Req ${i + 1}`, effort: i + 1 }),
    );

    await Promise.all(promises);

    const requirements = await prisma.requirement.findMany();
    expect(requirements).toHaveLength(10);

    const project = await prisma.project.findFirst();
    expect(project?.nextRequirementId).toBe(11);
  });
});
```

---

## 8. Test Data Fixtures

### 8.1 Sample Test Data

```typescript
// tests/fixtures/testData.ts
export const sampleProject = {
  name: "Sample Project",
  nextRequirementId: 1,
};

export const sampleRequirements = [
  { description: "User Authentication", effort: 8.5, isActive: true },
  { description: "Database Setup", effort: 5.0, isActive: true },
  { description: "API Development", effort: 13.0, isActive: true },
  { description: "UI Components", effort: 21.0, isActive: false },
  { description: "Testing", effort: 8.0, isActive: true },
];

export const invalidInputs = {
  emptyName: { name: "" },
  longName: { name: "A".repeat(101) },
  whitespaceOnly: { name: "   " },
  emptyDescription: { description: "", effort: 5 },
  longDescription: { description: "A".repeat(501), effort: 5 },
  zeroEffort: { description: "Task", effort: 0 },
  negativeEffort: { description: "Task", effort: -1 },
  exceedingEffort: { description: "Task", effort: 10000 },
  tooManyDecimals: { description: "Task", effort: 5.555 },
};
```

### 8.2 Test Database Setup

```typescript
// tests/setup.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

beforeEach(async () => {
  // Clean database before each test
  await prisma.requirement.deleteMany();
  await prisma.project.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

export { prisma };
```

---

## 9. Test Execution Guidelines

### 9.1 Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/api/project.test.ts

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch

# Run only unit tests
npm test -- --testPathPattern="unit"

# Run only integration tests
npm test -- --testPathPattern="integration"
```

### 9.2 Test Environment Configuration

```env
# .env.test
DATABASE_URL="postgresql://user:password@localhost:5432/test_db"
NODE_ENV="test"
```

### 9.3 CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test_db
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
      - run: npm ci
      - run: npx prisma migrate deploy
      - run: npm test -- --coverage
```

---

## 10. Test Coverage Requirements

### 10.1 Minimum Coverage Targets

| Category         | Target | Description                         |
| ---------------- | ------ | ----------------------------------- |
| Statements       | 80%    | Overall code statement coverage     |
| Branches         | 75%    | Decision branch coverage            |
| Functions        | 80%    | Function-level coverage             |
| Lines            | 80%    | Line-by-line coverage               |
| API Routes       | 100%   | All API endpoints must be tested    |
| Validation Logic | 100%   | All validation rules must be tested |
| Business Logic   | 90%    | Core business rules coverage        |

### 10.2 Test Case Summary

| Section           | Test Cases | Priority |
| ----------------- | ---------- | -------- |
| Project API       | 21         | High     |
| Requirements API  | 39         | High     |
| Health Check API  | 2          | Medium   |
| Business Logic    | 14         | High     |
| Integration Tests | 10         | Medium   |
| **Total**         | **86**     | -        |

---

## Appendix A: Error Message Reference

| Error Code | Message                                   | HTTP Status |
| ---------- | ----------------------------------------- | ----------- |
| E001       | Project name is required                  | 400         |
| E002       | Project name cannot be empty              | 400         |
| E003       | Project name cannot exceed 100 characters | 400         |
| E004       | No project found                          | 404         |
| E005       | Requirement description is required       | 400         |
| E006       | Requirement description cannot be empty   | 400         |
| E007       | Description cannot exceed 500 characters  | 400         |
| E008       | Effort must be greater than zero          | 400         |
| E009       | Effort cannot exceed 9999                 | 400         |
| E010       | Effort can have at most 2 decimal places  | 400         |
| E011       | Requirement not found                     | 404         |
| E012       | Invalid requirement ID                    | 400         |
| E013       | No project found. Create a project first. | 404         |

---

## Appendix B: Database Constraints Reference

| Field                   | Type         | Constraints                     |
| ----------------------- | ------------ | ------------------------------- |
| Project.name            | VARCHAR(100) | NOT NULL, 1-100 chars, trimmed  |
| Requirement.description | VARCHAR(500) | NOT NULL, 1-500 chars, trimmed  |
| Requirement.effort      | DECIMAL(6,2) | NOT NULL, 0.01-9999, 2 decimals |
| Requirement.isActive    | BOOLEAN      | NOT NULL, default: true         |

---

_Document Version: 1.0_
_Last Updated: 2026-02-11_
_Author: AI Assistant_

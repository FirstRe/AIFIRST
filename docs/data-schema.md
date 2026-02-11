# Data Schema Design

## Project: Requirement & Effort Tracker MVP

### Document Information

- **Version**: 1.0
- **Last Updated**: 2026-02-11
- **Related Document**: [Functional Requirements](./requirement.md)

---

## 1. Overview

### 1.1 Storage Strategy

This application uses the browser's **Local Storage API** for data persistence. Local Storage provides:

- Persistent storage across browser sessions
- Simple key-value storage interface
- Approximately 5-10 MB storage capacity (browser-dependent)
- Synchronous API for immediate read/write operations

### 1.2 Serialization Approach

Since Local Storage only stores strings, all data structures are serialized using **JSON**:

- **Write**: `localStorage.setItem(key, JSON.stringify(data))`
- **Read**: `JSON.parse(localStorage.getItem(key))`

### 1.3 Key Namespace

All keys are prefixed with `ret_` (Requirement Effort Tracker) to avoid conflicts with other applications:

| Key                  | Description                      |
| -------------------- | -------------------------------- |
| `ret_project`        | Project metadata and settings    |
| `ret_requirements`   | Array of all requirement objects |
| `ret_preferences`    | User display preferences         |
| `ret_schema_version` | Schema version for migrations    |

---

## 2. Data Entities

### 2.1 Project Entity

Stores project-level metadata.

**Local Storage Key**: `ret_project`

#### Schema Definition

```typescript
interface Project {
  name: string;
  createdAt: string; // ISO 8601 datetime
  updatedAt: string; // ISO 8601 datetime
  nextRequirementId: number;
}
```

#### Field Specifications

| Field               | Type   | Required | Default | Constraints                          | Description                                   |
| ------------------- | ------ | -------- | ------- | ------------------------------------ | --------------------------------------------- |
| `name`              | string | Yes      | -       | Min: 1 char, Max: 100 chars, trimmed | The project title displayed in the UI         |
| `createdAt`         | string | Yes      | -       | ISO 8601 format                      | Timestamp when project was first created      |
| `updatedAt`         | string | Yes      | -       | ISO 8601 format                      | Timestamp of last modification to any data    |
| `nextRequirementId` | number | Yes      | 1       | Integer, >= 1                        | Counter for generating unique requirement IDs |

#### Example

```json
{
  "name": "Website Redesign Project",
  "createdAt": "2026-02-11T10:30:00.000Z",
  "updatedAt": "2026-02-11T14:45:30.000Z",
  "nextRequirementId": 8
}
```

#### Business Rules

- `nextRequirementId` is incremented each time a requirement is created
- `nextRequirementId` is **never** decremented when requirements are deleted (per BR.2)
- `updatedAt` is refreshed on any data modification

---

### 2.2 Requirement Entity

Stores individual requirement items.

**Local Storage Key**: `ret_requirements`

#### Schema Definition

```typescript
interface Requirement {
  id: number;
  description: string;
  effort: number;
  isActive: boolean;
  createdAt: string; // ISO 8601 datetime
}

// Stored as array
type RequirementsStore = Requirement[];
```

#### Field Specifications

| Field         | Type    | Required | Default | Constraints                                  | Description                                  |
| ------------- | ------- | -------- | ------- | -------------------------------------------- | -------------------------------------------- |
| `id`          | number  | Yes      | -       | Positive integer, unique, immutable          | Sequential identifier (e.g., #1, #2, #3)     |
| `description` | string  | Yes      | -       | Min: 1 char, Max: 500 chars, trimmed         | Text describing the requirement              |
| `effort`      | number  | Yes      | -       | Min: 0.01, Max: 9999, up to 2 decimal places | Numeric effort value                         |
| `isActive`    | boolean | Yes      | `true`  | -                                            | Whether included in total effort calculation |
| `createdAt`   | string  | Yes      | -       | ISO 8601 format                              | Timestamp when requirement was created       |

#### Example

```json
[
  {
    "id": 1,
    "description": "User authentication module",
    "effort": 8,
    "isActive": true,
    "createdAt": "2026-02-11T10:35:00.000Z"
  },
  {
    "id": 2,
    "description": "Dashboard analytics widget",
    "effort": 13.5,
    "isActive": true,
    "createdAt": "2026-02-11T10:40:00.000Z"
  },
  {
    "id": 3,
    "description": "Legacy data migration script",
    "effort": 21,
    "isActive": false,
    "createdAt": "2026-02-11T11:00:00.000Z"
  }
]
```

#### Business Rules

- Array order represents creation order (oldest first, newest last)
- `id` values are never reused, even after deletion
- New requirements are appended to the end of the array
- `isActive` defaults to `true` for new requirements

---

### 2.3 User Preferences Entity

Stores user display preferences.

**Local Storage Key**: `ret_preferences`

#### Schema Definition

```typescript
interface UserPreferences {
  showEffortColumn: boolean;
}
```

#### Field Specifications

| Field              | Type    | Required | Default | Constraints | Description                                  |
| ------------------ | ------- | -------- | ------- | ----------- | -------------------------------------------- |
| `showEffortColumn` | boolean | Yes      | `true`  | -           | Whether effort column is visible in the list |

#### Example

```json
{
  "showEffortColumn": true
}
```

---

### 2.4 Schema Version Entity

Stores the current schema version for future migration support.

**Local Storage Key**: `ret_schema_version`

#### Schema Definition

```typescript
type SchemaVersion = number;
```

#### Field Specifications

| Field   | Type   | Required | Default | Constraints      | Description                   |
| ------- | ------ | -------- | ------- | ---------------- | ----------------------------- |
| (value) | number | Yes      | `1`     | Positive integer | Current schema version number |

#### Example

```json
1
```

#### Purpose

- Enables future schema migrations when data structure changes
- Application checks version on load and runs migrations if needed

---

## 3. Entity Relationships

```
┌─────────────────────────────────────────────────────────────────┐
│                        Local Storage                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐         ┌─────────────────────────────┐   │
│  │     Project     │         │       Requirements          │   │
│  ├─────────────────┤         ├─────────────────────────────┤   │
│  │ name            │ 1    *  │ id                          │   │
│  │ createdAt       │────────▶│ description                 │   │
│  │ updatedAt       │         │ effort                      │   │
│  │ nextRequirementId         │ isActive                    │   │
│  └─────────────────┘         │ createdAt                   │   │
│                              └─────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────┐         ┌─────────────────────────────┐   │
│  │  Preferences    │         │      Schema Version         │   │
│  ├─────────────────┤         ├─────────────────────────────┤   │
│  │ showEffortColumn│         │ (version number)            │   │
│  └─────────────────┘         └─────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Relationship Description

| Relationship           | Type        | Description                                  |
| ---------------------- | ----------- | -------------------------------------------- |
| Project → Requirements | One-to-Many | A project contains zero or more requirements |
| Project ↔ Preferences  | One-to-One  | Each project has one set of user preferences |

**Note**: Since the application operates in single-project mode (BR.4), all entities implicitly belong to the same project context.

---

## 4. Data Operations

### 4.1 CRUD Operations

#### Create Project

```javascript
// Initialize new project
const project = {
  name: "My Project",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  nextRequirementId: 1,
};
localStorage.setItem("ret_project", JSON.stringify(project));
localStorage.setItem("ret_requirements", JSON.stringify([]));
localStorage.setItem(
  "ret_preferences",
  JSON.stringify({ showEffortColumn: true }),
);
localStorage.setItem("ret_schema_version", JSON.stringify(1));
```

#### Add Requirement

```javascript
// Read current state
const project = JSON.parse(localStorage.getItem("ret_project"));
const requirements = JSON.parse(localStorage.getItem("ret_requirements"));

// Create new requirement
const newRequirement = {
  id: project.nextRequirementId,
  description: "New feature description",
  effort: 5.5,
  isActive: true,
  createdAt: new Date().toISOString(),
};

// Update state
requirements.push(newRequirement);
project.nextRequirementId++;
project.updatedAt = new Date().toISOString();

// Persist
localStorage.setItem("ret_requirements", JSON.stringify(requirements));
localStorage.setItem("ret_project", JSON.stringify(project));
```

#### Update Requirement

```javascript
const requirements = JSON.parse(localStorage.getItem("ret_requirements"));
const index = requirements.findIndex((r) => r.id === targetId);

if (index !== -1) {
  requirements[index] = {
    ...requirements[index],
    description: "Updated",
    effort: 10,
  };
  localStorage.setItem("ret_requirements", JSON.stringify(requirements));

  // Update project timestamp
  const project = JSON.parse(localStorage.getItem("ret_project"));
  project.updatedAt = new Date().toISOString();
  localStorage.setItem("ret_project", JSON.stringify(project));
}
```

#### Delete Requirement

```javascript
const requirements = JSON.parse(localStorage.getItem("ret_requirements"));
const filtered = requirements.filter((r) => r.id !== targetId);
localStorage.setItem("ret_requirements", JSON.stringify(filtered));

// Note: nextRequirementId is NOT decremented
```

#### Reset All Data

```javascript
localStorage.removeItem("ret_project");
localStorage.removeItem("ret_requirements");
localStorage.removeItem("ret_preferences");
// Optionally keep schema version
```

### 4.2 Computed Values (Not Stored)

The following values are calculated at runtime and **not persisted**:

| Computed Value      | Calculation                                                                  |
| ------------------- | ---------------------------------------------------------------------------- |
| Total Requirements  | `requirements.length`                                                        |
| Active Count        | `requirements.filter(r => r.isActive).length`                                |
| Inactive Count      | `requirements.filter(r => !r.isActive).length`                               |
| Total Active Effort | `requirements.filter(r => r.isActive).reduce((sum, r) => sum + r.effort, 0)` |

---

## 5. Validation Rules

### 5.1 Project Name Validation

```javascript
function validateProjectName(name) {
  const trimmed = name?.trim() || "";

  if (trimmed.length === 0) {
    return { valid: false, error: "Project name is required" };
  }
  if (trimmed.length > 100) {
    return {
      valid: false,
      error: "Project name must be 100 characters or less",
    };
  }
  return { valid: true, value: trimmed };
}
```

### 5.2 Requirement Description Validation

```javascript
function validateDescription(description) {
  const trimmed = description?.trim() || "";

  if (trimmed.length === 0) {
    return { valid: false, error: "Description is required" };
  }
  if (trimmed.length > 500) {
    return {
      valid: false,
      error: "Description must be 500 characters or less",
    };
  }
  return { valid: true, value: trimmed };
}
```

### 5.3 Effort Validation

```javascript
function validateEffort(effort) {
  const num = parseFloat(effort);

  if (isNaN(num)) {
    return { valid: false, error: "Effort must be a number" };
  }
  if (num <= 0) {
    return { valid: false, error: "Effort must be greater than zero" };
  }
  if (num > 9999) {
    return { valid: false, error: "Effort must be 9999 or less" };
  }

  // Round to 2 decimal places
  const rounded = Math.round(num * 100) / 100;
  return { valid: true, value: rounded };
}
```

---

## 6. Data Integrity & Error Handling

### 6.1 Initialization Check

On application load, verify data integrity:

```javascript
function initializeStorage() {
  const schemaVersion = localStorage.getItem("ret_schema_version");

  // First-time user - no data exists
  if (!schemaVersion) {
    return { isNewUser: true };
  }

  // Returning user - validate and load data
  try {
    const project = JSON.parse(localStorage.getItem("ret_project"));
    const requirements = JSON.parse(localStorage.getItem("ret_requirements"));
    const preferences = JSON.parse(localStorage.getItem("ret_preferences"));

    // Basic structure validation
    if (!project?.name || !Array.isArray(requirements)) {
      throw new Error("Corrupted data structure");
    }

    return { isNewUser: false, project, requirements, preferences };
  } catch (error) {
    // Handle corrupted data - offer to reset
    return { isCorrupted: true, error: error.message };
  }
}
```

### 6.2 Storage Quota Handling

```javascript
function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return { success: true };
  } catch (error) {
    if (error.name === "QuotaExceededError") {
      return { success: false, error: "Storage quota exceeded" };
    }
    throw error;
  }
}
```

---

## 7. Schema Migration Strategy

### 7.1 Version History

| Version | Changes        | Date       |
| ------- | -------------- | ---------- |
| 1       | Initial schema | 2026-02-11 |

### 7.2 Migration Template

```javascript
const migrations = {
  // Example: Migration from version 1 to version 2
  "1_to_2": (data) => {
    // Transform data structure
    return {
      ...data,
      // Add new fields, transform existing ones
    };
  },
};

function migrateData(currentVersion, targetVersion) {
  let version = currentVersion;
  let data = loadAllData();

  while (version < targetVersion) {
    const migrationKey = `${version}_to_${version + 1}`;
    if (migrations[migrationKey]) {
      data = migrations[migrationKey](data);
    }
    version++;
  }

  saveAllData(data);
  localStorage.setItem("ret_schema_version", JSON.stringify(targetVersion));
}
```

---

## 8. Complete Data Example

Full example of all stored data:

```json
// ret_schema_version
1

// ret_project
{
  "name": "Q1 Product Roadmap",
  "createdAt": "2026-02-11T09:00:00.000Z",
  "updatedAt": "2026-02-11T16:30:00.000Z",
  "nextRequirementId": 6
}

// ret_requirements
[
  {
    "id": 1,
    "description": "Implement user onboarding flow with email verification",
    "effort": 13,
    "isActive": true,
    "createdAt": "2026-02-11T09:15:00.000Z"
  },
  {
    "id": 2,
    "description": "Design and build dashboard analytics widgets",
    "effort": 8.5,
    "isActive": true,
    "createdAt": "2026-02-11T09:20:00.000Z"
  },
  {
    "id": 3,
    "description": "Migrate legacy user data (deferred to Q2)",
    "effort": 21,
    "isActive": false,
    "createdAt": "2026-02-11T10:00:00.000Z"
  },
  {
    "id": 5,
    "description": "API rate limiting implementation",
    "effort": 5,
    "isActive": true,
    "createdAt": "2026-02-11T14:00:00.000Z"
  }
]

// ret_preferences
{
  "showEffortColumn": true
}
```

**Note**: Requirement #4 was deleted, demonstrating that IDs are not reused.

**Computed values for this example**:

- Total Requirements: 4
- Active Requirements: 3
- Inactive Requirements: 1
- Total Active Effort: 26.5 (13 + 8.5 + 5)

---

## 9. Appendix: TypeScript Type Definitions

Complete TypeScript definitions for use in implementation:

```typescript
// ============================================
// Data Schema Types - Requirement Effort Tracker
// ============================================

/**
 * Project metadata and settings
 */
export interface Project {
  /** Project title (1-100 characters) */
  name: string;
  /** ISO 8601 timestamp of project creation */
  createdAt: string;
  /** ISO 8601 timestamp of last modification */
  updatedAt: string;
  /** Counter for generating unique requirement IDs */
  nextRequirementId: number;
}

/**
 * Individual requirement item
 */
export interface Requirement {
  /** Unique sequential identifier (never reused) */
  id: number;
  /** Requirement description (1-500 characters) */
  description: string;
  /** Effort value (0.01-9999, up to 2 decimal places) */
  effort: number;
  /** Whether included in total effort calculation */
  isActive: boolean;
  /** ISO 8601 timestamp of creation */
  createdAt: string;
}

/**
 * User display preferences
 */
export interface UserPreferences {
  /** Whether effort column is visible in requirements list */
  showEffortColumn: boolean;
}

/**
 * Complete application state
 */
export interface AppState {
  project: Project | null;
  requirements: Requirement[];
  preferences: UserPreferences;
  schemaVersion: number;
}

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  PROJECT: "ret_project",
  REQUIREMENTS: "ret_requirements",
  PREFERENCES: "ret_preferences",
  SCHEMA_VERSION: "ret_schema_version",
} as const;

/**
 * Default values
 */
export const DEFAULTS = {
  PREFERENCES: {
    showEffortColumn: true,
  } as UserPreferences,
  SCHEMA_VERSION: 1,
} as const;

/**
 * Validation constraints
 */
export const CONSTRAINTS = {
  PROJECT_NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 100,
  },
  DESCRIPTION: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 500,
  },
  EFFORT: {
    MIN: 0.01,
    MAX: 9999,
    DECIMAL_PLACES: 2,
  },
} as const;
```

---

_End of Document_

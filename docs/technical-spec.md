# Technical Specification Document

## Project: Requirement & Effort Tracker MVP

### Document Information

- **Version**: 2.0
- **Last Updated**: 2026-02-11
- **Status**: Draft
- **Related Documents**:
  - [Functional Requirements](./requirement.md)
  - [PostgreSQL Migration Requirements](./requirement-2.md)
  - [Data Schema](./data-schema.md)
  - [Architecture](./architecture.md)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Project Structure](#2-project-structure)
3. [API Specifications](#3-api-specifications)
4. [Business Logic & Sequence Diagrams](#4-business-logic--sequence-diagrams)
5. [Data Schema](#5-data-schema)
6. [Architecture Diagram](#6-architecture-diagram)
7. [Integration Contracts](#7-integration-contracts)
8. [Development Guidelines](#8-development-guidelines)

---

## 1. Project Overview

### 1.1 Project Summary

The Requirement & Effort Tracker is a lightweight web application that enables users to:

- Create and manage project requirements
- Assign effort values to each requirement
- Toggle requirements between active/inactive status
- Track total effort of active requirements in real-time
- Export/Import project data as JSON files

**Key Characteristics:**

- **No Authentication**: Open access without login requirements
- **Client-Server Architecture**: Frontend communicates with backend API; data stored in PostgreSQL database
- **Single-Project Mode**: One project at a time per database instance
- **Auto-Save**: All changes automatically persisted to database via API
- **Server-Side Persistence**: Data survives browser clearing and is accessible from any device

### 1.2 Technology Stack

#### Frontend

| Category           | Technology                       | Version | Purpose                           |
| ------------------ | -------------------------------- | ------- | --------------------------------- |
| **Framework**      | Next.js                          | 15.5.x  | React framework with App Router   |
| **UI Library**     | React                            | 19.1.x  | Component-based UI                |
| **Language**       | TypeScript                       | 5.x     | Type-safe JavaScript              |
| **Styling**        | Tailwind CSS                     | 4.x     | Utility-first CSS                 |
| **Build Tool**     | Turbopack                        | -       | Fast bundler for Next.js          |
| **Icons**          | Font Awesome                     | 6.4.0   | Icon library                      |
| **Fonts**          | Inter (Google Fonts)             | -       | Primary typeface (English)        |
| **Fonts**          | Noto Sans Thai (Google Fonts)    | -       | Thai language typeface            |
| **i18n Framework** | i18next                          | -       | Internationalization core library |
| **i18n React**     | react-i18next                    | -       | React bindings for i18next        |
| **i18n Detection** | i18next-browser-languagedetector | -       | Automatic language detection      |
| **HTTP Client**    | fetch API                        | -       | Built-in browser API for HTTP     |

#### Backend & Database

| Category            | Technology  | Version | Purpose                             |
| ------------------- | ----------- | ------- | ----------------------------------- |
| **API Framework**   | Next.js API | 15.5.x  | API Routes (App Router)             |
| **Database**        | PostgreSQL  | 16.x    | Relational database for persistence |
| **ORM**             | Prisma      | 6.x     | Type-safe database client           |
| **Package Manager** | npm         | -       | Dependency management               |

#### Database Driver Stack

| Component              | Technology        | Purpose                          |
| ---------------------- | ----------------- | -------------------------------- |
| **Prisma Client**      | @prisma/client    | Type-safe database queries       |
| **Prisma CLI**         | prisma            | Schema management and migrations |
| **PostgreSQL Adapter** | Built into Prisma | PostgreSQL protocol support      |

### 1.3 Development Environment Setup

#### Prerequisites

- Node.js 20.x LTS or higher
- npm 10.x or higher
- Git 2.x or higher
- PostgreSQL 16.x or higher
- VS Code (recommended) with extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript and JavaScript Language Features
  - Prisma (for schema syntax highlighting)

#### Installation Steps

```bash
# 1. Clone the repository
git clone <repository-url>
cd web-starter-kit

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your PostgreSQL connection string

# 4. Initialize the database
npm run db:push       # Push schema to database
# Or for development with migrations:
npm run db:migrate    # Create and apply migrations

# 5. (Optional) Generate Prisma Client
npm run db:generate   # Usually runs automatically after install

# 6. Start development server
npm run dev

# 7. Open in browser
# Navigate to http://localhost:3000
```

#### PostgreSQL Setup

**Option 1: Local Installation**

```bash
# macOS (Homebrew)
brew install postgresql@16
brew services start postgresql@16

# Create database
createdb ret_tracker

# Verify connection
psql -d ret_tracker -c "SELECT version();"
```

**Option 2: Docker**

```bash
# Run PostgreSQL in Docker
docker run --name ret-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=ret_tracker \
  -p 5432:5432 \
  -d postgres:16

# Connection string for .env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ret_tracker"
```

#### Available Scripts

| Script        | Command                | Description                       |
| ------------- | ---------------------- | --------------------------------- |
| `dev`         | `npm run dev`          | Start dev server with Turbopack   |
| `build`       | `npm run build`        | Create production build           |
| `start`       | `npm run start`        | Start production server           |
| `lint`        | `npm run lint`         | Run ESLint for code quality       |
| `db:generate` | `prisma generate`      | Generate Prisma Client            |
| `db:push`     | `prisma db push`       | Push schema changes to database   |
| `db:migrate`  | `prisma migrate dev`   | Create and apply migrations       |
| `db:studio`   | `prisma studio`        | Open Prisma Studio (database GUI) |
| `db:seed`     | `prisma db seed`       | Seed database with initial data   |
| `db:reset`    | `prisma migrate reset` | Reset database (dev only)         |

#### Environment Configuration

Create a `.env` file in the project root (copy from `.env.example`):

```bash
# .env.example

# Database Connection
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ret_tracker"

# Application Settings
NODE_ENV="development"
PORT=3000

# Optional: Enable Prisma query logging
# PRISMA_LOG="query,info,warn,error"
```

**Environment Variables Reference:**

| Variable       | Required | Default       | Description                               |
| -------------- | -------- | ------------- | ----------------------------------------- |
| `DATABASE_URL` | Yes      | -             | PostgreSQL connection string              |
| `NODE_ENV`     | No       | `development` | Environment (development/production/test) |
| `PORT`         | No       | `3000`        | Application port                          |
| `PRISMA_LOG`   | No       | -             | Prisma logging levels                     |

For production deployment, see [Architecture Document](./architecture.md).

---

## 2. Project Structure

### 2.1 Directory Overview

```
web-starter-kit/
├── docs/                          # Documentation
│   ├── requirement.md             # Functional requirements
│   ├── requirement-2.md           # PostgreSQL migration requirements
│   ├── data-schema.md             # Data schema design
│   ├── architecture.md            # AWS architecture
│   └── technical-spec.md          # This document
├── prisma/                        # Prisma ORM
│   ├── schema.prisma              # Database schema definition
│   ├── migrations/                # Database migrations
│   │   └── YYYYMMDDHHMMSS_*/      # Timestamped migration folders
│   └── seed.ts                    # Database seeding script
├── public/                        # Static assets
│   ├── favicon.ico                # App favicon
│   └── *.svg                      # Static images
├── src/                           # Source code
│   ├── app/                       # Next.js App Router
│   │   ├── api/                   # API Routes (backend)
│   │   │   ├── project/           # Project endpoints
│   │   │   │   └── route.ts       # GET, POST, PUT, DELETE
│   │   │   ├── requirements/      # Requirements endpoints
│   │   │   │   ├── route.ts       # GET (all), POST
│   │   │   │   └── [id]/          # Single requirement
│   │   │   │       └── route.ts   # GET, PUT, DELETE
│   │   │   └── health/            # Health check endpoint
│   │   │       └── route.ts       # GET
│   │   ├── layout.tsx             # Root layout
│   │   ├── page.tsx               # Home page (entry point)
│   │   └── globals.css            # Global styles
│   ├── lib/                       # Utility libraries
│   │   ├── db.ts                  # Prisma client singleton
│   │   └── i18n/                  # Internationalization
│   │       └── config.ts          # i18next configuration
│   └── locales/                   # Translation files
│       ├── en.json                # English translations
│       └── th.json                # Thai translations
├── tests/                         # Test files
├── ui-prototype/                  # UI/UX team prototypes (reference)
│   ├── project-setup.html         # Project setup screen
│   └── dashboard.html             # Dashboard screen
├── .env.example                   # Environment variables template
├── .eslintrc.json                 # ESLint configuration
├── next.config.ts                 # Next.js configuration
├── package.json                   # Dependencies & scripts
├── postcss.config.mjs             # PostCSS configuration
├── tailwind.config.ts             # Tailwind CSS configuration
└── tsconfig.json                  # TypeScript configuration
```

### 2.2 Recommended Implementation Structure

The following structure is recommended for implementing the application:

```
src/
├── app/                           # Next.js App Router
│   ├── api/                       # API Routes (Backend)
│   │   ├── project/
│   │   │   └── route.ts           # Project CRUD endpoints
│   │   ├── requirements/
│   │   │   ├── route.ts           # Requirements list & create
│   │   │   └── [id]/
│   │   │       └── route.ts       # Single requirement CRUD
│   │   ├── preferences/
│   │   │   └── route.ts           # User preferences endpoints
│   │   └── health/
│   │       └── route.ts           # Health check endpoint
│   ├── layout.tsx                 # Root layout (metadata, fonts)
│   ├── page.tsx                   # Entry point → redirects based on state
│   ├── setup/
│   │   └── page.tsx               # Project Setup screen (SCR-01)
│   └── dashboard/
│       └── page.tsx               # Dashboard screen (SCR-02)
├── components/                    # React components
│   ├── ui/                        # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Toggle.tsx
│   │   └── Card.tsx
│   ├── layout/                    # Layout components
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   ├── project/                   # Project-related components
│   │   ├── ProjectNameInput.tsx
│   │   └── ProjectNameDisplay.tsx
│   ├── requirements/              # Requirements-related components
│   │   ├── RequirementsList.tsx
│   │   ├── RequirementRow.tsx
│   │   ├── RequirementForm.tsx
│   │   ├── EffortSummary.tsx
│   │   └── EmptyState.tsx
│   └── providers/
│       └── I18nProvider.tsx       # i18n provider component
├── hooks/                         # Custom React hooks
│   ├── useProject.ts              # Project state management (API calls)
│   ├── useRequirements.ts         # Requirements state management (API calls)
│   └── useLanguage.ts             # Language state management
├── lib/                           # Utility libraries
│   ├── api.ts                     # API client for HTTP requests
│   ├── db.ts                      # Prisma client singleton
│   ├── validation.ts              # Validation utilities
│   ├── format.ts                  # Formatting utilities
│   └── i18n/
│       └── config.ts              # i18next configuration
├── locales/                       # Translation files
│   ├── en.json                    # English translations
│   └── th.json                    # Thai translations
└── types/                         # TypeScript type definitions
    └── index.ts                   # Shared types and interfaces
```

### 2.3 Module Responsibilities

| Module                     | Responsibility                                         |
| -------------------------- | ------------------------------------------------------ |
| `app/api/`                 | Backend API routes, database operations via Prisma     |
| `app/`                     | Frontend route definitions, page components, metadata  |
| `components/ui/`           | Reusable, stateless UI primitives                      |
| `components/layout/`       | Layout structure (header, sidebar, main content)       |
| `components/project/`      | Project-specific UI (name display, edit)               |
| `components/requirements/` | Requirements CRUD UI components                        |
| `components/providers/`    | Context providers (i18n)                               |
| `hooks/`                   | State management, API calls, side effects              |
| `lib/api.ts`               | HTTP client wrapper for frontend-to-backend calls      |
| `lib/db.ts`                | Prisma client singleton for database access            |
| `lib/validation.ts`        | Input validation (shared between frontend and backend) |
| `lib/format.ts`            | Data formatting utilities                              |
| `lib/i18n/`                | Internationalization configuration                     |
| `locales/`                 | Translation files (en.json, th.json)                   |
| `types/`                   | Shared TypeScript interfaces, types, constants         |
| `prisma/`                  | Database schema, migrations, seeding                   |

### 2.4 Separation of Concerns

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           PRESENTATION LAYER                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐  │
│  │   Pages (app/)   │  │   Components    │  │     UI Components       │  │
│  │  - Setup Page    │  │  - Header       │  │  - Button, Input        │  │
│  │  - Dashboard     │  │  - Sidebar      │  │  - Modal, Toggle        │  │
│  └────────┬─────────┘  └────────┬────────┘  └───────────┬─────────────┘  │
│           │                     │                        │               │
└───────────┼─────────────────────┼────────────────────────┼───────────────┘
            │                     │                        │
            ▼                     ▼                        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            STATE LAYER                                   │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                      Custom Hooks (hooks/)                       │    │
│  │  - useProject: Project state + API calls                         │    │
│  │  - useRequirements: Requirements state + API calls               │    │
│  │  - useLanguage: Language state management + toggle               │    │
│  └────────────────────────────────────┬────────────────────────────┘    │
│                                       │                                  │
└───────────────────────────────────────┼──────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         API CLIENT LAYER                                 │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                        lib/api.ts                                │    │
│  │  - HTTP requests (fetch API)                                     │    │
│  │  - Request/Response handling                                     │    │
│  │  - Error handling                                                │    │
│  └────────────────────────────────────┬────────────────────────────┘    │
│                                       │                                  │
└───────────────────────────────────────┼──────────────────────────────────┘
                                        │ HTTP (localhost:3000/api/*)
                                        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       API ROUTES LAYER (Backend)                         │
│  ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐    │
│  │  /api/project     │  │ /api/requirements │  │ /api/preferences  │    │
│  │  - GET, POST      │  │ - GET, POST       │  │ - GET, PUT        │    │
│  │  - PUT, DELETE    │  │ - /[id] routes    │  │                   │    │
│  └─────────┬─────────┘  └─────────┬─────────┘  └─────────┬─────────┘    │
│            │                      │                      │              │
│            └──────────────────────┼──────────────────────┘              │
│                                   │                                      │
└───────────────────────────────────┼──────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATABASE LAYER                                   │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    Prisma Client (lib/db.ts)                     │    │
│  │  - Type-safe queries                                             │    │
│  │  - Connection pooling                                            │    │
│  └────────────────────────────────────┬────────────────────────────┘    │
│                                       │                                  │
└───────────────────────────────────────┼──────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        POSTGRESQL DATABASE                               │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Tables: projects, requirements, user_preferences               │    │
│  │  Constraints: foreign keys, unique indexes, check constraints    │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.5 Client-Side Storage (Limited)

After migrating to PostgreSQL, localStorage is only used for:

| Key            | Purpose                         | Notes                                    |
| -------------- | ------------------------------- | ---------------------------------------- |
| `ret_language` | User language preference (i18n) | Persists locally for quick language load |

All other data (project, requirements, preferences) is stored in PostgreSQL.

---

## 3. API Specifications

### 3.1 Overview

This application uses a **REST API** architecture with Next.js API Routes (App Router) serving as the backend. The frontend communicates with the backend via HTTP requests, and the backend persists data to PostgreSQL using Prisma ORM.

**API Characteristics:**

- **Base URL**: `http://localhost:3000/api` (development)
- **Content-Type**: `application/json` for all requests and responses
- **Authentication**: None (single-user application)
- **Error Format**: Consistent JSON error responses

### 3.2 API Endpoints

#### 3.2.1 Project Endpoints

**GET /api/project** - Get current project

```
Response 200:
{
  "id": 1,
  "name": "My Project",
  "createdAt": "2026-02-11T10:00:00.000Z",
  "updatedAt": "2026-02-11T12:30:00.000Z",
  "nextRequirementId": 5
}

Response 404:
{ "error": "No project found" }
```

**POST /api/project** - Create new project

```
Request:
{ "name": "My Project" }

Response 201:
{
  "id": 1,
  "name": "My Project",
  "createdAt": "2026-02-11T10:00:00.000Z",
  "updatedAt": "2026-02-11T10:00:00.000Z",
  "nextRequirementId": 1
}

Response 400:
{ "error": "Project name is required" }

Response 409:
{ "error": "Project already exists" }
```

**PUT /api/project** - Update project name

```
Request:
{ "name": "Updated Project Name" }

Response 200:
{
  "id": 1,
  "name": "Updated Project Name",
  "createdAt": "2026-02-11T10:00:00.000Z",
  "updatedAt": "2026-02-11T14:00:00.000Z",
  "nextRequirementId": 5
}

Response 404:
{ "error": "No project found" }
```

**DELETE /api/project** - Delete project and all requirements

```
Response 200:
{ "message": "Project deleted successfully" }

Response 404:
{ "error": "No project found" }
```

#### 3.2.2 Requirements Endpoints

**GET /api/requirements** - Get all requirements

```
Response 200:
{
  "requirements": [
    {
      "id": 1,
      "projectId": 1,
      "description": "User authentication",
      "effort": 5.5,
      "isActive": true,
      "createdAt": "2026-02-11T10:00:00.000Z"
    }
  ]
}

Response 200 (empty):
{ "requirements": [] }
```

**POST /api/requirements** - Create new requirement

```
Request:
{
  "description": "User authentication",
  "effort": 5.5
}

Response 201:
{
  "id": 1,
  "projectId": 1,
  "description": "User authentication",
  "effort": 5.5,
  "isActive": true,
  "createdAt": "2026-02-11T10:00:00.000Z"
}

Response 400:
{ "error": "Description is required" }

Response 404:
{ "error": "No project found. Create a project first." }
```

**GET /api/requirements/[id]** - Get single requirement

```
Response 200:
{
  "id": 1,
  "projectId": 1,
  "description": "User authentication",
  "effort": 5.5,
  "isActive": true,
  "createdAt": "2026-02-11T10:00:00.000Z"
}

Response 404:
{ "error": "Requirement not found" }
```

**PUT /api/requirements/[id]** - Update requirement

```
Request:
{
  "description": "Updated description",
  "effort": 8.0,
  "isActive": false
}

Response 200:
{
  "id": 1,
  "projectId": 1,
  "description": "Updated description",
  "effort": 8.0,
  "isActive": false,
  "createdAt": "2026-02-11T10:00:00.000Z"
}

Response 404:
{ "error": "Requirement not found" }
```

**DELETE /api/requirements/[id]** - Delete requirement

```
Response 200:
{ "message": "Requirement deleted successfully" }

Response 404:
{ "error": "Requirement not found" }
```

**PATCH /api/requirements/[id]/toggle** - Toggle requirement status

```
Response 200:
{
  "id": 1,
  "projectId": 1,
  "description": "User authentication",
  "effort": 5.5,
  "isActive": false,
  "createdAt": "2026-02-11T10:00:00.000Z"
}

Response 404:
{ "error": "Requirement not found" }
```

#### 3.2.3 Health Check Endpoint

**GET /api/health** - Health check

```
Response 200:
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2026-02-11T10:00:00.000Z"
}

Response 503:
{
  "status": "unhealthy",
  "database": "disconnected",
  "error": "Database connection failed"
}
```

### 3.3 Error Response Format

All error responses follow a consistent format:

```typescript
interface ErrorResponse {
  error: string;
  details?: string;
  code?: string;
}
```

**HTTP Status Codes:**

| Status | Meaning               | Usage                                |
| ------ | --------------------- | ------------------------------------ |
| 200    | OK                    | Successful GET, PUT, DELETE          |
| 201    | Created               | Successful POST                      |
| 400    | Bad Request           | Invalid input, validation errors     |
| 404    | Not Found             | Resource doesn't exist               |
| 409    | Conflict              | Resource already exists              |
| 500    | Internal Server Error | Database errors, unexpected failures |
| 503    | Service Unavailable   | Database connection failed           |

### 3.4 API Client Implementation

The frontend uses a centralized API client (`lib/api.ts`) for all HTTP requests:

```typescript
// lib/api.ts

const API_BASE = "/api";

async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new ApiError(error.error, response.status);
  }

  return response.json();
}

// Project API
export const projectApi = {
  get: () => apiRequest<Project>("/project"),
  create: (name: string) =>
    apiRequest<Project>("/project", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),
  update: (name: string) =>
    apiRequest<Project>("/project", {
      method: "PUT",
      body: JSON.stringify({ name }),
    }),
  delete: () =>
    apiRequest<{ message: string }>("/project", { method: "DELETE" }),
};

// Requirements API
export const requirementsApi = {
  getAll: () => apiRequest<{ requirements: Requirement[] }>("/requirements"),
  get: (id: number) => apiRequest<Requirement>(`/requirements/${id}`),
  create: (data: { description: string; effort: number }) =>
    apiRequest<Requirement>("/requirements", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<Requirement>) =>
    apiRequest<Requirement>(`/requirements/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    apiRequest<{ message: string }>(`/requirements/${id}`, {
      method: "DELETE",
    }),
  toggle: (id: number) =>
    apiRequest<Requirement>(`/requirements/${id}/toggle`, { method: "PATCH" }),
};
```

### 3.5 Error Handling

#### Backend Error Handling (API Routes)

```typescript
// Error handling in API routes
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

function handleDatabaseError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        return NextResponse.json(
          { error: "Resource already exists" },
          { status: 409 },
        );
      case "P2025":
        return NextResponse.json(
          { error: "Resource not found" },
          { status: 404 },
        );
      default:
        return NextResponse.json(
          { error: "Database error", code: error.code },
          { status: 500 },
        );
    }
  }

  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
```

#### Frontend Error Handling

```typescript
// Custom API error class
class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Usage in hooks
async function loadProject() {
  try {
    const project = await projectApi.get();
    setProject(project);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      setProject(null); // No project exists
    } else {
      setError("Failed to load project");
    }
  }
}
```

---

## 4. Business Logic & Sequence Diagrams

### 4.1 Application Entry Flow

```mermaid
sequenceDiagram
    participant User as User
    participant App as App (page.tsx)
    participant API as API Client
    participant Backend as /api/project
    participant DB as PostgreSQL
    participant Setup as Setup Page
    participant Dashboard as Dashboard

    User->>App: Navigate to /
    App->>API: projectApi.get()
    API->>Backend: GET /api/project
    Backend->>DB: SELECT * FROM projects LIMIT 1

    alt No existing project
        DB-->>Backend: No rows
        Backend-->>API: 404 Not Found
        API-->>App: ApiError (404)
        App->>Setup: Redirect to /setup
        Setup->>User: Show project setup form
    else Project exists
        DB-->>Backend: Project row
        Backend-->>API: 200 OK (project)
        API-->>App: Project data
        App->>Dashboard: Redirect to /dashboard
        Dashboard->>API: Load all data
        API-->>Dashboard: Project, Requirements
        Dashboard->>User: Display dashboard
    end
```

### 4.2 Create Project Flow

```mermaid
sequenceDiagram
    participant User as User
    participant Form as Setup Form
    participant Validator as Validation
    participant API as API Client
    participant Backend as /api/project
    participant DB as PostgreSQL
    participant Router as Next.js Router

    User->>Form: Enter project name
    User->>Form: Click "Create Project"

    Form->>Validator: Validate name

    alt Invalid name
        Validator-->>Form: Error (empty/too long)
        Form->>User: Show error message
    else Valid name
        Validator-->>Form: Valid
        Form->>API: projectApi.create(name)
        API->>Backend: POST /api/project {name}
        Backend->>DB: INSERT INTO projects
        DB-->>Backend: Project row
        Backend-->>API: 201 Created (project)
        API-->>Form: Success
        Form->>Router: Navigate to /dashboard
        Router->>User: Show dashboard
    end
```

### 4.3 Add Requirement Flow

```mermaid
sequenceDiagram
    participant User as User
    participant Form as Add Form
    participant Validator as Validation
    participant State as React State
    participant API as API Client
    participant Backend as /api/requirements
    participant DB as PostgreSQL
    participant List as Requirements List

    User->>Form: Enter description
    User->>Form: Enter effort
    User->>Form: Click "Add"

    Form->>Validator: Validate description
    Form->>Validator: Validate effort

    alt Validation fails
        Validator-->>Form: Error details
        Form->>User: Show inline errors
    else Validation passes
        Validator-->>Form: Valid data
        Form->>API: requirementsApi.create({description, effort})
        API->>Backend: POST /api/requirements
        Backend->>DB: INSERT INTO requirements
        Note over DB: ID assigned by database<br/>isActive = true<br/>createdAt = now()
        DB-->>Backend: Requirement row
        Backend-->>API: 201 Created (requirement)
        API-->>Form: New requirement

        Form->>State: Update requirements state
        State->>List: Re-render with new item
        List->>User: Show new requirement row

        Form->>Form: Clear input fields
        Form->>User: Focus on description field
    end
```

### 4.4 Edit Requirement Flow

```mermaid
sequenceDiagram
    participant User as User
    participant Row as Requirement Row
    participant Form as Edit Form
    participant Validator as Validation
    participant API as API Client
    participant Backend as /api/requirements/[id]
    participant DB as PostgreSQL
    participant Stats as Statistics

    User->>Row: Click "Edit" button
    Row->>Form: Enter edit mode
    Form->>User: Show inline edit form

    User->>Form: Modify description/effort
    User->>Form: Click "Save"

    Form->>Validator: Validate inputs

    alt Validation fails
        Validator-->>Form: Error
        Form->>User: Show alert
    else Validation passes
        Form->>API: requirementsApi.update(id, data)
        API->>Backend: PUT /api/requirements/[id]
        Backend->>DB: UPDATE requirements SET ...
        DB-->>Backend: Updated row
        Backend-->>API: 200 OK (requirement)
        API-->>Form: Updated requirement

        Form->>Row: Exit edit mode
        Row->>Row: Update display values
        Row->>Stats: Trigger recalculation
        Stats->>User: Update effort summary
    end

    User->>Form: Click "Cancel"
    Form->>Row: Exit edit mode
    Row->>Row: Reset to original values
```

### 4.5 Delete Requirement Flow

```mermaid
sequenceDiagram
    participant User as User
    participant Row as Requirement Row
    participant Modal as Delete Modal
    participant API as API Client
    participant Backend as /api/requirements/[id]
    participant DB as PostgreSQL
    participant State as React State
    participant Stats as Statistics

    User->>Row: Click "Delete" button
    Row->>Modal: Show confirmation dialog
    Modal->>User: "Are you sure?"

    alt User cancels
        User->>Modal: Click "Cancel"
        Modal->>Modal: Close
    else User confirms
        User->>Modal: Click "Delete"
        Modal->>API: requirementsApi.delete(id)
        API->>Backend: DELETE /api/requirements/[id]
        Backend->>DB: DELETE FROM requirements WHERE id = ?
        DB-->>Backend: Deleted
        Backend-->>API: 200 OK
        API-->>Modal: Success

        Modal->>State: Update state
        State->>Row: Remove from DOM

        State->>Stats: Recalculate totals
        Stats->>User: Update statistics

        Modal->>Modal: Close
    end
```

### 4.6 Toggle Status Flow

```mermaid
sequenceDiagram
    participant User as User
    participant Toggle as Toggle Switch
    participant API as API Client
    participant Backend as /api/requirements/[id]/toggle
    participant DB as PostgreSQL
    participant Row as Requirement Row
    participant Stats as Statistics

    User->>Toggle: Click toggle
    Toggle->>API: requirementsApi.toggle(id)
    API->>Backend: PATCH /api/requirements/[id]/toggle
    Backend->>DB: UPDATE requirements SET isActive = NOT isActive
    DB-->>Backend: Updated row
    Backend-->>API: 200 OK (requirement)
    API-->>Toggle: Updated requirement

    Toggle->>Row: Update visual state
    Note over Row: Active: green toggle, normal opacity<br/>Inactive: gray toggle, reduced opacity

    Toggle->>Stats: Recalculate active effort
    Stats->>User: Update Total Active Effort display
```

### 4.7 Export Data Flow

```mermaid
sequenceDiagram
    participant User as User
    participant Button as Export Button
    participant API as API Client
    participant Backend as /api/*
    participant DB as PostgreSQL
    participant Browser as Browser API

    User->>Button: Click "Export"
    Button->>API: projectApi.get()
    API->>Backend: GET /api/project
    Backend->>DB: SELECT * FROM projects
    DB-->>Backend: Project
    Backend-->>API: Project data

    Button->>API: requirementsApi.getAll()
    API->>Backend: GET /api/requirements
    Backend->>DB: SELECT * FROM requirements
    DB-->>Backend: Requirements
    Backend-->>API: Requirements data

    Button->>Button: Create ExportData object
    Note over Button: {projectName, requirements, exportDate}

    Button->>Button: JSON.stringify with formatting
    Button->>Browser: Create Blob
    Button->>Browser: Create object URL
    Button->>Browser: Create download link
    Button->>Browser: Trigger click

    Browser->>User: Download file
    Note over User: filename_requirements.json

    Button->>Browser: Revoke object URL
```

### 4.8 Import Data Flow

```mermaid
sequenceDiagram
    participant User as User
    participant Button as Import Button
    participant Input as File Input
    participant Reader as FileReader
    participant Validator as Validation
    participant API as API Client
    participant Backend as /api/*
    participant DB as PostgreSQL
    participant Dashboard as Dashboard

    User->>Button: Click "Import"
    Button->>Input: Trigger file picker
    Input->>User: Show file dialog

    User->>Input: Select JSON file
    Input->>Reader: Read file as text

    Reader->>Validator: Parse JSON

    alt Invalid JSON
        Validator-->>Dashboard: Parse error
        Dashboard->>User: Show "Error reading file"
    else Valid JSON
        Validator->>Validator: Check structure

        alt Invalid structure
            Validator-->>Dashboard: Invalid format
            Dashboard->>User: Show "Invalid file format"
        else Valid structure
            Validator->>API: projectApi.delete() (if exists)
            Validator->>API: projectApi.create(projectName)
            API->>Backend: POST /api/project
            Backend->>DB: INSERT INTO projects

            loop For each requirement
                Validator->>API: requirementsApi.create(req)
                API->>Backend: POST /api/requirements
                Backend->>DB: INSERT INTO requirements
            end

            DB-->>Dashboard: Success
            Dashboard->>Dashboard: Reload all data
            Dashboard->>User: Show "Import successful!"
        end
    end
```

### 4.9 New Project (Reset) Flow

```mermaid
sequenceDiagram
    participant User as User
    participant Button as New Project Button
    participant Modal as Confirmation Modal
    participant API as API Client
    participant Backend as /api/project
    participant DB as PostgreSQL
    participant Router as Next.js Router

    User->>Button: Click "New Project"
    Button->>Modal: Show confirmation
    Modal->>User: "This will clear all data"

    alt User cancels
        User->>Modal: Click "Cancel"
        Modal->>Modal: Close
    else User confirms
        User->>Modal: Click "Yes, Start New"
        Modal->>API: projectApi.delete()
        API->>Backend: DELETE /api/project
        Backend->>DB: DELETE FROM requirements WHERE projectId = ?
        Backend->>DB: DELETE FROM projects WHERE id = ?
        DB-->>Backend: Deleted
        Backend-->>API: 200 OK
        API-->>Modal: Success

        Modal->>Router: Navigate to /setup
        Router->>User: Show project setup
    end
```

### 4.10 Validation Rules Summary

| Field        | Rule                 | Error Message                               |
| ------------ | -------------------- | ------------------------------------------- |
| Project Name | Required             | "Project name is required"                  |
| Project Name | Max 100 characters   | "Project name cannot exceed 100 characters" |
| Project Name | Not whitespace-only  | "Project name cannot be empty"              |
| Description  | Required             | "Requirement description is required"       |
| Description  | Max 500 characters   | "Description cannot exceed 500 characters"  |
| Description  | Not whitespace-only  | "Requirement description cannot be empty"   |
| Effort       | Required             | "Effort value is required"                  |
| Effort       | Must be number       | "Effort must be a number"                   |
| Effort       | Greater than 0       | "Effort must be greater than zero"          |
| Effort       | Max 9999             | "Effort cannot exceed 9999"                 |
| Effort       | Max 2 decimal places | "Effort can have at most 2 decimal places"  |

### 4.11 Business Constraints

| ID   | Constraint                                                               |
| ---- | ------------------------------------------------------------------------ |
| BR.1 | Only active requirements are included in Total Active Effort calculation |
| BR.2 | Requirement IDs are sequential and never reused after deletion           |
| BR.3 | All data modifications are auto-saved immediately                        |
| BR.4 | Single-project mode: only one project exists at a time                   |
| BR.5 | New project creation requires confirmation and clears all existing data  |
| BR.6 | New requirements default to Active status                                |
| BR.7 | Validation errors prevent form submission                                |

---

## 5. Data Schema

### 5.1 Entity Relationship Diagram

```mermaid
erDiagram
    PROJECT ||--o{ REQUIREMENT : "contains"

    PROJECT {
        int id PK "Auto-increment"
        string name "1-100 characters"
        datetime created_at "timestamptz"
        datetime updated_at "timestamptz"
        int next_requirement_id "Starts at 1"
    }

    REQUIREMENT {
        int id PK "Auto-increment"
        int project_id FK "References PROJECT"
        string description "1-500 characters"
        decimal effort "DECIMAL(6,2)"
        boolean is_active "Default: true"
        datetime created_at "timestamptz"
    }
```

### 5.2 PostgreSQL Table Definitions

#### Prisma Schema (`prisma/schema.prisma`)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Project {
  id                Int           @id @default(autoincrement())
  name              String        @db.VarChar(100)
  createdAt         DateTime      @default(now()) @map("created_at")
  updatedAt         DateTime      @updatedAt @map("updated_at")
  nextRequirementId Int           @default(1) @map("next_requirement_id")
  requirements      Requirement[]

  @@map("projects")
}

model Requirement {
  id          Int      @id @default(autoincrement())
  projectId   Int      @map("project_id")
  description String   @db.VarChar(500)
  effort      Decimal  @db.Decimal(6, 2)
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@map("requirements")
}
```

#### SQL Table Definitions (Generated)

```sql
-- Projects table
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    next_requirement_id INTEGER NOT NULL DEFAULT 1
);

-- Requirements table
CREATE TABLE requirements (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    description VARCHAR(500) NOT NULL,
    effort DECIMAL(6,2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster requirement lookups by project
CREATE INDEX idx_requirements_project_id ON requirements(project_id);
```

### 5.3 Data Models (TypeScript)

#### Project Entity

| Field               | Type     | DB Column             | Constraints            | Default | Description                 |
| ------------------- | -------- | --------------------- | ---------------------- | ------- | --------------------------- |
| `id`                | number   | `id`                  | PK, auto-increment     | auto    | Unique identifier           |
| `name`              | string   | `name`                | VARCHAR(100), NOT NULL | -       | Project name                |
| `createdAt`         | DateTime | `created_at`          | TIMESTAMPTZ            | now()   | Creation timestamp          |
| `updatedAt`         | DateTime | `updated_at`          | TIMESTAMPTZ            | now()   | Last modification timestamp |
| `nextRequirementId` | number   | `next_requirement_id` | INTEGER, NOT NULL      | 1       | Next ID to assign           |

#### Requirement Entity

| Field         | Type     | DB Column     | Constraints                | Default | Description             |
| ------------- | -------- | ------------- | -------------------------- | ------- | ----------------------- |
| `id`          | number   | `id`          | PK, auto-increment         | auto    | Unique identifier       |
| `projectId`   | number   | `project_id`  | FK → projects(id), CASCADE | -       | Parent project          |
| `description` | string   | `description` | VARCHAR(500), NOT NULL     | -       | Requirement description |
| `effort`      | Decimal  | `effort`      | DECIMAL(6,2), NOT NULL     | -       | Effort in days          |
| `isActive`    | boolean  | `is_active`   | BOOLEAN, NOT NULL          | true    | Active/Inactive status  |
| `createdAt`   | DateTime | `created_at`  | TIMESTAMPTZ, NOT NULL      | now()   | Creation timestamp      |

### 5.4 Computed Values (Not Stored)

| Value               | Formula                                                                      | Used In        |
| ------------------- | ---------------------------------------------------------------------------- | -------------- |
| Total Requirements  | `requirements.length`                                                        | Statistics     |
| Active Count        | `requirements.filter(r => r.isActive).length`                                | Statistics     |
| Inactive Count      | `requirements.filter(r => !r.isActive).length`                               | Statistics     |
| Total Active Effort | `requirements.filter(r => r.isActive).reduce((sum, r) => sum + r.effort, 0)` | Effort Summary |

### 5.5 Sample Data

```sql
-- Sample project
INSERT INTO projects (name, next_requirement_id)
VALUES ('Project Alpha', 5);

-- Sample requirements
INSERT INTO requirements (project_id, description, effort, is_active)
VALUES
  (1, 'User authentication module', 5.50, true),
  (1, 'Dashboard UI', 3.00, false),
  (1, 'API integration', 8.00, true),
  (1, 'Testing suite', 4.50, true);
```

### 5.6 Database Constraints

| Constraint Type | Table        | Columns     | Description                         |
| --------------- | ------------ | ----------- | ----------------------------------- |
| PRIMARY KEY     | projects     | id          | Unique project identifier           |
| PRIMARY KEY     | requirements | id          | Unique requirement identifier       |
| FOREIGN KEY     | requirements | project_id  | References projects(id), CASCADE    |
| NOT NULL        | projects     | name        | Project name required               |
| NOT NULL        | requirements | description | Description required                |
| NOT NULL        | requirements | effort      | Effort value required               |
| CHECK           | requirements | effort > 0  | Effort must be positive (app-level) |
| INDEX           | requirements | project_id  | Faster lookups by project           |

---

## 6. Architecture Diagram

### 6.1 High-Level Application Architecture

```mermaid
flowchart TB
    subgraph Browser["Browser Environment"]
        subgraph NextJS["Next.js Frontend"]
            subgraph Pages["Pages (App Router)"]
                Root["/ (page.tsx)<br/>Entry Point"]
                Setup["/setup (page.tsx)<br/>Project Setup"]
                Dashboard["/dashboard (page.tsx)<br/>Main Dashboard"]
            end

            subgraph Components["React Components"]
                UI["UI Components<br/>Button, Input, Modal, Toggle"]
                Layout["Layout Components<br/>Header, Sidebar"]
                Feature["Feature Components<br/>RequirementsList, EffortSummary"]
            end

            subgraph Hooks["Custom Hooks"]
                UseProject["useProject()"]
                UseRequirements["useRequirements()"]
                UseLanguage["useLanguage()"]
            end

            subgraph ClientLib["Client Library"]
                APIClient["api.ts<br/>HTTP Client"]
                Validation["validation.ts<br/>Input Validation"]
                Format["format.ts<br/>Data Formatting"]
            end
        end

        subgraph BrowserAPI["Browser APIs"]
            LocalStorage["localStorage<br/>(Language Only)"]
            FileAPI["File API<br/>Import/Export"]
        end
    end

    subgraph Server["Server Environment (Next.js API Routes)"]
        subgraph APIRoutes["API Routes (/api)"]
            ProjectAPI["/api/project<br/>Project CRUD"]
            RequirementsAPI["/api/requirements<br/>Requirements CRUD"]
            HealthAPI["/api/health<br/>Health Check"]
        end

        subgraph ServerLib["Server Library"]
            DBClient["db.ts<br/>Prisma Client"]
        end
    end

    subgraph Database["PostgreSQL Database"]
        ProjectsTable["projects"]
        RequirementsTable["requirements"]
    end

    Root --> |"No project"| Setup
    Root --> |"Has project"| Dashboard

    Pages --> Components
    Components --> Hooks
    Hooks --> ClientLib
    ClientLib --> |"HTTP Request"| APIRoutes
    APIRoutes --> ServerLib
    ServerLib --> Database

    UseLanguage --> LocalStorage
```

### 6.2 Data Flow Diagram

```mermaid
flowchart LR
    subgraph User["User Actions"]
        Click["Click/Input"]
    end

    subgraph Presentation["Presentation Layer"]
        Component["React Component"]
    end

    subgraph State["State Layer"]
        Hook["Custom Hook<br/>(useState + useEffect)"]
    end

    subgraph Client["API Client Layer"]
        APIClient["api.ts<br/>fetch wrapper"]
        ValidationService["Validation"]
    end

    subgraph API["API Routes Layer"]
        Routes["/api/*<br/>Route Handlers"]
    end

    subgraph DB["Database Layer"]
        Prisma["Prisma Client"]
        PG["PostgreSQL"]
    end

    Click --> Component
    Component --> |"Call hook method"| Hook
    Hook --> |"Validate data"| ValidationService
    ValidationService --> |"Valid"| APIClient
    APIClient --> |"HTTP Request"| Routes
    Routes --> Prisma
    Prisma --> |"SQL Query"| PG
    PG --> |"Result"| Prisma
    Prisma --> |"Response"| Routes
    Routes --> |"JSON Response"| APIClient
    APIClient --> |"Update state"| Hook
    Hook --> |"Re-render"| Component
    Component --> |"Display"| User
```

### 6.3 Component Architecture

```mermaid
flowchart TB
    subgraph RootLayout["Root Layout (layout.tsx)"]
        subgraph PageContent["Page Content"]
            subgraph SetupPage["Setup Page"]
                SetupHeader["Brand Header"]
                SetupForm["Project Name Form"]
            end

            subgraph DashboardPage["Dashboard Page"]
                Header["Header<br/>Logo | Project Name | Actions"]

                subgraph MainContent["Main Content (8 cols)"]
                    ReqList["Requirements List"]
                    ReqRow["Requirement Row ×n"]
                    EmptyState["Empty State"]
                end

                subgraph Sidebar["Sidebar (4 cols)"]
                    EffortCard["Effort Summary Card"]
                    AddForm["Add Requirement Form"]
                end
            end
        end
    end

    SetupForm --> |"Create Project"| DashboardPage
    Header --> |"New Project"| SetupPage
```

### 6.4 State Management Pattern

```mermaid
stateDiagram-v2
    [*] --> CheckingProject: App loads

    CheckingProject --> NoProject: GET /api/project returns 404
    CheckingProject --> HasProject: GET /api/project returns 200

    NoProject --> SetupScreen: Redirect
    HasProject --> DashboardScreen: Redirect

    SetupScreen --> CreatingProject: Submit form
    CreatingProject --> DashboardScreen: POST /api/project & redirect

    DashboardScreen --> AddingRequirement: Add form submit
    DashboardScreen --> EditingRequirement: Click edit
    DashboardScreen --> DeletingRequirement: Click delete
    DashboardScreen --> TogglingStatus: Toggle switch
    DashboardScreen --> ExportingData: Click export
    DashboardScreen --> ImportingData: Click import
    DashboardScreen --> ResettingProject: Click new project

    AddingRequirement --> DashboardScreen: POST /api/requirements
    EditingRequirement --> DashboardScreen: PUT /api/requirements/[id]
    DeletingRequirement --> DashboardScreen: DELETE /api/requirements/[id]
    TogglingStatus --> DashboardScreen: PATCH /api/requirements/[id]/toggle
    ExportingData --> DashboardScreen: File downloaded
    ImportingData --> DashboardScreen: Data imported via API
    ResettingProject --> SetupScreen: DELETE /api/project
```

---

## 7. Integration Contracts

### 7.1 TypeScript Interfaces

```typescript
// types/index.ts

/**
 * Project entity - from database
 */
export interface Project {
  id: number;
  name: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  nextRequirementId: number;
}

/**
 * Requirement entity - from database
 */
export interface Requirement {
  id: number;
  projectId: number;
  description: string;
  effort: number;
  isActive: boolean;
  createdAt: string; // ISO 8601
}

/**
 * Create project request
 */
export interface CreateProjectRequest {
  name: string;
}

/**
 * Update project request
 */
export interface UpdateProjectRequest {
  name?: string;
}

/**
 * Create requirement request
 */
export interface CreateRequirementRequest {
  description: string;
  effort: number;
}

/**
 * Update requirement request
 */
export interface UpdateRequirementRequest {
  description?: string;
  effort?: number;
  isActive?: boolean;
}

/**
 * API Error response
 */
export interface ApiErrorResponse {
  error: string;
  details?: string;
}

/**
 * Export/Import data format
 */
export interface ExportData {
  projectName: string;
  requirements: Omit<Requirement, "id" | "projectId">[];
  exportDate: string; // ISO 8601
}

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Statistics computed from requirements
 */
export interface RequirementStats {
  total: number;
  active: number;
  inactive: number;
  totalActiveEffort: number;
}

/**
 * Supported languages for i18n
 */
export const SUPPORTED_LANGUAGES = ["en", "th"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

/**
 * Language configuration
 */
export interface LanguageConfig {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

export const LANGUAGE_OPTIONS: LanguageConfig[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
  { code: "th", name: "Thai", nativeName: "ไทย", flag: "🇹🇭" },
];
```

### 7.2 Shared Constants

```typescript
// lib/constants.ts

/**
 * localStorage key names (only language preference stored client-side)
 */
export const STORAGE_KEYS = {
  LANGUAGE: "ret_language",
} as const;

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  PROJECT: "/api/project",
  REQUIREMENTS: "/api/requirements",
  HEALTH: "/api/health",
} as const;

/**
 * i18n constants
 */
export const I18N = {
  SUPPORTED_LANGUAGES: ["en", "th"] as const,
  DEFAULT_LANGUAGE: "en",
  STORAGE_KEY: "ret_language",
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

/**
 * Default values
 */
export const DEFAULTS = {
  SHOW_EFFORT_COLUMN: true,
  SCHEMA_VERSION: 1,
  NEXT_REQUIREMENT_ID: 1,
  IS_ACTIVE: true,
} as const;

/**
 * Route paths
 */
export const ROUTES = {
  HOME: "/",
  SETUP: "/setup",
  DASHBOARD: "/dashboard",
} as const;
```

### 7.3 Hook Contracts

```typescript
// hooks/useProject.ts
export interface UseProjectReturn {
  project: Project | null;
  isLoading: boolean;
  error: string | null;
  createProject: (name: string) => Promise<ValidationResult>;
  updateProjectName: (name: string) => Promise<ValidationResult>;
  deleteProject: () => Promise<void>;
  refetch: () => Promise<void>;
}

// hooks/useRequirements.ts
export interface UseRequirementsReturn {
  requirements: Requirement[];
  isLoading: boolean;
  error: string | null;
  stats: RequirementStats;
  addRequirement: (
    description: string,
    effort: number,
  ) => Promise<ValidationResult>;
  updateRequirement: (
    id: number,
    updates: Partial<Pick<Requirement, "description" | "effort">>,
  ) => Promise<ValidationResult>;
  deleteRequirement: (id: number) => Promise<void>;
  toggleStatus: (id: number) => Promise<void>;
  exportData: () => ExportData;
  importData: (data: ExportData) => Promise<ValidationResult>;
  refetch: () => Promise<void>;
}

// hooks/useLanguage.ts (localStorage for quick access)
export interface UseLanguageReturn {
  currentLanguage: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  toggleLanguage: () => void;
  supportedLanguages: readonly SupportedLanguage[];
  isReady: boolean;
}
```

### 7.4 Component Props Interfaces

```typescript
// components/ui/Button.tsx
export interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
}

// components/ui/Input.tsx
export interface InputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  error?: string;
  disabled?: boolean;
  type?: "text" | "number";
  className?: string;
}

// components/ui/Modal.tsx
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

// components/ui/Toggle.tsx
export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
}

// components/requirements/RequirementRow.tsx
export interface RequirementRowProps {
  requirement: Requirement;
  onEdit: (id: number, description: string, effort: number) => void;
  onDelete: (id: number) => void;
  onToggle: (id: number) => void;
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
}

// components/requirements/EffortSummary.tsx
export interface EffortSummaryProps {
  stats: RequirementStats;
}

// components/requirements/RequirementForm.tsx
export interface RequirementFormProps {
  onSubmit: (description: string, effort: number) => ValidationResult;
}
```

### 7.5 Service Contracts

```typescript
// lib/api.ts - API Client
export interface ProjectApi {
  get(): Promise<Project | null>;
  create(data: CreateProjectRequest): Promise<Project>;
  update(data: UpdateProjectRequest): Promise<Project>;
  delete(): Promise<void>;
}

export interface RequirementsApi {
  getAll(): Promise<Requirement[]>;
  get(id: number): Promise<Requirement>;
  create(data: CreateRequirementRequest): Promise<Requirement>;
  update(id: number, data: UpdateRequirementRequest): Promise<Requirement>;
  delete(id: number): Promise<void>;
  toggle(id: number): Promise<Requirement>;
}

// lib/db.ts - Prisma Client Singleton
export interface DatabaseService {
  project: {
    findFirst(): Promise<Project | null>;
    create(data: { name: string }): Promise<Project>;
    update(data: Partial<Project>): Promise<Project>;
    delete(): Promise<void>;
  };
  requirement: {
    findMany(projectId: number): Promise<Requirement[]>;
    findUnique(id: number): Promise<Requirement | null>;
    create(
      data: CreateRequirementRequest & { projectId: number },
    ): Promise<Requirement>;
    update(id: number, data: UpdateRequirementRequest): Promise<Requirement>;
    delete(id: number): Promise<void>;
  };
}

// lib/validation.ts
export interface ValidationService {
  validateProjectName(name: string): ValidationResult;
  validateDescription(description: string): ValidationResult;
  validateEffort(effort: number | string): ValidationResult;
  validateImportData(data: unknown): ValidationResult;
}
```

---

## 8. Development Guidelines

### 8.1 Coding Standards

#### TypeScript

- **Strict mode**: Enable `strict: true` in tsconfig.json
- **Explicit types**: Always define return types for functions
- **No `any`**: Avoid using `any`; use `unknown` for truly unknown types
- **Prefer `const`**: Use `const` over `let` when variable won't be reassigned
- **Interface over Type**: Prefer `interface` for object shapes, `type` for unions/intersections

```typescript
// ✅ Good
function calculateTotal(requirements: Requirement[]): number {
  return requirements.reduce((sum, r) => sum + r.effort, 0);
}

// ❌ Bad
function calculateTotal(requirements: any) {
  return requirements.reduce((sum: any, r: any) => sum + r.effort, 0);
}
```

#### React

- **Functional components only**: No class components
- **Named exports**: Prefer named exports over default exports
- **Props destructuring**: Destructure props in function parameters
- **Hooks at top**: Call hooks at the top level of components

```typescript
// ✅ Good
export function RequirementRow({ requirement, onEdit }: RequirementRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  // ...
}

// ❌ Bad
export default class RequirementRow extends Component { ... }
```

#### Tailwind CSS

- **Utility classes**: Use Tailwind utilities, avoid custom CSS
- **Consistent spacing**: Use Tailwind's spacing scale (p-4, m-2, gap-4)
- **Responsive mobile-first**: Start with mobile styles, add breakpoints
- **Group related classes**: Order: layout → spacing → sizing → colors → effects

```typescript
// ✅ Good - organized classes
<div className="flex items-center gap-4 p-4 w-full bg-white/10 rounded-xl backdrop-blur-sm">

// ❌ Bad - random order
<div className="bg-white/10 flex w-full gap-4 backdrop-blur-sm p-4 rounded-xl items-center">
```

### 8.2 Naming Conventions

#### Files & Directories

| Type              | Convention | Example                  |
| ----------------- | ---------- | ------------------------ |
| React components  | PascalCase | `RequirementRow.tsx`     |
| Hooks             | camelCase  | `useRequirements.ts`     |
| Utility functions | camelCase  | `validation.ts`          |
| Type definitions  | camelCase  | `index.ts`               |
| Page routes       | kebab-case | `project-setup/page.tsx` |
| CSS modules       | camelCase  | `button.module.css`      |

#### Functions & Variables

| Type             | Convention  | Example                   |
| ---------------- | ----------- | ------------------------- |
| Functions        | camelCase   | `validateProjectName()`   |
| Variables        | camelCase   | `totalEffort`             |
| Constants        | UPPER_SNAKE | `STORAGE_KEYS`            |
| Boolean vars     | is/has/can  | `isActive`, `hasProject`  |
| Event handlers   | handle\*    | `handleSubmit`, `onClick` |
| React components | PascalCase  | `RequirementsList`        |
| Custom hooks     | use\*       | `useLocalStorage`         |

#### TypeScript Types

| Type             | Convention | Example             |
| ---------------- | ---------- | ------------------- |
| Interfaces       | PascalCase | `Requirement`       |
| Type aliases     | PascalCase | `ValidationResult`  |
| Props interfaces | \*Props    | `ButtonProps`       |
| Return types     | \*Return   | `UseProjectReturn`  |
| Enums            | PascalCase | `RequirementStatus` |

### 8.3 Git Workflow

#### Branch Strategy

```
main
  │
  ├── feature/add-requirement-form
  ├── feature/export-import
  ├── bugfix/validation-error
  └── hotfix/storage-crash
```

| Branch Type | Naming Pattern          | Example                        |
| ----------- | ----------------------- | ------------------------------ |
| Feature     | `feature/<description>` | `feature/add-requirement-form` |
| Bug fix     | `bugfix/<description>`  | `bugfix/validation-error`      |
| Hotfix      | `hotfix/<description>`  | `hotfix/storage-crash`         |

#### Commit Message Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**Types:**

| Type       | Description                                     |
| ---------- | ----------------------------------------------- |
| `feat`     | New feature                                     |
| `fix`      | Bug fix                                         |
| `docs`     | Documentation only                              |
| `style`    | Code style (formatting, semicolons, etc)        |
| `refactor` | Code change that neither fixes nor adds feature |
| `test`     | Adding or updating tests                        |
| `chore`    | Build process, dependencies, tooling            |

**Examples:**

```bash
feat(requirements): add inline editing for description
fix(storage): handle quota exceeded error gracefully
docs(readme): update installation instructions
refactor(hooks): extract validation logic to separate function
```

#### Pull Request Process

1. Create feature branch from `main`
2. Make changes with atomic commits
3. Run `npm run lint` before committing
4. Push branch and create PR
5. Fill in PR template (if available)
6. Request review from team member
7. Address feedback and update
8. Squash merge to `main`
9. Delete feature branch

### 8.4 Code Organization Patterns

#### Component Structure

```typescript
// 1. Imports - external first, then internal
import { useState, useEffect } from "react";
import { Requirement } from "@/types";
import { useRequirements } from "@/hooks/useRequirements";
import { Button } from "@/components/ui/Button";

// 2. Type definitions (if not in separate file)
interface ComponentProps {
  // ...
}

// 3. Component definition
export function ComponentName({ prop1, prop2 }: ComponentProps) {
  // 3a. Hooks
  const [state, setState] = useState();
  const { data } = useRequirements();

  // 3b. Derived state / computed values
  const computedValue = useMemo(() => /* ... */, [dependencies]);

  // 3c. Effects
  useEffect(() => {
    // side effects
  }, [dependencies]);

  // 3d. Event handlers
  const handleClick = () => {
    // ...
  };

  // 3e. Render helpers (if needed)
  const renderItem = (item: Item) => (
    // ...
  );

  // 3f. Return JSX
  return (
    <div>
      {/* ... */}
    </div>
  );
}
```

#### Hook Structure

```typescript
// hooks/useRequirements.ts

import { useState, useEffect, useCallback, useMemo } from "react";
import { storageService } from "@/lib/storage";
import type { Requirement, RequirementStats } from "@/types";

export function useRequirements(): UseRequirementsReturn {
  // State
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    const data = storageService.getRequirements();
    setRequirements(data);
    setIsLoading(false);
  }, []);

  // Computed values
  const stats = useMemo<RequirementStats>(
    () => ({
      total: requirements.length,
      active: requirements.filter((r) => r.isActive).length,
      inactive: requirements.filter((r) => !r.isActive).length,
      totalActiveEffort: requirements
        .filter((r) => r.isActive)
        .reduce((sum, r) => sum + r.effort, 0),
    }),
    [requirements],
  );

  // Methods
  const addRequirement = useCallback(
    (description: string, effort: number) => {
      // implementation
    },
    [requirements],
  );

  // Return public interface
  return {
    requirements,
    isLoading,
    stats,
    addRequirement,
    // ... other methods
  };
}
```

### 8.5 Security Considerations

#### XSS Prevention

```typescript
// Always escape user input when rendering
function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Or use React's built-in escaping (automatic with JSX)
<span>{requirement.description}</span>  // ✅ Safe
<span dangerouslySetInnerHTML={{__html: description}} />  // ❌ Dangerous
```

#### Input Validation

- Always validate on the client before saving
- Trim whitespace from string inputs
- Enforce maximum lengths
- Validate numeric ranges

### 8.6 Testing Approach

#### Test File Location

```
src/
├── components/
│   └── requirements/
│       ├── RequirementRow.tsx
│       └── RequirementRow.test.tsx  # Co-located test
├── hooks/
│   └── useRequirements.ts
└── lib/
    ├── validation.ts
    └── validation.test.ts  # Co-located test
```

#### Test Naming

```typescript
describe("useRequirements", () => {
  describe("addRequirement", () => {
    it("should add a new requirement with auto-incremented ID", () => {
      // ...
    });

    it("should return validation error for empty description", () => {
      // ...
    });
  });
});
```

### 8.7 Internationalization (i18n) Guidelines

#### Translation File Structure

Translation files are located in `src/locales/` with one JSON file per language:

```
src/locales/
├── en.json    # English (default)
└── th.json    # Thai
```

#### Translation Key Naming

Keys are organized into namespaces for maintainability:

```json
{
  "common": { "save": "Save", "cancel": "Cancel" },
  "header": { "export": "Export", "import": "Import" },
  "setup": { "projectName": "Project Name" },
  "dashboard": { "requirements": "Requirements" },
  "errors": { "invalidEffort": "Please enter a valid effort value" }
}
```

**Naming conventions:**

- Use camelCase for keys: `projectName`, not `project-name`
- Use descriptive keys: `projectNamePlaceholder`, not `placeholder1`
- Group related keys under namespaces
- Keep keys consistent across all language files

#### Using Translations in Components

```typescript
import { useTranslation } from 'react-i18next';

export function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('setup.createNewProject')}</h1>
      <button>{t('common.save')}</button>
    </div>
  );
}
```

#### Dynamic Values in Translations

```json
{
  "modal": {
    "deleteConfirmation": "Are you sure you want to delete requirement #{{id}}?"
  }
}
```

```typescript
t("modal.deleteConfirmation", { id: 5 });
// Output: "Are you sure you want to delete requirement #5?"
```

#### Adding a New Language

1. Create a new translation file: `src/locales/{code}.json`
2. Copy structure from `en.json` and translate all values
3. Update `src/lib/i18n/config.ts`:
   - Add language code to `SUPPORTED_LANGUAGES`
   - Import and register the new translation file

#### Thai Language Specifics

- **Font**: Noto Sans Thai is loaded for proper Thai character rendering
- **Text length**: Thai text may be longer/shorter than English; ensure UI handles variable lengths
- **Testing**: Always test UI layout with Thai translations to check for overflow or clipping

---

## Appendix

### A. Quick Reference

| Category          | Pattern/Convention                    |
| ----------------- | ------------------------------------- |
| Database          | PostgreSQL 16.x                       |
| ORM               | Prisma 6.x                            |
| API Base URL      | `/api`                                |
| API Format        | JSON (Content-Type: application/json) |
| ID format         | Auto-increment integers (SERIAL)      |
| Timestamps        | TIMESTAMPTZ (ISO 8601 in responses)   |
| Decimal places    | DECIMAL(6,2) for effort values        |
| localStorage      | `ret_language` only (language pref)   |
| Component files   | PascalCase.tsx                        |
| Hook files        | camelCase.ts (starting with `use`)    |
| API route files   | route.ts (in /api/\* directories)     |
| Branch naming     | `feature/`, `bugfix/`, `hotfix/`      |
| Commit format     | `type(scope): subject`                |
| Translation files | `src/locales/{lang}.json`             |
| Default language  | English (en)                          |
| Supported langs   | English (en), Thai (th)               |
| DB Connection     | `DATABASE_URL` environment variable   |

### B. Related Documents

- [Functional Requirements](./requirement.md) - User stories and acceptance criteria
- [PostgreSQL Migration Requirements](./requirement-2.md) - Database migration functional requirements
- [Data Schema](./data-schema.md) - Detailed data model documentation
- [Architecture](./architecture.md) - AWS deployment architecture
- [UI Requirements](./ui-requirement.md) - Screen specifications and user flows

### C. Changelog

| Version | Date       | Author | Changes                                                                                                                                                                                        |
| ------- | ---------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0     | 2026-02-11 | -      | Initial technical specification                                                                                                                                                                |
| 1.1     | 2026-02-11 | -      | Added i18n support: Thai language, i18next integration, translation keys                                                                                                                       |
| 2.0     | 2026-02-11 | -      | Major architecture migration: localStorage → PostgreSQL. Added Prisma ORM, Next.js API Routes, REST API endpoints, database schema. Updated all diagrams and contracts for client-server model |

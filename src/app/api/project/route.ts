/**
 * Project API Route
 * Handles CRUD operations for the single project
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { validateProjectName } from "@/lib/validation";

/**
 * GET /api/project
 * Returns the current project or 404 if none exists
 */
export async function GET() {
  try {
    const project = await prisma.project.findFirst({
      orderBy: { createdAt: "desc" },
    });

    if (!project) {
      return NextResponse.json({ error: "No project found" }, { status: 404 });
    }

    return NextResponse.json({
      id: project.id,
      name: project.name,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      nextRequirementId: project.nextRequirementId,
    });
  } catch (error) {
    console.error("GET /api/project error:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/project
 * Creates a new project (deletes existing if any)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    // Validate project name
    const validation = validateProjectName(name);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Delete existing project and requirements (cascade)
    await prisma.project.deleteMany();

    // Create new project
    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        nextRequirementId: 1,
      },
    });

    return NextResponse.json(
      {
        id: project.id,
        name: project.name,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
        nextRequirementId: project.nextRequirementId,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/project error:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/project
 * Updates the current project
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    // Validate project name if provided
    if (name !== undefined) {
      const validation = validateProjectName(name);
      if (!validation.isValid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
    }

    // Find existing project
    const existingProject = await prisma.project.findFirst({
      orderBy: { createdAt: "desc" },
    });

    if (!existingProject) {
      return NextResponse.json({ error: "No project found" }, { status: 404 });
    }

    // Update project
    const project = await prisma.project.update({
      where: { id: existingProject.id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
      },
    });

    return NextResponse.json({
      id: project.id,
      name: project.name,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      nextRequirementId: project.nextRequirementId,
    });
  } catch (error) {
    console.error("PUT /api/project error:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/project
 * Deletes the current project and all requirements
 */
export async function DELETE() {
  try {
    // Check if project exists first
    const existingProject = await prisma.project.findFirst();

    if (!existingProject) {
      return NextResponse.json({ error: "No project found" }, { status: 404 });
    }

    await prisma.project.deleteMany();

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/project error:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 },
    );
  }
}

/**
 * Requirements API Route
 * Handles list and create operations for requirements
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { validateDescription, validateEffort } from "@/lib/validation";
import { normalizeEffort } from "@/lib/format";

/**
 * GET /api/requirements
 * Returns all requirements for the current project
 */
export async function GET() {
  try {
    // Find the current project
    const project = await prisma.project.findFirst({
      orderBy: { createdAt: "desc" },
    });

    if (!project) {
      return NextResponse.json({ error: "No project found" }, { status: 404 });
    }

    // Get all requirements for the project
    const requirements = await prisma.requirement.findMany({
      where: { projectId: project.id },
      orderBy: { id: "asc" },
    });

    return NextResponse.json(
      requirements.map((req) => ({
        id: req.id,
        projectId: req.projectId,
        description: req.description,
        effort: Number(req.effort),
        isActive: req.isActive,
        createdAt: req.createdAt.toISOString(),
      })),
    );
  } catch (error) {
    console.error("GET /api/requirements error:", error);
    return NextResponse.json(
      { error: "Failed to fetch requirements" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/requirements
 * Creates a new requirement
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { description, effort } = body;

    // Validate description
    const descValidation = validateDescription(description);
    if (!descValidation.isValid) {
      return NextResponse.json(
        { error: descValidation.error },
        { status: 400 },
      );
    }

    // Validate effort
    const effortValidation = validateEffort(effort);
    if (!effortValidation.isValid) {
      return NextResponse.json(
        { error: effortValidation.error },
        { status: 400 },
      );
    }

    // Find the current project
    const project = await prisma.project.findFirst({
      orderBy: { createdAt: "desc" },
    });

    if (!project) {
      return NextResponse.json(
        { error: "No project found. Create a project first." },
        { status: 404 },
      );
    }

    // Create requirement and update project's nextRequirementId in a transaction
    const [requirement] = await prisma.$transaction([
      prisma.requirement.create({
        data: {
          projectId: project.id,
          description: description.trim(),
          effort: normalizeEffort(effort),
          isActive: true,
        },
      }),
      prisma.project.update({
        where: { id: project.id },
        data: { nextRequirementId: project.nextRequirementId + 1 },
      }),
    ]);

    return NextResponse.json(
      {
        id: requirement.id,
        projectId: requirement.projectId,
        description: requirement.description,
        effort: Number(requirement.effort),
        isActive: requirement.isActive,
        createdAt: requirement.createdAt.toISOString(),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/requirements error:", error);
    return NextResponse.json(
      { error: "Failed to create requirement" },
      { status: 500 },
    );
  }
}

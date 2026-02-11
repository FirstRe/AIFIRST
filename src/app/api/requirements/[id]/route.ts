/**
 * Single Requirement API Route
 * Handles GET, PUT, DELETE for a specific requirement
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { validateDescription, validateEffort } from "@/lib/validation";
import { normalizeEffort } from "@/lib/format";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/requirements/[id]
 * Returns a single requirement by ID
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const requirementId = parseInt(id, 10);

    if (isNaN(requirementId)) {
      return NextResponse.json(
        { error: "Invalid requirement ID" },
        { status: 400 },
      );
    }

    const requirement = await prisma.requirement.findUnique({
      where: { id: requirementId },
    });

    if (!requirement) {
      return NextResponse.json(
        { error: "Requirement not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      id: requirement.id,
      projectId: requirement.projectId,
      description: requirement.description,
      effort: Number(requirement.effort),
      isActive: requirement.isActive,
      createdAt: requirement.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("GET /api/requirements/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch requirement" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/requirements/[id]
 * Updates a requirement
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const requirementId = parseInt(id, 10);

    if (isNaN(requirementId)) {
      return NextResponse.json(
        { error: "Invalid requirement ID" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { description, effort, isActive } = body;

    // Validate description if provided
    if (description !== undefined) {
      const descValidation = validateDescription(description);
      if (!descValidation.isValid) {
        return NextResponse.json(
          { error: descValidation.error },
          { status: 400 },
        );
      }
    }

    // Validate effort if provided
    if (effort !== undefined) {
      const effortValidation = validateEffort(effort);
      if (!effortValidation.isValid) {
        return NextResponse.json(
          { error: effortValidation.error },
          { status: 400 },
        );
      }
    }

    // Check if requirement exists
    const existing = await prisma.requirement.findUnique({
      where: { id: requirementId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Requirement not found" },
        { status: 404 },
      );
    }

    // Update requirement
    const requirement = await prisma.requirement.update({
      where: { id: requirementId },
      data: {
        ...(description !== undefined && { description: description.trim() }),
        ...(effort !== undefined && { effort: normalizeEffort(effort) }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({
      id: requirement.id,
      projectId: requirement.projectId,
      description: requirement.description,
      effort: Number(requirement.effort),
      isActive: requirement.isActive,
      createdAt: requirement.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("PUT /api/requirements/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update requirement" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/requirements/[id]
 * Deletes a requirement
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const requirementId = parseInt(id, 10);

    if (isNaN(requirementId)) {
      return NextResponse.json(
        { error: "Invalid requirement ID" },
        { status: 400 },
      );
    }

    // Check if requirement exists
    const existing = await prisma.requirement.findUnique({
      where: { id: requirementId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Requirement not found" },
        { status: 404 },
      );
    }

    await prisma.requirement.delete({
      where: { id: requirementId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/requirements/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete requirement" },
      { status: 500 },
    );
  }
}

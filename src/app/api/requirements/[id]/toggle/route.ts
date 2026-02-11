/**
 * Toggle Requirement Status API Route
 * Handles toggling the isActive status of a requirement
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

type RouteContext = { params: Promise<{ id: string }> };

/**
 * PATCH /api/requirements/[id]/toggle
 * Toggles the isActive status of a requirement
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const requirementId = parseInt(id, 10);

    if (isNaN(requirementId)) {
      return NextResponse.json(
        { error: 'Invalid requirement ID' },
        { status: 400 }
      );
    }

    // Find the requirement
    const existing = await prisma.requirement.findUnique({
      where: { id: requirementId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Requirement not found' },
        { status: 404 }
      );
    }

    // Toggle isActive status
    const requirement = await prisma.requirement.update({
      where: { id: requirementId },
      data: { isActive: !existing.isActive },
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
    console.error('PATCH /api/requirements/[id]/toggle error:', error);
    return NextResponse.json(
      { error: 'Failed to toggle requirement status' },
      { status: 500 }
    );
  }
}


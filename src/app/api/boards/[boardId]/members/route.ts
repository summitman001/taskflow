import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBoardAccess } from "@/lib/auth";
import { apiError } from "@/lib/api";

type RouteParams = { params: Promise<{ boardId: string }> };

/**
 * POST /api/boards/[boardId]/members
 * Invite user by email
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
    try {
        const { boardId } = await params;

        // EDITOR+ can invite
        await requireBoardAccess(boardId, "EDITOR");

        const body = await req.json();
        const { email, role = "EDITOR" } = body;

        if (!email) {
            return apiError.badRequest("Email is required");
        }

        // Find user by email
        const targetUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() },
        });

        if (!targetUser) {
            return apiError.badRequest("User not found with this email");
        }

        // Check if already member
        const existing = await prisma.boardMember.findUnique({
            where: {
                userId_boardId: {
                    userId: targetUser.id,
                    boardId,
                },
            },
        });

        if (existing) {
            return apiError.badRequest("User is already a member");
        }

        // Add member
        const member = await prisma.boardMember.create({
            data: {
                userId: targetUser.id,
                boardId,
                role: role === "VIEWER" ? "VIEWER" : "EDITOR",
            },
            include: {
                user: {
                    select: { id: true, email: true, name: true },
                },
            },
        });

        return NextResponse.json(member, { status: 201 });
    } catch (error) {
        console.error("[POST /api/boards/:boardId/members]", error);

        if (error instanceof Error) {
            if (error.message === "Board access denied" || error.message === "Insufficient permissions") {
                return apiError.forbidden();
            }
        }

        return apiError.serverError();
    }
}
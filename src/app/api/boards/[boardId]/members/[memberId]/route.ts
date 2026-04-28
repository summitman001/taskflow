import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser, requireBoardAccess } from "@/lib/auth";
import { apiError } from "@/lib/api";

type RouteParams = { params: Promise<{ boardId: string; memberId: string }> };

/**
 * PATCH /api/boards/[boardId]/members/[memberId]
 * Update member role (OWNER only)
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
    try {
        const { boardId, memberId } = await params;
        const body = await req.json();

        // ⭐ OWNER required
        const role = await requireBoardAccess(boardId, "OWNER");
        if (role !== "OWNER") {
            return apiError.forbidden("Only owner can change roles");
        }

        const { role: newRole } = body;
        if (!["EDITOR", "VIEWER"].includes(newRole)) {
            return apiError.badRequest("Invalid role");
        }

        const updated = await prisma.boardMember.update({
            where: { id: memberId },
            data: { role: newRole },
            include: {
                user: {
                    select: { id: true, email: true, name: true },
                },
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("[PATCH /api/boards/:boardId/members/:memberId]", error);
        return apiError.serverError();
    }
}

/**
 * DELETE /api/boards/[boardId]/members/[memberId]
 * Remove member (OWNER or self-remove)
 */
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
    try {
        const user = await getOrCreateUser();
        const { boardId, memberId } = await params;

        const member = await prisma.boardMember.findUnique({
            where: { id: memberId },
            select: { userId: true, role: true },
        });

        if (!member) return apiError.notFound("Member");

        // ⭐ Can remove if: OWNER of board OR removing yourself
        const boardRole = await requireBoardAccess(boardId, "VIEWER");
        const canRemove = boardRole === "OWNER" || member.userId === user.id;

        if (!canRemove) {
            return apiError.forbidden("Cannot remove this member");
        }

        // ⭐ Prevent owner from removing themselves
        if (member.role === "OWNER") {
            return apiError.badRequest("Owner cannot leave board");
        }

        await prisma.boardMember.delete({ where: { id: memberId } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[DELETE /api/boards/:boardId/members/:memberId]", error);
        return apiError.serverError();
    }
}
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser, requireBoardAccess } from "@/lib/auth";
import { apiError, validateTitle } from "@/lib/api";

type RouteParams = { params: Promise<{ boardId: string }> };

/**
 * GET /api/boards/[boardId]
 * ⭐ Artık member olan herkes erişebilir (viewer+)
 */
export async function GET(_req: NextRequest, { params }: RouteParams) {
    try {
        const { boardId } = await params;
        
        // ⭐ Access check (VIEWER yeterli)
        await requireBoardAccess(boardId, "VIEWER");

        const board = await prisma.board.findUnique({
            where: { id: boardId },
            include: {
                owner: {
                    select: { id: true, email: true, name: true },
                },
                members: {
                    include: {
                        user: {
                            select: { id: true, email: true, name: true },
                        },
                    },
                    orderBy: { joinedAt: "asc" },
                },
                columns: {
                    orderBy: { position: "asc" },
                    include: {
                        cards: {
                            orderBy: { position: "asc" },
                        },
                    },
                },
            },
        });

        if (!board) return apiError.notFound("Board");

        return NextResponse.json(board);
    } catch (error) {
        console.error("[GET /api/boards/:boardId]", error);
        if (error instanceof Error && error.message === "Board access denied") {
            return apiError.forbidden();
        }
        return apiError.serverError();
    }
}

/**
 * PATCH /api/boards/[boardId]
 * ⭐ EDITOR+ gerekli
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
    try {
        const { boardId } = await params;
        const body = await req.json();

        const titleError = validateTitle(body.title);
        if (titleError) return apiError.badRequest(titleError);

        // ⭐ EDITOR access required
        await requireBoardAccess(boardId, "EDITOR");

        const updated = await prisma.board.update({
            where: { id: boardId },
            data: { title: body.title.trim() },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("[PATCH /api/boards/:boardId]", error);
        if (error instanceof Error && error.message === "Board access denied") {
            return apiError.forbidden();
        }
        return apiError.serverError();
    }
}

/**
 * DELETE /api/boards/[boardId]
 * ⭐ Sadece OWNER silebilir
 */
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
    try {
        const { boardId } = await params;

        // ⭐ OWNER required
        const role = await requireBoardAccess(boardId, "OWNER");
        if (role !== "OWNER") {
            return apiError.forbidden("Only owner can delete board");
        }

        await prisma.board.delete({ where: { id: boardId } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[DELETE /api/boards/:boardId]", error);
        if (error instanceof Error && error.message === "Board access denied") {
            return apiError.forbidden();
        }
        return apiError.serverError();
    }
}
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/auth";
import { apiError, validateTitle } from "@/lib/api";

type RouteParams = { params: Promise<{ boardId: string }> };

/**
 * GET /api/boards/[boardId]
 * Board'u column ve kartlarıyla birlikte döndür (eager load).
 * Bu endpoint kanban view'ın ana veri kaynağı.
 */
export async function GET(_req: NextRequest, { params }: RouteParams) {
    try {
        const user = await getOrCreateUser();
        const { boardId } = await params;

        const board = await prisma.board.findUnique({
            where: { id: boardId },
            include: {
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
        if (board.ownerId !== user.id) return apiError.forbidden();

        return NextResponse.json(board);
    } catch (error) {
        console.error("[GET /api/boards/:boardId]", error);
        return apiError.serverError();
    }
}

/**
 * PATCH /api/boards/[boardId]
 * Board başlığını güncelle.
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
    try {
        const user = await getOrCreateUser();
        const { boardId } = await params;
        const body = await req.json();

        const titleError = validateTitle(body.title);
        if (titleError) return apiError.badRequest(titleError);

        // Sahiplik kontrolü
        const existing = await prisma.board.findUnique({
            where: { id: boardId },
            select: { ownerId: true },
        });
        if (!existing) return apiError.notFound("Board");
        if (existing.ownerId !== user.id) return apiError.forbidden();

        const updated = await prisma.board.update({
            where: { id: boardId },
            data: { title: body.title.trim() },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("[PATCH /api/boards/:boardId]", error);
        return apiError.serverError();
    }
}

/**
 * DELETE /api/boards/[boardId]
 * Board'u sil (cascade ile column ve kartlar da gider).
 */
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
    try {
        const user = await getOrCreateUser();
        const { boardId } = await params;

        const existing = await prisma.board.findUnique({
            where: { id: boardId },
            select: { ownerId: true },
        });
        if (!existing) return apiError.notFound("Board");
        if (existing.ownerId !== user.id) return apiError.forbidden();

        await prisma.board.delete({ where: { id: boardId } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[DELETE /api/boards/:boardId]", error);
        return apiError.serverError();
    }
}
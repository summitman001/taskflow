import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/auth";
import { apiError, validateTitle, validatePosition } from "@/lib/api";

/**
 * POST /api/columns
 * Belirli bir board'a yeni column ekle.
 * Body: { boardId, title, position }
 */
export async function POST(req: NextRequest) {
    try {
        const user = await getOrCreateUser();
        const body = await req.json();

        if (typeof body.boardId !== "string") {
            return apiError.badRequest("boardId is required");
        }

        const titleError = validateTitle(body.title);
        if (titleError) return apiError.badRequest(titleError);

        const positionError = validatePosition(body.position);
        if (positionError) return apiError.badRequest(positionError);

        // Board sahipliği kontrolü
        const board = await prisma.board.findUnique({
            where: { id: body.boardId },
            select: { ownerId: true },
        });
        if (!board) return apiError.notFound("Board");
        if (board.ownerId !== user.id) return apiError.forbidden();

        const column = await prisma.column.create({
            data: {
                title: body.title.trim(),
                position: body.position,
                boardId: body.boardId,
            },
        });

        return NextResponse.json(column, { status: 201 });
    } catch (error) {
        console.error("[POST /api/columns]", error);
        return apiError.serverError();
    }
}
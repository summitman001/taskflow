import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBoardAccess } from "@/lib/auth";
import { apiError, validateTitle, validatePosition } from "@/lib/api";

/**
 * POST /api/columns
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        if (typeof body.boardId !== "string") {
            return apiError.badRequest("boardId is required");
        }

        const titleError = validateTitle(body.title);
        if (titleError) return apiError.badRequest(titleError);

        const positionError = validatePosition(body.position);
        if (positionError) return apiError.badRequest(positionError);

        // ⭐ EDITOR+ gerekli
        await requireBoardAccess(body.boardId, "EDITOR");

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

        if (error instanceof Error) {
            if (error.message === "Board access denied" || error.message === "Insufficient permissions") {
                return apiError.forbidden();
            }
        }

        return apiError.serverError();
    }
}
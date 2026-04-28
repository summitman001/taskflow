import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser, requireBoardAccess } from "@/lib/auth";
import { apiError, validateTitle, validatePosition } from "@/lib/api";

/**
 * POST /api/cards
 */
export async function POST(req: NextRequest) {
    try {
        const user = await getOrCreateUser();
        const body = await req.json();

        if (typeof body.columnId !== "string") {
            return apiError.badRequest("columnId is required");
        }

        const titleError = validateTitle(body.title);
        if (titleError) return apiError.badRequest(titleError);

        const positionError = validatePosition(body.position);
        if (positionError) return apiError.badRequest(positionError);

        if (
            body.description !== undefined &&
            body.description !== null &&
            typeof body.description !== "string"
        ) {
            return apiError.badRequest("description must be a string");
        }

        if (body.priority !== undefined && body.priority !== null) {
            if (!["low", "medium", "high"].includes(body.priority)) {
                return apiError.badRequest("priority must be one of: low, medium, high");
            }
        }

        if (body.dueDate !== undefined && body.dueDate !== null) {
            const parsed = new Date(body.dueDate);
            if (isNaN(parsed.getTime())) {
                return apiError.badRequest("dueDate must be a valid ISO date string");
            }
        }

        // ⭐ Column'un board'unu bul ve access check
        const column = await prisma.column.findUnique({
            where: { id: body.columnId },
            select: { boardId: true },
        });

        if (!column) return apiError.notFound("Column");

        // ⭐ EDITOR+ gerekli
        await requireBoardAccess(column.boardId, "EDITOR");

        const card = await prisma.card.create({
            data: {
                title: body.title.trim(),
                description: body.description?.trim() || null,
                position: body.position,
                columnId: body.columnId,
                priority: body.priority ?? null,
                dueDate: body.dueDate ? new Date(body.dueDate) : null,
            },
        });

        return NextResponse.json(card, { status: 201 });
    } catch (error) {
        console.error("[POST /api/cards]", error);

        if (error instanceof Error) {
            if (error.message === "Board access denied" || error.message === "Insufficient permissions") {
                return apiError.forbidden();
            }
        }

        return apiError.serverError();
    }
}
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/auth";
import { apiError, validateTitle, validatePosition } from "@/lib/api";

/**
 * POST /api/cards
 * Belirli bir column'a yeni kart ekle.
 * Body: { columnId, title, position, description? }
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

        // Priority validation
        if (body.priority !== undefined && body.priority !== null) {
            if (!["low", "medium", "high"].includes(body.priority)) {
                return apiError.badRequest("priority must be one of: low, medium, high");
            }
        }

        // Due date validation
        if (body.dueDate !== undefined && body.dueDate !== null) {
            const parsed = new Date(body.dueDate);
            if (isNaN(parsed.getTime())) {
                return apiError.badRequest("dueDate must be a valid ISO date string");
            }
        }

        // Column sahipliği kontrolü (board üzerinden)
        const column = await prisma.column.findUnique({
            where: { id: body.columnId },
            include: { board: { select: { ownerId: true } } },
        });
        if (!column) return apiError.notFound("Column");
        if (column.board.ownerId !== user.id) return apiError.forbidden();

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
        return apiError.serverError();
    }
}
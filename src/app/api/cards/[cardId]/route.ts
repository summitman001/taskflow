import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/auth";
import { apiError, validateTitle, validatePosition } from "@/lib/api";

type RouteParams = { params: Promise<{ cardId: string }> };

/**
 * Card sahipliği kontrolü — card → column → board → ownerId zinciri.
 */
async function getCardIfOwner(cardId: string, userId: string) {
    const card = await prisma.card.findUnique({
        where: { id: cardId },
        include: {
            column: {
                include: {
                    board: { select: { ownerId: true } },
                },
            },
        },
    });

    if (!card) return { error: "notFound" as const };
    if (card.column.board.ownerId !== userId) {
        return { error: "forbidden" as const };
    }
    return { card };
}

/**
 * PATCH /api/cards/[cardId]
 * Kartı düzenle veya taşı.
 *
 * Aynı endpoint iki işi yapar:
 * - Düzenleme: { title?, description? }
 * - Taşıma:    { columnId?, position? }
 *
 * Frontend bu sayede drag-drop için ayrı endpoint'e gerek duymaz.
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
    try {
        const user = await getOrCreateUser();
        const { cardId } = await params;
        const body = await req.json();

        const result = await getCardIfOwner(cardId, user.id);
        if (result.error === "notFound") return apiError.notFound("Card");
        if (result.error === "forbidden") return apiError.forbidden();

        const data: {
            title?: string;
            description?: string | null;
            position?: string;
            columnId?: string;
        } = {};

        if (body.title !== undefined) {
            const titleError = validateTitle(body.title);
            if (titleError) return apiError.badRequest(titleError);
            data.title = body.title.trim();
        }

        if (body.description !== undefined) {
            if (body.description === null) {
                data.description = null;
            } else if (typeof body.description === "string") {
                data.description = body.description.trim() || null;
            } else {
                return apiError.badRequest("description must be a string or null");
            }
        }

        if (body.position !== undefined) {
            const positionError = validatePosition(body.position);
            if (positionError) return apiError.badRequest(positionError);
            data.position = body.position;
        }

        if (body.columnId !== undefined) {
            if (typeof body.columnId !== "string") {
                return apiError.badRequest("columnId must be a string");
            }

            // Hedef column kullanıcıya ait mi kontrol et
            const targetColumn = await prisma.column.findUnique({
                where: { id: body.columnId },
                include: { board: { select: { ownerId: true } } },
            });
            if (!targetColumn) return apiError.notFound("Target column");
            if (targetColumn.board.ownerId !== user.id) return apiError.forbidden();

            data.columnId = body.columnId;
        }

        if (Object.keys(data).length === 0) {
            return apiError.badRequest("No valid fields to update");
        }

        const updated = await prisma.card.update({
            where: { id: cardId },
            data,
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("[PATCH /api/cards/:cardId]", error);
        return apiError.serverError();
    }
}

/**
 * DELETE /api/cards/[cardId]
 */
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
    try {
        const user = await getOrCreateUser();
        const { cardId } = await params;

        const result = await getCardIfOwner(cardId, user.id);
        if (result.error === "notFound") return apiError.notFound("Card");
        if (result.error === "forbidden") return apiError.forbidden();

        await prisma.card.delete({ where: { id: cardId } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[DELETE /api/cards/:cardId]", error);
        return apiError.serverError();
    }
}
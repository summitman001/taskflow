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
            priority?: string | null;
            dueDate?: Date | null;
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

        if (body.priority !== undefined) {
            if (body.priority === null) {
                data.priority = null;
            } else if (
                typeof body.priority === "string" &&
                ["low", "medium", "high"].includes(body.priority)
            ) {
                data.priority = body.priority;
            } else {
                return apiError.badRequest("priority must be one of: low, medium, high, or null");
            }
        }

        if (body.dueDate !== undefined) {
            if (body.dueDate === null) {
                data.dueDate = null;
            } else {
                const parsed = new Date(body.dueDate);
                if (isNaN(parsed.getTime())) {
                    return apiError.badRequest("dueDate must be a valid ISO date string or null");
                }
                data.dueDate = parsed;
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

        // columnId değiştiriliyorsa, log için kaynak ve hedef column'ı al
        const isMoving = data.columnId !== undefined && data.columnId !== result.card.columnId;

        let fromColumnInfo: { id: string; title: string } | null = null;
        let toColumnInfo: { id: string; title: string } | null = null;

        if (isMoving) {
            fromColumnInfo = {
                id: result.card.columnId,
                title: result.card.column.title,
            };

            // Hedef column zaten yukarıda fetch edildi (targetColumn), ama
            // burada yeniden almamız gerek (TypeScript scope için)
            const targetCol = await prisma.column.findUnique({
                where: { id: data.columnId! },
                select: { id: true, title: true },
            });
            if (targetCol) {
                toColumnInfo = { id: targetCol.id, title: targetCol.title };
            }
        }

        // Update + activity log atomik olarak
        const updated = await prisma.$transaction(async (tx) => {
            const card = await tx.card.update({
                where: { id: cardId },
                data,
            });

            // Eğer kart taşındıysa, activity log ekle
            if (isMoving && fromColumnInfo && toColumnInfo) {
                await tx.cardActivity.create({
                    data: {
                        cardId: cardId,
                        userId: user.id,
                        type: "moved",
                        metadata: {
                            fromColumn: fromColumnInfo,
                            toColumn: toColumnInfo,
                        },
                    },
                });
            }

            return card;
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
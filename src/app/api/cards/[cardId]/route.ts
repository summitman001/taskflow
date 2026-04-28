import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser, requireBoardAccess } from "@/lib/auth";
import { apiError, validateTitle, validatePosition } from "@/lib/api";

type RouteParams = { params: Promise<{ cardId: string }> };

/**
 * PATCH /api/cards/[cardId]
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
    try {
        const user = await getOrCreateUser();
        const { cardId } = await params;
        const body = await req.json();

        // Card ve board bilgisini çek
        const card = await prisma.card.findUnique({
            where: { id: cardId },
            include: {
                column: { select: { boardId: true, title: true } },
            },
        });

        if (!card) return apiError.notFound("Card");

        // ⭐ EDITOR+ gerekli
        await requireBoardAccess(card.column.boardId, "EDITOR");

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

            // ⭐ Hedef column aynı board'da mı?
            const targetColumn = await prisma.column.findUnique({
                where: { id: body.columnId },
                select: { boardId: true },
            });

            if (!targetColumn) return apiError.notFound("Target column");

            // Farklı board'a taşınmaya çalışılıyorsa
            if (targetColumn.boardId !== card.column.boardId) {
                return apiError.badRequest("Cannot move card to different board");
            }

            data.columnId = body.columnId;
        }

        if (Object.keys(data).length === 0) {
            return apiError.badRequest("No valid fields to update");
        }

        // Move activity için bilgi topla
        const isMoving = data.columnId !== undefined && data.columnId !== card.columnId;
        let fromColumnInfo: { id: string; title: string } | null = null;
        let toColumnInfo: { id: string; title: string } | null = null;

        if (isMoving) {
            fromColumnInfo = {
                id: card.columnId,
                title: card.column.title,
            };

            const targetCol = await prisma.column.findUnique({
                where: { id: data.columnId! },
                select: { id: true, title: true },
            });

            if (targetCol) {
                toColumnInfo = { id: targetCol.id, title: targetCol.title };
            }
        }

        // Update + activity log
        const updated = await prisma.$transaction(async (tx) => {
            const updatedCard = await tx.card.update({
                where: { id: cardId },
                data,
            });

            // ⭐ Move activity
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

            // ⭐ YENİ: Edit activity (title, description, priority, dueDate değiştiyse)
            const hasEdits = 
                data.title !== undefined || 
                data.description !== undefined || 
                data.priority !== undefined || 
                data.dueDate !== undefined;

            if (hasEdits && !isMoving) { // Move zaten ayrı log olarak ekleniyor
                const changes: Record<string, any> = {};
                
                if (data.title !== undefined && data.title !== card.title) {
                    changes.title = { from: card.title, to: data.title };
                }
                if (data.description !== undefined) {
                    changes.description = { changed: true };
                }
                if (data.priority !== undefined) {
                    changes.priority = { to: data.priority };
                }
                if (data.dueDate !== undefined) {
                    changes.dueDate = { to: data.dueDate };
                }

                // Sadece gerçekten değişiklik varsa log ekle
                if (Object.keys(changes).length > 0) {
                    await tx.cardActivity.create({
                        data: {
                            cardId: cardId,
                            userId: user.id,
                            type: "edited",
                            metadata: changes,
                        },
                    });
                }
            }

            return updatedCard;
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("[PATCH /api/cards/:cardId]", error);

        if (error instanceof Error) {
            if (error.message === "Board access denied" || error.message === "Insufficient permissions") {
                return apiError.forbidden();
            }
        }

        return apiError.serverError();
    }
}

/**
 * DELETE /api/cards/[cardId]
 */
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
    try {
        const { cardId } = await params;

        const card = await prisma.card.findUnique({
            where: { id: cardId },
            include: { column: { select: { boardId: true } } },
        });

        if (!card) return apiError.notFound("Card");

        // ⭐ EDITOR+ gerekli
        await requireBoardAccess(card.column.boardId, "EDITOR");

        await prisma.card.delete({ where: { id: cardId } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[DELETE /api/cards/:cardId]", error);

        if (error instanceof Error) {
            if (error.message === "Board access denied" || error.message === "Insufficient permissions") {
                return apiError.forbidden();
            }
        }

        return apiError.serverError();
    }
}
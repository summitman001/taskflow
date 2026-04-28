import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBoardAccess } from "@/lib/auth";
import { apiError } from "@/lib/api";

type RouteParams = { params: Promise<{ cardId: string }> };

/**
 * GET /api/cards/[cardId]/activity
 */
export async function GET(_req: NextRequest, { params }: RouteParams) {
    try {
        const { cardId } = await params;

        // Card'ın board'unu bul
        const card = await prisma.card.findUnique({
            where: { id: cardId },
            include: {
                column: { select: { boardId: true } },
            },
        });

        if (!card) return apiError.notFound("Card");

        // ⭐ VIEWER yeterli (sadece okuma)
        await requireBoardAccess(card.column.boardId, "VIEWER");

        // Aktiviteleri çek
        const activities = await prisma.cardActivity.findMany({
            where: { cardId },
            orderBy: { createdAt: "desc" },
            take: 50,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        return NextResponse.json({
            card: {
                id: card.id,
                createdAt: card.createdAt,
                updatedAt: card.updatedAt,
            },
            activities,
        });
    } catch (error) {
        console.error("[GET /api/cards/:cardId/activity]", error);

        if (error instanceof Error) {
            if (error.message === "Board access denied" || error.message === "Insufficient permissions") {
                return apiError.forbidden();
            }
        }

        return apiError.serverError();
    }
}
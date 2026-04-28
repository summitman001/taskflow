import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/auth";
import { apiError } from "@/lib/api";

type RouteParams = { params: Promise<{ cardId: string }> };

/**
 * GET /api/cards/[cardId]/activity
 * Bir kartın aktivite geçmişini ve oluşturma bilgisini döndür.
 */
export async function GET(_req: NextRequest, { params }: RouteParams) {
    try {
        const user = await getOrCreateUser();
        const { cardId } = await params;

        // Önce kartı + sahiplik bilgisi çek
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

        if (!card) return apiError.notFound("Card");
        if (card.column.board.ownerId !== user.id) return apiError.forbidden();

        // Aktiviteleri kullanıcı bilgisi ile birlikte çek
        const activities = await prisma.cardActivity.findMany({
            where: { cardId },
            orderBy: { createdAt: "desc" },
            take: 50, // son 50 aktivite yeter
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
        return apiError.serverError();
    }
}
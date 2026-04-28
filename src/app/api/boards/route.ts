import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/auth";
import { apiError, validateTitle } from "@/lib/api";
import { generateKeyBetween } from "fractional-indexing";

/**
 * GET /api/boards
 * Kullanıcının ERİŞEBİLDİĞİ tüm board'ları döndür (owner + member).
 */
export async function GET() {
    try {
        const user = await getOrCreateUser();

        const boards = await prisma.board.findMany({
            where: {
                OR: [
                    { ownerId: user.id },              // Owner olduğu
                    {
                        members: {
                            some: { userId: user.id }, // Member olduğu
                        },
                    },
                ],
            },
            orderBy: { updatedAt: "desc" },
            select: {
                id: true,
                title: true,
                ownerId: true,  // ⭐ Frontend için owner check
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: { columns: true },
                },
                columns: {
                    orderBy: { position: "asc" },
                    take: 4,
                    select: {
                        id: true,
                        title: true,
                        _count: {
                            select: { cards: true },
                        },
                    },
                },
                // ⭐ Member sayısını göster
                members: {
                    select: {
                        id: true,
                        role: true,
                        user: {
                            select: {
                                id: true,
                                email: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        return NextResponse.json(boards);
    } catch (error) {
        console.error("[GET /api/boards]", error);
        return apiError.serverError();
    }
}

/**
 * POST /api/boards
 * Yeni board oluştur + owner'ı otomatik member yap.
 */
export async function POST(req: NextRequest) {
    try {
        const user = await getOrCreateUser();
        const body = await req.json();

        const titleError = validateTitle(body.title);
        if (titleError) return apiError.badRequest(titleError);

        const colPos1 = generateKeyBetween(null, null);
        const colPos2 = generateKeyBetween(colPos1, null);
        const colPos3 = generateKeyBetween(colPos2, null);

        const board = await prisma.board.create({
            data: {
                title: body.title.trim(),
                ownerId: user.id,
                columns: {
                    create: [
                        { title: "To Do", position: colPos1 },
                        { title: "In Progress", position: colPos2 },
                        { title: "Done", position: colPos3 },
                    ],
                },
                // ⭐ Owner'ı otomatik member yap
                members: {
                    create: {
                        userId: user.id,
                        role: "OWNER",
                    },
                },
            },
            include: {
                columns: true,
                members: true,
            },
        });

        return NextResponse.json(board, { status: 201 });
    } catch (error) {
        console.error("[POST /api/boards]", error);
        return apiError.serverError();
    }
}
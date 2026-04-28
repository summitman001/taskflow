import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/auth";
import { apiError, validateTitle } from "@/lib/api";
import { generateKeyBetween } from "fractional-indexing";

/**
 * GET /api/boards
 * Kullanıcının tüm board'larını döndür.
 */
export async function GET() {
    try {
        const user = await getOrCreateUser();
        const boards = await prisma.board.findMany({
            where: { ownerId: user.id },
            orderBy: { updatedAt: "desc" },
            select: {
                id: true,
                title: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: { columns: true },
                },
                columns: {
                    orderBy: { position: "asc" },
                    take: 4, // İlk 4 column yeter (preview için)
                    select: {
                        id: true,
                        title: true,
                        _count: {
                            select: { cards: true },
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
 * Yeni board oluştur.
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
            },
            include: {
                columns: true,
            },
        });

        return NextResponse.json(board, { status: 201 });
    } catch (error) {
        console.error("[POST /api/boards]", error);
        return apiError.serverError();
    }
}
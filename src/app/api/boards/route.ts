import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/auth";
import { apiError, validateTitle } from "@/lib/api";

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

        const board = await prisma.board.create({
            data: {
                title: body.title.trim(),
                ownerId: user.id,
            },
        });

        return NextResponse.json(board, { status: 201 });
    } catch (error) {
        console.error("[POST /api/boards]", error);
        return apiError.serverError();
    }
}
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/auth";
import { apiError, validateTitle, validatePosition } from "@/lib/api";

type RouteParams = { params: Promise<{ columnId: string }> };

/**
 * Bir column'u kullanıcının erişebileceği bir board'a ait mi diye kontrol et.
 * Erişim varsa column'u, yoksa null döner.
 */
async function getColumnIfOwner(columnId: string, userId: string) {
    const column = await prisma.column.findUnique({
        where: { id: columnId },
        include: {
            board: { select: { ownerId: true } },
        },
    });

    if (!column) return { error: "notFound" as const };
    if (column.board.ownerId !== userId) return { error: "forbidden" as const };
    return { column };
}

/**
 * PATCH /api/columns/[columnId]
 * Column başlığı veya pozisyonunu güncelle (kısmi update).
 * Body: { title?, position? }
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
    try {
        const user = await getOrCreateUser();
        const { columnId } = await params;
        const body = await req.json();

        const result = await getColumnIfOwner(columnId, user.id);
        if (result.error === "notFound") return apiError.notFound("Column");
        if (result.error === "forbidden") return apiError.forbidden();

        // Sadece gönderilen alanları güncelle
        const data: { title?: string; position?: string } = {};

        if (body.title !== undefined) {
            const titleError = validateTitle(body.title);
            if (titleError) return apiError.badRequest(titleError);
            data.title = body.title.trim();
        }

        if (body.position !== undefined) {
            const positionError = validatePosition(body.position);
            if (positionError) return apiError.badRequest(positionError);
            data.position = body.position;
        }

        if (Object.keys(data).length === 0) {
            return apiError.badRequest("No valid fields to update");
        }

        const updated = await prisma.column.update({
            where: { id: columnId },
            data,
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("[PATCH /api/columns/:columnId]", error);
        return apiError.serverError();
    }
}

/**
 * DELETE /api/columns/[columnId]
 * Column'u sil (cascade ile içindeki kartlar da gider).
 */
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
    try {
        const user = await getOrCreateUser();
        const { columnId } = await params;

        const result = await getColumnIfOwner(columnId, user.id);
        if (result.error === "notFound") return apiError.notFound("Column");
        if (result.error === "forbidden") return apiError.forbidden();

        await prisma.column.delete({ where: { id: columnId } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[DELETE /api/columns/:columnId]", error);
        return apiError.serverError();
    }
}
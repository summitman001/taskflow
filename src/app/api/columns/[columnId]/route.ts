import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBoardAccess } from "@/lib/auth";
import { apiError, validateTitle, validatePosition } from "@/lib/api";

type RouteParams = { params: Promise<{ columnId: string }> };

/**
 * PATCH /api/columns/[columnId]
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
    try {
        const { columnId } = await params;
        const body = await req.json();

        const column = await prisma.column.findUnique({
            where: { id: columnId },
            select: { boardId: true },
        });

        if (!column) return apiError.notFound("Column");

        // ⭐ EDITOR+ gerekli
        await requireBoardAccess(column.boardId, "EDITOR");

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

        if (error instanceof Error) {
            if (error.message === "Board access denied" || error.message === "Insufficient permissions") {
                return apiError.forbidden();
            }
        }

        return apiError.serverError();
    }
}

/**
 * DELETE /api/columns/[columnId]
 */
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
    try {
        const { columnId } = await params;

        const column = await prisma.column.findUnique({
            where: { id: columnId },
            select: { boardId: true },
        });

        if (!column) return apiError.notFound("Column");

        // ⭐ EDITOR+ gerekli
        await requireBoardAccess(column.boardId, "EDITOR");

        await prisma.column.delete({ where: { id: columnId } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[DELETE /api/columns/:columnId]", error);

        if (error instanceof Error) {
            if (error.message === "Board access denied" || error.message === "Insufficient permissions") {
                return apiError.forbidden();
            }
        }

        return apiError.serverError();
    }
}
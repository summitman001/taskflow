import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

/**
 * Clerk'te login olmuş kullanıcının DB'deki karşılığını döndürür.
 * DB'de yoksa otomatik oluşturur (lazy sync).
 *
 * Tüm korumalı API route'larında ve server component'larda kullan.
 */
export async function getOrCreateUser() {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    // DB'de var mı?
    let user = await prisma.user.findUnique({
        where: { id: userId },
    });

    // Yoksa Clerk'ten bilgileri çekip oluştur
    if (!user) {
        const clerkUser = await currentUser();

        if (!clerkUser) {
            throw new Error("Clerk user not found");
        }

        const email = clerkUser.emailAddresses[0]?.emailAddress;

        if (!email) {
            throw new Error("User email not found");
        }

        user = await prisma.user.create({
            data: {
                id: userId,
                email,
                name: clerkUser.firstName
                    ? `${clerkUser.firstName} ${clerkUser.lastName ?? ""}`.trim()
                    : null,
            },
        });
    }

    return user;
}

/**
 * Sadece userId döndürür (DB sync etmez).
 * Hızlı auth check'leri için.
 */
export async function requireUserId() {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("Unauthorized");
    }
    return userId;
}

/**
 * Board erişim kontrolü.
 * Returns: user's role or null if no access
 */
export async function checkBoardAccess(
    userId: string,
    boardId: string,
    minimumRole: Role = "VIEWER"
): Promise<Role | null> {
    // 1. Owner check (fastest)
    const board = await prisma.board.findUnique({
        where: { id: boardId },
        select: { ownerId: true },
    });

    if (!board) return null;
    if (board.ownerId === userId) return "OWNER";

    // 2. Member check
    const member = await prisma.boardMember.findUnique({
        where: {
            userId_boardId: {
                userId,
                boardId,
            },
        },
        select: { role: true },
    });

    if (!member) return null;

    // 3. Role hierarchy check
    const hierarchy: Record<Role, number> = {
        OWNER: 3,
        EDITOR: 2,
        VIEWER: 1,
    };

    const hasAccess = hierarchy[member.role] >= hierarchy[minimumRole];
    return hasAccess ? member.role : null;
}

/**
 * Board erişimini doğrula, yoksa throw.
 */
export async function requireBoardAccess(
    boardId: string,
    minimumRole: Role = "VIEWER"
): Promise<Role> {
    const user = await getOrCreateUser();
    const role = await checkBoardAccess(user.id, boardId, minimumRole);

    if (!role) {
        throw new Error("Board access denied");
    }

    return role;
}
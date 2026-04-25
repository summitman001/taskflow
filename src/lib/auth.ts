import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

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
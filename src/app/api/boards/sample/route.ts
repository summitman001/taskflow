import { NextResponse } from "next/server";
import { generateKeyBetween } from "fractional-indexing";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/auth";
import { apiError } from "@/lib/api";

function daysFromNow(days: number): Date {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d;
}

/**
 * POST /api/boards/sample
 * Mevcut kullanıcı için örnek bir kanban board oluştur.
 * Onboarding için: yeni kullanıcı boş ekranla karşılaşmasın.
 */
export async function POST() {
    try {
        const user = await getOrCreateUser();

        // Column position'ları
        const c1 = generateKeyBetween(null, null);
        const c2 = generateKeyBetween(c1, null);
        const c3 = generateKeyBetween(c2, null);
        const c4 = generateKeyBetween(c3, null);

        // Her column için kart pozisyonları üretmek üzere helper
        const cardPositions = (count: number): string[] => {
            const positions: string[] = [];
            let prev: string | null = null;
            for (let i = 0; i < count; i++) {
                const pos = generateKeyBetween(prev, null);
                positions.push(pos);
                prev = pos;
            }
            return positions;
        };

        const backlogPos = cardPositions(4);
        const progressPos = cardPositions(3);
        const reviewPos = cardPositions(2);
        const donePos = cardPositions(2);

        const board = await prisma.board.create({
            data: {
                title: "Sprint 23 — Mobile App Launch",
                ownerId: user.id,
                columns: {
                    create: [
                        {
                            title: "Backlog",
                            position: c1,
                            cards: {
                                create: [
                                    {
                                        title: "Set up CI/CD pipeline",
                                        description: "GitHub Actions ile otomatik deploy",
                                        position: backlogPos[0],
                                        priority: "high",
                                        dueDate: daysFromNow(2),
                                    },
                                    {
                                        title: "Design onboarding flow",
                                        description: "Figma'da 3 ekranlık akış",
                                        position: backlogPos[1],
                                        priority: "medium",
                                        dueDate: daysFromNow(5),
                                    },
                                    {
                                        title: "Research push notification providers",
                                        description: "Firebase vs OneSignal karşılaştırması",
                                        position: backlogPos[2],
                                        priority: "low",
                                        dueDate: null,
                                    },
                                    {
                                        title: "Update privacy policy",
                                        description: null,
                                        position: backlogPos[3],
                                        priority: null,
                                        dueDate: daysFromNow(14),
                                    },
                                ],
                            },
                        },
                        {
                            title: "In Progress",
                            position: c2,
                            cards: {
                                create: [
                                    {
                                        title: "Implement user authentication",
                                        description: "Clerk entegrasyonu",
                                        position: progressPos[0],
                                        priority: "high",
                                        dueDate: daysFromNow(0), // Today
                                    },
                                    {
                                        title: "Build dashboard layout",
                                        description: "Responsive, mobile-first",
                                        position: progressPos[1],
                                        priority: "medium",
                                        dueDate: daysFromNow(3),
                                    },
                                    {
                                        title: "API rate limiting",
                                        description: "Redis ile sliding window",
                                        position: progressPos[2],
                                        priority: "low",
                                        dueDate: null,
                                    },
                                ],
                            },
                        },
                        {
                            title: "Review",
                            position: c3,
                            cards: {
                                create: [
                                    {
                                        title: "Code review: payment module",
                                        description: "Stripe webhook handler kontrolü",
                                        position: reviewPos[0],
                                        priority: "high",
                                        dueDate: daysFromNow(-1), // Overdue!
                                    },
                                    {
                                        title: "QA: registration flow",
                                        description: null,
                                        position: reviewPos[1],
                                        priority: "medium",
                                        dueDate: daysFromNow(1), // Tomorrow
                                    },
                                ],
                            },
                        },
                        {
                            title: "Done",
                            position: c4,
                            cards: {
                                create: [
                                    {
                                        title: "Setup monitoring (Sentry)",
                                        description: "Production error tracking aktif",
                                        position: donePos[0],
                                        priority: null,
                                        dueDate: null,
                                    },
                                    {
                                        title: "Database migration v2",
                                        description: "Eski user table'ı temizlendi",
                                        position: donePos[1],
                                        priority: null,
                                        dueDate: null,
                                    },
                                ],
                            },
                        },
                    ],
                },
            },
            include: {
                columns: true,
            },
        });

        return NextResponse.json(board, { status: 201 });
    } catch (error) {
        console.error("[POST /api/boards/sample]", error);
        return apiError.serverError();
    }
}
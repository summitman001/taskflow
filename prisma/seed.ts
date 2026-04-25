import { PrismaClient } from "@prisma/client";
import { generateKeyBetween } from "fractional-indexing";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding database...");

    // NOT: Bu seed Clerk webhook olmadığı için manuel test için.
    // Gerçek demo user'ı Clerk'te oluşturulduktan sonra manuel olarak
    // bu user ID'yi buraya yazıp script'i tekrar çalıştırabilirsin.
    // Şimdilik placeholder bir user oluşturuyoruz.

    const demoUserId = "user_3Crw1WqocMnclNM4emJAvbZIl3Y";

    // Önce demo user'ı upsert et
    const user = await prisma.user.upsert({
        where: { id: demoUserId },
        update: {},
        create: {
            id: demoUserId,
            email: "careeros.iletisindeneme@gmail.com",
            name: "Demo User",
        },
    });

    // Eski demo board varsa temizle (idempotent seed)
    await prisma.board.deleteMany({
        where: { ownerId: user.id },
    });

    // Yeni board oluştur
    const board = await prisma.board.create({
        data: {
            title: "Sprint 23 - Mobile App Launch",
            ownerId: user.id,
        },
    });

    // 4 column için fractional position'lar üret
    const colPos1 = generateKeyBetween(null, null);          // ilk
    const colPos2 = generateKeyBetween(colPos1, null);       // ikinci
    const colPos3 = generateKeyBetween(colPos2, null);       // üçüncü
    const colPos4 = generateKeyBetween(colPos3, null);       // dördüncü

    const columns = await Promise.all([
        prisma.column.create({
            data: { title: "Backlog", position: colPos1, boardId: board.id },
        }),
        prisma.column.create({
            data: { title: "In Progress", position: colPos2, boardId: board.id },
        }),
        prisma.column.create({
            data: { title: "Review", position: colPos3, boardId: board.id },
        }),
        prisma.column.create({
            data: { title: "Done", position: colPos4, boardId: board.id },
        }),
    ]);

    // Her column için kartlar (gerçekçi içerik)
    const cardsByColumn = [
        [
            { title: "Set up CI/CD pipeline", description: "GitHub Actions ile otomatik deploy" },
            { title: "Design onboarding flow", description: "Figma'da 3 ekranlık akış" },
            { title: "Research push notification providers", description: "Firebase vs OneSignal" },
            { title: "Update privacy policy", description: null },
        ],
        [
            { title: "Implement user authentication", description: "Clerk entegrasyonu" },
            { title: "Build dashboard layout", description: "Responsive, mobile-first" },
            { title: "API rate limiting", description: "Redis ile sliding window" },
        ],
        [
            { title: "Code review: payment module", description: "Stripe webhook handler kontrolü" },
            { title: "QA: registration flow", description: null },
        ],
        [
            { title: "Setup monitoring (Sentry)", description: "Production error tracking aktif" },
            { title: "Database migration v2", description: "Eski user table'ı temizlendi" },
        ],
    ];

    for (let i = 0; i < columns.length; i++) {
        let prevPos: string | null = null;
        for (const cardData of cardsByColumn[i]) {
            const pos = generateKeyBetween(prevPos, null);
            await prisma.card.create({
                data: {
                    ...cardData,
                    position: pos,
                    columnId: columns[i].id,
                },
            });
            prevPos = pos;
        }
    }

    console.log(`✅ Created board "${board.title}" with ${columns.length} columns`);
    console.log("✅ Seeding complete!");
}

main()
    .catch((e) => {
        console.error("❌ Seeding failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
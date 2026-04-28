import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Mevcut tüm board owner'larını BoardMember tablosuna OWNER olarak ekle.
 */
async function seedBoardMembers() {
    console.log("🔄 Starting board members migration...");

    const boards = await prisma.board.findMany({
        select: { id: true, ownerId: true, title: true },
    });

    console.log(`📊 Found ${boards.length} boards`);

    let created = 0;
    let skipped = 0;

    for (const board of boards) {
        try {
            // Check if already exists
            const existing = await prisma.boardMember.findUnique({
                where: {
                    userId_boardId: {
                        userId: board.ownerId,
                        boardId: board.id,
                    },
                },
            });

            if (existing) {
                skipped++;
                continue;
            }

            // Create member entry for owner
            await prisma.boardMember.create({
                data: {
                    userId: board.ownerId,
                    boardId: board.id,
                    role: "OWNER",
                },
            });

            created++;
            console.log(`✅ Added owner as member: ${board.title}`);
        } catch (error) {
            console.error(`❌ Failed for board ${board.id}:`, error);
        }
    }

    console.log(`\n📈 Migration complete:`);
    console.log(`   ✅ Created: ${created}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
}

seedBoardMembers()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
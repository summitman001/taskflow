import type { Board, Column, Card, User } from "@prisma/client";

// Prisma'nın temel tipleri
export type { Board, Column, Card, User };

// API'den gelen "tam board" tipi (column ve kartlarla birlikte)
export type BoardWithColumns = Board & {
    columns: ColumnWithCards[];
};

export type ColumnWithCards = Column & {
    cards: Card[];
};
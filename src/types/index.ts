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

// Drag-drop için ek tipler
export type DragData =
    | { type: "card"; card: Card; columnId: string }
    | { type: "column"; column: Column };
"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useUIStore } from "@/stores/useUIStore";
import type { Card as CardType } from "@/types";

interface Props {
  card: CardType;
  columnId: string;
}

export function Card({ card, columnId }: Props) {
  const setEditingCardId = useUIStore((s) => s.setEditingCardId);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: { type: "card", card, columnId },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        // Sürükleme aktifken click'i engelle
        if (isDragging) {
          e.preventDefault();
          return;
        }
        setEditingCardId(card.id);
      }}
      className={`group relative block w-full cursor-grab touch-none rounded-lg border border-slate-200 bg-white p-3 text-left shadow-sm transition-all duration-150 ease-out hover:-translate-y-[1px] hover:border-slate-300 hover:shadow-md active:cursor-grabbing ${isDragging ? "opacity-40" : ""
        }`}
    >
      <p className="text-sm font-medium text-slate-900">{card.title}</p>
      {card.description && (
        <p className="mt-1 line-clamp-2 text-xs text-slate-500">
          {card.description}
        </p>
      )}
    </div>
  );
}
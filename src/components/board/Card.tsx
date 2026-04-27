"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar } from "lucide-react";
import { useUIStore } from "@/stores/useUIStore";
import { getPriorityConfig } from "@/lib/priority";
import { getDueDateStatus, formatDueDate } from "@/lib/date";
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

  const priorityConfig = getPriorityConfig(card.priority);
  const dueDateStatus = getDueDateStatus(card.dueDate);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        if (isDragging) {
          e.preventDefault();
          return;
        }
        setEditingCardId(card.id);
      }}
      className={`group relative block w-full cursor-grab touch-none overflow-hidden rounded-lg border border-slate-200 bg-white p-3 text-left shadow-sm transition-all duration-150 ease-out hover:-translate-y-[1px] hover:border-slate-300 hover:shadow-md active:cursor-grabbing ${isDragging ? "opacity-40" : ""
        }`}
    >
      {/* High priority strip — sol kenarda kırmızı şerit */}
      {priorityConfig?.id === "high" && (
        <div className={`absolute left-0 top-0 h-full w-1 ${priorityConfig.stripClassName}`} />
      )}

      <div className={priorityConfig?.id === "high" ? "pl-1.5" : ""}>
        <p className="text-sm font-medium text-slate-900">{card.title}</p>

        {card.description && (
          <p className="mt-1 line-clamp-2 text-xs text-slate-500">
            {card.description}
          </p>
        )}

        {/* Footer: priority dot + due date */}
        {(priorityConfig || card.dueDate) && (
          <div className="mt-2.5 flex items-center justify-between gap-2">
            {/* Priority indicator */}
            {priorityConfig && (
              <div className="flex items-center gap-1.5">
                <span
                  className={`h-2 w-2 rounded-full ${priorityConfig.dotClassName}`}
                  aria-label={`${priorityConfig.label} priority`}
                />
                <span className="text-[11px] font-medium text-slate-500">
                  {priorityConfig.label}
                </span>
              </div>
            )}

            {/* Spacer to push due date to right when both exist */}
            {priorityConfig && card.dueDate && <span />}

            {/* Due date */}
            {card.dueDate && <DueDateBadge status={dueDateStatus} dueDate={card.dueDate} />}
          </div>
        )}
      </div>
    </div>
  );
}

function DueDateBadge({
  status,
  dueDate,
}: {
  status: ReturnType<typeof getDueDateStatus>;
  dueDate: Date | string;
}) {
  const config = {
    overdue: { className: "bg-red-100 text-red-700 border-red-200", prefix: "Overdue " },
    today: { className: "bg-orange-100 text-orange-700 border-orange-200", prefix: "" },
    tomorrow: { className: "bg-amber-100 text-amber-700 border-amber-200", prefix: "" },
    soon: { className: "bg-blue-50 text-blue-700 border-blue-200", prefix: "" },
    later: { className: "bg-slate-100 text-slate-600 border-slate-200", prefix: "" },
    none: null,
  };

  const cfg = config[status];
  if (!cfg) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${cfg.className}`}
    >
      <Calendar className="h-2.5 w-2.5" />
      {cfg.prefix}
      {formatDueDate(dueDate)}
    </span>
  );
}
"use client";

import { Activity, ArrowRight } from "lucide-react";

export function ActivityBox() {
    return (
        <div className="flex h-full items-center justify-between gap-6 p-6 md:p-8">
            <div className="flex-1">
                <Activity className="h-5 w-5 text-slate-700" />
                <h3 className="mt-3 text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
                    Track every move.
                </h3>
                <p className="mt-1 max-w-md text-sm text-slate-600">
                    Built-in activity log shows when cards moved, who moved them, and what changed.
                    Never lose context again.
                </p>
            </div>

            {/* Mini timeline */}
            <div className="hidden flex-1 space-y-2 md:block">
                <TimelineItem
                    icon={<ArrowRight className="h-3 w-3 text-blue-600" />}
                    text={
                        <>
                            moved from{" "}
                            <Badge>Backlog</Badge> to{" "}
                            <Badge>In Progress</Badge>
                        </>
                    }
                    time="2h ago"
                />
                <TimelineItem
                    icon={<ArrowRight className="h-3 w-3 text-blue-600" />}
                    text={
                        <>
                            moved from{" "}
                            <Badge>In Progress</Badge> to{" "}
                            <Badge>Review</Badge>
                        </>
                    }
                    time="1d ago"
                />
            </div>
        </div>
    );
}

function TimelineItem({
    icon,
    text,
    time,
}: {
    icon: React.ReactNode;
    text: React.ReactNode;
    time: string;
}) {
    return (
        <div className="flex items-start gap-2 rounded-lg border border-slate-200 bg-white p-3">
            <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-slate-100">
                {icon}
            </div>
            <div className="flex-1 text-xs">
                <p className="text-slate-700">{text}</p>
                <p className="mt-0.5 text-[10px] text-slate-400">{time}</p>
            </div>
        </div>
    );
}

function Badge({ children }: { children: React.ReactNode }) {
    return (
        <span className="rounded bg-slate-100 px-1 py-0.5 text-[10px] font-medium text-slate-700">
            {children}
        </span>
    );
}
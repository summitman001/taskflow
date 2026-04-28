import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser, requireBoardAccess } from "@/lib/auth";
import { apiError } from "@/lib/api";

/**
 * AI Subtask shape — server tarafında validate edilir.
 */
interface Subtask {
    title: string;
    description: string;
}

const SUBTASK_SYSTEM_PROMPT = `You are a senior project manager AI assistant for a Kanban tool.

Given a task card's title and description, break it down into 3-5 actionable subtasks. Each subtask should be:
- A single, focused unit of work
- Concrete and actionable (start with a verb)
- Sized between 30 minutes and 4 hours of work
- Independent enough to be tracked separately

Output ONLY valid JSON matching this exact schema, with no extra text:

{
  "subtasks": [
    {
      "title": "string (max 80 chars, action-oriented)",
      "description": "string (max 200 chars, what to do and why)"
    }
  ]
}

Generate subtasks in the same language as the input. If input is Turkish, output Turkish. If English, output English.`;

/**
 * POST /api/ai/breakdown
 * Body: { cardId: string }
 * Returns: { subtasks: [{ title, description }] }
 */
export async function POST(req: NextRequest) {
    try {
        const user = await getOrCreateUser();
        const body = await req.json();

        if (typeof body.cardId !== "string") {
            return apiError.badRequest("cardId is required");
        }

        // Card + board bilgisi
        const card = await prisma.card.findUnique({
            where: { id: body.cardId },
            include: {
                column: {
                    select: { 
                        boardId: true,
                        board: { select: { id: true } }
                    }
                },
            },
        });

        if (!card) return apiError.notFound("Card");

        // ⭐ Access check (EDITOR gerekli)
        await requireBoardAccess(card.column.boardId, "EDITOR");

        // API key kontrolü (graceful degradation)
        if (!process.env.OPENAI_API_KEY) {
            console.warn("[AI] OPENAI_API_KEY not set, returning mock subtasks");
            return NextResponse.json({
                subtasks: getMockSubtasks(card.title),
                isMock: true,
            });
        }

        // OpenAI çağrısı
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const userMessage = `Card title: "${card.title}"
Card description: ${card.description ?? "(no description)"}

Break this into 3-5 subtasks.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: SUBTASK_SYSTEM_PROMPT },
                { role: "user", content: userMessage },
            ],
            response_format: { type: "json_object" },
            temperature: 0.7,
            max_tokens: 800,
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) {
            console.error("[AI] Empty response from OpenAI");
            return apiError.serverError("AI returned an empty response");
        }

        // Parse + validate
        let parsed: unknown;
        try {
            parsed = JSON.parse(content);
        } catch (e) {
            console.error("[AI] Failed to parse JSON:", content);
            return apiError.serverError("AI returned invalid JSON");
        }

        const subtasks = validateSubtasks(parsed);
        if (!subtasks) {
            console.error("[AI] Invalid subtask shape:", parsed);
            return apiError.serverError("AI response did not match expected shape");
        }

        return NextResponse.json({ subtasks, isMock: false });
    } catch (error) {
        console.error("[POST /api/ai/breakdown]", error);

        // ⭐ Access denied error handle
        if (error instanceof Error) {
            if (error.message === "Board access denied" || error.message === "Insufficient permissions") {
                return apiError.forbidden();
            }
        }

        // OpenAI özel hataları
        if (error instanceof OpenAI.APIError) {
            if (error.status === 429) {
                return apiError.serverError("AI is busy right now, please try again in a moment");
            }
            if (error.status === 401) {
                return apiError.serverError("AI service authentication failed");
            }
        }

        return apiError.serverError("Failed to generate subtasks");
    }
}

/**
 * Validate AI response shape.
 * Returns subtasks array if valid, null if not.
 */
function validateSubtasks(data: unknown): Subtask[] | null {
    if (!data || typeof data !== "object") return null;
    const obj = data as Record<string, unknown>;
    if (!Array.isArray(obj.subtasks)) return null;

    const validated: Subtask[] = [];
    for (const item of obj.subtasks) {
        if (!item || typeof item !== "object") continue;
        const sub = item as Record<string, unknown>;
        if (typeof sub.title !== "string" || sub.title.length === 0) continue;

        const description = typeof sub.description === "string" ? sub.description : "";

        validated.push({
            title: sub.title.slice(0, 200), // Hard cap
            description: description.slice(0, 500),
        });
    }

    // En az 1, en fazla 8 subtask
    if (validated.length === 0) return null;
    return validated.slice(0, 8);
}

/**
 * Fallback: API key yoksa deterministic mock döndür.
 * Demo'da AI hata göstermek yerine, "AI not configured" + örnek output.
 */
function getMockSubtasks(cardTitle: string): Subtask[] {
    return [
        {
            title: `Plan approach for: ${cardTitle}`,
            description: "Define scope, dependencies, and acceptance criteria.",
        },
        {
            title: "Set up necessary infrastructure",
            description: "Prepare tools, environments, or resources needed.",
        },
        {
            title: "Implement core functionality",
            description: "Build the main feature with tests where applicable.",
        },
        {
            title: "Review and document",
            description: "Get peer review and update relevant documentation.",
        },
    ];
}
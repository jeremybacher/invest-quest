import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateMissionFeedback } from "@/lib/ai/feedback";
import { db } from "@/lib/db";

const BodySchema = z.object({
  userId: z.string().min(1),
  missionId: z.string().min(1),
  result: z.enum(["completed", "failed"]),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }

  const { userId, missionId, result } = parsed.data;

  const user = await db.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!user) return NextResponse.json({ ok: false, error: "user_not_found" }, { status: 404 });

  const feedback = await generateMissionFeedback(userId, missionId, result);

  if (!feedback.ok) {
    return NextResponse.json(feedback, { status: feedback.error === "no_provider_configured" ? 422 : 500 });
  }

  return NextResponse.json(feedback);
}

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { getCurrentUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { LearnClient } from "./LearnClient";

export type QuizQuestion = {
  q: string;
  options: string[];
  correct: number;
};

export type LessonMeta = {
  slug: string;
  title: string;
  topic: string;
  order: number;
  xpReward: number;
  content: string;
  quiz: QuizQuestion[];
};

function loadLessons(): LessonMeta[] {
  const lessonsDir = path.join(process.cwd(), "src/content/lessons");
  const files = fs.readdirSync(lessonsDir).filter((f) => f.endsWith(".md"));

  return files
    .map((file) => {
      const raw = fs.readFileSync(path.join(lessonsDir, file), "utf-8");
      const { data, content } = matter(raw);
      const slug = file.replace(/\.md$/, "");
      return {
        slug,
        title: data.title as string,
        topic: data.topic as string,
        order: (data.order as number) ?? 0,
        xpReward: (data.xpReward as number) ?? 20,
        content,
        quiz: (data.quiz as QuizQuestion[]) ?? [],
      };
    })
    .sort((a, b) => a.order - b.order);
}

export default async function LearnPage() {
  const userId = await getCurrentUserId();
  const lessons = loadLessons();

  let completedSlugs: string[] = [];

  if (userId) {
    const completed = await db.userMission.findMany({
      where: { userId, status: "completed", mission: { code: { startsWith: "read_lesson:" } } },
      include: { mission: { select: { code: true } } },
    });
    completedSlugs = completed.map((m) => m.mission.code.replace("read_lesson:", ""));
  }

  return <LearnClient key={userId ?? "guest"} userId={userId ?? ""} lessons={lessons} completedSlugs={completedSlugs} />;
}

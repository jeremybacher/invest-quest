"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { BookOpen, CheckCircle, ChevronRight, Trophy, RotateCcw, Zap, ArrowRight, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { completLesson } from "./actions";
import type { LessonMeta } from "./page";

type Props = {
  userId: string;
  lessons: LessonMeta[];
  completedSlugs: string[];
};

type QuizMode = "content" | "quiz" | "results";

const TOPIC_COLORS: Record<string, string> = {
  "Básicos": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  "Renta Variable": "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  "Renta Fija": "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  "ETFs": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  "Cripto": "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  "Estrategia": "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
};

export function LearnClient({ userId, lessons, completedSlugs: initial }: Props) {
  const [completedSlugs, setCompletedSlugs] = useState(initial);
  const [selected, setSelected] = useState<LessonMeta | null>(null);
  const [mode, setMode] = useState<QuizMode>("content");
  // one-at-a-time quiz state
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(false);

  const topics = [...new Set(lessons.map((l) => l.topic))];

  function openLesson(lesson: LessonMeta) {
    setSelected(lesson);
    setMode("content");
    setCurrentQ(0);
    setAnswers({});
    setRevealed(false);
  }

  function closeLesson() {
    setSelected(null);
  }

  function startQuiz() {
    setMode("quiz");
    setCurrentQ(0);
    setAnswers({});
    setRevealed(false);
  }

  function retryQuiz() {
    setCurrentQ(0);
    setAnswers({});
    setRevealed(false);
  }

  function handleAnswer(oi: number) {
    if (revealed) return;
    setAnswers((prev) => ({ ...prev, [currentQ]: oi }));
    setRevealed(true);
  }

  function nextQuestion() {
    if (!selected) return;
    if (currentQ < selected.quiz.length - 1) {
      setCurrentQ((q) => q + 1);
      setRevealed(false);
    } else {
      setMode("results");
    }
  }

  async function handleComplete() {
    if (!selected || !userId) return;
    setLoading(true);
    const result = await completLesson(userId, selected.slug, selected.xpReward);
    setLoading(false);

    if (!result.ok) {
      toast.error("Error al registrar la lección");
      return;
    }

    if (result.alreadyDone) {
      toast("Ya completaste esta lección");
    } else {
      toast.success(`¡Lección completada! +${result.xpGained} XP`);
      setCompletedSlugs((prev) => [...prev, selected.slug]);
    }
    closeLesson();
  }

  const correctCount = selected
    ? selected.quiz.filter((q, i) => answers[i] === q.correct).length
    : 0;
  const passed = selected ? correctCount >= Math.ceil(selected.quiz.length * 0.67) : false;
  const alreadyDone = selected ? completedSlugs.includes(selected.slug) : false;

  const question = selected?.quiz[currentQ];
  const selectedAnswer = answers[currentQ];
  const isCorrect = revealed && question && selectedAnswer === question.correct;
  const progress = selected ? ((currentQ + (revealed ? 1 : 0)) / selected.quiz.length) * 100 : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Aprender</h1>

      {topics.map((topic) => (
        <div key={topic} className="space-y-2">
          <div className="flex items-center gap-2">
            <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", TOPIC_COLORS[topic] ?? "bg-muted text-muted-foreground")}>
              {topic}
            </span>
          </div>
          <div className="space-y-2">
            {lessons
              .filter((l) => l.topic === topic)
              .map((lesson) => {
                const done = completedSlugs.includes(lesson.slug);
                return (
                  <Card
                    key={lesson.slug}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-sm group",
                      done ? "border-emerald-200 dark:border-emerald-900/40" : "hover:border-primary/30",
                    )}
                    onClick={() => openLesson(lesson)}
                  >
                    <CardContent className="py-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "flex items-center justify-center w-9 h-9 rounded-xl shrink-0",
                          done ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-muted",
                        )}>
                          {done
                            ? <CheckCircle className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
                            : <BookOpen className="h-4 w-4 text-muted-foreground" />
                          }
                        </div>
                        <div>
                          <span className={cn("font-medium text-sm block leading-snug", done && "text-muted-foreground")}>
                            {lesson.title}
                          </span>
                          {lesson.quiz.length > 0 && (
                            <p className="text-xs text-muted-foreground">{lesson.quiz.length} preguntas</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="secondary" className="text-xs gap-1">
                          <Zap className="h-3 w-3" />
                          +{lesson.xpReward}
                        </Badge>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </div>
      ))}

      <Dialog open={!!selected} onOpenChange={(open) => !open && closeLesson()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0 pr-12">
            <DialogTitle className="text-lg leading-snug">{selected?.title}</DialogTitle>
            <div className="flex items-center gap-1.5 mt-1">
              <Zap className="h-3.5 w-3.5 text-yellow-500" />
              <span className="text-sm text-muted-foreground font-medium">+{selected?.xpReward} XP al completar</span>
            </div>
          </DialogHeader>

          {/* CONTENT MODE */}
          {mode === "content" && (
            <>
              <div className="flex-1 overflow-y-auto px-6 py-5">
                <div className="prose prose-sm dark:prose-invert max-w-none
                  prose-headings:font-bold prose-headings:text-foreground
                  prose-h2:text-base prose-h2:mt-5 prose-h2:mb-2
                  prose-p:text-foreground/80 prose-p:leading-relaxed prose-p:my-2
                  prose-li:text-foreground/80 prose-li:my-0.5
                  prose-strong:text-foreground prose-strong:font-semibold
                  prose-blockquote:border-primary/30 prose-blockquote:text-muted-foreground prose-blockquote:bg-muted/50 prose-blockquote:rounded-r-lg prose-blockquote:py-1
                  prose-ul:my-2">
                  <ReactMarkdown>{selected?.content ?? ""}</ReactMarkdown>
                </div>
              </div>
              <div className="px-6 pb-6 pt-4 border-t shrink-0">
                {alreadyDone ? (
                  <Button variant="outline" className="w-full gap-2" disabled>
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    Completada
                  </Button>
                ) : selected?.quiz && selected.quiz.length > 0 ? (
                  <Button className="w-full gap-2" onClick={startQuiz}>
                    Hacer quiz
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button className="w-full" onClick={handleComplete} disabled={loading || !userId}>
                    {loading ? "Guardando…" : `Completar lección (+${selected?.xpReward} XP)`}
                  </Button>
                )}
              </div>
            </>
          )}

          {/* QUIZ MODE — one question at a time */}
          {mode === "quiz" && selected && question && (
            <div className="flex flex-col flex-1 overflow-hidden">
              {/* Progress */}
              <div className="px-6 py-3 border-b space-y-2 shrink-0">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Pregunta {currentQ + 1} de {selected.quiz.length}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-1.5" />
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
                {/* Question */}
                <p className="font-semibold text-base leading-snug">{question.q}</p>

                {/* Options */}
                <div className="space-y-3">
                  {question.options.map((option, oi) => {
                    const isSelected = selectedAnswer === oi;
                    const isCorrectOpt = question.correct === oi;
                    const showResult = revealed;

                    let optionStyle = "border-border bg-card hover:border-primary/40 hover:bg-accent/30";
                    if (showResult) {
                      if (isCorrectOpt) optionStyle = "border-emerald-400 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-950/30";
                      else if (isSelected) optionStyle = "border-red-400 bg-red-50 dark:border-red-600 dark:bg-red-950/30";
                      else optionStyle = "border-border bg-card opacity-50";
                    } else if (isSelected) {
                      optionStyle = "border-primary bg-primary/5";
                    }

                    return (
                      <button
                        key={oi}
                        onClick={() => handleAnswer(oi)}
                        disabled={revealed}
                        className={cn(
                          "w-full text-left px-4 py-3.5 rounded-xl border text-sm transition-all flex items-center gap-3",
                          optionStyle,
                          !revealed && "cursor-pointer",
                          revealed && "cursor-default",
                        )}
                      >
                        <span className={cn(
                          "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 transition-all",
                          showResult && isCorrectOpt
                            ? "bg-emerald-500 text-white"
                            : showResult && isSelected && !isCorrectOpt
                            ? "bg-red-500 text-white"
                            : isSelected
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground",
                        )}>
                          {showResult && isCorrectOpt ? "✓" : showResult && isSelected && !isCorrectOpt ? "✗" : String.fromCharCode(65 + oi)}
                        </span>
                        <span className={cn(revealed && !isCorrectOpt && !isSelected && "text-muted-foreground")}>
                          {option}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Feedback banner */}
                {revealed && (
                  <div className={cn(
                    "rounded-xl px-4 py-3 flex items-center gap-3 text-sm font-medium",
                    isCorrect
                      ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                      : "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800",
                  )}>
                    {isCorrect
                      ? <CheckCircle className="h-4 w-4 shrink-0" />
                      : <XCircle className="h-4 w-4 shrink-0" />}
                    {isCorrect
                      ? "¡Correcto!"
                      : `Respuesta correcta: ${question.options[question.correct]}`}
                  </div>
                )}
              </div>

              <div className="px-6 pb-6 pt-4 border-t shrink-0">
                {!revealed ? (
                  <Button
                    className="w-full"
                    disabled={selectedAnswer === undefined}
                    onClick={() => setRevealed(true)}
                  >
                    Verificar
                  </Button>
                ) : (
                  <Button className="w-full gap-2" onClick={nextQuestion}>
                    {currentQ < selected.quiz.length - 1 ? (
                      <>Siguiente pregunta <ArrowRight className="h-4 w-4" /></>
                    ) : (
                      <>Ver resultados <Trophy className="h-4 w-4" /></>
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* RESULTS MODE */}
          {mode === "results" && selected && (
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                {/* Score banner */}
                <div className={cn(
                  "rounded-2xl p-6 text-center",
                  passed
                    ? "bg-gradient-to-b from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-900"
                    : "bg-gradient-to-b from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/20 border border-red-200 dark:border-red-900",
                )}>
                  <div className="mb-3">
                    {passed
                      ? <Trophy className="h-12 w-12 text-amber-500 mx-auto" />
                      : <RotateCcw className="h-12 w-12 text-red-400 mx-auto" />}
                  </div>
                  <p className={cn("font-black text-2xl", passed ? "text-emerald-700 dark:text-emerald-300" : "text-red-600 dark:text-red-400")}>
                    {passed ? "¡Muy bien!" : "Casi…"}
                  </p>
                  <p className="text-muted-foreground mt-1">
                    <span className="font-bold text-foreground text-lg">{correctCount}</span> de {selected.quiz.length} correctas
                  </p>
                  {passed && !alreadyDone && (
                    <div className="mt-3 inline-flex items-center gap-1.5 bg-white/60 dark:bg-black/20 rounded-full px-3 py-1.5 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      +{selected.xpReward} XP disponibles
                    </div>
                  )}
                </div>

                {/* Question review */}
                <div className="space-y-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Revisión</p>
                  {selected.quiz.map((q, qi) => {
                    const correct = answers[qi] === q.correct;
                    return (
                      <div key={qi} className={cn("rounded-xl border p-4 space-y-2", correct ? "border-emerald-200 dark:border-emerald-900" : "border-red-200 dark:border-red-900")}>
                        <div className="flex items-start gap-2">
                          <span className={cn(
                            "inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold shrink-0 mt-0.5",
                            correct ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
                          )}>
                            {correct ? "✓" : "✗"}
                          </span>
                          <p className="text-sm font-medium">{q.q}</p>
                        </div>
                        {!correct && (
                          <p className="text-xs text-muted-foreground pl-7">
                            Respuesta correcta: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{q.options[q.correct]}</span>
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="px-6 pb-6 pt-4 border-t shrink-0 flex gap-2">
                {passed ? (
                  <Button
                    className="flex-1 gap-2"
                    onClick={handleComplete}
                    disabled={loading || alreadyDone}
                  >
                    {loading ? "Guardando…" : alreadyDone ? "✓ Ya completada" : `Reclamar +${selected.xpReward} XP`}
                    {!loading && !alreadyDone && <Zap className="h-4 w-4" />}
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" className="gap-2" onClick={() => setMode("content")}>
                      <BookOpen className="h-4 w-4" />
                      Releer
                    </Button>
                    <Button className="flex-1 gap-2" onClick={retryQuiz}>
                      <RotateCcw className="h-4 w-4" />
                      Intentar de nuevo
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

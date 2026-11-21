"use client"

import { ApiUser, resolveId } from "@/shared/types/api"
import { cn } from "@/shared/lib/tailwind-cn"
import {
  Trophy,
  Flame,
  HelpCircle,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  CheckCircle2,
  Users,
} from "lucide-react"

export interface Top3Student {
  rank: number
  studentId: string
  name: string
  avatarUrl?: string
  grade?: string
  score: number
  teamName?: string
}

export interface HighlightsProps {
  currentStudentId: string
  top3?: Top3Student[]
  rankData?: {
    rank: number
    score: number
    totalMembers: number
    presentCount?: number
    pointsToNextRank?: number
  } | null
  myTeam?: {
    _id: string
    name: string
    currentCycleScore: number
    totalScore: number
    teamRank: number
    totalTeams: number
  } | null
  todayQuestion?: {
    questionId: string
    rewardPoints: number
    alreadyAnswered: boolean
    isCorrect?: boolean | null
  } | null
  onOpenDailyQuestion: () => void
}

const PODIUM_CONFIG = [
  {
    rank: 1,
    label: "المركز الأول 🥇",
    medal: "🥇",
    border: "border-amber-400 dark:border-amber-500",
    glow: "shadow-amber-500/20 shadow-md ring-2 ring-amber-400/40",
    bg: "bg-gradient-to-br from-amber-500/15 via-card to-background",
    badgeBg: "bg-amber-500 text-amber-950 font-black",
  },
  {
    rank: 2,
    label: "المركز الثاني 🥈",
    medal: "🥈",
    border: "border-slate-300 dark:border-slate-500",
    glow: "shadow-slate-400/10 shadow-sm",
    bg: "bg-gradient-to-br from-slate-400/10 via-card to-background",
    badgeBg: "bg-slate-300 dark:bg-slate-600 text-slate-900 dark:text-white font-bold",
  },
  {
    rank: 3,
    label: "المركز الثالث 🥉",
    medal: "🥉",
    border: "border-amber-700/40 dark:border-amber-700/60",
    glow: "shadow-amber-900/10 shadow-sm",
    bg: "bg-gradient-to-br from-amber-800/10 via-card to-background",
    badgeBg: "bg-amber-700 text-white font-bold",
  },
]

export function StudentHighlightsScroll({
  currentStudentId,
  top3 = [],
  rankData,
  myTeam,
  todayQuestion,
  onOpenDailyQuestion,
}: HighlightsProps) {
  const isStudentInTop3 = (rankData?.rank ?? 99) <= 3

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between px-1">
        <h2 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <Sparkles className="size-3.5 text-accent" />
          لوحة الشرف والمنافسة السريعة
        </h2>
        <span className="text-[11px] text-muted-foreground">اسحب أفقياً للمزيد ↔</span>
      </div>

      {/* Horizontal Carousel with Scroll Snap */}
      <div className="flex gap-3 overflow-x-auto pb-2 pt-1 snap-x snap-mandatory scrollbar-none">
        {/* 1, 2, 3: Podium Cards */}
        {PODIUM_CONFIG.map((cfg, idx) => {
          const student = top3[idx]
          const isMe = student && student.studentId === currentStudentId

          return (
            <div
              key={cfg.rank}
              className={cn(
                "relative flex w-60 shrink-0 snap-start flex-col justify-between rounded-3xl border p-4 transition-all duration-200",
                cfg.border,
                cfg.bg,
                cfg.glow,
                isMe && "ring-2 ring-primary ring-offset-2 ring-offset-background"
              )}
            >
              <div className="flex items-start justify-between">
                <span className={cn("rounded-full px-2.5 py-0.5 text-[11px]", cfg.badgeBg)}>
                  {cfg.label}
                </span>
                <span className="text-2xl">{cfg.medal}</span>
              </div>

              <div className="my-3">
                <p className="font-display text-base font-bold text-foreground truncate">
                  {student ? student.name : "شاغر بعد"}
                  {isMe && <span className="text-xs text-primary font-normal me-1"> (أنت)</span>}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {student?.grade || "دفعة المتفوقين"}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-border/40 pt-2 text-xs">
                <span className="text-muted-foreground font-medium">النقاط:</span>
                <span className="font-display text-sm font-bold text-primary">
                  {student?.score ?? 0} نقطة
                </span>
              </div>
            </div>
          )
        })}

        {/* 4: Current Student Rank Card (If not in top 3) */}
        {!isStudentInTop3 && rankData && (
          <div className="relative flex w-64 shrink-0 snap-start flex-col justify-between rounded-3xl border-2 border-primary/40 bg-gradient-to-br from-primary/10 via-card to-background p-4 shadow-md ring-2 ring-primary/20">
            <div className="flex items-start justify-between">
              <span className="rounded-full bg-primary text-primary-foreground px-2.5 py-0.5 text-[11px] font-bold">
                ترتيبي في المنصة 🎯
              </span>
              <span className="font-display text-base font-extrabold text-primary">
                #{rankData.rank}
              </span>
            </div>

            <div className="my-2 space-y-1">
              <p className="font-display text-lg font-bold text-foreground">
                {rankData.score} <span className="text-xs font-normal text-muted-foreground">نقطة</span>
              </p>
              {rankData.pointsToNextRank && rankData.pointsToNextRank > 0 ? (
                <div className="flex items-center gap-1 rounded-xl bg-amber-500/10 px-2 py-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                  <TrendingUp className="size-3 shrink-0" />
                  <span>باقي {rankData.pointsToNextRank} نقطة للوصول للمركز #{rankData.rank - 1}</span>
                </div>
              ) : (
                <p className="text-[11px] text-muted-foreground">
                  من إجمالي {rankData.totalMembers} طلاب في الفصل
                </p>
              )}
            </div>

            <div className="border-t border-border/40 pt-2 text-[11px] text-muted-foreground flex justify-between">
              <span>حضورك: {rankData.presentCount || 0} أيام</span>
              <span className="text-primary font-bold">واصل التقدم!</span>
            </div>
          </div>
        )}

        {/* 5: My Team Card */}
        {myTeam && (
          <div className="flex w-60 shrink-0 snap-start flex-col justify-between rounded-3xl border border-amber-400/40 bg-gradient-to-br from-amber-500/10 via-card to-background p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <span className="flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                <Flame className="size-3" />
                فريقي التنافسي
              </span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold">
                #{myTeam.teamRank}
              </span>
            </div>

            <div className="my-3">
              <p className="font-display text-base font-bold text-foreground truncate">
                {myTeam.name}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                المركز {myTeam.teamRank} من {myTeam.totalTeams} فرق
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-border/40 pt-2 text-xs">
              <span className="text-muted-foreground font-medium">نقاط الفريق:</span>
              <span className="font-display text-sm font-bold text-amber-600 dark:text-amber-400">
                {myTeam.currentCycleScore} نقطة
              </span>
            </div>
          </div>
        )}

        {/* 6: Daily Question Card */}
        <div
          onClick={onOpenDailyQuestion}
          className="group flex w-60 shrink-0 snap-start flex-col justify-between rounded-3xl border border-accent/40 bg-gradient-to-br from-accent/15 via-card to-background p-4 shadow-sm cursor-pointer hover:border-accent hover:shadow-md transition-all"
        >
          <div className="flex items-start justify-between">
            <span className="flex items-center gap-1 rounded-full bg-accent/20 px-2.5 py-0.5 text-[10px] font-bold text-heading">
              <HelpCircle className="size-3 text-accent" />
              سؤال اليوم
            </span>
            {todayQuestion?.alreadyAnswered ? (
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                <CheckCircle2 className="size-3" />
                تم الحل
              </span>
            ) : (
              <span className="relative flex size-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full size-2.5 bg-amber-500" />
              </span>
            )}
          </div>

          <div className="my-3">
            <p className="font-display text-sm font-bold text-foreground">
              {todayQuestion?.alreadyAnswered
                ? "أحسنت! أتممت سؤال اليوم"
                : "أجب عن سؤال اليوم المعرفي"}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              سؤال يومي لتثبيت معلوماتك ومراجعة الدروس
            </p>
          </div>

          <div className="flex items-center justify-between border-t border-border/40 pt-2 text-xs text-accent font-bold group-hover:underline">
            <span>{todayQuestion?.alreadyAnswered ? "مراجعة الإجابة" : "أجب الآن"}</span>
            <ArrowUpRight className="size-3.5" />
          </div>
        </div>
      </div>
    </div>
  )
}

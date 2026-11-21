"use client"

import { useStudentTeam } from "../hooks/use-student-tasks"
import { Flame, Trophy, Users, Award, Shield } from "lucide-react"
import { cn } from "@/shared/lib/tailwind-cn"

interface Props {
  classroomId?: string | null
}

const MEDALS = ["🥇", "🥈", "🥉"]

export function StudentTeamCard({ classroomId }: Props) {
  const { data: teamInfo, isLoading } = useStudentTeam(classroomId)

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-border/60 bg-card p-5 animate-pulse">
        <div className="h-4 w-28 bg-muted rounded mb-3" />
        <div className="h-6 w-44 bg-muted rounded mb-2" />
        <div className="h-3 w-32 bg-muted rounded" />
      </div>
    )
  }

  if (!teamInfo || !teamInfo.team) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-card/60 p-4 text-center">
        <div className="mx-auto grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary mb-2">
          <Users className="size-5" />
        </div>
        <p className="text-xs font-bold text-foreground">لست منضماً لأي فريق بعد</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          سيقوم المعلم بتوزيعك على أحد الفرق التنافسية قريباً!
        </p>
      </div>
    )
  }

  const { team, studentRankInTeam, studentScoreInTeam, totalMembersInTeam } = teamInfo
  const teamMedal = team.teamRank <= 3 ? MEDALS[team.teamRank - 1] : `#${team.teamRank}`

  return (
    <div className="overflow-hidden rounded-3xl border border-amber-300/50 bg-gradient-to-br from-amber-500/10 via-card to-primary/5 p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
            <Flame className="size-4 fill-amber-500/30" />
            فريق المنافسة الجماعية
          </span>
          <h3 className="mt-1 font-display text-lg font-bold text-foreground">
            {team.name}
          </h3>
        </div>

        <div className="flex flex-col items-end">
          <span className="flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 text-xs font-bold text-amber-700 dark:text-amber-300">
            <Trophy className="size-3.5" />
            المركز {teamMedal} بين الفرق
          </span>
          <span className="text-[10px] text-muted-foreground mt-1">
            من إجمالي {team.totalTeams} فرق متنافسة
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border/50 bg-background/80 p-3">
          <p className="text-[11px] text-muted-foreground font-medium">نقاط فريقك بالدورة</p>
          <p className="font-display text-xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">
            {team.currentCycleScore} <span className="text-xs font-normal">نقطة</span>
          </p>
        </div>

        <div className="rounded-2xl border border-border/50 bg-background/80 p-3">
          <p className="text-[11px] text-muted-foreground font-medium">ترتيبك داخل الفريق</p>
          <p className="font-display text-xl font-bold text-primary mt-0.5">
            #{studentRankInTeam}{" "}
            <span className="text-xs font-normal text-muted-foreground">
              من {totalMembersInTeam} طلاب
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

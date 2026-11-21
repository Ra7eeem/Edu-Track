"use client"

import { useState, useEffect } from "react"
import {
  StudentHighlightsScroll,
  Top3Student,
  HighlightsProps,
} from "./student-highlights-scroll"
import { DailyQuestionModal } from "./daily-question-modal"

interface Props {
  currentStudentId: string
  classroomId: string | null
  top3?: Top3Student[]
  rankData?: HighlightsProps["rankData"]
  myTeam?: HighlightsProps["myTeam"]
  todayQuestion?: HighlightsProps["todayQuestion"]
}

export function StudentDashboardHighlights({
  currentStudentId,
  classroomId,
  top3,
  rankData,
  myTeam,
  todayQuestion,
}: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Auto-popup modal on first dashboard visit of the day if student hasn't answered yet
  useEffect(() => {
    if (todayQuestion && !todayQuestion.alreadyAnswered && classroomId) {
      const storageKey = `daily_q_popup_seen_${todayQuestion.questionId}`
      const hasSeen = sessionStorage.getItem(storageKey)
      if (!hasSeen) {
        setIsModalOpen(true)
        sessionStorage.setItem(storageKey, "1")
      }
    }
  }, [todayQuestion, classroomId])

  return (
    <>
      <StudentHighlightsScroll
        currentStudentId={currentStudentId}
        top3={top3}
        rankData={rankData}
        myTeam={myTeam}
        todayQuestion={todayQuestion}
        onOpenDailyQuestion={() => setIsModalOpen(true)}
      />

      {/* Floating Action Button for Daily Challenge */}
      {todayQuestion && !todayQuestion.alreadyAnswered && classroomId && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-6 start-6 z-40 flex items-center gap-2.5 rounded-full bg-accent px-4 py-2.5 font-bold text-accent-foreground shadow-xl ring-2 ring-accent/30 hover:brightness-110 active:scale-95 transition-all animate-bounce"
          style={{ animationDuration: "2.5s" }}
          aria-label="سؤال اليوم التنافسي"
        >
          <span className="relative flex size-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-heading opacity-75" />
            <span className="relative inline-flex rounded-full size-2.5 bg-heading" />
          </span>
          <span className="text-sm">💡 سؤال اليوم التنافسي</span>
        </button>
      )}

      {/* Daily Question Modal */}
      {classroomId && (
        <DailyQuestionModal
          classroomId={classroomId}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  )
}

"use client"

import { AttendanceRegister } from "@/features/teacher/components/attendance-register"

interface Props { groupId: string }

export function AttendanceRegisterClient({ groupId }: Props) {
  return <AttendanceRegister groupId={groupId} role="teacher" />
}

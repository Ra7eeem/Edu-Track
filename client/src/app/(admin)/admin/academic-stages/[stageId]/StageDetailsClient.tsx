"use client"

import { useState, useMemo } from "react"
import { AcademicStageConfig, getCurrentAcademicYear } from "@/features/academic-stages/config/academic-stages.config"
import { useAcademicStageStudents } from "@/features/academic-stages/hooks/use-academic-stage-students"
import { StudentsTable } from "@/features/academic-stages/components/StudentsTable"
import { Search } from "lucide-react"
import { GRADE_LABELS } from "@/shared/types/api"
import { AcademicYearFilter } from "@/features/academic-stages/components/AcademicYearFilter"

interface StageDetailsClientProps {
  stage: AcademicStageConfig
}

export function StageDetailsClient({ stage }: StageDetailsClientProps) {
  const [academicYear, setAcademicYear] = useState(getCurrentAcademicYear)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGrade, setSelectedGrade] = useState<string>("ALL")

  const { data: students = [], isLoading, isError } = useAcademicStageStudents(
    stage.id,
    stage.grades,
    academicYear
  )

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = 
        !searchQuery || 
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesGrade = 
        selectedGrade === "ALL" || 
        student.grade === selectedGrade;

      return matchesSearch && matchesGrade;
    })
  }, [students, searchQuery, selectedGrade]);

  const studentCount = isLoading ? null : filteredStudents.length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card p-4 rounded-2xl border border-border/60">
        <div className="flex flex-1 items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input 
              type="text"
              placeholder="ابحث باسم الطالب أو البريد..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pr-10 pl-4 rounded-xl border border-input bg-background text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
            />
          </div>
          
          <select 
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="h-10 px-4 rounded-xl border border-input bg-background text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
          >
            <option value="ALL">جميع الصفوف</option>
            {stage.grades.map(g => (
              <option key={g} value={g}>{GRADE_LABELS[g] ?? g}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          {studentCount !== null && (
            <span className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1.5 rounded-lg">
              {studentCount} طالب
            </span>
          )}
          <AcademicYearFilter value={academicYear} onChange={setAcademicYear} />
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border/60 p-5 shadow-sm">
        <StudentsTable 
          students={filteredStudents} 
          isLoading={isLoading} 
          isError={isError} 
        />
      </div>
    </div>
  )
}

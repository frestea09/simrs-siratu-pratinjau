"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { SurveyForm } from "@/components/organisms/survey-form"
import { getSurvey } from "@/lib/actions/surveys"
import { SurveyResult } from "@/types/survey"

export default function EditSurveyPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [survey, setSurvey] = useState<SurveyResult | null>(null)

  useEffect(() => {
    async function fetchData() {
      const data = await getSurvey(id)
      setSurvey(data)
    }
    fetchData()
  }, [id])

  const close = () => router.push("/dashboard/surveys")

  if (!survey) {
    return <div className="p-4">Memuat...</div>
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight mb-4">Edit Hasil Survei</h2>
      <SurveyForm setOpen={close} survey={survey} onSaved={() => router.refresh()} />
    </div>
  )
}

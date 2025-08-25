"use client"

import { SurveyForm } from "@/components/organisms/survey-form"
import { useRouter } from "next/navigation"

export default function NewSurveyPage() {
  const router = useRouter()
  const close = () => router.push("/dashboard/surveys")
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight mb-4">Isi Survei Budaya Keselamatan</h2>
      <SurveyForm setOpen={close} onSaved={() => router.refresh()} />
    </div>
  )
}

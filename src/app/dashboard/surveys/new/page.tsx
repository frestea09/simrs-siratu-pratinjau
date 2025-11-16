"use client"

import { Button } from "@/components/ui/button"
import { SurveyForm } from "@/components/organisms/survey-form"
import { ChevronLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function NewSurveyPage() {
  const router = useRouter()

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={() => router.back()}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
        <h2 className="text-2xl font-bold">Survei Budaya Keselamatan Pasien</h2>
      </div>
      <SurveyForm
        onCancel={() => router.push("/dashboard/surveys")}
        onSuccess={() => router.push("/dashboard/surveys")}
      />
    </div>
  )
}


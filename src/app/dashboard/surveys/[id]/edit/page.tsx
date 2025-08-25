"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { SurveyForm } from "@/components/organisms/survey-form"
import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import type { SurveyResult } from "@/store/survey-store"

export default function EditSurveyPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [survey, setSurvey] = React.useState<SurveyResult | null>(null)

  React.useEffect(() => {
    fetch(`/api/surveys/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found")
        return res.json()
      })
      .then(setSurvey)
      .catch(() => router.push("/dashboard/surveys"))
  }, [params.id, router])

  if (!survey) return null

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Edit Survei Budaya Keselamatan Pasien</CardTitle>
          <CardDescription>
            Perbarui jawaban survei sesuai kebutuhan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SurveyForm
            survey={survey}
            onSuccess={() => router.push("/dashboard/surveys")}
          />
        </CardContent>
      </Card>
    </div>
  )
}

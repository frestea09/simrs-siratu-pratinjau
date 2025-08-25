"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { SurveyForm } from "@/components/organisms/survey-form"
import { useParams, useRouter } from "next/navigation"
import { useSurveyStore } from "@/store/survey-store"

export default function EditSurveyPage() {
  const params = useParams<{ id: string }>()
  const survey = useSurveyStore((state) =>
    state.surveys.find((s) => s.id === params.id)
  )
  const router = useRouter()

  if (!survey) {
    router.push("/dashboard/surveys")
    return null
  }

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
            setOpen={(open) => {
              if (!open) router.push("/dashboard/surveys")
            }}
            survey={survey}
          />
        </CardContent>
      </Card>
    </div>
  )
}

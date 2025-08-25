"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { SurveyForm } from "@/components/organisms/survey-form"
import { useRouter } from "next/navigation"

export default function NewSurveyPage() {
  const router = useRouter()

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Survei Budaya Keselamatan Pasien</CardTitle>
          <CardDescription>
            Isi semua pertanyaan sesuai dengan opini Anda. Survei ini bersifat
            anonim.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SurveyForm
            setOpen={(open) => {
              if (!open) router.push("/dashboard/surveys")
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}

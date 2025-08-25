"use client"

import { useState } from "react"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SurveyForm } from "@/components/organisms/survey-form"
import { SurveyResponseTable } from "@/components/organisms/survey-response-table"
import { useSurveyStore } from "@/store/survey-store"

export default function SurveysPage() {
  const { responses } = useSurveyStore()
  const [open, setOpen] = useState(false)

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">
          Survei Budaya Keselamatan
        </h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="text-lg">Isi Survei</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">Form Survei</DialogTitle>
            </DialogHeader>
            <SurveyForm onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Ringkasan Survei</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-lg">Total respon: {responses.length}</p>
          <SurveyResponseTable />
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import * as React from "react"
import { SurveyQuestion } from "@/lib/survey-questions"
import { Label } from "../ui/label"
import { Alert, AlertDescription } from "../ui/alert"
import { Info } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"

type SurveyStepProps = {
  dimension: { title: string; questions: SurveyQuestion[] }
  answers: Record<string, string>
  onChange: (id: string, val: string) => void
  startIndex: number
}

export default function SurveyStep({
  dimension,
  answers,
  onChange,
  startIndex,
}: SurveyStepProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-primary">{dimension.title}</h3>
      {dimension.questions.map((q, idx) => (
        <QuestionItem
          key={q.id}
          question={q}
          value={answers[q.id]}
          onChange={onChange}
          questionNumber={startIndex + idx}
        />
      ))}
    </div>
  )
}

type QuestionItemProps = {
  question: SurveyQuestion
  value: string
  onChange: (id: string, val: string) => void
  questionNumber: number
}

const OPTIONS = [
  { value: "sangat_setuju", label: "Sangat Setuju" },
  { value: "setuju", label: "Setuju" },
  { value: "netral", label: "Netral" },
  { value: "tidak_setuju", label: "Tidak Setuju" },
  { value: "sangat_tidak_setuju", label: "Sangat Tidak Setuju" },
]

const QuestionItem = React.memo(function QuestionItem({
  question,
  value,
  onChange,
  questionNumber,
}: QuestionItemProps) {
  return (
    <div className="space-y-3 rounded-lg border p-4">
      <Label className="text-base font-semibold leading-snug">
        {questionNumber}. {question.text}
      </Label>
      {question.isNegative && (
        <Alert variant="destructive" className="bg-destructive/5">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Perhatian: Pertanyaan ini bersifat negatif.
          </AlertDescription>
        </Alert>
      )}
      <RadioGroup
        value={value}
        onValueChange={(val) => onChange(question.id, val)}
        className="flex flex-wrap gap-x-6 gap-y-2 pt-2"
      >
        {OPTIONS.map((opt) => (
          <div key={opt.value} className="flex items-center space-x-2">
            <RadioGroupItem
              value={opt.value}
              id={`${question.id}-${opt.value}`}
            />
            <Label
              htmlFor={`${question.id}-${opt.value}`}
              className="font-normal"
            >
              {opt.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
})

QuestionItem.displayName = "QuestionItem"

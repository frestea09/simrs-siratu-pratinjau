"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Stepper } from "@/components/molecules/stepper"
import { SurveyResult, useSurveyStore } from "@/store/survey-store"
import { useToast } from "@/hooks/use-toast"
import { useUserStore } from "@/store/user-store.tsx"
import type { SurveyDimension, SurveyQuestion } from "@/lib/survey-questions"
import { Combobox } from "../ui/combobox"
import { HOSPITAL_UNITS } from "@/lib/constants"
import dynamic from "next/dynamic"
import { Progress } from "../ui/progress"

// --- Tipe Data ---
type Answers = Record<string, string> // { "A1": "sangat_setuju", "A2": "setuju", ... }

// --- Struktur & Konten Formulir ---

const INITIAL_STEPS = [{ id: "01", name: "Unit Kerja" }]

const SurveyStep = dynamic(() => import("./survey-step"))

const unitOptions = HOSPITAL_UNITS.map((unit) => ({ value: unit, label: unit }))

// --- Komponen Formulir Utama ---

type SurveyFormProps = {
  setOpen: (open: boolean) => void
  survey?: SurveyResult
}

export function SurveyForm({ setOpen, survey }: SurveyFormProps) {
  const [currentStep, setCurrentStep] = React.useState(0)
  const [steps, setSteps] = React.useState(INITIAL_STEPS)
  const [dimensions, setDimensions] = React.useState<
    { id: SurveyDimension; title: string; questions: SurveyQuestion[] }[]
  >([])
  const [questions, setQuestions] = React.useState<SurveyQuestion[]>([])
  const [loadingQuestions, setLoadingQuestions] = React.useState(false)
  const [answers, setAnswers] = React.useState<Answers>(
    () => survey?.answers ?? {}
  )
  const [unit, setUnit] = React.useState<string>(() => survey?.unit ?? "")
  const { addSurvey, updateSurvey } = useSurveyStore()
  const { toast } = useToast()
  const { currentUser } = useUserStore()
  const isEdit = !!survey

  const totalSteps = steps.length
  const progress = totalSteps > 1 ? (currentStep / (totalSteps - 1)) * 100 : 0

  const loadQuestions = React.useCallback(async () => {
    setLoadingQuestions(true)
    const { SURVEY_QUESTIONS } = await import("@/lib/survey-questions")
    setQuestions(SURVEY_QUESTIONS)

    const grouped = Object.entries(
      SURVEY_QUESTIONS.reduce(
        (acc, q) => {
          if (!acc[q.dimension]) {
            acc[q.dimension] = []
          }
          acc[q.dimension].push(q)
          return acc
        },
        {} as Record<SurveyDimension, SurveyQuestion[]>
      )
    ).map(([dimension, qs]) => ({
      id: dimension as SurveyDimension,
      title: qs[0].dimension,
      questions: qs,
    }))

    setDimensions(grouped)
    setSteps([
      { id: "01", name: "Unit Kerja" },
      ...grouped.map((dim, index) => ({
        id: (index + 2).toString().padStart(2, "0"),
        name: dim.title,
      })),
    ])
    setLoadingQuestions(false)
  }, [])

  const next = async () => {
    if (currentStep === 0 && steps.length === 1) {
      await loadQuestions()
    }
    setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev))
  }
  const prev = () => setCurrentStep((prev) => (prev > 0 ? prev - 1 : prev))

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const calculateResults = () => {
    let totalScore = 0
    let totalPositive = 0
    let totalNeutral = 0
    let totalNegative = 0
    const totalQuestions = questions.length

    const scoresByDimension: Record<
      string,
      {
        score: number
        positive: number
        neutral: number
        negative: number
        count: number
      }
    > = {}

    questions.forEach((q) => {
      const answer = answers[q.id]
      if (!answer) return // Lewati jika tidak dijawab

      if (!scoresByDimension[q.dimension]) {
        scoresByDimension[q.dimension] = {
          score: 0,
          positive: 0,
          neutral: 0,
          negative: 0,
          count: 0,
        }
      }

      let score = 0
      if (answer === "sangat_setuju") score = 5
      if (answer === "setuju") score = 4
      if (answer === "netral") score = 3
      if (answer === "tidak_setuju") score = 2
      if (answer === "sangat_tidak_setuju") score = 1

      const isPositiveStatement = !q.isNegative
      const finalScore = isPositiveStatement ? score : 6 - score

      scoresByDimension[q.dimension].score += finalScore
      scoresByDimension[q.dimension].count += 1
      totalScore += finalScore

      if (finalScore >= 4) {
        scoresByDimension[q.dimension].positive += 1
        totalPositive += 1
      } else if (finalScore === 3) {
        scoresByDimension[q.dimension].neutral += 1
        totalNeutral += 1
      } else {
        scoresByDimension[q.dimension].negative += 1
        totalNegative += 1
      }
    })

    const finalDimensionScores = Object.fromEntries(
      Object.entries(scoresByDimension).map(([dim, data]) => [
        dim,
        {
          score: data.count > 0 ? data.score / data.count : 0,
          positiveResponses: data.positive,
          neutralResponses: data.neutral,
          negativeResponses: data.negative,
        },
      ])
    )

    return {
      unit,
      scores: finalDimensionScores,
      totalScore: totalQuestions > 0 ? totalScore / totalQuestions : 0,
      positivePercentage:
        totalQuestions > 0 ? (totalPositive / totalQuestions) * 100 : 0,
      neutralPercentage:
        totalQuestions > 0 ? (totalNeutral / totalQuestions) * 100 : 0,
      negativePercentage:
        totalQuestions > 0 ? (totalNegative / totalQuestions) * 100 : 0,
      answers,
    }
  }

  const handleSave = () => {
    if (!unit) {
      toast({
        variant: "destructive",
        title: "Unit Kerja Belum Diisi",
        description: "Harap pilih unit kerja Anda sebelum menyimpan survei.",
      })
      setCurrentStep(0)
      return
    }
    const results = calculateResults()
    if (isEdit && survey) {
      updateSurvey(survey.id, results)
      toast({
        title: "Survei Berhasil Diperbarui",
        description: `Data survei dari unit ${survey.unit} telah diperbarui.`,
      })
    } else {
      addSurvey(results)
      toast({
        title: "Survei Berhasil Disimpan",
        description:
          "Terima kasih atas partisipasi Anda dalam meningkatkan budaya keselamatan pasien.",
      })
    }
    setOpen(false)
  }

  React.useEffect(() => {
    if (currentUser && currentUser.unit && !survey) {
      setUnit(currentUser.unit)
    }
  }, [currentUser, survey])

  React.useEffect(() => {
    if (survey) {
      loadQuestions()
    }
  }, [survey, loadQuestions])

  const renderStepContent = () => {
    if (loadingQuestions) {
      return (
        <div className="flex h-full items-center justify-center">
          <p>Memuat pertanyaan...</p>
        </div>
      )
    }

    if (currentStep === 0) {
      return (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-primary">
            Area / Unit Kerja Anda
          </h3>
          <p className="text-muted-foreground">
            Pilih unit atau bagian tempat Anda bekerja saat ini. Ini akan
            membantu kami dalam menganalisis data secara lebih spesifik.
          </p>
          <Combobox
            options={unitOptions}
            placeholder="Pilih unit Anda..."
            searchPlaceholder="Cari unit..."
            value={unit}
            onSelect={setUnit}
          />
        </div>
      )
    }

    const dimension = dimensions[currentStep - 1]
    if (!dimension) return null

    const startIndex =
      dimensions
        .slice(0, currentStep - 1)
        .reduce((sum, d) => sum + d.questions.length, 0) + 1

    return (
      <SurveyStep
        dimension={dimension}
        answers={answers}
        onChange={handleAnswerChange}
        startIndex={startIndex}
      />
    )
  }

  return (
    <div className="flex flex-col gap-8 p-1 md:flex-row">
      <Stepper
        steps={steps}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
      />
      <div className="flex-1">
        <div className="mb-6 space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Bagian {currentStep + 1} dari {totalSteps}
          </p>
          <Progress value={progress} className="h-2" />
        </div>
        <div className="max-h-[65vh] min-h-[300px] space-y-8 overflow-y-auto pl-1 pr-4">
          {renderStepContent()}
        </div>
        <div className="mt-5 flex items-center justify-between border-t pt-5">
          <div>
            {currentStep > 0 && (
              <Button variant="outline" onClick={prev}>
                Kembali
              </Button>
            )}
          </div>
          <div>
            {currentStep < steps.length - 1 ? (
              <Button onClick={next}>Lanjutkan</Button>
            ) : (
              <Button onClick={handleSave} size="lg">
                Selesai & Simpan Survei
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

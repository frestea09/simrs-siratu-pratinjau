"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Stepper } from "@/components/molecules/stepper"
import { SurveyResult, useSurveyStore } from "@/store/survey-store"
import { useToast } from "@/hooks/use-toast"
import { useUserStore } from "@/store/user-store.tsx"
import {
  SURVEY_QUESTIONS,
  SurveyDimension,
  SurveyQuestion,
} from "@/lib/survey-questions"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"
import { Label } from "../ui/label"
import { Combobox } from "../ui/combobox"
import { HOSPITAL_UNITS } from "@/lib/constants"
import { Alert, AlertDescription } from "../ui/alert"
import { Info } from "lucide-react"

// --- Tipe Data ---
type Answers = Record<string, string> // { "A1": "sangat_setuju", "A2": "setuju", ... }

// --- Struktur & Konten Formulir ---

// Mengelompokkan pertanyaan berdasarkan dimensi
const dimensions: {
  id: SurveyDimension
  title: string
  questions: SurveyQuestion[]
}[] = Object.entries(
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
).map(([dimension, questions]) => ({
  id: dimension as SurveyDimension,
  title: questions[0].dimension, // Ambil judul dari pertanyaan pertama
  questions,
}))

// Membuat langkah-langkah untuk Stepper
const steps = [
  { id: "01", name: "Unit Kerja" },
  ...dimensions.map((dim, index) => ({
    id: (index + 2).toString().padStart(2, "0"),
    name: dim.title,
  })),
]

// Menghitung nomor awal untuk setiap langkah/dimensi
const stepStartQuestionNumber: number[] = [1]; // Step 0 (Unit) tidak punya pertanyaan
let currentQuestionNumber = 1;
dimensions.forEach(dim => {
    stepStartQuestionNumber.push(currentQuestionNumber);
    currentQuestionNumber += dim.questions.length;
});


const unitOptions = HOSPITAL_UNITS.map((unit) => ({ value: unit, label: unit }))

// --- Komponen Formulir Utama ---

type SurveyFormProps = {
  survey?: SurveyResult
  onCancel?: () => void
  onSuccess?: () => void
}

export function SurveyForm({ survey, onCancel, onSuccess }: SurveyFormProps) {
  const [currentStep, setCurrentStep] = React.useState(0)
  const [answers, setAnswers] = React.useState<Answers>(
    () => survey?.answers ?? {}
  )
  const [unit, setUnit] = React.useState<string>(() => survey?.unit ?? "")
  const { addSurvey, updateSurvey } = useSurveyStore()
  const { toast } = useToast()
  const { currentUser } = useUserStore()
  const isEdit = !!survey

  const next = () =>
    setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev))
  const prev = () => setCurrentStep((prev) => (prev > 0 ? prev - 1 : prev))

  const handleAnswerChange = React.useCallback(
    (questionId: string, value: string) => {
      setAnswers((prev) => ({ ...prev, [questionId]: value }))
    },
    []
  )

  const calculateResults = () => {
    let totalScore = 0
    let totalPositive = 0
    let totalNeutral = 0
    let totalNegative = 0
    const totalQuestions = SURVEY_QUESTIONS.length

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

    SURVEY_QUESTIONS.forEach((q) => {
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
    const metadata = survey
      ? {
          submittedById: survey.submittedById,
          submittedByName: survey.submittedByName,
          submittedByRole: survey.submittedByRole,
          ...(survey.locked !== undefined ? { locked: survey.locked } : {}),
          ...(survey.lockedReason !== undefined
            ? { lockedReason: survey.lockedReason }
            : {}),
        }
      : {
          submittedById: currentUser?.id,
          submittedByName: currentUser?.name,
          submittedByRole: currentUser?.role,
        }
    const payload = { ...results, ...metadata }

    if (isEdit && survey) {
      updateSurvey(survey.id, payload)
      toast({
        title: "Survei Berhasil Diperbarui",
        description: `Data survei dari unit ${survey.unit} telah diperbarui.`,
      })
    } else {
      addSurvey(payload)
      toast({
        title: "Survei Berhasil Disimpan",
        description:
          "Terima kasih atas partisipasi Anda dalam meningkatkan budaya keselamatan pasien.",
      })
    }
    onSuccess?.()
  }

  React.useEffect(() => {
    if (currentUser && currentUser.unit && !survey) {
      setUnit(currentUser.unit)
    }
  }, [currentUser, survey])

  const stepContent = React.useMemo(() => {
    if (currentStep === 0) {
      return <UnitStep unit={unit} setUnit={setUnit} />
    }
    const dimension = dimensions[currentStep - 1]
    if (!dimension) return null
    return (
      <DimensionStep
        dimension={dimension}
        answers={answers}
        onChange={handleAnswerChange}
        startNumber={stepStartQuestionNumber[currentStep]}
      />
    )
  }, [answers, currentStep, handleAnswerChange, unit])

  return (
    <div className="flex flex-col gap-8 p-1 md:flex-row">
      <Stepper
        steps={steps}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
      />
      <div className="flex-1">
        <div className="max-h-[65vh] min-h-[300px] space-y-8 overflow-y-auto pl-1 pr-4">
          {stepContent}
        </div>
        <div className="mt-5 flex items-center justify-between border-t pt-5">
          <div>
            {currentStep === 0 ? (
              onCancel && (
                <Button variant="outline" onClick={onCancel}>
                  Batal
                </Button>
              )
            ) : (
              <Button variant="outline" onClick={prev}>
                Kembali
              </Button>
            )}
          </div>
          <div>
            {currentStep < steps.length - 1 ? (
              <Button onClick={next}>Lanjut</Button>
            ) : (
              <Button onClick={handleSave} size="lg">
                Simpan Survei
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// --- Komponen Tambahan ---

const QuestionItem = React.memo(
  ({
    question,
    value,
    onChange,
    questionNumber,
  }: {
    question: SurveyQuestion
    value: string
    onChange: (id: string, val: string) => void
    questionNumber: number
  }) => {
    const options = React.useMemo(
      () => [
        { value: "sangat_setuju", label: "Sangat Setuju" },
        { value: "setuju", label: "Setuju" },
        { value: "netral", label: "Netral" },
        { value: "tidak_setuju", label: "Tidak Setuju" },
        { value: "sangat_tidak_setuju", label: "Sangat Tidak Setuju" },
      ],
      []
    )

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
          {options.map((opt) => (
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
  }
)

QuestionItem.displayName = "QuestionItem"

const UnitStep = React.memo(
  ({ unit, setUnit }: { unit: string; setUnit: (val: string) => void }) => (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-primary">
        Area / Unit Kerja Anda
      </h3>
      <p className="text-muted-foreground">
        Pilih unit atau bagian tempat Anda bekerja saat ini. Ini akan membantu
        kami dalam menganalisis data secara lebih spesifik.
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
)

UnitStep.displayName = "UnitStep"

const DimensionStep = React.memo(
  ({
    dimension,
    answers,
    onChange,
    startNumber,
  }: {
    dimension: { title: string; questions: SurveyQuestion[] }
    answers: Answers
    onChange: (id: string, val: string) => void
    startNumber: number
  }) => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-primary">{dimension.title}</h3>
      {dimension.questions.map((q, index) => (
        <QuestionItem
          key={q.id}
          question={q}
          value={answers[q.id]}
          onChange={onChange}
          questionNumber={startNumber + index}
        />
      ))}
    </div>
  )
)

DimensionStep.displayName = "DimensionStep"

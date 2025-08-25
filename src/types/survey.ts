export type DimensionScore = {
  score: number
  positiveResponses: number
  neutralResponses: number
  negativeResponses: number
}

export type SurveyResult = {
  id: string
  submissionDate: string
  unit: string
  scores: Record<string, DimensionScore>
  totalScore: number
  positivePercentage: number
  neutralPercentage: number
  negativePercentage: number
  answers: Record<string, string>
}

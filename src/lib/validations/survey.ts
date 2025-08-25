import { z } from "zod"

const dimensionScoreSchema = z.object({
  score: z.number(),
  positiveResponses: z.number(),
  neutralResponses: z.number(),
  negativeResponses: z.number(),
})

export const surveyResultSchema = z.object({
  unit: z.string(),
  scores: z.record(dimensionScoreSchema),
  totalScore: z.number(),
  positivePercentage: z.number(),
  neutralPercentage: z.number(),
  negativePercentage: z.number(),
  answers: z.record(z.string()),
})

export type SurveyResultInput = z.infer<typeof surveyResultSchema>


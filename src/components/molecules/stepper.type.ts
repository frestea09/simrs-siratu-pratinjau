export type Step = {
  id: string
  name: string
}

export type StepperProps = {
  steps: Step[]
  currentStep: number
  setCurrentStep: (step: number) => void
}


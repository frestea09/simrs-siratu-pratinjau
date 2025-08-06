
"use client"

import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

type Step = {
    id: string
    name: string
}

type StepperProps = {
    steps: Step[]
    currentStep: number
    setCurrentStep: (step: number) => void
}

export function Stepper({ steps, currentStep, setCurrentStep }: StepperProps) {
    return (
        <nav aria-label="Progress" className="w-full md:w-48">
            <ol role="list" className="overflow-hidden md:flex md:flex-col">
                {steps.map((step, stepIdx) => (
                    <li key={step.name} className={cn("relative", stepIdx !== steps.length - 1 ? "pb-10" : "")}>
                        {stepIdx !== steps.length - 1 ? (
                            <div className="absolute left-4 top-4 -ml-px mt-0.5 h-full w-0.5 bg-gray-300" />
                        ) : null}
                        <button onClick={() => setCurrentStep(stepIdx)} className="group relative flex w-full items-start text-left">
                            <span className="flex h-9 items-center">
                                <span
                                    className={cn(
                                        "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2",
                                        stepIdx <= currentStep ? "border-primary bg-primary text-primary-foreground" : "border-gray-300 bg-background",
                                        "transition-colors duration-200"
                                    )}
                                >
                                    {stepIdx < currentStep ? (
                                        <Check className="h-5 w-5" />
                                    ) : (
                                        <span className={cn(stepIdx > currentStep && "text-muted-foreground")}>{step.id}</span>
                                    )}
                                </span>
                            </span>
                            <span className="ml-4 flex min-w-0 flex-col">
                                <span className={cn(
                                    "text-sm font-medium",
                                     stepIdx <= currentStep ? 'text-primary' : 'text-muted-foreground'
                                     )}>
                                    {step.name}
                                </span>
                            </span>
                        </button>
                    </li>
                ))}
            </ol>
        </nav>
    )
}

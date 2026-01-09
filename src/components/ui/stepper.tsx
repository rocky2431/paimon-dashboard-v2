import * as React from "react"
import { cn } from "@/lib/utils"
import { CheckIcon } from "lucide-react"

interface Step {
  id: string
  title: string
  description?: string
  status: 'pending' | 'current' | 'completed'
}

interface StepperProps {
  steps: Step[]
  currentStep: number
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = index === currentStep
          const isCompleted = index < currentStep
          const isLast = index === steps.length - 1

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 font-medium text-sm transition-all duration-200",
                    isCompleted
                      ? "bg-primary border-primary text-primary-foreground"
                      : isActive
                      ? "border-primary text-primary"
                      : "border-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <CheckIcon className="w-5 h-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="mt-2 text-center">
                  <div
                    className={cn(
                      "text-sm font-medium",
                      isActive || isCompleted
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </div>
                  {step.description && (
                    <div
                      className={cn(
                        "text-xs mt-1",
                        isActive || isCompleted
                          ? "text-muted-foreground"
                          : "text-muted-foreground/60"
                      )}
                    >
                      {step.description}
                    </div>
                  )}
                </div>
              </div>

              {!isLast && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-4 transition-all duration-200",
                    index < currentStep
                      ? "bg-primary"
                      : "bg-muted"
                  )}
                />
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
import type React from "react"

export type FormInputTextareaProps = {
  id: string
  label: string
  placeholder: string
  containerClassName?: string
  value?: string
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void
}


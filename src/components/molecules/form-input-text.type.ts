import type React from "react"

export type FormInputTextProps = {
  id: string
  label: string
  placeholder: string
  containerClassName?: string
  value?: string
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
}


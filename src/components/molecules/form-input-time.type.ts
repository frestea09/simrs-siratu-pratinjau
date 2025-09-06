import type React from "react"

export type FormInputTimeProps = {
  id: string
  label: string
  containerClassName?: string
  value?: string
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
}


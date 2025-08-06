
"use client"

import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type FormInputTextareaProps = {
  id: string
  label: string
  placeholder: string
  containerClassName?: string
}

export function FormInputTextarea({ id, label, placeholder, containerClassName = "grid grid-cols-1 md:grid-cols-form-label-align-top gap-x-4 gap-y-2" }: FormInputTextareaProps) {
  return (
    <div className={containerClassName}>
      <Label htmlFor={id} className="text-right pt-2">
        {label}
      </Label>
      <Textarea id={id} placeholder={placeholder} />
    </div>
  )
}


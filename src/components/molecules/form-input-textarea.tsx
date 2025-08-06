"use client"

import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type FormInputTextareaProps = {
  id: string
  label: string
  placeholder: string
  containerClassName?: string
}

export function FormInputTextarea({ id, label, placeholder, containerClassName }: FormInputTextareaProps) {
  return (
    <div className={containerClassName}>
      <Label htmlFor={id} className="text-right pt-2">
        {label}
      </Label>
      <Textarea id={id} placeholder={placeholder} className="col-span-3" />
    </div>
  )
}

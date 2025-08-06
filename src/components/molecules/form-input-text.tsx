
"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type FormInputTextProps = {
  id: string
  label: string
  placeholder: string
  containerClassName?: string
}

export function FormInputText({ id, label, placeholder, containerClassName = "grid grid-cols-1 md:grid-cols-form-label gap-x-4 gap-y-2 items-center" }: FormInputTextProps) {
  return (
    <div className={containerClassName}>
      <Label htmlFor={id} className="text-right">
        {label}
      </Label>
      <Input id={id} placeholder={placeholder} />
    </div>
  )
}

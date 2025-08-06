
"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type FormInputTimeProps = {
  id: string
  label: string
  containerClassName?: string
  value?: string
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export function FormInputTime({ id, label, containerClassName = "grid grid-cols-1 md:grid-cols-form-label gap-x-4 gap-y-2 items-center", value, onChange }: FormInputTimeProps) {
  return (
    <div className={containerClassName}>
      <Label htmlFor={id} className="text-right">
        {label}
      </Label>
      <Input id={id} type="time" value={value} onChange={onChange} />
    </div>
  )
}

    
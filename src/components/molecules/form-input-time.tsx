
"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { FormInputTimeProps } from "./form-input-time.type"

export function FormInputTime({ id, label, containerClassName = "grid grid-cols-1 md:grid-cols-form-label gap-x-4 gap-y-2 items-center", value, onChange }: FormInputTimeProps) {
  return (
    <div className={containerClassName}>
      <Label htmlFor={id} className="text-right">
        {label}
      </Label>
      <Input id={id} type="time" value={value ?? ""} onChange={onChange} />
    </div>
  )
}

    


"use client"

import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type FormInputSelectProps = {
  id: string
  label: string
  placeholder: string
  items: { value: string; label: string }[]
  containerClassName?: string
}

export function FormInputSelect({ id, label, placeholder, items, containerClassName = "grid grid-cols-1 md:grid-cols-form-label gap-x-4 gap-y-2 items-center" }: FormInputSelectProps) {
  return (
    <div className={containerClassName}>
      <Label htmlFor={id} className="text-right">
        {label}
      </Label>
      <Select>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}


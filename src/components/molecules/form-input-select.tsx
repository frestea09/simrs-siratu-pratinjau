
"use client"

import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import type { FormInputSelectProps } from "./form-input-select.type"

export function FormInputSelect({ id, label, placeholder, items, containerClassName = "grid grid-cols-1 md:grid-cols-form-label gap-x-4 gap-y-2 items-center", value, onValueChange, disabled = false, emptyMessage = "Tidak ada pilihan tersedia" }: FormInputSelectProps) {
  return (
    <div className={containerClassName}>
      <Label htmlFor={id} className="text-right">
        {label}
      </Label>
      <Select value={value ?? ""} onValueChange={onValueChange}>
        <SelectTrigger disabled={disabled}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {items.length > 0 ? (
            items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="" disabled>
              {emptyMessage}
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  )
}

    

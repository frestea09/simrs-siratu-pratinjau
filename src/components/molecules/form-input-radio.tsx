
"use client"

import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

type FormInputRadioProps = {
  id: string
  label: string
  items: { value: string; label: string }[]
  orientation?: 'horizontal' | 'vertical'
  containerClassName?: string
  value?: string
  onValueChange?: (value: string) => void
}

export function FormInputRadio({ id, label, items, orientation = 'horizontal', containerClassName = "grid grid-cols-1 md:grid-cols-form-label gap-x-4 gap-y-2 items-center", value, onValueChange }: FormInputRadioProps) {
  return (
    <div className={containerClassName}>
      <Label htmlFor={id} className="text-right">
        {label}
      </Label>
      <RadioGroup id={id} className={`flex ${orientation === 'horizontal' ? 'flex-row flex-wrap gap-x-6 gap-y-2' : 'flex-col space-y-2'}`} value={value} onValueChange={onValueChange}>
        {items.map((item) => (
          <div key={item.value} className="flex items-center space-x-2">
            <RadioGroupItem value={item.value} id={`${id}-${item.value}`} />
            <Label htmlFor={`${id}-${item.value}`} className="font-normal">{item.label}</Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}

    
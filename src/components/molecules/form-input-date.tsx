
"use client"

import * as React from "react"
import { Label } from "../ui/label"
import { Input } from "../ui/input"

import type { FormInputDateProps } from "./form-input-date.type"

export function FormInputDate({ id, label, containerClassName = "grid grid-cols-1 md:grid-cols-form-label gap-x-4 gap-y-2 items-center", selected, onSelect }: FormInputDateProps) {
  const toValue = (d?: Date) => {
    if (!d) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const parseValue = (v: string): Date | undefined => {
    if (!v) return undefined;
    const [y, m, d] = v.split("-").map(Number);
    if (!y || !m || !d) return undefined;
    return new Date(y, m - 1, d);
  };

  return (
    <div className={containerClassName}>
      <Label htmlFor={id} className="text-right">{label}</Label>
      <Input
        id={id}
        type="date"
        value={toValue(selected)}
        onChange={(e) => onSelect?.(parseValue(e.target.value))}
      />
    </div>
  )
}

    


"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "../ui/label"

type FormInputDateProps = {
  id: string
  label: string
  containerClassName?: string
}

export function FormInputDate({ id, label, containerClassName = "grid grid-cols-1 md:grid-cols-form-label gap-x-4 gap-y-2 items-center" }: FormInputDateProps) {
  const [date, setDate] = React.useState<Date>()

  return (
    <div className={containerClassName}>
        <Label htmlFor={id} className="text-right">{label}</Label>
        <Popover>
            <PopoverTrigger asChild>
            <Button
                id={id}
                variant={"outline"}
                className={cn(
                "justify-start text-left font-normal",
                !date && "text-muted-foreground"
                )}
            >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pilih tanggal</span>}
            </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
            <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
            />
            </PopoverContent>
        </Popover>
    </div>
  )
}

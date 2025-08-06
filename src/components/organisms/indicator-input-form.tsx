"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { useIndicatorStore } from "@/store/indicator-store"

export function IndicatorInputForm() {
  const [date, setDate] = React.useState<Date>()
  const { submittedIndicators } = useIndicatorStore();

  const verifiedIndicators = submittedIndicators.filter(
    (indicator) => indicator.status === 'Diverifikasi'
  );

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="indicator">Nama Indikator</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Pilih indikator yang terverifikasi" />
            </SelectTrigger>
            <SelectContent>
              {verifiedIndicators.map(indicator => (
                <SelectItem key={indicator.id} value={indicator.name.toLowerCase().replace(/ /g, "-")}>
                  {indicator.name} ({indicator.frequency})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="period">Periode Laporan</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pilih tanggal</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="numerator">Numerator</Label>
          <Input id="numerator" type="number" placeholder="Contoh: 980" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="denominator">Denominator</Label>
          <Input id="denominator" type="number" placeholder="Contoh: 1000" />
        </div>
      </div>
      <Button>Simpan Data</Button>
    </div>
  )
}

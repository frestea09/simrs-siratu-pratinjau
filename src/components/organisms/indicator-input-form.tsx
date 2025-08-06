
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
import { useToast } from "@/hooks/use-toast"

export function IndicatorInputForm() {
  const { toast } = useToast()
  const { addIndicator, submittedIndicators } = useIndicatorStore()

  const [selectedIndicator, setSelectedIndicator] = React.useState("")
  const [date, setDate] = React.useState<Date>()
  const [numerator, setNumerator] = React.useState("")
  const [denominator, setDenominator] = React.useState("")

  const verifiedIndicators = submittedIndicators.filter(
    (indicator) => indicator.status === 'Diverifikasi'
  )

  const handleSubmit = () => {
    if (!selectedIndicator || !date || !numerator || !denominator) {
        toast({
            variant: "destructive",
            title: "Data Tidak Lengkap",
            description: "Harap isi semua kolom untuk menyimpan data.",
        })
        return
    }

    addIndicator({
        indicator: selectedIndicator,
        period: format(date, "yyyy-MM"),
        numerator: Number(numerator),
        denominator: Number(denominator)
    })

    toast({
        title: "Data Berhasil Disimpan",
        description: `Capaian untuk ${selectedIndicator} periode ${format(date, "MMMM yyyy")} telah ditambahkan.`,
    })

    // Reset form
    setSelectedIndicator("")
    setDate(undefined)
    setNumerator("")
    setDenominator("")
  }

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="indicator">Nama Indikator</Label>
          <Select value={selectedIndicator} onValueChange={setSelectedIndicator}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih indikator yang terverifikasi" />
            </SelectTrigger>
            <SelectContent>
              {verifiedIndicators.map(indicator => (
                <SelectItem key={indicator.id} value={indicator.name}>
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
          <Input 
            id="numerator" 
            type="number" 
            placeholder="Contoh: 980" 
            value={numerator}
            onChange={(e) => setNumerator(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="denominator">Denominator</Label>
          <Input 
            id="denominator" 
            type="number" 
            placeholder="Contoh: 1000" 
            value={denominator}
            onChange={(e) => setDenominator(e.target.value)}
          />
        </div>
      </div>
      <Button onClick={handleSubmit}>Simpan Data</Button>
    </div>
  )
}

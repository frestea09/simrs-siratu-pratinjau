
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
import { useIndicatorStore, Indicator } from "@/store/indicator-store"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "../ui/textarea"
import { DialogFooter } from "../ui/dialog"

type IndicatorInputFormProps = {
    setOpen: (open: boolean) => void;
    indicatorToEdit?: Indicator;
}

export function IndicatorInputForm({ setOpen, indicatorToEdit }: IndicatorInputFormProps) {
  const { toast } = useToast()
  const { addIndicator, updateIndicator, submittedIndicators } = useIndicatorStore()

  const isEditMode = !!indicatorToEdit;
  
  const [selectedIndicator, setSelectedIndicator] = React.useState(indicatorToEdit?.indicator || "")
  const [date, setDate] = React.useState<Date | undefined>(indicatorToEdit ? new Date(indicatorToEdit.period) : undefined)
  const [numerator, setNumerator] = React.useState(indicatorToEdit?.numerator.toString() || "")
  const [denominator, setDenominator] = React.useState(indicatorToEdit?.denominator.toString() || "")
  const [standard, setStandard] = React.useState(indicatorToEdit?.standard.toString() || "")
  const [notes, setNotes] = React.useState(indicatorToEdit?.notes || "")

  React.useEffect(() => {
    if (indicatorToEdit) {
        setSelectedIndicator(indicatorToEdit.indicator);
        setDate(new Date(indicatorToEdit.period));
        setNumerator(indicatorToEdit.numerator.toString());
        setDenominator(indicatorToEdit.denominator.toString());
        setStandard(indicatorToEdit.standard.toString());
        setNotes(indicatorToEdit.notes || "");
    }
  }, [indicatorToEdit])


  const verifiedIndicators = submittedIndicators.filter(
    (indicator) => indicator.status === 'Diverifikasi'
  )

  const handleSubmit = () => {
    if (!selectedIndicator || !date || !numerator || !denominator || !standard) {
        toast({
            variant: "destructive",
            title: "Data Tidak Lengkap",
            description: "Harap isi semua kolom (kecuali Catatan) untuk menyimpan data.",
        })
        return
    }

    const dataToSave = {
        indicator: selectedIndicator,
        period: format(date, "yyyy-MM"),
        numerator: Number(numerator),
        denominator: Number(denominator),
        standard: Number(standard),
        notes: notes,
    };

    if (isEditMode && indicatorToEdit) {
        updateIndicator(indicatorToEdit.id, dataToSave);
        toast({
            title: "Data Berhasil Diperbarui",
            description: `Capaian untuk ${selectedIndicator} periode ${format(date, "MMMM yyyy")} telah diperbarui.`,
        })
    } else {
         addIndicator(dataToSave)
        toast({
            title: "Data Berhasil Disimpan",
            description: `Capaian untuk ${selectedIndicator} periode ${format(date, "MMMM yyyy")} telah ditambahkan.`,
        })
    }

    // Reset form and close dialog
    setSelectedIndicator("")
    setDate(undefined)
    setNumerator("")
    setDenominator("")
    setStandard("")
    setNotes("")
    setOpen(false);
  }

  const isTimeBased = selectedIndicator === "Waktu Tunggu Rawat Jalan";

  return (
    <div className="space-y-6 pt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="indicator" className="text-base">Nama Indikator</Label>
          <Select value={selectedIndicator} onValueChange={setSelectedIndicator} disabled={isEditMode}>
            <SelectTrigger className="text-base h-11">
              <SelectValue placeholder="Pilih indikator yang terverifikasi" />
            </SelectTrigger>
            <SelectContent>
              {verifiedIndicators.map(indicator => (
                <SelectItem key={indicator.id} value={indicator.name} className="text-base">
                  {indicator.name} ({indicator.frequency})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="period" className="text-base">Periode Laporan</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn("w-full justify-start text-left font-normal text-base h-11", !date && "text-muted-foreground")}
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
      
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
                <Label htmlFor="numerator" className="text-base">Numerator</Label>
                <Input 
                    id="numerator" 
                    type="number" 
                    placeholder={isTimeBased ? "Total waktu tunggu (menit)" : "Jumlah kasus terpenuhi"}
                    value={numerator}
                    onChange={(e) => setNumerator(e.target.value)}
                    className="text-base h-11"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="denominator" className="text-base">Denominator</Label>
                <Input 
                    id="denominator" 
                    type="number" 
                    placeholder={isTimeBased ? "Total pasien" : "Total kasus"}
                    value={denominator}
                    onChange={(e) => setDenominator(e.target.value)}
                    className="text-base h-11"
                />
            </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="standard" className="text-base">Standar Target ({isTimeBased ? "menit" : "%"})</Label>
          <Input 
            id="standard" 
            type="number" 
            placeholder={isTimeBased ? "Contoh: 60" : "Contoh: 100"}
            value={standard}
            onChange={(e) => setStandard(e.target.value)}
            className="text-base h-11"
          />
        </div>
         <div className="space-y-2">
            <Label htmlFor="notes" className="text-base">Catatan Analisis (Opsional)</Label>
            <Textarea
                id="notes"
                placeholder="Tambahkan catatan atau analisis jika hasil tidak sesuai standar."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="text-base min-h-[44px]"
            />
        </div>
      </div>

      <DialogFooter className="pt-4">
        <Button onClick={handleSubmit} size="lg" className="text-base">{isEditMode ? 'Simpan Perubahan' : 'Simpan Data Capaian'}</Button>
      </DialogFooter>
    </div>
  )
}


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
import { useIndicatorStore, Indicator, SubmittedIndicator } from "@/store/indicator-store"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "../ui/textarea"
import { DialogFooter } from "../ui/dialog"
import { useUserStore } from "@/store/user-store"
import { useLogStore } from "@/store/log-store"

const centralRoles = [
  'Admin Sistem',
  'Direktur',
  'Sub. Komite Peningkatan Mutu',
  'Sub. Komite Keselamatan Pasien',
  'Sub. Komite Manajemen Risiko'
];

type IndicatorInputFormProps = {
    setOpen: (open: boolean) => void;
    indicatorToEdit?: Indicator;
}

export function IndicatorInputForm({ setOpen, indicatorToEdit }: IndicatorInputFormProps) {
  const { toast } = useToast()
  const { addIndicator, updateIndicator, submittedIndicators } = useIndicatorStore()
  const { currentUser } = useUserStore()
  const { addLog } = useLogStore()


  const isEditMode = !!indicatorToEdit;
  
  const [selectedIndicatorId, setSelectedIndicatorId] = React.useState<string | undefined>(isEditMode ? submittedIndicators.find(si => si.name === indicatorToEdit.indicator)?.id : undefined);
  const [date, setDate] = React.useState<Date | undefined>(indicatorToEdit ? new Date(indicatorToEdit.period) : new Date())
  const [numerator, setNumerator] = React.useState(indicatorToEdit?.numerator.toString() || "")
  const [denominator, setDenominator] = React.useState(indicatorToEdit?.denominator.toString() || "")
  const [notes, setNotes] = React.useState(indicatorToEdit?.notes || "")

  const selectedSubmittedIndicator = React.useMemo(() => {
    return submittedIndicators.find(si => si.id === selectedIndicatorId);
  }, [selectedIndicatorId, submittedIndicators])


  React.useEffect(() => {
    if (indicatorToEdit) {
        const relatedSubmitted = submittedIndicators.find(si => si.name === indicatorToEdit.indicator);
        setSelectedIndicatorId(relatedSubmitted?.id);
        setDate(new Date(indicatorToEdit.period));
        setNumerator(indicatorToEdit.numerator.toString());
        setDenominator(indicatorToEdit.denominator.toString());
        setNotes(indicatorToEdit.notes || "");
    }
  }, [indicatorToEdit, submittedIndicators])

  const userCanSeeAll = currentUser && centralRoles.includes(currentUser.role);

  const verifiedIndicators = React.useMemo(() => {
      const allVerified = submittedIndicators.filter(
          (indicator) => indicator.status === 'Diverifikasi'
      );
      if (userCanSeeAll || !currentUser?.unit) {
          return allVerified;
      }
      return allVerified.filter(indicator => indicator.unit === currentUser.unit);
  }, [submittedIndicators, currentUser, userCanSeeAll]);


  const handleSubmit = () => {
    if (!selectedSubmittedIndicator || !date || !numerator || !denominator) {
        toast({
            variant: "destructive",
            title: "Data Tidak Lengkap",
            description: "Harap isi semua kolom (kecuali Catatan) untuk menyimpan data.",
        })
        return
    }

    const dataToSave = {
        indicator: selectedSubmittedIndicator.name,
        category: selectedSubmittedIndicator.category,
        unit: selectedSubmittedIndicator.unit, // Add unit to saved data
        period: format(date, "yyyy-MM"),
        numerator: Number(numerator),
        denominator: Number(denominator),
        standard: selectedSubmittedIndicator.standard,
        standardUnit: selectedSubmittedIndicator.standardUnit,
        notes: notes,
    };

    if (isEditMode && indicatorToEdit) {
        updateIndicator(indicatorToEdit.id, dataToSave);
        addLog({
            user: currentUser?.name || 'System',
            action: 'UPDATE_INDICATOR',
            details: `Data capaian untuk "${dataToSave.indicator}" diperbarui.`,
        });
        toast({
            title: "Data Berhasil Diperbarui",
            description: `Capaian untuk ${dataToSave.indicator} periode ${format(date, "MMMM yyyy")} telah diperbarui.`,
        })
    } else {
         const newId = addIndicator(dataToSave)
         addLog({
            user: currentUser?.name || 'System',
            action: 'ADD_INDICATOR',
            details: `Data capaian baru (${newId}) untuk "${dataToSave.indicator}" ditambahkan.`,
        });
        toast({
            title: "Data Berhasil Disimpan",
            description: `Capaian untuk ${dataToSave.indicator} periode ${format(date, "MMMM yyyy")} telah ditambahkan.`,
        })
    }

    // Reset form and close dialog
    setSelectedIndicatorId(undefined)
    setDate(new Date())
    setNumerator("")
    setDenominator("")
    setNotes("")
    setOpen(false);
  }

  const isTimeBased = selectedSubmittedIndicator?.standardUnit === "menit";

  return (
    <div className="space-y-6 pt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="indicator" className="text-base">Nama Indikator</Label>
          <Select value={selectedIndicatorId} onValueChange={setSelectedIndicatorId} disabled={isEditMode}>
            <SelectTrigger className="text-base h-11">
              <SelectValue placeholder="Pilih indikator yang terverifikasi" />
            </SelectTrigger>
            <SelectContent>
              {verifiedIndicators.map(indicator => (
                <SelectItem key={indicator.id} value={indicator.id} className="text-base">
                  {indicator.name} ({indicator.unit})
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
                <Label htmlFor="numerator" className="text-base">{isTimeBased ? "Total Waktu (Menit)" : "Numerator"}</Label>
                <Input 
                    id="numerator" 
                    type="number" 
                    placeholder={isTimeBased ? "Total waktu tunggu" : "Jumlah kasus terpenuhi"}
                    value={numerator}
                    onChange={(e) => setNumerator(e.target.value)}
                    className="text-base h-11"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="denominator" className="text-base">{isTimeBased ? "Total Pasien" : "Denominator"}</Label>
                <Input 
                    id="denominator" 
                    type="number" 
                    placeholder={isTimeBased ? "Total pasien yang disurvei" : "Total kasus"}
                    value={denominator}
                    onChange={(e) => setDenominator(e.target.value)}
                    className="text-base h-11"
                />
            </div>
      </div>
      
       <div className="space-y-2">
            <Label htmlFor="notes" className="text-base">Catatan & Rencana Tindak Lanjut (Opsional)</Label>
            <Textarea
                id="notes"
                placeholder="Jika capaian tidak sesuai standar, jelaskan analisis dan rencana tindak lanjutnya."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="text-base min-h-[44px]"
            />
        </div>
    
      {selectedSubmittedIndicator && (
        <div className="bg-muted p-3 rounded-lg text-sm">
            <p className="font-semibold">Standar Target: <span className="font-bold text-primary">{selectedSubmittedIndicator.standard}{selectedSubmittedIndicator.standardUnit}</span></p>
            <p className="text-muted-foreground">{selectedSubmittedIndicator.description}</p>
        </div>
      )}

      <DialogFooter className="pt-4">
        <Button onClick={handleSubmit} size="lg" className="text-base">{isEditMode ? 'Simpan Perubahan' : 'Simpan Data Capaian'}</Button>
      </DialogFooter>
    </div>
  )
}

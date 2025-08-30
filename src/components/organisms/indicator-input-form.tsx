

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
import { useIndicatorStore, Indicator, SubmittedIndicator, IndicatorCategory } from "@/store/indicator-store"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "../ui/textarea"
import { DialogFooter } from "../ui/dialog"
import { useUserStore } from "@/store/user-store.tsx"
import { useLogStore } from "@/store/log-store.tsx"
import {centralRoles} from "@/store/central-roles.ts";



type IndicatorInputFormProps = {
    setOpen: (open: boolean) => void;
    indicatorToEdit?: Indicator;
    category: IndicatorCategory;
}

export function IndicatorInputForm({ setOpen, indicatorToEdit, category }: IndicatorInputFormProps) {
  const { toast } = useToast()
  const { addIndicator, updateIndicator, submittedIndicators, indicators, profiles } = useIndicatorStore()
  const { currentUser } = useUserStore()
  const { addLog } = useLogStore()


  const isEditMode = !!indicatorToEdit?.id;
  
  const [selectedIndicatorId, setSelectedIndicatorId] = React.useState<string | undefined>(
    indicatorToEdit ? submittedIndicators.find(si => si.name === indicatorToEdit.indicator)?.id : undefined
  );
  const [date, setDate] = React.useState<Date | undefined>(
      indicatorToEdit ? new Date(indicatorToEdit.period) : new Date()
  );
  const [numerator, setNumerator] = React.useState(
      indicatorToEdit ? indicatorToEdit.numerator.toString() : ""
  );
  const [denominator, setDenominator] = React.useState(
      indicatorToEdit ? indicatorToEdit.denominator.toString() : ""
  );
  const [analysisNotes, setAnalysisNotes] = React.useState(
      indicatorToEdit ? indicatorToEdit.analysisNotes || "" : ""
  );
  const [followUpPlan, setFollowUpPlan] = React.useState(
      indicatorToEdit ? indicatorToEdit.followUpPlan || "" : ""
  );


  const selectedSubmittedIndicator = React.useMemo(() => {
    return submittedIndicators.find(si => si.id === selectedIndicatorId);
  }, [selectedIndicatorId, submittedIndicators])


  React.useEffect(() => {
    // This effect now only syncs the form when the indicatorToEdit prop changes,
    // which happens when the dialog is opened for editing.
    // It no longer handles the 'new' case, preventing the loop.
    if (indicatorToEdit?.id) {
        const relatedSubmitted = submittedIndicators.find(si => si.name === indicatorToEdit.indicator);
        setSelectedIndicatorId(relatedSubmitted?.id);
        setDate(new Date(indicatorToEdit.period));
        setNumerator(indicatorToEdit.numerator.toString());
        setDenominator(indicatorToEdit.denominator.toString());
        setAnalysisNotes(indicatorToEdit.analysisNotes || "");
        setFollowUpPlan(indicatorToEdit.followUpPlan || "");
    }
  }, [indicatorToEdit, submittedIndicators])

  const userCanSeeAll = currentUser && centralRoles.includes(currentUser.role);

  const verifiedIndicators = React.useMemo(() => {
      const allVerified = submittedIndicators.filter(
          (indicator) => indicator.status === 'Diverifikasi' && indicator.category === category
      );
      if (userCanSeeAll || !currentUser?.unit) {
          return allVerified;
      }
      return allVerified.filter(indicator => indicator.unit === currentUser.unit);
  }, [submittedIndicators, currentUser, userCanSeeAll, category]);
  
  const filledDates = React.useMemo(() => {
    if (!selectedSubmittedIndicator) return [];
    return indicators
        .filter(i => i.indicator === selectedSubmittedIndicator.name)
        .map(i => new Date(i.period));
  }, [indicators, selectedSubmittedIndicator]);

  const handleSubmit = async () => {
    const profile = profiles.find(p => p.id === selectedSubmittedIndicator?.profileId);
    if (!selectedSubmittedIndicator || !date || !numerator || !denominator || !profile) {
        toast({
            variant: "destructive",
            title: "Data Tidak Lengkap",
            description: "Harap isi semua kolom wajib dan pastikan profil terkait ditemukan.",
        })
        return
    }

    const dataToSave = {
        indicator: selectedSubmittedIndicator.name,
        category: selectedSubmittedIndicator.category,
        unit: selectedSubmittedIndicator.unit,
        period: format(date, "yyyy-MM-dd"), // Save full date
        frequency: selectedSubmittedIndicator.frequency,
        numerator: Number(numerator),
        denominator: Number(denominator),
        formula: profile.formula,
        standard: selectedSubmittedIndicator.standard,
        standardUnit: selectedSubmittedIndicator.standardUnit,
        analysisNotes: analysisNotes,
        followUpPlan: followUpPlan,
    };

    if (isEditMode && indicatorToEdit) {
        await updateIndicator(indicatorToEdit.id, dataToSave);
        addLog({
            user: currentUser?.name || 'System',
            action: 'UPDATE_INDICATOR',
            details: `Data capaian untuk "${dataToSave.indicator}" diperbarui.`,
        });
        toast({
            title: "Data Berhasil Diperbarui",
            description: `Capaian untuk ${dataToSave.indicator} periode ${format(date, "d MMMM yyyy")} telah diperbarui.`,
        })
    } else {
         const newId = await addIndicator({
            ...dataToSave,
            submissionId: selectedSubmittedIndicator.id,
         })
         addLog({
            user: currentUser?.name || 'System',
            action: 'ADD_INDICATOR',
            details: `Data capaian baru (${newId}) untuk "${dataToSave.indicator}" ditambahkan.`,
        });
        toast({
            title: "Data Berhasil Disimpan",
            description: `Capaian untuk ${dataToSave.indicator} periode ${format(date, "d MMMM yyyy")} telah ditambahkan.`,
        })
    }

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
              <Calendar 
                mode="single" 
                selected={date} 
                onSelect={setDate} 
                disabled={{ after: new Date() }}
                initialFocus 
                modifiers={{ filled: filledDates }}
                modifiersStyles={{
                    filled: { 
                        position: 'relative',
                        '::after': {
                            content: '""',
                            display: 'block',
                            position: 'absolute',
                            bottom: '4px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '4px',
                            height: '4px',
                            borderRadius: '50%',
                            backgroundColor: 'hsl(var(--primary))'
                        }
                    }
                }}
              />
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
            <Label htmlFor="analysisNotes" className="text-base">Catatan Analisis</Label>
            <Textarea
                id="analysisNotes"
                placeholder="Jelaskan analisis capaian jika tidak memenuhi standar."
                value={analysisNotes}
                onChange={(e) => setAnalysisNotes(e.target.value)}
                className="text-base min-h-[44px]"
            />
        </div>
        <div className="space-y-2">
            <Label htmlFor="followUpPlan" className="text-base">Rencana Tindak Lanjut</Label>
            <Textarea
                id="followUpPlan"
                placeholder="Jelaskan rencana tindak lanjut untuk perbaikan."
                value={followUpPlan}
                onChange={(e) => setFollowUpPlan(e.target.value)}
                className="text-base min-h-[44px]"
            />
        </div>
    
      {selectedSubmittedIndicator && (
        <div className="bg-muted p-3 rounded-lg text-sm">
            <p className="font-semibold">Standar Target: <span className="font-bold text-primary">{selectedSubmittedIndicator.standard}{selectedSubmittedIndicator.standardUnit}</span> ({selectedSubmittedIndicator.frequency})</p>
            <p className="text-muted-foreground">{selectedSubmittedIndicator.description}</p>
        </div>
      )}

      <DialogFooter className="pt-4">
        <Button onClick={handleSubmit} size="lg" className="text-base">{isEditMode ? 'Simpan Perubahan' : 'Simpan Data Capaian'}</Button>
      </DialogFooter>
    </div>
  )
}

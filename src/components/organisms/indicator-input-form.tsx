

"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// no icon needed for native inputs
import { format, endOfToday } from "date-fns"
import { id as IndonesianLocale } from "date-fns/locale"
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
    if (!selectedSubmittedIndicator || isEditMode) return [];
    return indicators
        .filter(i => i.indicator === selectedSubmittedIndicator.name)
        .map(i => new Date(i.period));
  }, [indicators, selectedSubmittedIndicator, isEditMode]);

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
        calculationMethod: profile.calculationMethod,
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
  
  // For native inputs we'll use max attribute and runtime checks

  const isTimeBased = selectedSubmittedIndicator?.standardUnit === "menit";
  const frequency = selectedSubmittedIndicator?.frequency;

  // Helpers for a friendlier monthly selector (Month + Year)
  const currentYear = new Date().getFullYear();
  const years = React.useMemo(() => Array.from({ length: 6 }, (_, i) => (currentYear - i).toString()), [currentYear]);
  const months = React.useMemo(() => (
    Array.from({ length: 12 }, (_, i) => ({
      value: i.toString(),
      label: format(new Date(currentYear, i, 1), "MMMM", { locale: IndonesianLocale })
    }))
  ), [currentYear]);

  // Helper for native month input value
  const monthValue = React.useMemo(() => {
    if (!date) return "";
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }, [date]);

  // Compute disabled months (already filled or in the future) for monthly mode
  const filledMonthKeys = React.useMemo(() => new Set(
    filledDates.map(d => `${d.getFullYear()}-${d.getMonth()}`)
  ), [filledDates]);
  const today = new Date();
  const maxDateStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  const maxMonthStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}`;

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
          {frequency === "Bulanan" ? (
            <div className="space-y-1">
              <Input
                id="period-month"
                type="month"
                className="text-base h-11"
                value={monthValue}
                max={isEditMode ? undefined : maxMonthStr}
                onChange={(e) => {
                  const v = e.target.value; // YYYY-MM
                  if (!v) { setDate(undefined); return; }
                  const [yStr, mStr] = v.split('-');
                  const y = parseInt(yStr, 10);
                  const m = parseInt(mStr, 10) - 1;
                  if (!isEditMode && filledMonthKeys.has(`${y}-${m}`)) {
                    toast({ variant: "destructive", title: "Bulan sudah terisi", description: "Silakan pilih bulan lain yang belum memiliki capaian." });
                    return;
                  }
                  setDate(new Date(y, m, 1));
                }}
              />
              <p className="text-xs text-muted-foreground">Gunakan pemilih bulan/tahun bawaan perangkat.</p>
            </div>
          ) : (
            <Input
              id="period-date"
              type="date"
              className="text-base h-11"
              value={date ? `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}` : ''}
              max={isEditMode ? undefined : maxDateStr}
              onChange={(e) => {
                const v = e.target.value; // YYYY-MM-DD
                if (!v) { setDate(undefined); return; }
                const [y, m, d] = v.split('-').map(Number);
                const picked = new Date(y, (m||1)-1, d||1);
                if (!isEditMode) {
                  const pickedKey = `${picked.getFullYear()}-${String(picked.getMonth()+1).padStart(2,'0')}-${String(picked.getDate()).padStart(2,'0')}`;
                  const existingKeys = new Set(filledDates.map(fd => `${fd.getFullYear()}-${String(fd.getMonth()+1).padStart(2,'0')}-${String(fd.getDate()).padStart(2,'0')}`));
                  if (existingKeys.has(pickedKey)) {
                    toast({ variant: "destructive", title: "Tanggal sudah terisi", description: "Silakan pilih tanggal lain yang belum memiliki capaian." });
                    return;
                  }
                }
                setDate(picked);
              }}
            />
          )}
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

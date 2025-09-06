

"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DialogFooter } from "../ui/dialog"
import { IndicatorProfile, useIndicatorStore } from "@/store/indicator-store"
import { useToast } from "@/hooks/use-toast"
import { useUserStore, UserRole } from "@/store/user-store.tsx"
import { useLogStore } from "@/store/log-store.tsx"
import { HOSPITAL_UNITS } from "@/lib/constants"
import { Combobox } from "../ui/combobox"
import type { ProfileFormProps } from "./profile-form.type"

const profileSchema = z.object({
  title: z.string().min(1, "Judul harus diisi."),
  purpose: z.string().min(1, "Tujuan harus diisi."),
  definition: z.string().min(1, "Definisi operasional harus diisi."),
  implication: z.string().min(1, "Implikasi terhadap mutu harus diisi."),
  calculationMethod: z.enum(['percentage', 'average']),
  numerator: z.string().min(1, "Definisi numerator harus diisi."),
  denominator: z.string().min(1, "Definisi denominator harus diisi."),
  target: z.coerce.number().positive("Target harus angka positif."),
  targetUnit: z.enum(['%', 'menit']),
  inclusionCriteria: z.string().min(1, "Kriteria inklusi harus diisi."),
  exclusionCriteria: z.string().min(1, "Kriteria eksklusi harus diisi."),
  dataRecording: z.string().min(1, "Pencatatan data harus dijelaskan."),
  unitRecap: z.string().min(1, "Rekapitulasi unit harus dijelaskan."),
  analysisReporting: z.string().min(1, "Analisis dan pelaporan harus dijelaskan."),
  area: z.string().min(1, "Area harus diisi."),
  pic: z.string().min(1, "PIC harus diisi."),
  unit: z.string().min(1, "Unit harus dipilih."),
})

const unitOptions = HOSPITAL_UNITS.map(unit => ({ value: unit, label: unit }));
const roleOptions: {value: UserRole, label: string}[] = [
    { value: "PIC Mutu", label: "PIC Mutu" },
    { value: "PJ Ruangan", label: "PJ Ruangan" },
]

export function ProfileForm({ setOpen, profileToEdit }: ProfileFormProps) {
  const { toast } = useToast()
  const { addProfile, updateProfile } = useIndicatorStore()
  const { currentUser } = useUserStore()
  const { addLog } = useLogStore()
  const isEditMode = !!profileToEdit

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: isEditMode ? profileToEdit : {
      title: "",
      purpose: "",
      definition: "",
      implication: "",
      calculationMethod: "percentage",
      numerator: "",
      denominator: "",
      target: 100,
      targetUnit: "%",
      inclusionCriteria: "",
      exclusionCriteria: "",
      dataRecording: "",
      unitRecap: "",
      analysisReporting: "",
      area: "",
      pic: "",
      unit: currentUser?.unit || "",
    },
  })
  
  const calculationMethod = form.watch("calculationMethod");

  React.useEffect(() => {
    if (calculationMethod === "percentage") {
        form.setValue("targetUnit", "%");
    } else if (calculationMethod === "average") {
        form.setValue("targetUnit", "menit");
    }
  }, [calculationMethod, form]);


  async function handleSave(values: z.infer<typeof profileSchema>, status: IndicatorProfile['status']) {
    const dataToSave: Omit<IndicatorProfile, "id" | "createdAt"> = {
        ...values,
        status,
        createdBy: currentUser?.id || '',
    };

    try {
      if (isEditMode && profileToEdit) {
          await updateProfile(profileToEdit.id, dataToSave);
          addLog({
              user: currentUser?.name || "System",
              action: 'UPDATE_INDICATOR',
              details: `Profil indikator \"${values.title}\" diperbarui.`
          })
          toast({
              title: "Profil Diperbarui",
              description: `Profil untuk \"${values.title}\" telah berhasil diperbarui.`,
          })
      } else {
          const newId = await addProfile(dataToSave);
          addLog({
              user: currentUser?.name || "System",
              action: 'ADD_INDICATOR',
              details: `Profil indikator baru \"${values.title}\" (${newId}) dibuat.`
          })
          toast({
            title: "Profil Berhasil Dibuat",
            description: `Profil \"${values.title}\" telah disimpan sebagai ${status}.`,
          })
      }
      setOpen(false);
      form.reset();
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Gagal menyimpan profil',
        description: e?.message || 'Terjadi kesalahan saat menyimpan profil.'
      })
    }
  }

  return (
    <Form {...form}>
        <form className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem><FormLabel>Judul Indikator</FormLabel><FormControl><Input placeholder="Contoh: Kepatuhan Penggunaan APD oleh Petugas" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
             <FormField control={form.control} name="purpose" render={({ field }) => (
                <FormItem><FormLabel>Tujuan</FormLabel><FormControl><Textarea placeholder="Jelaskan tujuan dari pengukuran indikator ini" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
             <FormField control={form.control} name="definition" render={({ field }) => (
                <FormItem><FormLabel>Definisi Operasional</FormLabel><FormControl><Textarea placeholder="Jelaskan secara detail apa yang diukur" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
             <FormField control={form.control} name="implication" render={({ field }) => (
                <FormItem><FormLabel>Implikasi Terhadap Peningkatan Mutu</FormLabel><FormControl><Textarea placeholder="Jelaskan bagaimana indikator ini berdampak pada mutu pelayanan" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="numerator" render={({ field }) => (
                    <FormItem><FormLabel>Definisi Numerator</FormLabel><FormControl><Input placeholder="Jumlah petugas yang patuh..." {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="denominator" render={({ field }) => (
                    <FormItem><FormLabel>Definisi Denominator</FormLabel><FormControl><Input placeholder="Total petugas yang diamati..." {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
            </div>
             <FormField
                control={form.control}
                name="calculationMethod"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Metode Perhitungan</FormLabel>
                         <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih bagaimana capaian dihitung" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="percentage">Persentase (Semakin tinggi semakin baik)</SelectItem>
                                <SelectItem value="average">Rata-rata (Semakin rendah semakin baik)</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormDescription>
                            Sistem akan otomatis menghitung capaian berdasarkan metode ini.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
             />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField control={form.control} name="target" render={({ field }) => (
                    <FormItem><FormLabel>Standar / Target</FormLabel><FormControl><Input type="number" placeholder="100" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={form.control} name="targetUnit" render={({ field }) => (
                    <FormItem><FormLabel>Satuan Target</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="%">%</SelectItem><SelectItem value="menit">Menit</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                )}/>
            </div>
             <FormField control={form.control} name="inclusionCriteria" render={({ field }) => (
                <FormItem><FormLabel>Kriteria Inklusi</FormLabel><FormControl><Textarea placeholder="Sebutkan semua kriteria yang masuk dalam pengukuran" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
             <FormField control={form.control} name="exclusionCriteria" render={({ field }) => (
                <FormItem><FormLabel>Kriteria Eksklusi</FormLabel><FormControl><Textarea placeholder="Sebutkan semua kriteria yang tidak masuk dalam pengukuran" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
             <FormField control={form.control} name="dataRecording" render={({ field }) => (
                <FormItem><FormLabel>Pencatatan Data</FormLabel><FormControl><Textarea placeholder="Jelaskan bagaimana dan di mana data akan dicatat" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
             <FormField control={form.control} name="unitRecap" render={({ field }) => (
                <FormItem><FormLabel>Rekapitulasi di Tingkat Unit</FormLabel><FormControl><Textarea placeholder="Jelaskan proses rekapitulasi di unit kerja" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
             <FormField control={form.control} name="analysisReporting" render={({ field }) => (
                <FormItem><FormLabel>Analisis dan Pelaporan</FormLabel><FormControl><Textarea placeholder="Jelaskan bagaimana analisis dan pelaporan akan dilakukan" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <FormField control={form.control} name="area" render={({ field }) => (
                    <FormItem><FormLabel>Area Monitoring</FormLabel><FormControl><Input placeholder="Contoh: Seluruh area rawat inap" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={form.control} name="pic" render={({ field }) => (
                    <FormItem><FormLabel>PIC</FormLabel><FormControl><Input placeholder="Contoh: Kepala Ruangan" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={form.control} name="unit" render={({ field }) => (
                    <FormItem><FormLabel>Unit</FormLabel><Combobox options={unitOptions} placeholder="Pilih unit" searchPlaceholder="Cari unit..." value={field.value} onSelect={field.onChange} disabled={!currentUser || !['Admin Sistem', 'Direktur'].includes(currentUser.role)} /><FormMessage /></FormItem>
                )}/>
            </div>
            
            <DialogFooter className="pt-4 gap-2">
                <Button type="button" variant="outline" onClick={form.handleSubmit((values) => handleSave(values, 'Draf'))}>Simpan sebagai Draf</Button>
                <Button type="button" onClick={form.handleSubmit((values) => handleSave(values, 'Menunggu Persetujuan'))}>Simpan & Ajukan Persetujuan</Button>
            </DialogFooter>
        </form>
    </Form>
  )
}

    

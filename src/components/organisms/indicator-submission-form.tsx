
"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DialogFooter } from "../ui/dialog"
import { SubmittedIndicator, useIndicatorStore, IndicatorCategory, IndicatorProfile } from "@/store/indicator-store"
import { useToast } from "@/hooks/use-toast"
import { useUserStore } from "@/store/user-store.tsx"
import { useLogStore } from "@/store/log-store.tsx"
import { Combobox } from "../ui/combobox"
import { useNotificationStore } from "@/store/notification-store.tsx"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"

const formSchema = z.object({
  profileId: z.string({ required_error: "Anda harus memilih profil indikator yang telah disetujui." }),
  category: z.enum(['INM', 'IMP-RS', 'IMPU', 'SPM'], {
    required_error: "Anda harus memilih kategori indikator.",
  }),
  frequency: z.enum(['Harian', 'Mingguan', 'Bulanan', 'Tahunan'], {
    required_error: "Anda harus memilih frekuensi pelaporan.",
  }),
})

type IndicatorSubmissionFormProps = {
    setOpen: (open: boolean) => void;
    indicator?: SubmittedIndicator;
}

const categoryOptions: {value: IndicatorCategory, label: string}[] = [
    { value: 'INM', label: 'Indikator Nasional Mutu (INM)'},
    { value: 'IMP-RS', label: 'Indikator Mutu Prioritas RS (IMP-RS)'},
    { value: 'IMPU', label: 'Indikator Mutu Prioritas Unit (IMPU)'},
    { value: 'SPM', label: 'Standar Pelayanan Minimal (SPM)'},
]

export function IndicatorSubmissionForm({ setOpen, indicator }: IndicatorSubmissionFormProps) {
  const { toast } = useToast()
  const { submitIndicator, updateSubmittedIndicator, profiles } = useIndicatorStore()
  const { currentUser } = useUserStore();
  const { addLog } = useLogStore();
  const { addNotification } = useNotificationStore();
  const isEditMode = !!indicator;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      profileId: indicator?.profileId,
      category: indicator?.category,
      frequency: indicator?.frequency || 'Bulanan',
    },
  })
  
  const approvedProfiles = React.useMemo(() => {
    return profiles.filter(p => p.status === 'Disetujui').map(p => ({
        value: p.id,
        label: p.title,
    }))
  }, [profiles]);

  const selectedProfileId = form.watch("profileId");
  const selectedProfile = React.useMemo(() => {
    return profiles.find(p => p.id === selectedProfileId);
  }, [selectedProfileId, profiles]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!selectedProfile) {
        toast({ variant: 'destructive', title: 'Profil tidak ditemukan!'})
        return;
    }

    const submissionData = {
        name: selectedProfile.title,
        unit: selectedProfile.unit,
        description: selectedProfile.definition,
        standard: selectedProfile.target,
        standardUnit: selectedProfile.targetUnit,
        category: values.category,
        frequency: values.frequency,
        profileId: values.profileId,
        submittedById: currentUser?.id || '',
        status: 'Diverifikasi' as const, // Auto-verified since it's based on approved profile
    };

    if (isEditMode && indicator.id) {
        await updateSubmittedIndicator(indicator.id, submissionData)
        addLog({
            user: currentUser?.name || "System",
            action: 'UPDATE_SUBMITTED_INDICATOR',
            details: `Pengajuan indikator "${submissionData.name}" diperbarui.`
        })
        toast({
            title: "Pengajuan Diperbarui",
            description: `Pengajuan untuk "${submissionData.name}" telah berhasil diperbarui.`,
        })
    } else {
        const newId = await submitIndicator(submissionData)
        addLog({
            user: currentUser?.name || "System",
            action: 'ADD_SUBMITTED_INDICATOR',
            details: `Indikator baru "${submissionData.name}" (${newId}) diajukan berdasarkan profil.`
        })

        toast({
          title: "Pengajuan Berhasil",
          description: `Indikator "${submissionData.name}" telah berhasil diajukan dan siap digunakan untuk pelaporan.`,
        })
    }
    setOpen(false);
    form.reset();
  }

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            
            <FormField
                control={form.control}
                name="profileId"
                render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pilih Profil Indikator</FormLabel>
                       <Combobox
                            options={approvedProfiles}
                            placeholder="Pilih profil yang disetujui..."
                            searchPlaceholder="Cari judul profil..."
                            value={field.value}
                            onSelect={field.onChange}
                            disabled={isEditMode}
                        />
                      <FormMessage />
                    </FormItem>
                )}
            />

            {selectedProfile && (
                 <Card className="bg-muted/50">
                    <CardHeader>
                        <CardTitle className="text-lg">{selectedProfile.title}</CardTitle>
                        <CardDescription>Unit: {selectedProfile.unit} | Target: {selectedProfile.target}{selectedProfile.targetUnit}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        <p>{selectedProfile.definition}</p>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Kategori Indikator</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih kategori" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {categoryOptions.map((cat) => (
                                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Frekuensi Pelaporan</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih frekuensi" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="Harian">Harian</SelectItem>
                            <SelectItem value="Mingguan">Mingguan</SelectItem>
                            <SelectItem value="Bulanan">Bulanan</SelectItem>
                            <SelectItem value="Tahunan">Tahunan</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            
            <DialogFooter className="pt-4">
                <Button type="submit" disabled={!selectedProfile}>{isEditMode ? 'Simpan Perubahan' : 'Ajukan Indikator'}</Button>
            </DialogFooter>
        </form>
    </Form>
  )
}



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
  unit: z.string({ required_error: "Anda harus memilih unit pelapor." }),
  category: z.enum(['INM', 'IMP-RS', 'IMPU', 'SPM'], {
    required_error: "Anda harus memilih kategori indikator.",
  }),
  frequency: z.enum(['Harian', 'Mingguan', 'Bulanan', 'Triwulan', 'Tahunan'], {
    required_error: "Anda harus memilih frekuensi pelaporan.",
  }),
})

type IndicatorSubmissionFormProps = {
  setOpen: (open: boolean) => void;
  indicator?: SubmittedIndicator;
}

const categoryOptions: { value: IndicatorCategory, label: string }[] = [
  { value: 'INM', label: 'Indikator Nasional Mutu (INM)' },
  { value: 'IMP-RS', label: 'Indikator Mutu Prioritas RS (IMP-RS)' },
  { value: 'IMPU', label: 'Indikator Mutu Prioritas Unit (IMPU)' },
  { value: 'SPM', label: 'Standar Pelayanan Minimal (SPM)' },
]

export function IndicatorSubmissionForm({ setOpen, indicator }: IndicatorSubmissionFormProps) {
  const { toast } = useToast()
  const { submitIndicator, updateSubmittedIndicator, profiles, fetchProfiles } = useIndicatorStore()
  const { currentUser } = useUserStore();
  const { addLog } = useLogStore();
  const { addNotification } = useNotificationStore();
  const isEditMode = !!indicator;

  React.useEffect(() => {
    if (!profiles.length) {
      fetchProfiles().catch(() => { })
    }
  }, [profiles.length, fetchProfiles])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      profileId: indicator?.profileId,
      unit: indicator?.unit || '',
      category: indicator?.category,
      frequency: indicator?.frequency || 'Bulanan',
    },
  })

  const approvedProfiles = React.useMemo(() => {
    return profiles
      .filter((p) => {
        if (p.status !== "Disetujui") return false
        if (!currentUser) return false

        // Admin and central roles can see all approved profiles
        const centralRoles = ["Admin Sistem", "Direktur", "Sub. Komite Peningkatan Mutu"]
        if (centralRoles.includes(currentUser.role)) return true

        if (p.unit === "Semua unit") return true
        const profileUnits = p.unit.split(", ").map(u => u.trim()).filter(Boolean)
        return profileUnits.includes(currentUser.unit || "")
      })
      .map((p) => ({
        value: p.id,
        label: p.title,
      }))
  }, [profiles, currentUser])

  const selectedProfileId = form.watch("profileId");
  const selectedProfile = React.useMemo(() => {
    return profiles.find(p => p.id === selectedProfileId);
  }, [selectedProfileId, profiles]);

  const availableUnits = React.useMemo(() => {
    if (!selectedProfile || !currentUser) return []

    // User units
    const userUnits = currentUser.unit ? currentUser.unit.split(", ").map(u => u.trim()).filter(Boolean) : []
    const isCentral = ["Admin Sistem", "Direktur", "Sub. Komite Peningkatan Mutu"].includes(currentUser.role)

    // Profile units
    if (selectedProfile.unit === "Semua unit") {
      // If profile is for "Semua unit", regular users can only submit for their own units.
      // Central users can submit for any unit in the system (or we could limit them too, but let's keep it flexible for now or just user units if they have them).
      if (isCentral) return userUnits.length > 0 ? userUnits : ["Semua unit"]
      return userUnits
    }

    const profileUnits = selectedProfile.unit.split(", ").map(u => u.trim()).filter(Boolean)

    if (isCentral) return profileUnits // Central can submit for any unit assigned to the profile

    // Intersection for regular users
    return userUnits.filter(uu => profileUnits.includes(uu))
  }, [selectedProfile, currentUser])

  // Auto-set unit if only one is available
  React.useEffect(() => {
    if (availableUnits.length === 1 && !form.getValues("unit")) {
      form.setValue("unit", availableUnits[0])
    }
  }, [availableUnits, form])


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!selectedProfile) {
      toast({ variant: 'destructive', title: 'Profil tidak ditemukan!' })
      return;
    }

    const submissionData = {
      name: selectedProfile.title,
      unit: values.unit,
      description: selectedProfile.definition,
      standard: selectedProfile.target,
      standardUnit: selectedProfile.targetUnit,
      category: values.category,
      frequency: values.frequency,
      profileId: values.profileId,
      submittedById: currentUser?.id || '',
      status: 'Menunggu Persetujuan' as const,
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
        details: `Indikator baru "${submissionData.name}" (${newId}) diajukan dan menunggu persetujuan.`
      })

      addNotification({
        title: 'Pengajuan Indikator Baru',
        description: `Indikator "${submissionData.name}" dari unit ${submissionData.unit} memerlukan verifikasi Anda.`,
        link: '/dashboard/indicators',
        recipientRole: 'Sub. Komite Peningkatan Mutu',
      })

      toast({
        title: "Pengajuan Berhasil",
        description: `Indikator "${submissionData.name}" telah berhasil diajukan dan menunggu verifikasi.`,
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
          <>
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-lg">{selectedProfile.title}</CardTitle>
                <CardDescription>Unit: {selectedProfile.unit} | Target: {selectedProfile.target}{selectedProfile.targetUnit}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>{selectedProfile.definition}</p>
              </CardContent>
            </Card>

            {availableUnits.length > 1 && (
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Pelapor</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableUnits.map((u) => (
                          <SelectItem key={u} value={u}>{u}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </>
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
                    <SelectItem value="Triwulan">Triwulan</SelectItem>
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

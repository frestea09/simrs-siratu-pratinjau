
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
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DialogFooter } from "../ui/dialog"
import { SubmittedIndicator, useIndicatorStore, IndicatorCategory } from "@/store/indicator-store"
import { useToast } from "@/hooks/use-toast"
import { HOSPITAL_UNITS } from "@/lib/constants"
import { useUserStore } from "@/store/user-store"
import { useLogStore } from "@/store/log-store"
import { Combobox } from "../ui/combobox"
import { useNotificationStore } from "@/store/notification-store"

const formSchema = z.object({
  name: z.string().min(5, {
    message: "Nama indikator harus memiliki setidaknya 5 karakter.",
  }),
  category: z.enum(['INM', 'IMP-RS', 'IPU', 'SPM'], {
    required_error: "Anda harus memilih kategori indikator.",
  }),
  unit: z.string({ required_error: "Anda harus memilih unit." }),
  frequency: z.enum(['Harian', 'Mingguan', 'Bulanan', '6 Bulanan'], {
    required_error: "Anda harus memilih frekuensi pelaporan.",
  }),
  description: z.string().min(10, {
    message: "Deskripsi harus memiliki setidaknya 10 karakter.",
  }),
  standard: z.coerce.number({ invalid_type_error: "Standar harus berupa angka." }).positive("Standar harus lebih dari 0."),
  standardUnit: z.enum(['%', 'menit'], {
    required_error: "Anda harus memilih satuan standar.",
  }),
})

type IndicatorSubmissionFormProps = {
    setOpen: (open: boolean) => void;
    indicator?: SubmittedIndicator;
}

const categoryOptions: {value: IndicatorCategory, label: string}[] = [
    { value: 'INM', label: 'Indikator Nasional Mutu (INM)'},
    { value: 'IMP-RS', label: 'Indikator Mutu Prioritas RS (IMP-RS)'},
    { value: 'IPU', label: 'Indikator Prioritas Unit (IPU)'},
    { value: 'SPM', label: 'Standar Pelayanan Minimal (SPM)'},
]

const centralRoles = [
  'Admin Sistem',
  'Direktur',
  'Sub. Komite Peningkatan Mutu',
  'Sub. Komite Keselamatan Pasien',
  'Sub. Komite Manajemen Risiko'
];

export function IndicatorSubmissionForm({ setOpen, indicator }: IndicatorSubmissionFormProps) {
  const { toast } = useToast()
  const { submitIndicator, updateSubmittedIndicator, submittedIndicators } = useIndicatorStore()
  const { currentUser } = useUserStore();
  const { addLog } = useLogStore();
  const { addNotification } = useNotificationStore();
  const isEditMode = !!indicator;
  
  const userCanSelectUnit = currentUser && centralRoles.includes(currentUser.role);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: isEditMode ? {
        name: indicator.name,
        category: indicator.category,
        unit: indicator.unit,
        frequency: indicator.frequency,
        description: indicator.description,
        standard: indicator.standard,
        standardUnit: indicator.standardUnit,
    } : {
      name: "",
      unit: userCanSelectUnit ? undefined : currentUser?.unit,
      description: "",
      standard: 100,
      standardUnit: '%',
    },
  })

  const selectedCategory = form.watch("category");

  const availableIndicators = React.useMemo(() => {
    return submittedIndicators
        .filter(i => 
            i.status === 'Diverifikasi' && 
            (i.category === 'INM' || i.category === 'IMP-RS' || i.category === 'SPM')
        )
        .map(i => ({ 
            value: `ind-${i.id}`, 
            label: `[${i.category}] ${i.name}`,
            source: 'indicator',
            data: i
        }));
  }, [submittedIndicators]);

  const handleAdoptIndicator = (value: string) => {
    const selected = availableIndicators.find(i => i.value === value);
    if (!selected) return;
    
    const indicatorData = selected.data as SubmittedIndicator;
    form.setValue('name', indicatorData.name);
    form.setValue('description', indicatorData.description);
    form.setValue('standard', indicatorData.standard);
    form.setValue('standardUnit', indicatorData.standardUnit);
  }


  function onSubmit(values: z.infer<typeof formSchema>) {
    if (isEditMode && indicator.id) {
        updateSubmittedIndicator(indicator.id, values)
        addLog({
            user: currentUser?.name || "System",
            action: 'UPDATE_SUBMITTED_INDICATOR',
            details: `Pengajuan indikator "${values.name}" diperbarui.`
        })
        toast({
            title: "Pengajuan Diperbarui",
            description: `Pengajuan untuk "${values.name}" telah berhasil diperbarui.`,
        })
    } else {
        const newId = submitIndicator(values as any)
        addLog({
            user: currentUser?.name || "System",
            action: 'ADD_SUBMITTED_INDICATOR',
            details: `Indikator baru "${values.name}" (${newId}) diajukan.`
        })

        if(values.category === 'IPU') {
             const notificationPayload = {
                title: 'Pengajuan Indikator Baru (IPU)',
                description: `Indikator "${values.name}" dari unit ${values.unit} menunggu persetujuan.`,
                link: '/dashboard/indicators',
            };
            // Notify PJ Ruangan in the same unit
            addNotification({ ...notificationPayload, recipientUnit: values.unit, recipientRole: 'PJ Ruangan' });
            // Notify Kepala Unit/Instalasi in the same unit
            addNotification({ ...notificationPayload, recipientUnit: values.unit, recipientRole: 'Kepala Unit/Instalasi' });
            // Notify the central committee
            addNotification({ ...notificationPayload, recipientRole: 'Sub. Komite Peningkatan Mutu' });
        }

        toast({
          title: "Pengajuan Berhasil",
          description: `Indikator "${values.name}" telah berhasil diajukan.`,
        })
    }
    setOpen(false)
    form.reset()
  }

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
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
                 {selectedCategory === 'IPU' && (
                    <FormItem>
                        <FormLabel>Ambil dari Indikator yang Ada (Opsional)</FormLabel>
                        <Combobox
                            options={availableIndicators}
                            placeholder="Pilih dari INM/IMP-RS/SPM..."
                            searchPlaceholder="Cari indikator..."
                            onSelect={handleAdoptIndicator}
                        />
                    </FormItem>
                )}
            </div>

             <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Nama Indikator</FormLabel>
                    <FormControl>
                        <Input placeholder="Contoh: Kepatuhan Penggunaan APD" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Unit</FormLabel>
                           <Combobox
                                options={unitOptions}
                                placeholder="Pilih unit..."
                                searchPlaceholder="Cari unit..."
                                value={field.value}
                                onSelect={(value) => form.setValue('unit', value)}
                                disabled={!userCanSelectUnit && !!currentUser?.unit}
                            />
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
                            <SelectItem value="6 Bulanan">6 Bulanan</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            
            <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Deskripsi</FormLabel>
                <FormControl>
                    <Textarea
                    placeholder="Jelaskan tujuan dan cara pengukuran indikator ini."
                    {...field}
                    />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="standard"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Standar Target</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="Contoh: 100" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="standardUnit"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Satuan Standar</FormLabel>
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih satuan" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="%">% (Persen)</SelectItem>
                                    <SelectItem value="menit">Menit</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            
            <DialogFooter className="pt-4">
                <Button type="submit">{isEditMode ? 'Simpan Perubahan' : 'Ajukan Indikator'}</Button>
            </DialogFooter>
        </form>
    </Form>
  )
}

    
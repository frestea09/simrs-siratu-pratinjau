

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
import { useUserStore } from "@/store/user-store.tsx"
import { useLogStore } from "@/store/log-store.tsx"
import { Combobox } from "../ui/combobox"
import { useNotificationStore } from "@/store/notification-store.tsx"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"
import {centralRoles} from "@/store/central-roles.ts";

const formSchema = z.object({
  name: z.string().min(5, {
    message: "Nama indikator harus memiliki setidaknya 5 karakter.",
  }),
  category: z.enum(['INM', 'IMP-RS', 'IMPU', 'SPM'], {
    required_error: "Anda harus memilih kategori indikator.",
  }),
  unit: z.string({ required_error: "Anda harus memilih unit." }),
  frequency: z.enum(['Harian', 'Mingguan', 'Bulanan', 'Tahunan'], {
    required_error: "Anda harus memilih frekuensi pelaporan.",
  }),
  description: z.string().min(10, {
    message: "Deskripsi harus memiliki setidaknya 10 karakter.",
  }),
  standard: z.coerce.number({ invalid_type_error: "Standar harus berupa angka." }).positive("Standar harus lebih dari 0."),
  standardUnit: z.enum(['%', 'menit'], {
    required_error: "Anda harus memilih satuan standar.",
  }),
  // Fields for adoption logic
  adoptionType: z.enum(['new', 'adopt']).optional(),
  adoptedIndicatorId: z.string().optional(),
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

const unitOptions = HOSPITAL_UNITS.map(unit => ({ value: unit, label: unit }));



export function IndicatorSubmissionForm({ setOpen, indicator }: IndicatorSubmissionFormProps) {
  const { toast } = useToast()
  const { submitIndicator, updateSubmittedIndicator, submittedIndicators } = useIndicatorStore()
  const { currentUser } = useUserStore();
  const addLog = useLogStore((state) => state.addLog);
  const { addNotification } = useNotificationStore();
  const isEditMode = !!indicator;

  const userIsCentral = currentUser && centralRoles.includes(currentUser.role);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: isEditMode ? {
        ...indicator,
        adoptionType: 'new',
    } : {
      name: "",
      unit: userIsCentral ? undefined : currentUser?.unit,
      description: "",
      standard: 100,
      standardUnit: '%',
      frequency: 'Bulanan',
      adoptionType: 'new',
    },
  })

  const selectedCategory = form.watch("category");
  const adoptionType = form.watch("adoptionType");
  const adoptedIndicatorId = form.watch("adoptedIndicatorId");

  const adoptableIndicators = React.useMemo(() => {
    return submittedIndicators.filter(ind => 
        ind.status === 'Diverifikasi' && ['INM', 'IMP-RS', 'SPM'].includes(ind.category)
    ).map(ind => ({ value: ind.id, label: `${ind.category} - ${ind.name}` }));
  }, [submittedIndicators]);

  React.useEffect(() => {
    if (adoptionType === 'adopt' && adoptedIndicatorId) {
        const adopted = submittedIndicators.find(ind => ind.id === adoptedIndicatorId);
        if (adopted) {
            form.setValue('name', adopted.name);
            form.setValue('description', adopted.description);
            form.setValue('standard', adopted.standard);
            form.setValue('standardUnit', adopted.standardUnit);
            form.setValue('frequency', adopted.frequency);
        }
    } else if (adoptionType === 'new' && !isEditMode) {
        form.reset({
            category: form.getValues('category'),
            unit: form.getValues('unit'),
            adoptionType: 'new',
            name: "",
            description: "",
            standard: 100,
            standardUnit: '%',
            frequency: 'Bulanan',
        });
    }
  }, [adoptionType, adoptedIndicatorId, submittedIndicators, form, isEditMode]);
  
  React.useEffect(() => {
    if (!userIsCentral && currentUser?.unit) {
      form.setValue('unit', currentUser.unit);
    }
  }, [userIsCentral, currentUser?.unit, form]);


  function onSubmit(values: z.infer<typeof formSchema>) {
    // Exclude adoption-specific fields from the final data
    const { adoptionType, adoptedIndicatorId, ...submissionData } = values;

    if (isEditMode && indicator.id) {
        updateSubmittedIndicator(indicator.id, submissionData)
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
        const newId = submitIndicator(submissionData as any)
        addLog({
            user: currentUser?.name || "System",
            action: 'ADD_SUBMITTED_INDICATOR',
            details: `Indikator baru "${submissionData.name}" (${newId}) diajukan.`
        })

        toast({
          title: "Pengajuan Berhasil",
          description: `Indikator "${submissionData.name}" telah berhasil diajukan.`,
        })

        if(submissionData.category === 'IMPU') {
            addNotification({ 
                title: 'Pengajuan Indikator Baru (IMPU)',
                description: `Indikator "${submissionData.name}" dari unit ${submissionData.unit} menunggu persetujuan.`,
                link: '/dashboard/indicators',
                recipientRole: 'Sub. Komite Peningkatan Mutu' 
            });
        }
    }
    setOpen(false);
    form.reset();
  }

  const isAdoption = selectedCategory === 'IMPU' && adoptionType === 'adopt';

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            
            <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kategori Indikator</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isEditMode}>
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
            
            {selectedCategory === 'IMPU' && !isEditMode && (
                 <FormField
                    control={form.control}
                    name="adoptionType"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                        <FormLabel>Jenis Pengajuan IMPU</FormLabel>
                        <FormControl>
                            <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex space-x-4"
                            >
                            <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="new" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                Buat Baru
                                </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="adopt" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                Adopsi dari Indikator yang Ada
                                </FormLabel>
                            </FormItem>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            )}
            
            {isAdoption && (
                 <FormField
                    control={form.control}
                    name="adoptedIndicatorId"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Pilih Indikator untuk Diadopsi</FormLabel>
                           <Combobox
                                options={adoptableIndicators}
                                placeholder="Pilih indikator..."
                                searchPlaceholder="Cari indikator..."
                                value={field.value}
                                onSelect={(value) => form.setValue('adoptedIndicatorId', value)}
                            />
                          <FormMessage />
                        </FormItem>
                    )}
                />
            )}

             <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Nama Indikator</FormLabel>
                    <FormControl>
                        <Input placeholder="Contoh: Kepatuhan Penggunaan APD" {...field} disabled={isAdoption} />
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
                                disabled={!userIsCentral}
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
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isAdoption}>
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
                    disabled={isAdoption}
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
                                <Input type="number" placeholder="Contoh: 100" {...field} disabled={isAdoption} />
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
                             <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isAdoption}>
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

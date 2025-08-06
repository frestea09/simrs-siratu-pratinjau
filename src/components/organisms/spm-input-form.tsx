
"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

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
import { Textarea } from "@/components/ui/textarea"
import { DialogFooter } from "../ui/dialog"
import { SpmIndicator, useSpmStore } from "@/store/spm-store"
import { useToast } from "@/hooks/use-toast"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Calendar } from "../ui/calendar"
import { cn } from "@/lib/utils"
import { HOSPITAL_UNITS } from "@/lib/constants"
import { useUserStore } from "@/store/user-store"
import { useLogStore } from "@/store/log-store"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"

const formSchema = z.object({
  serviceType: z.string({required_error: "Jenis pelayanan harus diisi"}).min(1, "Jenis pelayanan harus diisi"),
  indicator: z.string().min(5, "Nama indikator harus diisi"),
  reportingDate: z.date({
    required_error: "Tanggal pelaporan harus diisi.",
  }),
  target: z.string().min(1, "Target harus diisi"),
  achievement: z.string().min(1, "Capaian harus diisi"),
  notes: z.string().optional(),
})

type SpmInputFormProps = {
    setOpen: (open: boolean) => void;
    spmIndicator?: SpmIndicator;
}

const unitOptions = HOSPITAL_UNITS.map(unit => ({ value: unit, label: unit }));

export function SpmInputForm({ setOpen, spmIndicator }: SpmInputFormProps) {
  const { toast } = useToast()
  const { addSpmIndicator, updateSpmIndicator } = useSpmStore()
  const { currentUser } = useUserStore()
  const { addLog } = useLogStore()
  const isEditMode = !!spmIndicator;
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: isEditMode ? {
        ...spmIndicator,
        reportingDate: new Date(spmIndicator.reportingDate),
    } : {
      serviceType: "",
      indicator: "",
      target: "",
      achievement: "",
      notes: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    const dataToSave = { ...values, reportingDate: values.reportingDate.toISOString() };

    if (isEditMode && spmIndicator.id) {
        updateSpmIndicator(spmIndicator.id, dataToSave);
        addLog({
            user: currentUser?.name || 'System',
            action: 'UPDATE_SPM',
            details: `Data SPM "${values.indicator}" (${spmIndicator.id}) diperbarui.`,
        });
        toast({
          title: "Data SPM Diperbarui",
          description: `Data untuk indikator "${values.indicator}" telah berhasil diperbarui.`,
        })
    } else {
        const newId = addSpmIndicator(dataToSave)
        addLog({
            user: currentUser?.name || 'System',
            action: 'ADD_SPM',
            details: `Data SPM baru "${values.indicator}" (${newId}) ditambahkan.`,
        });
        toast({
          title: "Data SPM Disimpan",
          description: `Data untuk indikator "${values.indicator}" telah berhasil ditambahkan.`,
        })
    }
    setOpen(false)
    form.reset()
  }

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="serviceType"
                    render={({ field }) => (
                         <FormItem>
                            <FormLabel>Jenis Pelayanan / Unit</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih unit" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {unitOptions.map((unit) => (
                                        <SelectItem key={unit.value} value={unit.value}>{unit.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="indicator"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Indikator</FormLabel>
                        <FormControl>
                            <Input placeholder="Contoh: Kemampuan menangani life saving" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="reportingDate"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Periode Laporan</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                <FormControl>
                                    <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                    )}
                                    >
                                    {field.value ? (
                                        format(field.value, "PPP")
                                    ) : (
                                        <span>Pilih tanggal</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) =>
                                    date > new Date() || date < new Date("1900-01-01")
                                    }
                                    initialFocus
                                />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                 <FormField
                    control={form.control}
                    name="target"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Target</FormLabel>
                        <FormControl>
                            <Input placeholder="Contoh: 100%" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="achievement"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Capaian</FormLabel>
                        <FormControl>
                            <Input placeholder="Contoh: 100%" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Keterangan / Catatan (Opsional)</FormLabel>
                <FormControl>
                    <Textarea
                    placeholder="Isi jika capaian tidak sesuai target atau ada informasi tambahan."
                    {...field}
                    />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <DialogFooter className="pt-4">
                <Button type="submit">{isEditMode ? 'Simpan Perubahan' : 'Simpan Data'}</Button>
            </DialogFooter>
        </form>
    </Form>
  )
}

"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DialogFooter } from "../ui/dialog"
import { Risk, RiskCategory, RiskSource, useRiskStore } from "@/store/risk-store"
import { useToast } from "@/hooks/use-toast"
import { useUserStore } from "@/store/user-store.tsx"
import { useLogStore } from "@/store/log-store.tsx"
import { HOSPITAL_UNITS } from "@/lib/constants"
import { Combobox } from "../ui/combobox"

const sourceOptions: { value: RiskSource, label: string }[] = [
    { value: "Laporan Insiden", label: "1. Laporan Insiden" },
    { value: "Komplain", label: "2. Komplain" },
    { value: "Survey/Ronde", label: "3. Survey/Ronde" },
    { value: "Rapat/Brainstorming", label: "4. Rapat/Brainstorming" },
    { value: "Investigasi", label: "5. Investigasi" },
    { value: "Litigasi", label: "6. Litigasi" },
    { value: "External Requirement", label: "7. External Requirement" },
];
const categoryOptions: { value: RiskCategory, label: string }[] = [
    { value: "Klinis", label: "Klinis" },
    { value: "Non-Klinis", label: "Non-Klinis" },
    { value: "Operasional", label: "Operasional" },
    { value: "Finansial", label: "Finansial" },
    { value: "Reputasi", label: "Reputasi" },
];
const unitOptions = HOSPITAL_UNITS.map(u => ({ value: u, label: u }));


const formSchema = z.object({
  unit: z.string().min(1, "Unit kerja harus dipilih."),
  source: z.enum(["Laporan Insiden", "Komplain", "Survey/Ronde", "Rapat/Brainstorming", "Investigasi", "Litigasi", "External Requirement"], {
    required_error: "Sumber risiko harus dipilih."
  }),
  description: z.string().min(10, "Deskripsi risiko harus diisi (minimal 10 karakter)."),
  cause: z.string().min(10, "Penyebab (akar masalah) harus diisi (minimal 10 karakter)."),
  category: z.enum(["Klinis", "Non-Klinis", "Operasional", "Finansial", "Reputasi"], {
    required_error: "Kategori risiko harus dipilih."
  }),
});


type RiskFormProps = {
    setOpen: (open: boolean) => void;
    riskToEdit?: Risk;
}

export function RiskForm({ setOpen, riskToEdit }: RiskFormProps) {
    const { toast } = useToast()
    const { addRisk, updateRisk } = useRiskStore()
    const { currentUser } = useUserStore()
    // const { addLog } = useLogStore()
    const isEditMode = !!riskToEdit;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: riskToEdit ? riskToEdit : {
            unit: currentUser?.unit,
            description: "",
            cause: ""
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        if (isEditMode && riskToEdit) {
            updateRisk(riskToEdit.id, values);
            toast({ title: "Risiko Diperbarui", description: "Data risiko telah berhasil diperbarui." });
        } else {
            addRisk(values);
            toast({ title: "Risiko Baru Ditambahkan", description: "Risiko baru telah berhasil diidentifikasi dan ditambahkan ke register." });
        }
        setOpen(false)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">

                <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nama Unit Kerja</FormLabel>
                             <Combobox
                                options={unitOptions}
                                placeholder="Pilih unit..."
                                searchPlaceholder="Cari unit..."
                                onSelect={(value) => form.setValue('unit', value)}
                                value={field.value}
                            />
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="source"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Sumber Risiko</FormLabel>
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih sumber risiko" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {sourceOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Deskripsi Risiko/Kejadian</FormLabel>
                        <FormControl>
                            <Textarea placeholder="Jelaskan risiko potensial atau aktual yang terjadi" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                 <FormField
                    control={form.control}
                    name="cause"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Penyebab (Akar Masalah)</FormLabel>
                        <FormControl>
                            <Textarea placeholder="Jelaskan penyebab utama dari risiko/kejadian ini" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                 <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Kategori Risiko</FormLabel>
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih kategori yang sesuai dengan akar masalah" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {categoryOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <DialogFooter className="pt-4">
                    <Button type="submit">{isEditMode ? 'Simpan Perubahan' : 'Simpan Risiko'}</Button>
                </DialogFooter>
            </form>
        </Form>
    )
}


"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DialogFooter } from "../ui/dialog"
import { Risk, RiskCategory, RiskSource, useRiskStore, RiskEvaluation, RiskStatus } from "@/store/risk-store"
import { useToast } from "@/hooks/use-toast"
import { useUserStore } from "@/store/user-store.tsx"
import { useLogStore } from "@/store/log-store.tsx"
import { HOSPITAL_UNITS } from "@/lib/constants"
import { Combobox } from "../ui/combobox"
import { Slider } from "../ui/slider"
import { Separator } from "../ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Calendar } from "../ui/calendar"
import { cn } from "@/lib/utils"
import { Input } from "../ui/input"

const sourceOptions: { value: RiskSource, label: string }[] = [
    { value: "Laporan Insiden", label: "Laporan Insiden" },
    { value: "Komplain", label: "Komplain" },
    { value: "Survey/Ronde", label: "Survey/Ronde" },
    { value: "Rapat/Brainstorming", label: "Rapat/Brainstorming" },
    { value: "Investigasi", label: "Investigasi" },
    { value: "Litigasi", label: "Litigasi" },
    { value: "External Requirement", label: "External Requirement" },
];
const categoryOptions: { value: RiskCategory, label: string }[] = [
    { value: "Strategis", label: "Strategis" },
    { value: "Operasional", label: "Operasional" },
    { value: "Finansial", label: "Finansial" },
    { value: "Compliance", label: "Compliance" },
    { value: "Reputasi", label: "Reputasi" },
    { value: "Pelayanan Pasien", label: "Pelayanan Pasien" },
    { value: "Bahaya Fisik", label: "Bahaya Fisik" },
    { value: "Bahaya Kimia", label: "Bahaya Kimia" },
    { value: "Bahaya Biologi", label: "Bahaya Biologi" },
    { value: "Bahaya Ergonomi", label: "Bahaya Ergonomi" },
    { value: "Bahaya Psikososial", label: "Bahaya Psikososial" },
];
const unitOptions = HOSPITAL_UNITS.map(u => ({ value: u, label: u }));
const evaluationOptions: { value: RiskEvaluation, label: string }[] = [
    { value: "Mitigasi", label: "Mitigasi" },
    { value: "Transfer", label: "Transfer" },
    { value: "Diterima", label: "Diterima" },
    { value: "Dihindari", label: "Dihindari" },
];
const statusOptions: { value: RiskStatus, label: string }[] = [
    { value: "Open", label: "Open" },
    { value: "In Progress", label: "In Progress" },
    { value: "Closed", label: "Closed" },
];


const formSchema = z.object({
  unit: z.string().min(1, "Unit kerja harus dipilih."),
  source: z.enum(["Laporan Insiden", "Komplain", "Survey/Ronde", "Rapat/Brainstorming", "Investigasi", "Litigasi", "External Requirement"], {
    required_error: "Sumber risiko harus dipilih."
  }),
  description: z.string().min(10, "Deskripsi risiko harus diisi (minimal 10 karakter)."),
  cause: z.string().min(10, "Penyebab (akar masalah) harus diisi (minimal 10 karakter)."),
  category: z.enum(["Strategis", "Operasional", "Finansial", "Compliance", "Reputasi", "Pelayanan Pasien", "Bahaya Fisik", "Bahaya Kimia", "Bahaya Biologi", "Bahaya Ergonomi", "Bahaya Psikososial"], {
    required_error: "Kategori risiko harus dipilih."
  }),
  consequence: z.number().min(1).max(5),
  likelihood: z.number().min(1).max(5),
  controllability: z.number().min(1).max(5),
  evaluation: z.enum(["Mitigasi", "Transfer", "Diterima", "Dihindari"], {
    required_error: "Evaluasi risiko harus dipilih."
  }),
  actionPlan: z.string().min(10, "Rencana aksi harus diisi (minimal 10 karakter)."),
  dueDate: z.date().optional(),
  pic: z.string().optional(),
  status: z.enum(["Open", "In Progress", "Closed"]).optional(),
  residualConsequence: z.number().min(0).max(5).optional(),
  residualLikelihood: z.number().min(0).max(5).optional(),
  reportNotes: z.string().optional(),
}).refine(data => {
    // If one residual field is filled, the other must be too, or both can be empty.
    if ((data.residualConsequence && !data.residualLikelihood) || (!data.residualConsequence && data.residualLikelihood)) {
        return false;
    }
    return true;
}, {
    message: "Dampak dan Kemungkinan Sisa harus diisi bersamaan atau dikosongkan bersamaan.",
    path: ["residualConsequence"],
});


type RiskFormProps = {
    setOpen: (open: boolean) => void;
    riskToEdit?: Risk;
}

const ratingLabels = ["Sangat Rendah", "Rendah", "Sedang", "Tinggi", "Sangat Tinggi"];
const controllabilityLabels = ["Sangat Sulit", "Sulit", "Sedang", "Mudah", "Sangat Mudah"];


export function RiskForm({ setOpen, riskToEdit }: RiskFormProps) {
    const { toast } = useToast()
    const { addRisk, updateRisk } = useRiskStore()
    const { currentUser, users } = useUserStore()
    const isEditMode = !!riskToEdit;

    const userOptions = React.useMemo(() => users.map(u => ({ value: u.name, label: `${u.name} (${u.role})`})), [users]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: riskToEdit ? {
            ...riskToEdit,
            dueDate: riskToEdit.dueDate ? new Date(riskToEdit.dueDate) : undefined,
            residualConsequence: riskToEdit.residualConsequence || 0,
            residualLikelihood: riskToEdit.residualLikelihood || 0,
        } : {
            unit: currentUser?.unit,
            description: "",
            cause: "",
            actionPlan: "",
            consequence: 3,
            likelihood: 3,
            controllability: 3,
            evaluation: "Mitigasi",
            status: "Open",
            residualConsequence: 0,
            residualLikelihood: 0,
        },
    })
    
    const consequenceValue = form.watch("consequence");
    const likelihoodValue = form.watch("likelihood");
    const controllabilityValue = form.watch("controllability");
    const residualConsequenceValue = form.watch("residualConsequence");
    const residualLikelihoodValue = form.watch("residualLikelihood");

    function onSubmit(values: z.infer<typeof formSchema>) {
        const dataToSave = {
            ...values,
            dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
            residualConsequence: values.residualConsequence === 0 ? undefined : values.residualConsequence,
            residualLikelihood: values.residualLikelihood === 0 ? undefined : values.residualLikelihood,
        }

        if (isEditMode && riskToEdit) {
            updateRisk(riskToEdit.id, dataToSave);
            toast({ title: "Risiko Diperbarui", description: "Data risiko telah berhasil diperbarui." });
        } else {
            addRisk(dataToSave as any);
            toast({ title: "Risiko Baru Ditambahkan", description: "Risiko baru telah berhasil diidentifikasi dan ditambahkan ke register." });
        }
        setOpen(false)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
                
                <h3 className="text-lg font-semibold text-primary">Identifikasi Risiko</h3>
                <div className="space-y-4 pl-2 border-l-2 border-primary/20">
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
                </div>
                
                <Separator />
                
                <h3 className="text-lg font-semibold text-primary">Analisis Risiko</h3>
                <div className="space-y-4 pl-2 border-l-2 border-primary/20">
                    <FormField
                        control={form.control}
                        name="consequence"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Dampak / Konsekuensi (Consequence)</FormLabel>
                                <div className="flex items-center gap-4">
                                    <FormControl>
                                        <Slider
                                            min={1} max={5} step={1}
                                            defaultValue={[field.value]}
                                            onValueChange={(value) => field.onChange(value[0])}
                                            className="flex-1"
                                        />
                                    </FormControl>
                                    <div className="w-40 text-center font-semibold text-primary">
                                        {consequenceValue} - {ratingLabels[consequenceValue - 1]}
                                    </div>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="likelihood"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Kemungkinan Terjadi (Likelihood)</FormLabel>
                                <div className="flex items-center gap-4">
                                    <FormControl>
                                        <Slider
                                            min={1} max={5} step={1}
                                            defaultValue={[field.value]}
                                            onValueChange={(value) => field.onChange(value[0])}
                                            className="flex-1"
                                        />
                                    </FormControl>
                                    <div className="w-40 text-center font-semibold text-primary">
                                        {likelihoodValue} - {ratingLabels[likelihoodValue - 1]}
                                    </div>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="controllability"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tingkat Kendali (Controllability)</FormLabel>
                                <div className="flex items-center gap-4">
                                    <FormControl>
                                        <Slider
                                            min={1} max={5} step={1}
                                            defaultValue={[field.value]}
                                            onValueChange={(value) => field.onChange(value[0])}
                                            className="flex-1"
                                        />
                                    </FormControl>
                                    <div className="w-40 text-center font-semibold text-primary">
                                        {controllabilityValue} - {controllabilityLabels[controllabilityValue - 1]}
                                    </div>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Separator />
                
                <h3 className="text-lg font-semibold text-primary">Evaluasi & Tindak Lanjut</h3>
                <div className="space-y-4 pl-2 border-l-2 border-primary/20">
                    <FormField
                        control={form.control}
                        name="evaluation"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Evaluasi Risiko</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih jenis evaluasi/perlakuan risiko" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {evaluationOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                                    </SelectContent>
                                </Select>
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

                    <FormField
                        control={form.control}
                        name="actionPlan"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Rencana Aksi & Tindak Lanjut</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Jelaskan langkah-langkah yang akan diambil untuk menangani risiko ini..." {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="pic"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Penanggung Jawab (PIC)</FormLabel>
                                    <Combobox
                                        options={userOptions}
                                        placeholder="Pilih PIC"
                                        searchPlaceholder="Cari nama pengguna..."
                                        onSelect={(value) => form.setValue('pic', value)}
                                        value={field.value}
                                    />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="dueDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Batas Waktu (Due Date)</FormLabel>
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
                                            initialFocus
                                        />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {isEditMode && (
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status Penyelesaian</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih status" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {statusOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                </div>
                
                <Separator />
                <h3 className="text-lg font-semibold text-primary">Penilaian Risiko Sisa (Opsional)</h3>
                <div className="space-y-4 pl-2 border-l-2 border-primary/20">
                    <p className="text-sm text-muted-foreground -mt-2">Isi bagian ini setelah rencana aksi diimplementasikan untuk menilai risiko yang tersisa.</p>
                    
                    <FormField
                        control={form.control}
                        name="residualConsequence"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Dampak Sisa (Residual Consequence)</FormLabel>
                                <div className="flex items-center gap-4">
                                    <FormControl>
                                        <Slider
                                            min={0} max={5} step={1}
                                            defaultValue={[field.value || 0]}
                                            onValueChange={(value) => field.onChange(value[0])}
                                            className="flex-1"
                                        />
                                    </FormControl>
                                    <div className="w-40 text-center font-semibold text-primary">
                                        {residualConsequenceValue ? `${residualConsequenceValue} - ${ratingLabels[residualConsequenceValue - 1]}`: "N/A"}
                                    </div>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="residualLikelihood"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Kemungkinan Sisa (Residual Likelihood)</FormLabel>
                                <div className="flex items-center gap-4">
                                    <FormControl>
                                        <Slider
                                            min={0} max={5} step={1}
                                            defaultValue={[field.value || 0]}
                                            onValueChange={(value) => field.onChange(value[0])}
                                            className="flex-1"
                                        />
                                    </FormControl>
                                    <div className="w-40 text-center font-semibold text-primary">
                                        {residualLikelihoodValue ? `${residualLikelihoodValue} - ${ratingLabels[residualLikelihoodValue - 1]}`: "N/A"}
                                    </div>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="reportNotes"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Laporan Singkat / Monev</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Isi laporan singkat atau hasil monitoring dan evaluasi di sini" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>


                <DialogFooter className="pt-4">
                    <Button type="submit">{isEditMode ? 'Simpan Perubahan' : 'Simpan Risiko'}</Button>
                </DialogFooter>
            </form>
        </Form>
    )
}


"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Check, ChevronsUpDown } from "lucide-react"

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
import { SubmittedIndicator, useIndicatorStore } from "@/store/indicator-store"
import { useToast } from "@/hooks/use-toast"
import { HOSPITAL_UNITS } from "@/lib/constants"
import { useUserStore } from "@/store/user-store"
import { useLogStore } from "@/store/log-store"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command"
import { cn } from "@/lib/utils"

const formSchema = z.object({
  name: z.string().min(5, {
    message: "Nama indikator harus memiliki setidaknya 5 karakter.",
  }),
  unit: z.string({ required_error: "Anda harus memilih unit." }),
  frequency: z.enum(['Harian', 'Mingguan', 'Bulanan', '6 Bulanan'], {
    required_error: "Anda harus memilih frekuensi pelaporan.",
  }),
  description: z.string().min(10, {
    message: "Deskripsi harus memiliki setidaknya 10 karakter.",
  }),
})

type IndicatorSubmissionFormProps = {
    setOpen: (open: boolean) => void;
    indicator?: SubmittedIndicator;
}

const unitOptions = HOSPITAL_UNITS.map(unit => ({ value: unit, label: unit }));

export function IndicatorSubmissionForm({ setOpen, indicator }: IndicatorSubmissionFormProps) {
  const { toast } = useToast()
  const { submitIndicator, updateSubmittedIndicator } = useIndicatorStore()
  const { currentUser } = useUserStore();
  const { addLog } = useLogStore();
  const isEditMode = !!indicator;
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: isEditMode ? {
        name: indicator.name,
        unit: indicator.unit,
        frequency: indicator.frequency,
        description: indicator.description,
    } : {
      name: "",
      description: "",
    },
  })

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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
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
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className="w-full justify-between"
                            >
                              {field.value
                                ? unitOptions.find(
                                    (unit) => unit.value === field.value
                                  )?.label
                                : "Pilih unit"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                          <Command>
                            <CommandInput placeholder="Cari unit..." />
                             <CommandList>
                                <CommandEmpty>Unit tidak ditemukan.</CommandEmpty>
                                <CommandGroup>
                                  {unitOptions.map((unit) => (
                                    <CommandItem
                                      value={unit.label}
                                      key={unit.value}
                                      onSelect={() => {
                                        form.setValue("unit", unit.value)
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          unit.value === field.value
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {unit.label}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
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
            <DialogFooter className="pt-4">
                <Button type="submit">{isEditMode ? 'Simpan Perubahan' : 'Ajukan Indikator'}</Button>
            </DialogFooter>
        </form>
    </Form>
  )
}

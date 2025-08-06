
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
import { Textarea } from "@/components/ui/textarea"
import { DialogFooter } from "../ui/dialog"
import { useSpmStore } from "@/store/spm-store"
import { useToast } from "@/hooks/use-toast"

const formSchema = z.object({
  serviceType: z.string().min(3, "Jenis pelayanan harus diisi"),
  indicator: z.string().min(5, "Nama indikator harus diisi"),
  target: z.string().min(1, "Target harus diisi"),
  achievement: z.string().min(1, "Capaian harus diisi"),
  notes: z.string().optional(),
})

type SpmInputFormProps = {
    setOpen: (open: boolean) => void;
}

export function SpmInputForm({ setOpen }: SpmInputFormProps) {
  const { toast } = useToast()
  const { addSpmIndicator } = useSpmStore()
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      serviceType: "",
      indicator: "",
      target: "",
      achievement: "",
      notes: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    addSpmIndicator(values)
    toast({
      title: "Data SPM Disimpan",
      description: `Data untuk indikator "${values.indicator}" telah berhasil ditambahkan.`,
    })
    setOpen(false)
    form.reset()
  }

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="serviceType"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Jenis Pelayanan</FormLabel>
                        <FormControl>
                            <Input placeholder="Contoh: Pelayanan Gawat Darurat" {...field} />
                        </FormControl>
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
            <DialogFooter>
                <Button type="submit">Simpan Data</Button>
            </DialogFooter>
        </form>
    </Form>
  )
}

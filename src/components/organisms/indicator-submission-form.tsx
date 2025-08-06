
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
import { useIndicatorStore } from "@/store/indicator-store"
import { useToast } from "@/hooks/use-toast"

const formSchema = z.object({
  name: z.string().min(5, {
    message: "Nama indikator harus memiliki setidaknya 5 karakter.",
  }),
  frequency: z.enum(['Harian', 'Mingguan', 'Bulanan', '6 Bulanan'], {
    required_error: "Anda harus memilih frekuensi pelaporan.",
  }),
  description: z.string().min(10, {
    message: "Deskripsi harus memiliki setidaknya 10 karakter.",
  }),
})

type IndicatorSubmissionFormProps = {
    setOpen: (open: boolean) => void;
}

export function IndicatorSubmissionForm({ setOpen }: IndicatorSubmissionFormProps) {
  const { toast } = useToast()
  const { submitIndicator } = useIndicatorStore()
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    submitIndicator(values as any)
    toast({
      title: "Pengajuan Berhasil",
      description: `Indikator "${values.name}" telah berhasil diajukan.`,
    })
    setOpen(false)
    form.reset()
  }

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
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
            <DialogFooter>
                <Button type="submit">Ajukan Indikator</Button>
            </DialogFooter>
        </form>
    </Form>
  )
}

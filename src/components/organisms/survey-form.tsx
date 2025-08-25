"use client"

import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useSurveyStore } from "@/store/survey-store"
import { useToast } from "@/hooks/use-toast"

const formSchema = z.object({
  unit: z.string().min(1, "Wajib diisi"),
  workDuration: z.string().min(1, "Wajib diisi"),
  incidentsReported: z.string().min(1, "Wajib diisi"),
  safetyRating: z.string().min(1, "Wajib diisi"),
  comments: z.string().optional(),
})

export function SurveyForm() {
  const { addResponse } = useSurveyStore()
  const { toast } = useToast()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unit: "",
      workDuration: "",
      incidentsReported: "",
      safetyRating: "",
      comments: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    addResponse(values)
    toast({ description: "Terima kasih atas partisipasi Anda." })
    form.reset()
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 text-lg"
      >
        <FormField
          control={form.control}
          name="unit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Area / Unit Anda Bekerja</FormLabel>
              <FormControl>
                <Input {...field} className="text-lg" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="workDuration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Sudah berapa lama Anda bekerja di rumah sakit ini?
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="text-lg">
                    <SelectValue placeholder="Pilih lama bekerja" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="<1">Kurang dari 1 tahun</SelectItem>
                  <SelectItem value="1-5">1 sampai 5 tahun</SelectItem>
                  <SelectItem value="6-10">6 sampai 10 tahun</SelectItem>
                  <SelectItem value=">10">Lebih dari 10 tahun</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="incidentsReported"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Jumlah insiden yang Anda laporkan dalam 12 bulan terakhir?
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="text-lg">
                    <SelectValue placeholder="Pilih jumlah laporan" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="0">Tidak ada laporan</SelectItem>
                  <SelectItem value="1-2">1 sampai 2 laporan</SelectItem>
                  <SelectItem value="3-5">3 sampai 5 laporan</SelectItem>
                  <SelectItem value=">5">Lebih dari 5 laporan</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="safetyRating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Penilaian keselamatan pasien di unit Anda</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="text-lg">
                    <SelectValue placeholder="Pilih penilaian" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Sangat Baik">Sangat Baik</SelectItem>
                  <SelectItem value="Baik">Baik</SelectItem>
                  <SelectItem value="Cukup">Cukup</SelectItem>
                  <SelectItem value="Kurang">Kurang</SelectItem>
                  <SelectItem value="Buruk">Buruk</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="comments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Komentar Anda</FormLabel>
              <FormControl>
                <Textarea {...field} rows={4} className="text-lg" />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" className="text-lg">
          Kirim
        </Button>
      </form>
    </Form>
  )
}

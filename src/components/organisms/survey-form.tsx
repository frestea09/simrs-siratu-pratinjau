"use client"

import { useState } from "react"
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
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

const likertOptions = [
  "Sangat Setuju",
  "Setuju",
  "Netral",
  "Tidak Setuju",
  "Sangat Tidak Setuju",
]

const formSchema = z.object({
  name: z.string().min(1, "Wajib diisi"),
  gender: z.string().min(1, "Wajib diisi"),
  education: z.string().min(1, "Wajib diisi"),
  profession: z.string().min(1, "Wajib diisi"),
  unit: z.string().min(1, "Wajib diisi"),
  workDuration: z.string().min(1, "Wajib diisi"),
  unitDuration: z.string().min(1, "Wajib diisi"),
  weeklyHours: z.string().min(1, "Wajib diisi"),
  directPatientContact: z.string().min(1, "Wajib diisi"),
  managerPraise: z.string().min(1, "Wajib diisi"),
  managerSuggestions: z.string().min(1, "Wajib diisi"),
  managerPressure: z.string().min(1, "Wajib diisi"),
  managerIgnore: z.string().min(1, "Wajib diisi"),
  managerAware: z.string().min(1, "Wajib diisi"),
  incidentsReported: z.string().min(1, "Wajib diisi"),
  safetyRating: z.string().min(1, "Wajib diisi"),
  comments: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export function SurveyForm({ onSuccess }: { onSuccess?: () => void }) {
  const { addResponse } = useSurveyStore()
  const { toast } = useToast()
  const [step, setStep] = useState(0)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      gender: "",
      education: "",
      profession: "",
      unit: "",
      workDuration: "",
      unitDuration: "",
      weeklyHours: "",
      directPatientContact: "",
      managerPraise: "",
      managerSuggestions: "",
      managerPressure: "",
      managerIgnore: "",
      managerAware: "",
      incidentsReported: "",
      safetyRating: "",
      comments: "",
    },
  })

  const steps: (keyof FormValues)[][] = [
    ["name", "gender", "education", "profession"],
    [
      "unit",
      "unitDuration",
      "workDuration",
      "weeklyHours",
      "directPatientContact",
    ],
    [
      "managerPraise",
      "managerSuggestions",
      "managerPressure",
      "managerIgnore",
      "managerAware",
    ],
    ["incidentsReported", "safetyRating", "comments"],
  ]

  function next() {
    const fields = steps[step]
    form.trigger(fields).then((valid) => {
      if (valid) setStep((s) => s + 1)
    })
  }

  function prev() {
    setStep((s) => s - 1)
  }

  function onSubmit(values: FormValues) {
    addResponse(values)
    toast({ description: "Terima kasih atas partisipasi Anda." })
    form.reset()
    setStep(0)
    onSuccess?.()
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 text-lg"
      >
        {step === 0 && (
          <>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama</FormLabel>
                  <FormControl>
                    <Input {...field} className="text-lg" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jenis Kelamin</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="text-lg">
                        <SelectValue placeholder="Pilih jenis kelamin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                      <SelectItem value="Perempuan">Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="education"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pendidikan Terakhir</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="text-lg">
                        <SelectValue placeholder="Pilih pendidikan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="SMP">SMP</SelectItem>
                      <SelectItem value="SMA/SMK">SMA/SMK</SelectItem>
                      <SelectItem value="D3">D3</SelectItem>
                      <SelectItem value="S1">S1</SelectItem>
                      <SelectItem value="S2">S2</SelectItem>
                      <SelectItem value="S3">S3</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="profession"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profesi</FormLabel>
                  <Input {...field} className="text-lg" />
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {step === 1 && (
          <>
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
              name="unitDuration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Sudah berapa lama Anda bekerja di area/unit kerja sekarang?
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
              name="weeklyHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Berapa jam per minggu Anda bekerja di rumah sakit ini?
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="text-lg">
                        <SelectValue placeholder="Pilih jam kerja" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="<20">Kurang dari 20 jam</SelectItem>
                      <SelectItem value="20-39">20 sampai 39 jam</SelectItem>
                      <SelectItem value="40-59">40 sampai 59 jam</SelectItem>
                      <SelectItem value=">60">60 jam atau lebih</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="directPatientContact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Apakah posisi Anda berinteraksi langsung dengan pasien?
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="text-lg">
                        <SelectValue placeholder="Pilih jawaban" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Ya">Ya</SelectItem>
                      <SelectItem value="Tidak">Tidak</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {step === 2 && (
          <>
            <FormField
              control={form.control}
              name="managerPraise"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Manajer saya memberikan pujian jika melihat pekerjaan
                    diselesaikan sesuai prosedur keselamatan pasien.
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="grid gap-2"
                    >
                      {likertOptions.map((opt) => (
                        <div
                          className="flex items-center space-x-2 text-lg"
                          key={opt}
                        >
                          <RadioGroupItem value={opt} id={`praise-${opt}`} />
                          <Label htmlFor={`praise-${opt}`}>{opt}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="managerSuggestions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Manajer saya serius mempertimbangkan saran dari staf
                    untuk meningkatkan keselamatan pasien.
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="grid gap-2"
                    >
                      {likertOptions.map((opt) => (
                        <div
                          className="flex items-center space-x-2 text-lg"
                          key={opt}
                        >
                          <RadioGroupItem value={opt} id={`suggest-${opt}`} />
                          <Label htmlFor={`suggest-${opt}`}>{opt}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="managerPressure"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Ketika tekanan pekerjaan meningkat, manajer saya
                    menginginkan kami bekerja lebih cepat meski harus
                    mengambil jalan pintas.
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="grid gap-2"
                    >
                      {likertOptions.map((opt) => (
                        <div
                          className="flex items-center space-x-2 text-lg"
                          key={opt}
                        >
                          <RadioGroupItem value={opt} id={`pressure-${opt}`} />
                          <Label htmlFor={`pressure-${opt}`}>{opt}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="managerIgnore"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Manajer saya mengabaikan masalah keselamatan pasien yang
                    terjadi berulang.
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="grid gap-2"
                    >
                      {likertOptions.map((opt) => (
                        <div
                          className="flex items-center space-x-2 text-lg"
                          key={opt}
                        >
                          <RadioGroupItem value={opt} id={`ignore-${opt}`} />
                          <Label htmlFor={`ignore-${opt}`}>{opt}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="managerAware"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Manajer saya sangat mengetahui masalah keselamatan pasien
                    di unit saya.
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="grid gap-2"
                    >
                      {likertOptions.map((opt) => (
                        <div
                          className="flex items-center space-x-2 text-lg"
                          key={opt}
                        >
                          <RadioGroupItem value={opt} id={`aware-${opt}`} />
                          <Label htmlFor={`aware-${opt}`}>{opt}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {step === 3 && (
          <>
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
                  <FormLabel>
                    Penilaian keselamatan pasien di unit Anda
                  </FormLabel>
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
          </>
        )}

        <div className="flex justify-between pt-4">
          {step > 0 && (
            <Button type="button" onClick={prev} className="text-lg">
              Kembali
            </Button>
          )}
          {step < steps.length - 1 && (
            <Button type="button" onClick={next} className="ml-auto text-lg">
              Lanjut
            </Button>
          )}
          {step === steps.length - 1 && (
            <Button type="submit" className="ml-auto text-lg">
              Kirim
            </Button>
          )}
        </div>
      </form>
    </Form>
  )
}

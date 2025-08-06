"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CalendarIcon, PlusCircle } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Separator } from "../ui/separator"

export function IncidentReportDialog() {
  const [date, setDate] = React.useState<Date>()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Laporkan Insiden Baru
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Laporan Insiden Keselamatan Pasien</DialogTitle>
          <DialogDescription>
            Lengkapi semua data yang diperlukan. Klik simpan jika sudah selesai.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto px-2">
          
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-primary">Data Pasien</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nama</Label>
                <Input id="name" placeholder="Masukkan nama pasien" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="no-cm">No CM</Label>
                <Input id="no-cm" placeholder="Masukkan nomor rekam medis" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ruangan">Ruangan</Label>
                <Input id="ruangan" placeholder="Masukkan ruangan perawatan" />
              </div>
            </div>
            
            <div className="grid gap-3">
              <Label>Umur</Label>
              <RadioGroup defaultValue=">65 tahun" className="flex flex-wrap gap-x-6 gap-y-2">
                <div className="flex items-center space-x-2"><RadioGroupItem value="0-1 bulan" id="r1" /><Label htmlFor="r1">0-1 bulan</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value=">1 bulan-1 tahun" id="r2" /><Label htmlFor="r2">&gt;1 bln - 1 thn</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value=">1 tahun-5 tahun" id="r3" /><Label htmlFor="r3">&gt;1 thn - 5 thn</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value=">5 tahun-15 tahun" id="r4" /><Label htmlFor="r4">&gt;5 thn - 15 thn</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value=">15 tahun-30 tahun" id="r5" /><Label htmlFor="r5">&gt;15 thn - 30 thn</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value=">30 tahun-65 tahun" id="r6" /><Label htmlFor="r6">&gt;30 thn - 65 thn</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value=">65 tahun" id="r7" /><Label htmlFor="r7">&gt;65 tahun</Label></div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="grid gap-3">
                <Label>Jenis Kelamin</Label>
                <RadioGroup defaultValue="Perempuan" className="flex space-x-4">
                  <div className="flex items-center space-x-2"><RadioGroupItem value="Perempuan" id="jk1" /><Label htmlFor="jk1">Perempuan</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="Laki-Laki" id="jk2" /><Label htmlFor="jk2">Laki-Laki</Label></div>
                </RadioGroup>
              </div>
               <div className="grid gap-3">
                <Label>Penanggung Biaya Pasien</Label>
                <RadioGroup defaultValue="Pribadi/UMUM" className="flex flex-wrap gap-x-6 gap-y-2">
                  <div className="flex items-center space-x-2"><RadioGroupItem value="Pribadi/UMUM" id="pb1" /><Label htmlFor="pb1">Pribadi/UMUM</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="BPJS PBI" id="pb2" /><Label htmlFor="pb2">BPJS PBI</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="BPJS NON PBI" id="pb3" /><Label htmlFor="pb3">BPJS NON PBI</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="SKTM" id="pb4" /><Label htmlFor="pb4">SKTM</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="Asuransi Lainnya" id="pb5" /><Label htmlFor="pb5">Asuransi Lainnya</Label></div>
                </RadioGroup>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="tgl-masuk">Tanggal Masuk RS</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button id="tgl-masuk" variant={"outline"} className={cn("justify-start text-left font-normal", !date && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : <span>Pilih tanggal</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                      </PopoverContent>
                    </Popover>
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="jam-masuk">Jam Masuk</Label>
                    <Input id="jam-masuk" type="time" />
                  </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Bagian detail insiden bisa ditambahkan di sini */}

        </div>
        <DialogFooter>
          <Button type="submit" size="lg">Simpan Laporan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

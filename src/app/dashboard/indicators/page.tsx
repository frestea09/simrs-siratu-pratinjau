"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { CalendarIcon, Download } from "lucide-react"
import { format } from "date-fns"
import React from "react"

const indicatorHistory = [
  { indicator: "Kepatuhan Kebersihan Tangan", period: "2023-06", numerator: 980, denominator: 1000, ratio: "98.0%" },
  { indicator: "Ketepatan Identifikasi Pasien", period: "2023-06", numerator: 495, denominator: 500, ratio: "99.0%" },
  { indicator: "Waktu Tunggu Rawat Jalan", period: "2023-06", numerator: 45, denominator: 1, ratio: "45 min" },
  { indicator: "Kepatuhan Kebersihan Tangan", period: "2023-05", numerator: 950, denominator: 1000, ratio: "95.0%" },
];

export default function IndicatorsPage() {
  const [date, setDate] = React.useState<Date>()

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Indikator Mutu</h2>
      </div>
      <Tabs defaultValue="input" className="space-y-4">
        <TabsList>
          <TabsTrigger value="input">Input Data</TabsTrigger>
          <TabsTrigger value="report">Laporan</TabsTrigger>
        </TabsList>
        <TabsContent value="input" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Input Data Indikator Mutu</CardTitle>
              <CardDescription>
                Masukkan data Numerator dan Denominator untuk periode yang dipilih.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="indicator">Nama Indikator</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih indikator" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hand-hygiene">Kepatuhan Kebersihan Tangan</SelectItem>
                      <SelectItem value="patient-id">Ketepatan Identifikasi Pasien</SelectItem>
                      <SelectItem value="wait-time">Waktu Tunggu Rawat Jalan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="period">Periode Laporan</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pilih tanggal</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="numerator">Numerator</Label>
                  <Input id="numerator" type="number" placeholder="Contoh: 980" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="denominator">Denominator</Label>
                  <Input id="denominator" type="number" placeholder="Contoh: 1000" />
                </div>
              </div>
              <Button>Simpan Data</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="report" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Laporan Indikator Mutu</CardTitle>
                  <CardDescription>
                    Riwayat data indikator mutu yang telah diinput.
                  </CardDescription>
                </div>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Unduh Laporan
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Indikator</TableHead>
                    <TableHead>Periode</TableHead>
                    <TableHead className="text-right">Numerator</TableHead>
                    <TableHead className="text-right">Denominator</TableHead>
                    <TableHead className="text-right">Capaian</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {indicatorHistory.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.indicator}</TableCell>
                      <TableCell>{item.period}</TableCell>
                      <TableCell className="text-right">{item.numerator}</TableCell>
                      <TableCell className="text-right">{item.denominator}</TableCell>
                      <TableCell className="text-right font-semibold">{item.ratio}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

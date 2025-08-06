"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { Textarea } from "@/components/ui/textarea"
import { PlusCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const incidentHistory = [
  { id: "IKP-012", date: "2023-06-05", type: "Kejadian Nyaris Cedera (KNC)", severity: "Rendah", status: "Investigasi" },
  { id: "IKP-011", date: "2023-05-20", type: "Kejadian Tidak Diharapkan (KTD)", severity: "Sedang", status: "Selesai" },
  { id: "IKP-010", date: "2023-05-15", type: "Kondisi Potensial Cedera (KPC)", severity: "N/A", status: "Selesai" },
];

export default function IncidentsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Manajemen Insiden Keselamatan</h2>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Laporan Insiden</CardTitle>
              <CardDescription>Daftar insiden keselamatan yang dilaporkan.</CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Laporkan Insiden Baru
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Laporan Insiden Keselamatan</DialogTitle>
                  <DialogDescription>
                    Isi detail insiden yang terjadi. Klik simpan jika sudah selesai.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">Jenis Insiden</Label>
                    <Select>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Pilih jenis" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="knc">Kejadian Nyaris Cedera (KNC)</SelectItem>
                        <SelectItem value="ktd">Kejadian Tidak Diharapkan (KTD)</SelectItem>
                        <SelectItem value="kpc">Kondisi Potensial Cedera (KPC)</SelectItem>
                        <SelectItem value="ktc">Kejadian Tidak Cedera (KTC)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="severity" className="text-right">Tingkat Keparahan</Label>
                    <Select>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Pilih tingkat" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Rendah</SelectItem>
                        <SelectItem value="medium">Sedang</SelectItem>
                        <SelectItem value="high">Tinggi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="description" className="text-right pt-2">Deskripsi</Label>
                    <Textarea id="description" placeholder="Deskripsikan insiden secara singkat" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="action" className="text-right pt-2">Tindakan Diambil</Label>
                    <Textarea id="action" placeholder="Jelaskan tindakan awal yang sudah dilakukan" className="col-span-3" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Simpan Laporan</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Insiden</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Jenis Insiden</TableHead>
                <TableHead>Tingkat</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidentHistory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.id}</TableCell>
                  <TableCell>{item.date}</TableCell>
                  <TableCell>{item.type}</TableCell>
                  <TableCell>
                    <Badge variant={
                      item.severity === "Rendah" ? "secondary" : 
                      item.severity === "Sedang" ? "outline" : "destructive"
                    }>
                      {item.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.status === 'Selesai' ? 'default' : 'secondary'}
                      className={item.status === 'Investigasi' ? 'bg-yellow-500/20 text-yellow-700' : ''}>
                      {item.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

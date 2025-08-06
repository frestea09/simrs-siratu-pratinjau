
"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DialogFooter } from "../ui/dialog"

export function IndicatorSubmissionForm() {
  return (
    <div className="space-y-4 py-4">
        <div className="space-y-2">
            <Label htmlFor="name">Nama Indikator</Label>
            <Input id="name" placeholder="Contoh: Kepatuhan Penggunaan APD" />
        </div>
        <div className="space-y-2">
            <Label htmlFor="frequency">Frekuensi Pelaporan</Label>
            <Select>
                <SelectTrigger>
                    <SelectValue placeholder="Pilih frekuensi" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="harian">Harian</SelectItem>
                    <SelectItem value="mingguan">Mingguan</SelectItem>
                    <SelectItem value="bulanan">Bulanan</SelectItem>
                    <SelectItem value="6-bulanan">6 Bulanan</SelectItem>
                </SelectContent>
            </Select>
        </div>
        <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea id="description" placeholder="Jelaskan tujuan dan cara pengukuran indikator ini." />
        </div>
        <DialogFooter>
            <Button>Ajukan Indikator</Button>
        </DialogFooter>
    </div>
  )
}

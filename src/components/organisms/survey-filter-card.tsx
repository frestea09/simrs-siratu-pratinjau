"use client"

import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { LineChart as LineChartIcon, BarChart as BarChartIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type SurveyFilterCardProps = {
  units: string[]
  selectedUnit: string
  setSelectedUnit: (unit: string) => void
  chartType: "line" | "bar"
  setChartType: (type: "line" | "bar") => void
}

export function SurveyFilterCard({
  units,
  selectedUnit,
  setSelectedUnit,
  chartType,
  setChartType,
}: SurveyFilterCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filter & Tampilan Data</CardTitle>
        <CardDescription>
          Gunakan filter di bawah untuk menampilkan data lebih spesifik.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <Select value={selectedUnit} onValueChange={setSelectedUnit}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Pilih Unit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Unit</SelectItem>
            {units.map((u) => (
              <SelectItem key={u} value={u}>
                {u}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex w-fit items-center rounded-md border p-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setChartType("line")}
            className={cn("h-8 w-8", chartType === "line" && "bg-muted")}
          >
            <LineChartIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setChartType("bar")}
            className={cn("h-8 w-8", chartType === "bar" && "bg-muted")}
          >
            <BarChartIcon className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}


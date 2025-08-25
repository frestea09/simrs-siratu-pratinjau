"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Download } from "lucide-react"

export default function SurveyUserDashboardPage() {
  const [unit, setUnit] = React.useState("all")
  const [range, setRange] = React.useState("7d")

  const data = React.useMemo(() => generateData(range), [range])
  const lineRef = React.useRef<HTMLDivElement>(null)
  const barRef = React.useRef<HTMLDivElement>(null)

  const downloadChart = (
    ref: React.RefObject<HTMLDivElement>,
    filename: string
  ) => {
    const svg = ref.current?.querySelector("svg")
    if (!svg) return
    const serializer = new XMLSerializer()
    const source = serializer.serializeToString(svg)
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <h2 className="text-3xl font-bold tracking-tight">
        Dashboard User Budaya
      </h2>
      <Card>
        <CardHeader>
          <CardTitle>Filter</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 md:flex-row">
          <Select value={unit} onValueChange={setUnit}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Pilih Unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Unit</SelectItem>
              <SelectItem value="a">Unit A</SelectItem>
              <SelectItem value="b">Unit B</SelectItem>
            </SelectContent>
          </Select>
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Rentang Waktu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 Hari</SelectItem>
              <SelectItem value="40d">40 Hari</SelectItem>
              <SelectItem value="1m">1 Bulan</SelectItem>
              <SelectItem value="3m">3 Bulan</SelectItem>
              <SelectItem value="6m">6 Bulan</SelectItem>
              <SelectItem value="1y">1 Tahun</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Tren Pengisian</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadChart(lineRef, "tren-pengisian.svg")}
          >
            <Download className="mr-2 h-4 w-4" /> Unduh
          </Button>
        </CardHeader>
        <CardContent>
          <div ref={lineRef} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#8884d8"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Distribusi Pengisian</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadChart(barRef, "distribusi-pengisian.svg")}
          >
            <Download className="mr-2 h-4 w-4" /> Unduh
          </Button>
        </CardHeader>
        <CardContent>
          <div ref={barRef} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function generateData(range: string) {
  const points: { label: string; count: number }[] = []
  const now = new Date()
  const length = 10
  for (let i = length - 1; i >= 0; i--) {
    const date = new Date(now)
    switch (range) {
      case "7d":
        date.setDate(now.getDate() - i)
        break
      case "40d":
        date.setDate(now.getDate() - i * 4)
        break
      case "1m":
        date.setDate(now.getDate() - i * 3)
        break
      case "3m":
        date.setMonth(now.getMonth() - i)
        break
      case "6m":
        date.setMonth(now.getMonth() - i * 2)
        break
      case "1y":
        date.setMonth(now.getMonth() - i * 3)
        break
    }
    const label = date.toLocaleDateString("id-ID", {
      month: "short",
      day: "numeric",
    })
    points.push({ label, count: Math.floor(Math.random() * 20) + 1 })
  }
  return points
}

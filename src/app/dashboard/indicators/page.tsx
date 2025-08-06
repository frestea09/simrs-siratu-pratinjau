"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IndicatorInputForm } from "@/components/organisms/indicator-input-form"
import { IndicatorReport } from "@/components/organisms/indicator-report"

export default function IndicatorsPage() {
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
            <CardContent>
              <IndicatorInputForm />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="report" className="space-y-4">
          <IndicatorReport />
        </TabsContent>
      </Tabs>
    </div>
  )
}

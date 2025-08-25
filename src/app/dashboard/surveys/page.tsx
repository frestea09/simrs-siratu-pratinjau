"use client"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SurveyForm } from "@/components/organisms/survey-form"
import { SurveyResponseTable } from "@/components/organisms/survey-response-table"
import { useSurveyStore } from "@/store/survey-store"

export default function SurveysPage() {
  const { responses } = useSurveyStore()

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <h2 className="text-3xl font-bold tracking-tight">
        Survei Budaya Keselamatan
      </h2>
      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="text-lg">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="form">Isi Survei</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Ringkasan Survei</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-lg">Total respon: {responses.length}</p>
              <SurveyResponseTable />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="form">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Form Survei</CardTitle>
            </CardHeader>
            <CardContent>
              <SurveyForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

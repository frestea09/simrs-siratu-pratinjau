
"use client"

import * as React from "react"
import { Line, LineChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, LabelList } from "recharts"
import { IndicatorReport } from "@/components/organisms/indicator-report"
import { useIndicatorStore } from "@/store/indicator-store"
import { Target, ThumbsUp, ThumbsDown } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useUserStore } from "@/store/user-store.tsx"
import { ReportPreviewDialog } from "@/components/organisms/report-preview-dialog"
import { ColumnDef } from "@tanstack/react-table"
import { SpmTable } from "@/components/organisms/spm-table"
import { SpmIndicator, useSpmStore } from "@/store/spm-store"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { SpmInputDialog } from "@/components/organisms/spm-input-dialog"

export default function SpmPage() {
  const { spmIndicators } = useSpmStore();
  const [reportData, setReportData] = React.useState<any[] | null>(null);
  const [reportColumns, setReportColumns] = React.useState<ColumnDef<any>[] | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
  const [isInputOpen, setIsInputOpen] = React.useState(false);
  const [editingIndicator, setEditingIndicator] = React.useState<SpmIndicator | null>(null);


  const handleExport = (data: any[], columns: ColumnDef<any>[]) => {
    setReportData(data);
    setReportColumns(columns);
    setIsPreviewOpen(true);
  };
  
  const handleEdit = (indicator: SpmIndicator) => {
    setEditingIndicator(indicator);
  }

  const handleCloseDialog = () => {
    setIsInputOpen(false);
    setEditingIndicator(null);
  }

  const isDialogOpen = isInputOpen || !!editingIndicator;
  

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Standar Pelayanan Minimal (SPM)</h2>
      </div>

       <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Laporan Standar Pelayanan Minimal</CardTitle>
                <CardDescription>
                  Riwayat data Standar Pelayanan Minimal (SPM) yang telah diinput.
                </CardDescription>
              </div>
              <Button onClick={() => setIsInputOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Input Data SPM
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <SpmTable 
                indicators={spmIndicators} 
                onExport={handleExport} 
                onEdit={handleEdit}
            />
          </CardContent>
        </Card>
      </div>
      
       {reportData && reportColumns && (
          <ReportPreviewDialog
              open={isPreviewOpen}
              onOpenChange={setIsPreviewOpen}
              data={reportData}
              columns={reportColumns}
              title={`Laporan Standar Pelayanan Minimal`}
          />
      )}

      <SpmInputDialog 
        open={isDialogOpen}
        onOpenChange={handleCloseDialog}
        spmIndicator={editingIndicator || undefined}
      />

    </div>
  )
}

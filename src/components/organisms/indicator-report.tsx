
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download } from "lucide-react"
import { useIndicatorStore } from "@/store/indicator-store"
import { IndicatorReportTable } from "./indicator-report-table"

export function IndicatorReport() {
    const indicators = useIndicatorStore((state) => state.indicators)

    return (
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
                <IndicatorReportTable indicators={indicators} />
            </CardContent>
        </Card>
    )
}

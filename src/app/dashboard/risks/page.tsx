"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { useRiskStore, Risk } from "@/store/risk-store"
import { RiskDialog } from "@/components/organisms/risk-dialog"
import { RiskTable } from "@/components/organisms/risk-table"


export default function RisksPage() {
    const [isDialogOpen, setIsDialogOpen] = React.useState(false)
    const risks = useRiskStore((state) => state.risks)

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <h2 className="text-3xl font-bold tracking-tight">Register Risiko</h2>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                        <CardTitle>Daftar Risiko Teridentifikasi</CardTitle>
                        <CardDescription>
                            Kelola semua risiko yang telah diidentifikasi di seluruh unit kerja.
                        </CardDescription>
                        </div>
                        <Button size="lg" onClick={() => setIsDialogOpen(true)}>
                            <PlusCircle className="mr-2 h-5 w-5" />
                            Identifikasi Risiko Baru
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <RiskTable risks={risks} />
                </CardContent>
            </Card>
            <RiskDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
        </div>
    )
}

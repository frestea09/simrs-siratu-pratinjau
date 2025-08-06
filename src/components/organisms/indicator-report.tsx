
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, PlusCircle } from "lucide-react"
import { useIndicatorStore } from "@/store/indicator-store"
import { IndicatorReportTable } from "./indicator-report-table"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion"
import { IndicatorInputForm } from "./indicator-input-form"
import React from "react"

export function IndicatorReport() {
    const indicators = useIndicatorStore((state) => state.indicators)
    const [accordionValue, setAccordionValue] = React.useState<string>("");


    return (
        <div className="space-y-4">
            <Accordion type="single" collapsible value={accordionValue} onValueChange={setAccordionValue}>
                <AccordionItem value="input-form" className="border-0">
                    <Card>
                         <AccordionTrigger className="w-full p-6 hover:no-underline [&[data-state=open]>svg.lucide-plus-circle]:hidden [&[data-state=closed]>svg.lucide-plus-circle]:block">
                            <div className="flex items-center justify-between w-full">
                                <div>
                                    <CardTitle>Input Data Capaian</CardTitle>
                                     <CardDescription className="pt-1 text-left">
                                        Klik di sini untuk membuka atau menutup form input data capaian indikator.
                                    </CardDescription>
                                </div>
                                <PlusCircle className="h-6 w-6 text-primary" />
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                           <CardContent>
                                <IndicatorInputForm setAccordionValue={setAccordionValue} />
                           </CardContent>
                        </AccordionContent>
                    </Card>
                </AccordionItem>
            </Accordion>
            
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
        </div>
    )
}

"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { IndicatorTableProps } from "./indicator-table.type"

export function IndicatorTable({ indicators }: IndicatorTableProps) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Indikator</TableHead>
                    <TableHead>Periode</TableHead>
                    <TableHead className="text-right">Numerator</TableHead>
                    <TableHead className="text-right">Denominator</TableHead>
                    <TableHead className="text-right">Capaian</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {indicators.map((item, index) => (
                    <TableRow key={index}>
                        <TableCell className="font-medium">{item.indicator}</TableCell>
                        <TableCell>{item.period}</TableCell>
                        <TableCell className="text-right">{item.numerator}</TableCell>
                        <TableCell className="text-right">{item.denominator}</TableCell>
                        <TableCell className="text-right font-semibold">{item.ratio}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}


"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { IncidentReportDialog } from "@/components/organisms/incident-report-dialog"
import { IncidentTable } from "@/components/organisms/incident-table"
import { ColumnDef } from "@tanstack/react-table"
import { ReportPreviewDialog } from "@/components/organisms/report-preview-dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { PlusCircle, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Incident, User } from "@prisma/client"
import prisma from "@/lib/prisma"
import { getCurrentUser } from "@/lib/actions/auth"


async function getIncidents() {
  return await prisma.incident.findMany({
    orderBy: {
      date: 'desc'
    }
  });
}

export default async function IncidentsPage() {
  const currentUser = await getCurrentUser()
  const incidents = await getIncidents();

  const canViewIncidents = currentUser?.role === 'SUB_KOMITE_KESELAMATAN_PASIEN' || currentUser?.role === 'ADMIN_SISTEM';

  const AddNewButton = ({ setIsNewDialogOpen }: { setIsNewDialogOpen: (isOpen: boolean) => void }) => (
    <Button size="lg" onClick={() => setIsNewDialogOpen(true)}>
        <PlusCircle className="mr-2 h-5 w-5" />
        Laporkan Insiden Baru
    </Button>
  );

  const IncidentsClient = ({ incidents, currentUser, canViewIncidents }: { incidents: Incident[], currentUser: User | null, canViewIncidents: boolean }) => {
    const [reportData, setReportData] = React.useState<any[] | null>(null);
    const [reportColumns, setReportColumns] = React.useState<ColumnDef<any>[] | null>(null);
    const [isNewDialogOpen, setIsNewDialogOpen] = React.useState(false);

    const handleExport = (data: any[], columns: ColumnDef<any>[]) => {
        setReportData(data);
        setReportColumns(columns);
    };

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Manajemen Insiden Keselamatan</h2>
                {!canViewIncidents && <AddNewButton setIsNewDialogOpen={setIsNewDialogOpen} />}
            </div>

            {canViewIncidents ? (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Laporan Insiden</CardTitle>
                                <CardDescription>Daftar insiden keselamatan yang dilaporkan.</CardDescription>
                            </div>
                            <AddNewButton setIsNewDialogOpen={setIsNewDialogOpen} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <IncidentTable incidents={incidents} onExport={handleExport} currentUser={currentUser} />
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Pelaporan Insiden</CardTitle>
                        <CardDescription>Gunakan tombol di pojok kanan atas untuk melaporkan insiden baru secara anonim.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Alert>
                            <ShieldAlert className="h-4 w-4" />
                            <AlertTitle>Akses Terbatas</AlertTitle>
                            <AlertDescription>
                                Hanya Sub. Komite Keselamatan Pasien yang dapat melihat daftar laporan insiden untuk menjaga kerahasiaan data.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            )}
            <IncidentReportDialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen} currentUser={currentUser} />
        </div>
    );
  };
  
  return <IncidentsClient incidents={incidents} currentUser={currentUser} canViewIncidents={canViewIncidents} />;
}

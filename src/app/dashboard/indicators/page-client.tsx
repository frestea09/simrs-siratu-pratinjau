
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IndicatorSubmissionDialog } from "@/components/organisms/indicator-submission-dialog";
import { IndicatorSubmissionTable } from "@/components/organisms/indicator-submission-table";
import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import type { IndicatorSubmission, User } from "@prisma/client";

const centralRoles = [
  "Admin Sistem",
  "Direktur",
  "Sub. Komite Peningkatan Mutu",
  "Sub. Komite Keselamatan Pasien",
  "Sub. Komite Manajemen Risiko",
];


interface IndicatorsPageClientProps {
    submittedIndicators: IndicatorSubmission[];
    currentUser: User | null;
}

export function IndicatorsPageClient({ submittedIndicators, currentUser }: IndicatorsPageClientProps) {
  const [isNewDialogOpen, setIsNewDialogOpen] = React.useState(false);

  const userCanSeeAll = currentUser && centralRoles.includes(currentUser.role);
  
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Manajemen Indikator
        </h2>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Pengajuan Indikator (INM, IMP-RS, IMPU, SPM)</CardTitle>
              <CardDescription>
                Daftar semua indikator yang telah diajukan beserta status
                verifikasinya.
                {currentUser?.unit &&
                  !userCanSeeAll &&
                  ` (Hanya menampilkan untuk Unit: ${currentUser.unit})`}
              </CardDescription>
            </div>
            <Button size="lg" onClick={() => setIsNewDialogOpen(true)}>
              <PlusCircle className="mr-2 h-5 w-5" />
              Ajukan Indikator Baru
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <IndicatorSubmissionTable indicators={submittedIndicators} currentUser={currentUser} />
        </CardContent>
      </Card>
      <IndicatorSubmissionDialog
        open={isNewDialogOpen}
        setOpen={setIsNewDialogOpen}
        currentUser={currentUser}
      />
    </div>
  );
}

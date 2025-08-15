
"use server";

import React from "react";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/actions/auth";
import { IndicatorSubmissionTable } from "@/components/organisms/indicator-submission-table";
import { IndicatorSubmissionDialog } from "@/components/organisms/indicator-submission-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { IndicatorsPageClient } from "./page-client";


async function getData(userId?: string, unit?: string, role?: string) {
  const centralRoles = [
    "Admin Sistem",
    "Direktur",
    "Sub. Komite Peningkatan Mutu",
    "Sub. Komite Keselamatan Pasien",
    "Sub. Komite Manajemen Risiko",
  ];
  
  const userCanSeeAll = role && centralRoles.includes(role);

  const whereClause = userCanSeeAll ? {} : { unit: unit };

  const submittedIndicators = await prisma.indicatorSubmission.findMany({
    where: whereClause,
    orderBy: {
      submissionDate: 'desc'
    }
  });

  return { submittedIndicators };
}

export default async function IndicatorsPage() {
  const currentUser = await getCurrentUser();
  const { submittedIndicators } = await getData(currentUser?.id, currentUser?.unit || undefined, currentUser?.role);

  return (
    <IndicatorsPageClient 
        submittedIndicators={submittedIndicators}
        currentUser={currentUser}
    />
  );
}

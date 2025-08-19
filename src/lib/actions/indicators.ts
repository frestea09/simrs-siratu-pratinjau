
"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "./auth"

export async function getIndicatorSubmissions(currentUser: any) {
  const userIsCentral = [
    "ADMIN_SISTEM",
    "DIREKTUR",
    "SUB_KOMITE_PENINGKATAN_MUTU",
  ].includes(currentUser.role)

  if (userIsCentral) {
    return await prisma.indicatorSubmission.findMany({
      orderBy: { submissionDate: "desc" },
      include: { submittedBy: true }
    })
  }
  return await prisma.indicatorSubmission.findMany({
    where: { unit: currentUser.unit },
    orderBy: { submissionDate: "desc" },
     include: { submittedBy: true }
  })
}

export async function submitIndicator(data: any) {
  const user = await getCurrentUser()
  if (!user) throw new Error("Not authenticated")

  const status = ['INM', 'IMP_RS', 'SPM'].includes(data.category)
      ? 'Diverifikasi'
      : 'Menunggu_Persetujuan';

  await prisma.indicatorSubmission.create({
    data: {
      ...data,
      standard: parseFloat(data.standard),
      submittedById: user.id,
      status: status,
    },
  })
  revalidatePath("/dashboard/indicators")
}

export async function updateSubmittedIndicator(id: string, data: any) {
   await prisma.indicatorSubmission.update({
    where: { id },
    data: {
        ...data,
        standard: parseFloat(data.standard),
    }
  })
  revalidatePath("/dashboard/indicators")
}


export async function updateSubmittedIndicatorStatus(id: string, status: any, reason?: string) {
    const data: any = { status };
    if (status === 'Ditolak' && reason) {
        data.rejectionReason = reason;
    } else if (status !== 'Ditolak') {
        data.rejectionReason = null;
    }
    await prisma.indicatorSubmission.update({ where: { id }, data });
    revalidatePath('/dashboard/indicators');
}


export async function removeSubmittedIndicator(id: string) {
    await prisma.indicatorSubmission.delete({ where: { id }});
    revalidatePath('/dashboard/indicators');
}


export async function getIndicators(category?: string) {
    const user = await getCurrentUser();
    if (!user) return [];

    const userIsCentral = [
        "ADMIN_SISTEM",
        "DIREKTUR",
        "SUB_KOMITE_PENINGKATAN_MUTU",
    ].includes(user.role);

    const whereClause: any = {};
    if (category) {
        whereClause.submission = { category };
    }
    if (!userIsCentral && user.unit) {
        whereClause.submission = { ...whereClause.submission, unit: user.unit };
    }
    
    const indicators = await prisma.indicator.findMany({
        where: whereClause,
        include: { submission: true },
        orderBy: { period: 'desc' }
    });

    return indicators.map(ind => ({
        ...ind,
        indicator: ind.submission.name,
        category: ind.submission.category,
        unit: ind.submission.unit,
        frequency: ind.submission.frequency,
        standard: ind.submission.standard,
        standardUnit: ind.submission.standardUnit,
    }));
}


export async function addIndicator(data: any) {
    await prisma.indicator.create({
        data: {
            submissionId: data.submissionId,
            period: data.period,
            numerator: parseFloat(data.numerator),
            denominator: parseFloat(data.denominator),
            analysisNotes: data.analysisNotes,
            followUpPlan: data.followUpPlan,
        }
    });
    revalidatePath('/dashboard/indicators');
    revalidatePath(`/dashboard/${data.category.toLowerCase().replace('_', '-')}`);
}

export async function updateIndicator(id: string, data: any) {
    await prisma.indicator.update({
        where: { id },
        data: {
            period: data.period,
            numerator: parseFloat(data.numerator),
            denominator: parseFloat(data.denominator),
            analysisNotes: data.analysisNotes,
            followUpPlan: data.followUpPlan,
        }
    });
    revalidatePath('/dashboard/indicators');
    revalidatePath(`/dashboard/${data.category.toLowerCase().replace('_', '-')}`);
}

export async function removeIndicator(id: string) {
    const indicator = await prisma.indicator.findUnique({ where: {id}, include: {submission: true}});
    if (indicator) {
        await prisma.indicator.delete({ where: { id }});
        revalidatePath('/dashboard/indicators');
        revalidatePath(`/dashboard/${indicator.submission.category.toLowerCase().replace('_', '-')}`);
    }
}

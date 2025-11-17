-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('AdminSistem', 'PICMutu', 'PJRuangan', 'KepalaUnitInstalasi', 'Direktur', 'SubKomitePeningkatanMutu', 'SubKomiteKeselamatanPasien', 'SubKomiteManajemenRisiko', 'PetugasPelaporan');

-- CreateEnum
CREATE TYPE "public"."IndicatorCategory" AS ENUM ('INM', 'IMP_RS', 'IMPU', 'SPM');

-- CreateEnum
CREATE TYPE "public"."IndicatorFrequency" AS ENUM ('Harian', 'Mingguan', 'Bulanan', 'Triwulan', 'Tahunan');

-- CreateEnum
CREATE TYPE "public"."CalculationMethod" AS ENUM ('percentage', 'average');

-- CreateEnum
CREATE TYPE "public"."StandardUnit" AS ENUM ('percent', 'minute');

-- CreateEnum
CREATE TYPE "public"."ProfileStatus" AS ENUM ('Draf', 'MenungguPersetujuan', 'Disetujui', 'Ditolak');

-- CreateEnum
CREATE TYPE "public"."SubmissionStatus" AS ENUM ('MenungguPersetujuan', 'Diverifikasi', 'Ditolak');

-- CreateEnum
CREATE TYPE "public"."IncidentType" AS ENUM ('KPC', 'KNC', 'KTC', 'KTD', 'Sentinel');

-- CreateEnum
CREATE TYPE "public"."IncidentSeverity" AS ENUM ('biru', 'hijau', 'kuning', 'merah');

-- CreateEnum
CREATE TYPE "public"."IncidentStatus" AS ENUM ('Investigasi', 'Selesai');

-- CreateEnum
CREATE TYPE "public"."RiskSource" AS ENUM ('LaporanInsiden', 'Komplain', 'SurveyRonde', 'RapatBrainstorming', 'Investigasi', 'Litigasi', 'ExternalRequirement');

-- CreateEnum
CREATE TYPE "public"."RiskCategory" AS ENUM ('Strategis', 'Operasional', 'Finansial', 'Compliance', 'Reputasi', 'PelayananPasien', 'BahayaFisik', 'BahayaKimia', 'BahayaBiologi', 'BahayaErgonomi', 'BahayaPsikososial');

-- CreateEnum
CREATE TYPE "public"."RiskEvaluation" AS ENUM ('Mitigasi', 'Transfer', 'Diterima', 'Dihindari');

-- CreateEnum
CREATE TYPE "public"."RiskLevel" AS ENUM ('Rendah', 'Moderat', 'Tinggi', 'Ekstrem');

-- CreateEnum
CREATE TYPE "public"."RiskStatus" AS ENUM ('Open', 'InProgress', 'Closed');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL,
    "unit" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Unit" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."IndicatorProfile" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "definition" TEXT NOT NULL,
    "implication" TEXT NOT NULL,
    "calculationMethod" "public"."CalculationMethod" NOT NULL,
    "numerator" TEXT NOT NULL,
    "denominator" TEXT NOT NULL,
    "target" DOUBLE PRECISION NOT NULL,
    "targetUnit" "public"."StandardUnit" NOT NULL,
    "inclusionCriteria" TEXT NOT NULL,
    "exclusionCriteria" TEXT NOT NULL,
    "dataRecording" TEXT NOT NULL,
    "unitRecap" TEXT NOT NULL,
    "analysisReporting" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "pic" TEXT NOT NULL,
    "status" "public"."ProfileStatus" NOT NULL DEFAULT 'Draf',
    "rejectionReason" TEXT,
    "unit" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "IndicatorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SubmittedIndicator" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "public"."IndicatorCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "frequency" "public"."IndicatorFrequency" NOT NULL,
    "status" "public"."SubmissionStatus" NOT NULL DEFAULT 'MenungguPersetujuan',
    "submissionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "standard" DOUBLE PRECISION NOT NULL,
    "standardUnit" "public"."StandardUnit" NOT NULL,
    "rejectionReason" TEXT,
    "profileId" TEXT NOT NULL,
    "submittedById" TEXT NOT NULL,

    CONSTRAINT "SubmittedIndicator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Indicator" (
    "id" TEXT NOT NULL,
    "period" DATE NOT NULL,
    "numerator" DOUBLE PRECISION NOT NULL,
    "denominator" DOUBLE PRECISION NOT NULL,
    "ratio" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "analysisNotes" TEXT,
    "followUpPlan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "submissionId" TEXT NOT NULL,

    CONSTRAINT "Indicator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Incident" (
    "id" TEXT NOT NULL,
    "reportDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "public"."IncidentStatus" NOT NULL DEFAULT 'Investigasi',
    "patientName" TEXT,
    "medicalRecordNumber" TEXT,
    "careRoom" TEXT,
    "ageGroup" TEXT,
    "gender" TEXT,
    "payer" TEXT,
    "entryDate" TIMESTAMP(3),
    "entryTime" TEXT,
    "incidentDate" TIMESTAMP(3),
    "incidentTime" TEXT,
    "chronology" TEXT,
    "type" "public"."IncidentType" NOT NULL,
    "incidentSubject" TEXT,
    "incidentLocation" TEXT,
    "incidentLocationOther" TEXT,
    "relatedUnit" TEXT,
    "firstAction" TEXT,
    "firstActionBy" TEXT,
    "hasHappenedBefore" TEXT,
    "severity" "public"."IncidentSeverity" NOT NULL,
    "patientImpact" TEXT,
    "analysisNotes" TEXT,
    "followUpPlan" TEXT,
    "reporterId" TEXT,
    "analystId" TEXT,

    CONSTRAINT "Incident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Risk" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unit" TEXT NOT NULL,
    "source" "public"."RiskSource" NOT NULL,
    "description" TEXT NOT NULL,
    "cause" TEXT NOT NULL,
    "category" "public"."RiskCategory" NOT NULL,
    "consequence" INTEGER NOT NULL,
    "likelihood" INTEGER NOT NULL,
    "cxl" INTEGER NOT NULL,
    "riskLevel" "public"."RiskLevel" NOT NULL,
    "controllability" INTEGER NOT NULL,
    "riskScore" INTEGER NOT NULL,
    "evaluation" "public"."RiskEvaluation" NOT NULL,
    "actionPlan" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3),
    "status" "public"."RiskStatus" NOT NULL DEFAULT 'Open',
    "residualConsequence" INTEGER,
    "residualLikelihood" INTEGER,
    "residualRiskScore" INTEGER,
    "residualRiskLevel" "public"."RiskLevel",
    "reportNotes" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" TEXT NOT NULL,
    "picId" TEXT,

    CONSTRAINT "Risk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SurveyResult" (
    "id" TEXT NOT NULL,
    "submissionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unit" TEXT NOT NULL,
    "totalScore" DOUBLE PRECISION NOT NULL,
    "positivePercentage" DOUBLE PRECISION NOT NULL,
    "neutralPercentage" DOUBLE PRECISION NOT NULL,
    "negativePercentage" DOUBLE PRECISION NOT NULL,
    "answersJson" JSONB NOT NULL,
    "submittedById" TEXT,

    CONSTRAINT "SurveyResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT,
    "creatorId" TEXT,
    "recipientId" TEXT NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SystemLog" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT NOT NULL,

    CONSTRAINT "SystemLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Unit_name_key" ON "public"."Unit"("name");

-- CreateIndex
CREATE UNIQUE INDEX "IndicatorProfile_title_key" ON "public"."IndicatorProfile"("title");

-- CreateIndex
CREATE UNIQUE INDEX "Indicator_submissionId_period_key" ON "public"."Indicator"("submissionId", "period");

-- AddForeignKey
ALTER TABLE "public"."IndicatorProfile" ADD CONSTRAINT "IndicatorProfile_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SubmittedIndicator" ADD CONSTRAINT "SubmittedIndicator_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."IndicatorProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SubmittedIndicator" ADD CONSTRAINT "SubmittedIndicator_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Indicator" ADD CONSTRAINT "Indicator_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "public"."SubmittedIndicator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Incident" ADD CONSTRAINT "Incident_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Incident" ADD CONSTRAINT "Incident_analystId_fkey" FOREIGN KEY ("analystId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Risk" ADD CONSTRAINT "Risk_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Risk" ADD CONSTRAINT "Risk_picId_fkey" FOREIGN KEY ("picId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SurveyResult" ADD CONSTRAINT "SurveyResult_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


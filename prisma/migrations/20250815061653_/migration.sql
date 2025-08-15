-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN_SISTEM', 'PIC_MUTU', 'PJ_RUANGAN', 'KEPALA_UNIT_INSTALASI', 'DIREKTUR', 'SUB_KOMITE_PENINGKATAN_MUTU', 'SUB_KOMITE_KESELAMATAN_PASIEN', 'SUB_KOMITE_MANAJEMEN_RISIKO') NOT NULL,
    `unit` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IndicatorSubmission` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `category` ENUM('INM', 'IMP_RS', 'IMPU', 'SPM') NOT NULL,
    `description` TEXT NOT NULL,
    `unit` VARCHAR(191) NOT NULL,
    `frequency` ENUM('HARIAN', 'MINGGUAN', 'BULANAN', 'TAHUNAN') NOT NULL,
    `status` ENUM('MENUNGGU_PERSETUJUAN', 'DIVERIFIKASI', 'DITOLAK') NOT NULL,
    `submissionDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `standard` DOUBLE NOT NULL,
    `standardUnit` ENUM('PERSEN', 'MENIT') NOT NULL,
    `rejectionReason` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Indicator` (
    `id` VARCHAR(191) NOT NULL,
    `indicator` VARCHAR(191) NOT NULL,
    `category` ENUM('INM', 'IMP_RS', 'IMPU', 'SPM') NOT NULL,
    `unit` VARCHAR(191) NOT NULL,
    `period` DATETIME(3) NOT NULL,
    `frequency` ENUM('HARIAN', 'MINGGUAN', 'BULANAN', 'TAHUNAN') NOT NULL,
    `numerator` DOUBLE NOT NULL,
    `denominator` DOUBLE NOT NULL,
    `standard` DOUBLE NOT NULL,
    `standardUnit` ENUM('PERSEN', 'MENIT') NOT NULL,
    `analysisNotes` TEXT NULL,
    `followUpPlan` TEXT NULL,
    `ratio` VARCHAR(191) NOT NULL,
    `status` ENUM('MEMENUHI_STANDAR', 'TIDAK_MEMENUHI_STANDAR', 'NA') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Incident` (
    `id` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` ENUM('INVESTIGASI', 'SELESAI') NOT NULL,
    `patientName` VARCHAR(191) NULL,
    `medicalRecordNumber` VARCHAR(191) NULL,
    `careRoom` VARCHAR(191) NULL,
    `ageGroup` VARCHAR(191) NULL,
    `gender` VARCHAR(191) NULL,
    `payer` VARCHAR(191) NULL,
    `entryDate` DATETIME(3) NULL,
    `entryTime` VARCHAR(191) NULL,
    `incidentDate` DATETIME(3) NULL,
    `incidentTime` VARCHAR(191) NULL,
    `chronology` TEXT NULL,
    `type` ENUM('KPC', 'KNC', 'KTC', 'KTD', 'SENTINEL') NOT NULL,
    `incidentSubject` VARCHAR(191) NULL,
    `incidentLocation` VARCHAR(191) NULL,
    `relatedUnit` VARCHAR(191) NULL,
    `firstAction` TEXT NULL,
    `firstActionBy` VARCHAR(191) NULL,
    `hasHappenedBefore` VARCHAR(191) NULL,
    `severity` ENUM('BIRU', 'HIJAU', 'KUNING', 'MERAH') NOT NULL,
    `patientImpact` VARCHAR(191) NULL,
    `analysisNotes` TEXT NULL,
    `followUpPlan` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Risk` (
    `id` VARCHAR(191) NOT NULL,
    `unit` VARCHAR(191) NOT NULL,
    `source` ENUM('LAPORAN_INSIDEN', 'KOMPLAIN', 'SURVEY_RONDE', 'RAPAT_BRAINSTORMING', 'INVESTIGASI', 'LITIGASI', 'EXTERNAL_REQUIREMENT') NOT NULL,
    `description` TEXT NOT NULL,
    `cause` TEXT NOT NULL,
    `category` ENUM('STRATEGIS', 'OPERASIONAL', 'FINANSIAL', 'COMPLIANCE', 'REPUTASI', 'PELAYANAN_PASIEN', 'BAHAYA_FISIK', 'BAHAYA_KIMIA', 'BAHAYA_BIOLOGI', 'BAHAYA_ERGONOMI', 'BAHAYA_PSIKOSOSIAL') NOT NULL,
    `submissionDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `consequence` INTEGER NOT NULL,
    `likelihood` INTEGER NOT NULL,
    `cxl` INTEGER NOT NULL,
    `riskLevel` ENUM('Rendah', 'Moderat', 'Tinggi', 'Ekstrem') NOT NULL,
    `controllability` INTEGER NOT NULL,
    `riskScore` INTEGER NOT NULL,
    `evaluation` ENUM('MITIGASI', 'TRANSFER', 'DITERIMA', 'DIHINDARI') NOT NULL,
    `actionPlan` TEXT NOT NULL,
    `dueDate` DATETIME(3) NULL,
    `picId` VARCHAR(191) NULL,
    `status` ENUM('OPEN', 'IN_PROGRESS', 'CLOSED') NOT NULL,
    `residualConsequence` INTEGER NULL,
    `residualLikelihood` INTEGER NULL,
    `residualRiskScore` INTEGER NULL,
    `residualRiskLevel` ENUM('Rendah', 'Moderat', 'Tinggi', 'Ekstrem') NULL,
    `reportNotes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Risk` ADD CONSTRAINT `Risk_picId_fkey` FOREIGN KEY (`picId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

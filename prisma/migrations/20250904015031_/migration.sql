-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('AdminSistem', 'PICMutu', 'PJRuangan', 'KepalaUnitInstalasi', 'Direktur', 'SubKomitePeningkatanMutu', 'SubKomiteKeselamatanPasien', 'SubKomiteManajemenRisiko') NOT NULL,
    `unit` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IndicatorProfile` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `purpose` VARCHAR(191) NOT NULL,
    `definition` TEXT NOT NULL,
    `implication` TEXT NOT NULL,
    `calculationMethod` ENUM('percentage', 'average') NOT NULL,
    `numerator` VARCHAR(191) NOT NULL,
    `denominator` VARCHAR(191) NOT NULL,
    `target` DOUBLE NOT NULL,
    `targetUnit` ENUM('percent', 'minute') NOT NULL,
    `inclusionCriteria` TEXT NOT NULL,
    `exclusionCriteria` TEXT NOT NULL,
    `dataRecording` VARCHAR(191) NOT NULL,
    `unitRecap` VARCHAR(191) NOT NULL,
    `analysisReporting` VARCHAR(191) NOT NULL,
    `area` VARCHAR(191) NOT NULL,
    `pic` VARCHAR(191) NOT NULL,
    `status` ENUM('Draf', 'MenungguPersetujuan', 'Disetujui', 'Ditolak') NOT NULL DEFAULT 'Draf',
    `rejectionReason` VARCHAR(191) NULL,
    `unit` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `authorId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `IndicatorProfile_title_key`(`title`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SubmittedIndicator` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `category` ENUM('INM', 'IMP_RS', 'IMPU', 'SPM') NOT NULL,
    `description` TEXT NOT NULL,
    `unit` VARCHAR(191) NOT NULL,
    `frequency` ENUM('Harian', 'Mingguan', 'Bulanan', 'Triwulan', 'Tahunan') NOT NULL,
    `status` ENUM('MenungguPersetujuan', 'Diverifikasi', 'Ditolak') NOT NULL DEFAULT 'MenungguPersetujuan',
    `submissionDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `standard` DOUBLE NOT NULL,
    `standardUnit` ENUM('percent', 'minute') NOT NULL,
    `rejectionReason` VARCHAR(191) NULL,
    `profileId` VARCHAR(191) NOT NULL,
    `submittedById` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Indicator` (
    `id` VARCHAR(191) NOT NULL,
    `period` DATE NOT NULL,
    `numerator` DOUBLE NOT NULL,
    `denominator` DOUBLE NOT NULL,
    `ratio` DOUBLE NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `analysisNotes` TEXT NULL,
    `followUpPlan` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `submissionId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Indicator_submissionId_period_key`(`submissionId`, `period`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Incident` (
    `id` VARCHAR(191) NOT NULL,
    `reportDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` ENUM('Investigasi', 'Selesai') NOT NULL DEFAULT 'Investigasi',
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
    `type` ENUM('KPC', 'KNC', 'KTC', 'KTD', 'Sentinel') NOT NULL,
    `incidentSubject` VARCHAR(191) NULL,
    `incidentLocation` VARCHAR(191) NULL,
    `incidentLocationOther` VARCHAR(191) NULL,
    `relatedUnit` VARCHAR(191) NULL,
    `firstAction` TEXT NULL,
    `firstActionBy` VARCHAR(191) NULL,
    `hasHappenedBefore` VARCHAR(191) NULL,
    `severity` ENUM('biru', 'hijau', 'kuning', 'merah') NOT NULL,
    `patientImpact` VARCHAR(191) NULL,
    `analysisNotes` TEXT NULL,
    `followUpPlan` TEXT NULL,
    `reporterId` VARCHAR(191) NULL,
    `analystId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Risk` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `unit` VARCHAR(191) NOT NULL,
    `source` ENUM('LaporanInsiden', 'Komplain', 'SurveyRonde', 'RapatBrainstorming', 'Investigasi', 'Litigasi', 'ExternalRequirement') NOT NULL,
    `description` TEXT NOT NULL,
    `cause` TEXT NOT NULL,
    `category` ENUM('Strategis', 'Operasional', 'Finansial', 'Compliance', 'Reputasi', 'PelayananPasien', 'BahayaFisik', 'BahayaKimia', 'BahayaBiologi', 'BahayaErgonomi', 'BahayaPsikososial') NOT NULL,
    `consequence` INTEGER NOT NULL,
    `likelihood` INTEGER NOT NULL,
    `cxl` INTEGER NOT NULL,
    `riskLevel` ENUM('Rendah', 'Moderat', 'Tinggi', 'Ekstrem') NOT NULL,
    `controllability` INTEGER NOT NULL,
    `riskScore` INTEGER NOT NULL,
    `evaluation` ENUM('Mitigasi', 'Transfer', 'Diterima', 'Dihindari') NOT NULL,
    `actionPlan` TEXT NOT NULL,
    `dueDate` DATETIME(3) NULL,
    `status` ENUM('Open', 'InProgress', 'Closed') NOT NULL DEFAULT 'Open',
    `residualConsequence` INTEGER NULL,
    `residualLikelihood` INTEGER NULL,
    `residualRiskScore` INTEGER NULL,
    `residualRiskLevel` ENUM('Rendah', 'Moderat', 'Tinggi', 'Ekstrem') NULL,
    `reportNotes` TEXT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `authorId` VARCHAR(191) NOT NULL,
    `picId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SurveyResult` (
    `id` VARCHAR(191) NOT NULL,
    `submissionDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `unit` VARCHAR(191) NOT NULL,
    `totalScore` DOUBLE NOT NULL,
    `positivePercentage` DOUBLE NOT NULL,
    `neutralPercentage` DOUBLE NOT NULL,
    `negativePercentage` DOUBLE NOT NULL,
    `answersJson` JSON NOT NULL,
    `submittedById` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id` VARCHAR(191) NOT NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `link` VARCHAR(191) NULL,
    `creatorId` VARCHAR(191) NULL,
    `recipientId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SystemLog` (
    `id` VARCHAR(191) NOT NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `user` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `details` TEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `IndicatorProfile` ADD CONSTRAINT `IndicatorProfile_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SubmittedIndicator` ADD CONSTRAINT `SubmittedIndicator_profileId_fkey` FOREIGN KEY (`profileId`) REFERENCES `IndicatorProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SubmittedIndicator` ADD CONSTRAINT `SubmittedIndicator_submittedById_fkey` FOREIGN KEY (`submittedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Indicator` ADD CONSTRAINT `Indicator_submissionId_fkey` FOREIGN KEY (`submissionId`) REFERENCES `SubmittedIndicator`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Incident` ADD CONSTRAINT `Incident_reporterId_fkey` FOREIGN KEY (`reporterId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Incident` ADD CONSTRAINT `Incident_analystId_fkey` FOREIGN KEY (`analystId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Risk` ADD CONSTRAINT `Risk_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Risk` ADD CONSTRAINT `Risk_picId_fkey` FOREIGN KEY (`picId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SurveyResult` ADD CONSTRAINT `SurveyResult_submittedById_fkey` FOREIGN KEY (`submittedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_recipientId_fkey` FOREIGN KEY (`recipientId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

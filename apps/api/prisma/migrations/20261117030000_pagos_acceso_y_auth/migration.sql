-- AlterTable
ALTER TABLE `Enrollment` ADD COLUMN `access` ENUM('no_solicitado', 'pendiente', 'otorgado', 'fallido') NOT NULL DEFAULT 'no_solicitado',
    ADD COLUMN `accessNote` VARCHAR(500) NULL,
    ADD COLUMN `mpOrderId` VARCHAR(64) NULL,
    ADD COLUMN `mpStatus` VARCHAR(40) NULL,
    ADD COLUMN `paidAt` DATETIME(3) NULL,
    MODIFY `payment` ENUM('pendiente', 'sena', 'aprobado', 'rechazado') NOT NULL DEFAULT 'pendiente';

-- CreateTable
CREATE TABLE `user` (
    `id` VARCHAR(64) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `email` VARCHAR(254) NOT NULL,
    `emailVerified` BOOLEAN NOT NULL DEFAULT false,
    `image` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `session` (
    `id` VARCHAR(64) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `token` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `ipAddress` VARCHAR(64) NULL,
    `userAgent` TEXT NULL,
    `userId` VARCHAR(64) NOT NULL,

    UNIQUE INDEX `session_token_key`(`token`),
    INDEX `session_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `account` (
    `id` VARCHAR(64) NOT NULL,
    `accountId` VARCHAR(255) NOT NULL,
    `providerId` VARCHAR(64) NOT NULL,
    `userId` VARCHAR(64) NOT NULL,
    `accessToken` TEXT NULL,
    `refreshToken` TEXT NULL,
    `idToken` TEXT NULL,
    `accessTokenExpiresAt` DATETIME(3) NULL,
    `refreshTokenExpiresAt` DATETIME(3) NULL,
    `scope` TEXT NULL,
    `password` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `account_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `verification` (
    `id` VARCHAR(64) NOT NULL,
    `identifier` VARCHAR(255) NOT NULL,
    `value` TEXT NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `verification_identifier_idx`(`identifier`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Enrollment_mpOrderId_key` ON `Enrollment`(`mpOrderId`);

-- AddForeignKey
ALTER TABLE `session` ADD CONSTRAINT `session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `account` ADD CONSTRAINT `account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

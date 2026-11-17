-- CreateTable
CREATE TABLE `Course` (
    `id` VARCHAR(120) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `category` VARCHAR(60) NOT NULL,
    `durationMonths` INTEGER NOT NULL,
    `hours` INTEGER NOT NULL,
    `formats` JSON NOT NULL,
    `ministry` BOOLEAN NOT NULL DEFAULT false,
    `practices` BOOLEAN NOT NULL DEFAULT false,
    `seats` INTEGER NOT NULL,
    `shift` VARCHAR(60) NOT NULL,
    `matricula` INTEGER NOT NULL,
    `cuota` INTEGER NOT NULL,
    `requirements` JSON NOT NULL,
    `start` DATE NOT NULL,
    `image` VARCHAR(500) NOT NULL,
    `summary` TEXT NOT NULL,
    `description` TEXT NOT NULL,
    `outcomes` JSON NOT NULL,
    `modules` JSON NOT NULL,
    `position` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Course_category_idx`(`category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SiteContent` (
    `key` VARCHAR(60) NOT NULL,
    `value` JSON NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Enrollment` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(20) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `dni` VARCHAR(15) NOT NULL,
    `email` VARCHAR(254) NOT NULL,
    `phone` VARCHAR(40) NOT NULL,
    `courseId` VARCHAR(120) NULL,
    `courseTitle` VARCHAR(200) NOT NULL,
    `modality` ENUM('presencial', 'hibrido', 'virtual') NOT NULL,
    `shift` VARCHAR(60) NOT NULL,
    `status` ENUM('nuevo', 'contactado', 'inscripto', 'baja') NOT NULL DEFAULT 'nuevo',
    `payment` ENUM('pendiente', 'sena', 'aprobado') NOT NULL DEFAULT 'pendiente',
    `amount` INTEGER NOT NULL,
    `notes` TEXT NOT NULL,
    `source` ENUM('web', 'equipo', 'ejemplo') NOT NULL DEFAULT 'web',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Enrollment_createdAt_idx`(`createdAt`),
    INDEX `Enrollment_courseId_idx`(`courseId`),
    INDEX `Enrollment_dni_idx`(`dni`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Enrollment` ADD CONSTRAINT `Enrollment_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

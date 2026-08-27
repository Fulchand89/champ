CREATE DATABASE IF NOT EXISTS `quiz_app` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `quiz_app`;

-- -------------------------------------------------------------
-- 3. Table: contests
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `contests` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(150) NOT NULL,
  `description` TEXT NULL,
  `categoryId` INT NULL,
  `startTime` DATETIME NOT NULL,
  `endTime` DATETIME NOT NULL,
  `registrationStart` DATETIME NULL,
  `registrationEnd` DATETIME NULL,
  `entryFee` DECIMAL(10,2) DEFAULT 0.00,
  `prizePool` DECIMAL(10,2) DEFAULT 0.00,
  `maxParticipants` INT DEFAULT 0,
  `minParticipants` INT DEFAULT 0,
  `durationMinutes` INT NOT NULL,
  `isActive` TINYINT(1) DEFAULT 1,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  CONSTRAINT `fk_contests_categoryId` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

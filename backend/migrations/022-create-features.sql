-- -------------------------------------------------------------
-- Migration 022: Create features table for dynamic homepage cards
-- -------------------------------------------------------------

CREATE DATABASE IF NOT EXISTS `quiz_app` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `quiz_app`;

CREATE TABLE IF NOT EXISTS `features` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `contestId` INT NULL,
  `title` VARCHAR(150) NOT NULL,
  `description` TEXT NOT NULL,
  `icon` VARCHAR(100) NULL,
  `order` INT NOT NULL DEFAULT 0,
  `isActive` TINYINT(1) NOT NULL DEFAULT 1,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_features_contestId` FOREIGN KEY (`contestId`) REFERENCES `contests` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS `quiz_app` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `quiz_app`;

-- -------------------------------------------------------------
-- 1. Table: users
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `uuid` VARCHAR(12) NOT NULL,
  `firebaseUid` VARCHAR(128) NULL,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `mobile` VARCHAR(15) NULL,
  `password` VARCHAR(255) NULL,
  `role` ENUM('super_admin', 'admin', 'user') DEFAULT 'user',
  `isActive` TINYINT(1) DEFAULT 1,
  `isVerified` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  `isTermAccpeted` TINYINT(1) DEFAULT 0,
  `authProvider` ENUM('local', 'google') DEFAULT 'local',
  `profilePicUrl` VARCHAR(255) NULL,
  `city` VARCHAR(100) NULL,
  `adharNumber` VARCHAR(20) NULL,
  `adharImages` JSON NULL,
  `lastLogin` DATETIME NULL,
  `resetPasswordToken` VARCHAR(255) NULL,
  `resetPasswordExpires` DATETIME NULL,
  `pendingEmail` VARCHAR(255) NULL,
  `emailChangeToken` VARCHAR(255) NULL,
  `emailChangeExpires` DATETIME NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  `deletedAt` DATETIME NULL,
  UNIQUE KEY `users_uuid_unique` (`uuid`),
  UNIQUE KEY `users_email_unique` (`email`),
  UNIQUE KEY `users_firebaseUid_unique` (`firebaseUid`),
  UNIQUE KEY `users_mobile_unique` (`mobile`),
  INDEX `users_city_index` (`city`),
  INDEX `users_adharNumber_index` (`adharNumber`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

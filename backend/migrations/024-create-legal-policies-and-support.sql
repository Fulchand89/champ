-- -------------------------------------------------------------
-- Migration 024: Create legal_policies and support_contacts tables
-- -------------------------------------------------------------

CREATE DATABASE IF NOT EXISTS `quiz_app` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `quiz_app`;

-- 1. Table: legal_policies (Terms & Conditions, Privacy Policy, Refund Policy)
CREATE TABLE IF NOT EXISTS `legal_policies` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `policyType` ENUM('privacy_policy', 'terms_conditions', 'refund_policy') NOT NULL,
  `targetType` ENUM('customer', 'driver') NOT NULL DEFAULT 'customer',
  `title` VARCHAR(255) NOT NULL,
  `content` LONGTEXT NOT NULL,
  `version` VARCHAR(20) NOT NULL DEFAULT 'v1.0.0',
  `status` ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'published',
  `publishedAt` DATETIME NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_legal_policies_lookup` (`policyType`, `targetType`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Table: support_contacts
CREATE TABLE IF NOT EXISTS `support_contacts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `phone` VARCHAR(30) NOT NULL DEFAULT '+91 98765 43210',
  `email` VARCHAR(100) NOT NULL DEFAULT 'support@knowchamp.com',
  `address` VARCHAR(255) NOT NULL DEFAULT 'KnowChamp HQ, Tech Park, Bangalore, India',
  `workingHours` VARCHAR(100) NOT NULL DEFAULT 'Mon - Sat: 9:00 AM - 7:00 PM',
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

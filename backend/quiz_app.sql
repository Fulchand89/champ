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

-- -------------------------------------------------------------
-- 2. Table: categories
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `slug` VARCHAR(100) NOT NULL,
  `isActive` TINYINT(1) DEFAULT 1,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  UNIQUE KEY `categories_name_unique` (`name`),
  UNIQUE KEY `categories_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

-- -------------------------------------------------------------
-- 4. Table: questions
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `questions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `categoryId` INT NOT NULL,
  `questionText` TEXT NOT NULL,
  `questionType` ENUM('single_choice', 'multiple_choice', 'true_false') DEFAULT 'single_choice',
  `difficulty` ENUM('easy', 'medium', 'hard') DEFAULT 'easy',
  `points` INT DEFAULT 1,
  `negativePoints` DECIMAL(5,2) DEFAULT 0.00,
  `explanation` TEXT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  CONSTRAINT `fk_questions_categoryId` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 5. Table: question_options
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `question_options` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `questionId` INT NOT NULL,
  `optionText` TEXT NOT NULL,
  `isCorrect` TINYINT(1) DEFAULT 0,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  CONSTRAINT `fk_question_options_questionId` FOREIGN KEY (`questionId`) REFERENCES `questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 6. Table: contest_questions
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `contest_questions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `contestId` INT NOT NULL,
  `questionId` INT NOT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  UNIQUE KEY `contest_questions_unique` (`contestId`, `questionId`),
  CONSTRAINT `fk_contest_questions_contestId` FOREIGN KEY (`contestId`) REFERENCES `contests` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_contest_questions_questionId` FOREIGN KEY (`questionId`) REFERENCES `questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 7. Table: contest_participants
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `contest_participants` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `contestId` INT NOT NULL,
  `userId` INT NOT NULL,
  `registeredAt` DATETIME NOT NULL,
  `status` ENUM('registered', 'joined', 'completed', 'disqualified') DEFAULT 'registered',
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  UNIQUE KEY `contest_participants_unique` (`contestId`, `userId`),
  CONSTRAINT `fk_contest_participants_contestId` FOREIGN KEY (`contestId`) REFERENCES `contests` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_contest_participants_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 8. Table: quiz_attempts
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `quiz_attempts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `contestId` INT NULL,
  `startedAt` DATETIME NOT NULL,
  `completedAt` DATETIME NULL,
  `score` DECIMAL(8,2) DEFAULT 0.00,
  `correctAnswers` INT DEFAULT 0,
  `wrongAnswers` INT DEFAULT 0,
  `skippedQuestions` INT DEFAULT 0,
  `status` ENUM('started', 'completed', 'abandoned') DEFAULT 'started',
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  CONSTRAINT `fk_quiz_attempts_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_quiz_attempts_contestId` FOREIGN KEY (`contestId`) REFERENCES `contests` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 9. Table: quiz_answers
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `quiz_answers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `attemptId` INT NOT NULL,
  `questionId` INT NOT NULL,
  `selectedOptionId` INT NULL,
  `isCorrect` TINYINT(1) DEFAULT 0,
  `timeTakenSeconds` INT DEFAULT 0,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  UNIQUE KEY `quiz_answers_unique` (`attemptId`, `questionId`),
  CONSTRAINT `fk_quiz_answers_attemptId` FOREIGN KEY (`attemptId`) REFERENCES `quiz_attempts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_quiz_answers_questionId` FOREIGN KEY (`questionId`) REFERENCES `questions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_quiz_answers_selectedOptionId` FOREIGN KEY (`selectedOptionId`) REFERENCES `question_options` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 10. Table: leaderboards
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `leaderboards` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `contestId` INT NOT NULL,
  `userId` INT NOT NULL,
  `score` DECIMAL(8,2) NOT NULL,
  `rank` INT NOT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  UNIQUE KEY `leaderboards_unique` (`contestId`, `userId`),
  CONSTRAINT `fk_leaderboards_contestId` FOREIGN KEY (`contestId`) REFERENCES `contests` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_leaderboards_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 11. Table: rewards
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `rewards` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `points` INT NOT NULL DEFAULT 0,
  `description` VARCHAR(255) NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  CONSTRAINT `fk_rewards_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 12. Table: winners
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `winners` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `contestId` INT NOT NULL,
  `userId` INT NOT NULL,
  `rank` INT NOT NULL,
  `prizeAmount` DECIMAL(10,2) NOT NULL,
  `isPaid` TINYINT(1) DEFAULT 0,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  UNIQUE KEY `winners_unique` (`contestId`, `userId`),
  CONSTRAINT `fk_winners_contestId` FOREIGN KEY (`contestId`) REFERENCES `contests` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_winners_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 13. Table: wallets
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `wallets` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `balance` DECIMAL(10,2) DEFAULT 0.00,
  `currency` VARCHAR(3) DEFAULT 'INR',
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  UNIQUE KEY `wallets_userId_unique` (`userId`),
  CONSTRAINT `fk_wallets_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 14. Table: wallet_transactions
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `wallet_transactions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `walletId` INT NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `type` ENUM('credit', 'debit') NOT NULL,
  `purpose` ENUM('deposit', 'withdrawal', 'contest_fee', 'contest_win', 'refund') NOT NULL,
  `status` ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
  `referenceId` VARCHAR(100) NULL,
  `description` VARCHAR(255) NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  CONSTRAINT `fk_wallet_transactions_walletId` FOREIGN KEY (`walletId`) REFERENCES `wallets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 15. Table: testimonials
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `testimonials` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NULL,
  `name` VARCHAR(100) NOT NULL,
  `rating` INT NOT NULL DEFAULT 5,
  `text` TEXT NOT NULL,
  `title` VARCHAR(100) NULL,
  `image` VARCHAR(255) NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  CONSTRAINT `fk_testimonials_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 16. Table: faqs
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `faqs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `question` TEXT NOT NULL,
  `answer` TEXT NOT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 17. Table: contact_messages
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `contact_messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `subject` VARCHAR(255) NULL,
  `message` TEXT NOT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 18. Table: newsletter_subscribers
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `newsletter_subscribers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 19. Table: subjects
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `subjects` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `categoryId` INT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `isActive` TINYINT(1) NOT NULL DEFAULT 1,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_subjects_categoryId` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 20. Table: topics
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `topics` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `subjectId` INT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `isActive` TINYINT(1) NOT NULL DEFAULT 1,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_topics_subjectId` FOREIGN KEY (`subjectId`) REFERENCES `subjects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 21. Table: features
-- -------------------------------------------------------------
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

-- -------------------------------------------------------------
-- 22. Table: fee_tiers
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `fee_tiers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `amount` DECIMAL(10,2) NOT NULL,
  `label` VARCHAR(100) NOT NULL,
  `description` VARCHAR(255) NULL,
  `isActive` TINYINT(1) NOT NULL DEFAULT 1,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 23. Table: prize_pool_templates
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `prize_pool_templates` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `totalAmount` DECIMAL(10,2) NOT NULL,
  `distribution` JSON NOT NULL,
  `isActive` TINYINT(1) NOT NULL DEFAULT 1,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 24. Table: transactions
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `txnId` VARCHAR(64) NOT NULL UNIQUE,
  `userId` INT NULL,
  `type` ENUM('entry_fee', 'coins_pack', 'deposit', 'withdrawal', 'prize_payout', 'refund') NOT NULL DEFAULT 'deposit',
  `amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `currency` VARCHAR(10) NOT NULL DEFAULT 'INR',
  `paymentMethod` VARCHAR(64) NOT NULL DEFAULT 'UPI',
  `paymentGateway` VARCHAR(64) NULL DEFAULT 'Razorpay',
  `gatewayTxnId` VARCHAR(128) NULL,
  `status` ENUM('successful', 'pending', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
  `description` TEXT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_transactions_userId` (`userId`),
  KEY `idx_transactions_status` (`status`),
  KEY `idx_transactions_type` (`type`),
  CONSTRAINT `fk_transactions_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 25. Table: withdrawals
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `withdrawals` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `withdrawalId` VARCHAR(64) NOT NULL UNIQUE,
  `userId` INT NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `payoutMethod` ENUM('upi', 'bank_transfer') NOT NULL DEFAULT 'upi',
  `payoutDetails` VARCHAR(255) NOT NULL,
  `status` ENUM('pending', 'approved', 'rejected', 'processing', 'completed') NOT NULL DEFAULT 'pending',
  `adminRemarks` TEXT NULL,
  `verifiedBy` INT NULL,
  `verifiedAt` DATETIME NULL,
  `transactionId` INT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_withdrawals_userId` (`userId`),
  KEY `idx_withdrawals_status` (`status`),
  CONSTRAINT `fk_withdrawals_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_withdrawals_verifiedBy` FOREIGN KEY (`verifiedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_withdrawals_transactionId` FOREIGN KEY (`transactionId`) REFERENCES `transactions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 26. Table: legal_policies
-- -------------------------------------------------------------
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

-- -------------------------------------------------------------
-- 27. Table: support_contacts
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `support_contacts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `phone` VARCHAR(30) NOT NULL DEFAULT '+91 98765 43210',
  `email` VARCHAR(100) NOT NULL DEFAULT 'support@knowchamp.com',
  `address` VARCHAR(255) NOT NULL DEFAULT 'KnowChamp HQ, Tech Park, Bangalore, India',
  `workingHours` VARCHAR(100) NOT NULL DEFAULT 'Mon - Sat: 9:00 AM - 7:00 PM',
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 28. Table: system_settings
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `system_settings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `key` VARCHAR(100) NOT NULL UNIQUE,
  `value` LONGTEXT NOT NULL,
  `category` VARCHAR(50) NOT NULL DEFAULT 'general',
  `description` VARCHAR(255) NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_system_settings_key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 29. Table: notifications
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NULL,
  `targetRole` ENUM('all', 'admin', 'user') NOT NULL DEFAULT 'admin',
  `type` VARCHAR(50) NOT NULL DEFAULT 'system',
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `isRead` TINYINT(1) NOT NULL DEFAULT 0,
  `data` JSON NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_notifications_user` (`userId`, `targetRole`, `isRead`),
  CONSTRAINT `fk_notifications_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


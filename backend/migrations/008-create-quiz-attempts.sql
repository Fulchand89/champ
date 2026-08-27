CREATE DATABASE IF NOT EXISTS `quiz_app` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `quiz_app`;

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

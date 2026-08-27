CREATE DATABASE IF NOT EXISTS `quiz_app` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `quiz_app`;

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

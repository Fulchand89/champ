CREATE DATABASE IF NOT EXISTS `quiz_app` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `quiz_app`;

-- -------------------------------------------------------------
-- Ensure questions table has subjectId, topicId, and isActive
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `questions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `categoryId` INT NOT NULL,
  `subjectId` INT NULL,
  `topicId` INT NULL,
  `questionText` TEXT NOT NULL,
  `questionType` ENUM('single_choice', 'multiple_choice', 'true_false') DEFAULT 'single_choice',
  `difficulty` ENUM('easy', 'medium', 'hard') DEFAULT 'easy',
  `points` INT DEFAULT 1,
  `negativePoints` DECIMAL(5,2) DEFAULT 0.00,
  `explanation` TEXT NULL,
  `isActive` TINYINT(1) DEFAULT 1,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  CONSTRAINT `fk_questions_categoryId` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_questions_subjectId` FOREIGN KEY (`subjectId`) REFERENCES `subjects` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_questions_topicId` FOREIGN KEY (`topicId`) REFERENCES `topics` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- Ensure question_options table exists
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

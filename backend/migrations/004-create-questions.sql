CREATE DATABASE IF NOT EXISTS `quiz_app` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `quiz_app`;

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

CREATE DATABASE IF NOT EXISTS `quiz_app` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `quiz_app`;

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

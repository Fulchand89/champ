CREATE DATABASE IF NOT EXISTS `quiz_app` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `quiz_app`;

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

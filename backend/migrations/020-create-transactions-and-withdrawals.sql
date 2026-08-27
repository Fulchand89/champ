-- Migration: Create transactions and withdrawals tables

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

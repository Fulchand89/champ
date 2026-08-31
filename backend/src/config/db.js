const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');
const mysql2 = require('mysql2');
const env = require('./env');
const logger = require('./logger');
const MESSAGES = require('../shared/constants/messages');

const dbName = process.env.DB_NAME || env.db.database || 'quiz_app';
const dbUser = process.env.DB_USER || env.db.user || 'root';
const dbPassword = process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : env.db.password;
const dbHost = process.env.DB_HOST || env.db.host || '127.0.0.1';
const dbPort = Number(process.env.DB_PORT || env.db.port || 3306);

const sequelize = new Sequelize(
  dbName,
  dbUser,
  dbPassword,
  {
    host: dbHost,
    port: dbPort,
    dialect: 'mysql',
    dialectModule: mysql2,
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 60000,
      idle: 10000,
    },
    dialectOptions: {
      connectTimeout: 60000,
      decimalNumbers: true,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
    },
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    },
    retry: {
      max: 3,
      match: [
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/,
        /SequelizeHostNotReachableError/,
        /SequelizeInvalidConnectionError/,
        /SequelizeConnectionTimedOutError/,
        /TimeoutError/,
        /PROTOCOL_CONNECTION_LOST/,
        /ECONNRESET/,
        /ECONNREFUSED/,
        /ETIMEDOUT/,
        /EHOSTUNREACH/,
      ],
    },
  }
);

// Helper to ensure MySQL database exists before connecting (safe for both local XAMPP & shared hosting)
const ensureDatabase = async (port) => {
  try {
    const connection = await mysql.createConnection({
      host: env.db.host,
      port: port,
      user: env.db.user,
      password: env.db.password,
      database: env.db.database,
      connectTimeout: 5000,
    });
    await connection.end();
  } catch (err) {
    logger.debug('Database connection check note:', err.message);
  }
};

const connectDB = async (retries = 5, delay = 2000) => {
  let attempt = 0;
  const candidatePorts = [resolvedPort];
  if (resolvedPort !== 3306) candidatePorts.push(3306);

  while (attempt < retries) {
    attempt++;
    for (const port of candidatePorts) {
      try {
        logger.info(`Attempting database connection to MySQL on port ${port} (Attempt ${attempt}/${retries})...`);
        await ensureDatabase(port);

        if (port !== activePort) {
          activePort = port;
          sequelize = createSequelizeInstance(port);
        }

        await sequelize.authenticate();
        logger.info(`${MESSAGES.DB_CONNECTED} on port ${port}`);

        // Ensure database models & essential tables
        try {
          const { Category, Subject, Topic, Contest, Feature, FAQ, FeeTier, PrizePoolTemplate, ContestParticipant, Question, QuestionOption, Transaction, Withdrawal, User } = require('../database');
          await Category.sync({ alter: false });
          await Subject.sync({ alter: false });
          await Topic.sync({ alter: false });
          await Contest.sync({ alter: false });
          await Feature.sync({ alter: false });
          await FAQ.sync({ alter: false });
          await FeeTier.sync({ alter: false });
          await PrizePoolTemplate.sync({ alter: false });
          await ContestParticipant.sync({ alter: false });
          await Question.sync({ alter: false });
          await QuestionOption.sync({ alter: false });
          await Transaction.sync({ alter: false });
          await Withdrawal.sync({ alter: false });

          // Ensure missing columns exist in contests table
          try {
            const [columns] = await sequelize.query("SHOW COLUMNS FROM `contests`");
            const colNames = columns.map(c => c.Field);

            if (!colNames.includes('subjectId')) {
              await sequelize.query("ALTER TABLE `contests` ADD COLUMN `subjectId` INT NULL");
            }
            if (!colNames.includes('topicId')) {
              await sequelize.query("ALTER TABLE `contests` ADD COLUMN `topicId` INT NULL");
            }
            if (!colNames.includes('status')) {
              await sequelize.query("ALTER TABLE `contests` ADD COLUMN `status` ENUM('draft', 'scheduled', 'upcoming', 'live', 'completed', 'cancelled') DEFAULT 'scheduled'");
            }
            if (!colNames.includes('entryCoins')) {
              await sequelize.query("ALTER TABLE `contests` ADD COLUMN `entryCoins` INT DEFAULT 0");
            }
            if (!colNames.includes('platformCut')) {
              await sequelize.query("ALTER TABLE `contests` ADD COLUMN `platformCut` DECIMAL(5,2) DEFAULT 10.00");
            }
            if (!colNames.includes('numQuestions')) {
              await sequelize.query("ALTER TABLE `contests` ADD COLUMN `numQuestions` INT DEFAULT 10");
            }
            if (!colNames.includes('image')) {
              await sequelize.query("ALTER TABLE `contests` ADD COLUMN `image` VARCHAR(255) NULL");
            }
            if (!colNames.includes('prizeDistribution')) {
              await sequelize.query("ALTER TABLE `contests` ADD COLUMN `prizeDistribution` JSON NULL");
            }

            // Ensure missing columns exist in categories table
            try {
              const [catCols] = await sequelize.query("SHOW COLUMNS FROM `categories`");
              const catColNames = catCols.map(c => c.Field);
              if (!catColNames.includes('image')) {
                await sequelize.query("ALTER TABLE `categories` ADD COLUMN `image` VARCHAR(255) NULL");
              }
            } catch (catErr) {
              logger.warn('Category image column check notice:', catErr.message);
            }

            // Ensure missing columns exist in contest_participants table
            const [partColumns] = await sequelize.query("SHOW COLUMNS FROM `contest_participants`");
            const partColNames = partColumns.map(c => c.Field);

            if (!partColNames.includes('score')) {
              await sequelize.query("ALTER TABLE `contest_participants` ADD COLUMN `score` DECIMAL(10,2) DEFAULT 0.00");
            }
            if (!partColNames.includes('rank')) {
              await sequelize.query("ALTER TABLE `contest_participants` ADD COLUMN `rank` INT NULL");
            }
            if (!partColNames.includes('status')) {
              await sequelize.query("ALTER TABLE `contest_participants` ADD COLUMN `status` ENUM('registered', 'joined', 'completed', 'abandoned', 'disqualified') DEFAULT 'registered'");
            }
            if (!partColNames.includes('registeredAt')) {
              await sequelize.query("ALTER TABLE `contest_participants` ADD COLUMN `registeredAt` DATETIME NULL");
            }
            if (!partColNames.includes('joinedAt')) {
              await sequelize.query("ALTER TABLE `contest_participants` ADD COLUMN `joinedAt` DATETIME NULL");
            }
            if (!partColNames.includes('completedAt')) {
              await sequelize.query("ALTER TABLE `contest_participants` ADD COLUMN `completedAt` DATETIME NULL");
            }
            if (!partColNames.includes('questionsAttempted')) {
              await sequelize.query("ALTER TABLE `contest_participants` ADD COLUMN `questionsAttempted` INT DEFAULT 0");
            }

            // Ensure missing columns exist in questions table
            const [qColumns] = await sequelize.query("SHOW COLUMNS FROM `questions`");
            const qColNames = qColumns.map(c => c.Field);

            if (!qColNames.includes('subjectId')) {
              await sequelize.query("ALTER TABLE `questions` ADD COLUMN `subjectId` INT NULL");
            }
            if (!qColNames.includes('topicId')) {
              await sequelize.query("ALTER TABLE `questions` ADD COLUMN `topicId` INT NULL");
            }
            if (!qColNames.includes('isActive')) {
              await sequelize.query("ALTER TABLE `questions` ADD COLUMN `isActive` TINYINT(1) DEFAULT 1");
            }

            // Ensure missing columns exist in faqs table
            try {
              const [faqColumns] = await sequelize.query("SHOW COLUMNS FROM `faqs`");
              const faqColNames = faqColumns.map(c => c.Field);
              if (!faqColNames.includes('isActive')) {
                await sequelize.query("ALTER TABLE `faqs` ADD COLUMN `isActive` TINYINT(1) DEFAULT 1");
              }
              if (!faqColNames.includes('contestId')) {
                await sequelize.query("ALTER TABLE `faqs` ADD COLUMN `contestId` INT NULL");
              }
              if (!faqColNames.includes('displayOrder')) {
                await sequelize.query("ALTER TABLE `faqs` ADD COLUMN `displayOrder` INT DEFAULT 0");
              }
            } catch (faqColErr) {
              logger.warn('FAQ column auto-migration notice:', faqColErr.message);
            }
          } catch (colErr) {
            logger.warn('Column auto-migration notice:', colErr.message);
          }

          // Seed default categories if table is empty
          const catCount = await Category.count();
          if (catCount === 0) {
            logger.info('Categories table is empty. Seeding default categories...');
            await Category.bulkCreate([
              { name: 'General Knowledge', slug: 'general-knowledge', icon: '📚', colorClass: 'hover:border-red-500/50 hover:shadow-[0_0_20px_rgba(239,68,68,0.25)]', isActive: true },
              { name: 'Science & Technology', slug: 'science-technology', icon: '🔬', colorClass: 'hover:border-teal-400/50 hover:shadow-[0_0_20px_rgba(45,212,191,0.25)]', isActive: true },
              { name: 'Mathematics & Logic', slug: 'mathematics-logic', icon: '🧮', colorClass: 'hover:border-blue-400/50 hover:shadow-[0_0_20px_rgba(96,165,250,0.25)]', isActive: true },
              { name: 'History & Culture', slug: 'history-culture', icon: '📜', colorClass: 'hover:border-amber-600/50 hover:shadow-[0_0_20px_rgba(217,119,6,0.25)]', isActive: true },
              { name: 'Sports & Entertainment', slug: 'sports-entertainment', icon: '⚽', colorClass: 'hover:border-orange-400/50 hover:shadow-[0_0_20px_rgba(251,146,60,0.25)]', isActive: true },
              { name: 'Current Affairs', slug: 'current-affairs', icon: '📰', colorClass: 'hover:border-purple-400/50 hover:shadow-[0_0_20px_rgba(192,132,252,0.25)]', isActive: true }
            ]);
            logger.info('Default categories seeded successfully.');
          }

          // Seed default subjects if empty
          const subCount = await Subject.count();
          if (subCount === 0) {
            const allCats = await Category.findAll();
            const catMap = {};
            allCats.forEach(c => { catMap[c.slug || c.name] = c.id; });
            const gkId = catMap['general-knowledge'] || allCats[0]?.id || 1;
            const sciId = catMap['science-technology'] || allCats[1]?.id || gkId;
            const mathId = catMap['mathematics-logic'] || allCats[2]?.id || gkId;
            const histId = catMap['history-culture'] || allCats[3]?.id || gkId;

            await Subject.bulkCreate([
              { name: 'World Geography', categoryId: gkId, description: 'Capitals, continents, maps and landmarks', isActive: true },
              { name: 'Current Events', categoryId: gkId, description: 'National and global daily events', isActive: true },
              { name: 'Physics & Astronomy', categoryId: sciId, description: 'Space, motion, thermodynamics, mechanics', isActive: true },
              { name: 'Chemistry & Biology', categoryId: sciId, description: 'Elements, organic reactions, human anatomy', isActive: true },
              { name: 'Algebra & Geometry', categoryId: mathId, description: 'Formulas, equations, shapes and proofs', isActive: true },
              { name: 'Indian History', categoryId: histId, description: 'Ancient, medieval and modern Indian milestones', isActive: true },
            ]);
            logger.info('Default subjects seeded successfully.');
          }

          // Seed default topics if empty
          const topicCount = await Topic.count();
          if (topicCount === 0) {
            const allSubs = await Subject.findAll();
            const sub1 = allSubs[0]?.id || 1;
            const sub2 = allSubs[1]?.id || sub1;
            const sub3 = allSubs[2]?.id || sub1;

            await Topic.bulkCreate([
              { name: 'European Capitals', subjectId: sub1, description: 'Major cities and administrative capitals', isActive: true },
              { name: 'Mountain Ranges & Rivers', subjectId: sub1, description: 'Topographical features of the world', isActive: true },
              { name: 'Thermodynamics', subjectId: sub3, description: 'Heat, energy, and laws of thermodynamics', isActive: true },
              { name: 'Periodic Table Elements', subjectId: sub2, description: 'Atomic numbers, groups, and chemical traits', isActive: true },
            ]);
            logger.info('Default topics seeded successfully.');
          }

          // Seed default fee tiers if empty
          const feeCount = await FeeTier.count();
          if (feeCount === 0) {
            await FeeTier.bulkCreate([
              { tierCode: 'FEE001', tierName: 'Free Practice', entryFee: 0, entryCoins: 0, platformCut: '0%', status: 'Active' },
              { tierCode: 'FEE002', tierName: 'Bronze Tier', entryFee: 10, entryCoins: 10, platformCut: '10%', status: 'Active' },
              { tierCode: 'FEE003', tierName: 'Silver Tier', entryFee: 25, entryCoins: 25, platformCut: '10%', status: 'Active' },
              { tierCode: 'FEE004', tierName: 'Gold Tier', entryFee: 50, entryCoins: 50, platformCut: '12%', status: 'Active' },
              { tierCode: 'FEE005', tierName: 'Diamond Tier', entryFee: 100, entryCoins: 100, platformCut: '15%', status: 'Active' },
              { tierCode: 'FEE006', tierName: 'Grand Masters', entryFee: 500, entryCoins: 500, platformCut: '20%', status: 'Active' },
            ]);
            logger.info('Default fee tiers seeded successfully.');
          }

          // Seed default prize templates if empty
          const prizeCount = await PrizePoolTemplate.count();
          if (prizeCount === 0) {
            await PrizePoolTemplate.bulkCreate([
              { poolCode: 'POOL001', name: 'Winner Takes All', distribution: 'Rank 1: 100%', minParticipants: 2, platformFee: '10%', payoutStructure: [{ rank: 1, percentage: 100 }], status: 'Active' },
              { poolCode: 'POOL002', name: 'Top 3 Split (50-30-20)', distribution: 'Rank 1: 50%, Rank 2: 30%, Rank 3: 20%', minParticipants: 5, platformFee: '10%', payoutStructure: [{ rank: 1, percentage: 50 }, { rank: 2, percentage: 30 }, { rank: 3, percentage: 20 }], status: 'Active' },
              { poolCode: 'POOL003', name: 'Top 10% Winners', distribution: 'Proportional distribution to top 10% scorers', minParticipants: 50, platformFee: '12%', payoutStructure: [{ rank: 1, percentage: 40 }, { rank: 2, percentage: 25 }, { rank: 3, percentage: 15 }, { rank: 4, percentage: 10 }, { rank: 5, percentage: 10 }], status: 'Active' },
              { poolCode: 'POOL004', name: 'Double Or Nothing', distribution: 'Top 50% double their entry fee', minParticipants: 10, platformFee: '15%', payoutStructure: [{ rank: 1, percentage: 50 }, { rank: 2, percentage: 50 }], status: 'Active' },
              { poolCode: 'POOL005', name: 'Graduated Scale (Top 5)', distribution: '1st: 40%, 2nd: 25%, 3rd: 15%, 4th: 12%, 5th: 8%', minParticipants: 10, platformFee: '12%', payoutStructure: [{ rank: 1, percentage: 40 }, { rank: 2, percentage: 25 }, { rank: 3, percentage: 15 }, { rank: 4, percentage: 12 }, { rank: 5, percentage: 8 }], status: 'Active' },
            ]);
            logger.info('Default prize pool templates seeded successfully.');
          }

          // Seed default transactions if empty
          const txnCount = await Transaction.count();
          if (txnCount === 0) {
            const firstUser = await User.findOne();
            const uId = firstUser ? firstUser.id : null;
            await Transaction.bulkCreate([
              { txnId: 'TXN100245', userId: uId, type: 'entry_fee', amount: 50.00, paymentMethod: 'UPI - Google Pay', paymentGateway: 'Razorpay', status: 'successful', description: 'Contest Entry Fee #1' },
              { txnId: 'TXN100244', userId: uId, type: 'coins_pack', amount: 100.00, paymentMethod: 'Credit Card', paymentGateway: 'Razorpay', status: 'successful', description: 'Gold 100 Coins Pack Purchase' },
              { txnId: 'TXN100243', userId: uId, type: 'withdrawal', amount: 500.00, paymentMethod: 'Bank Transfer', paymentGateway: 'Direct Bank', status: 'pending', description: 'User payout request to bank' },
              { txnId: 'TXN100242', userId: uId, type: 'entry_fee', amount: 10.00, paymentMethod: 'Wallet Coins', paymentGateway: 'Internal Wallet', status: 'successful', description: 'Speed Quiz participation' },
              { txnId: 'TXN100241', userId: uId, type: 'entry_fee', amount: 100.00, paymentMethod: 'UPI - Paytm', paymentGateway: 'Razorpay', status: 'failed', description: 'Payment timed out from bank' },
              { txnId: 'TXN100240', userId: uId, type: 'prize_payout', amount: 1500.00, paymentMethod: 'Wallet Coins', paymentGateway: 'Internal Wallet', status: 'successful', description: 'Rank 1 Prize Winner Mega GK' },
            ]);
            logger.info('Default transactions seeded successfully.');
          }

          // Seed default withdrawals if empty
          const withCount = await Withdrawal.count();
          if (withCount === 0) {
            const firstUser = await User.findOne();
            const uId = firstUser ? firstUser.id : 1;
            await Withdrawal.bulkCreate([
              { withdrawalId: 'WTH001', userId: uId, amount: 1500.00, payoutMethod: 'upi', payoutDetails: 'UPI: aarav@okaxis', status: 'pending', adminRemarks: 'Pending KYC check' },
              { withdrawalId: 'WTH002', userId: uId, amount: 5000.00, payoutMethod: 'bank_transfer', payoutDetails: 'Bank: HDFC A/C ...9843 (IFSC: HDFC0001234)', status: 'pending', adminRemarks: 'High value prize withdrawal' },
              { withdrawalId: 'WTH003', userId: uId, amount: 800.00, payoutMethod: 'upi', payoutDetails: 'UPI: isha@okicici', status: 'approved', adminRemarks: 'Instant UPI transfer processed' },
              { withdrawalId: 'WTH004', userId: uId, amount: 2500.00, payoutMethod: 'upi', payoutDetails: 'UPI: neha@paytm', status: 'rejected', adminRemarks: 'Invalid UPI ID details provided' },
            ]);
            logger.info('Default withdrawals seeded successfully.');
          }

          // Seed default FAQs if empty
          const faqCount = await FAQ.count();
          if (faqCount === 0) {
            await FAQ.bulkCreate([
              {
                question: "How do I join a quiz contest?",
                answer: "Simply create an account, verify your mobile number, add funds to your wallet (if required), and click 'Start Contest' for any live quiz to begin.",
                displayOrder: 1,
                isActive: true
              },
              {
                question: "Is KnowChamp free to use?",
                answer: "We offer both free practice contests and paid cash contests. You can choose to join free contests to hone your skills before playing paid ones.",
                displayOrder: 2,
                isActive: true
              },
              {
                question: "How are winners selected?",
                answer: "Winners are selected based on the number of correct answers and the speed of response. The leaderboard displays the ranks in real-time.",
                displayOrder: 3,
                isActive: true
              },
              {
                question: "How can I add money to my wallet?",
                answer: "You can easily add money using secure UPI, Credit/Debit cards, Net Banking, or popular digital wallets inside the app's wallet section.",
                displayOrder: 4,
                isActive: true
              },
              {
                question: "When will I receive my winnings?",
                answer: "Winnings are credited to your KnowChamp wallet immediately after the contest results are verified, which usually takes a few minutes. You can withdraw instantly.",
                displayOrder: 5,
                isActive: true
              },
              {
                question: "Can I participate in multiple contests?",
                answer: "Yes, you can participate in as many active contests as you want, provided you meet the entry fee requirements.",
                displayOrder: 6,
                isActive: true
              },
              {
                question: "Is my personal information safe?",
                answer: "Absolutely. We use industry-standard encryption protocols and security measures to ensure your personal and payment data is 100% secure.",
                displayOrder: 7,
                isActive: true
              },
              {
                question: "What happens if my internet connection is interrupted?",
                answer: "If you get disconnected, the timer for your current question keeps running. We recommend playing with a stable internet connection to avoid losing points.",
                displayOrder: 8,
                isActive: true
              },
              {
                question: "Can I change my answers during the quiz?",
                answer: "No, once an answer is submitted or the timer for the question expires, it cannot be changed.",
                displayOrder: 9,
                isActive: true
              }
            ]);
            logger.info('Default FAQs seeded successfully.');
          }
        } catch (syncErr) {
          logger.warn('Schema auto-sync warning (non-fatal):', syncErr.message);
        }

        return;
      } catch (err) {
        logger.warn(`Connection attempt failed on port ${port}: ${err.message}`);
      }
    }

    if (attempt < retries) {
      logger.info(`Waiting ${delay / 1000}s before retrying database connection...`);
      await new Promise((res) => setTimeout(res, delay));
    }
  }

  const finalError = new Error(`Could not connect to MySQL database on ports [${candidatePorts.join(', ')}] after ${retries} attempts. Please ensure XAMPP / MySQL service is started.`);
  logger.error(MESSAGES.DB_CONNECTION_FAILED, finalError);
  throw finalError;
};

module.exports = { sequelize, connectDB };


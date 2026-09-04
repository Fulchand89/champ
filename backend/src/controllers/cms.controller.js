const fs = require('fs');
const path = require('path');
const asyncHandler = require('../shared/utils/asyncHandler');
const { getIO } = require('../config/socket');
const { sequelize } = require('../config/db');

const cmsFilePath = path.join(__dirname, '../database/cms.json');

// In-memory cache for fast response & instant cache invalidation
let inMemoryCmsCache = {};

// Helper to ensure MySQL database table exists
let dbTableInitialized = false;
const ensureCmsTableExists = async () => {
  if (dbTableInitialized || !sequelize) return;
  try {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS \`cms_contents\` (
        \`key\` VARCHAR(100) PRIMARY KEY,
        \`content\` LONGTEXT NOT NULL,
        \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    dbTableInitialized = true;
  } catch (err) {
    console.warn('CMS database table creation warning:', err.message);
  }
};

// Helper to read JSON file fallback
const readCmsJsonFile = () => {
  try {
    if (!fs.existsSync(cmsFilePath)) return {};
    const content = fs.readFileSync(cmsFilePath, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading cms.json file:', err);
    return {};
  }
};

// Helper to fetch section data from MySQL DB or JSON fallback
const getCmsSectionData = async (sectionKey) => {
  // Check in-memory cache first if populated
  if (inMemoryCmsCache[sectionKey]) {
    return inMemoryCmsCache[sectionKey];
  }

  await ensureCmsTableExists();

  if (sequelize && dbTableInitialized) {
    try {
      const [rows] = await sequelize.query(
        'SELECT content FROM cms_contents WHERE `key` = :key LIMIT 1',
        { replacements: { key: sectionKey } }
      );
      if (rows && rows.length > 0 && rows[0].content) {
        const parsed = JSON.parse(rows[0].content);
        inMemoryCmsCache[sectionKey] = parsed;
        return parsed;
      }
    } catch (err) {
      console.warn(`Error querying cms_contents DB for key '${sectionKey}':`, err.message);
    }
  }

  // Fallback to cms.json file
  const jsonFile = readCmsJsonFile();
  const fallbackData = jsonFile[sectionKey] || null;
  if (fallbackData) {
    inMemoryCmsCache[sectionKey] = fallbackData;
    // Auto-seed data into MySQL DB asynchronously
    if (sequelize && dbTableInitialized) {
      sequelize.query(
        'INSERT INTO cms_contents (`key`, `content`, `createdAt`, `updatedAt`) VALUES (:key, :content, NOW(), NOW()) ON DUPLICATE KEY UPDATE `content` = :content, `updatedAt` = NOW()',
        { replacements: { key: sectionKey, content: JSON.stringify(fallbackData) } }
      ).catch(() => { });
    }
  }
  return fallbackData;
};

// Helper to save section data to MySQL DB & JSON Backup
const saveCmsSectionData = async (sectionKey, data) => {
  // Invalidate & update in-memory cache immediately
  inMemoryCmsCache[sectionKey] = data;

  await ensureCmsTableExists();

  // Save to MySQL Database
  if (sequelize) {
    try {
      await sequelize.query(
        'INSERT INTO cms_contents (`key`, `content`, `createdAt`, `updatedAt`) VALUES (:key, :content, NOW(), NOW()) ON DUPLICATE KEY UPDATE `content` = :content, `updatedAt` = NOW()',
        { replacements: { key: sectionKey, content: JSON.stringify(data) } }
      );
    } catch (err) {
      console.error(`Error saving cms_contents to DB for key '${sectionKey}':`, err.message);
    }
  }

  // Update cms.json file backup
  try {
    const fileData = readCmsJsonFile();
    fileData[sectionKey] = data;
    fs.writeFileSync(cmsFilePath, JSON.stringify(fileData, null, 2), 'utf8');
  } catch (err) {
    console.warn('CMS file backup update note:', err.message);
  }

  return true;
};

// ═══════════════════════════════════════════════════════════════════
// 1. LEADERBOARD CMS CONTROLLERS
// ═══════════════════════════════════════════════════════════════════

const getLeaderboardCms = asyncHandler(async (req, res) => {
  const leaderboardData = (await getCmsSectionData('leaderboard')) || {
    hero: { title: 'Leaderboard', subtitle: 'Track top earners and compare your scores with other global players.' },
    leaders: [],
  };

  res.status(200).json({
    success: true,
    data: leaderboardData,
  });
});

const updateLeaderboardCms = asyncHandler(async (req, res) => {
  const { hero, leaders } = req.body || {};
  const existing = (await getCmsSectionData('leaderboard')) || {};

  const leaderboardData = {
    hero: hero || existing.hero || { title: 'Leaderboard', subtitle: '' },
    leaders: Array.isArray(leaders) ? leaders : (existing.leaders || []),
  };

  await saveCmsSectionData('leaderboard', leaderboardData);

  // Broadcast real-time Socket notification
  try {
    const io = getIO();
    if (io && typeof io.emit === 'function') {
      io.emit('cms_leaderboard_updated', leaderboardData);
    }
  } catch (e) { }

  res.status(200).json({
    success: true,
    message: 'Leaderboard content saved and updated successfully',
    data: leaderboardData,
  });
});

// ═══════════════════════════════════════════════════════════════════
// 2. EXCELLENCE LEAGUE CMS CONTROLLERS
// ═══════════════════════════════════════════════════════════════════

const getExcellenceLeagueCms = asyncHandler(async (req, res) => {
  const excellenceData = (await getCmsSectionData('excellenceLeague')) || {
    hero: { title: 'Excellence League', subtitle: 'Compete in live timed quiz battles, climb tier rankings, and win weekly championship rewards.' },
    tiers: [],
    leaders: [],
    rules: [],
  };

  res.status(200).json({
    success: true,
    data: excellenceData,
  });
});

const updateExcellenceLeagueCms = asyncHandler(async (req, res) => {
  const { hero, tiers, leaders, rules } = req.body || {};
  const existing = (await getCmsSectionData('excellenceLeague')) || {};

  const excellenceData = {
    hero: hero || existing.hero || { title: 'Excellence League', subtitle: '' },
    tiers: Array.isArray(tiers) ? tiers : (existing.tiers || []),
    leaders: Array.isArray(leaders) ? leaders : (existing.leaders || []),
    rules: Array.isArray(rules) ? rules : (existing.rules || []),
  };

  await saveCmsSectionData('excellenceLeague', excellenceData);

  // Broadcast real-time Socket notification
  try {
    const io = getIO();
    if (io && typeof io.emit === 'function') {
      io.emit('cms_excellence_league_updated', excellenceData);
    }
  } catch (e) { }

  res.status(200).json({
    success: true,
    message: 'Excellence League content saved and updated successfully',
    data: excellenceData,
  });
});

// ═══════════════════════════════════════════════════════════════════
// 3. HOW IT WORKS CMS CONTROLLERS
// ═══════════════════════════════════════════════════════════════════

const defaultHowItWorks = {
  hero: {
    title: 'How It',
    titleHighlight: 'Works',
    subtitle: 'Getting started is quick and easy. Follow these simple steps to learn, play, and win cash prizes daily.',
  },
  steps: [
    { id: 1, stepNumber: '01', icon: 'Download', title: 'Download & Install', description: 'Download the official KnowChamp App from our website and install it on your device.', displayOrder: 1 },
    { id: 2, stepNumber: '02', icon: 'UserCheck', title: 'Create Account', description: 'Register in seconds using your mobile number and verify via a secure OTP.', displayOrder: 2 },
    { id: 3, stepNumber: '03', icon: 'Wallet', title: 'Add Wallet Money', description: 'Deposit funds using secure payment gateways (UPI, cards, wallets) to join cash contests.', displayOrder: 3 },
    { id: 4, stepNumber: '04', icon: 'PlayCircle', title: 'Play Live Quizzes', description: 'Join active contests, answer multiple-choice questions accurately, and score points.', displayOrder: 4 },
    { id: 5, stepNumber: '05', icon: 'Trophy', title: 'Win & Withdraw', description: 'Rank high on the leaderboard, earn cash prizes, and withdraw instantly to your bank account.', displayOrder: 5 },
  ],
  callout: {
    title: 'Rules & Fair Play Guidelines',
    description: 'We employ state-of-the-art anti-cheat detection, quick results calculation, and multi-signature security protocols to ensure that all contests are completely clean, secure, and 100% fair.',
    bulletPoints: ['No emulator support', 'Single device account', 'Automated anti-bot detection', '24/7 support desk'],
    ctaText: 'Start Playing Now',
    ctaLink: '/contests',
  },
};

const getHowItWorksCms = asyncHandler(async (req, res) => {
  const howItWorksData = (await getCmsSectionData('howItWorks')) || defaultHowItWorks;

  res.status(200).json({
    success: true,
    data: howItWorksData,
  });
});

const updateHowItWorksCms = asyncHandler(async (req, res) => {
  const { hero, steps, callout } = req.body || {};
  const existing = (await getCmsSectionData('howItWorks')) || {};

  const howItWorksData = {
    hero: hero || existing.hero || defaultHowItWorks.hero,
    steps: Array.isArray(steps)
      ? steps.map((s, idx) => ({
          ...s,
          id: s.id || idx + 1,
          displayOrder: Number(s.displayOrder) || idx + 1,
        }))
      : (existing.steps || defaultHowItWorks.steps),
    callout: callout || existing.callout || defaultHowItWorks.callout,
  };

  await saveCmsSectionData('howItWorks', howItWorksData);

  // Broadcast real-time Socket notification
  try {
    const io = getIO();
    if (io && typeof io.emit === 'function') {
      io.emit('cms_how_it_works_updated', howItWorksData);
    }
  } catch (e) { }

  res.status(200).json({
    success: true,
    message: 'How It Works content saved and updated successfully',
    data: howItWorksData,
  });
});

module.exports = {
  getLeaderboardCms,
  updateLeaderboardCms,
  getExcellenceLeagueCms,
  updateExcellenceLeagueCms,
  getHowItWorksCms,
  updateHowItWorksCms,
};


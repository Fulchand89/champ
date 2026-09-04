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
      ).catch(() => {});
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
  } catch (e) {}

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
  } catch (e) {}

  res.status(200).json({
    success: true,
    message: 'Excellence League content saved and updated successfully',
    data: excellenceData,
  });
});

module.exports = {
  getLeaderboardCms,
  updateLeaderboardCms,
  getExcellenceLeagueCms,
  updateExcellenceLeagueCms,
};

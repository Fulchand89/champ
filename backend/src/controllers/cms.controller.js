const fs = require('fs');
const path = require('path');
const asyncHandler = require('../shared/utils/asyncHandler');
const { getIO } = require('../config/socket');

const cmsFilePath = path.join(__dirname, '../database/cms.json');

// Global in-memory cache so Admin Panel updates stick instantly in server memory
let memoryCmsStore = null;

// Helper to read JSON safely
const readCmsData = () => {
  if (memoryCmsStore) {
    return memoryCmsStore;
  }
  try {
    if (!fs.existsSync(cmsFilePath)) {
      return {};
    }
    const content = fs.readFileSync(cmsFilePath, 'utf8');
    memoryCmsStore = JSON.parse(content);
    return memoryCmsStore;
  } catch (err) {
    console.error('Error reading cms.json:', err);
    return {};
  }
};

// Helper to write JSON safely
const writeCmsData = (data) => {
  memoryCmsStore = data;
  try {
    fs.writeFileSync(cmsFilePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing cms.json:', err);
    return true; // Keep in-memory store active even if disk write fails
  }
};

// ═══════════════════════════════════════════════════════════════════
// 1. LEADERBOARD CMS CONTROLLERS (Strictly Admin Managed)
// ═══════════════════════════════════════════════════════════════════

const getLeaderboardCms = asyncHandler(async (req, res) => {
  const cmsData = readCmsData();
  const leaderboardData = cmsData.leaderboard || {
    hero: { title: 'Leaderboard', subtitle: 'Track top earners and compare your scores with other global players.' },
    leaders: [],
  };

  res.status(200).json({
    success: true,
    data: leaderboardData,
  });
});

const updateLeaderboardCms = asyncHandler(async (req, res) => {
  const { hero, leaders } = req.body;
  const cmsData = readCmsData();

  cmsData.leaderboard = {
    hero: hero || cmsData.leaderboard?.hero || { title: 'Leaderboard', subtitle: '' },
    leaders: Array.isArray(leaders) ? leaders : (cmsData.leaderboard?.leaders || []),
  };

  writeCmsData(cmsData);

  // Socket notification for real-time updates
  try {
    const io = getIO();
    if (io) {
      io.emit('cms_leaderboard_updated', cmsData.leaderboard);
    }
  } catch (e) {
    // Ignore socket error if not connected
  }

  res.status(200).json({
    success: true,
    message: 'Leaderboard CMS content updated successfully',
    data: cmsData.leaderboard,
  });
});

// ═══════════════════════════════════════════════════════════════════
// 2. EXCELLENCE LEAGUE CMS CONTROLLERS (Strictly Admin Managed)
// ═══════════════════════════════════════════════════════════════════

const getExcellenceLeagueCms = asyncHandler(async (req, res) => {
  const cmsData = readCmsData();
  const excellenceData = cmsData.excellenceLeague || {
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
  const { hero, tiers, leaders, rules } = req.body;
  const cmsData = readCmsData();

  cmsData.excellenceLeague = {
    hero: hero || cmsData.excellenceLeague?.hero || { title: 'Excellence League', subtitle: '' },
    tiers: Array.isArray(tiers) ? tiers : (cmsData.excellenceLeague?.tiers || []),
    leaders: Array.isArray(leaders) ? leaders : (cmsData.excellenceLeague?.leaders || []),
    rules: Array.isArray(rules) ? rules : (cmsData.excellenceLeague?.rules || []),
  };

  writeCmsData(cmsData);

  // Socket notification for real-time updates
  try {
    const io = getIO();
    if (io) {
      io.emit('cms_excellence_league_updated', cmsData.excellenceLeague);
    }
  } catch (e) {
    // Ignore socket error if not connected
  }

  res.status(200).json({
    success: true,
    message: 'Excellence League CMS content updated successfully',
    data: cmsData.excellenceLeague,
  });
});

module.exports = {
  getLeaderboardCms,
  updateLeaderboardCms,
  getExcellenceLeagueCms,
  updateExcellenceLeagueCms,
};

const fs = require('fs');
const path = require('path');
const asyncHandler = require('../shared/utils/asyncHandler');
const { getIO } = require('../config/socket');
const { sequelize } = require('../config/db');

const cmsFilePath = path.join(__dirname, '../database/cms.json');

// Helper to read JSON safely
const readCmsData = () => {
  try {
    if (!fs.existsSync(cmsFilePath)) {
      return {};
    }
    const content = fs.readFileSync(cmsFilePath, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading cms.json:', err);
    return {};
  }
};

// Helper to write JSON safely
const writeCmsData = (data) => {
  try {
    fs.writeFileSync(cmsFilePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing cms.json:', err);
    return false;
  }
};

// ═══════════════════════════════════════════════════════════════════
// HELPER: DYNAMIC LEADERBOARD FROM MYSQL DATABASE
// ═══════════════════════════════════════════════════════════════════

const getDynamicDatabaseLeaderboard = async () => {
  try {
    if (!sequelize) return null;

    const [rows] = await sequelize.query(`
      SELECT 
        u.id,
        u.name,
        COALESCE(u.profilePicUrl, '') AS image,
        COALESCE(u.city, 'Delhi') AS city,
        COALESCE(SUM(cp.score), 0) AS totalScore,
        COALESCE(COUNT(DISTINCT cp.id), 0) AS contestsPlayed,
        COALESCE(
          (
            SELECT c.title 
            FROM contest_participants cp2 
            JOIN contests c ON cp2.contestId = c.id 
            WHERE cp2.userId = u.id 
            ORDER BY cp2.createdAt DESC LIMIT 1
          ),
          'Grand Champions League'
        ) AS lastContestName,
        COALESCE(
          (
            SELECT SUM(t.amount)
            FROM transactions t
            WHERE t.userId = u.id AND (t.type IN ('winning', 'credit', 'reward') OR t.amount > 0)
          ),
          0
        ) AS totalWinnings
      FROM users u
      LEFT JOIN contest_participants cp ON u.id = cp.userId
      WHERE u.role = 'user' OR u.role IS NULL OR u.role = 'USER'
      GROUP BY u.id, u.name, u.profilePicUrl, u.city
      ORDER BY totalWinnings DESC, totalScore DESC, contestsPlayed DESC, u.id ASC
      LIMIT 100
    `);

    if (rows && rows.length > 0) {
      return rows.map((r, index) => {
        const scoreVal = Number(r.totalScore || 0);
        const winningsVal = Number(r.totalWinnings || 0);
        const calculatedPoints = scoreVal > 0 ? Math.round(scoreVal * 10) : (rows.length - index) * 1500;
        
        let tier = 'Challenger Tier';
        if (calculatedPoints > 4000) tier = 'Excellence Legend';
        else if (calculatedPoints > 2500) tier = 'Grand Champions';
        else if (calculatedPoints > 1200) tier = 'Pro Masters';

        const finalAmount = winningsVal > 0 ? winningsVal : (rows.length - index) * 20000 + 15000;

        return {
          id: r.id,
          rank: index + 1,
          name: r.name || `Player #${r.id}`,
          contest: r.lastContestName || 'Grand Champions League',
          amount: finalAmount,
          score: scoreVal,
          points: `${calculatedPoints.toLocaleString()} PTS`,
          tier: tier,
          city: r.city || 'Delhi',
          image: r.image || '',
        };
      });
    }
  } catch (err) {
    console.warn('Unable to query database for live leaderboard:', err.message);
  }
  return null;
};

// ═══════════════════════════════════════════════════════════════════
// 1. LEADERBOARD CMS CONTROLLERS
// ═══════════════════════════════════════════════════════════════════

const getLeaderboardCms = asyncHandler(async (req, res) => {
  const cmsData = readCmsData();
  const dbLeaders = await getDynamicDatabaseLeaderboard();

  const leaders = (dbLeaders && dbLeaders.length > 0) ? dbLeaders : (cmsData.leaderboard?.leaders || []);

  const leaderboardData = {
    hero: cmsData.leaderboard?.hero || { title: 'Leaderboard', subtitle: 'Track top earners and compare your scores with other global players.' },
    leaders: leaders,
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

  const success = writeCmsData(cmsData);
  if (!success) {
    return res.status(500).json({ success: false, message: 'Failed to update Leaderboard CMS data' });
  }

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
// 2. EXCELLENCE LEAGUE CMS CONTROLLERS
// ═══════════════════════════════════════════════════════════════════

const getExcellenceLeagueCms = asyncHandler(async (req, res) => {
  const cmsData = readCmsData();
  const dbLeaders = await getDynamicDatabaseLeaderboard();

  const leaders = (dbLeaders && dbLeaders.length > 0) ? dbLeaders : (cmsData.excellenceLeague?.leaders || []);

  const excellenceData = {
    hero: cmsData.excellenceLeague?.hero || { title: 'Excellence League', subtitle: 'Compete in live timed quiz battles, climb tier rankings, and win weekly championship rewards.' },
    tiers: cmsData.excellenceLeague?.tiers || [],
    leaders: leaders,
    rules: cmsData.excellenceLeague?.rules || [],
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

  const success = writeCmsData(cmsData);
  if (!success) {
    return res.status(500).json({ success: false, message: 'Failed to update Excellence League CMS data' });
  }

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

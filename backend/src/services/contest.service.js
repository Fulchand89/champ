const { Op } = require('sequelize');
const { 
  Contest, 
  Category, 
  Subject, 
  Topic, 
  FeeTier, 
  PrizePoolTemplate, 
  ContestParticipant, 
  User 
} = require('../database');

/**
 * Computes dynamic contest status based on current time & settings
 */
const computeContestStatus = (contest) => {
  if (!contest.isActive || contest.status === 'cancelled') {
    return 'cancelled';
  }
  if (contest.status === 'draft') {
    return 'draft';
  }

  const now = new Date();
  const start = new Date(contest.startTime);
  const end = new Date(contest.endTime);

  if (now > end) {
    return 'completed';
  }
  if (now >= start && now <= end) {
    return 'live';
  }
  
  // Starting within 30 minutes -> upcoming, else scheduled
  const diffMinutes = (start - now) / (1000 * 60);
  if (diffMinutes <= 30) {
    return 'upcoming';
  }
  return 'scheduled';
};

class ContestService {
  // ── 1. Contest CRUD ──

  async listContests(query = {}) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 20;
    const offset = (page - 1) * limit;

    const whereClause = {};

    if (query.search) {
      whereClause.title = { [Op.like]: `%${query.search.trim()}%` };
    }

    if (query.categoryId) {
      whereClause.categoryId = parseInt(query.categoryId, 10);
    }

    if (query.isActive !== undefined) {
      whereClause.isActive = query.isActive === 'true' || query.isActive === true;
    }

    const { count, rows } = await Contest.findAndCountAll({
      where: whereClause,
      order: [['startTime', 'DESC'], ['id', 'DESC']],
      limit,
      offset,
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug', 'image', 'icon', 'colorClass'] },
        { model: Subject, as: 'subject', attributes: ['id', 'name'] },
        { model: Topic, as: 'topic', attributes: ['id', 'name'] }
      ]
    });

    const mapped = rows.map((cnt) => {
      const data = cnt.toJSON();
      data.computedStatus = computeContestStatus(cnt);
      return data;
    });

    // Filter by computed status if requested
    let resultRows = mapped;
    if (query.status && query.status !== 'all') {
      resultRows = mapped.filter((c) => c.computedStatus.toLowerCase() === query.status.toLowerCase());
    }

    return {
      success: true,
      data: resultRows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit) || 1,
      }
    };
  }

  async getContestById(id) {
    const contest = await Contest.findByPk(id, {
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug', 'image', 'icon', 'colorClass'], required: false },
        { model: Subject, as: 'subject', attributes: ['id', 'name'], required: false },
        { model: Topic, as: 'topic', attributes: ['id', 'name'], required: false },
        { 
          model: ContestParticipant, 
          as: 'participants', 
          required: false,
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'profilePicUrl'], required: false }] 
        }
      ]
    });
    if (!contest) return null;
    const json = contest.toJSON();
    json.computedStatus = computeContestStatus(contest);
    return json;
  }

  async createContest(data) {
    const startTime = data.startTime ? new Date(data.startTime) : new Date();
    const duration = data.durationMinutes ? parseInt(data.durationMinutes, 10) : 15;
    const endTime = data.endTime ? new Date(data.endTime) : new Date(startTime.getTime() + duration * 60000);

    let categoryId = data.categoryId ? parseInt(data.categoryId, 10) : null;
    let subjectId = data.subjectId ? parseInt(data.subjectId, 10) : null;
    let topicId = data.topicId ? parseInt(data.topicId, 10) : null;

    if (categoryId) {
      const catExists = await Category.findByPk(categoryId);
      if (!catExists) {
        const firstCat = await Category.findOne({ order: [['id', 'ASC']] });
        categoryId = firstCat ? firstCat.id : null;
      }
    } else {
      const firstCat = await Category.findOne({ order: [['id', 'ASC']] });
      categoryId = firstCat ? firstCat.id : null;
    }

    if (subjectId) {
      const subExists = await Subject.findByPk(subjectId);
      if (!subExists) subjectId = null;
    }

    if (topicId) {
      const topExists = await Topic.findByPk(topicId);
      if (!topExists) topicId = null;
    }

    const contest = await Contest.create({
      title: data.title ? data.title.trim() : 'New Contest',
      description: data.description || '',
      categoryId,
      subjectId,
      topicId,
      status: data.status || 'scheduled',
      startTime,
      endTime,
      entryFee: data.entryFee !== undefined ? parseFloat(data.entryFee) : 0,
      entryCoins: data.entryCoins !== undefined ? parseInt(data.entryCoins, 10) : (data.entryFee ? Math.round(parseFloat(data.entryFee)) : 0),
      platformCut: data.platformCut !== undefined ? parseFloat(data.platformCut) : 10.0,
      prizePool: data.prizePool !== undefined ? parseFloat(data.prizePool) : 0,
      maxParticipants: data.maxParticipants !== undefined ? parseInt(data.maxParticipants, 10) : 100,
      minParticipants: data.minParticipants !== undefined ? parseInt(data.minParticipants, 10) : 2,
      durationMinutes: duration,
      durationPerQuestion: data.durationPerQuestion !== undefined ? parseInt(data.durationPerQuestion, 10) : 15,
      image: data.image || null,
      numQuestions: data.numQuestions !== undefined ? parseInt(data.numQuestions, 10) : 10,
      prizeDistribution: data.prizeDistribution || null,
      isActive: data.isActive !== undefined ? (data.isActive === 'true' || data.isActive === true) : true,
    });

    return this.getContestById(contest.id);
  }

  async updateContest(id, data) {
    const contest = await Contest.findByPk(id);
    if (!contest) return null;

    const updates = {};
    if (data.title !== undefined) updates.title = data.title.trim();
    if (data.description !== undefined) updates.description = data.description;
    if (data.image !== undefined) updates.image = data.image;
    
    if (data.categoryId !== undefined) {
      let categoryId = data.categoryId ? parseInt(data.categoryId, 10) : null;
      if (categoryId) {
        const catExists = await Category.findByPk(categoryId);
        if (!catExists) {
          const firstCat = await Category.findOne({ order: [['id', 'ASC']] });
          categoryId = firstCat ? firstCat.id : null;
        }
      }
      updates.categoryId = categoryId;
    }

    if (data.subjectId !== undefined) {
      let subjectId = data.subjectId ? parseInt(data.subjectId, 10) : null;
      if (subjectId) {
        const subExists = await Subject.findByPk(subjectId);
        if (!subExists) subjectId = null;
      }
      updates.subjectId = subjectId;
    }

    if (data.topicId !== undefined) {
      let topicId = data.topicId ? parseInt(data.topicId, 10) : null;
      if (topicId) {
        const topExists = await Topic.findByPk(topicId);
        if (!topExists) topicId = null;
      }
      updates.topicId = topicId;
    }

    if (data.status !== undefined) updates.status = data.status;
    if (data.startTime !== undefined) updates.startTime = new Date(data.startTime);
    if (data.endTime !== undefined) updates.endTime = new Date(data.endTime);
    if (data.entryFee !== undefined) updates.entryFee = parseFloat(data.entryFee);
    if (data.entryCoins !== undefined) updates.entryCoins = parseInt(data.entryCoins, 10);
    if (data.platformCut !== undefined) updates.platformCut = parseFloat(data.platformCut);
    if (data.prizePool !== undefined) updates.prizePool = parseFloat(data.prizePool);
    if (data.maxParticipants !== undefined) updates.maxParticipants = parseInt(data.maxParticipants, 10);
    if (data.minParticipants !== undefined) updates.minParticipants = parseInt(data.minParticipants, 10);
    if (data.durationMinutes !== undefined) updates.durationMinutes = parseInt(data.durationMinutes, 10);
    if (data.durationPerQuestion !== undefined) updates.durationPerQuestion = parseInt(data.durationPerQuestion, 10);
    if (data.numQuestions !== undefined) updates.numQuestions = parseInt(data.numQuestions, 10);
    if (data.prizeDistribution !== undefined) updates.prizeDistribution = data.prizeDistribution;
    if (data.isActive !== undefined) updates.isActive = data.isActive === 'true' || data.isActive === true;

    await contest.update(updates);
    return this.getContestById(id);
  }

  async deleteContest(id) {
    const contest = await Contest.findByPk(id);
    if (!contest) return false;

    // Delete associated image if local
    if (contest.image && typeof contest.image === 'string' && contest.image.startsWith('/uploads/')) {
      const fs = require('fs');
      const path = require('path');
      const fullPath = path.join(__dirname, '..', contest.image.replace(/^\//, ''));
      if (fs.existsSync(fullPath)) {
        try { fs.unlinkSync(fullPath); } catch (e) {}
      }
    }

    await contest.destroy();
    return true;
  }

  // ── 2. Schedule Management ──

  async getScheduledContests() {
    const contests = await Contest.findAll({
      order: [['startTime', 'ASC']],
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
        { model: Subject, as: 'subject', attributes: ['id', 'name'] },
      ]
    });
    return contests.map((c) => {
      const json = c.toJSON();
      json.computedStatus = computeContestStatus(c);
      return json;
    });
  }

  async getContestSchedule(id) {
    const contest = await Contest.findByPk(id, {
      attributes: ['id', 'title', 'startTime', 'endTime', 'durationMinutes', 'status', 'isActive']
    });
    if (!contest) return null;
    const json = contest.toJSON();
    json.computedStatus = computeContestStatus(contest);
    return json;
  }

  async updateContestSchedule(id, data) {
    const contest = await Contest.findByPk(id);
    if (!contest) return null;

    const startTime = data.startTime ? new Date(data.startTime) : contest.startTime;
    const duration = data.durationMinutes ? parseInt(data.durationMinutes, 10) : contest.durationMinutes;
    const endTime = data.endTime ? new Date(data.endTime) : new Date(startTime.getTime() + duration * 60000);

    await contest.update({
      startTime,
      endTime,
      durationMinutes: duration,
      status: data.status || contest.status,
      isActive: data.isActive !== undefined ? (data.isActive === 'true' || data.isActive === true) : contest.isActive,
    });

    return this.getContestSchedule(id);
  }

  async cancelContestSchedule(id) {
    const contest = await Contest.findByPk(id);
    if (!contest) return null;
    await contest.update({
      status: 'cancelled',
      isActive: false,
    });
    return { id, status: 'cancelled', isActive: false };
  }

  // ── 3. Entry Fee Configuration ──

  async getContestEntryFee(id) {
    const contest = await Contest.findByPk(id, {
      attributes: ['id', 'title', 'entryFee', 'entryCoins', 'platformCut', 'maxParticipants', 'isActive']
    });
    if (!contest) return null;
    return contest;
  }

  async updateContestEntryFee(id, data) {
    const contest = await Contest.findByPk(id);
    if (!contest) return null;

    const entryFee = data.entryFee !== undefined ? parseFloat(data.entryFee) : contest.entryFee;
    const entryCoins = data.entryCoins !== undefined ? parseInt(data.entryCoins, 10) : Math.round(entryFee);
    const platformCut = data.platformCut !== undefined ? parseFloat(data.platformCut) : contest.platformCut;
    const maxParticipants = data.maxParticipants !== undefined ? parseInt(data.maxParticipants, 10) : contest.maxParticipants;

    await contest.update({
      entryFee,
      entryCoins,
      platformCut,
      maxParticipants,
    });

    return this.getContestEntryFee(id);
  }

  async listFeeTiers() {
    return FeeTier.findAll({
      order: [['entryFee', 'ASC'], ['id', 'ASC']]
    });
  }

  async createFeeTier(data) {
    const count = await FeeTier.count();
    const tierCode = data.tierCode || `FEE${String(count + 1).padStart(3, '0')}`;
    return FeeTier.create({
      tierCode,
      tierName: data.tierName.trim(),
      entryFee: data.entryFee !== undefined ? parseFloat(data.entryFee) : 0,
      entryCoins: data.entryCoins !== undefined ? parseInt(data.entryCoins, 10) : 0,
      platformCut: data.platformCut || '10%',
      status: data.status || 'Active',
    });
  }

  async updateFeeTier(id, data) {
    const tier = await FeeTier.findByPk(id);
    if (!tier) return null;
    await tier.update(data);
    return tier;
  }

  async deleteFeeTier(id) {
    const tier = await FeeTier.findByPk(id);
    if (!tier) return false;
    await tier.destroy();
    return true;
  }

  // ── 4. Prize Pool Configuration ──

  async getContestPrizePool(id) {
    const contest = await Contest.findByPk(id, {
      attributes: ['id', 'title', 'prizePool', 'prizeDistribution', 'minParticipants', 'maxParticipants', 'platformCut']
    });
    return contest;
  }

  async updateContestPrizePool(id, data) {
    const contest = await Contest.findByPk(id);
    if (!contest) return null;

    const updates = {};
    if (data.prizePool !== undefined) updates.prizePool = parseFloat(data.prizePool);
    if (data.prizeDistribution !== undefined) updates.prizeDistribution = data.prizeDistribution;
    if (data.minParticipants !== undefined) updates.minParticipants = parseInt(data.minParticipants, 10);
    if (data.platformCut !== undefined) updates.platformCut = parseFloat(data.platformCut);

    await contest.update(updates);
    return this.getContestPrizePool(id);
  }

  async deleteContestPrizePool(id) {
    const contest = await Contest.findByPk(id);
    if (!contest) return null;
    await contest.update({ prizeDistribution: null });
    return { success: true, message: 'Prize pool distribution removed' };
  }

  async listPrizeTemplates() {
    return PrizePoolTemplate.findAll({
      order: [['id', 'ASC']]
    });
  }

  async createPrizeTemplate(data) {
    const count = await PrizePoolTemplate.count();
    const poolCode = data.poolCode || `POOL${String(count + 1).padStart(3, '0')}`;
    return PrizePoolTemplate.create({
      poolCode,
      name: data.name.trim(),
      distribution: data.distribution || 'Standard split',
      minParticipants: data.minParticipants !== undefined ? parseInt(data.minParticipants, 10) : 2,
      platformFee: data.platformFee || '10%',
      payoutStructure: data.payoutStructure || null,
      status: data.status || 'Active',
    });
  }

  async updatePrizeTemplate(id, data) {
    const template = await PrizePoolTemplate.findByPk(id);
    if (!template) return null;
    await template.update(data);
    return template;
  }

  async deletePrizeTemplate(id) {
    const template = await PrizePoolTemplate.findByPk(id);
    if (!template) return false;
    await template.destroy();
    return true;
  }

  // ── 5. Live Contest Supervision ──

  async getLiveContests() {
    const now = new Date();
    // Fetch live or upcoming active contests
    const contests = await Contest.findAll({
      where: {
        isActive: true,
      },
      order: [['startTime', 'ASC']],
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
        { 
          model: ContestParticipant, 
          as: 'participants', 
          attributes: ['id', 'userId', 'status', 'score', 'questionsAttempted'] 
        }
      ]
    });

    return contests.map((c) => {
      const end = new Date(c.endTime);
      const start = new Date(c.startTime);
      const diffSecs = Math.max(0, Math.floor((end - now) / 1000));
      const mins = Math.floor(diffSecs / 60);
      const secs = diffSecs % 60;
      const timeRemaining = diffSecs > 0 ? `${mins} mins ${secs} secs` : 'Ended';

      const participantCount = c.participants?.length || 0;
      const activeCount = c.participants?.filter(p => p.status === 'joined' || p.status === 'registered').length || 0;

      return {
        id: `CNT${String(c.id).padStart(3, '0')}`,
        rawId: c.id,
        title: c.title,
        category: c.category?.name || 'General Knowledge',
        entryFee: c.entryFee > 0 ? `₹${parseFloat(c.entryFee)}` : 'Free',
        prizePool: `₹${parseFloat(c.prizePool).toLocaleString()}`,
        participants: `${participantCount}/${c.maxParticipants || 100}`,
        activeParticipants: activeCount,
        timeRemaining,
        status: computeContestStatus(c),
        startTime: c.startTime,
        endTime: c.endTime,
      };
    });
  }

  async getContestParticipants(contestId) {
    return ContestParticipant.findAll({
      where: { contestId },
      order: [['score', 'DESC'], ['id', 'ASC']],
      include: [
        { model: User, as: 'user', attributes: ['id', 'uuid', 'name', 'email', 'profilePicUrl', 'city'] }
      ]
    });
  }

  async getContestResults(contestId) {
    const participants = await ContestParticipant.findAll({
      where: { contestId },
      order: [['score', 'DESC'], ['id', 'ASC']],
      include: [
        { model: User, as: 'user', attributes: ['id', 'uuid', 'name', 'email', 'profilePicUrl'] }
      ]
    });

    const contest = await Contest.findByPk(contestId);
    const prizeDist = contest?.prizeDistribution || [];

    return participants.map((p, idx) => {
      const rank = idx + 1;
      const prizeMatch = Array.isArray(prizeDist) ? prizeDist.find(pr => pr.rank === rank) : null;
      return {
        rank,
        userId: p.userId,
        name: p.user?.name || `Participant ${p.userId}`,
        email: p.user?.email || '',
        score: p.score,
        questionsAttempted: p.questionsAttempted,
        prizeAmount: prizeMatch ? (prizeMatch.prizeAmount || `${prizeMatch.percentage}%`) : '0',
        status: p.status
      };
    });
  }

  async getContestStatistics(contestId) {
    const contest = await Contest.findByPk(contestId);
    if (!contest) return null;

    const participants = await ContestParticipant.findAll({ where: { contestId } });
    const totalParticipants = participants.length;
    const completedCount = participants.filter(p => p.status === 'completed').length;
    const totalScore = participants.reduce((sum, p) => sum + parseFloat(p.score || 0), 0);
    const avgScore = totalParticipants > 0 ? (totalScore / totalParticipants).toFixed(2) : 0;
    const completionRate = totalParticipants > 0 ? Math.round((completedCount / totalParticipants) * 100) : 0;

    return {
      contestId,
      title: contest.title,
      totalParticipants,
      completedParticipants: completedCount,
      completionRate: `${completionRate}%`,
      averageScore: avgScore,
      totalPrizePool: contest.prizePool,
      numQuestions: contest.numQuestions,
      status: computeContestStatus(contest)
    };
  }

  // ── 6. Subject & Topic Management ──

  async listSubjects(query = {}) {
    const where = {};
    if (query.categoryId) where.categoryId = parseInt(query.categoryId, 10);
    if (query.search) where.name = { [Op.like]: `%${query.search.trim()}%` };

    return Subject.findAll({
      where,
      order: [['id', 'ASC']],
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
        { model: Topic, as: 'topics', attributes: ['id', 'name'] }
      ]
    });
  }

  async createSubject(data) {
    return Subject.create({
      name: data.name.trim(),
      categoryId: parseInt(data.categoryId, 10),
      description: data.description || '',
      isActive: data.isActive !== undefined ? (data.isActive === 'true' || data.isActive === true) : true,
    });
  }

  async updateSubject(id, data) {
    const subject = await Subject.findByPk(id);
    if (!subject) return null;
    await subject.update(data);
    return subject;
  }

  async deleteSubject(id) {
    const subject = await Subject.findByPk(id);
    if (!subject) return false;
    await subject.destroy();
    return true;
  }

  async listTopics(query = {}) {
    const where = {};
    if (query.subjectId) where.subjectId = parseInt(query.subjectId, 10);
    if (query.search) where.name = { [Op.like]: `%${query.search.trim()}%` };

    return Topic.findAll({
      where,
      order: [['id', 'ASC']],
      include: [
        { 
          model: Subject, 
          as: 'subject', 
          attributes: ['id', 'name', 'categoryId'],
          include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }]
        }
      ]
    });
  }

  async createTopic(data) {
    return Topic.create({
      name: data.name.trim(),
      subjectId: parseInt(data.subjectId, 10),
      description: data.description || '',
      isActive: data.isActive !== undefined ? (data.isActive === 'true' || data.isActive === true) : true,
    });
  }

  async updateTopic(id, data) {
    const topic = await Topic.findByPk(id);
    if (!topic) return null;
    await topic.update(data);
    return topic;
  }

  async deleteTopic(id) {
    const topic = await Topic.findByPk(id);
    if (!topic) return false;
    await topic.destroy();
    return true;
  }
}

module.exports = new ContestService();

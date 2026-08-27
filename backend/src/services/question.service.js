const { Op } = require('sequelize');
const { Question, QuestionOption, Category, Subject, Topic } = require('../database');
const fs = require('fs');

class QuestionService {
  async listQuestions(query = {}) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 20;
    const offset = (page - 1) * limit;

    const where = {};

    if (query.search && query.search.trim()) {
      where.questionText = { [Op.like]: `%${query.search.trim()}%` };
    }

    if (query.categoryId && query.categoryId !== 'all') {
      where.categoryId = parseInt(query.categoryId, 10);
    }

    if (query.subjectId && query.subjectId !== 'all') {
      where.subjectId = parseInt(query.subjectId, 10);
    }

    if (query.topicId && query.topicId !== 'all') {
      where.topicId = parseInt(query.topicId, 10);
    }

    if (query.difficulty && query.difficulty !== 'all') {
      where.difficulty = query.difficulty.toLowerCase();
    }

    if (query.isActive !== undefined && query.isActive !== 'all') {
      where.isActive = query.isActive === 'true' || query.isActive === true;
    }

    const { rows, count } = await Question.findAndCountAll({
      where,
      limit,
      offset,
      order: [['id', 'DESC']],
      distinct: true,
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'], required: false },
        { model: Subject, as: 'subject', attributes: ['id', 'name'], required: false },
        { model: Topic, as: 'topic', attributes: ['id', 'name'], required: false },
        { model: QuestionOption, as: 'options', required: false },
      ],
    });

    return {
      success: true,
      data: rows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit) || 1,
      },
    };
  }

  async getQuestionById(id) {
    const question = await Question.findByPk(id, {
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'], required: false },
        { model: Subject, as: 'subject', attributes: ['id', 'name'], required: false },
        { model: Topic, as: 'topic', attributes: ['id', 'name'], required: false },
        { model: QuestionOption, as: 'options', required: false },
      ],
    });
    return question;
  }

  async createQuestion(data) {
    let categoryId = data.categoryId ? parseInt(data.categoryId, 10) : null;
    let subjectId = data.subjectId ? parseInt(data.subjectId, 10) : null;
    let topicId = data.topicId ? parseInt(data.topicId, 10) : null;

    if (categoryId) {
      const catExists = await Category.findByPk(categoryId);
      if (!catExists) {
        const defaultCat = await Category.findOne({ order: [['id', 'ASC']] });
        categoryId = defaultCat ? defaultCat.id : 1;
      }
    } else {
      const defaultCat = await Category.findOne({ order: [['id', 'ASC']] });
      categoryId = defaultCat ? defaultCat.id : 1;
    }

    if (subjectId) {
      const subExists = await Subject.findByPk(subjectId);
      if (!subExists) subjectId = null;
    }

    if (topicId) {
      const topExists = await Topic.findByPk(topicId);
      if (!topExists) topicId = null;
    }

    const question = await Question.create({
      categoryId,
      subjectId,
      topicId,
      questionText: (data.questionText || data.question || '').trim(),
      questionType: data.questionType || 'single_choice',
      difficulty: (data.difficulty || 'easy').toLowerCase(),
      points: data.points !== undefined ? parseInt(data.points, 10) : 1,
      negativePoints: data.negativePoints !== undefined ? parseFloat(data.negativePoints) : 0.00,
      explanation: data.explanation || '',
      isActive: data.isActive !== undefined ? (data.isActive === 'true' || data.isActive === true) : true,
    });

    // Create Options
    let optionsToCreate = [];
    if (Array.isArray(data.options) && data.options.length > 0) {
      optionsToCreate = data.options.map((opt) => ({
        questionId: question.id,
        optionText: (opt.optionText || opt.text || '').trim(),
        isCorrect: opt.isCorrect === true || opt.isCorrect === 'true' || opt.isCorrect === 1,
      }));
    } else if (data.option_a || data.optionA) {
      const correct = (data.correctOption || data.correct_option || 'A').toUpperCase();
      const rawOptions = [
        { key: 'A', text: data.option_a || data.optionA },
        { key: 'B', text: data.option_b || data.optionB },
        { key: 'C', text: data.option_c || data.optionC },
        { key: 'D', text: data.option_d || data.optionD },
      ];
      optionsToCreate = rawOptions
        .filter((o) => o.text && o.text.trim())
        .map((o) => ({
          questionId: question.id,
          optionText: o.text.trim(),
          isCorrect: correct === o.key || correct === o.text.trim(),
        }));
    }

    if (optionsToCreate.length > 0) {
      await QuestionOption.bulkCreate(optionsToCreate);
    }

    return this.getQuestionById(question.id);
  }

  async updateQuestion(id, data) {
    const question = await Question.findByPk(id);
    if (!question) return null;

    const updates = {};
    if (data.questionText !== undefined || data.question !== undefined) {
      updates.questionText = (data.questionText || data.question).trim();
    }
    if (data.categoryId !== undefined) {
      let categoryId = data.categoryId ? parseInt(data.categoryId, 10) : null;
      if (categoryId) {
        const catExists = await Category.findByPk(categoryId);
        if (!catExists) {
          const defaultCat = await Category.findOne({ order: [['id', 'ASC']] });
          categoryId = defaultCat ? defaultCat.id : null;
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
    if (data.questionType !== undefined) updates.questionType = data.questionType;
    if (data.difficulty !== undefined) updates.difficulty = data.difficulty.toLowerCase();
    if (data.points !== undefined) updates.points = parseInt(data.points, 10);
    if (data.negativePoints !== undefined) updates.negativePoints = parseFloat(data.negativePoints);
    if (data.explanation !== undefined) updates.explanation = data.explanation;
    if (data.isActive !== undefined) updates.isActive = data.isActive === 'true' || data.isActive === true;

    await question.update(updates);

    // Update options if provided
    if (Array.isArray(data.options)) {
      await QuestionOption.destroy({ where: { questionId: id } });
      const newOpts = data.options.map((opt) => ({
        questionId: id,
        optionText: (opt.optionText || opt.text || '').trim(),
        isCorrect: opt.isCorrect === true || opt.isCorrect === 'true' || opt.isCorrect === 1,
      }));
      if (newOpts.length > 0) {
        await QuestionOption.bulkCreate(newOpts);
      }
    } else if (data.option_a || data.optionA) {
      await QuestionOption.destroy({ where: { questionId: id } });
      const correct = (data.correctOption || data.correct_option || 'A').toUpperCase();
      const rawOptions = [
        { key: 'A', text: data.option_a || data.optionA },
        { key: 'B', text: data.option_b || data.optionB },
        { key: 'C', text: data.option_c || data.optionC },
        { key: 'D', text: data.option_d || data.optionD },
      ];
      const newOpts = rawOptions
        .filter((o) => o.text && o.text.trim())
        .map((o) => ({
          questionId: id,
          optionText: o.text.trim(),
          isCorrect: correct === o.key || correct === o.text.trim(),
        }));
      if (newOpts.length > 0) {
        await QuestionOption.bulkCreate(newOpts);
      }
    }

    return this.getQuestionById(id);
  }

  async deleteQuestion(id) {
    const question = await Question.findByPk(id);
    if (!question) return false;
    await QuestionOption.destroy({ where: { questionId: id } });
    await question.destroy();
    return true;
  }

  // Parse CSV Line Helper (supports quoted CSV fields)
  parseCsvLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim().replace(/^["']|["']$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim().replace(/^["']|["']$/g, ''));
    return result;
  }

  async bulkUploadQuestions(fileOrContent, defaultMeta = {}) {
    let rawText = '';
    if (typeof fileOrContent === 'string') {
      rawText = fileOrContent;
    } else if (fileOrContent?.path && fs.existsSync(fileOrContent.path)) {
      rawText = fs.readFileSync(fileOrContent.path, 'utf-8');
    } else if (fileOrContent?.buffer) {
      rawText = fileOrContent.buffer.toString('utf-8');
    }

    if (!rawText || !rawText.trim()) {
      throw new Error('CSV file content is empty');
    }

    const lines = rawText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) {
      throw new Error('CSV must contain at least header row and one question row');
    }

    const header = this.parseCsvLine(lines[0]).map((h) => h.toLowerCase().trim().replace(/[\s_-]+/g, ''));

    let importedCount = 0;
    const errors = [];

    // Fallback category
    let categoryId = defaultMeta.categoryId ? parseInt(defaultMeta.categoryId, 10) : null;
    let subjectId = defaultMeta.subjectId ? parseInt(defaultMeta.subjectId, 10) : null;
    let topicId = defaultMeta.topicId ? parseInt(defaultMeta.topicId, 10) : null;

    if (categoryId) {
      const cat = await Category.findByPk(categoryId);
      if (!cat) {
        const def = await Category.findOne({ order: [['id', 'ASC']] });
        categoryId = def ? def.id : 1;
      }
    } else {
      const def = await Category.findOne({ order: [['id', 'ASC']] });
      categoryId = def ? def.id : 1;
    }

    for (let i = 1; i < lines.length; i++) {
      const cols = this.parseCsvLine(lines[i]);
      if (cols.length < 4 || !cols[0]) continue;

      const rowObj = {};
      header.forEach((h, idx) => {
        rowObj[h] = cols[idx] || '';
      });

      const questionText = rowObj['question'] || rowObj['questiontext'] || cols[0];
      const optA = rowObj['optiona'] || cols[1] || '';
      const optB = rowObj['optionb'] || cols[2] || '';
      const optC = rowObj['optionc'] || cols[3] || '';
      const optD = rowObj['optiond'] || cols[4] || '';
      const correct = (rowObj['correctoption'] || rowObj['correctanswer'] || cols[5] || 'A').toUpperCase();
      const diff = (rowObj['difficulty'] || cols[6] || 'easy').toLowerCase();
      const explanation = rowObj['explanation'] || cols[7] || '';

      if (!questionText || !optA || !optB) {
        errors.push(`Row ${i + 1}: Missing question text or minimum 2 options`);
        continue;
      }

      try {
        const q = await Question.create({
          categoryId,
          subjectId,
          topicId,
          questionText: questionText.trim(),
          questionType: 'single_choice',
          difficulty: ['easy', 'medium', 'hard'].includes(diff) ? diff : 'easy',
          points: 1,
          negativePoints: 0.00,
          explanation: explanation.trim(),
          isActive: true,
        });

        const options = [
          { text: optA, key: 'A' },
          { text: optB, key: 'B' },
          { text: optC, key: 'C' },
          { text: optD, key: 'D' },
        ]
          .filter((o) => o.text && o.text.trim())
          .map((o) => ({
            questionId: q.id,
            optionText: o.text.trim(),
            isCorrect: correct === o.key || correct === o.text.trim(),
          }));

        if (options.length > 0) {
          await QuestionOption.bulkCreate(options);
        }

        importedCount++;
      } catch (err) {
        errors.push(`Row ${i + 1}: ${err.message}`);
      }
    }

    return {
      success: true,
      importedCount,
      totalRows: lines.length - 1,
      errors,
    };
  }

  getSampleCsvTemplate() {
    const csvContent =
      `question,option_a,option_b,option_c,option_d,correct_option,difficulty,explanation\n` +
      `"What is the SI unit of power?","Joule","Watt","Newton","Pascal","B","easy","Watt is the SI unit of power equal to one joule per second."\n` +
      `"Which element has atomic number 1?","Helium","Hydrogen","Lithium","Oxygen","B","easy","Hydrogen is the lightest element with atomic number 1."\n` +
      `"Who built the Taj Mahal?","Akbar","Babur","Shah Jahan","Humayun","C","medium","Commissioned in 1631 by Mughal emperor Shah Jahan."\n` +
      `"What is the capital of France?","Berlin","Madrid","Paris","Rome","C","easy","Paris is the capital and largest city of France."\n`;
    return csvContent;
  }
}

module.exports = new QuestionService();

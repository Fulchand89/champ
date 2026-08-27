const { sequelize, User, Feature, Category, Contest } = require('./index');

const syncAndSeed = async () => {
  try {
    console.log('Syncing database...');
    // Temporarily disable foreign key checks to allow force sync without constraint errors
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await sequelize.sync({ force: true });
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Database synced successfully.');

    // 0. Seed Admin Users
    console.log('Seeding initial Admin Users...');
    await User.bulkCreate([
      {
        name: 'Admin User',
        email: 'admin@gmail.com',
        password: 'admin123',
        role: 'admin',
        isActive: true,
        isVerified: 'approved',
      },
      {
        name: 'Super Admin',
        email: 'admin@quizapp.com',
        password: 'admin123',
        role: 'super_admin',
        isActive: true,
        isVerified: 'approved',
      },
    ], { individualHooks: true });
    console.log('Admin Users seeded.');

    // 1. Seed Features
    console.log('Seeding initial Features...');
    await Feature.bulkCreate([
      {
        title: 'Fair & Transparent',
        description: 'Our platform is 100% fair. We follow the perfect rules of the game for accurate results. Our platform is completely trustworthy for players.',
        iconName: 'ShieldCheck',
        isActive: true,
      },
      {
        title: 'Exciting Rewards',
        description: 'Win real cash prizes, badges, and unlock exclusive rewards based on your skills.',
        iconName: 'Gift',
        isActive: true,
      },
      {
        title: 'Learn & Grow',
        description: 'Improve your general knowledge and subject expertise with daily quiz challenges.',
        iconName: 'BookOpen',
        isActive: true,
      },
      {
        title: 'Secure & Trusted',
        description: 'Your data, wallet funds, and transactions are completely secure and private.',
        iconName: 'Lock',
        isActive: true,
      },
    ]);
    console.log('Features seeded.');

    // 2. Seed Categories (Original Admin + Public Categories)
    console.log('Seeding initial Categories...');
    const createdCategories = await Category.bulkCreate([
      { name: 'General Knowledge', slug: 'general-knowledge', description: 'General Knowledge quizzes', icon: '📚', colorClass: 'hover:border-red-500/50 hover:shadow-[0_0_20px_rgba(239,68,68,0.25)]', isActive: true },
      { name: 'Science & Technology', slug: 'science-technology', description: 'Science & Technology quizzes', icon: '🔬', colorClass: 'hover:border-teal-400/50 hover:shadow-[0_0_20px_rgba(45,212,191,0.25)]', isActive: true },
      { name: 'Mathematics & Logic', slug: 'mathematics-logic', description: 'Mathematics & Logic quizzes', icon: '🧮', colorClass: 'hover:border-blue-400/50 hover:shadow-[0_0_20px_rgba(96,165,250,0.25)]', isActive: true },
      { name: 'History & Culture', slug: 'history-culture', description: 'History & Culture quizzes', icon: '📜', colorClass: 'hover:border-amber-600/50 hover:shadow-[0_0_20px_rgba(217,119,6,0.25)]', isActive: true },
      { name: 'Sports & Entertainment', slug: 'sports-entertainment', description: 'Sports & Entertainment quizzes', icon: '⚽', colorClass: 'hover:border-orange-400/50 hover:shadow-[0_0_20px_rgba(251,146,60,0.25)]', isActive: false },
      { name: 'Current Affairs', slug: 'current-affairs', description: 'Daily current affairs news quizzes', icon: '📰', colorClass: 'hover:border-purple-400/50 hover:shadow-[0_0_20px_rgba(192,132,252,0.25)]', isActive: true },
      { name: 'Science', slug: 'science', description: 'Science quizzes', icon: '🔬', colorClass: 'hover:border-teal-400/50 hover:shadow-[0_0_20px_rgba(45,212,191,0.25)]', isActive: true },
      { name: 'Sports', slug: 'sports', description: 'Sports quizzes', icon: '⚽', colorClass: 'hover:border-orange-400/50 hover:shadow-[0_0_20px_rgba(251,146,60,0.25)]', isActive: true },
      { name: 'Entertainment', slug: 'entertainment', description: 'Entertainment quizzes', icon: '🎬', colorClass: 'hover:border-pink-400/50 hover:shadow-[0_0_20px_rgba(244,114,182,0.25)]', isActive: true },
      { name: 'Technology', slug: 'technology', description: 'Technology quizzes', icon: '💻', colorClass: 'hover:border-blue-400/50 hover:shadow-[0_0_20px_rgba(96,165,250,0.25)]', isActive: true },
      { name: 'History', slug: 'history', description: 'History quizzes', icon: '📜', colorClass: 'hover:border-amber-600/50 hover:shadow-[0_0_20px_rgba(217,119,6,0.25)]', isActive: true },
    ]);
    console.log('Categories seeded.');

    // Find category instances for linking
    const gkCat = createdCategories.find(c => c.name === 'General Knowledge');
    const sciTechCat = createdCategories.find(c => c.name === 'Science & Technology');
    const mathLogicCat = createdCategories.find(c => c.name === 'Mathematics & Logic');
    const histCultCat = createdCategories.find(c => c.name === 'History & Culture');
    const sportsEntCat = createdCategories.find(c => c.name === 'Sports & Entertainment');
    const currentCat = createdCategories.find(c => c.name === 'Current Affairs');
    const scienceCat = createdCategories.find(c => c.name === 'Science');
    const sportsCat = createdCategories.find(c => c.name === 'Sports');
    const techCat = createdCategories.find(c => c.name === 'Technology');

    // 3. Seed Contests (Original Admin + Public Contests)
    console.log('Seeding initial Contests...');
    const now = new Date();
    await Contest.bulkCreate([
      // Admin Panel Scheduled Contests
      {
        title: 'Weekend Sci-Tech Sprint',
        description: 'Test your scientific and technological facts over the weekend.',
        categoryId: sciTechCat ? sciTechCat.id : null,
        startTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days later
        endTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
        entryFee: 30.00,
        prizePool: 3000.00,
        maxParticipants: 150,
        minParticipants: 5,
        durationMinutes: 30,
        isActive: true,
      },
      {
        title: 'Ancient Kingdoms Quiz',
        description: 'Take a trip back in time to the historical dynasties.',
        categoryId: histCultCat ? histCultCat.id : null,
        startTime: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000), // 4 days later
        endTime: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
        entryFee: 0.00,
        prizePool: 500.00,
        maxParticipants: 200,
        minParticipants: 2,
        durationMinutes: 30,
        isActive: true,
      },
      {
        title: 'Trigonometry Challenge',
        description: 'Evaluate angles, triangles, and trigonometric functions.',
        categoryId: mathLogicCat ? mathLogicCat.id : null,
        startTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days later
        endTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
        entryFee: 50.00,
        prizePool: 5000.00,
        maxParticipants: 100,
        minParticipants: 2,
        durationMinutes: 30,
        isActive: true,
      },
      {
        title: 'Mega GK Showdown',
        description: 'Complete general knowledge battle.',
        categoryId: gkCat ? gkCat.id : null,
        startTime: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000), // 10 days later
        endTime: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
        entryFee: 100.00,
        prizePool: 10000.00,
        maxParticipants: 300,
        minParticipants: 10,
        durationMinutes: 30,
        isActive: true,
      },
      // Public Frontend Contests
      {
        title: 'Mega GK Battle',
        description: 'Battle with thousands of players in our GK tournament.',
        categoryId: gkCat ? gkCat.id : null,
        startTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days later
        endTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
        entryFee: 20.00,
        prizePool: 50000.00,
        maxParticipants: 5000,
        minParticipants: 10,
        durationMinutes: 30,
        isActive: true,
      },
      {
        title: 'Science Champions',
        description: 'Showcase your science knowledge.',
        categoryId: scienceCat ? scienceCat.id : null,
        startTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days later
        endTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
        entryFee: 15.00,
        prizePool: 30000.00,
        maxParticipants: 2000,
        minParticipants: 5,
        durationMinutes: 30,
        isActive: true,
      },
      {
        title: 'Current Affairs Quiz',
        description: 'Test your knowledge on latest global trends.',
        categoryId: currentCat ? currentCat.id : null,
        startTime: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000), // 4 days later
        endTime: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000 + 20 * 60 * 1000),
        entryFee: 5.00,
        prizePool: 20000.00,
        maxParticipants: 5000,
        minParticipants: 10,
        durationMinutes: 20,
        isActive: true,
      },
      {
        title: 'Sports Mania',
        description: 'Football, cricket, and more sports trivia.',
        categoryId: sportsCat ? sportsCat.id : null,
        startTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days later
        endTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
        entryFee: 20.00,
        prizePool: 25000.00,
        maxParticipants: 1000,
        minParticipants: 5,
        durationMinutes: 30,
        isActive: true,
      },
      {
        title: 'Tech Titans',
        description: 'Latest in computing and AI tech.',
        categoryId: techCat ? techCat.id : null,
        startTime: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000), // 6 days later
        endTime: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
        entryFee: 10.00,
        prizePool: 40000.00,
        maxParticipants: 3000,
        minParticipants: 5,
        durationMinutes: 30,
        isActive: true,
      },
    ]);
    console.log('Contests seeded.');

    console.log('All DB operations completed.');
    process.exit(0);
  } catch (error) {
    console.error('Error during DB sync & seed:', error);
    process.exit(1);
  }
};

syncAndSeed();

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import ScrollToTop from '../../components/common/ScrollToTop';
import Navbar from '../../components/know-champ/Navbar';
import Hero from '../../components/know-champ/Hero';
import ContestCard from '../../components/know-champ/ContestCard';
import QuizPlayModal from '../../components/know-champ/QuizPlayModal';
import CategoryCard from '../../components/know-champ/CategoryCard';
import WhyChooseUs from '../../components/know-champ/WhyChooseUs';
import WinnerCard from '../../components/know-champ/WinnerCard';
import TestimonialCard from '../../components/know-champ/TestimonialCard';
import CTASection from '../../components/know-champ/CTASection';
import FAQ from '../../components/know-champ/FAQ';
import Footer from '../../components/know-champ/Footer';

import {
  KNOW_CHAMP_WINNERS,
  KNOW_CHAMP_TESTIMONIALS,
} from '../../constants/knowChampData';
import { featureService } from '../../api/services/featureService';
import { categoryService } from '../../api/services/categoryService';
import { contestService } from '../../api/services/contestService';
import { getImageUrl } from '../../api/services/api';

const Home = () => {
  const navigate = useNavigate();
  const [features, setFeatures] = React.useState([]);
  const [featuresLoading, setFeaturesLoading] = React.useState(true);
  const [categories, setCategories] = React.useState([]);
  const [categoriesLoading, setCategoriesLoading] = React.useState(true);
  const [contests, setContests] = React.useState([]);
  const [contestsLoading, setContestsLoading] = React.useState(true);
  const [activeQuizContest, setActiveQuizContest] = React.useState(null);
  const [isQuizModalOpen, setIsQuizModalOpen] = React.useState(false);
  const categoriesScrollRef = React.useRef(null);
  const contestsScrollRef = React.useRef(null);

  const scrollCategories = (direction) => {
    if (categoriesScrollRef.current) {
      const containerWidth = categoriesScrollRef.current.clientWidth;
      const scrollAmount = direction === 'left' ? -containerWidth : containerWidth;
      categoriesScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollContests = (direction) => {
    if (contestsScrollRef.current) {
      const containerWidth = contestsScrollRef.current.clientWidth;
      const scrollAmount = direction === 'left' ? -containerWidth : containerWidth;
      contestsScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  React.useEffect(() => {
    const loadFeatures = async () => {
      try {
        setFeaturesLoading(true);
        const res = await featureService.getPublicFeatures();
        if (res?.success && Array.isArray(res.data)) {
          setFeatures(res.data);
        } else {
          setFeatures([]);
        }
      } catch (err) {
        console.error('Error fetching public features:', err);
        setFeatures([]);
      } finally {
        setFeaturesLoading(false);
      }
    };

    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);
        const res = await categoryService.getPublicCategories();
        if (res?.success && Array.isArray(res.data)) {
          setCategories(res.data);
        } else {
          setCategories([]);
        }
      } catch (err) {
        console.error('Error fetching public categories:', err);
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    const loadContests = async () => {
      try {
        setContestsLoading(true);
        const res = await contestService.getPublicContests();
        if (res?.success && Array.isArray(res.data)) {
          setContests(res.data);
        } else {
          setContests([]);
        }
      } catch (err) {
        console.error('Error fetching public contests:', err);
        setContests([]);
      } finally {
        setContestsLoading(false);
      }
    };

    loadFeatures();
    loadCategories();
    loadContests();
  }, []);

  const getCategoryTheme = (catName = '', catData = {}) => {
    const nameLower = (catName || '').toLowerCase();
    const iconVal = catData?.icon || '';
    // Apply MIME correction before truthy check
    const imgVal = catData?.image ? getImageUrl(catData.image) : '';

    let img = null;
    let icon = iconVal || '📚';

    // 1. Uploaded category image takes absolute top priority!
    if (imgVal && typeof imgVal === 'string' && imgVal.trim() !== '') {
      img = imgVal;
    } else if (iconVal && typeof iconVal === 'string' && (iconVal.startsWith('data:') || iconVal.startsWith('/') || iconVal.startsWith('http') || iconVal.startsWith('uploads/'))) {
      img = iconVal;
    } 
    // 2. Preset image mappings based on icon emoji or keyword
    else if (iconVal === '🔬' || nameLower.includes('science')) {
      img = '/cat-science.png';
      icon = '🔬';
    } else if (iconVal === '💻' || iconVal === '🤖' || nameLower.includes('tech') || nameLower.includes('robot') || nameLower.includes('code') || nameLower.includes('computer')) {
      img = '/cat-technology.png';
      icon = iconVal || '💻';
    } else if (iconVal === '⚽' || nameLower.includes('sport') || nameLower.includes('cricket') || nameLower.includes('football') || nameLower.includes('game')) {
      img = '/cat-sports.png';
      icon = '⚽';
    } else if (iconVal === '🎬' || nameLower.includes('entertain') || nameLower.includes('movie') || nameLower.includes('music') || nameLower.includes('cinema') || nameLower.includes('song')) {
      img = '/cat-entertainment.png';
      icon = '🎬';
    } else if (iconVal === '📜' || nameLower.includes('history') || nameLower.includes('culture') || nameLower.includes('geo') || nameLower.includes('earth')) {
      img = '/cat-history.png';
      icon = '📜';
    } else if (iconVal === '📰' || nameLower.includes('current') || nameLower.includes('news') || nameLower.includes('affair') || nameLower.includes('today')) {
      img = '/cat-current.png';
      icon = '📰';
    } else if (nameLower.includes('health') || nameLower.includes('medic') || nameLower.includes('environ') || nameLower.includes('nature')) {
      img = '/cat-science.png';
      icon = '🩺';
    } else if (nameLower.includes('brain') || nameLower.includes('math') || nameLower.includes('logic') || nameLower.includes('iq')) {
      img = '/Knowledge.png';
      icon = '🧠';
    } else {
      // Deterministic distinct preset image for unknown custom categories so no two categories show the same icon by default
      const presets = ['/cat-science.png', '/cat-technology.png', '/cat-sports.png', '/cat-entertainment.png', '/cat-history.png', '/cat-current.png', '/Knowledge.png'];
      const charSum = nameLower.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
      img = presets[charSum % presets.length];
      icon = iconVal || '📚';
    }

    return {
      icon: icon,
      image: img,
      colorClass: 'text-red-500 bg-red-500/10 border-red-500/20',
      borderGlowClass: catData?.colorClass || 'hover:border-red-500/50 hover:shadow-[0_0_20px_rgba(239,68,68,0.25)]',
    };
  };
  return (
    <div className="min-h-screen bg-[#090b15] text-white flex flex-col font-sans select-none overflow-x-hidden">
      <ScrollToTop />
      {/* 1. Header/Navbar */}
      <Navbar />

      {/* 2. Hero Section */}
      <Hero />

      {/* 3. Featured Contests */}
      <section className="py-6 sm:py-8 bg-[#090b15] border-t border-gray-900/50">
        <div className="w-[calc(100%-24px)] sm:w-[calc(100%-32px)] max-w-[1425px] mx-auto px-3 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex items-end justify-between mb-5 sm:mb-6 pb-3 border-b border-gray-800/40">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight relative inline-block">
              Featured Contests
              <span className="absolute bottom-[-13px] left-0 w-16 sm:w-20 h-1 bg-red-600 rounded-full"></span>
            </h2>
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Arrow Scroll Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => scrollContests('left')}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#0e1121] border border-gray-800 hover:border-red-500/60 hover:bg-gray-800/80 text-gray-300 hover:text-white flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 shadow-sm"
                  aria-label="Previous contests"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollContests('right')}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#0e1121] border border-gray-800 hover:border-red-500/60 hover:bg-gray-800/80 text-gray-300 hover:text-white flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 shadow-sm"
                  aria-label="Next contests"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <Link 
                to="/contests" 
                className="text-xs sm:text-sm font-bold text-blue-500 hover:text-blue-400 transition-colors uppercase tracking-wider"
              >
                View All
              </Link>
            </div>
          </div>

          {/* Single Row Horizontal Scroller list of Contest Cards */}
          <div 
            ref={contestsScrollRef}
            className="flex items-stretch gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth py-2 px-0.5"
          >
            {contestsLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="w-[85%] xs:w-[calc((100%-1rem)/2)] sm:w-[calc((100%-1.5rem)/2)] md:w-[calc((100%-2*1.5rem)/3)] lg:w-[calc((100%-3*1.5rem)/4)] flex-shrink-0">
                  <ContestCard isLoading={true} />
                </div>
              ))
            ) : (contests || []).filter(Boolean).length > 0 ? (
              (contests || []).filter(Boolean).map((contest, index) => {
                if (!contest) return null;
                const categoryName = contest.category?.name || contest.category || 'General Knowledge';
                const catTheme = getCategoryTheme(categoryName, contest.category);
                const prize = contest.prizePool !== undefined ? parseFloat(contest.prizePool) : (contest.prize || 0);
                const entry = contest.entryFee !== undefined ? parseFloat(contest.entryFee) : (contest.entry || 0);
                const joined = contest.joined !== undefined ? contest.joined : 0;
                const image = contest.image || catTheme.image || catTheme.icon;
                const date = contest?.startTime
                  ? new Date(contest.startTime).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) + ', 10:00 Am'
                  : (contest?.date || '');
                return (
                  <div key={contest.id || index} className="w-[85%] xs:w-[calc((100%-1rem)/2)] sm:w-[calc((100%-1.5rem)/2)] md:w-[calc((100%-2*1.5rem)/3)] lg:w-[calc((100%-3*1.5rem)/4)] flex-shrink-0">
                    <ContestCard
                      id={contest.id}
                      category={categoryName}
                      title={contest.title}
                      prize={prize}
                      entry={entry}
                      joined={joined}
                      image={image}
                      date={date}
                      contest={contest}
                      onPlay={(selectedCnt) => {
                        setActiveQuizContest({
                          ...selectedCnt,
                          category: categoryName,
                          prize,
                          entry,
                        });
                        setIsQuizModalOpen(true);
                      }}
                    />
                  </div>
                );
              })
            ) : (
              <div className="w-full text-center py-10 text-gray-500 text-sm">
                No active contests available.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Interactive Quiz Play Modal */}
      <QuizPlayModal
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        contest={activeQuizContest}
      />

      {/* 4. Categories */}
      <section className="py-6 sm:py-8 bg-[#090b15] border-t border-gray-900/50">
        <div className="w-[calc(100%-24px)] sm:w-[calc(100%-32px)] max-w-[1425px] mx-auto px-3 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex items-end justify-between mb-5 sm:mb-6 pb-3 border-b border-gray-800/40">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight relative inline-block">
              Categories
              <span className="absolute bottom-[-13px] left-0 w-12 sm:w-16 h-1 bg-red-600 rounded-full"></span>
            </h2>
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Arrow Scroll Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => scrollCategories('left')}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#0e1121] border border-gray-800 hover:border-red-500/60 hover:bg-gray-800/80 text-gray-300 hover:text-white flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 shadow-sm"
                  aria-label="Previous categories"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollCategories('right')}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#0e1121] border border-gray-800 hover:border-red-500/60 hover:bg-gray-800/80 text-gray-300 hover:text-white flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 shadow-sm"
                  aria-label="Next categories"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <Link 
                to="/contests" 
                className="text-xs sm:text-sm font-bold text-blue-500 hover:text-blue-400 transition-colors uppercase tracking-wider"
              >
                View All
              </Link>
            </div>
          </div>

          {/* Single Row Horizontal Scroller list of Category Cards */}
          <div 
            ref={categoriesScrollRef}
            className="flex items-center gap-3 sm:gap-4 lg:gap-5 overflow-x-auto no-scrollbar scroll-smooth py-2 px-0.5"
          >
            {categoriesLoading ? (
              Array.from({ length: 7 }).map((_, index) => (
                <div key={index} className="w-[calc((100%-2*0.75rem)/3)] xs:w-[calc((100%-2*0.75rem)/3)] sm:w-[calc((100%-3*1rem)/4)] md:w-[calc((100%-4*1rem)/5)] lg:w-[calc((100%-6*1.25rem)/7)] flex-shrink-0">
                  <CategoryCard isLoading={true} />
                </div>
              ))
            ) : categories.length > 0 ? (
              categories.map((category, index) => {
                const catTheme = getCategoryTheme(category.name, category);
                return (
                  <div key={category.id || index} className="w-[calc((100%-2*0.75rem)/3)] xs:w-[calc((100%-2*0.75rem)/3)] sm:w-[calc((100%-3*1rem)/4)] md:w-[calc((100%-4*1rem)/5)] lg:w-[calc((100%-6*1.25rem)/7)] flex-shrink-0">
                    <CategoryCard
                      name={category.name}
                      image={getImageUrl(category.image) || catTheme.image}
                      colorClass={catTheme.colorClass}
                      borderGlowClass={catTheme.borderGlowClass}
                      onClick={() => navigate(`/contests?category=${encodeURIComponent(category.name.toLowerCase())}`)}
                    />
                  </div>
                );
              })
            ) : (
              <div className="w-full text-center py-10 text-gray-500 text-sm">
                No categories available.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. Why Choose Know Champ? */}
      <WhyChooseUs isLoading={featuresLoading} features={features} />

      {/* 6. Recent Winners */}
      <section className="py-6 sm:py-8 bg-[#090b15]">
        <div className="w-[calc(100%-24px)] sm:w-[calc(100%-32px)] max-w-[1425px] mx-auto px-3 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex items-end justify-between mb-5 sm:mb-6 pb-3 border-b border-gray-800/40">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight relative inline-block">
              Recent Winners
              <span className="absolute bottom-[-13px] left-0 w-16 sm:w-20 h-1 bg-red-600 rounded-full"></span>
            </h2>
            <Link 
              to="/leaderboard" 
              className="text-xs sm:text-sm font-bold text-blue-500 hover:text-blue-400 transition-colors uppercase tracking-wider"
            >
              View All
            </Link>
          </div>

          {/* Winner Cards Infinite marquee */}
          <div className="w-full overflow-hidden py-4">
            <motion.div
              className="flex gap-6"
              animate={{ x: ["0%", "-50%"] }}
              transition={{
                ease: "linear",
                duration: 25,
                repeat: Infinity,
              }}
              style={{ width: "max-content" }}
            >
              {[...KNOW_CHAMP_WINNERS, ...KNOW_CHAMP_WINNERS].map((winner, index) => (
                <div 
                  key={index} 
                  className="w-[160px] sm:w-[190px] md:w-[240px] flex-shrink-0 flex flex-col"
                >
                  <WinnerCard
                    name={winner.name}
                    amount={winner.amount}
                    contest={winner.contest}
                    rank={winner.rank}
                    image={winner.image}
                  />
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* 7. What Users Say (Testimonials) */}
      <section className="py-6 sm:py-8 bg-[#090b15] border-t border-gray-900/50">
        <div className="w-[calc(100%-24px)] sm:w-[calc(100%-32px)] max-w-[1425px] mx-auto px-3 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex items-end justify-between mb-5 sm:mb-6 pb-3 border-b border-gray-800/40">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight relative inline-block">
              What Users Say
              <span className="absolute bottom-[-13px] left-0 w-16 sm:w-20 h-1 bg-red-600 rounded-full"></span>
            </h2>
          </div>

          {/* Infinite marquee container */}
          <div className="w-full overflow-hidden py-4">
            <motion.div
              className="flex gap-6 animate-marquee"
              animate={{ x: ["0%", "-50%"] }}
              transition={{
                ease: "linear",
                duration: 25,
                repeat: Infinity,
              }}
              style={{ width: "max-content" }}
            >
              {[...KNOW_CHAMP_TESTIMONIALS, ...KNOW_CHAMP_TESTIMONIALS].map((testimonial, index) => (
                <div 
                  key={index} 
                  className="w-[280px] sm:w-[320px] md:w-[380px] flex-shrink-0 flex flex-col"
                >
                  <TestimonialCard
                    rating={testimonial.rating}
                    text={testimonial.text}
                    name={testimonial.name}
                    title={testimonial.title}
                    image={testimonial.image}
                  />
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* 8. CTA Section */}
      <CTASection />

      {/* 9. FAQ Accordion */}
      <FAQ />

      {/* 10. Footer */}
      <Footer />
    </div>
  );
};

export default Home;

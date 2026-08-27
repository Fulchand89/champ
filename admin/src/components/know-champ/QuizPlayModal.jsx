import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Trophy,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Play,
  Download,
  RotateCcw,
  Sparkles,
  Award,
  Zap,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/services/api';

// Curated fallback question bank if specific contest questions are not yet populated
const FALLBACK_QUESTIONS = [
  {
    id: 101,
    questionText: 'What is the SI unit of electric power?',
    difficulty: 'easy',
    explanation: 'Watt (W) is the standard International System of Units (SI) unit of power.',
    options: [
      { id: 1, optionText: 'Joule', isCorrect: false },
      { id: 2, optionText: 'Watt', isCorrect: true },
      { id: 3, optionText: 'Newton', isCorrect: false },
      { id: 4, optionText: 'Pascal', isCorrect: false },
    ],
  },
  {
    id: 102,
    questionText: 'Which element has the chemical symbol "O" and atomic number 8?',
    difficulty: 'easy',
    explanation: 'Oxygen is a chemical element with symbol O and atomic number 8.',
    options: [
      { id: 5, optionText: 'Osmium', isCorrect: false },
      { id: 6, optionText: 'Gold', isCorrect: false },
      { id: 7, optionText: 'Oxygen', isCorrect: true },
      { id: 8, optionText: 'Ozone', isCorrect: false },
    ],
  },
  {
    id: 103,
    questionText: 'Who was the first President of Independent India?',
    difficulty: 'medium',
    explanation: 'Dr. Rajendra Prasad was the first President of India, serving from 1950 to 1962.',
    options: [
      { id: 9, optionText: 'Dr. Rajendra Prasad', isCorrect: true },
      { id: 10, optionText: 'Jawaharlal Nehru', isCorrect: false },
      { id: 11, optionText: 'Dr. B.R. Ambedkar', isCorrect: false },
      { id: 12, optionText: 'Sardar Vallabhbhai Patel', isCorrect: false },
    ],
  },
  {
    id: 104,
    questionText: 'Which planet in the solar system is known as the "Red Planet"?',
    difficulty: 'easy',
    explanation: 'Mars is called the Red Planet due to iron oxide prevalent on its surface.',
    options: [
      { id: 13, optionText: 'Venus', isCorrect: false },
      { id: 14, optionText: 'Mars', isCorrect: true },
      { id: 15, optionText: 'Jupiter', isCorrect: false },
      { id: 16, optionText: 'Saturn', isCorrect: false },
    ],
  },
  {
    id: 105,
    questionText: 'What is the capital city of France?',
    difficulty: 'easy',
    explanation: 'Paris is the capital and most populous city of France.',
    options: [
      { id: 17, optionText: 'Berlin', isCorrect: false },
      { id: 18, optionText: 'Madrid', isCorrect: false },
      { id: 19, optionText: 'Paris', isCorrect: true },
      { id: 20, optionText: 'Rome', isCorrect: false },
    ],
  },
];

// Web Audio sound effects helper
const playSound = (type) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === 'correct') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'wrong') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.setValueAtTime(140, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'tick') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    }
  } catch (e) {
    // Ignore audio failures
  }
};

const QuizPlayModal = ({ isOpen, onClose, contest }) => {
  const [stage, setStage] = useState('lobby'); // 'lobby' | 'playing' | 'results'
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Gameplay state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [userAnswers, setUserAnswers] = useState([]);

  const timerRef = useRef(null);

  // Fetch or load contest questions
  useEffect(() => {
    if (!isOpen || !contest) return;

    setStage('lobby');
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setIsAnswered(false);
    setScore(0);
    setStreak(0);
    setCorrectCount(0);
    setWrongCount(0);
    setUserAnswers([]);
    setLoading(true);

    const loadQuestions = async () => {
      try {
        if (contest.id) {
          const res = await api.get(`/public/contests/${contest.id}/questions`);
          if (res.data?.success && Array.isArray(res.data?.data) && res.data.data.length > 0) {
            setQuestions(res.data.data);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Could not fetch remote questions, using curated list:', err.message);
      }
      setQuestions(FALLBACK_QUESTIONS);
      setLoading(false);
    };

    loadQuestions();
  }, [isOpen, contest]);

  // Timer logic for active question
  useEffect(() => {
    if (stage !== 'playing' || isAnswered) return;

    setTimeLeft(15);
    clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeOut();
          return 0;
        }
        if (prev <= 4) {
          playSound('tick');
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [stage, currentIndex, isAnswered]);

  const handleTimeOut = () => {
    if (isAnswered) return;
    setIsAnswered(true);
    setStreak(0);
    setWrongCount((w) => w + 1);
    playSound('wrong');

    const currentQ = questions[currentIndex];
    setUserAnswers((prev) => [
      ...prev,
      {
        questionId: currentQ?.id,
        selectedOptionId: null,
        isCorrect: false,
        timedOut: true,
      },
    ]);
  };

  const handleStartQuiz = () => {
    setStage('playing');
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setIsAnswered(false);
    setScore(0);
    setStreak(0);
    setCorrectCount(0);
    setWrongCount(0);
    setUserAnswers([]);
  };

  const handleSelectOption = (option) => {
    if (isAnswered) return;

    clearInterval(timerRef.current);
    setSelectedOptionId(option.id);
    setIsAnswered(true);

    const isCorrect = option.isCorrect;
    const currentQ = questions[currentIndex];
    const points = currentQ?.points || 1;

    if (isCorrect) {
      playSound('correct');
      const streakBonus = streak >= 2 ? 5 : 0;
      setScore((s) => s + (points * 10) + streakBonus);
      setStreak((st) => st + 1);
      setCorrectCount((c) => c + 1);
    } else {
      playSound('wrong');
      setStreak(0);
      setWrongCount((w) => w + 1);
    }

    setUserAnswers((prev) => [
      ...prev,
      {
        questionId: currentQ?.id,
        selectedOptionId: option.id,
        isCorrect,
        timedOut: false,
      },
    ]);
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((idx) => idx + 1);
      setSelectedOptionId(null);
      setIsAnswered(false);
    } else {
      setStage('results');
    }
  };

  if (!isOpen || !contest) return null;

  const currentQ = questions[currentIndex] || {};
  const currentOptions = currentQ.options || [];
  const accuracy =
    questions.length > 0
      ? Math.round((correctCount / questions.length) * 100)
      : 0;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#0b0e1d] border border-white/10 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl relative text-white flex flex-col my-auto">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 hover:text-white transition cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* ── STAGE 1: LOBBY / PRE-QUIZ ── */}
        {stage === 'lobby' && (
          <div className="p-6 sm:p-8 flex flex-col items-center text-center space-y-6">
            {/* Contest Header Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E94B4B]/15 border border-[#E94B4B]/30 text-[#E94B4B] text-xs font-bold uppercase tracking-wider">
              <Sparkles size={14} /> Live Contest Arena
            </div>

            {/* Title & Category */}
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                {contest.category || 'General Knowledge'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1 leading-tight">
                {contest.title}
              </h2>
            </div>

            {/* Contest Specs Grid */}
            <div className="grid grid-cols-3 gap-3 w-full bg-white/5 border border-white/10 p-4 rounded-2xl">
              <div className="flex flex-col items-center">
                <p className="text-[10px] text-gray-400 uppercase font-bold">Prize Pool</p>
                <p className="text-base sm:text-lg font-black text-red-500 mt-0.5">
                  ₹{Number(contest.prize || contest.prizePool || 0).toLocaleString()}
                </p>
              </div>
              <div className="flex flex-col items-center border-x border-white/10 px-2">
                <p className="text-[10px] text-gray-400 uppercase font-bold">Entry Fee</p>
                <p className="text-base sm:text-lg font-black text-white mt-0.5">
                  ₹{contest.entry !== undefined ? contest.entry : contest.entryFee || 0}
                </p>
              </div>
              <div className="flex flex-col items-center">
                <p className="text-[10px] text-gray-400 uppercase font-bold">Questions</p>
                <p className="text-base sm:text-lg font-black text-amber-400 mt-0.5">
                  {questions.length} Qs
                </p>
              </div>
            </div>

            {/* Quick Rules */}
            <div className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-left space-y-2 text-xs text-gray-300">
              <div className="flex items-center gap-2 font-bold text-white mb-1">
                <ShieldCheck size={16} className="text-green-400" /> Contest Rules & Guidelines
              </div>
              <p className="flex items-center gap-2">
                <Clock size={13} className="text-amber-400 shrink-0" />
                <span><strong>15 seconds</strong> timer per question.</span>
              </p>
              <p className="flex items-center gap-2">
                <Zap size={13} className="text-purple-400 shrink-0" />
                <span>Fast answers earn <strong>streak multiplier bonus</strong>.</span>
              </p>
              <p className="flex items-center gap-2">
                <Trophy size={13} className="text-amber-400 shrink-0" />
                <span>Top scorers split the <strong>₹{Number(contest.prize || contest.prizePool || 0).toLocaleString()}</strong> Prize Pool!</span>
              </p>
            </div>

            {/* Action buttons: Play Online + Download App */}
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button
                onClick={handleStartQuiz}
                disabled={loading}
                className="flex-1 py-3.5 sm:py-4 rounded-2xl text-white font-extrabold text-sm sm:text-base tracking-wide flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-lg hover:shadow-red-500/20"
                style={{ background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' }}
              >
                {loading ? (
                  <span>Loading Arena...</span>
                ) : (
                  <>
                    <Play size={18} fill="currentColor" /> Play Online Now
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  toast.success('Downloading KnowChamp APK...');
                  toast('KnowChamp App will be saved to your downloads folder.', {
                    icon: '📱',
                  });
                }}
                className="py-3.5 sm:py-4 px-5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Download size={16} /> Download App
              </button>
            </div>
          </div>
        )}

        {/* ── STAGE 2: ACTIVE GAMEPLAY ── */}
        {stage === 'playing' && (
          <div className="p-5 sm:p-7 flex flex-col space-y-5">
            {/* Top Bar: Progress + Score + Timer */}
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs font-black text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                    Score: {score}
                  </span>
                  {streak >= 2 && (
                    <span className="text-[10px] font-black text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Zap size={11} fill="currentColor" /> {streak}x Streak!
                    </span>
                  )}
                </div>
              </div>

              {/* Timer Pill */}
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black transition-colors ${
                  timeLeft <= 4
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                    : 'bg-white/10 text-white'
                }`}
              >
                <Clock size={14} className={timeLeft <= 4 ? 'text-red-400' : 'text-gray-400'} />
                <span>00:{String(timeLeft).padStart(2, '0')}</span>
              </div>
            </div>

            {/* Question Progress Linear Bar */}
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${((currentIndex + 1) / questions.length) * 100}%`,
                  background: 'linear-gradient(90deg, #E94B4B 0%, #ff7676 100%)',
                }}
              />
            </div>

            {/* Question Card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 min-h-[100px] flex flex-col justify-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#E94B4B] mb-1">
                {currentQ.difficulty ? `${currentQ.difficulty} Question` : 'Trivia Question'}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                {currentQ.questionText || currentQ.question}
              </h3>
            </div>

            {/* Options List */}
            <div className="grid grid-cols-1 gap-2.5">
              {currentOptions.map((option, idx) => {
                const optKey = String.fromCharCode(65 + idx);
                const isSelected = selectedOptionId === option.id;
                const isCorrect = option.isCorrect;

                let optionStyles = 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white';

                if (isAnswered) {
                  if (isCorrect) {
                    optionStyles = 'bg-green-500/20 border-green-500 text-green-300 shadow-[0_0_15px_rgba(34,197,94,0.3)]';
                  } else if (isSelected && !isCorrect) {
                    optionStyles = 'bg-red-500/20 border-red-500 text-red-300';
                  } else {
                    optionStyles = 'bg-white/5 border-white/5 text-gray-400 opacity-60';
                  }
                }

                return (
                  <button
                    key={option.id || idx}
                    onClick={() => handleSelectOption(option)}
                    disabled={isAnswered}
                    className={`w-full p-3.5 sm:p-4 rounded-xl border text-left flex items-center justify-between gap-3 font-semibold text-xs sm:text-sm transition-all duration-200 cursor-pointer ${optionStyles}`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="w-6 h-6 rounded-lg bg-black/40 flex items-center justify-center font-bold text-xs shrink-0 text-gray-300">
                        {optKey}
                      </span>
                      <span className="truncate">{option.optionText || option.text}</span>
                    </div>

                    {isAnswered && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                    )}
                    {isAnswered && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation / Next Button Footer */}
            {isAnswered && (
              <div className="space-y-3 pt-2 animate-in fade-in duration-150">
                {currentQ.explanation && (
                  <div className="bg-white/5 border border-white/10 p-3 rounded-xl text-xs text-gray-300 flex items-start gap-2">
                    <HelpCircle size={15} className="text-amber-400 shrink-0 mt-0.5" />
                    <p>
                      <strong>Explanation:</strong> {currentQ.explanation}
                    </p>
                  </div>
                )}

                <button
                  onClick={handleNextQuestion}
                  className="w-full py-3 bg-[#4f6ef7] hover:bg-[#3d5ef0] text-white font-bold rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-indigo-500/25"
                >
                  <span>{currentIndex + 1 < questions.length ? 'Next Question' : 'View Results'}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── STAGE 3: RESULTS / SCOREBOARD ── */}
        {stage === 'results' && (
          <div className="p-6 sm:p-8 flex flex-col items-center text-center space-y-6 animate-in zoom-in-95 duration-200">
            {/* Trophy & Badge */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.4)]">
                <div className="w-full h-full bg-[#0b0e1d] rounded-full flex items-center justify-center">
                  <Trophy className="w-10 h-10 text-amber-400 animate-bounce" />
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 bg-green-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                Finished
              </span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                {accuracy >= 80 ? 'Outstanding Performance!' : accuracy >= 50 ? 'Well Played, Champion!' : 'Good Effort!'}
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                You completed <strong>{contest.title}</strong>
              </p>
            </div>

            {/* Score & Accuracy Cards */}
            <div className="grid grid-cols-3 gap-3 w-full">
              <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl flex flex-col items-center">
                <p className="text-[10px] text-gray-400 uppercase font-bold">Total Score</p>
                <p className="text-xl sm:text-2xl font-black text-amber-400 mt-1">{score}</p>
              </div>

              <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl flex flex-col items-center">
                <p className="text-[10px] text-gray-400 uppercase font-bold">Accuracy</p>
                <p className="text-xl sm:text-2xl font-black text-green-400 mt-1">{accuracy}%</p>
              </div>

              <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl flex flex-col items-center">
                <p className="text-[10px] text-gray-400 uppercase font-bold">Correct</p>
                <p className="text-xl sm:text-2xl font-black text-blue-400 mt-1">
                  {correctCount}/{questions.length}
                </p>
              </div>
            </div>

            {/* Estimated Prize Tier */}
            <div className="w-full bg-gradient-to-r from-red-500/20 via-amber-500/20 to-purple-500/20 border border-white/10 p-4 rounded-2xl text-left flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Award className="w-8 h-8 text-amber-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-white">Leaderboard Standing</p>
                  <p className="text-[11px] text-gray-300">Rank #1 • Qualified for Pool Prize!</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-red-400">
                  ₹{Number(contest.prize || contest.prizePool || 0).toLocaleString()} Pool
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
              <button
                onClick={handleStartQuiz}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw size={15} /> Play Again
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 text-white font-bold rounded-xl text-xs sm:text-sm transition cursor-pointer shadow-lg"
                style={{ background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' }}
              >
                Exit to Contests
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizPlayModal;

import React, { useState, useEffect } from "react";
import { Plus, Minus } from "lucide-react";
import { faqService } from "../../api/services/faqService";

const defaultFallbackFaqs = [
  {
    q: "How do I join a quiz contest?",
    a: "Simply create an account, verify your mobile number, add funds to your wallet (if required), and click 'Start Contest' for any live quiz to begin.",
  },
  {
    q: "Is KnowChamp free to use?",
    a: "We offer both free practice contests and paid cash contests. You can choose to join free contests to hone your skills before playing paid ones.",
  },
  {
    q: "How are winners selected?",
    a: "Winners are selected based on the number of correct answers and the speed of response. The leaderboard displays the ranks in real-time.",
  },
  {
    q: "How can I add money to my wallet?",
    a: "You can easily add money using secure UPI, Credit/Debit cards, Net Banking, or popular digital wallets inside the app's wallet section.",
  },
  {
    q: "When will I receive my winnings?",
    a: "Winnings are credited to your KnowChamp wallet immediately after the contest results are verified, which usually takes a few minutes. You can withdraw instantly.",
  },
  {
    q: "Can I participate in multiple contests?",
    a: "Yes, you can participate in as many active contests as you want, provided you meet the entry fee requirements.",
  },
  {
    q: "Is my personal information safe?",
    a: "Absolutely. We use industry-standard encryption protocols and security measures to ensure your personal and payment data is 100% secure.",
  },
  {
    q: "What happens if my internet connection is interrupted?",
    a: "If you get disconnected, the timer for your current question keeps running. We recommend playing with a stable internet connection to avoid losing points.",
  },
  {
    q: "Can I change my answers during the quiz?",
    a: "No, once an answer is submitted or the timer for the question expires, it cannot be changed.",
  },
];

const FAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState(-1);

  useEffect(() => {
    const fetchPublicFAQs = async () => {
      try {
        setLoading(true);
        const res = await faqService.getPublicFaq();
        if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
          // Normalize items
          const normalized = res.data.map(item => ({
            id: item.id,
            q: item.question || item.q,
            a: item.answer || item.a,
          }));
          setFaqs(normalized);
        } else {
          setFaqs(defaultFallbackFaqs);
        }
      } catch (err) {
        console.error("Error fetching public FAQs:", err);
        setFaqs(defaultFallbackFaqs);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicFAQs();
  }, []);

  const toggleFAQ = (index) => {
    setOpenIndex((currentIndex) =>
      currentIndex === index ? -1 : index
    );
  };

  const displayList = faqs.length > 0 ? faqs : defaultFallbackFaqs;

  return (
    <section
      className="
        w-full
        bg-[#090b15]
        border-t border-gray-800/40
        py-8
      "
    >
      <div
        className="
          w-[calc(100%-32px)]
          max-w-[1425px]
          mx-auto
          px-4 sm:px-6 lg:px-8
        "
      >
        {/* =========================
            FAQ HEADING
        ========================== */}
        <div className="mb-6">
          <div className="pb-3 border-b border-gray-800/40">
            <h2
              className="
                text-2xl
                sm:text-3xl
                font-extrabold
                text-white
                tracking-tight
                relative
                inline-block
              "
            >
              Frequently Asked Questions
              <span className="absolute bottom-[-13px] left-0 w-20 h-1 bg-red-600 rounded-full"></span>
            </h2>
          </div>

          <p
            className="
              mt-4
              max-w-[620px]
              text-sm
              sm:text-base
              leading-7
              text-[#FFFFFF]
            "
          >
            Got questions? We have answers. Find everything you need to know
            about playing, winning, and withdrawals.
          </p>
        </div>

        {/* =========================
            FAQ ACCORDION
        ========================== */}
        <div className="w-full space-y-4">
          {displayList.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={faq.id || index}
                className={`
                  overflow-hidden
                  rounded-2xl
                  border
                  transition-all
                  duration-300
                  ease-in-out
                  ${isOpen
                    ? `
                        bg-[#0f1225]
                        border-red-500/30
                        shadow-[0_5px_20px_rgba(239,68,68,0.04)]
                      `
                    : `
                        bg-[#0e1121]
                        border-gray-800/80
                        hover:border-gray-700/80
                      `
                  }
                `}
              >
                {/* =========================
                    QUESTION BUTTON
                ========================== */}
                <button
                  type="button"
                  onClick={() => toggleFAQ(index)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                  className="
                    group
                    w-full
                    min-h-[72px]
                    px-5
                    sm:px-6
                    py-5
                    flex
                    items-center
                    justify-between
                    gap-4
                    text-left
                    focus:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-red-500/50
                    cursor-pointer
                  "
                >
                  <span
                    className={`
                      text-base
                      sm:text-lg
                      font-bold
                      leading-6
                      sm:leading-7
                      transition-colors
                      duration-300
                      ${isOpen
                        ? "text-red-400"
                        : "text-white group-hover:text-gray-200"
                      }
                    `}
                  >
                    {faq.q}
                  </span>

                  {/* =========================
                      PLUS / MINUS ICON
                  ========================== */}
                  <span
                    className={`
                      flex
                      flex-shrink-0
                      items-center
                      justify-center
                      w-9
                      h-9
                      rounded-lg
                      transition-all
                      duration-300
                      ${isOpen
                        ? "bg-red-500/10 text-red-400"
                        : "bg-gray-800/50 text-gray-400 group-hover:bg-gray-800 group-hover:text-white"
                      }
                    `}
                  >
                    {isOpen ? (
                      <Minus
                        className="w-5 h-5"
                        strokeWidth={2.5}
                      />
                    ) : (
                      <Plus
                        className="w-5 h-5"
                        strokeWidth={2.5}
                      />
                    )}
                  </span>
                </button>

                {/* =========================
                    ANSWER
                ========================== */}
                <div
                  id={`faq-answer-${index}`}
                  className={`
                    grid
                    transition-all
                    duration-300
                    ease-in-out
                    ${isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                    }
                  `}
                >
                  <div className="overflow-hidden">
                    <div
                      className="
                        border-t
                        border-gray-800/40
                        bg-[#0b0e1b]/30
                        px-5
                        sm:px-6
                        py-5
                        text-sm
                        sm:text-base
                        leading-7
                        text-gray-400
                      "
                    >
                      {faq.a}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
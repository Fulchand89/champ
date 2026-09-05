import React from 'react';
import Navbar from '../../components/know-champ/Navbar';
import Footer from '../../components/know-champ/Footer';
import ScrollToTop from '../../components/common/ScrollToTop';
import { ShieldCheck, FileText, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-[#090b15] text-white flex flex-col font-sans overflow-x-hidden">
      <ScrollToTop />
      <Navbar />

      {/* Page Hero Section */}
      <section className="relative pt-36 pb-16 bg-gradient-to-b from-[#0b0c16] via-[#100713] to-[#090b15] border-b border-gray-900 flex flex-col items-center text-center px-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold uppercase tracking-wider mb-4">
          <ShieldCheck className="w-4 h-4" />
          Legal Information
        </div>

        <h1 className="text-3xl sm:text-5xl font-black mb-4 text-white">
          How the KnowChamp Excellence League Works
        </h1>

        <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base">
          Important information about using the KnowChamp Answer Right. Shine Bright website and services.
        </p>
      </section>

      {/* Main Document Section */}
      <section className="w-[calc(100%-32px)] max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 min-w-0">
        <article className="bg-[#0f111d] rounded-2xl border border-white/10 p-6 sm:p-10 shadow-2xl space-y-6 overflow-hidden max-w-full">
          
          {/* Official Document Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-400 mb-1">
                <FileText className="w-4 h-4" />
                Official Document
              </span>
              <h2 className="text-xl sm:text-3xl font-extrabold text-white">
                How the KnowChamp Excellence League Works
              </h2>
            </div>

            <div className="inline-flex items-center gap-2 text-xs font-semibold text-white/50 bg-white/5 px-3.5 py-2 rounded-xl border border-white/10 shrink-0 self-start sm:self-auto">
              <Calendar className="w-3.5 h-3.5 text-red-400" />
              Last updated 06 Aug 2026
            </div>
          </div>

          {/* Document Content Body - Exact Match with Uploaded File */}
          <div className="prose prose-invert max-w-none text-white/80 leading-relaxed space-y-5 break-words [&>p]:text-sm sm:[&>p]:text-base [&>p]:leading-relaxed [&>h3]:text-lg sm:[&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-white [&>h3]:mt-6 [&>h3]:mb-2 [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:space-y-2 [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:space-y-2 [&>li]:text-sm sm:[&>li]:text-base [&_strong]:text-white">
            
            <p>Your Journey from School Champion to State Champion Starts Here!</p>

            <p>
              The KnowChamp Excellence League is designed to be simple, exciting, and fair.
              Every participant gets the opportunity to learn, compete, and progress through
              multiple levels while developing valuable life skills.
            </p>

            <h3>Step 1: Register</h3>

            <p>
              Register through your School Coordinator or directly on the KnowChamp platform,
              where applicable.
            </p>

            <p>
              Simply enter your basic details, including your Date of Birth.
            </p>

            <h3>Step 2: Your League is Selected Automatically</h3>

            <p>
              Based on your age, the system will automatically assign you to the appropriate
              Excellence League.
            </p>

            <p>You do not have to choose your league yourself.</p>

            <h3>The available leagues are:</h3>

            <ul className="!list-none !pl-0 space-y-2.5">
              <li className="flex items-center gap-2">
                <span>🎨</span> <strong>Creative League</strong> — Age 3–5 Years
              </li>
              <li className="flex items-center gap-2">
                <span>📚</span> <strong>Knowledge League</strong> — Age 6–8 Years
              </li>
              <li className="flex items-center gap-2">
                <span>🎤</span> <strong>Communication League</strong> — Age 9–12 Years
              </li>
              <li className="flex items-center gap-2">
                <span>💡</span> <strong>Innovation League</strong> — Age 13–16 Years
              </li>
              <li className="flex items-center gap-2">
                <span>🌟</span> <strong>Character League</strong> — Age 17–19 Years
              </li>
            </ul>

            <p>
              Each league is specially designed with engaging, age-appropriate activities that
              help participants learn while enjoying the competition.
            </p>

            <h3>Step 3: View Contest Details and Prepare</h3>

            <p>
              Before every contest, you can visit the Contest Details page to view:
            </p>

            <ul>
              <li>Contest Theme</li>
              <li>Skills to be Assessed</li>
              <li>Contest Pattern</li>
              <li>Duration</li>
              <li>Rules and Instructions</li>
              <li>Sample Activities, where applicable</li>
            </ul>

            <p>
              This allows every participant to prepare with confidence.
            </p>

            <h3>Step 4: Participate at Your School</h3>

            <p>
              On the scheduled competition day, all registered participants compete at their
              own school.
            </p>

            <p>Depending on the league, the contest may include:</p>

            <ul>
              <li>Quiz Questions</li>
              <li>Creative Activities</li>
              <li>Drawing and Craft</li>
              <li>Storytelling</li>
              <li>Public Speaking</li>
              <li>Innovation Challenges</li>
              <li>Practical Activities</li>
              <li>Problem Solving</li>
              <li>Personality and Character Assessment</li>
            </ul>

            <h3>Step 5: School Champions are Selected</h3>

            <p>
              After evaluation, every participating school announces:
            </p>

            <ol className="!list-decimal pl-6 space-y-1.5">
              <li>🥇 First Place</li>
              <li>🥈 Second Place</li>
              <li>🥉 Third Place</li>
            </ol>

            <p>
              These top three participants from each league qualify for the Sub-Division Level.
            </p>

            <p>
              Every participant receives recognition for taking part.
            </p>

            <h3>Step 6: Compete at the Sub-Division Level</h3>

            <p>
              The winners from participating schools within the same Sub-Division compete
              against one another.
            </p>

            <p>
              This round gives students a broader platform to showcase their talent.
            </p>

            <h3>Step 7: Advance to the District Championship</h3>

            <p>
              Top performers from each Sub-Division qualify for the District Level, where they
              compete with the best participants from across the district.
            </p>

            <h3>Step 8: Reach the State Grand Finale</h3>

            <p>
              The highest-performing participants from every district advance to the
              State-Level Grand Finale.
            </p>

            <p>
              Here, students compete for prestigious titles, medals, trophies, certificates,
              and exciting cash prizes while earning statewide recognition.
            </p>

            <h3>Recognition at Every Stage</h3>

            <p>
              Every participant's effort is valued and celebrated.
            </p>

            <ul className="!list-none !pl-0 space-y-2">
              <li className="flex items-center gap-2">🏅 Participation Certificate</li>
              <li className="flex items-center gap-2">🥈 Merit Recognition</li>
              <li className="flex items-center gap-2">🏆 School Champion</li>
              <li className="flex items-center gap-2">🏆 Sub-Division Champion</li>
              <li className="flex items-center gap-2">🏆 District Champion</li>
              <li className="flex items-center gap-2">👑 State Champion</li>
            </ul>

            <p>
              Outstanding performers receive certificates, medals, trophies, cash prizes, and the
              honor of becoming part of the KnowChamp Champions Community.
            </p>

            <h3>More Than Just a Competition</h3>

            <p>
              The KnowChamp Excellence League is not just about winning prizes. It is about
              discovering potential and building lifelong skills.
            </p>

            <p>Every contest is designed to develop:</p>

            <ul>
              <li>Creativity</li>
              <li>Knowledge</li>
              <li>Critical Thinking</li>
              <li>Communication Skills</li>
              <li>Innovation</li>
              <li>Confidence</li>
              <li>Leadership</li>
              <li>Character</li>
              <li>Problem-Solving Ability</li>
              <li>Healthy Competitive Spirit</li>
            </ul>

            <p>
              These are essential life skills that help children succeed in school and beyond.
            </p>

            <h3>Your Journey to Excellence</h3>

            <p className="text-amber-400 font-bold">
              Register → Get Your League Automatically → Prepare → Compete at School →
              Qualify for Sub-Division → District → State → Become a KnowChamp Champion!
            </p>

            <div className="pt-4 space-y-1">
              <h3 className="!mt-0 !mb-1 text-xl font-bold text-white">KnowChamp Excellence League</h3>
              <p className="text-gray-300 font-medium">India's First Holistic Child Excellence League</p>
              <p className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                Answer Right. Shine Bright.
              </p>
            </div>

          </div>

          {/* Document Footer */}
          <div className="border-t border-white/10 pt-6 mt-8">
            <p className="text-white/60 text-sm mb-3">
              Have a question about this document?
            </p>

            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white font-bold rounded-xl shadow-lg transition-all duration-300 hover:opacity-95 cursor-pointer"
            >
              Contact KnowChamp
              <ArrowRight className="w-4 h-4 ms-1" />
            </Link>
          </div>

        </article>
      </section>

      <Footer />
    </div>
  );
};

export default HowItWorks;

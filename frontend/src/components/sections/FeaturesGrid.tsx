import React, { useState } from 'react';
import { 
  Sparkles, 
  MessageSquare, 
  BellRing, 
  Network, 
  CalendarCheck, 
  BarChart3
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';

export const FeaturesGrid: React.FC = () => {
  const [activeBrainNode, setActiveBrainNode] = useState<string | null>(null);
  const [smartComparison, setSmartComparison] = useState<'generic' | 'ai'>('ai');

  return (
    <section id="features" className="py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs text-accent-indigo font-bold uppercase tracking-widest bg-accent-indigo/10 border border-accent-indigo/20 rounded-full px-3.5 py-1 mb-4 inline-block">
            Core Features
          </span>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-text-primary tracking-tight mb-4">
            Powerful AI Co-Pilot Capabilities
          </h2>
          <p className="text-text-secondary text-sm md:text-base">
            Every layer of CampusOS is optimized to deliver opportunities directly to students and insights to university organizers.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Feature 1: AI Opportunity Matching */}
          <GlassCard className="flex flex-col justify-between h-[340px] border border-white/5 bg-surface-glass/20 group hover:border-accent-indigo/35">
            <div>
              <div className="w-10 h-10 rounded-xl bg-accent-indigo/10 border border-accent-indigo/25 flex items-center justify-center text-accent-indigo mb-5 group-hover:scale-110 transition-transform">
                <Sparkles className="w-5 h-5 stroke-[1.5]" />
              </div>
              <h3 className="font-display font-semibold text-lg text-text-primary mb-2">
                AI Opportunity Matching
              </h3>
              <p className="text-text-secondary text-xs leading-relaxed mb-4">
                Personalized recommendations scoring events based on your coursework, club interests, and skills.
              </p>
            </div>
            
            {/* Visual Widget: Matching Feed Mockup */}
            <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col gap-2 relative overflow-hidden select-none">
              <div className="flex items-center justify-between bg-white/5 border border-white/5 p-2 rounded-lg text-[10px] text-text-secondary transition-all hover:bg-accent-indigo/10">
                <span className="font-medium truncate">AI DevFest Hackathon</span>
                <span className="text-accent-cyan font-bold bg-accent-cyan/15 px-1.5 py-0.5 rounded text-[9px]">98% Fit</span>
              </div>
              <div className="flex items-center justify-between bg-white/5 border border-white/5 p-2 rounded-lg text-[10px] text-text-secondary transition-all hover:bg-accent-indigo/10">
                <span className="font-medium truncate">Figma UI/UX Workshop</span>
                <span className="text-accent-indigo font-bold bg-accent-indigo/15 px-1.5 py-0.5 rounded text-[9px]">94% Fit</span>
              </div>
            </div>
          </GlassCard>

          {/* Feature 2: Campus AI Assistant */}
          <GlassCard className="flex flex-col justify-between h-[340px] border border-white/5 bg-surface-glass/20 group hover:border-accent-cyan/35">
            <div>
              <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 border border-accent-cyan/25 flex items-center justify-center text-accent-cyan mb-5 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-5 h-5 stroke-[1.5]" />
              </div>
              <h3 className="font-display font-semibold text-lg text-text-primary mb-2">
                Campus AI Assistant
              </h3>
              <p className="text-text-secondary text-xs leading-relaxed mb-4">
                Ask questions in natural language to find hackathons, coordinate team RSVPs, and set deadline triggers.
              </p>
            </div>

            {/* Visual Widget: Mini Chat Bubble */}
            <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col gap-2 text-[10px] text-left select-none">
              <div className="bg-accent-cyan/15 border border-accent-cyan/20 rounded-xl rounded-tr-none px-2.5 py-1.5 self-end text-accent-cyan max-w-[85%] font-medium">
                "What design workshops are on Tuesday?"
              </div>
              <div className="bg-white/5 border border-white/5 rounded-xl rounded-tl-none px-2.5 py-1.5 self-start text-text-secondary max-w-[85%] leading-normal">
                "🎨 UI/UX Figma intensive starts at 10 AM, CS Building!"
              </div>
            </div>
          </GlassCard>

          {/* Feature 3: Smart Notifications */}
          <GlassCard className="flex flex-col justify-between h-[340px] border border-white/5 bg-surface-glass/20 group hover:border-accent-amber/35">
            <div>
              <div className="w-10 h-10 rounded-xl bg-accent-amber/10 border border-accent-amber/25 flex items-center justify-center text-accent-amber mb-5 group-hover:scale-110 transition-transform">
                <BellRing className="w-5 h-5 stroke-[1.5]" />
              </div>
              <h3 className="font-display font-semibold text-lg text-text-primary mb-2">
                Smart Notifications
              </h3>
              <p className="text-text-secondary text-xs leading-relaxed mb-4">
                Context-aware notifications delivered via WhatsApp/push that explain <em>why</em> this event is crucial for you.
              </p>
            </div>

            {/* Visual Widget: Split notification demo */}
            <div className="bg-white/5 border border-white/5 rounded-xl p-2.5 flex flex-col gap-2 select-none">
              <div className="flex justify-between border-b border-white/5 pb-1.5 text-[9px] font-semibold text-text-secondary">
                <button 
                  onClick={() => setSmartComparison('generic')} 
                  className={`px-1.5 py-0.5 rounded cursor-pointer ${smartComparison === 'generic' ? 'bg-white/5 text-text-primary' : 'hover:text-text-primary'}`}
                >
                  Generic Blast
                </button>
                <button 
                  onClick={() => setSmartComparison('ai')} 
                  className={`px-1.5 py-0.5 rounded cursor-pointer ${smartComparison === 'ai' ? 'bg-gradient-to-r from-accent-indigo/15 to-accent-cyan/15 text-accent-cyan border border-accent-indigo/25' : 'hover:text-text-primary'}`}
                >
                  CampusOS Alert
                </button>
              </div>

              {smartComparison === 'generic' ? (
                <div className="bg-red-500/10 border border-red-500/25 p-2 rounded-lg text-[9px] text-red-400 text-left">
                  <strong>To: Everyone</strong><br />
                  "A new guest seminar is taking place on campus. Register on portal." (Ignored)
                </div>
              ) : (
                <div className="bg-accent-indigo/10 border border-accent-indigo/35 p-2 rounded-lg text-[9px] text-text-primary text-left">
                  <strong>💬 WhatsApp ping to Akshay:</strong><br />
                  "OpenAI Fireside: Recommended for you since you follow AI agents. Deadline is in 3 hours!"
                </div>
              )}
            </div>
          </GlassCard>

          {/* Feature 4: University Knowledge Brain */}
          <GlassCard className="flex flex-col justify-between h-[340px] border border-white/5 bg-surface-glass/20 group hover:border-accent-success/35">
            <div>
              <div className="w-10 h-10 rounded-xl bg-accent-success/10 border border-accent-success/25 flex items-center justify-center text-accent-success mb-5 group-hover:scale-110 transition-transform">
                <Network className="w-5 h-5 stroke-[1.5]" />
              </div>
              <h3 className="font-display font-semibold text-lg text-text-primary mb-2">
                University Knowledge Brain
              </h3>
              <p className="text-text-secondary text-xs leading-relaxed mb-4">
                A unified ingestion pipeline that scrapes event feeds, notice boards, and department PDF lists into structured data.
              </p>
            </div>

            {/* Visual Widget: Knowledge Graph Interaction */}
            <div className="bg-white/5 border border-white/5 rounded-xl p-3 h-24 flex items-center justify-center relative select-none">
              {/* Nodes and connecting lines */}
              <div className="absolute inset-0 flex items-center justify-center opacity-30">
                <svg className="w-full h-full stroke-white stroke-[1]" fill="none">
                  <line x1="20%" y1="20%" x2="50%" y2="50%" />
                  <line x1="80%" y1="20%" x2="50%" y2="50%" />
                  <line x1="50%" y1="80%" x2="50%" y2="50%" />
                </svg>
              </div>
              <div className="flex justify-around items-center w-full z-10 relative">
                <div 
                  onMouseEnter={() => setActiveBrainNode('SIS')}
                  onMouseLeave={() => setActiveBrainNode(null)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[8px] font-bold border transition-colors duration-200 ${activeBrainNode === 'SIS' ? 'bg-accent-indigo border-accent-indigo text-text-primary' : 'bg-white/5 border-white/10 text-text-secondary'}`}
                >
                  SIS
                </div>
                <div 
                  className="w-10 h-10 rounded-full bg-gradient-to-tr from-accent-indigo to-accent-cyan text-text-primary border-none flex items-center justify-center text-[10px] font-bold shadow-lg animate-pulse"
                >
                  Brain
                </div>
                <div 
                  onMouseEnter={() => setActiveBrainNode('Web')}
                  onMouseLeave={() => setActiveBrainNode(null)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[8px] font-bold border transition-colors duration-200 ${activeBrainNode === 'Web' ? 'bg-accent-cyan border-accent-cyan text-text-primary' : 'bg-white/5 border-white/10 text-text-secondary'}`}
                >
                  PDF
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Feature 5: Organizer AI Dashboard */}
          <GlassCard className="flex flex-col justify-between h-[340px] border border-white/5 bg-surface-glass/20 group hover:border-accent-cyan/35">
            <div>
              <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 border border-accent-cyan/25 flex items-center justify-center text-accent-cyan mb-5 group-hover:scale-110 transition-transform">
                <CalendarCheck className="w-5 h-5 stroke-[1.5]" />
              </div>
              <h3 className="font-display font-semibold text-lg text-text-primary mb-2">
                Organizer AI Dashboard
              </h3>
              <p className="text-text-secondary text-xs leading-relaxed mb-4">
                Enable student clubs and university admins to target announcements to exact candidate fits based on skill matrices.
              </p>
            </div>

            {/* Visual Widget: Predicted turnout */}
            <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col gap-1.5 text-left select-none">
              <div className="flex justify-between items-center text-[9px] text-text-secondary">
                <span>Predicted Turnout Rate</span>
                <span className="text-accent-success font-bold">85% High</span>
              </div>
              {/* Turnout bar */}
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-accent-indigo to-accent-cyan h-full w-[85%] rounded-full" />
              </div>
              <span className="text-[8px] text-text-secondary/70">
                💡 Advice: Shift scheduling to Tuesday for B.Tech CSE students.
              </span>
            </div>
          </GlassCard>

          {/* Feature 6: AI Analytics Engine */}
          <GlassCard className="flex flex-col justify-between h-[340px] border border-white/5 bg-surface-glass/20 group hover:border-accent-indigo/35">
            <div>
              <div className="w-10 h-10 rounded-xl bg-accent-indigo/10 border border-accent-indigo/25 flex items-center justify-center text-accent-indigo mb-5 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-5 h-5 stroke-[1.5]" />
              </div>
              <h3 className="font-display font-semibold text-lg text-text-primary mb-2">
                AI Analytics Engine
              </h3>
              <p className="text-text-secondary text-xs leading-relaxed mb-4">
                Track campus engagement stats, active interest trends, and target bottlenecks in real-time.
              </p>
            </div>

            {/* Visual Widget: Mini bar chart */}
            <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col justify-between h-20 select-none">
              <div className="flex justify-between items-end h-full gap-3 px-2">
                <div className="flex flex-col items-center flex-1">
                  <div className="bg-accent-indigo/40 hover:bg-accent-indigo w-full h-8 rounded-t" />
                  <span className="text-[7px] text-text-secondary mt-1">UX</span>
                </div>
                <div className="flex flex-col items-center flex-1">
                  <div className="bg-accent-cyan w-full h-12 rounded-t" />
                  <span className="text-[7px] text-text-secondary mt-1">AI/ML</span>
                </div>
                <div className="flex flex-col items-center flex-1">
                  <div className="bg-accent-indigo/40 hover:bg-accent-indigo w-full h-6 rounded-t" />
                  <span className="text-[7px] text-text-secondary mt-1">React</span>
                </div>
              </div>
            </div>
          </GlassCard>

        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;

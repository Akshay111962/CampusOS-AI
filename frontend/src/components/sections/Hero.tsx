import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { GradientButton } from '../ui/GradientButton';
import { GlassCard } from '../ui/GlassCard';

export const Hero: React.FC = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-16 overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-10 w-[400px] h-[400px] rounded-full bg-accent-indigo/10 glow-orb" />
      <div className="absolute bottom-1/4 right-10 w-[400px] h-[400px] rounded-full bg-accent-cyan/10 glow-orb" />

      <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Content column */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            
            {/* New tag pill */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-accent-indigo/10 to-accent-cyan/10 border border-accent-indigo/20 px-3.5 py-1.5 rounded-full text-xs text-accent-cyan font-medium mb-6 shadow-sm shadow-accent-indigo/5"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-accent-cyan" />
              <span>Version 2.0: Active Matching Models</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-text-primary tracking-tight leading-[1.05] mb-6"
            >
              Your Campus. <br />
              <span className="text-gradient">Powered by AI.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-text-secondary text-base sm:text-lg max-w-xl mb-8 leading-relaxed"
            >
              Discover workshops, hackathons, internships, and events — before they disappear. CampusOS AI learns what you care about and brings opportunities straight to your feed.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4"
            >
              <Link to="/demo">
                <GradientButton variant="primary" glow className="flex items-center gap-2 group py-3 px-6 text-sm">
                  Get Started Free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </GradientButton>
              </Link>
              
              <a href="#demo-interactive">
                <GradientButton variant="secondary" className="text-sm py-3 px-6">
                  Explore Features
                </GradientButton>
              </a>
            </motion.div>
          </div>

          {/* Right Visual Dashboard Mockup Column */}
          <div className="lg:col-span-5 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative w-full mx-auto max-w-[440px] aspect-[4/3] rounded-2xl border border-white/5 bg-surface-glass/40 p-5 backdrop-blur-md shadow-2xl animate-float"
            >
              {/* Dashboard Layout Mockup */}
              <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4 text-xs text-text-secondary">
                <div className="flex items-center gap-1.5 font-medium">
                  <div className="w-2.5 h-2.5 rounded-full bg-accent-indigo" />
                  <span>Student Workspace</span>
                </div>
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                  <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                  <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                </div>
              </div>

              {/* Feed Content representation */}
              <div className="space-y-3">
                <div className="h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between px-3 text-[10px] text-text-secondary">
                  <span>Welcome back, Akshay</span>
                  <span className="text-accent-success font-medium">Synced ✓</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 text-left">
                  <div className="w-2/3 h-2 bg-white/10 rounded mb-2" />
                  <div className="w-1/2 h-1.5 bg-white/5 rounded" />
                </div>
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 text-left opacity-60">
                  <div className="w-1/2 h-2 bg-white/10 rounded mb-2" />
                  <div className="w-1/3 h-1.5 bg-white/5 rounded" />
                </div>
              </div>

              {/* Animated Notification Toast Sliding In */}
              <motion.div
                initial={{ opacity: 0, x: 50, y: 40, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                transition={{ delay: 1.2, duration: 0.5, type: 'spring', stiffness: 120 }}
                className="absolute -bottom-6 -right-6 md:-right-8 w-72 md:w-80 shadow-[0_20px_50px_rgba(99,102,241,0.3)] z-20"
              >
                <GlassCard aiBorder hoverEffect={false} className="p-4 bg-bg-deep/95 border border-accent-cyan/30 flex items-start gap-3 shadow-2xl">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-accent-indigo to-accent-cyan flex items-center justify-center shrink-0 shadow-lg">
                    <Sparkles className="w-5 h-5 text-text-primary" />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] text-accent-cyan font-bold uppercase tracking-wider">Urgent Match • 98%</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-urgent animate-ping" />
                    </div>
                    <h5 className="font-semibold text-xs text-text-primary leading-snug mb-1">
                      🎯 AI Research Workshop
                    </h5>
                    <p className="text-[10px] text-text-secondary flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-accent-amber shrink-0" />
                      Registration closes in 4 hours!
                    </p>
                  </div>
                </GlassCard>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Trust strip */}
        <div className="mt-24 border-t border-white/5 pt-10 text-center">
          <p className="text-text-secondary text-xs uppercase tracking-widest font-semibold mb-6">
            Connecting ambitious students at top universities
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-35 grayscale contrast-125 select-none">
            <span className="font-display font-bold text-lg text-text-primary tracking-tight">STANFORD</span>
            <span className="font-display font-bold text-lg text-text-primary tracking-tight">MIT</span>
            <span className="font-display font-bold text-lg text-text-primary tracking-tight">DAU TECHNOLOGIES</span>
            <span className="font-display font-bold text-lg text-text-primary tracking-tight">UC BERKELEY</span>
            <span className="font-display font-bold text-lg text-text-primary tracking-tight">HARVARD</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

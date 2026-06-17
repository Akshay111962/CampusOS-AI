import React from 'react';
import { ShieldCheck, BarChart3, Users, Zap, CheckCircle2 } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';

export const AdminPitch: React.FC = () => {
  const adminBenefits = [
    {
      title: 'Targeted Event Delivery',
      desc: 'No more generic blasts. Deliver announcement notices directly to candidates whose profiles score >80% matching.',
      icon: Users
    },
    {
      title: 'Attendance Predictions',
      desc: 'Our turnout forecasting algorithms analyze class load schedules to recommend the best dates/times to maximize rsvps.',
      icon: Zap
    },
    {
      title: 'Consolidated Ingestion',
      desc: 'Club leads submit posters or copy-paste text in seconds. The AI automatically compiles matching tags, locations, and schedules.',
      icon: BarChart3
    }
  ];

  return (
    <section id="for-universities" className="py-20 relative overflow-hidden border-t border-white/5 bg-bg-deep/30">
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] rounded-full bg-accent-cyan/5 glow-orb" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Visual Column */}
          <div className="lg:col-span-6 relative order-last lg:order-first">
            {/* Visual Glass Box Mockup */}
            <GlassCard hoverEffect={false} className="relative w-full max-w-[500px] mx-auto bg-surface-glass/40 border border-white/5 shadow-2xl p-6 rounded-2xl">
              
              {/* Mock Admin Dashboard Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6 text-xs text-text-secondary">
                <div className="flex items-center gap-2 font-medium">
                  <ShieldCheck className="w-4 h-4 text-accent-cyan" />
                  <span>Admin Control Console (DAU)</span>
                </div>
                <span className="bg-accent-success/15 text-accent-success font-semibold px-2 py-0.5 rounded text-[10px]">
                  System Connected
                </span>
              </div>

              {/* Stats Strip */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-left">
                  <span className="text-[10px] text-text-secondary block mb-1">Total Users</span>
                  <span className="font-display font-bold text-base text-text-primary">3,420</span>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-left">
                  <span className="text-[10px] text-text-secondary block mb-1">Active Clubs</span>
                  <span className="font-display font-bold text-base text-text-primary">18</span>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-left">
                  <span className="text-[10px] text-text-secondary block mb-1">Avg Turnout</span>
                  <span className="font-display font-bold text-base text-accent-success">92%</span>
                </div>
              </div>

              {/* Chart Mockup */}
              <div className="bg-white/5 border border-white/5 rounded-xl p-4 mb-4 text-left">
                <span className="text-xs text-text-secondary font-semibold block mb-3">RSVP Trends (Spring Semester)</span>
                
                {/* Simulated Graph Lines */}
                <div className="relative h-36 flex items-end justify-between px-2 pt-2 border-b border-l border-white/10 select-none">
                  {/* Graph Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between opacity-10 pointer-events-none">
                    <div className="border-t border-white h-px w-full" />
                    <div className="border-t border-white h-px w-full" />
                    <div className="border-t border-white h-px w-full" />
                  </div>
                  
                  {/* Bars representing growth */}
                  <div className="bg-gradient-to-t from-accent-indigo/60 to-accent-indigo w-6 h-[40%] rounded-t-sm" />
                  <div className="bg-gradient-to-t from-accent-indigo/60 to-accent-indigo w-6 h-[55%] rounded-t-sm" />
                  <div className="bg-gradient-to-t from-accent-indigo/60 to-accent-indigo w-6 h-[50%] rounded-t-sm" />
                  <div className="bg-gradient-to-t from-accent-indigo/60 to-accent-indigo w-6 h-[70%] rounded-t-sm" />
                  <div className="bg-gradient-to-t from-accent-cyan/60 to-accent-cyan w-6 h-[92%] rounded-t-sm" />
                </div>
                
                <div className="flex justify-between text-[9px] text-text-secondary mt-2 px-1">
                  <span>Jan</span>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Apr</span>
                  <span>May (CampusOS v2)</span>
                </div>
              </div>

              {/* Toast info */}
              <div className="bg-accent-indigo/10 border border-accent-indigo/35 text-[10px] text-text-primary p-2.5 rounded-lg text-left flex items-start gap-2 leading-relaxed">
                <CheckCircle2 className="w-4 h-4 text-accent-cyan shrink-0 mt-0.5" />
                <span>AI Prediction: Rescheduling <em>DevFest</em> from Friday to Thursday increased predicted student turnout from 64% to 88%. Match verified.</span>
              </div>
            </GlassCard>
          </div>

          {/* Right Text Content Column */}
          <div className="lg:col-span-6 text-left flex flex-col items-start justify-center">
            <span className="text-xs text-accent-cyan font-bold uppercase tracking-widest bg-accent-cyan/10 border border-accent-cyan/20 rounded-full px-3.5 py-1 mb-4 inline-block">
              For Administrators
            </span>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-text-primary tracking-tight leading-tight mb-6">
              Give Every Club and Department <br />
              <span className="text-gradient">An AI Co-Pilot.</span>
            </h2>
            <p className="text-text-secondary text-sm md:text-base leading-relaxed mb-8">
              University portals are where opportunities go to die. We consolidate event administration into a clean dashboard and utilize predictive intelligence to ensure your resources and lectures get maximum student engagement.
            </p>

            {/* Benefits rows */}
            <div className="space-y-6 w-full">
              {adminBenefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div key={index} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center shrink-0 text-accent-cyan">
                      <Icon className="w-5 h-5 stroke-[1.5]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-text-primary mb-1">{benefit.title}</h4>
                      <p className="text-xs text-text-secondary leading-relaxed max-w-md">{benefit.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AdminPitch;

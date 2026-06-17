import React from 'react';
import { UserCheck, BrainCircuit, Sparkles, BellRing, ArrowRight } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Build Your Profile',
      desc: 'Tell us your department, year, skills, and goals. Takes under 60 seconds.',
      icon: UserCheck,
      colorClass: 'text-accent-indigo bg-accent-indigo/10 border-accent-indigo/25'
    },
    {
      step: '02',
      title: 'AI Understands You',
      desc: 'Our AI builds a living interest graph mapping what specific topics actually matter to you.',
      icon: BrainCircuit,
      colorClass: 'text-accent-cyan bg-accent-cyan/10 border-accent-cyan/25'
    },
    {
      step: '03',
      title: 'Opportunities Matched',
      desc: 'Workshops, hackathons, and fellowship openings are indexed and matched automatically.',
      icon: Sparkles,
      colorClass: 'text-accent-success bg-accent-success/10 border-accent-success/25'
    },
    {
      step: '04',
      title: 'Get Notified Instantly',
      desc: 'Get high-relevance pings on WhatsApp or push before registration deadlines close.',
      icon: BellRing,
      colorClass: 'text-accent-amber bg-accent-amber/10 border-accent-amber/25'
    }
  ];

  return (
    <section id="how-it-works" className="py-20 relative overflow-hidden">
      {/* Background Subtle Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] rounded-full bg-accent-indigo/5 glow-orb" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs text-accent-cyan font-bold uppercase tracking-widest bg-accent-cyan/10 border border-accent-cyan/20 rounded-full px-3.5 py-1 mb-4 inline-block">
            Seamless Ingestion
          </span>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-text-primary tracking-tight mb-4">
            How CampusOS AI Works
          </h2>
          <p className="text-text-secondary text-sm md:text-base">
            From buried portals to personalized alerts. We bridge the opportunity gap with four simple steps.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div key={index} className="relative flex flex-col items-center">
                {/* Horizontal Connection Arrows (Desktop) */}
                {index < 3 && (
                  <div className="hidden md:block absolute top-12 left-[calc(50%+45px)] w-[calc(100%-90px)] z-0">
                    <div className="h-px border-t border-dashed border-white/25 flex items-center justify-center">
                      <ArrowRight className="w-4 h-4 text-white/20 translate-x-2 shrink-0 stroke-[1.5]" />
                    </div>
                  </div>
                )}

                {/* Step Glass Card */}
                <GlassCard className="relative w-full z-10 text-center flex flex-col items-center p-6 h-full border border-white/5 bg-surface-glass/30 hover:border-white/15">
                  
                  {/* Step bubble top right */}
                  <span className="absolute top-4 right-4 font-display font-bold text-xs text-text-secondary/35 tracking-tight">
                    {step.step}
                  </span>

                  {/* Icon Block */}
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border mb-5 shadow-inner ${step.colorClass}`}>
                    <Icon className="w-6 h-6 stroke-[1.5]" />
                  </div>

                  {/* Text */}
                  <h3 className="font-display font-semibold text-lg text-text-primary mb-3">
                    {step.title}
                  </h3>
                  <p className="text-text-secondary text-xs leading-relaxed max-w-[220px]">
                    {step.desc}
                  </p>
                </GlassCard>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

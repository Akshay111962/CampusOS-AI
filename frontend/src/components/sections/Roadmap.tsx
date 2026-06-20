import React from 'react';
import { Milestone } from 'lucide-react';
import { mockRoadmap } from '../../data/mockData';

export const Roadmap: React.FC = () => {
  return (
    <section id="roadmap" className="py-20 relative overflow-hidden">
      {/* Background Soft Glow */}
      <div className="absolute top-1/3 right-10 w-[500px] h-[500px] rounded-full bg-accent-indigo/5 glow-orb" />
      <div className="absolute bottom-1/3 left-10 w-[500px] h-[500px] rounded-full bg-accent-cyan/5 glow-orb" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Roadmap Header */}
        <div className="mb-16">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 text-xs text-accent-cyan font-bold uppercase tracking-widest bg-accent-cyan/10 border border-accent-cyan/20 rounded-full px-3.5 py-1 mb-4">
              <Milestone className="w-3.5 h-3.5" />
              <span>Future Outlook</span>
            </div>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-text-primary tracking-tight mb-4">
              Product Growth Roadmap
            </h2>
            <p className="text-text-secondary text-sm md:text-base">
              A preview of upcoming systems and features planned for future releases.
            </p>
          </div>
        </div>

        {/* Roadmap Timeline */}
        <div className="max-w-3xl mx-auto relative border-l border-white/10 ml-4 md:ml-auto md:border-l-0 pl-6 md:pl-0">
          
          {/* Vertical Connecting Center Line for Desktop */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-white/10 -translate-x-1/2" />

          <div className="space-y-12">
            {mockRoadmap.map((item, index) => {
              const isEven = index % 2 === 0;
              return (
                <div key={index} className="relative flex flex-col md:flex-row items-start md:items-center">
                  
                  {/* Bullet center indicator */}
                  <div className="absolute -left-[31px] md:left-1/2 top-1 md:top-1/2 -translate-y-1/2 w-4.5 h-4.5 rounded-full bg-bg-deep border-2 border-accent-cyan flex items-center justify-center -translate-x-1/2 z-20">
                    <span className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse-slow" />
                  </div>

                  {/* Desktop layout arrangement */}
                  <div className={`w-full md:w-1/2 ${isEven ? 'md:pr-12 md:text-right' : 'md:pl-12 md:order-last md:text-left'}`}>
                    <div className={`p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors inline-block w-full text-left`}>
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <span className="font-display font-extrabold text-sm text-accent-cyan">
                          {item.quarter}
                        </span>
                        
                        <span className="bg-white/5 text-[9px] font-bold px-2 py-0.5 rounded border border-white/5 text-text-secondary uppercase">
                          {item.status}
                        </span>
                      </div>

                      <h4 className="font-display font-bold text-base text-text-primary mb-1">
                        {item.title}
                      </h4>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Empty Spacer Column for Desktop */}
                  <div className="hidden md:block w-1/2" />
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};

export default Roadmap;

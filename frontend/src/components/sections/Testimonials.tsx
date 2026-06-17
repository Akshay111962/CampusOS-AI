import React from 'react';
import { Quote, Sparkles } from 'lucide-react';
import { mockTestimonials } from '../../data/mockData';
import { GlassCard } from '../ui/GlassCard';

export const Testimonials: React.FC = () => {
  // Simple colored placeholder avatars generator based on names
  const getAvatarStyle = (seed: string) => {
    switch (seed) {
      case 'akshay':
        return 'bg-gradient-to-tr from-accent-indigo to-accent-cyan text-text-primary';
      case 'sarah':
        return 'bg-gradient-to-tr from-accent-cyan to-accent-success text-text-primary';
      default:
        return 'bg-gradient-to-tr from-accent-indigo to-accent-amber text-text-primary';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  };

  return (
    <section id="stories" className="py-20 relative overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs text-accent-cyan font-bold uppercase tracking-widest bg-accent-cyan/10 border border-accent-cyan/20 rounded-full px-3.5 py-1 mb-4 inline-block">
            Student Stories
          </span>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-text-primary tracking-tight mb-4">
            Discovered by Students
          </h2>
          <p className="text-text-secondary text-sm md:text-base">
            See how CampusOS AI changed opportunity discovery for students across campus.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mockTestimonials.map((story) => {
            const initials = getInitials(story.name);
            const avatarColor = getAvatarStyle(story.avatarSeed);

            return (
              <GlassCard
                key={story.id}
                className="flex flex-col justify-between p-6 border border-white/5 bg-surface-glass/20 relative group hover:border-accent-cyan/35"
              >
                {/* Quote Icon overlay */}
                <Quote className="absolute top-6 right-6 w-10 h-10 text-white/5 stroke-[1] -z-0" />

                <div className="relative z-10">
                  {/* Rating Stars / Sparkle header */}
                  <div className="flex items-center gap-1 text-accent-cyan mb-4">
                    <Sparkles className="w-4 h-4 fill-accent-cyan/25" />
                    <span className="text-[10px] uppercase font-bold tracking-widest text-accent-cyan">Verified Match</span>
                  </div>

                  <p className="text-text-primary text-xs md:text-sm leading-relaxed mb-6 font-medium italic">
                    "{story.quote}"
                  </p>
                </div>

                {/* Profile card details */}
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/5 relative z-10">
                  <div className={`w-9 h-9 rounded-full font-display font-bold text-xs flex items-center justify-center border border-white/10 ${avatarColor}`}>
                    {initials}
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-text-primary">{story.name}</h4>
                    <span className="text-[10px] text-text-secondary block mt-0.5">
                      {story.role}
                    </span>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

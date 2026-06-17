import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Users, TrendingUp, ArrowRight } from 'lucide-react';
import Hero from '../components/sections/Hero';
import HowItWorks from '../components/sections/HowItWorks';
import FeaturesGrid from '../components/sections/FeaturesGrid';
import InteractiveDemo from '../components/demo/InteractiveDemo';
import Testimonials from '../components/sections/Testimonials';
import AdminPitch from '../components/sections/AdminPitch';
import PricingRoadmap from '../components/sections/PricingRoadmap';
import { GradientButton } from '../components/ui/GradientButton';

export const Home: React.FC = () => {
  const stats = [
    { value: '10,000+', label: 'Opportunities Matched', icon: Trophy, color: 'text-accent-indigo' },
    { value: '3x', label: 'Increase in Event RSVP Rates', icon: TrendingUp, color: 'text-accent-cyan' },
    { value: '92%', label: 'Students Discovered New Paths', icon: Users, color: 'text-accent-success' }
  ];

  return (
    <div className="w-full">
      {/* Hero Block */}
      <Hero />

      {/* How It Works Block */}
      <HowItWorks />

      {/* Features Grid Block */}
      <FeaturesGrid />

      {/* Central Interactive Demo Widget Section */}
      <section id="demo-interactive" className="py-20 border-t border-white/5 relative bg-bg-deep/50">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] rounded-full bg-accent-cyan/5 glow-orb" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs text-accent-cyan font-bold uppercase tracking-widest bg-accent-cyan/10 border border-accent-cyan/20 rounded-full px-3.5 py-1 mb-4 inline-block">
              Interactive Mock Sandbox
            </span>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-text-primary tracking-tight mb-4">
              Experience CampusOS AI Now
            </h2>
            <p className="text-text-secondary text-sm md:text-base">
              Switch tabs below to test the personalized student feed, the Campus AI chatbot assistant, or the deadline urgency trackers.
            </p>
          </div>

          <InteractiveDemo />
        </div>
      </section>

      {/* University Impact Stats Band */}
      <section className="py-16 border-y border-white/5 bg-gradient-to-r from-accent-indigo/5 via-transparent to-accent-cyan/5 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {stats.map((stat, sIdx) => {
              const Icon = stat.icon;
              return (
                <div key={sIdx} className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 ${stat.color}`}>
                    <Icon className="w-5 h-5 stroke-[1.5]" />
                  </div>
                  <span className="font-display font-extrabold text-4xl sm:text-5xl text-text-primary tracking-tight mb-2">
                    {stat.value}
                  </span>
                  <span className="text-text-secondary text-xs sm:text-sm font-medium uppercase tracking-wider">
                    {stat.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Social Proof Stories */}
      <Testimonials />

      {/* Admin / University Pitch Section */}
      <AdminPitch />

      {/* Pricing and Roadmap Teaser */}
      <PricingRoadmap />

      {/* Final Call to Action Block */}
      <section className="py-24 relative overflow-hidden border-t border-white/5 bg-gradient-to-tr from-accent-indigo/10 to-accent-cyan/10 text-center">
        {/* Background glow orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-accent-cyan/10 glow-orb" />
        
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <h2 className="font-display font-bold text-4xl md:text-5xl text-text-primary tracking-tight leading-tight mb-6">
            Stop Searching. <br />
            <span className="text-gradient">Start Discovering.</span>
          </h2>
          <p className="text-text-secondary text-base max-w-lg mx-auto mb-10 leading-relaxed">
            Join thousands of DAU students receiving relevant hackathons, workshops, and internship openings directly in their workspace.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/demo">
              <GradientButton variant="primary" glow className="flex items-center gap-2 py-3 px-8 text-sm group">
                Get Started Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </GradientButton>
            </Link>
            
            <a href="#pricing">
              <GradientButton variant="secondary" className="py-3 px-8 text-sm">
                View Pricing Tiers
              </GradientButton>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

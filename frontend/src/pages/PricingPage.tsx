import React, { useState } from 'react';
import { Sparkles, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { PricingRoadmap } from '../components/sections/PricingRoadmap';
import { GlassCard } from '../components/ui/GlassCard';

interface FAQItem {
  q: string;
  a: string;
}

export const PricingPage: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      q: 'Is CampusOS AI really free for students?',
      a: 'Yes! The basic dashboard, interest matching, opportunity search, and email notification digests are 100% free for students forever.'
    },
    {
      q: 'How does university club billing work?',
      a: 'Clubs can subscribe to the Campus Plan to unlock direct event publishing, SMS/WhatsApp broadcast targeting, and turnout prediction analytics. It can be billed directly to the club budget or sponsored by student affairs.'
    },
    {
      q: 'Can CampusOS integrate with our existing university portal?',
      a: 'Absolutely. Under the Enterprise plan, we support custom integrations with student information systems (SIS) like Banner, Canvas, or custom university LDAP/Single Sign-On (SSO) systems.'
    },
    {
      q: 'What is the accuracy of the matching algorithm?',
      a: 'Our models have a 92% student discovery relevance score. Since it uses local profile vectors (department classes, club history, select skills), it refines itself dynamically as you ignore or register for events.'
    }
  ];

  return (
    <div className="pt-28 pb-20 w-full min-h-[90vh]">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Title */}
        <div className="text-left max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 bg-accent-cyan/10 border border-accent-cyan/20 px-3 py-1 rounded-full text-xs text-accent-cyan font-medium mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pricing & roadmap</span>
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-text-primary tracking-tight leading-tight mb-4">
            Pricing Plans & Product Roadmap
          </h1>
          <p className="text-text-secondary text-sm md:text-base leading-relaxed">
            Get started for free or upgrade your campus to unlock turnout forecasting, SMS/WhatsApp alerts, and administrative dashboards.
          </p>
        </div>

        {/* Pricing & Roadmap component */}
        <div className="mb-16">
          <PricingRoadmap />
        </div>

        {/* FAQ Accordion Section */}
        <div className="max-w-3xl mx-auto text-left">
          <h3 className="font-display font-bold text-2xl text-text-primary mb-8 text-center flex items-center justify-center gap-2">
            <HelpCircle className="w-6 h-6 text-accent-cyan" />
            Frequently Asked Questions
          </h3>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openIdx === idx;
              return (
                <GlassCard
                  key={idx}
                  hoverEffect={false}
                  className="p-5 border border-white/5 bg-surface-glass/30 rounded-2xl cursor-pointer"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                >
                  <div className="flex items-center justify-between gap-4 select-none">
                    <span className="font-semibold text-xs md:text-sm text-text-primary leading-normal">
                      {faq.q}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-accent-cyan shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-text-secondary shrink-0" />
                    )}
                  </div>
                  
                  {isOpen && (
                    <p className="text-text-secondary text-xs leading-relaxed mt-4 pt-4 border-t border-white/5 animate-fade-in">
                      {faq.a}
                    </p>
                  )}
                </GlassCard>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PricingPage;

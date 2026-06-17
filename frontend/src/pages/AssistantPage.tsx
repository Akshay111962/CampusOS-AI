import React from 'react';
import { MessageSquare, Sparkles, AlertCircle } from 'lucide-react';
import { DemoChat } from '../components/demo/DemoChat';
import { GlassCard } from '../components/ui/GlassCard';

export const AssistantPage: React.FC = () => {
  const samplePrompts = [
    { text: '"Are there any internships matching Python?"', result: 'Returns Linear Tech Remote role + ML research project' },
    { text: '"What events close registration today?"', result: 'Filters deadlines for opportunities closing within 24 hours' },
    { text: '"Tell me about the Google speaker event"', result: 'Provides location, date, topic summaries, and instant RSVP' },
    { text: '"Are there any design workshops?"', result: 'Pulls the UI/UX workshop led by a Notion designer' }
  ];

  return (
    <div className="pt-28 pb-20 w-full min-h-[90vh]">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Title */}
        <div className="text-left max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 bg-accent-indigo/10 border border-accent-indigo/20 px-3 py-1 rounded-full text-xs text-accent-indigo font-medium mb-4">
            <MessageSquare className="w-3.5 h-3.5 text-accent-cyan" />
            <span>Interactive Chat Sandbox</span>
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-text-primary tracking-tight leading-tight mb-4">
            Ask Campus AI Assistant
          </h1>
          <p className="text-text-secondary text-sm md:text-base leading-relaxed">
            Campus AI acts as your personal student guide. It monitors notice boards, emails, and discord announcements. Ask questions, schedule deadline alerts, and sign up for events without leaving the chat.
          </p>
        </div>

        {/* Chat Widget Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-16">
          {/* Chat Window Column */}
          <div className="lg:col-span-8 flex flex-col justify-between">
            <DemoChat />
          </div>

          {/* Guide / Prompt Suggestions Column */}
          <div className="lg:col-span-4 flex flex-col gap-6 text-left">
            <GlassCard hoverEffect={false} className="bg-surface-glass/40 border border-white/5 p-6 h-full flex flex-col justify-between">
              <div>
                <h4 className="font-semibold text-sm text-text-primary mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent-cyan" />
                  NLP Context Search Examples
                </h4>
                <p className="text-text-secondary text-xs leading-relaxed mb-6">
                  Click the suggestion pills at the bottom of the chat or type custom phrases to see our AI categorize context and return structured registration badges.
                </p>

                {/* Example prompt list */}
                <div className="space-y-4">
                  {samplePrompts.map((prompt, idx) => (
                    <div key={idx} className="p-3 bg-white/5 border border-white/5 rounded-xl text-xs">
                      <code className="text-accent-cyan block font-semibold mb-1 leading-normal">
                        {prompt.text}
                      </code>
                      <span className="text-text-secondary text-[10px] leading-normal block">
                        {prompt.result}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notice summary */}
              <div className="mt-6 pt-6 border-t border-white/5 bg-accent-cyan/5 -mx-6 -mb-6 p-6 rounded-b-2xl">
                <h5 className="font-semibold text-xs text-text-primary mb-2 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-accent-cyan shrink-0" />
                  WhatsApp Alerts Enabled
                </h5>
                <p className="text-[10px] text-text-secondary leading-normal">
                  Our system connects with WhatsApp. If a crucial tech hackathon matches your profile with a score over 95%, Campus AI pings you with a direct 1-click registration link.
                </p>
              </div>
            </GlassCard>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AssistantPage;

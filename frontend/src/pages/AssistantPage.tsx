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
        <div className="text-center max-w-3xl mx-auto mb-12">
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
        <div className="max-w-4xl mx-auto mb-16">
          <DemoChat />
        </div>


      </div>
    </div>
  );
};

export default AssistantPage;

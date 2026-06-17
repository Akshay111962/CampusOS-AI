import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Send, User, Bot, HelpCircle, MapPin, Award } from 'lucide-react';
import { getBotResponse } from '../../data/mockData';
import type { Opportunity } from '../../data/mockData';
import { GradientButton } from '../ui/GradientButton';
import { DeadlineBadge } from '../ui/DeadlineBadge';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
  matchedEvents?: Opportunity[];
}

export const DemoChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-init-1',
      sender: 'bot',
      text: "👋 Hi Akshay! I'm Campus AI. I analyze DAU portal updates, Slack/WhatsApp groups, and notices so you don't have to.\n\nWhat opportunities are you searching for today?",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [registeredIds, setRegisteredIds] = useState<string[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    { label: 'AI hackathons 🚀', query: 'Show me AI hackathons' },
    { label: 'Design workshops 🎨', query: 'Are there any UI/UX design workshops?' },
    { label: 'Job & internships 💼', query: 'Are there any internship or research opportunities?' },
    { label: 'Urgent deadlines ⏳', query: 'What deadlines are coming up soon?' }
  ];

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMessage: Message = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI network thinking delay
    setTimeout(() => {
      const { responseText, matchedOpportunities } = getBotResponse(textToSend);
      
      const botMessage: Message = {
        id: `msg-bot-${Date.now()}`,
        sender: 'bot',
        text: responseText,
        timestamp: new Date(),
        matchedEvents: matchedOpportunities
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 750);
  };

  const handleRegister = (id: string) => {
    if (registeredIds.includes(id)) return;
    setRegisteredIds((prev) => [...prev, id]);

    confetti({
      particleCount: 80,
      spread: 50,
      origin: { y: 0.8 },
      colors: ['#6366F1', '#22D3EE', '#34D399']
    });
  };

  return (
    <div className="flex flex-col h-[520px] bg-surface-glass/40 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-md">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-accent-indigo to-accent-cyan flex items-center justify-center shadow-[0_0_10px_rgba(99,102,241,0.4)]">
            <Bot className="w-4 h-4 text-text-primary stroke-[1.5]" />
          </div>
          <div>
            <h4 className="font-display font-semibold text-sm text-text-primary tracking-tight">Campus AI</h4>
            <span className="text-[10px] text-accent-success font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-success animate-pulse" />
              Online • AI Agent
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-[10px] text-text-secondary">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Simulated Agent Model</span>
        </div>
      </div>

      {/* Messages Pane */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-2 mb-1">
                {isUser ? (
                  <>
                    <span className="text-[10px] text-text-secondary">Akshay</span>
                    <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
                      <User className="w-3 h-3 text-text-secondary" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-accent-indigo to-accent-cyan flex items-center justify-center">
                      <Bot className="w-3 h-3 text-text-primary" />
                    </div>
                    <span className="text-[10px] text-text-secondary">Campus AI</span>
                  </>
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`
                  px-4
                  py-3
                  rounded-2xl
                  text-xs
                  leading-relaxed
                  max-w-[85%]
                  whitespace-pre-line
                  border
                  ${isUser 
                    ? 'bg-gradient-to-r from-accent-indigo/15 to-accent-indigo/25 border-accent-indigo/30 text-text-primary rounded-tr-none' 
                    : 'bg-white/5 border-white/5 text-text-primary rounded-tl-none'
                  }
                `.trim()}
              >
                {msg.text}
              </div>

              {/* Render matched events inline if present */}
              {msg.matchedEvents && msg.matchedEvents.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-[90%] mt-3">
                  {msg.matchedEvents.map((opp) => {
                    const isRegistered = registeredIds.includes(opp.id);
                    return (
                      <div
                        key={opp.id}
                        className={`
                          p-3
                          rounded-xl
                          bg-white/5
                          border
                          transition-all
                          duration-300
                          ${isRegistered 
                            ? 'border-accent-success/40 bg-accent-success/5' 
                            : 'border-white/5 hover:border-accent-cyan/30'
                          }
                        `.trim()}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/5 text-text-secondary">
                            {opp.type}
                          </span>
                          <span className="text-[10px] font-bold text-accent-cyan">
                            {opp.matchScore}% Match
                          </span>
                        </div>
                        <h5 className="font-semibold text-xs text-text-primary truncate mb-1">
                          {opp.title}
                        </h5>
                        <div className="flex items-center gap-1 text-[9px] text-text-secondary mb-2 truncate">
                          <MapPin className="w-3 h-3" />
                          <span>{opp.location}</span>
                        </div>
                        
                        {/* reasoning mini pill */}
                        <div className="bg-white/5 rounded p-1.5 text-[9px] text-text-secondary mb-2 flex items-start gap-1 border border-white/5">
                          <Award className="w-3 h-3 text-accent-indigo flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{opp.reason}</span>
                        </div>

                        <div className="flex items-center justify-between gap-1 mt-2">
                          <DeadlineBadge hours={opp.deadlineHours} />
                          <button
                            onClick={() => handleRegister(opp.id)}
                            className={`
                              text-[10px]
                              font-semibold
                              px-2.5
                              py-1
                              rounded
                              transition-colors
                              cursor-pointer
                              ${isRegistered 
                                ? 'bg-accent-success/15 border border-accent-success/20 text-accent-success disabled' 
                                : 'bg-accent-indigo/20 border border-accent-indigo/45 text-text-primary hover:bg-accent-indigo/40'
                              }
                            `.trim()}
                            disabled={isRegistered}
                          >
                            {isRegistered ? 'RSVP\'d ✓' : 'RSVP'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex flex-col items-start animate-pulse">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-5 h-5 rounded-full bg-gradient-to-r from-accent-indigo to-accent-cyan flex items-center justify-center">
                <Bot className="w-3 h-3 text-text-primary" />
              </div>
              <span className="text-[10px] text-text-secondary">Campus AI is thinking...</span>
            </div>
            <div className="bg-white/5 border border-white/5 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Quick Suggestions Strip */}
      <div className="px-6 py-2 border-t border-white/5 bg-white/5 flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 select-none no-scrollbar">
        {quickPrompts.map((prompt, index) => (
          <button
            key={index}
            onClick={() => handleSend(prompt.query)}
            className="text-[10px] text-text-secondary hover:text-text-primary bg-white/5 hover:bg-accent-indigo/10 border border-white/10 rounded-full px-3 py-1 flex-shrink-0 transition-all cursor-pointer whitespace-nowrap"
          >
            {prompt.label}
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(inputText);
        }}
        className="flex items-center gap-2 px-6 py-4 border-t border-white/5 bg-bg-deep/50"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask Campus AI (e.g. 'Are there any hackathons this week?')..."
          className="flex-1 text-xs bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-text-primary placeholder:text-text-secondary/70 focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan outline-none transition-all"
        />
        <GradientButton
          type="submit"
          variant="primary"
          className="h-10 w-10 !p-0 rounded-xl flex items-center justify-center shrink-0"
        >
          <Send className="w-4 h-4 stroke-[2]" />
        </GradientButton>
      </form>
    </div>
  );
};

export default DemoChat;

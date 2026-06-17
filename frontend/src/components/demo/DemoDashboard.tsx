import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Check, ArrowUpRight, Award, MapPin } from 'lucide-react';
import { mockOpportunities } from '../../data/mockData';
import { GlassCard } from '../ui/GlassCard';
import { DeadlineBadge } from '../ui/DeadlineBadge';
import { GradientButton } from '../ui/GradientButton';
import { useAuth } from '../../context/AuthContext';

const mapLiveRecToOpp = (match: any): any => {
  const event = match.event;
  const deadlineDate = new Date(event.registration_deadline);
  const now = new Date();
  const diffMs = deadlineDate.getTime() - now.getTime();
  const diffHours = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60)));

  const typeMap: Record<string, string> = {
    'workshop': 'Workshop',
    'hackathon': 'Hackathon',
    'lecture': 'Campus Lecture',
    'alumni_meet': 'Alumni Meetup',
    'competition': 'Competition',
    'summer_school': 'Cohort/Bootcamp'
  };

  const dateStr = new Date(event.start_date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return {
    id: match.id,
    eventId: event.id,
    title: event.title,
    type: typeMap[event.category] || 'General Event',
    organizer: event.source === 'email' ? 'Synced Gmail Opportunity' : 'Official University Notice',
    matchScore: Math.round(match.relevance_score * 100),
    reason: match.reason,
    deadlineHours: diffHours,
    dateString: dateStr,
    location: event.registration_link || 'Online / Campus',
    description: event.description,
    tags: event.eligible_departments || ['Campus Opportunity']
  };
};

export const DemoDashboard: React.FC = () => {
  const { user, recommendations: liveRecs, submitRsvp } = useAuth();
  const [registeredIds, setRegisteredIds] = useState<string[]>([]);
  const [rsvpLoading, setRsvpLoading] = useState<string | null>(null);

  const isLive = !!(user && liveRecs && liveRecs.length > 0);
  const displayRecs = isLive 
    ? liveRecs.map(mapLiveRecToOpp).slice(0, 3) 
    : mockOpportunities.slice(0, 3);

  const handleRegister = async (oppId: string, registrationLink?: string) => {
    // Open the window synchronously first so browser doesn't block it
    let newWindow: Window | null = null;
    if (registrationLink && registrationLink.startsWith('http')) {
      newWindow = window.open(registrationLink, '_blank', 'noopener,noreferrer');
    }

    if (isLive) {
      try {
        setRsvpLoading(oppId);
        await submitRsvp(oppId);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.75 },
          colors: ['#6366F1', '#22D3EE', '#34D399', '#F59E0B']
        });
      } catch (err) {
        console.error('RSVP failed:', err);
        if (newWindow) {
          try {
            newWindow.close();
          } catch (e) {
            console.error('Failed to close window:', e);
          }
        }
      } finally {
        setRsvpLoading(null);
      }
    } else {
      if (registeredIds.includes(oppId)) return;
      setRegisteredIds((prev) => [...prev, oppId]);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.75 },
        colors: ['#6366F1', '#22D3EE', '#34D399', '#F59E0B']
      });
    }
  };

  const isOppRegistered = (opp: any) => {
    if (isLive) {
      const match = liveRecs.find((m: any) => m.id === opp.id);
      return match && match.status === 'registered';
    }
    return registeredIds.includes(opp.id);
  };

  return (
    <div className="w-full">
      {/* Greetings Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="font-display font-bold text-2xl text-text-primary tracking-tight flex items-center gap-2">
            Good morning, {user ? user.email.split('@')[0] : 'Akshay'} <span className="animate-bounce">👋</span>
          </h3>
          <p className="text-text-secondary text-sm">
            CampusOS AI model is updated. You have <span className="text-accent-cyan font-semibold">{displayRecs.length} high-match</span> opportunities waiting.
          </p>
        </div>
        
        {/* Dynamic status pill */}
        <div className="flex items-center gap-2 bg-white/5 border border-white/5 px-3 py-1.5 rounded-full text-xs text-text-secondary">
          <span className="w-2 h-2 rounded-full bg-accent-success animate-pulse" />
          <span>
            {user 
              ? `AI Profile Sync: Active (DAU ${user.department || 'Student'} Year ${user.year || ''})` 
              : 'AI Profile Sync: Active (DAU B.Tech CS)'}
          </span>
        </div>
      </div>

      {/* Grid of matches */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {displayRecs.map((opp) => {
          const isRegistered = isOppRegistered(opp);

          return (
            <GlassCard
              key={opp.id}
              className={`
                relative
                flex
                flex-col
                justify-between
                min-h-[360px]
                border
                transition-all
                duration-300
                ${isRegistered 
                  ? 'border-accent-success/40 bg-accent-success/5 shadow-[0_4px_20px_-5px_rgba(52,211,153,0.15)]' 
                  : 'hover:border-accent-indigo/30'
                }
              `.trim()}
              aiBorder={opp.matchScore >= 95 && !isRegistered}
            >
              {/* Card Header (Match rate & category tag) */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full bg-white/5 text-text-secondary border border-white/5">
                    {opp.type}
                  </span>
                  
                  {/* Match percentage pill */}
                  <div className="flex items-center gap-1 bg-gradient-to-r from-accent-indigo/15 to-accent-cyan/15 border border-accent-indigo/25 px-2.5 py-1 rounded-full text-xs text-accent-cyan font-semibold shadow-sm">
                    <Sparkles className="w-3 h-3 text-accent-cyan animate-pulse" />
                    <span>{opp.matchScore}% Match</span>
                  </div>
                </div>

                {/* Organizer & Title */}
                <span className="text-xs text-text-secondary font-medium tracking-tight block mb-1">
                  {opp.organizer}
                </span>
                <h4 className="font-display font-bold text-lg text-text-primary leading-snug tracking-tight mb-2 flex items-start gap-1 group">
                  {opp.title}
                  <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300 text-text-secondary flex-shrink-0 mt-1" />
                </h4>

                {/* Event Location */}
                <div className="flex items-center gap-1 text-[11px] text-text-secondary mb-3">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="truncate">{opp.location}</span>
                </div>

                {/* Description */}
                <p className="text-text-secondary text-xs leading-relaxed mb-4 line-clamp-3">
                  {opp.description}
                </p>
              </div>

              {/* Card Footer (Reasoning, deadline and Register button) */}
              <div className="mt-4 pt-4 border-t border-white/5 flex flex-col gap-4">
                {/* AI Reasoning box */}
                <div className="bg-white/5 rounded-lg p-2.5 border border-white/5 text-[11px] text-text-secondary leading-normal flex items-start gap-2">
                  <Award className="w-4 h-4 text-accent-indigo flex-shrink-0 mt-0.5" />
                  <span>{opp.reason}</span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <DeadlineBadge hours={opp.deadlineHours} />
                  
                  <GradientButton
                    variant={isRegistered ? 'ghost' : 'secondary'}
                    onClick={() => handleRegister(opp.id, opp.location)}
                    className={`
                      text-xs
                      px-3.5
                      py-2
                      rounded-lg
                      flex
                      items-center
                      gap-1.5
                      ${isRegistered 
                        ? 'bg-accent-success/10 border border-accent-success/30 text-accent-success hover:bg-accent-success/20 cursor-default' 
                        : 'border border-accent-cyan/20 hover:border-accent-cyan/50 text-accent-cyan'
                      }
                    `.trim()}
                    disabled={isRegistered || rsvpLoading === opp.id}
                  >
                    {isRegistered ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Registered
                      </>
                    ) : rsvpLoading === opp.id ? (
                      'RSVP-ing...'
                    ) : (
                      'RSVP Now'
                    )}
                  </GradientButton>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
};

export default DemoDashboard;

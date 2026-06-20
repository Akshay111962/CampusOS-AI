import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Calendar, Check, Clock, Sparkles } from 'lucide-react';
import { mockOpportunities } from '../../data/mockData';
import { DeadlineBadge } from '../ui/DeadlineBadge';
import { GradientButton } from '../ui/GradientButton';
import { useAuth } from '../../context/AuthContext';
import { calculateScoreAndReason } from './DemoDashboard';

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

export const DemoDeadlines: React.FC = () => {
  const { user, recommendations: liveRecs, submitRsvp } = useAuth();
  const [registeredIds, setRegisteredIds] = useState<string[]>([]);
  const [rsvpLoading, setRsvpLoading] = useState<string | null>(null);

  const isLive = !!(user && liveRecs && liveRecs.length > 0);

  const activeProfile = (() => {
    const saved = localStorage.getItem('campusos_demo_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      department: 'Computer Science',
      year: 3,
      skills: ['React', 'Python', 'Figma'],
      interests: ['Machine Learning', 'UI/UX', 'Web Development'],
      clubs: ['Google Developer Group (DAU Chapter)'],
      rsvps: ['AI Speaker Series', 'Web3 Cohort']
    };
  })();

  const displayEvents = isLive 
    ? liveRecs.map(mapLiveRecToOpp).sort((a: any, b: any) => a.deadlineHours - b.deadlineHours)
    : mockOpportunities.map(opp => {
        const { score } = calculateScoreAndReason(opp, activeProfile);
        return {
          ...opp,
          matchScore: score
        };
      }).sort((a, b) => a.deadlineHours - b.deadlineHours);

  const handleRegister = async (oppId: string) => {
    const currentEvent = displayEvents.find((e: any) => e.id === oppId);
    const linkToOpen = (currentEvent?.location && currentEvent.location.startsWith('http'))
      ? currentEvent.location
      : (currentEvent?.link || null);

    if (linkToOpen && linkToOpen.startsWith('http')) {
      window.open(linkToOpen, '_blank', 'noopener,noreferrer');
    }

    if (isLive) {
      try {
        setRsvpLoading(oppId);
        await submitRsvp(oppId);
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#6366F1', '#22D3EE', '#34D399']
        });
      } catch (err) {
        console.error('RSVP failed:', err);
      } finally {
        setRsvpLoading(null);
      }
    } else {
      if (registeredIds.includes(oppId)) return;
      setRegisteredIds((prev) => [...prev, oppId]);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#6366F1', '#22D3EE', '#34D399']
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
    <div className="w-full bg-surface-glass/30 border border-white/5 rounded-2xl p-6 backdrop-blur-md">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h4 className="font-display font-semibold text-lg text-text-primary tracking-tight">Timeline & Upcoming Deadlines</h4>
          <p className="text-text-secondary text-xs">Opportunities sorted chronologically by registration closing times.</p>
        </div>
        
        <div className="flex items-center gap-1.5 text-xs text-accent-cyan bg-accent-cyan/10 px-3 py-1 rounded-full border border-accent-cyan/20">
          <Clock className="w-3.5 h-3.5" />
          <span>Real-time Sync</span>
        </div>
      </div>

      {/* Timeline List */}
      <div className="relative border-l border-white/10 ml-3 pl-6 space-y-6">
        {displayEvents.map((event) => {
          const isRegistered = isOppRegistered(event);
          const isUrgent = event.deadlineHours <= 24;

          return (
            <div key={event.id} className="relative group">
              {/* Timeline Connector Dot */}
              <div
                className={`
                  absolute
                  -left-[31px]
                  top-1.5
                  w-4
                  h-4
                  rounded-full
                  border-2
                  flex
                  items-center
                  justify-center
                  transition-all
                  duration-300
                  ${isRegistered 
                    ? 'bg-accent-success border-accent-success shadow-[0_0_8px_#34D399]' 
                    : isUrgent 
                      ? 'bg-bg-deep border-accent-urgent shadow-[0_0_8px_#F87171]' 
                      : 'bg-bg-deep border-white/30'
                  }
                `.trim()}
              >
                {isRegistered ? (
                  <Check className="w-2.5 h-2.5 text-bg-deep stroke-[3]" />
                ) : (
                  <div className={`w-1.5 h-1.5 rounded-full ${isUrgent ? 'bg-accent-urgent animate-pulse' : 'bg-white/40'}`} />
                )}
              </div>

              {/* Event Content Row */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/5 group-hover:border-white/10 transition-colors">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <DeadlineBadge hours={event.deadlineHours} />
                    
                    <span className="text-[10px] text-text-secondary font-medium bg-white/5 border border-white/5 px-2 py-0.5 rounded-md uppercase tracking-wider">
                      {event.type}
                    </span>
                    
                    <div className="flex items-center gap-1 text-[10px] text-accent-cyan bg-gradient-to-r from-accent-indigo/10 to-accent-cyan/10 px-2 py-0.5 rounded-md border border-accent-indigo/15">
                      <Sparkles className="w-3 h-3 text-accent-cyan" />
                      <span>{event.matchScore}% Match</span>
                    </div>
                  </div>

                  <h5
                    onClick={() => {
                      const linkToOpen = event.link || (event.location && event.location.startsWith('http') ? event.location : null);
                      if (linkToOpen) {
                        window.open(linkToOpen, '_blank', 'noopener,noreferrer');
                      }
                    }}
                    className={`font-display font-semibold text-sm text-text-primary mb-1 ${
                      (event.link || (event.location && event.location.startsWith('http'))) ? 'cursor-pointer hover:text-accent-cyan transition-colors' : ''
                    }`}
                  >
                    {event.title}
                  </h5>
                  
                  <div className="flex items-center gap-4 text-xs text-text-secondary">
                    <span className="font-medium">{event.organizer}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 stroke-[1.5]" />
                      {event.dateString}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-center">
                  <GradientButton
                    variant={isRegistered ? 'ghost' : 'secondary'}
                    onClick={() => handleRegister(event.id)}
                    className={`
                      text-xs
                      px-4
                      py-2
                      rounded-lg
                      ${isRegistered 
                        ? 'bg-accent-success/10 border border-accent-success/30 text-accent-success hover:bg-accent-success/20 cursor-default' 
                        : 'border-white/10 hover:border-accent-cyan/40 hover:bg-white/5 text-text-primary'
                      }
                    `.trim()}
                    disabled={isRegistered || rsvpLoading === event.id}
                  >
                    {isRegistered ? (
                      <span className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" />
                        Registered
                      </span>
                    ) : rsvpLoading === event.id ? (
                      'RSVP-ing...'
                    ) : (
                      'RSVP Now'
                    )}
                  </GradientButton>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DemoDeadlines;

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Check, ArrowUpRight, Award, Loader2 } from 'lucide-react';
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

const mapEventToOpp = (event: any): any => {
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
    id: event.id,
    title: event.title,
    type: typeMap[event.category] || 'General Event',
    organizer: event.source === 'email' ? 'Synced Gmail Opportunity' : 'Official University Notice',
    deadlineHours: diffHours,
    dateString: dateStr,
    location: event.registration_link || 'Online / Campus',
    description: event.description,
    tags: event.eligible_departments || ['Campus Event'],
    registrationLink: event.registration_link
  };
};

export const calculateScoreAndReason = (opp: any, userProfile: any) => {
  let score = 55; // baseline score
  const matchedSkills: string[] = [];
  const matchedInterests: string[] = [];

  const profileSkills = userProfile.skills || [];
  const profileInterests = userProfile.interests || [];
  const dept = userProfile.department || '';

  // 1. Match skills with tags, title, description
  profileSkills.forEach((skill: string) => {
    const s = skill.toLowerCase().trim();
    if (!s) return;
    const matchesTag = opp.tags.some((tag: string) => tag.toLowerCase() === s);
    const matchesTitle = opp.title.toLowerCase().includes(s);
    const matchesDesc = opp.description.toLowerCase().includes(s);

    if (matchesTag || matchesTitle || matchesDesc) {
      score += 15;
      matchedSkills.push(skill);
    }
  });

  // 2. Match interests with tags, title, description
  profileInterests.forEach((interest: string) => {
    const inter = interest.toLowerCase().trim();
    if (!inter) return;
    const matchesTag = opp.tags.some((tag: string) => tag.toLowerCase().includes(inter) || inter.includes(tag.toLowerCase()));
    const matchesTitle = opp.title.toLowerCase().includes(inter);
    const matchesDesc = opp.description.toLowerCase().includes(inter);

    if (matchesTag || matchesTitle || matchesDesc) {
      score += 15;
      matchedInterests.push(interest);
    }
  });

  // 3. Match department
  const d = dept.toLowerCase();
  if (d.includes('computer') || d.includes('tech') || d.includes('information')) {
    if (opp.tags.some((t: string) => ['ai/ml', 'react', 'pytorch', 'typescript', 'tailwind'].includes(t.toLowerCase()))) {
      score += 10;
    }
  } else if (d.includes('design')) {
    if (opp.tags.some((t: string) => ['ui/ux', 'figma', 'portfolio', 'product management'].includes(t.toLowerCase()))) {
      score += 20;
    }
  }

  // Cap score between 60 and 99
  score = Math.min(99, Math.max(60, score));

  // 4. Generate dynamic reasoning
  let reason = '';
  if (matchedSkills.length > 0 && matchedInterests.length > 0) {
    reason = `Matches your profile skill "${matchedSkills[0]}" and interest in ${matchedInterests[0]}`;
  } else if (matchedInterests.length > 0) {
    reason = `Recommended based on your interest in ${matchedInterests.join(' & ')}`;
  } else if (matchedSkills.length > 0) {
    reason = `High fit for your skill set in ${matchedSkills.join(', ')}`;
  } else {
    reason = `Relevant to your course in ${dept}`;
  }

  return { score, reason };
};

interface DemoDashboardProps {
  demoProfile?: {
    department: string;
    year: number;
    skills: string[];
    interests: string[];
    clubs: string[];
    rsvps: string[];
  };
}

export const DemoDashboard: React.FC<DemoDashboardProps> = () => {
  const { user, token, profile, recommendations: liveRecs, submitRsvp, updateProfile, recommendationsLoading } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [registeredIds, setRegisteredIds] = useState<string[]>([]);
  const [rsvpLoading, setRsvpLoading] = useState<string | null>(null);

  // Profile Form States
  const [skillsInput, setSkillsInput] = useState('');
  const [interestsInput, setInterestsInput] = useState('');
  const [deptInput, setDeptInput] = useState('Computer Science');
  const [yearInput, setYearInput] = useState<number>(3);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [skipRecs, setSkipRecs] = useState(false);

  // Sync profile details when loaded
  useEffect(() => {
    if (user) {
      setDeptInput(user.department || 'Computer Science');
      setYearInput(user.year || 3);
    }
    if (profile) {
      if (profile.skills && profile.skills.length > 0) {
        setSkillsInput(profile.skills.join(', '));
      }
      if (profile.interests && profile.interests.length > 0) {
        setInterestsInput(profile.interests.join(', '));
      }
    }
  }, [user, profile]);

  // Fetch all events from API on mount/token change
  useEffect(() => {
    const fetchAllEvents = async () => {
      if (!token) return;
      try {
        setEventsLoading(true);
        const res = await fetch(`http://127.0.0.1:8000/api/v1/events?upcoming_only=true&limit=100`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setEvents(data);
        }
      } catch (err) {
        console.error('Failed to fetch all events:', err);
      } finally {
        setEventsLoading(false);
      }
    };
    fetchAllEvents();
  }, [token]);

  // Recommendations mapping (real data from recommendations API only, no mock data fallback)
  const displayRecs = liveRecs ? liveRecs.map(mapLiveRecToOpp) : [];
  const mappedEvents = events ? events.map(mapEventToOpp) : [];

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      setFormSubmitting(true);
      const skillsArray = skillsInput.split(',').map(s => s.trim()).filter(Boolean);
      const interestsArray = interestsInput.split(',').map(i => i.trim()).filter(Boolean);
      await updateProfile(interestsArray, skillsArray, deptInput, yearInput);
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#6366F1', '#22D3EE', '#34D399']
      });
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleRegister = async (oppId: string, registrationLink?: string) => {
    let newWindow: Window | null = null;
    const currentOpp = displayRecs.find((o) => o.id === oppId);
    const actualLink = (registrationLink && registrationLink.startsWith('http'))
      ? registrationLink
      : (currentOpp?.location || null);

    if (actualLink && actualLink.startsWith('http')) {
      newWindow = window.open(actualLink, '_blank', 'noopener,noreferrer');
    }

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
  };

  const handleAllEventsRegister = async (eventId: string, registrationLink?: string) => {
    if (registrationLink && registrationLink.startsWith('http')) {
      window.open(registrationLink, '_blank', 'noopener,noreferrer');
    }
    
    // Check if there is an associated match in recommendations
    const associatedMatch = liveRecs.find((m: any) => m.event_id === eventId);
    if (associatedMatch && token) {
      try {
        setRsvpLoading(eventId);
        await submitRsvp(associatedMatch.id);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.75 },
          colors: ['#6366F1', '#22D3EE', '#34D399', '#F59E0B']
        });
      } catch (err) {
        console.error('RSVP failed:', err);
      } finally {
        setRsvpLoading(null);
      }
    } else {
      if (registeredIds.includes(eventId)) return;
      setRegisteredIds((prev) => [...prev, eventId]);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.75 },
        colors: ['#6366F1', '#22D3EE', '#34D399', '#F59E0B']
      });
    }
  };

  const isOppRegistered = (opp: any) => {
    const match = liveRecs.find((m: any) => m.id === opp.id);
    return match && match.status === 'registered';
  };

  const isEventRegistered = (eventId: string) => {
    const match = liveRecs.find((m: any) => m.event_id === eventId);
    if (match) {
      return match.status === 'registered';
    }
    return registeredIds.includes(eventId);
  };

  return (
    <div className="w-full space-y-12">
      {/* Greetings Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-display font-bold text-2xl text-text-primary tracking-tight flex items-center gap-2 text-left">
            Good morning, {user ? user.email.split('@')[0] : 'Student'} <span className="animate-bounce">👋</span>
          </h3>
          <p className="text-text-secondary text-sm text-left">
            CampusOS AI model is updated. You have <span className="text-accent-cyan font-semibold">{displayRecs.length} high-match</span> opportunities waiting.
          </p>
        </div>
        
        {/* Dynamic status pill */}
        <div className="flex items-center gap-2 bg-white/5 border border-white/5 px-3 py-1.5 rounded-full text-xs text-text-secondary self-start md:self-auto">
          <span className="w-2 h-2 rounded-full bg-accent-success animate-pulse" />
          <span>
            {user 
              ? `AI Profile Sync: Active (DAU ${user.department || 'Student'} Year ${user.year || ''})` 
              : 'AI Profile Sync: Active'}
          </span>
        </div>
      </div>

      {/* SECTION 2: RECOMMENDED FOR YOU (Only shown if NOT skipped) */}
      {!skipRecs && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-left">
            <h4 className="font-display font-bold text-xl text-text-primary flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent-cyan" />
              Recommended For You
            </h4>
            <span className="text-[10px] bg-accent-indigo/25 text-accent-cyan border border-accent-indigo/20 px-2.5 py-0.5 rounded-full font-semibold w-fit">
              AI selected events based on my profile
            </span>
          </div>

          {/* Syncing Banner — shown when AI matching is running in background */}
          {recommendationsLoading && (
            <div className="flex items-center gap-3 bg-accent-indigo/10 border border-accent-indigo/25 rounded-xl px-4 py-3 text-xs text-accent-indigo">
              <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
              <span>
                <span className="font-semibold">AI is recalculating your matches</span> based on your updated profile. This will refresh automatically...
              </span>
            </div>
          )}

          {(!profile || !profile.interests?.length || !profile.skills?.length) ? (
            <GlassCard className="max-w-2xl mx-auto p-6 md:p-8 border border-white/10 bg-surface-glass/40 shadow-xl backdrop-blur-md">
              <div className="flex items-center gap-2 mb-4 justify-center">
                <Sparkles className="w-6 h-6 text-accent-cyan animate-pulse" />
                <h5 className="font-display font-bold text-lg text-text-primary">
                  Personalize Your AI Opportunity Feed
                </h5>
              </div>
              <p className="text-xs text-text-secondary mb-6 text-center max-w-md mx-auto leading-relaxed">
                You don't have recommendations yet. Enter your skills and interests to let the AI matching engine connect you with high-fit workshops, hackathons, and seminars.
              </p>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  {/* Department selection */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider">
                      Department
                    </label>
                    <select
                      value={deptInput}
                      onChange={(e) => setDeptInput(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-text-primary focus:outline-none focus:border-accent-cyan cursor-pointer appearance-none"
                    >
                      <option value="Computer Science" className="bg-bg-deep">Computer Science</option>
                      <option value="Information Technology" className="bg-bg-deep">Information Technology</option>
                      <option value="Design" className="bg-bg-deep">Design</option>
                      <option value="Electronics" className="bg-bg-deep">Electronics</option>
                      <option value="Electrical Engineering" className="bg-bg-deep">Electrical Engineering</option>
                    </select>
                  </div>

                  {/* Year of study selection */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider">
                      Year of Study
                    </label>
                    <select
                      value={yearInput}
                      onChange={(e) => setYearInput(Number(e.target.value))}
                      className="bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-text-primary focus:outline-none focus:border-accent-cyan cursor-pointer appearance-none"
                    >
                      <option value={1} className="bg-bg-deep">1st Year</option>
                      <option value={2} className="bg-bg-deep">2nd Year</option>
                      <option value={3} className="bg-bg-deep">3rd Year</option>
                      <option value={4} className="bg-bg-deep">4th Year</option>
                    </select>
                  </div>
                </div>

                {/* Skills field */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider">
                    Skills (comma-separated, e.g. React, Python, Figma)
                  </label>
                  <input
                    type="text"
                    required
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    placeholder="e.g. React, Python, Figma"
                    className="bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-xs text-text-primary focus:outline-none focus:border-accent-cyan"
                  />
                </div>

                {/* Interests field */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider">
                    Interests (comma-separated, e.g. Machine Learning, UI/UX, Robotics)
                  </label>
                  <input
                    type="text"
                    required
                    value={interestsInput}
                    onChange={(e) => setInterestsInput(e.target.value)}
                    placeholder="e.g. Machine Learning, UI/UX, Web Development"
                    className="bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-xs text-text-primary focus:outline-none focus:border-accent-cyan"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-3">
                  <GradientButton
                    type="submit"
                    variant="primary"
                    glow
                    className="flex-1 justify-center py-3 text-xs cursor-pointer"
                    disabled={formSubmitting}
                  >
                    {formSubmitting ? 'Calculating Matches...' : 'Save & Calculate Recommendations'}
                  </GradientButton>

                  <button
                    type="button"
                    onClick={() => setSkipRecs(true)}
                    className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-text-secondary hover:text-text-primary rounded-xl cursor-pointer text-xs transition-colors"
                  >
                    Skip & View All Events
                  </button>
                </div>
              </form>
            </GlassCard>
          ) : displayRecs.length === 0 ? (
            <div className="text-center py-10 bg-white/5 border border-white/5 rounded-2xl p-6 text-text-secondary max-w-2xl mx-auto">
              <Sparkles className="w-6 h-6 text-accent-cyan animate-pulse mx-auto mb-2" />
              <p className="text-sm font-semibold mb-1 text-text-primary">No matching recommendations found</p>
              <p className="text-xs">We couldn't find any events directly matching your skills and interests. Try updating your tags in the Profile tab or check out the list of all events below.</p>
            </div>
          ) : (

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
                      min-h-[340px]
                      border
                      transition-all
                      duration-300
                      text-left
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
                      <h4
                        onClick={() => {
                          const linkToOpen = opp.location && opp.location.startsWith('http') ? opp.location : null;
                          if (linkToOpen) {
                            window.open(linkToOpen, '_blank', 'noopener,noreferrer');
                          }
                        }}
                        className={`font-display font-bold text-lg text-text-primary leading-snug tracking-tight mb-2 flex items-start gap-1 group ${
                          (opp.location && opp.location.startsWith('http')) ? 'cursor-pointer hover:text-accent-cyan transition-colors' : ''
                        }`}
                      >
                        {opp.title}
                        {(opp.location && opp.location.startsWith('http')) && (
                          <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300 text-text-secondary flex-shrink-0 mt-1" />
                        )}
                      </h4>

                      {/* Event Date */}
                      <div className="text-xs text-accent-cyan font-semibold mb-2">
                        Date: {opp.dateString}
                      </div>
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
          )}
        </div>
      )}

      {/* SECTION 1: ALL EVENTS */}
      <div className="space-y-4 pt-6 border-t border-white/5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-left">
          <h4 className="font-display font-bold text-xl text-text-primary">
            All Events
          </h4>
          <span className="text-[10px] bg-white/10 text-text-secondary border border-white/10 px-2.5 py-0.5 rounded-full font-semibold w-fit">
            Everything happening in DAU
          </span>
        </div>

        {eventsLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-accent-cyan mx-auto mb-2"></div>
            <p className="text-xs text-text-secondary">Loading DAU events...</p>
          </div>
        ) : mappedEvents.length === 0 ? (
          <div className="text-center py-10 bg-white/5 border border-white/5 rounded-2xl p-6 text-text-secondary">
            <p className="text-sm font-semibold mb-1 text-text-primary">No events available in the database</p>
            <p className="text-xs">The database is currently empty. Run the scraper manually or check scheduler settings to fetch events.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {mappedEvents.map((opp) => {
              const isRegistered = isEventRegistered(opp.id);

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
                    text-left
                    ${isRegistered 
                      ? 'border-accent-success/40 bg-accent-success/5 shadow-[0_4px_20px_-5px_rgba(52,211,153,0.15)]' 
                      : 'hover:border-accent-indigo/30'
                    }
                  `.trim()}
                >
                  {/* Card Header (Category tag) */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full bg-white/5 text-text-secondary border border-white/5">
                        {opp.type}
                      </span>
                    </div>

                    {/* Organizer & Title */}
                    <span className="text-xs text-text-secondary font-medium tracking-tight block mb-1">
                      {opp.organizer}
                    </span>
                    <h4
                      onClick={() => {
                        if (opp.registrationLink && opp.registrationLink.startsWith('http')) {
                          window.open(opp.registrationLink, '_blank', 'noopener,noreferrer');
                        }
                      }}
                      className={`font-display font-bold text-lg text-text-primary leading-snug tracking-tight mb-2 flex items-start gap-1 group ${
                        opp.registrationLink ? 'cursor-pointer hover:text-accent-cyan transition-colors' : ''
                      }`}
                    >
                      {opp.title}
                      {opp.registrationLink && (
                        <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300 text-text-secondary flex-shrink-0 mt-1" />
                      )}
                    </h4>

                    {/* Event Date */}
                    <div className="text-xs text-accent-indigo font-semibold mb-2">
                      Date: {opp.dateString}
                    </div>

                    {/* Description */}
                    <p className="text-text-secondary text-xs leading-relaxed mb-4 line-clamp-3">
                      {opp.description}
                    </p>

                    {/* Registration Link Display */}
                    {opp.registrationLink ? (
                      <div className="text-[10px] text-accent-cyan/85 truncate mb-2 max-w-full">
                        <span className="text-text-secondary">Link: </span>
                        <a href={opp.registrationLink} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          {opp.registrationLink}
                        </a>
                      </div>
                    ) : (
                      <div className="text-[10px] text-text-secondary italic mb-2">
                        No external registration link
                      </div>
                    )}
                  </div>

                  {/* Card Footer (deadline and Register button) */}
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between gap-2">
                    <DeadlineBadge hours={opp.deadlineHours} />
                    
                    <GradientButton
                      variant={isRegistered ? 'ghost' : 'secondary'}
                      onClick={() => handleAllEventsRegister(opp.id, opp.registrationLink)}
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
                      disabled={isRegistered || (rsvpLoading === opp.id) || !opp.registrationLink}
                    >
                      {isRegistered ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Registered
                        </>
                      ) : rsvpLoading === opp.id ? (
                        'Registering...'
                      ) : (
                        opp.registrationLink ? 'Register Now' : 'No Link'
                      )}
                    </GradientButton>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DemoDashboard;

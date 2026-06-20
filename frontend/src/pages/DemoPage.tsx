import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Shield, Cpu, CheckCircle } from 'lucide-react';
import { DemoDashboard } from '../components/demo/DemoDashboard';
import { GlassCard } from '../components/ui/GlassCard';
import { useAuth } from '../context/AuthContext';

export const DemoPage: React.FC = () => {
  const { token, profile: authProfile, updateProfile } = useAuth();
  
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('campusos_demo_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {
      department: 'Computer Science',
      year: 3,
      skills: ['React', 'Python', 'Figma'],
      interests: ['Machine Learning', 'UI/UX', 'Web Development'],
      clubs: ['Google Developer Group (DAU Chapter)'],
      rsvps: ['AI Speaker Series', 'Web3 Cohort']
    };
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editDept, setEditDept] = useState(profile.department);
  const [editYear, setEditYear] = useState(profile.year);
  const [editSkills, setEditSkills] = useState(profile.skills.join(', '));
  const [editInterests, setEditInterests] = useState(profile.interests.join(', '));

  useEffect(() => {
    if (authProfile) {
      setProfile({
        department: authProfile.department || 'Computer Science',
        year: authProfile.year || 3,
        skills: authProfile.skills || [],
        interests: authProfile.interests || [],
        clubs: authProfile.clubs || ['Google Developer Group (DAU Chapter)'],
        rsvps: authProfile.past_events || []
      });
    }
  }, [authProfile]);

  useEffect(() => {
    setEditDept(profile.department);
    setEditYear(profile.year);
    setEditSkills(profile.skills.join(', '));
    setEditInterests(profile.interests.join(', '));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('campusos_demo_profile', JSON.stringify(profile));
  }, [profile]);

  const handleSaveProfile = async () => {
    const updated = {
      ...profile,
      department: editDept,
      year: Number(editYear),
      skills: editSkills.split(',').map((s: string) => s.trim()).filter(Boolean),
      interests: editInterests.split(',').map((i: string) => i.trim()).filter(Boolean)
    };
    setProfile(updated);
    setIsEditing(false);

    if (token) {
      try {
        await updateProfile(updated.interests, updated.skills, updated.department, updated.year);
      } catch (err) {
        console.error('Failed to update backend profile:', err);
      }
    }
  };
  const matchingSignals = [
    { label: 'Academic Ingestion', desc: 'Syncs automatically with university SIS registries to grab course structures, department tracks, and credits.', rate: '100%' },
    { label: 'Interests Graphing', desc: 'Scans student preferences, Github project repositories, Figma teams, and past club sign-ups to build local fit curves.', rate: '94%' },
    { label: 'Timing Optimizer', desc: 'Analyzes midterms, finals schedules, and club density patterns to map alerts onto empty study windows.', rate: '88%' }
  ];

  return (
    <div className="pt-28 pb-20 w-full min-h-[90vh]">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Title */}
        <div className="text-left max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 bg-accent-cyan/10 border border-accent-cyan/20 px-3 py-1 rounded-full text-xs text-accent-cyan font-medium mb-4">
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Interactive Product Workspace</span>
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-text-primary tracking-tight leading-tight mb-4">
            Personalized Student Dashboard
          </h1>
          <p className="text-text-secondary text-sm md:text-base leading-relaxed">
            Every student sees a unique dashboard layout. CampusOS AI matches internships, hackathons, and speaker workshops in real-time, helping you prioritize high-fit opportunities.
          </p>
        </div>

        {/* Live Dashboard Section */}
        <div className="mb-16">
          <div className="bg-white/5 border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-md">
            <DemoDashboard demoProfile={profile} />
          </div>
        </div>

        {/* AI Ingestion details explanation */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 text-left space-y-6">
            <h3 className="font-display font-semibold text-xl text-text-primary tracking-tight">
              Under the Hood: The CampusOS AI Fit Score
            </h3>
            <p className="text-text-secondary text-xs md:text-sm leading-relaxed">
              How does the system know you match a research project or a tech hackathon? Our local university matching model evaluates student profiles across multiple dimensions, assigning weighting metrics that update dynamically.
            </p>
            
            {/* Matching parameters */}
            <div className="space-y-4">
              {matchingSignals.map((sig, idx) => (
                <div key={idx} className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                  <div className="w-10 h-10 rounded-lg bg-accent-indigo/10 border border-accent-indigo/25 text-accent-cyan flex items-center justify-center shrink-0">
                    <Cpu className="w-5 h-5 stroke-[1.5]" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <h4 className="font-semibold text-xs text-text-primary">{sig.label}</h4>
                      <span className="text-[10px] text-accent-cyan font-bold bg-accent-cyan/10 px-1.5 py-0.5 rounded border border-accent-cyan/20">
                        {sig.rate} Accuracy
                      </span>
                    </div>
                    <p className="text-[11px] text-text-secondary leading-normal">{sig.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Signal clusters card */}
          <div className="lg:col-span-5 text-left">
            <GlassCard hoverEffect={false} className="border border-white/5 bg-surface-glass/40 p-6">
              <h4 className="font-semibold text-sm text-text-primary mb-4 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-accent-cyan" />
                  Active Student Signals
                </span>
                {!isEditing && (
                  <button 
                    onClick={() => setIsEditing(true)} 
                    className="text-[10px] text-accent-cyan hover:underline font-semibold uppercase tracking-wider cursor-pointer"
                  >
                    Edit Signals
                  </button>
                )}
              </h4>
              
              {isEditing ? (
                <div className="space-y-4 text-xs">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-text-secondary font-semibold uppercase tracking-wider text-[10px]">Department</label>
                    <select
                      value={editDept}
                      onChange={(e) => setEditDept(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg py-2 px-3 focus:outline-none focus:border-accent-cyan text-text-primary text-xs cursor-pointer appearance-none"
                    >
                      <option value="Computer Science" className="bg-bg-deep">Computer Science</option>
                      <option value="Information Technology" className="bg-bg-deep">Information Technology</option>
                      <option value="Design" className="bg-bg-deep">Design</option>
                      <option value="Electronics" className="bg-bg-deep">Electronics</option>
                      <option value="Electrical Engineering" className="bg-bg-deep">Electrical Engineering</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-text-secondary font-semibold uppercase tracking-wider text-[10px]">Year of Study</label>
                    <select
                      value={editYear}
                      onChange={(e) => setEditYear(Number(e.target.value))}
                      className="bg-white/5 border border-white/10 rounded-lg py-2 px-3 focus:outline-none focus:border-accent-cyan text-text-primary text-xs cursor-pointer appearance-none"
                    >
                      <option value={1} className="bg-bg-deep">1st Year</option>
                      <option value={2} className="bg-bg-deep">2nd Year</option>
                      <option value={3} className="bg-bg-deep">3rd Year</option>
                      <option value={4} className="bg-bg-deep">4th Year</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-text-secondary font-semibold uppercase tracking-wider text-[10px]">Verified Skills (comma separated)</label>
                    <input
                      type="text"
                      value={editSkills}
                      onChange={(e) => setEditSkills(e.target.value)}
                      placeholder="e.g. React, Python, Figma"
                      className="bg-white/5 border border-white/10 rounded-lg py-2 px-3 focus:outline-none focus:border-accent-cyan text-text-primary text-xs"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-text-secondary font-semibold uppercase tracking-wider text-[10px]">Interests (comma separated)</label>
                    <input
                      type="text"
                      value={editInterests}
                      onChange={(e) => setEditInterests(e.target.value)}
                      placeholder="e.g. Machine Learning, UI/UX"
                      className="bg-white/5 border border-white/10 rounded-lg py-2 px-3 focus:outline-none focus:border-accent-cyan text-text-primary text-xs"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleSaveProfile}
                      className="flex-1 bg-gradient-to-r from-accent-indigo to-accent-cyan text-text-primary font-semibold py-2 rounded-lg cursor-pointer hover:shadow-lg transition-all text-xs"
                    >
                      Save & Re-calculate
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditDept(profile.department);
                        setEditYear(profile.year);
                        setEditSkills(profile.skills.join(', '));
                        setEditInterests(profile.interests.join(', '));
                      }}
                      className="px-3 bg-white/5 hover:bg-white/10 border border-white/10 text-text-secondary hover:text-text-primary py-2 rounded-lg cursor-pointer transition-all text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <ul className="space-y-3.5 text-xs text-text-secondary">
                    <li className="flex items-center gap-2.5">
                      <CheckCircle className="w-4 h-4 text-accent-success shrink-0" />
                      <span>{profile.department} (Year {profile.year})</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle className="w-4 h-4 text-accent-success shrink-0" />
                      <span>Verified Skills: {profile.skills.join(', ')}</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle className="w-4 h-4 text-accent-success shrink-0" />
                      <span>Interests: {profile.interests.join(', ')}</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle className="w-4 h-4 text-accent-success shrink-0" />
                      <span>Clubs: {profile.clubs.join(', ')}</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle className="w-4 h-4 text-accent-success shrink-0" />
                      <span>Past RSVPs: {profile.rsvps.join(', ')}</span>
                    </li>
                  </ul>
                  
                  <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center text-[10px] text-text-secondary">
                    <span>Last Updated Profile Model</span>
                    <span className="text-accent-cyan font-bold uppercase">Just now</span>
                  </div>
                </div>
              )}
            </GlassCard>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DemoPage;

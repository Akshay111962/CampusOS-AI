import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Calendar, Plus, X, ArrowRight, CheckCircle, BrainCircuit } from 'lucide-react';
import { GradientButton } from '../components/ui/GradientButton';

export const ProfilePage: React.FC = () => {
  const { user, profile, updateProfile } = useAuth();
  const navigate = useNavigate();
  
  const [department, setDepartment] = useState('Computer Science');
  const [year, setYear] = useState<number>(3);
  const [interests, setInterests] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [careerGoals, setCareerGoals] = useState('');
  
  const [interestInput, setInterestInput] = useState('');
  const [skillInput, setSkillInput] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Initialize fields if profile already exists
  useEffect(() => {
    if (profile) {
      setInterests(profile.interests || []);
      setSkills(profile.skills || []);
      setCareerGoals(profile.career_goals || '');
    }
    if (user) {
      if (user.department) setDepartment(user.department);
      if (user.year) setYear(user.year);
    }
  }, [profile, user]);

  const handleAddInterest = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = interestInput.trim();
    if (clean && !interests.includes(clean)) {
      setInterests([...interests, clean]);
    }
    setInterestInput('');
  };

  const handleRemoveInterest = (index: number) => {
    setInterests(interests.filter((_, i) => i !== index));
  };

  const handleAddSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = skillInput.trim();
    if (clean && !skills.includes(clean)) {
      setSkills([...skills, clean]);
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    // Safety net: Automatically add any typed text that wasn't submitted as a tag yet
    let finalInterests = [...interests];
    const cleanInterest = interestInput.trim();
    if (cleanInterest && !finalInterests.includes(cleanInterest)) {
      finalInterests.push(cleanInterest);
      setInterests(finalInterests);
      setInterestInput('');
    }

    let finalSkills = [...skills];
    const cleanSkill = skillInput.trim();
    if (cleanSkill && !finalSkills.includes(cleanSkill)) {
      finalSkills.push(cleanSkill);
      setSkills(finalSkills);
      setSkillInput('');
    }

    // Explicit validation: Require at least one interest and one skill to continue
    if (finalInterests.length === 0) {
      setError('Please add at least one interest by typing it and clicking "+" or pressing Enter.');
      setSubmitting(false);
      return;
    }
    if (finalSkills.length === 0) {
      setError('Please add at least one skill by typing it and clicking "+" or pressing Enter.');
      setSubmitting(false);
      return;
    }

    try {
      await updateProfile(finalInterests, finalSkills, department, year, careerGoals);
      setSuccess('Profile updated successfully! Welcome to CampusOS AI.');
      // Auto scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Redirect to home dashboard
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen pt-32 pb-16 px-4 md:px-8 bg-bg-deep flex flex-col items-center justify-start overflow-hidden">
      {/* Background glow orbs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-accent-indigo/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] rounded-full bg-accent-cyan/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-2xl bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 shadow-[0_0_50px_rgba(99,102,241,0.1)] backdrop-blur-xl animate-fade-in relative z-10">
        
        {/* Header Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-accent-cyan/10 border border-accent-cyan/20">
            <BrainCircuit className="w-4 h-4 text-accent-cyan" />
            <span className="text-xs text-accent-cyan font-bold tracking-widest uppercase">AI Agent Matching Profile</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl md:text-4xl text-text-primary tracking-tight mb-3">
            Setup Your <span className="text-gradient">Student Profile</span>
          </h1>
          <p className="text-sm text-text-secondary max-w-md mx-auto leading-relaxed">
            Tell us about your department, year, interests, and skills so our AI matches you with the best hackathons, seminars, and internships.
          </p>
        </div>

        {/* Status Alert Messages */}
        {error && (
          <div className="bg-accent-urgent/10 border border-accent-urgent/25 text-accent-urgent text-xs p-4 rounded-xl mb-6 leading-normal animate-slide-in">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-accent-success/10 border border-accent-success/25 text-accent-success text-xs p-4 rounded-xl mb-6 leading-normal flex items-start gap-2.5 animate-slide-in">
            <CheckCircle className="w-4.5 h-4.5 shrink-0 text-accent-success" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Department & Year selects in grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2 text-left">
              <label className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Department</label>
              <div className="relative">
                <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-secondary" />
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-sm focus:outline-none focus:border-accent-cyan transition-colors cursor-pointer appearance-none text-text-primary"
                >
                  <option value="Computer Science" className="bg-bg-deep">Computer Science</option>
                  <option value="Information Technology" className="bg-bg-deep">Information Technology</option>
                  <option value="Design" className="bg-bg-deep">Design</option>
                  <option value="Electronics" className="bg-bg-deep">Electronics</option>
                  <option value="Electrical Engineering" className="bg-bg-deep">Electrical Engineering</option>
                </select>
              </div>
            </div>

            <div className="space-y-2 text-left">
              <label className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Year of Study</label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-secondary" />
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-sm focus:outline-none focus:border-accent-cyan transition-colors cursor-pointer appearance-none text-text-primary"
                >
                  <option value={1} className="bg-bg-deep">1st Year</option>
                  <option value={2} className="bg-bg-deep">2nd Year</option>
                  <option value={3} className="bg-bg-deep">3rd Year</option>
                  <option value={4} className="bg-bg-deep">4th Year</option>
                </select>
              </div>
            </div>
          </div>

          {/* Interactive Interests Tags Input */}
          <div className="space-y-2 text-left">
            <label className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Interests (e.g. AI, Cyber Security, Web Dev)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={interestInput}
                onChange={(e) => setInterestInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddInterest();
                  }
                }}
                placeholder="Type and press Add or Enter..."
                className="flex-grow bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-sm focus:outline-none focus:border-accent-cyan transition-colors text-text-primary"
              />
              <button
                type="button"
                onClick={handleAddInterest}
                className="px-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-white/10 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {/* Render interest tag pills */}
            <div className="flex flex-wrap gap-2 pt-2">
              {interests.length === 0 ? (
                <span className="text-xs text-text-secondary italic">No interests added yet.</span>
              ) : (
                interests.map((interest, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent-indigo/15 border border-accent-indigo/35 text-accent-indigo animate-scale-in"
                  >
                    {interest}
                    <button
                      type="button"
                      onClick={() => handleRemoveInterest(idx)}
                      className="hover:text-text-primary transition-colors focus:outline-none"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Interactive Skills Tags Input */}
          <div className="space-y-2 text-left">
            <label className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Skills (e.g. Python, Figma, React)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                placeholder="Type and press Add or Enter..."
                className="flex-grow bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-sm focus:outline-none focus:border-accent-cyan transition-colors text-text-primary"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-white/10 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {/* Render skill tag pills */}
            <div className="flex flex-wrap gap-2 pt-2">
              {skills.length === 0 ? (
                <span className="text-xs text-text-secondary italic">No skills added yet.</span>
              ) : (
                skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent-cyan/15 border border-accent-cyan/35 text-accent-cyan animate-scale-in"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(idx)}
                      className="hover:text-text-primary transition-colors focus:outline-none"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Career Goals Description */}
          <div className="space-y-2 text-left">
            <label className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Career Goals</label>
            <textarea
              rows={4}
              value={careerGoals}
              onChange={(e) => setCareerGoals(e.target.value)}
              placeholder="Tell us what you aim to achieve, like 'Study machine learning, build high scale web apps, work in robotics...'"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-sm focus:outline-none focus:border-accent-cyan transition-colors text-text-primary resize-none"
            />
          </div>

          {/* Submit Action button */}
          <div className="pt-4">
            <GradientButton
              type="submit"
              variant="primary"
              glow
              disabled={submitting}
              className="w-full justify-center py-4 font-semibold text-sm cursor-pointer transition-all"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></span>
                  Saving Profile...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Save and Sync Profile
                  <ArrowRight className="w-4.5 h-4.5" />
                </span>
              )}
            </GradientButton>
          </div>

        </form>

      </div>
    </div>
  );
};

export default ProfilePage;

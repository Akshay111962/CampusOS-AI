import React, { useState } from 'react';
import { ShieldCheck, Calculator, Sparkles, MessageCircle, AlertTriangle } from 'lucide-react';
import { AdminPitch } from '../components/sections/AdminPitch';
import { GlassCard } from '../components/ui/GlassCard';
import { GradientButton } from '../components/ui/GradientButton';

export const UniversitiesPage: React.FC = () => {
  const [eventName, setEventName] = useState('React App Development Hackathon');
  const [department, setDepartment] = useState('Computer Science');
  const [estimatedStats, setEstimatedStats] = useState<{
    students: number;
    fitRate: number;
    turnout: number;
    advice: string;
  } | null>({
    students: 284,
    fitRate: 96,
    turnout: 89,
    advice: 'Excellent match! Recommending push alerts to B.Tech Year 2 & 3 CS students. Predicted peak turnout is Thursday afternoon.'
  });

  const handleEstimate = () => {
    // Generate simulated turnout analytics based on inputs
    const studentsBase = department.includes('Science') || department.includes('CS') || department.includes('Computer') ? 220 : 110;
    const rngStudents = studentsBase + Math.floor(Math.random() * 80);
    const rngFit = 80 + Math.floor(Math.random() * 19);
    const rngTurnout = 70 + Math.floor(Math.random() * 25);
    
    let adviceText = '';
    if (rngTurnout > 85) {
      adviceText = `Strong turnout predicted! Broadcast via WhatsApp & SMS. The model suggests scheduling this in the Main Auditorium on Tuesday.`;
    } else if (rngTurnout > 75) {
      adviceText = `Good alignment. We suggest targeting juniors and seniors with previous hackathon registrations. Optimal slot: Wednesday 3 PM.`;
    } else {
      adviceText = `Moderate turnout. Try adding 'Skills Development' or 'Portfolio Credit' tags to increase student matches.`;
    }

    setEstimatedStats({
      students: rngStudents,
      fitRate: rngFit,
      turnout: rngTurnout,
      advice: adviceText
    });
  };

  return (
    <div className="pt-28 pb-20 w-full min-h-[90vh]">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Title */}
        <div className="text-left max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 bg-accent-cyan/10 border border-accent-cyan/20 px-3 py-1 rounded-full text-xs text-accent-cyan font-medium mb-4">
            <ShieldCheck className="w-3.5 h-3.5 text-accent-success" />
            <span>Administrator Portal Sandbox</span>
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-text-primary tracking-tight leading-tight mb-4">
            Give Every Club & Department an AI Co-Pilot
          </h1>
          <p className="text-text-secondary text-sm md:text-base leading-relaxed">
            Consolidate notices, automate event announcements, and maximize student attendance. Our analytics modeling maps candidate matches, enabling organizers to publish and verify fit within minutes.
          </p>
        </div>

        {/* Live Admin Pitch Section */}
        <div className="mb-16">
          <AdminPitch />
        </div>

        {/* Interactive Estimator Sandbox */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Form Side */}
          <div className="lg:col-span-5 text-left">
            <GlassCard hoverEffect={false} className="bg-surface-glass/40 border border-white/5 p-6 h-full flex flex-col justify-between">
              <div>
                <h4 className="font-semibold text-sm text-text-primary mb-3 flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-accent-cyan" />
                  Turnout Estimator Sandbox
                </h4>
                <p className="text-text-secondary text-xs leading-relaxed mb-6">
                  Input a mock event title and target student cluster to let the AI forecast matching stats and schedule advice.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block mb-1">
                      Event Title
                    </label>
                    <input
                      type="text"
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                      className="w-full text-xs bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-text-primary outline-none focus:border-accent-cyan transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block mb-1">
                      Target Major/Department
                    </label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full text-xs bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-text-primary outline-none focus:border-accent-cyan transition-all cursor-pointer"
                    >
                      <option value="Computer Science">Computer Science / IT</option>
                      <option value="Data Science">Data Science / Analytics</option>
                      <option value="Interaction Design">Interaction Design / UX</option>
                      <option value="Electrical Engineering">Electrical Engineering</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                      <option value="Business & Finance">Business Administration</option>
                    </select>
                  </div>
                </div>
              </div>

              <GradientButton
                variant="primary"
                onClick={handleEstimate}
                className="w-full text-xs py-3 mt-6 cursor-pointer"
              >
                Estimate Turnout Fit
              </GradientButton>
            </GlassCard>
          </div>

          {/* Results Side */}
          <div className="lg:col-span-7 text-left">
            <div className="bg-white/5 border border-white/5 rounded-2xl p-6 h-full flex flex-col justify-between">
              <div>
                <h4 className="font-semibold text-sm text-text-primary mb-6 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent-cyan" />
                  Predictive Analysis Report
                </h4>

                {estimatedStats ? (
                  <div className="space-y-6">
                    {/* Stat Numbers */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                        <span className="text-[9px] text-text-secondary uppercase block mb-1">Students Matched</span>
                        <span className="font-display font-bold text-lg text-text-primary">{estimatedStats.students}</span>
                      </div>
                      <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                        <span className="text-[9px] text-text-secondary uppercase block mb-1">Avg Fit Score</span>
                        <span className="font-display font-bold text-lg text-accent-cyan">{estimatedStats.fitRate}%</span>
                      </div>
                      <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                        <span className="text-[9px] text-text-secondary uppercase block mb-1">Est. RSVP Rate</span>
                        <span className="font-display font-bold text-lg text-accent-success">{estimatedStats.turnout}%</span>
                      </div>
                    </div>

                    {/* AI scheduling Advice */}
                    <div className="bg-accent-indigo/15 border border-accent-indigo/35 rounded-xl p-4 text-xs text-text-primary leading-relaxed flex items-start gap-2.5">
                      <MessageCircle className="w-5 h-5 text-accent-cyan shrink-0 mt-0.5" />
                      <div>
                        <strong className="block mb-1 text-accent-cyan">Scheduling Advice:</strong>
                        {estimatedStats.advice}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-40 flex items-center justify-center border border-dashed border-white/10 rounded-xl text-xs text-text-secondary">
                    Click 'Estimate Turnout Fit' to compile forecasting models.
                  </div>
                )}
              </div>

              {/* Notice badge */}
              <div className="bg-yellow-500/10 border border-yellow-500/25 p-3.5 rounded-xl text-[10px] text-yellow-400 leading-normal flex items-start gap-2 mt-6">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Estimate report model values are simulated based on average DAU enrollment metrics and historical attendance indicators (Spring 2026).</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UniversitiesPage;

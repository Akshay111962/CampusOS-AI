import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, GraduationCap, Calendar, CheckCircle } from 'lucide-react';
import { GradientButton } from './GradientButton';

export const AuthGate: React.FC = () => {
  const { login, register } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('register'); // Show sign up first
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [year, setYear] = useState<number>(3);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Domain restriction check
    if (!email.endsWith('@dau.ac.in')) {
      setError('Registration is restricted to the university domain (@dau.ac.in).');
      return;
    }

    setLoading(true);
    try {
      await register(email, password, 'student', department, year);
      setSuccessMsg('Account registered successfully! Logging you in...');
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-bg-deep overflow-hidden py-12 px-4">
      {/* Background radial glow orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-accent-indigo/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-accent-cyan/10 blur-[120px] pointer-events-none" />

      {/* Main Container Card */}
      <div className="relative w-full max-w-md bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 shadow-[0_0_50px_rgba(99,102,241,0.15)] backdrop-blur-lg animate-fade-in">
        
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-3">
            <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-accent-indigo to-accent-cyan flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.4)]">
              <div className="w-3.5 h-3.5 rounded-full bg-bg-deep" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight text-text-primary">
              CampusOS<span className="text-gradient font-extrabold ml-1">AI</span>
            </span>
          </div>
          <h2 className="font-display font-bold text-xl text-text-primary mt-2">
            {activeTab === 'login' ? 'Sign in to CampusOS' : 'Join Smart Campus'}
          </h2>
          <p className="text-xs text-text-secondary mt-1 max-w-xs mx-auto">
            {activeTab === 'login' 
              ? 'Enter credentials to load your AI opportunities feed.' 
              : 'Create a secure student account for live matching.'}
          </p>
        </div>

        {/* Tab Toggle selectors */}
        <div className="flex bg-white/5 border border-white/5 p-1 rounded-2xl mb-6 select-none">
          <button
            onClick={() => { setActiveTab('register'); setError(''); setSuccessMsg(''); }}
            className={`flex-1 py-2.5 text-center text-xs font-semibold rounded-xl cursor-pointer transition-colors ${activeTab === 'register' ? 'bg-gradient-to-r from-accent-indigo/15 to-accent-cyan/15 border border-accent-indigo/25 text-accent-cyan shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
          >
            Sign Up
          </button>
          <button
            onClick={() => { setActiveTab('login'); setError(''); setSuccessMsg(''); }}
            className={`flex-1 py-2.5 text-center text-xs font-semibold rounded-xl cursor-pointer transition-colors ${activeTab === 'login' ? 'bg-gradient-to-r from-accent-indigo/15 to-accent-cyan/15 border border-accent-indigo/25 text-accent-cyan shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
          >
            Sign In
          </button>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="bg-accent-urgent/10 border border-accent-urgent/25 text-accent-urgent text-xs p-3.5 rounded-xl mb-4 leading-normal">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="bg-accent-success/10 border border-accent-success/25 text-accent-success text-xs p-3.5 rounded-xl mb-4 leading-normal flex items-start gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Login Form */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="text-xs text-text-secondary font-medium">Student Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <input
                  type="email"
                  required
                  placeholder="name@dau.ac.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-accent-cyan transition-colors text-text-primary"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-xs text-text-secondary font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-accent-cyan transition-colors text-text-primary"
                />
              </div>
            </div>

            <GradientButton 
              type="submit" 
              variant="primary" 
              glow 
              className="w-full justify-center py-3.5 mt-2.5 font-semibold text-sm cursor-pointer"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </GradientButton>
          </form>
        )}

        {/* Registration Form */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="text-xs text-text-secondary font-medium">University Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <input
                  type="email"
                  required
                  placeholder="student@dau.ac.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-accent-cyan transition-colors text-text-primary"
                />
              </div>
              <span className="text-[10px] text-accent-cyan font-medium block">
                * Note: Restricted to @dau.ac.in domains
              </span>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-xs text-text-secondary font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <input
                  type="password"
                  required
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-accent-cyan transition-colors text-text-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-left">
              <div className="space-y-1.5">
                <label className="text-xs text-text-secondary font-medium">Department</label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-xl py-3 pl-9 pr-3 text-xs focus:outline-none focus:border-accent-cyan transition-colors cursor-pointer appearance-none text-text-primary"
                  >
                    <option value="Computer Science" className="bg-bg-deep">Computer Science</option>
                    <option value="Information Technology" className="bg-bg-deep">IT</option>
                    <option value="Design" className="bg-bg-deep">Design</option>
                    <option value="Electronics" className="bg-bg-deep">Electronics</option>
                    <option value="Electrical Engineering" className="bg-bg-deep">Electrical</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-text-secondary font-medium">Year of Study</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                  <select
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/5 rounded-xl py-3 pl-9 pr-3 text-xs focus:outline-none focus:border-accent-cyan transition-colors cursor-pointer appearance-none text-text-primary"
                  >
                    <option value={1} className="bg-bg-deep">1st Year</option>
                    <option value={2} className="bg-bg-deep">2nd Year</option>
                    <option value={3} className="bg-bg-deep">3rd Year</option>
                    <option value={4} className="bg-bg-deep">4th Year</option>
                  </select>
                </div>
              </div>
            </div>

            <GradientButton 
              type="submit" 
              variant="primary" 
              glow 
              className="w-full justify-center py-3.5 mt-2.5 font-semibold text-sm cursor-pointer"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </GradientButton>
          </form>
        )}

      </div>
    </div>
  );
};

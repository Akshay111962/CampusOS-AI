import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Mail, Lock, GraduationCap, Calendar, CheckCircle } from 'lucide-react';
import { GradientButton } from './GradientButton';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [year, setYear] = useState<number>(3);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setError('');
    setSuccessMsg('');
    setLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      handleClose();
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
      
      // Auto login immediately
      await login(email, password);
      setTimeout(() => {
        handleClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-deep/80 backdrop-blur-sm p-4">
      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-bg-deep/90 border border-white/10 rounded-3xl p-6 md:p-8 shadow-[0_0_50px_rgba(99,102,241,0.25)] backdrop-blur-md animate-fade-in text-left">
        
        {/* Close Button */}
        <button 
          onClick={handleClose} 
          className="absolute top-4 right-4 p-2 rounded-full border border-white/5 hover:border-white/20 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
 
        {/* Logo/Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-accent-indigo to-accent-cyan flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-bg-deep" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight text-text-primary">
              CampusOS<span className="text-gradient font-extrabold ml-1">AI</span>
            </span>
          </div>
          <h3 className="font-display font-semibold text-xl text-text-primary">
            {activeTab === 'login' ? 'Welcome Back' : 'Join Smart Campus'}
          </h3>
          <p className="text-xs text-text-secondary mt-1">
            {activeTab === 'login' ? 'Sign in to access your opportunity dashboard.' : 'Create a secure student account for live matching.'}
          </p>
        </div>
 
        {/* Tab Toggle */}
        <div className="flex bg-white/5 border border-white/5 p-1 rounded-2xl mb-6">
          <button
            onClick={() => { setActiveTab('login'); setError(''); }}
            className={`flex-1 py-2 text-center text-xs font-semibold rounded-xl cursor-pointer transition-colors ${activeTab === 'login' ? 'bg-gradient-to-r from-accent-indigo/15 to-accent-cyan/15 border border-accent-indigo/25 text-accent-cyan' : 'text-text-secondary hover:text-text-primary'}`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setActiveTab('register'); setError(''); }}
            className={`flex-1 py-2 text-center text-xs font-semibold rounded-xl cursor-pointer transition-colors ${activeTab === 'register' ? 'bg-gradient-to-r from-accent-indigo/15 to-accent-cyan/15 border border-accent-indigo/25 text-accent-cyan' : 'text-text-secondary hover:text-text-primary'}`}
          >
            Sign Up
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
 
        {/* Login Pane */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-text-secondary font-medium">Student Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <input
                  type="email"
                  required
                  placeholder="name@dau.ac.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-accent-cyan transition-colors"
                />
              </div>
            </div>
 
            <div className="space-y-1.5">
              <label className="text-xs text-text-secondary font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-accent-cyan transition-colors"
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
 
        {/* Register Pane */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-text-secondary font-medium">University Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <input
                  type="email"
                  required
                  placeholder="student@dau.ac.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-accent-cyan transition-colors"
                />
              </div>
              <span className="text-[10px] text-accent-cyan font-medium block">
                * Note: Restricted to @dau.ac.in domains
              </span>
            </div>
 
            <div className="space-y-1.5">
              <label className="text-xs text-text-secondary font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <input
                  type="password"
                  required
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-accent-cyan transition-colors"
                />
              </div>
            </div>
 
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-text-secondary font-medium">Department</label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-xl py-3 pl-9 pr-3 text-xs focus:outline-none focus:border-accent-cyan transition-colors cursor-pointer appearance-none"
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
                    className="w-full bg-white/5 border border-white/5 rounded-xl py-3 pl-9 pr-3 text-xs focus:outline-none focus:border-accent-cyan transition-colors cursor-pointer appearance-none"
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

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight, LogOut } from 'lucide-react';
import { GradientButton } from './ui/GradientButton';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './ui/AuthModal';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, logout, authModalOpen, setAuthModalOpen } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { label: 'Product', path: '/' },
    { label: 'Interactive Demo', path: '/demo' },
    { label: 'AI Assistant', path: '/assistant' },
    { label: 'For Universities', path: '/universities' }
  ];

  if (user && user.role === 'student') {
    navLinks.push({ label: 'Profile', path: '/profile' });
  }

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    // If clicking Product and already on Home, scroll to top
    if (path === '/' && location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav
      className={`
        fixed
        top-0
        left-0
        right-0
        z-50
        transition-all
        duration-300
        ${isScrolled ? 'bg-bg-deep/85 backdrop-blur-md border-b border-white/5 py-4' : 'bg-transparent py-6'}
      `.trim()}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative w-6 h-6 rounded-full bg-gradient-to-tr from-accent-indigo to-accent-cyan flex items-center justify-center shadow-[0_0_12px_rgba(99,102,241,0.5)]">
            <div className="w-2.5 h-2.5 rounded-full bg-bg-deep" />
            {/* Small hovering overlay glow */}
            <span className="absolute inset-0 rounded-full bg-accent-cyan opacity-0 group-hover:opacity-40 transition-opacity duration-300 blur-[2px]" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-text-primary">
            CampusOS<span className="text-gradient font-extrabold ml-1">AI</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1 bg-white/5 border border-white/5 p-1.5 rounded-full backdrop-blur-sm">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={(e) => handleLinkClick(e, link.path)}
                className={`
                  px-4
                  py-2
                  rounded-full
                  text-sm
                  font-medium
                  transition-all
                  duration-300
                  ${isActive 
                    ? 'bg-gradient-to-r from-accent-indigo/15 to-accent-cyan/15 border border-accent-indigo/20 text-accent-cyan shadow-[0_2px_10px_-3px_rgba(34,211,238,0.15)]' 
                    : 'border border-transparent text-text-secondary hover:text-text-primary'
                  }
                `.trim()}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3 relative">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex flex-col text-right">
                <span className="text-xs font-semibold text-text-primary">{user.email.split('@')[0]}</span>
                <span className="text-[10px] text-accent-cyan">{user.department || 'Student'}</span>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-xl border border-white/5 hover:border-accent-urgent/30 hover:text-accent-urgent transition-colors text-text-secondary cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <GradientButton variant="ghost" className="text-sm cursor-pointer" onClick={() => setAuthModalOpen(true)}>
                Log In
              </GradientButton>
              <Link to="/demo">
                <GradientButton variant="primary" glow className="text-sm flex items-center gap-1.5 py-2 px-4 cursor-pointer">
                  Get Started
                  <ArrowRight className="w-4 h-4 stroke-[1.5]" />
                </GradientButton>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-text-secondary hover:text-text-primary focus:outline-none"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-6 h-6 stroke-[1.5]" /> : <Menu className="w-6 h-6 stroke-[1.5]" />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 top-[73px] bg-bg-deep/98 backdrop-blur-lg z-40 border-t border-white/5 flex flex-col p-6 animate-fade-in">
          <div className="flex flex-col gap-4 mt-6">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={(e) => handleLinkClick(e, link.path)}
                  className={`
                    px-4
                    py-3
                    rounded-xl
                    text-base
                    font-semibold
                    transition-all
                    duration-200
                    ${isActive 
                      ? 'bg-gradient-to-r from-accent-indigo/10 to-accent-cyan/10 text-accent-cyan border-l-4 border-accent-cyan' 
                      : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                    }
                  `.trim()}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="mt-auto flex flex-col gap-3 pb-8">
            {user ? (
              <div className="flex flex-col gap-3 text-center border-t border-white/5 pt-4">
                <div className="flex flex-col mb-2">
                  <span className="text-sm font-semibold text-text-primary">{user.email}</span>
                  <span className="text-xs text-accent-cyan">{user.department || 'Student'}</span>
                </div>
                <GradientButton variant="secondary" className="w-full justify-center cursor-pointer" onClick={() => { logout(); setIsOpen(false); }}>
                  Sign Out
                </GradientButton>
              </div>
            ) : (
              <>
                <GradientButton variant="secondary" className="w-full justify-center cursor-pointer" onClick={() => { setAuthModalOpen(true); setIsOpen(false); }}>
                  Log In
                </GradientButton>
                <Link to="/demo" className="w-full">
                  <GradientButton variant="primary" glow className="w-full justify-center cursor-pointer">
                    Get Started Free
                  </GradientButton>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </nav>
  );
};

export default Navbar;

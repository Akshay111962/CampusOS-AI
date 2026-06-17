import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="relative border-t border-white/5 bg-bg-deep/80 overflow-hidden pt-16 pb-12">
      {/* Background Soft Glow */}
      <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[600px] h-[200px] rounded-full bg-accent-indigo/10 glow-orb" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Logo & Info column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <div className="relative w-6 h-6 rounded-full bg-gradient-to-tr from-accent-indigo to-accent-cyan flex items-center justify-center shadow-[0_0_12px_rgba(99,102,241,0.5)]">
                <div className="w-2.5 h-2.5 rounded-full bg-bg-deep" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-text-primary">
                CampusOS<span className="text-gradient font-extrabold ml-1">AI</span>
              </span>
            </Link>
            <p className="text-text-secondary text-sm max-w-sm mb-6 leading-relaxed">
              CampusOS AI learns what every student cares about and delivers the right workshops, hackathons, internships, and events — before deadlines pass.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-accent-cyan/40 hover:bg-accent-indigo/10 transition-all duration-300"
                aria-label="Twitter"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-accent-cyan/40 hover:bg-accent-indigo/10 transition-all duration-300"
                aria-label="LinkedIn"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-accent-cyan/40 hover:bg-accent-indigo/10 transition-all duration-300"
                aria-label="GitHub"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Links Column 1 */}
          <div>
            <h4 className="text-text-primary font-semibold text-sm tracking-wider uppercase mb-4">Product</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/demo" className="text-text-secondary hover:text-text-primary transition-colors">Interactive Demo</Link>
              </li>
              <li>
                <Link to="/assistant" className="text-text-secondary hover:text-text-primary transition-colors">Campus AI Assistant</Link>
              </li>
              <li>
                <Link to="/universities" className="text-text-secondary hover:text-text-primary transition-colors">For Universities</Link>
              </li>
              <li>
                <Link to="/pricing" className="text-text-secondary hover:text-text-primary transition-colors">Pricing Plans</Link>
              </li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h4 className="text-text-primary font-semibold text-sm tracking-wider uppercase mb-4">Resources</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#docs" className="text-text-secondary hover:text-text-primary transition-colors">Documentation</a>
              </li>
              <li>
                <a href="#blog" className="text-text-secondary hover:text-text-primary transition-colors">Product Blog</a>
              </li>
              <li>
                <a href="#privacy" className="text-text-secondary hover:text-text-primary transition-colors">System Status</a>
              </li>
              <li>
                <a href="#api" className="text-text-secondary hover:text-text-primary transition-colors">Developer API</a>
              </li>
            </ul>
          </div>

          {/* Links Column 3 */}
          <div>
            <h4 className="text-text-primary font-semibold text-sm tracking-wider uppercase mb-4">Legal</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#privacy" className="text-text-secondary hover:text-text-primary transition-colors">Privacy Policy</a>
              </li>
              <li>
                <a href="#terms" className="text-text-secondary hover:text-text-primary transition-colors">Terms of Service</a>
              </li>
              <li>
                <a href="#security" className="text-text-secondary hover:text-text-primary transition-colors">Security Details</a>
              </li>
              <li>
                <a href="#cookies" className="text-text-secondary hover:text-text-primary transition-colors">Cookie Prefs</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/5 mb-8 w-full" />

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-secondary">
          <p>© {new Date().getFullYear()} CampusOS AI Inc. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Designed for DAU students with <Heart className="w-3.5 h-3.5 text-accent-urgent fill-accent-urgent" /> by Akshay & Akshay
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

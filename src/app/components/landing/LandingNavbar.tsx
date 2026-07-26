import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Logo } from '../ui/Logo';

export interface LandingNavbarProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({ onGetStarted, onLogin }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
  ];

  return (
    <nav className="fixed left-0 right-0 top-4 z-50 mx-4 md:mx-auto max-w-6xl">
      <div 
        className={`glass-navbar flex h-16 items-center justify-between rounded-2xl px-6 transition-all duration-300 border border-white/20 dark:border-white/10 ${
          isScrolled ? 'shadow-xl bg-white/60 dark:bg-black/40 backdrop-blur-xl' : 'shadow-sm bg-white/40 dark:bg-black/20 backdrop-blur-md'
        }`}
      >
        {/* Logo */}
        <Logo 
          onClick={() => {
            window.location.hash = '';
            window.scrollTo(0, 0);
          }} 
        />

        {/* Center Nav Links - Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a 
              key={link.label} 
              href={link.href} 
              onClick={(e) => {
                e.preventDefault();
                document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Action Buttons - Desktop */}
        <div className="hidden md:flex items-center gap-4">
          <button 
            onClick={() => window.location.hash = '#contact-me'}
            className="text-sm font-medium text-brand hover:text-brand/80 transition-colors px-3 py-2"
          >
            Contact Me
          </button>
          <button 
            onClick={onLogin} 
            className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors px-3 py-2"
          >
            Log In
          </button>
          <button 
            onClick={onGetStarted} 
            className="rounded-xl bg-gradient-to-r from-brand to-brand/80 px-5 py-2 text-sm font-medium text-brand-foreground shadow-[0_0_15px_rgba(109,40,217,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(109,40,217,0.5)]"
          >
            Get Started
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 text-foreground/70 hover:text-foreground transition-colors" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full glass-surface rounded-2xl border border-white/20 shadow-xl flex flex-col px-6 py-6 gap-4 animate-in slide-in-from-top-4 fade-in duration-300">
          {navLinks.map((link) => (
            <a 
              key={link.label} 
              href={link.href} 
              className="text-sm font-medium text-foreground/70 hover:text-foreground py-2 border-b border-white/10"
              onClick={(e) => {
                e.preventDefault();
                setIsMobileMenuOpen(false);
                setTimeout(() => {
                  document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
            >
              {link.label}
            </a>
          ))}
          <div className="flex flex-col gap-3 pt-2">
            <button 
              onClick={() => { setIsMobileMenuOpen(false); window.location.hash = '#contact-me'; }} 
              className="w-full text-left py-2 text-sm font-medium text-brand hover:text-brand/80 transition-colors"
            >
              Contact Me
            </button>
            <button 
              onClick={() => { setIsMobileMenuOpen(false); onLogin(); }} 
              className="w-full text-left py-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
            >
              Log In
            </button>
            <button 
              onClick={() => { setIsMobileMenuOpen(false); onGetStarted(); }} 
              className="w-full rounded-xl bg-gradient-to-r from-brand to-brand/80 px-5 py-3 text-sm font-medium text-brand-foreground text-center shadow-[0_0_15px_rgba(109,40,217,0.3)] transition-all"
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingBag, ArrowRight } from 'lucide-react';
import logo from '../../assets/logo.svg';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isLanding = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Why Us', href: isLanding ? '#why-us' : '/#why-us' },
    { label: 'Process', href: isLanding ? '#process' : '/#process' },
    { label: 'Services', href: isLanding ? '#services' : '/#services' },
    { label: 'Workshop', href: isLanding ? '#location' : '/#location' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${
        scrolled || !isLanding
          ? 'bg-[#041325]/85 backdrop-blur-xl border-b border-cyan-400/15 shadow-[0_8px_32px_rgba(0,0,0,0.35)] py-3'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 border border-cyan-400/25 p-1.5 backdrop-blur-md group-hover:border-cyan-300/60 transition-colors">
            <img src={logo} alt="Rassi & Co Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold text-lg sm:text-xl leading-tight tracking-tight">
              Rassi & Company
            </span>
            <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-300/80 hidden sm:block">
              Hydraulic Service • Est. 2003
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-slate-200 hover:text-cyan-300 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              {item.label}
            </a>
          ))}

          <div className="h-5 w-px bg-white/15 mx-2" />

          <Link
            to="/buy"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-200 hover:text-white px-3.5 py-2 rounded-lg border border-cyan-400/25 bg-cyan-500/10 hover:bg-cyan-500/20 transition-all"
          >
            <ShoppingBag size={15} />
            Buy Pumps
          </Link>

          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 px-4 py-2 rounded-lg shadow-lg shadow-orange-500/25 transition-all"
          >
            Portal Login
            <ArrowRight size={15} />
          </Link>
        </nav>

        {/* Mobile Toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="md:hidden p-2 rounded-lg bg-white/10 border border-white/15 text-white hover:bg-white/15 transition-colors"
          aria-label="Toggle Menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden overflow-hidden bg-[#041325]/95 backdrop-blur-2xl border-b border-cyan-400/20"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-slate-200 hover:text-cyan-300 font-medium py-2.5 px-3 rounded-lg hover:bg-white/5 transition-colors"
                >
                  {item.label}
                </a>
              ))}
              <div className="h-px bg-white/10 my-1" />
              <Link
                to="/buy"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-cyan-200 py-2.5 px-4 rounded-lg border border-cyan-400/30 bg-cyan-500/10"
              >
                <ShoppingBag size={16} />
                Buy Pumps
              </Link>
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 py-2.5 px-4 rounded-lg shadow-lg"
              >
                Portal Login / Track Repair
                <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;

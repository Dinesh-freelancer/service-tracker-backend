import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Briefcase, ArrowRight } from 'lucide-react';
import logo from '../../assets/logo.svg';

const Footer = () => {
  return (
    <footer className="relative bg-[#020a14] text-white border-t border-cyan-400/15 pt-16 pb-10 overflow-hidden">
      <div className="pointer-events-none absolute -bottom-24 left-1/2 -translate-x-1/2 w-[600px] h-48 rounded-full bg-cyan-500/10 blur-[100px]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand & About */}
          <div>
            <Link to="/" className="inline-flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-cyan-400/25 p-1.5 flex items-center justify-center">
                <img src={logo} alt="Rassi & Company" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="text-xl font-bold leading-tight">Rassi & Company</h3>
                <p className="text-[11px] font-mono uppercase tracking-widest text-cyan-300/80">
                  Hydraulic Service • Est. 2003
                </p>
              </div>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-5 max-w-sm">
              Over 20 years of trust in Chennai. Specialists in Borewell, Dewatering, Sewage, and Pressure Pumps with precision rewinding and OEM spares.
            </p>
            <div className="flex items-center gap-3 text-sm">
              <a
                href="#"
                className="px-3.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-cyan-300 hover:border-cyan-400/35 transition-colors"
              >
                Facebook
              </a>
              <a
                href="#"
                className="px-3.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-cyan-300 hover:border-cyan-400/35 transition-colors"
              >
                LinkedIn
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-mono uppercase tracking-widest text-cyan-300 mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 hover:text-cyan-300 transition-colors"
                >
                  <ArrowRight size={14} className="text-cyan-400" />
                  Portal Login (Customer / Admin / Worker)
                </Link>
              </li>
              <li>
                <Link
                  to="/buy"
                  className="inline-flex items-center gap-1.5 hover:text-cyan-300 transition-colors"
                >
                  <ArrowRight size={14} className="text-cyan-400" />
                  Buy Pumps & Equipment
                </Link>
              </li>
              <li>
                <a
                  href="/#services"
                  className="inline-flex items-center gap-1.5 hover:text-cyan-300 transition-colors"
                >
                  <ArrowRight size={14} className="text-cyan-400" />
                  Our Services
                </a>
              </li>
              <li>
                <a
                  href="/#process"
                  className="inline-flex items-center gap-1.5 hover:text-cyan-300 transition-colors"
                >
                  <ArrowRight size={14} className="text-cyan-400" />
                  4-Step Repair Pipeline
                </a>
              </li>
              <li>
                <a
                  href="/#location"
                  className="inline-flex items-center gap-1.5 hover:text-cyan-300 transition-colors"
                >
                  <ArrowRight size={14} className="text-cyan-400" />
                  Visit Mannady Workshop
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Careers */}
          <div>
            <h4 className="text-sm font-mono uppercase tracking-widest text-cyan-300 mb-4">
              Contact Us
            </h4>
            <div className="space-y-3 text-sm text-slate-300">
              <p className="flex items-center gap-2.5">
                <MapPin size={17} className="text-cyan-400 shrink-0" />
                Krishnan Koil Street, Mannady, Chennai - 600001
              </p>
              <a
                href="tel:+919382222797"
                className="flex items-center gap-2.5 hover:text-cyan-300 transition-colors"
              >
                <Phone size={17} className="text-cyan-400 shrink-0" />
                +91 93822 22797
              </a>
              <a
                href="mailto:rassiksb2007@gmail.com"
                className="flex items-center gap-2.5 hover:text-cyan-300 transition-colors"
              >
                <Mail size={17} className="text-cyan-400 shrink-0" />
                rassiksb2007@gmail.com
              </a>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-orange-500/10 border border-cyan-400/25 backdrop-blur-md">
              <div className="flex items-center gap-2 text-cyan-200 font-bold text-sm mb-1">
                <Briefcase size={16} className="text-orange-400" />
                Careers: We are hiring!
              </div>
              <p className="text-xs text-slate-300">
                Skilled Motor Winders & Pump Technicians needed. Call or visit our Mannady workshop to apply.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>
            © {new Date().getFullYear()} Rassi & Company. All rights reserved.
          </span>
          <span>Hydraulic & Motor Service Center • Chennai</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

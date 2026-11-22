import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { ArrowRight, PhoneCall, ShieldCheck, Droplets } from 'lucide-react';
import PickupForm from './PickupForm';
import HydraulicSchematic from './HydraulicSchematic';

const stats = [
  { label: 'Years of Legacy', end: 20, suffix: '+' },
  { label: 'Pumps Restored', end: 15000, suffix: '+' },
  { label: 'Genuine OEM Spares', end: 100, suffix: '%' },
  { label: 'Avg Turnaround (Hrs)', end: 48, suffix: 'h' },
];

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex flex-col justify-between bg-gradient-to-br from-[#03101f] via-[#07203d] to-[#0a2b4f] overflow-hidden pt-24 lg:pt-28">
      {/* Subtle Technical Grid Background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(56,189,248,0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(56,189,248,0.3) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Ambient Hydro / Energy Glowing Orbs */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-cyan-500/20 blur-[120px] animate-float-slow" />
      <div className="pointer-events-none absolute top-1/3 right-0 w-[420px] h-[420px] rounded-full bg-blue-600/20 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-10 left-1/3 w-72 h-72 rounded-full bg-orange-500/10 blur-[110px]" />

      {/* Main Split Hero Content */}
      <div className="container mx-auto px-4 py-10 lg:py-14 relative z-10 flex-1 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center w-full">
          {/* Left Column: Messaging + CTAs + Animated Hydraulic Schematic */}
          <div className="lg:col-span-7 text-white">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 backdrop-blur-md text-xs sm:text-sm font-medium text-cyan-200 mb-6"
            >
              <Droplets size={15} className="text-cyan-400" />
              <span>Authorized-Grade Pump & Motor Service Center • Chennai</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.08 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-5"
            >
              Expert Pump Repair &{' '}
              <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-400 bg-clip-text text-transparent">
                Hydraulic Precision
              </span>{' '}
              in Chennai.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.16 }}
              className="text-base sm:text-lg lg:text-xl text-slate-300 mb-8 max-w-2xl leading-relaxed font-light"
            >
              Over 20 years of engineering trust. Specialists in Borewell,
              Dewatering, Sewage, and Pressure Pumps with precision rewinding,
              genuine spares, and live digital job tracking.
            </motion.p>

            {/* Primary & Secondary CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.22 }}
              className="flex flex-wrap items-center gap-4"
            >
              <Link
                to="/login"
                className="group bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-bold py-3.5 px-7 rounded-xl shadow-lg shadow-orange-500/25 transition-all flex items-center gap-2"
              >
                Track My Repair
                <ArrowRight
                  size={19}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>

              <a
                href="tel:+919876543210"
                className="bg-white/5 hover:bg-white/15 border border-cyan-400/30 backdrop-blur-md text-white font-semibold py-3.5 px-7 rounded-xl transition-all flex items-center gap-2"
              >
                <PhoneCall size={18} className="text-cyan-300" />
                Emergency Service
              </a>

              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-300/80 ml-1">
                <ShieldCheck size={16} className="text-emerald-400" />
                Service Warranty Included
              </span>
            </motion.div>

            {/* Animated SVG Pump & Hydraulic Flow Schematic */}
            <HydraulicSchematic />
          </div>

          {/* Right Column: Floating Glass Pickup Form */}
          <div className="lg:col-span-5 w-full max-w-lg mx-auto lg:max-w-none">
            <PickupForm />
          </div>
        </div>
      </div>

      {/* Bottom Glass KPI Counter Strip */}
      <div className="relative z-10 border-t border-cyan-400/15 bg-slate-950/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35 + idx * 0.08 }}
                className="flex flex-col items-center lg:items-start text-center lg:text-left"
              >
                <span className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
                  <CountUp
                    end={stat.end}
                    duration={2.4}
                    separator=","
                    suffix={stat.suffix}
                  />
                </span>
                <span className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

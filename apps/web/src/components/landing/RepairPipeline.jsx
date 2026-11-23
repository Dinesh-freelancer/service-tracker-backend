import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardCheck,
  Cog,
  Gauge,
  Truck,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

const steps = [
  {
    id: 1,
    phase: 'Stage 01',
    title: 'Intake & Inspection',
    shortDesc: 'Doorstep pickup or workshop drop-off with digital job logging.',
    icon: ClipboardCheck,
    accent: 'from-cyan-400 to-sky-500',
    glow: 'shadow-cyan-500/25',
    badge: 'Same-Day Assessment',
    details:
      'Every pump receives a unique Job Number in our Service Portal. Technicians perform an initial visual, mechanical, and insulation resistance inspection before issuing a transparent repair quote.',
    checklist: [
      'Heavy-equipment pickup across Chennai',
      'Unique digital Job Card & photo documentation',
      'Upfront estimate before any repair begins',
    ],
  },
  {
    id: 2,
    phase: 'Stage 02',
    title: 'Winding & Diagnostics',
    shortDesc: 'Precision copper rewinding, bearing replacement & impeller service.',
    icon: Cog,
    accent: 'from-orange-400 to-amber-500',
    glow: 'shadow-orange-500/25',
    badge: 'OEM Grade Spares',
    details:
      'Skilled winders strip, clean, and rewind stators to exact factory gauge and turn specs. Worn bearings, mechanical seals, shafts, and impellers are replaced with genuine spares.',
    checklist: [
      'Factory-spec copper winding & varnish baking',
      'Genuine OEM bearings & mechanical seals',
      'Dynamic impeller & shaft alignment check',
    ],
  },
  {
    id: 3,
    phase: 'Stage 03',
    title: 'Hydro-Static & Load Testing',
    shortDesc: 'Full pressure, head, flow-rate, and electrical load verification.',
    icon: Gauge,
    accent: 'from-sky-400 to-blue-500',
    glow: 'shadow-sky-500/25',
    badge: '100% Bench Tested',
    details:
      'Before leaving our bench, every restored pump undergoes full hydraulic pressure and amp-draw load testing to guarantee rated head, flow rate, and leak-free operation.',
    checklist: [
      'Hydro-static seal & casing pressure test',
      'Full-load current & voltage stability check',
      'Flow rate & head output verification',
    ],
  },
  {
    id: 4,
    phase: 'Stage 04',
    title: 'Quality Check & Delivery',
    shortDesc: 'Warranty certification, live portal update & rapid dispatch.',
    icon: Truck,
    accent: 'from-emerald-400 to-teal-500',
    glow: 'shadow-emerald-500/25',
    badge: 'Service Warranty Included',
    details:
      'Once final QA passes, your status updates automatically in the Customer Portal. We deliver back to your site or prepare your unit for quick truck loading at our Mannady workshop.',
    checklist: [
      'Final QA sign-off & service warranty coverage',
      'Digital invoice & test records in Customer Portal',
      'Scheduled delivery or easy Mannady pickup',
    ],
  },
];

const RepairPipeline = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeStep = steps[activeIndex];
  const progressPercent = (activeIndex / (steps.length - 1)) * 100;

  return (
    <section
      id="process"
      className="relative py-24 bg-gradient-to-b from-[#041325] via-[#071c36] to-[#041325] overflow-hidden"
    >
      {/* Ambient Hydro Glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[680px] h-[340px] rounded-full bg-cyan-500/10 blur-[120px]" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest text-cyan-300 bg-cyan-500/10 border border-cyan-400/25 mb-4">
            <Cog size={14} className="animate-spin [animation-duration:8s]" />
            Workshop Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            How Your Pump Gets{' '}
            <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-400 bg-clip-text text-transparent">
              Restored to Peak Flow
            </span>
          </h2>
          <p className="text-slate-300 text-base sm:text-lg">
            Select any stage below to explore our transparent, 4-step hydraulic restoration pipeline.
          </p>
        </motion.div>

        {/* Interactive Pipeline Track */}
        <div className="relative max-w-5xl mx-auto">
          {/* Desktop Connecting Hydraulic Line */}
          <div className="hidden lg:block absolute top-12 left-[12%] right-[12%] h-1.5 rounded-full bg-slate-800/90 border border-white/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-orange-400"
              initial={false}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            />
          </div>

          {/* 4 Step Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative z-10">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === activeIndex;
              const isCompleted = index < activeIndex;

              return (
                <motion.button
                  key={step.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                  className={`group text-left rounded-2xl p-5 transition-all duration-300 backdrop-blur-xl border cursor-pointer ${
                    isActive
                      ? 'bg-slate-900/80 border-cyan-400/60 shadow-[0_0_30px_rgba(34,211,238,0.2)]'
                      : 'bg-white/[0.04] border-white/10 hover:bg-white/[0.07] hover:border-cyan-400/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${step.accent} text-slate-950 shadow-lg ${step.glow} transition-transform duration-300 group-hover:scale-105`}
                    >
                      <Icon
                        size={24}
                        className={
                          isActive && step.id === 2
                            ? 'animate-spin [animation-duration:6s]'
                            : ''
                        }
                      />
                    </div>
                    <span
                      className={`text-xs font-mono uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                        isActive
                          ? 'bg-cyan-400/15 text-cyan-200 border-cyan-400/40'
                          : isCompleted
                          ? 'bg-emerald-400/15 text-emerald-300 border-emerald-400/30'
                          : 'bg-white/5 text-slate-400 border-white/10'
                      }`}
                    >
                      {step.phase}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1.5">{step.title}</h3>
                  <p className="text-sm text-slate-300/85 leading-relaxed">
                    {step.shortDesc}
                  </p>
                </motion.button>
              );
            })}
          </div>

          {/* Active Stage Deep-Dive Glass Panel */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
              className="mt-8 rounded-2xl border border-cyan-400/25 bg-slate-900/65 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-7">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-slate-950 bg-gradient-to-r ${activeStep.accent}`}
                    >
                      {activeStep.phase} • {activeStep.badge}
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                    {activeStep.title}
                  </h3>
                  <p className="text-slate-300 leading-relaxed mb-5">
                    {activeStep.details}
                  </p>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveIndex((prev) => (prev + 1) % steps.length)
                      }
                      className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-200 transition-colors cursor-pointer"
                    >
                      Next Stage: {steps[(activeIndex + 1) % steps.length].title}
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-5 rounded-xl bg-white/[0.04] border border-white/10 p-5">
                  <h4 className="text-xs font-mono uppercase tracking-widest text-cyan-300 mb-3">
                    What Happens in {activeStep.phase}
                  </h4>
                  <ul className="space-y-3">
                    {activeStep.checklist.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-200">
                        <CheckCircle2
                          size={18}
                          className="text-cyan-400 shrink-0 mt-0.5"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default RepairPipeline;

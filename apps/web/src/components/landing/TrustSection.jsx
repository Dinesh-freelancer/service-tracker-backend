import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Award, Clock, PenTool, Sparkles } from 'lucide-react';

const items = [
  {
    icon: Award,
    title: '20 Years Legacy',
    metric: 'Since 2003',
    description:
      'Family owned & professionally managed with deep industrial and domestic pump expertise.',
    accent: 'from-cyan-400 to-sky-500',
  },
  {
    icon: PenTool,
    title: 'Genuine Spares',
    metric: 'OEM Certified',
    description:
      'We use only original bearings, seals, impellers, and high-grade copper winding wire.',
    accent: 'from-orange-400 to-amber-500',
  },
  {
    icon: ShieldCheck,
    title: 'Service Warranty',
    metric: 'Guaranteed',
    description:
      'Complete peace of mind with our transparent, documented post-repair service warranty.',
    accent: 'from-emerald-400 to-teal-500',
  },
  {
    icon: Clock,
    title: 'Quick Turnaround',
    metric: 'Minimal Downtime',
    description:
      'Streamlined diagnostics, stocked spares, and priority emergency handling to keep you running.',
    accent: 'from-sky-400 to-indigo-500',
  },
];

const TrustSection = () => {
  return (
    <section
      id="why-us"
      className="relative py-24 bg-[#041325] overflow-hidden"
    >
      {/* Subtle Ambient Glow */}
      <div className="pointer-events-none absolute top-0 right-1/4 w-80 h-80 rounded-full bg-sky-500/10 blur-[110px]" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest text-cyan-300 bg-cyan-500/10 border border-cyan-400/25 mb-4">
            <Sparkles size={13} />
            Built on Reliability
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Why Trust{' '}
            <span className="bg-gradient-to-r from-cyan-300 to-sky-400 bg-clip-text text-transparent">
              Rassi & Company?
            </span>
          </h2>
          <p className="text-slate-300 text-base sm:text-lg">
            Delivering precision hydraulic and motor repair services across Chennai for over two decades.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -6 }}
                className="group relative rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 hover:border-cyan-400/45 p-6 transition-all duration-300 shadow-lg hover:shadow-[0_16px_40px_rgba(6,182,212,0.14)] overflow-hidden"
              >
                {/* Hover top glow line */}
                <div
                  className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${item.accent} opacity-40 group-hover:opacity-100 transition-opacity`}
                />

                <div className="flex items-center justify-between mb-5">
                  <div
                    className={`w-13 h-13 rounded-xl bg-gradient-to-br ${item.accent} p-[1px]`}
                  >
                    <div className="w-full h-full rounded-[11px] bg-slate-950/85 flex items-center justify-center text-white group-hover:bg-slate-950/50 transition-colors">
                      <Icon size={24} className="text-cyan-300 group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                  <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                    {item.metric}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-200 transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-300/85 leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;

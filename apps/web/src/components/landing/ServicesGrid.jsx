import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Droplets, Activity, Wind, ArrowUpRight, Wrench } from 'lucide-react';

const services = [
  {
    title: 'Borewell Pumps',
    tag: 'Submersible & Openwell',
    description:
      'Complete submersible motor rewinding, bush/thrust bearing replacement, and impeller overhaul for domestic and industrial borewells.',
    icon: Droplets,
    gradient: 'from-cyan-500 to-blue-600',
    glow: 'group-hover:shadow-cyan-500/25',
    highlights: ['Copper Stator Rewinding', 'Water-Sealed Bearings'],
  },
  {
    title: 'Dewatering Pumps',
    tag: 'Heavy-Duty Site Use',
    description:
      'High-capacity slurry and dewatering pump restoration built for construction sites, quarries, and rapid flood control.',
    icon: Wind,
    gradient: 'from-orange-500 to-amber-600',
    glow: 'group-hover:shadow-orange-500/25',
    highlights: ['Wear-Plate & Impeller Rebuild', 'Rapid Site Turnaround'],
  },
  {
    title: 'Sewage Pumps',
    tag: 'Waste & Cutter Systems',
    description:
      'Specialized maintenance for cutter, non-clog sewage, and effluent handling systems with heavy-duty mechanical seals.',
    icon: Settings,
    gradient: 'from-emerald-500 to-teal-600',
    glow: 'group-hover:shadow-emerald-500/25',
    highlights: ['Dual Mechanical Seals', 'Cutter & Volute Balancing'],
  },
  {
    title: 'Pressure Pumps',
    tag: 'Hydro-Pneumatic Boosters',
    description:
      'Multi-stage booster systems, VFD panels, and pressure vessel calibration for high-rise apartments and industrial lines.',
    icon: Activity,
    gradient: 'from-sky-500 to-indigo-600',
    glow: 'group-hover:shadow-sky-500/25',
    highlights: ['Multi-Stage Impellers', 'Pressure Switch & VFD Check'],
  },
];

const brands = [
  'Kirloskar',
  'Texmo',
  'Crompton',
  'Grundfos',
  'KSB',
  'C.R.I. Pumps',
  'Lubi',
  'Wilo',
];

const ServicesGrid = () => {
  return (
    <section
      id="services"
      className="relative py-24 bg-[#03101f] overflow-hidden"
    >
      {/* Subtle Background Accent */}
      <div className="pointer-events-none absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-cyan-500/10 blur-[130px]" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest text-cyan-300 bg-cyan-500/10 border border-cyan-400/25 mb-4">
            <Wrench size={13} />
            Core Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Our{' '}
            <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-400 bg-clip-text text-transparent">
              Service Expertise
            </span>
          </h2>
          <p className="text-slate-300 text-base sm:text-lg">
            Precision diagnostics, rewinding, and overhaul for every major industrial and domestic pump category.
          </p>
        </motion.div>

        {/* Glassmorphism Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className={`group relative rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 hover:border-cyan-400/45 p-6 flex flex-col justify-between transition-all duration-300 shadow-xl ${service.glow} overflow-hidden`}
              >
                {/* Top Gradient Highlight */}
                <div
                  className={`absolute -top-16 -right-16 w-40 h-40 rounded-full bg-gradient-to-br ${service.gradient} opacity-15 blur-2xl group-hover:opacity-30 transition-opacity`}
                />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${service.gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon
                        size={28}
                        className={
                          service.title === 'Sewage Pumps'
                            ? 'group-hover:rotate-90 transition-transform duration-500'
                            : ''
                        }
                      />
                    </div>
                    <span className="text-[11px] font-mono text-cyan-200/80 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                      {service.tag}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2.5">
                    {service.title}
                  </h3>
                  <p className="text-sm text-slate-300/85 leading-relaxed mb-5">
                    {service.description}
                  </p>

                  <div className="space-y-1.5 mb-6">
                    {service.highlights.map((hl) => (
                      <div
                        key={hl}
                        className="flex items-center gap-2 text-xs text-slate-200/90"
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${service.gradient}`}
                        />
                        <span>{hl}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <a
                  href="#pickup-form"
                  className="relative z-10 inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-white/5 hover:bg-cyan-500/15 border border-white/10 hover:border-cyan-400/35 text-sm font-semibold text-cyan-200 transition-all"
                >
                  <span>Book Service</span>
                  <ArrowUpRight
                    size={16}
                    className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </a>
              </motion.div>
            );
          })}
        </div>

        {/* Infinite Brands Marquee */}
        <div className="mt-20 pt-10 border-t border-white/10">
          <p className="text-center text-xs font-mono uppercase tracking-[0.25em] text-slate-400 mb-7">
            Trusted Service Specialists For Leading Global & Indian Brands
          </p>

          <div className="relative overflow-hidden py-2 [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
            <div className="animate-marquee flex items-center gap-6">
              {[...brands, ...brands].map((brand, idx) => (
                <div
                  key={`${brand}-${idx}`}
                  className="shrink-0 px-7 py-3.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-cyan-400/40 hover:bg-cyan-500/10 backdrop-blur-md transition-all"
                >
                  <span className="text-lg sm:text-xl font-black tracking-wide text-slate-300 hover:text-white transition-colors">
                    {brand}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesGrid;

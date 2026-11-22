import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Clock, ExternalLink, Truck } from 'lucide-react';

const MapPlaceholder = () => (
  <div className="w-full h-full bg-slate-900/80 flex items-center justify-center text-slate-400 rounded-2xl">
    <span className="text-sm font-mono">Loading Guindy Workshop Map...</span>
  </div>
);

const LocationSection = () => {
  return (
    <section
      id="location"
      className="relative py-24 bg-gradient-to-b from-[#041325] to-[#020b16] overflow-hidden"
    >
      <div className="pointer-events-none absolute top-1/3 right-0 w-96 h-96 rounded-full bg-blue-600/15 blur-[130px]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Info Side */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 space-y-6"
          >
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest text-cyan-300 bg-cyan-500/10 border border-cyan-400/25 mb-4">
                <MapPin size={13} />
                Chennai Industrial Hub
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                Visit Our{' '}
                <span className="bg-gradient-to-r from-cyan-300 to-sky-400 bg-clip-text text-transparent">
                  Guindy Workshop
                </span>
              </h2>
              <p className="text-slate-300 text-base">
                Equipped with overhead hoists, rewinding ovens, and hydraulic test benches for light to heavy industrial units.
              </p>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 p-5 flex items-start gap-4 hover:border-cyan-400/35 transition-colors">
                <div className="w-11 h-11 rounded-xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shrink-0">
                  <Truck size={20} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white mb-1">
                    Easy Heavy-Truck Access
                  </h4>
                  <p className="text-sm text-slate-300/85 leading-relaxed">
                    Located near Guindy Industrial Estate with convenient truck loading and unloading for heavy industrial pumps.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 p-5 flex items-start gap-4 hover:border-cyan-400/35 transition-colors">
                <div className="w-11 h-11 rounded-xl bg-orange-500/15 border border-orange-400/30 flex items-center justify-center text-orange-300 shrink-0">
                  <Navigation size={20} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white mb-1">
                    Wide Service Radius
                  </h4>
                  <p className="text-sm text-slate-300/85 leading-relaxed">
                    Proudly serving Guindy, Ambattur, Sriperumbudur, Oragadam, and surrounding Chennai industrial corridors.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 p-5 flex items-start gap-4 hover:border-cyan-400/35 transition-colors">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
                  <Clock size={20} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white mb-1">
                    Workshop Hours
                  </h4>
                  <p className="text-sm text-slate-300/85">
                    Monday – Saturday: 9:00 AM – 7:00 PM • Emergency breakdowns supported on call.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Map Side */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7"
          >
            <div className="relative rounded-2xl p-2 bg-white/[0.04] backdrop-blur-xl border border-cyan-400/25 shadow-2xl">
              <div className="flex items-center justify-between px-3 py-2 mb-1">
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Guindy, Chennai, Tamil Nadu
                </div>
                <a
                  href="https://maps.google.com/?q=Guindy,Chennai,Tamil+Nadu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-300 hover:text-cyan-200 transition-colors"
                >
                  Open in Maps <ExternalLink size={13} />
                </a>
              </div>

              <div className="h-[380px] sm:h-[420px] rounded-xl overflow-hidden border border-white/10">
                <Suspense fallback={<MapPlaceholder />}>
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d62194.26767675107!2d80.1772596486328!3d13.006763!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a52670dd5555555%3A0x5555555555555555!2sGuindy%2C%20Chennai%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1699999999999!5m2!1sen!2sin"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Rassi & Company Location"
                  />
                </Suspense>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LocationSection;

import React from 'react';
import { motion } from 'framer-motion';
import { Gauge, Zap, Droplets, CheckCircle2 } from 'lucide-react';

const HydraulicSchematic = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.25 }}
      className="relative mt-8 rounded-2xl border border-cyan-400/20 bg-slate-900/50 backdrop-blur-xl p-4 sm:p-5 overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.12)]"
    >
      {/* Subtle Blueprint Grid Overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-15"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(56,189,248,0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(56,189,248,0.25) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Top Schematic Header */}
      <div className="relative z-10 flex items-center justify-between text-xs text-cyan-200/80 mb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400" />
          </span>
          <span className="font-mono uppercase tracking-wider text-cyan-300">
            Hydraulic Test Bench • Live Schematic
          </span>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-cyan-500/10 border border-cyan-400/25 px-2.5 py-0.5 font-mono text-[11px] text-cyan-200">
          <CheckCircle2 size={12} className="text-emerald-400" />
          ISO Load Tested
        </span>
      </div>

      {/* Animated SVG Pump & Flow Diagram */}
      <div className="relative z-10 w-full">
        <svg
          viewBox="0 0 560 190"
          className="w-full h-auto"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Animated hydraulic pump schematic"
        >
          <defs>
            <linearGradient id="hydroPipeGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.25" />
              <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.25" />
            </linearGradient>
            <linearGradient id="casingGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1e3a5f" />
              <stop offset="100%" stopColor="#0b1f3a" />
            </linearGradient>
            <radialGradient id="impellerGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Suction Inlet Pipe (Left -> Pump) */}
          <path
            d="M 16 112 L 155 112"
            stroke="#0f2947"
            strokeWidth="22"
            strokeLinecap="round"
          />
          <path
            d="M 16 112 L 155 112"
            stroke="url(#hydroPipeGrad)"
            strokeWidth="6"
            strokeDasharray="12 12"
            strokeLinecap="round"
            className="animate-hydro-flow"
          />
          {/* Suction Label */}
          <text x="20" y="92" fill="#7dd3fc" fontSize="10" fontFamily="monospace">
            SUCTION INLET
          </text>

          {/* Discharge Pipe (Pump -> Up -> Right) */}
          <path
            d="M 225 46 L 225 28 Q 225 18 235 18 L 540 18"
            stroke="#0f2947"
            strokeWidth="20"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 225 46 L 225 28 Q 225 18 235 18 L 540 18"
            stroke="url(#hydroPipeGrad)"
            strokeWidth="6"
            strokeDasharray="12 12"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-hydro-flow"
          />
          <text x="360" y="42" fill="#7dd3fc" fontSize="10" fontFamily="monospace">
            HIGH-PRESSURE DISCHARGE →
          </text>

          {/* Ambient Glow behind Pump Volute */}
          <circle cx="225" cy="112" r="70" fill="url(#impellerGlow)" />

          {/* Pump Volute Casing */}
          <circle
            cx="225"
            cy="112"
            r="56"
            fill="url(#casingGrad)"
            stroke="#38bdf8"
            strokeOpacity="0.55"
            strokeWidth="2.5"
          />
          <circle
            cx="225"
            cy="112"
            r="46"
            stroke="#22d3ee"
            strokeOpacity="0.25"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* Rotating Centrifugal Impeller */}
          <motion.g
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 4.5, ease: 'linear' }}
            style={{ originX: '225px', originY: '112px' }}
          >
            {[0, 60, 120, 180, 240, 300].map((angle) => (
              <path
                key={angle}
                d="M 225 112 Q 242 94 260 100 Q 244 114 225 112 Z"
                fill="#38bdf8"
                fillOpacity="0.85"
                transform={`rotate(${angle} 225 112)`}
              />
            ))}
            <circle
              cx="225"
              cy="112"
              r="11"
              fill="#0c2d51"
              stroke="#fb923c"
              strokeWidth="2.5"
            />
            <circle cx="225" cy="112" r="4" fill="#fb923c" />
          </motion.g>

          {/* Drive Shaft Coupling (Pump -> Motor) */}
          <rect
            x="281"
            y="104"
            width="42"
            height="16"
            rx="3"
            fill="#1e293b"
            stroke="#38bdf8"
            strokeOpacity="0.5"
            strokeWidth="1.5"
          />
          <line x1="296" y1="104" x2="296" y2="120" stroke="#fb923c" strokeWidth="2" />
          <line x1="308" y1="104" x2="308" y2="120" stroke="#fb923c" strokeWidth="2" />

          {/* Electric Motor Housing & Copper Winding Core */}
          <rect
            x="323"
            y="72"
            width="142"
            height="80"
            rx="12"
            fill="url(#casingGrad)"
            stroke="#38bdf8"
            strokeOpacity="0.55"
            strokeWidth="2"
          />
          {/* Cooling Fins */}
          {[82, 92, 102, 112, 122, 132, 142].map((yPos) => (
            <line
              key={yPos}
              x1="340"
              y1={yPos}
              x2="448"
              y2={yPos}
              stroke="#0ea5e9"
              strokeOpacity="0.3"
              strokeWidth="2"
              strokeLinecap="round"
            />
          ))}
          {/* Pulsing Copper Winding Core Indicator */}
          <motion.rect
            x="362"
            y="88"
            width="64"
            height="48"
            rx="6"
            fill="#f97316"
            fillOpacity="0.16"
            stroke="#fb923c"
            strokeWidth="1.5"
            animate={{ opacity: [0.55, 1, 0.55] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
          />
          <text
            x="394"
            y="110"
            textAnchor="middle"
            fill="#fed7aa"
            fontSize="9"
            fontFamily="monospace"
            fontWeight="bold"
          >
            COPPER
          </text>
          <text
            x="394"
            y="123"
            textAnchor="middle"
            fill="#fdba74"
            fontSize="8.5"
            fontFamily="monospace"
          >
            WINDING
          </text>

          {/* Motor Terminal Box */}
          <rect
            x="375"
            y="56"
            width="38"
            height="16"
            rx="3"
            fill="#0f2947"
            stroke="#38bdf8"
            strokeOpacity="0.5"
            strokeWidth="1.5"
          />

          {/* Pressure Gauge Node on Discharge */}
          <g transform="translate(310, 18)">
            <circle cx="0" cy="0" r="14" fill="#081a30" stroke="#22d3ee" strokeWidth="2" />
            <motion.line
              x1="0"
              y1="0"
              x2="0"
              y2="-9"
              stroke="#fb923c"
              strokeWidth="2"
              strokeLinecap="round"
              animate={{ rotate: [-35, 35, -10, 45, -35] }}
              transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
              style={{ originX: '0px', originY: '0px' }}
            />
            <circle cx="0" cy="0" r="2.5" fill="#22d3ee" />
          </g>

          {/* Baseplate */}
          <rect
            x="160"
            y="168"
            width="320"
            height="8"
            rx="4"
            fill="#0f2947"
            stroke="#38bdf8"
            strokeOpacity="0.35"
          />
        </svg>
      </div>

      {/* Bottom Live Telemetry Strip */}
      <div className="relative z-10 mt-3 grid grid-cols-3 gap-2 pt-3 border-t border-cyan-400/15">
        <div className="flex items-center gap-2 rounded-lg bg-white/5 px-2.5 py-1.5 border border-white/10">
          <Gauge size={15} className="text-cyan-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-slate-400">Pressure</p>
            <p className="text-xs font-semibold text-white truncate">Hydro-Tested</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-white/5 px-2.5 py-1.5 border border-white/10">
          <Zap size={15} className="text-orange-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-slate-400">Insulation</p>
            <p className="text-xs font-semibold text-white truncate">Megger Verified</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-white/5 px-2.5 py-1.5 border border-white/10">
          <Droplets size={15} className="text-sky-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-slate-400">Seals</p>
            <p className="text-xs font-semibold text-white truncate">Zero-Leak Fit</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HydraulicSchematic;

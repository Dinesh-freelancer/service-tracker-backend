import React from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck,
  User,
  Phone,
  Settings2,
  Weight,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
} from 'lucide-react';

const PickupForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const [status, setStatus] = React.useState(null); // 'success', 'error', 'loading'

  const onSubmit = async (data) => {
    setStatus('loading');
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || ''}/leads/pickup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );

      if (response.ok) {
        setStatus('success');
        reset();
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  const inputBaseClass =
    'w-full rounded-xl bg-slate-950/60 border border-white/15 pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/20 transition-all';

  return (
    <motion.div
      id="pickup-form"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, delay: 0.15 }}
      className="relative rounded-2xl bg-slate-900/65 backdrop-blur-2xl border border-cyan-400/25 p-6 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_40px_rgba(34,211,238,0.12)] overflow-hidden"
    >
      {/* Top Glowing Accent Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-sky-500 to-orange-400" />

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-cyan-300 mb-1">
            <Truck size={13} />
            Chennai Doorstep Dispatch
          </span>
          <h3 className="text-2xl font-bold text-white">Schedule a Pickup</h3>
          <p className="text-xs text-slate-300/80 mt-0.5">
            Fast workshop pickup & transparent repair estimate.
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shrink-0">
          <Truck size={20} />
        </div>
      </div>

      {/* Status Alerts */}
      <AnimatePresence mode="wait">
        {status === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-4 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-400/35 text-emerald-200 text-sm flex items-start gap-2.5"
          >
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-100">Pickup request received!</p>
              <p className="text-xs text-emerald-200/85 mt-0.5">
                Our Guindy service team will call you shortly to confirm dispatch.
              </p>
            </div>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-4 p-3.5 rounded-xl bg-red-500/15 border border-red-400/35 text-red-200 text-sm flex items-center gap-2.5"
          >
            <AlertCircle size={18} className="text-red-400 shrink-0" />
            <span>Something went wrong. Please try again or call us directly.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Name / Company *
          </label>
          <div className="relative">
            <User
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              {...register('name', { required: 'Name is required' })}
              className={inputBaseClass}
              placeholder="Your Name / Company"
            />
          </div>
          {errors.name && (
            <span className="text-rose-400 text-xs mt-1 block">
              {errors.name.message}
            </span>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Phone Number *
          </label>
          <div className="relative">
            <Phone
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              {...register('phone', { required: 'Phone is required' })}
              className={inputBaseClass}
              placeholder="+91 98765 43210"
            />
          </div>
          {errors.phone && (
            <span className="text-rose-400 text-xs mt-1 block">
              {errors.phone.message}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Pump Type
            </label>
            <div className="relative">
              <Settings2
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <select
                {...register('pumpType')}
                className={`${inputBaseClass} appearance-none cursor-pointer`}
              >
                <option value="" className="bg-slate-900 text-slate-300">
                  Select Type
                </option>
                <option value="Borewell" className="bg-slate-900 text-white">
                  Borewell Pump
                </option>
                <option value="Dewatering" className="bg-slate-900 text-white">
                  Dewatering Pump
                </option>
                <option value="Sewage" className="bg-slate-900 text-white">
                  Sewage Pump
                </option>
                <option value="Pressure" className="bg-slate-900 text-white">
                  Pressure Pump
                </option>
                <option value="Other" className="bg-slate-900 text-white">
                  Other
                </option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Approx Weight (kg)
            </label>
            <div className="relative">
              <Weight
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                {...register('approxWeight')}
                className={inputBaseClass}
                placeholder="e.g. 50"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Pickup Location *
          </label>
          <div className="relative">
            <MapPin
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              {...register('location', { required: 'Location is required' })}
              className={inputBaseClass}
              placeholder="Area / Industrial Estate / Street"
            />
          </div>
          {errors.location && (
            <span className="text-rose-400 text-xs mt-1 block">
              {errors.location.message}
            </span>
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.985 }}
          type="submit"
          disabled={status === 'loading'}
          className="w-full mt-2 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:via-sky-400 hover:to-blue-500 text-white font-bold py-3 px-5 rounded-xl shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
        >
          {status === 'loading' ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Scheduling Pickup...
            </>
          ) : (
            <>
              <Send size={17} />
              Request Free Pickup Quote
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default PickupForm;

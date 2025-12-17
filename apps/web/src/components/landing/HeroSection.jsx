import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, PhoneCall } from 'lucide-react';
import PickupForm from './PickupForm';

const HeroSection = () => {
  return (
    <div className="relative bg-primary overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
           <path d="M0 100 L100 0 L100 100 Z" fill="white" />
        </svg>
      </div>

      <div className="container mx-auto px-4 py-20 lg:py-32 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">

          {/* Text Content */}
          <div className="lg:w-1/2 text-white">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
              Expert Pump Repair & Service in Chennai.
            </h1>
            <p className="text-xl lg:text-2xl text-gray-200 mb-8 font-light">
              Over 20 years of trust. Specialists in Borewell, Dewatering, Sewage, and Pressure Pumps.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/login"
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-colors flex items-center"
              >
                Track My Repair <ArrowRight className="ml-2" size={20} />
              </Link>
              <a
                href="tel:+919876543210"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary font-bold py-3 px-8 rounded-lg transition-colors flex items-center"
              >
                <PhoneCall className="mr-2" size={20} /> Emergency Service
              </a>
            </div>
          </div>

          {/* Form */}
          <div className="lg:w-1/3 w-full">
             <PickupForm />
          </div>

        </div>
      </div>
    </div>
  );
};

export default HeroSection;

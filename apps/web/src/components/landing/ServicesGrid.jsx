import React from 'react';
import { Settings, Droplets, Activity, Wind } from 'lucide-react';

const ServicesGrid = () => {
  const services = [
    {
      title: "Borewell Pumps",
      description: "Submersible pump winding and repair for domestic and industrial use.",
      icon: <Droplets className="w-16 h-16 text-white" />,
      color: "bg-blue-600"
    },
    {
      title: "Dewatering Pumps",
      description: "Heavy-duty pumps for construction sites and flood control.",
      icon: <Wind className="w-16 h-16 text-white" />,
      color: "bg-orange-600"
    },
    {
      title: "Sewage Pumps",
      description: "Specialized maintenance for sewage and waste water handling systems.",
      icon: <Settings className="w-16 h-16 text-white" />,
      color: "bg-green-600"
    },
    {
      title: "Pressure Pumps",
      description: "Booster systems for high-rise buildings and industrial pressure needs.",
      icon: <Activity className="w-16 h-16 text-white" />,
      color: "bg-red-600"
    }
  ];

  return (
    <section className="py-16 bg-white" id="services">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-primary mb-12">Our Expertise</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <div key={index} className="group relative overflow-hidden rounded-lg shadow-lg">
              <div className={`${service.color} p-8 h-64 flex flex-col items-center justify-center transition-transform transform group-hover:scale-105`}>
                <div className="mb-4">{service.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{service.title}</h3>
                <p className="text-white text-center opacity-0 group-hover:opacity-100 transition-opacity text-sm">
                  {service.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Brands Ticker Placeholder */}
        <div className="mt-16 text-center">
            <h3 className="text-lg font-semibold text-gray-500 mb-4 uppercase tracking-wider">Brands We Service</h3>
            <div className="flex justify-center flex-wrap gap-8 opacity-60 grayscale hover:grayscale-0 transition-all">
                {/* Placeholders for logos */}
                <span className="text-2xl font-black text-gray-400">Kirloskar</span>
                <span className="text-2xl font-black text-gray-400">Texmo</span>
                <span className="text-2xl font-black text-gray-400">Crompton</span>
                <span className="text-2xl font-black text-gray-400">Grundfos</span>
                <span className="text-2xl font-black text-gray-400">KSB</span>
            </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesGrid;

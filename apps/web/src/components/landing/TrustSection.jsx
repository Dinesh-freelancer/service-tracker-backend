import React from 'react';
import { ShieldCheck, Award, Clock, PenTool } from 'lucide-react';

const TrustSection = () => {
  const items = [
    {
      icon: <Award className="w-12 h-12 text-primary" />,
      title: "20 Years Legacy",
      description: "Family owned & professionally managed since 2003."
    },
    {
      icon: <PenTool className="w-12 h-12 text-primary" />,
      title: "Genuine Spares",
      description: "We use only original parts for lasting repairs."
    },
    {
      icon: <ShieldCheck className="w-12 h-12 text-primary" />,
      title: "Service Warranty",
      description: "Peace of mind with our transparent service warranty."
    },
    {
      icon: <Clock className="w-12 h-12 text-primary" />,
      title: "Quick Turnaround",
      description: "Efficient diagnostics and repairs to minimize downtime."
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-primary mb-4">Why Trust Rassi & Company?</h2>
          <p className="text-secondary text-lg">Delivering excellence in pump repair services for over two decades.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((item, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow text-center">
              <div className="mb-4 flex justify-center">{item.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;

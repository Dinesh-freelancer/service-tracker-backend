import React from 'react';
import Navbar from '../components/layout/Navbar';
import HeroSection from '../components/landing/HeroSection';
import TrustSection from '../components/landing/TrustSection';
import RepairPipeline from '../components/landing/RepairPipeline';
import ServicesGrid from '../components/landing/ServicesGrid';
import LocationSection from '../components/landing/LocationSection';
import WhatsAppButton from '../components/landing/WhatsAppButton';
import Footer from '../components/layout/Footer';
import SEOHead from '../components/seo/SEOHead';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#03101f] text-white selection:bg-cyan-400/30 selection:text-white">
      <SEOHead />
      <Navbar />
      <main>
        <HeroSection />
        <TrustSection />
        <RepairPipeline />
        <ServicesGrid />
        <LocationSection />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default LandingPage;

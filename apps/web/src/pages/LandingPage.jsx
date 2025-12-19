import React from 'react';
import Navbar from '../components/layout/Navbar';
import HeroSection from '../components/landing/HeroSection';
import TrustSection from '../components/landing/TrustSection';
import ServicesGrid from '../components/landing/ServicesGrid';
import LocationSection from '../components/landing/LocationSection';
import WhatsAppButton from '../components/landing/WhatsAppButton';
import Footer from '../components/layout/Footer';
import SEOHead from '../components/seo/SEOHead';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <SEOHead />
      <Navbar />
      <HeroSection />
      <TrustSection />
      <ServicesGrid />
      <LocationSection />
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default LandingPage;

import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEOHead = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Rassi & Company",
    "description": "Expert Pump Repair & Service in Chennai with over 20 years of experience.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Chennai",
      "addressRegion": "TN",
      "addressCountry": "IN"
    },
    "openingHours": "Mo-Sa 09:00-18:00",
    "telephone": "+919876543210",
    "priceRange": "$$"
  };

  return (
    <Helmet>
      <title>Rassi & Company | Expert Pump Repair Services Chennai</title>
      <meta name="description" content="Over 20 years of trust. Specialists in Borewell, Dewatering, Sewage, and Pressure Pumps in Chennai." />
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

export default SEOHead;

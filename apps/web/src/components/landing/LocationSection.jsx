import React, { Suspense } from 'react';
import { MapPin, Navigation } from 'lucide-react';

const MapPlaceholder = () => (
    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 rounded-lg">
        <span className="text-lg">Google Maps Loading...</span>
    </div>
);

const LocationSection = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Info Side */}
            <div>
                <h2 className="text-3xl font-bold text-primary mb-6">Visit Our Workshop</h2>
                <div className="space-y-6">
                    <div className="flex items-start">
                        <MapPin className="w-8 h-8 text-primary mt-1 mr-4 flex-shrink-0" />
                        <div>
                            <h4 className="text-xl font-semibold text-gray-800">Easy Access Location</h4>
                            <p className="text-gray-600">
                                Located near Guindy Industrial Estate. Easy truck access for heavy equipment drop-off and pickup.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start">
                        <Navigation className="w-8 h-8 text-primary mt-1 mr-4 flex-shrink-0" />
                        <div>
                            <h4 className="text-xl font-semibold text-gray-800">Service Radius</h4>
                            <p className="text-gray-600">
                                Proudly serving Guindy, Ambattur, Sriperumbudur, and surrounding Chennai industrial hubs.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Side */}
            <div className="h-96 rounded-lg shadow-lg overflow-hidden border border-gray-200">
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
                    ></iframe>
                </Suspense>
            </div>

        </div>
      </div>
    </section>
  );
};

export default LocationSection;

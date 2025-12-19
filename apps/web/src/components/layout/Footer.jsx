import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-primary text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand & About */}
          <div>
            <h3 className="text-2xl font-bold mb-4">Rassi & Company</h3>
            <p className="text-gray-300 mb-4">
              Over 20 years of trust. Specialists in Borewell, Dewatering, Sewage, and Pressure Pumps.
            </p>
            <div className="flex space-x-4">
              {/* Social Proof Placeholders */}
              <a href="#" className="hover:text-secondary">Facebook</a>
              <a href="#" className="hover:text-secondary">LinkedIn</a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xl font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/login" className="hover:text-secondary">Login (Customer/Owner/Worker)</Link></li>
              <li><Link to="/about" className="hover:text-secondary">About Us</Link></li>
              <li><Link to="/services" className="hover:text-secondary">Services</Link></li>
              <li><Link to="/careers" className="hover:text-secondary">Careers</Link></li>
            </ul>
          </div>

          {/* Contact & Careers */}
          <div>
            <h4 className="text-xl font-semibold mb-4">Contact Us</h4>
            <div className="space-y-2 text-gray-300">
              <p className="flex items-center"><MapPin size={18} className="mr-2" /> Guindy, Chennai</p>
              <p className="flex items-center"><Phone size={18} className="mr-2" /> +91 98765 43210</p>
              <p className="flex items-center"><Mail size={18} className="mr-2" /> info@rassicompany.com</p>
            </div>
            <div className="mt-6 p-4 bg-secondary/20 rounded-lg border border-secondary">
              <h5 className="font-bold text-lg mb-1">Careers: We are hiring!</h5>
              <p className="text-sm">Skilled Winders needed. Apply now.</p>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} Rassi & Company. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;

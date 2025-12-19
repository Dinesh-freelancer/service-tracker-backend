import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.svg';

const Navbar = () => {
  return (
    <nav className="absolute top-0 left-0 w-full z-20 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center text-white font-bold text-xl lg:text-2xl">
          <img src={logo} alt="Rassi & Co Logo" className="w-10 h-10 mr-3" />
          <span className="drop-shadow-md">Rassi & Company</span>
        </Link>
        <div>
           <Link
             to="/login"
             className="text-white font-semibold hover:text-orange-400 transition-colors px-4 py-2"
           >
             Login
           </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

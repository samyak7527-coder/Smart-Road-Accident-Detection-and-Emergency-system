import React from 'react';
import { ShieldAlert, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-brand-dark text-white/70 border-t border-white/5 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Brand */}
          <div className="flex items-center gap-2">
            <ShieldAlert size={18} className="text-brand-red" />
            <span className="font-bold text-white text-md tracking-tight">
              SMART<span className="text-brand-red">CRASH</span>
            </span>
            <span className="text-xs">| Emergency System</span>
          </div>
          
          {/* Copyright */}
          <p className="text-xs text-center md:text-left">
            &copy; {new Date().getFullYear()} Smart Crash Detection. All rights reserved.
          </p>

          {/* Handcrafted with love */}
          <div className="flex items-center gap-1 text-xs">
            <span>Prototype developed with</span>
            <Heart size={12} className="text-brand-red fill-brand-red animate-pulse" />
            <span>for Arduino + Bluetooth integration</span>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;

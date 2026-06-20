import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Bluetooth, Navigation, BellRing, ChevronRight, Activity, Cpu } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="bg-brand-light flex flex-col min-h-screen">
      
      {/* Hero Section */}
      <section className="relative bg-brand-dark text-white py-20 px-4 overflow-hidden border-b border-white/5">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-red/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-accent/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-brand-red/10 text-brand-red border border-brand-red/20 mb-6 animate-pulse">
            <Activity size={12} /> Real-time Emergency Response System
          </span>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
            Smart Accident Detection <br className="hidden sm:inline" />
            &amp; <span className="text-brand-red">Automated Emergency</span> Alerts
          </h1>
          
          <p className="text-lg text-white/80 max-w-3xl mx-auto mb-10 leading-relaxed font-light">
            An advanced IoT-integrated safety portal that couples standard **Arduino Uno** crash detection hardware with mobile browser GPS routing to instantaneously alert emergency networks and dispatch medical assistance within a 10km radius.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/register" 
              className="flex items-center justify-center gap-2 px-8 py-4 bg-brand-red hover:bg-brand-crimson font-semibold rounded-xl text-white transition-all shadow-lg shadow-brand-red/20 hover:translate-y-[-2px]"
            >
              Get Started Now
              <ChevronRight size={18} />
            </Link>
            <a 
              href="#how-it-works" 
              className="flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/15 border border-white/15 font-semibold rounded-xl text-white transition-all hover:translate-y-[-2px]"
            >
              How It Works
            </a>
          </div>
        </div>
      </section>

      {/* Stats Quick Banner */}
      <section className="bg-brand-navy border-b border-white/5 py-6 px-4 text-white text-center">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 font-sans">
          <div className="flex flex-col items-center">
            <span className="text-brand-red font-black text-2xl">10 Seconds</span>
            <span className="text-xs text-white/60 uppercase tracking-widest mt-1">Countdown Grace Period</span>
          </div>
          <div className="flex flex-col items-center border-y sm:border-y-0 sm:border-x border-white/10 py-4 sm:py-0">
            <span className="text-brand-accent font-black text-2xl">Under 10 KM</span>
            <span className="text-xs text-white/60 uppercase tracking-widest mt-1">Hospital Finder Radius</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-white font-black text-2xl">HC-05 Standard</span>
            <span className="text-xs text-white/60 uppercase tracking-widest mt-1">Bluetooth Integration</span>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-brand-dark mb-4">
            Securing Lives Through Smart Integration
          </h2>
          <p className="text-brand-blue max-w-2xl mx-auto font-light">
            By connecting low-latency microcontroller hardware with high-precision mobile browser location schemas, we eradicate delay when seconds matter.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Arduino Sensor */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-brand-navy/5 hover:shadow-md transition-all">
            <div className="p-3 bg-brand-red/10 text-brand-red rounded-xl w-fit mb-6">
              <Cpu size={24} />
            </div>
            <h3 className="text-xl font-bold text-brand-dark mb-3">Vibration Crash Sensing</h3>
            <p className="text-sm text-brand-blue leading-relaxed font-light">
              Utilizes an **SW-420 high-sensitivity vibration sensor** wired to an Arduino Uno to detect intense shock signals indicative of collisions or rollovers.
            </p>
          </div>

          {/* Card 2: Bluetooth HC-05 */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-brand-navy/5 hover:shadow-md transition-all">
            <div className="p-3 bg-brand-navy/10 text-brand-navy rounded-xl w-fit mb-6">
              <Bluetooth size={24} className="text-brand-navy" />
            </div>
            <h3 className="text-xl font-bold text-brand-dark mb-3">Instant HC-05 Handshake</h3>
            <p className="text-sm text-brand-blue leading-relaxed font-light">
              Initiates immediate wireless bluetooth handshakes to the user's mobile dashboard via standard Web Bluetooth API protocols, avoiding manual setup steps.
            </p>
          </div>

          {/* Card 3: Geolocation */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-brand-navy/5 hover:shadow-md transition-all">
            <div className="p-3 bg-brand-accent/10 text-brand-blue rounded-xl w-fit mb-6">
              <Navigation size={24} className="text-brand-navy" />
            </div>
            <h3 className="text-xl font-bold text-brand-dark mb-3">Mobile GPS & Map Routing</h3>
            <p className="text-sm text-brand-blue leading-relaxed font-light">
              Harvests precise latitude, longitude, and timestamps natively from the vehicle operator's phone browser and identifies medical facilities within 10 km sorted by nearest distance.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works / Integration Pipeline */}
      <section id="how-it-works" className="bg-brand-navy text-white py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
              Real-time Hardware to Network Workflow
            </h2>
            <p className="text-white/60 font-light">
              Here is what happens during a severe crash event in less than 10 seconds:
            </p>
          </div>

          <div className="relative border-l border-white/10 pl-8 ml-4 md:ml-20 space-y-12">
            
            {/* Step 1 */}
            <div className="relative">
              <div className="absolute -left-[45px] top-0 p-2 bg-brand-red rounded-full text-white ring-8 ring-brand-navy">
                <Cpu size={16} />
              </div>
              <h3 className="text-lg font-bold">1. Impact Trigger</h3>
              <p className="text-sm text-white/70 mt-2 font-light">
                The **SW-420 sensor** registers a high shock rating. Arduino registers this, triggering the Bluetooth module to broadcast `ACCIDENT_DETECTED` to the paired device.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="absolute -left-[45px] top-0 p-2 bg-brand-blue rounded-full text-white ring-8 ring-brand-navy">
                <Bluetooth size={16} />
              </div>
              <h3 className="text-lg font-bold">2. Handshake & Grace Period</h3>
              <p className="text-sm text-white/70 mt-2 font-light">
                The web portal catches the signal and alerts the driver with a loud siren tone and a 10-second countdown display. The user can easily override false alarms by pressing "Cancel Alert".
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="absolute -left-[45px] top-0 p-2 bg-brand-accent rounded-full text-brand-dark ring-8 ring-brand-navy">
                <Navigation size={16} />
              </div>
              <h3 className="text-lg font-bold">3. Browser GPS Fetching</h3>
              <p className="text-sm text-white/70 mt-2 font-light">
                If the grace countdown is not cancelled, the application extracts high-accuracy latitude, longitude, and timestamps directly from the phone GPS receiver.
              </p>
            </div>

            {/* Step 4 */}
            <div className="relative">
              <div className="absolute -left-[45px] top-0 p-2 bg-white rounded-full text-brand-dark ring-8 ring-brand-navy">
                <BellRing size={16} />
              </div>
              <h3 className="text-lg font-bold">4. Emergency Dispatch</h3>
              <p className="text-sm text-white/70 mt-2 font-light">
                The system compiles the driver's name, vehicle license plates, blood group, and a custom clickable Google Maps link, then transmits notifications immediately to registered emergency contacts and local hospital networks.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Call To Action */}
      <section className="py-20 px-4 text-center max-w-4xl mx-auto">
        <h2 className="text-3xl font-extrabold text-brand-dark mb-6">
          Ready to Configure Your Crash System?
        </h2>
        <p className="text-brand-blue mb-10 max-w-2xl mx-auto font-light">
          Register your credentials, configure your vehicle profile, list your primary contact information, and upload our customized Arduino sketch to your vehicle module to begin driving safely.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
          <Link 
            to="/register" 
            className="px-8 py-3 bg-brand-navy hover:bg-brand-dark text-white font-semibold rounded-lg transition-all"
          >
            Create Your Account
          </Link>
          <Link 
            to="/login" 
            className="px-8 py-3 bg-white border border-brand-navy/10 hover:border-brand-navy/20 text-brand-navy font-semibold rounded-lg transition-all"
          >
            Access Dashboard
          </Link>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;

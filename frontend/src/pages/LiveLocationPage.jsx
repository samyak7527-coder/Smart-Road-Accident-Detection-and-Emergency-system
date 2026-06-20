import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Navigation, Calendar, Clock, User, Phone, Heart, ExternalLink, Building2, BellRing } from 'lucide-react';

const LiveLocationPage = () => {
  const { id } = useParams();
  const [accident, setAccident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAccidentDetails = async () => {
      try {
        const res = await fetch(`/api/accident/${id}`);
        const data = await res.json();

        if (data.success) {
          setAccident(data.accident);
        } else {
          setError(data.message || 'Failed to load accident details.');
        }
      } catch (err) {
        setError('Error fetching data from server.');
      } finally {
        setLoading(false);
      }
    };

    fetchAccidentDetails();
    
    // Poll for updates every 15 seconds (optional for real-time changes)
    const pollInterval = setInterval(fetchAccidentDetails, 15000);
    return () => clearInterval(pollInterval);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red mx-auto"></div>
          <p className="text-brand-blue text-sm">Loading emergency tracking details...</p>
        </div>
      </div>
    );
  }

  if (error || !accident) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="bg-white p-8 rounded-2xl border border-brand-navy/10 shadow-sm space-y-4">
          <span className="text-5xl">⚠️</span>
          <h2 className="text-2xl font-bold text-brand-dark">Tracking Report Unavailable</h2>
          <p className="text-brand-blue text-sm leading-relaxed">
            The accident identifier provided is invalid or has expired. Return to the dashboard.
          </p>
          <Link to="/dashboard" className="inline-block px-6 py-2.5 bg-brand-navy hover:bg-brand-dark text-white text-sm font-semibold rounded-xl">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const { user, latitude, longitude, timestamp, alertStatus, notifiedHospitals, notifiedContacts, logs } = accident;
  
  // Format Date and Time
  const eventDate = new Date(timestamp).toLocaleDateString();
  const eventTime = new Date(timestamp).toLocaleTimeString();
  
  // Google Maps Links
  const googleMapsUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
  const embedUrl = `https://maps.google.com/maps?q=${latitude},${longitude}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Incident Header Panel */}
      <div className="bg-brand-red text-white p-6 sm:p-8 rounded-3xl shadow-lg shadow-brand-red/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-[80px]" />
        
        <div className="relative z-10 space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white border border-white/20 uppercase tracking-widest animate-pulse">
            🚨 Active Emergency Tracker
          </span>
          <h1 className="text-3xl font-black font-sans">CRASH DETECTED</h1>
          <p className="text-white/80 text-sm leading-relaxed max-w-xl font-light">
            Automated alerts dispatched. Emergency contacts and local medical dispatch desks have been pinged with precise telemetry.
          </p>
        </div>

        <div className="relative z-10 bg-white/10 border border-white/15 px-5 py-3 rounded-2xl flex flex-col items-center shrink-0">
          <span className="text-[10px] text-white/60 uppercase tracking-wider">Alert Status</span>
          <span className="text-lg font-bold text-white mt-0.5">{alertStatus}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Interactive Map & Detailed Telemetry */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Interactive Google Map Card */}
          <div className="bg-white p-4 rounded-2xl border border-brand-navy/5 shadow-sm space-y-4">
            <h3 className="text-md font-bold text-brand-dark px-2 flex items-center gap-1.5">
              <MapPin size={18} className="text-brand-red" /> Accident Live Location
            </h3>

            {/* Embedded Google Maps View Center */}
            <div className="w-full h-96 rounded-xl overflow-hidden border border-brand-navy/5 relative bg-brand-light">
              <iframe
                title="Accident Location Map"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight="0"
                marginWidth="0"
                src={embedUrl}
                className="rounded-xl"
              />
            </div>

            {/* Map Action Links */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-brand-light p-4 rounded-xl">
              <div className="text-xs text-brand-blue flex flex-col sm:flex-row gap-4">
                <span className="flex items-center gap-1"><Navigation size={14} /> Lat: <strong>{latitude}</strong></span>
                <span className="flex items-center gap-1"><Navigation size={14} /> Lng: <strong>{longitude}</strong></span>
              </div>
              
              <a 
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 bg-brand-navy hover:bg-brand-dark text-white text-xs font-semibold rounded-lg transition-all"
              >
                Open in Google Maps <ExternalLink size={12} />
              </a>
            </div>
          </div>

          {/* Dynamic Nearby Hospital Finder */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-brand-navy/5 shadow-sm">
            <div className="border-b border-brand-navy/5 pb-4 mb-6">
              <h2 className="text-lg font-bold text-brand-dark flex items-center gap-2">
                <Building2 size={20} className="text-brand-navy" /> Trauma Center Allocations (&lt;10km)
              </h2>
              <p className="text-xs text-brand-blue font-light mt-1">
                Medical dispatch protocols sorted dynamically by nearest road transit distance.
              </p>
            </div>

            <div className="space-y-4">
              {notifiedHospitals && notifiedHospitals.length > 0 ? (
                notifiedHospitals.map((hospital, idx) => (
                  <div 
                    key={idx}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all ${idx === 0 ? 'bg-brand-red/5 border-brand-red/30' : 'bg-brand-light/50 border-brand-navy/5'}`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${idx === 0 ? 'bg-brand-red animate-pulse' : 'bg-brand-blue'}`} />
                        <h4 className="font-bold text-brand-dark text-sm sm:text-md">{hospital.name}</h4>
                        {idx === 0 && <span className="px-2 py-0.5 bg-brand-red/10 text-brand-red text-[8px] font-extrabold uppercase rounded-full tracking-widest">Nearest Response</span>}
                      </div>
                      <p className="text-xs text-brand-blue font-light pl-4">{hospital.address}</p>
                      <p className="text-[10px] text-brand-blue font-semibold pl-4">Phone: {hospital.contactNumber || 'Emergency Central'}</p>
                    </div>

                    <div className="flex items-center sm:flex-col items-end shrink-0 pl-4 sm:pl-0">
                      <span className="text-brand-red font-extrabold text-sm sm:text-md">{hospital.distance.toFixed(2)} km</span>
                      <span className="text-[9px] text-brand-blue font-light uppercase tracking-wider hidden sm:inline">Calculated Radius</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-brand-blue text-center">No hospitals detected in immediate vicinity.</p>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Driver File Card & Alert Dispatches */}
        <div className="space-y-8">
          
          {/* Driver Telemetry Information Card */}
          <div className="bg-white p-6 rounded-2xl border border-brand-navy/5 shadow-sm space-y-4">
            <h3 className="text-md font-bold text-brand-dark border-b border-brand-navy/5 pb-2 mb-4 flex items-center gap-1.5">
              <User size={16} className="text-brand-navy" /> Driver Profile File
            </h3>

            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-brand-light p-3 rounded-xl border border-brand-navy/5">
                <div className="h-10 w-10 bg-brand-red text-white font-extrabold rounded-lg flex items-center justify-center text-sm shadow">
                  {user.bloodGroup}
                </div>
                <div>
                  <h4 className="font-bold text-brand-dark text-sm">{user.fullName}</h4>
                  <p className="text-[10px] text-brand-blue">Blood Type Identifier</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-brand-light">
                  <span className="text-brand-blue font-light">Vehicle Plate:</span>
                  <span className="font-bold text-brand-dark uppercase">{user.vehicleNumber}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-brand-light">
                  <span className="text-brand-blue font-light">Mobile Phone:</span>
                  <span className="font-semibold text-brand-dark">{user.mobileNumber}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-brand-light">
                  <span className="text-brand-blue font-light">Date:</span>
                  <span className="font-semibold text-brand-dark flex items-center gap-1"><Calendar size={12} /> {eventDate}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-brand-blue font-light">Time:</span>
                  <span className="font-semibold text-brand-dark flex items-center gap-1"><Clock size={12} /> {eventTime}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notified Contacts Dashboard */}
          <div className="bg-white p-6 rounded-2xl border border-brand-navy/5 shadow-sm space-y-4">
            <h3 className="text-md font-bold text-brand-dark border-b border-brand-navy/5 pb-2 mb-4 flex items-center gap-1.5">
              <Phone size={16} className="text-brand-navy" /> Dispatched Emergency Contacts
            </h3>

            <div className="space-y-3">
              {user.emergencyContacts && user.emergencyContacts.length > 0 ? (
                user.emergencyContacts.map((contact, idx) => (
                  <div key={idx} className="p-4 bg-brand-light rounded-xl space-y-3 border border-brand-navy/5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-brand-dark text-sm">{contact.name}</span>
                      <span className="px-2.5 py-0.5 bg-brand-navy/10 text-brand-navy rounded-full text-[9px] font-semibold">{contact.relationship}</span>
                    </div>
                    <div className="text-xs text-brand-blue space-y-1.5">
                      <p>Mobile: <span className="font-semibold text-brand-dark">{contact.mobileNumber || 'None added'}</span></p>
                      <p>Email: <span className="font-semibold text-brand-dark">{contact.email || 'None added'}</span></p>
                    </div>
                    {/* Show dispatch status from notifiedContacts log if available */}
                    {notifiedContacts && notifiedContacts[idx] && (
                      <div className="flex items-center gap-1.5 pt-1">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                        <span className="text-[10px] text-emerald-700 font-semibold">
                          Alert dispatched via {notifiedContacts[idx].notifiedVia?.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-brand-blue text-center py-2">No emergency contacts configured.</p>
              )}
            </div>
          </div>

          {/* System Notification Logs */}
          <div className="bg-white p-6 rounded-2xl border border-brand-navy/5 shadow-sm space-y-4">
            <h3 className="text-md font-bold text-brand-dark border-b border-brand-navy/5 pb-2 mb-4 flex items-center gap-1.5">
              <BellRing size={16} className="text-brand-navy" /> Broadcast Verification
            </h3>

            <div className="space-y-3">
              {logs && logs.length > 0 ? (
                logs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs">
                    <div className={`p-1 rounded-full shrink-0 ${log.status === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      <span className="h-1.5 w-1.5 block rounded-full bg-current" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold uppercase text-[10px] text-brand-dark">{log.type}</span>
                        <span className="text-[8px] px-1.5 bg-brand-navy/10 rounded-full font-light">{log.status}</span>
                      </div>
                      <p className="text-[10px] text-brand-blue font-light mt-0.5">Sent to: {log.recipient}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-brand-blue text-center">Alert status queued.</p>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default LiveLocationPage;

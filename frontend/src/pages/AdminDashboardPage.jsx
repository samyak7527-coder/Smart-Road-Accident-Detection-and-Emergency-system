import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Users, AlertTriangle, Bell, Map, Phone, HelpCircle, Eye, RefreshCw, Layers } from 'lucide-react';

const AdminDashboardPage = () => {
  const { token } = useAuth();
  
  // Dashboard states
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAccidents: 0,
    totalAlertsSent: 0,
    hospitalNotifications: 0
  });
  const [users, setUsers] = useState([]);
  const [accidents, setAccidents] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'users', 'logs'
  const [selectedAccident, setSelectedAccident] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Stats
      const statsRes = await fetch('/api/accident/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const statsData = await statsRes.json();

      // 2. Fetch Users
      const usersRes = await fetch('/api/auth/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const usersData = await usersRes.json();

      // 3. Fetch Accidents
      const accRes = await fetch('/api/accident/admin/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const accData = await accRes.json();

      if (statsData.success && usersData.success && accData.success) {
        setStats(statsData.stats);
        setUsers(usersData.users);
        setAccidents(accData.accidents);
        
        if (accData.accidents.length > 0) {
          setSelectedAccident(accData.accidents[0]);
        }
      } else {
        setError('Failed to fetch administrative metrics.');
      }
    } catch (err) {
      setError('Error connecting to the administrative services.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-navy mx-auto"></div>
          <p className="text-brand-blue text-xs font-light">Loading central administration logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-dark flex items-center gap-2">
            <ShieldAlert size={28} className="text-brand-red animate-pulse" /> Emergency Command Center
          </h1>
          <p className="text-sm text-brand-blue font-light">
            Monitor real-time system performance, coordinate emergency dispatches, and review simulation telemetry.
          </p>
        </div>
        
        <button 
          onClick={fetchAdminData}
          className="flex items-center gap-1.5 px-4 py-2 border border-brand-navy/10 text-brand-navy hover:bg-brand-navy/5 text-xs font-semibold rounded-lg transition-all"
        >
          <RefreshCw size={12} /> Sync Command Feed
        </button>
      </div>

      {error && (
        <div className="bg-brand-red/10 border-l-4 border-brand-red p-4 rounded text-sm text-brand-crimson">
          {error}
        </div>
      )}

      {/* Aggregate Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Users */}
        <div className="bg-white p-5 rounded-2xl border border-brand-navy/5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-brand-navy/10 text-brand-navy rounded-xl"><Users size={20} /></div>
          <div>
            <span className="text-[10px] text-brand-blue uppercase tracking-wider font-semibold">Total Drivers</span>
            <h4 className="text-2xl font-bold text-brand-dark mt-0.5">{stats.totalUsers}</h4>
          </div>
        </div>

        {/* Total Accidents */}
        <div className="bg-white p-5 rounded-2xl border border-brand-navy/5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-brand-red/10 text-brand-red rounded-xl"><AlertTriangle size={20} /></div>
          <div>
            <span className="text-[10px] text-brand-blue uppercase tracking-wider font-semibold">Active Crashes</span>
            <h4 className="text-2xl font-bold text-brand-dark mt-0.5">{stats.totalAccidents}</h4>
          </div>
        </div>

        {/* Total Alerts Sent */}
        <div className="bg-white p-5 rounded-2xl border border-brand-navy/5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-brand-navy/10 text-brand-navy rounded-xl"><Bell size={20} /></div>
          <div>
            <span className="text-[10px] text-brand-blue uppercase tracking-wider font-semibold">Alerts Broadcast</span>
            <h4 className="text-2xl font-bold text-brand-dark mt-0.5">{stats.totalAlertsSent}</h4>
          </div>
        </div>

        {/* Hospital dispatch */}
        <div className="bg-white p-5 rounded-2xl border border-brand-navy/5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-brand-navy/10 text-brand-navy rounded-xl"><Layers size={20} /></div>
          <div>
            <span className="text-[10px] text-brand-blue uppercase tracking-wider font-semibold">Hospitals Alerted</span>
            <h4 className="text-2xl font-bold text-brand-dark mt-0.5">{stats.hospitalNotifications}</h4>
          </div>
        </div>

      </div>

      {/* Tabs */}
      <div className="border-b border-brand-navy/5 flex gap-6 text-sm font-semibold">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`pb-3 transition-colors relative ${activeTab === 'overview' ? 'text-brand-red' : 'text-brand-blue hover:text-brand-dark'}`}
        >
          Overview &amp; Telemetry Map
          {activeTab === 'overview' && <span className="absolute bottom-0 inset-x-0 h-0.5 bg-brand-red rounded-full" />}
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          className={`pb-3 transition-colors relative ${activeTab === 'users' ? 'text-brand-red' : 'text-brand-blue hover:text-brand-dark'}`}
        >
          Registered Drivers ({users.length})
          {activeTab === 'users' && <span className="absolute bottom-0 inset-x-0 h-0.5 bg-brand-red rounded-full" />}
        </button>
        <button 
          onClick={() => setActiveTab('logs')}
          className={`pb-3 transition-colors relative ${activeTab === 'logs' ? 'text-brand-red' : 'text-brand-blue hover:text-brand-dark'}`}
        >
          Emergency Notification Logs
          {activeTab === 'logs' && <span className="absolute bottom-0 inset-x-0 h-0.5 bg-brand-red rounded-full" />}
        </button>
      </div>

      {/* Dynamic Tab Content */}
      <div className="space-y-6">
        
        {/* 1. OVERVIEW & TELEMETRY */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Accidents List */}
            <div className="lg:col-span-1 bg-white rounded-2xl border border-brand-navy/5 shadow-sm overflow-hidden flex flex-col h-[520px]">
              <div className="p-4 bg-brand-navy text-white font-bold flex items-center justify-between">
                <span>Recent System Alerts</span>
                <span className="text-[10px] px-2 py-0.5 bg-white/20 text-white rounded-full font-light">{accidents.length} logged</span>
              </div>
              
              <div className="divide-y divide-brand-light overflow-y-auto flex-1">
                {accidents.length > 0 ? (
                  accidents.map((acc) => (
                    <button
                      key={acc._id}
                      onClick={() => setSelectedAccident(acc)}
                      className={`w-full text-left p-4 hover:bg-brand-light/40 transition-colors flex items-start gap-3 border-l-4 ${selectedAccident?._id === acc._id ? 'border-brand-red bg-brand-red/5' : 'border-transparent'}`}
                    >
                      <div className="h-2 w-2 rounded-full bg-brand-red shrink-0 mt-1.5" />
                      <div className="space-y-1">
                        <h4 className="font-bold text-brand-dark text-xs">{acc.user?.fullName || 'Anonymous Driver'}</h4>
                        <p className="text-[10px] text-brand-navy uppercase font-semibold">{acc.user?.vehicleNumber || 'No Plate'}</p>
                        <p className="text-[9px] text-brand-blue font-light">{new Date(acc.timestamp).toLocaleString()}</p>
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="text-xs text-brand-blue text-center p-8">No incident reports logged yet.</p>
                )}
              </div>
            </div>

            {/* Map Telemetry Monitor Center */}
            <div className="lg:col-span-2 space-y-6">
              {selectedAccident ? (
                <div className="bg-white p-5 rounded-2xl border border-brand-navy/5 shadow-sm space-y-4">
                  
                  {/* Selected Accident Stats Header */}
                  <div className="flex justify-between items-start border-b border-brand-navy/5 pb-3">
                    <div>
                      <h3 className="font-bold text-brand-dark text-md">Incident Live Mapping Desk</h3>
                      <p className="text-xs text-brand-blue font-light">Driver: <strong>{selectedAccident.user?.fullName}</strong> ({selectedAccident.user?.vehicleNumber})</p>
                    </div>
                    
                    <a
                      href={`/live/${selectedAccident._id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-red hover:text-brand-crimson font-bold text-xs flex items-center gap-1"
                    >
                      <Eye size={12} /> Dispatch View
                    </a>
                  </div>

                  {/* Embedded Google Map */}
                  <div className="w-full h-80 rounded-xl overflow-hidden border border-brand-navy/5 relative bg-brand-light">
                    <iframe
                      title="Incident Map Monitor"
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      scrolling="no"
                      src={`https://maps.google.com/maps?q=${selectedAccident.latitude},${selectedAccident.longitude}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-brand-light p-3 rounded-xl text-xs text-brand-blue font-light">
                    <div>Latitude: <strong className="font-mono text-brand-dark">{selectedAccident.latitude}</strong></div>
                    <div>Longitude: <strong className="font-mono text-brand-dark">{selectedAccident.longitude}</strong></div>
                    <div>Blood Group: <span className="font-extrabold text-brand-red">{selectedAccident.user?.bloodGroup || 'O+'}</span></div>
                    <div>Mobile: <strong className="text-brand-dark">{selectedAccident.user?.mobileNumber}</strong></div>
                  </div>

                </div>
              ) : (
                <div className="bg-white p-20 rounded-2xl border border-brand-navy/10 text-center text-brand-blue">
                  <Map className="mx-auto text-brand-blue/30 mb-2" size={32} />
                  <p className="font-bold">Command Map Desk Offline</p>
                  <p className="text-xs font-light">Select a crash incident report from the feed to track live map telemetries.</p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* 2. REGISTERED DRIVERS ROSTER */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl border border-brand-navy/5 shadow-sm overflow-hidden">
            {users.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  
                  <thead>
                    <tr className="bg-brand-navy text-white font-semibold">
                      <th className="py-4 px-6">Driver Name</th>
                      <th className="py-4 px-6">Email / Mobile</th>
                      <th className="py-4 px-6">Plate Number</th>
                      <th className="py-4 px-6">Blood Type</th>
                      <th className="py-4 px-6">Emergency Contacts</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-brand-light">
                    {users.map((driver) => (
                      <tr key={driver._id} className="hover:bg-brand-light/30 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-bold text-brand-dark">{driver.fullName}</div>
                          <span className="text-[10px] text-brand-blue uppercase font-light">Role: {driver.role}</span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-brand-dark">{driver.email}</div>
                          <div className="text-xs text-brand-blue font-light">{driver.mobileNumber}</div>
                        </td>
                        <td className="py-4 px-6 uppercase font-mono font-bold text-brand-navy">{driver.vehicleNumber}</td>
                        <td className="py-4 px-6 font-bold text-brand-red">{driver.bloodGroup}</td>
                        <td className="py-4 px-6 text-xs">
                          {driver.emergencyContact ? (
                            <div>
                              <div className="font-bold text-brand-dark">{driver.emergencyContact.name} ({driver.emergencyContact.relationship})</div>
                              <span className="text-brand-blue font-light">Phone: {driver.emergencyContact.mobileNumber}</span>
                            </div>
                          ) : (
                            <span className="text-brand-blue/50 font-light">None set</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>
            ) : (
              <p className="text-center text-brand-blue p-12">No drivers registered on safety database yet.</p>
            )}
          </div>
        )}

        {/* 3. SIMULATED SYSTEM LOGS */}
        {activeTab === 'logs' && (
          <div className="bg-white rounded-2xl border border-brand-navy/5 shadow-sm overflow-hidden">
            <div className="p-4 bg-brand-navy text-white font-bold flex items-center justify-between border-b border-brand-navy/10">
              <h3 className="text-sm flex items-center gap-1.5"><Bell size={16} /> Broadcast Dispatch Audit Logs</h3>
              <p className="text-[10px] text-white/60 font-light">Prototype simulation delivery results</p>
            </div>

            <div className="divide-y divide-brand-light max-h-[600px] overflow-y-auto">
              {accidents.length > 0 ? (
                accidents.flatMap(acc => 
                  (acc.logs || []).map((log, lIdx) => (
                    <div key={`${acc._id}-${lIdx}`} className="p-5 hover:bg-brand-light/30 transition-colors flex gap-4 items-start text-xs">
                      
                      {/* Status indicator dot */}
                      <span className={`h-2.5 w-2.5 rounded-full shrink-0 mt-1.5 ${log.status === 'success' ? 'bg-emerald-500' : log.status === 'simulated' ? 'bg-brand-blue' : 'bg-brand-red'}`} />
                      
                      {/* Log details */}
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold uppercase tracking-wider text-[10px] text-brand-navy">{log.type} ALERT</span>
                            <span className="text-[8px] font-semibold text-brand-blue uppercase px-2 py-0.5 bg-brand-navy/10 rounded-full tracking-wide">{log.status}</span>
                          </div>
                          <span className="text-[9px] text-brand-blue font-light">{new Date(log.timestamp).toLocaleString()}</span>
                        </div>

                        <div className="text-[11px] text-brand-blue font-light">Recipient: <strong className="text-brand-dark font-sans">{log.recipient}</strong></div>
                        <div className="p-3 bg-brand-light rounded-lg font-mono text-[10px] text-brand-dark border border-brand-navy/5 whitespace-pre-wrap mt-2 select-all">
                          {log.message}
                        </div>
                      </div>

                    </div>
                  ))
                )
              ) : (
                <p className="p-12 text-center text-brand-blue">No emergency notification audits queued.</p>
              )}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

export default AdminDashboardPage;

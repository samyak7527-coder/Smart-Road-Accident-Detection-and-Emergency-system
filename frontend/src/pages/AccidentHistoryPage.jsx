import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, Calendar, MapPin, AlertTriangle, Eye, Clock, ShieldCheck, Filter } from 'lucide-react';

const AccidentHistoryPage = () => {
  const { token } = useAuth();
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('/api/accident/history', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();

        if (data.success) {
          setHistory(data.history || []);
          setFilteredHistory(data.history || []);
        } else {
          setError(data.message || 'Failed to load accident history.');
        }
      } catch (err) {
        setError('Error connecting to the server.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [token]);

  // Handle Search and Filters
  useEffect(() => {
    let result = [...history];

    // Apply Search term filter (searches date, coordinates, status)
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(item => {
        const dateStr = new Date(item.timestamp).toLocaleDateString().toLowerCase();
        const latStr = item.latitude.toString();
        const lngStr = item.longitude.toString();
        const statusStr = item.alertStatus.toLowerCase();
        return dateStr.includes(term) || latStr.includes(term) || lngStr.includes(term) || statusStr.includes(term);
      });
    }

    // Apply Status filter
    if (statusFilter !== '') {
      result = result.filter(item => item.alertStatus === statusFilter);
    }

    setFilteredHistory(result);
  }, [searchTerm, statusFilter, history]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-red"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-brand-dark">My Accident Log</h1>
        <p className="text-sm text-brand-blue font-light">
          History log of vibration shock alerts registered by your hardware modules.
        </p>
      </div>

      {error && (
        <div className="bg-brand-red/10 border-l-4 border-brand-red p-4 rounded text-sm text-brand-crimson">
          {error}
        </div>
      )}

      {/* Searching & Filtering Panel */}
      <div className="bg-white p-4 rounded-xl border border-brand-navy/5 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-brand-blue/50"><Search size={16} /></span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-9 pr-4 py-2.5 bg-brand-light border border-brand-navy/10 rounded-xl text-brand-dark text-sm focus:outline-none focus:border-brand-navy"
            placeholder="Search by Date, Coordinates, or Status..."
          />
        </div>

        {/* Filter status */}
        <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-end">
          <Filter size={14} className="text-brand-blue" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block py-2.5 px-3 bg-brand-light border border-brand-navy/10 rounded-xl text-brand-dark text-sm focus:outline-none focus:border-brand-navy appearance-none pr-8 relative"
          >
            <option value="">All Alert Statuses</option>
            <option value="Sent">Dispatched Alerts (Sent)</option>
            <option value="Pending">Pending Actions</option>
            <option value="Cancelled">Cancelled Actions</option>
          </select>
        </div>

      </div>

      {/* History table view */}
      <div className="bg-white rounded-2xl border border-brand-navy/5 shadow-sm overflow-hidden">
        {filteredHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              
              <thead>
                <tr className="bg-brand-navy text-white font-semibold">
                  <th className="py-4 px-6">Incident ID</th>
                  <th className="py-4 px-6">Date &amp; Time</th>
                  <th className="py-4 px-6">GPS Coordinates</th>
                  <th className="py-4 px-6">Alert Channels</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-center">Track</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-brand-light">
                {filteredHistory.map((item) => (
                  <tr key={item._id} className="hover:bg-brand-light/50 transition-colors">
                    
                    {/* ID */}
                    <td className="py-4 px-6 font-mono text-xs text-brand-navy select-all">
                      {item._id.slice(-8).toUpperCase()}
                    </td>
                    
                    {/* Timestamp */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-brand-dark flex items-center gap-1"><Calendar size={12} className="text-brand-blue" /> {new Date(item.timestamp).toLocaleDateString()}</span>
                        <span className="text-[10px] text-brand-blue font-light mt-0.5 flex items-center gap-1"><Clock size={12} /> {new Date(item.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </td>

                    {/* Coordinates */}
                    <td className="py-4 px-6 font-mono text-xs text-brand-blue">
                      <span className="block">Lat: {item.latitude.toFixed(5)}</span>
                      <span className="block">Lng: {item.longitude.toFixed(5)}</span>
                    </td>

                    {/* Channels */}
                    <td className="py-4 px-6">
                      <div className="flex gap-1.5 flex-wrap">
                        {item.notifiedContacts?.[0]?.notifiedVia?.map((channel, i) => (
                          <span key={i} className="px-2 py-0.5 bg-brand-light text-[9px] font-semibold text-brand-navy rounded border border-brand-navy/5 capitalize">
                            {channel}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${item.alertStatus === 'Sent' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : item.alertStatus === 'Cancelled' ? 'bg-brand-navy/10 text-brand-navy' : 'bg-amber-50 text-amber-700'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${item.alertStatus === 'Sent' ? 'bg-emerald-500' : 'bg-brand-blue'}`} />
                        {item.alertStatus === 'Sent' ? 'Alerts Dispatched' : item.alertStatus}
                      </span>
                    </td>

                    {/* Tracking Action */}
                    <td className="py-4 px-6 text-center">
                      <Link 
                        to={`/live/${item._id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-brand-red hover:text-brand-crimson hover:underline"
                      >
                        <Eye size={14} /> View Details
                      </Link>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-brand-blue space-y-2">
            <AlertTriangle className="mx-auto text-brand-blue/50" size={32} />
            <p className="font-bold text-brand-dark">No Incidents Logged</p>
            <p className="text-xs font-light">Accidents triggered on paired hardware units will populate this grid automatically.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default AccidentHistoryPage;

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Phone, Car, Heart, Home, Users, Mail, Save, AlertCircle } from 'lucide-react';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // States initialized from context user
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [address, setAddress] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRelationship, setEmergencyRelationship] = useState('');
  const [emergencyMobile, setEmergencyMobile] = useState('');
  const [emergencyEmail, setEmergencyEmail] = useState('');

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setMobileNumber(user.mobileNumber || '');
      setVehicleNumber(user.vehicleNumber || '');
      setBloodGroup(user.bloodGroup || '');
      setAddress(user.address || '');
      const primaryContact = user.emergencyContacts?.[0];
      setEmergencyName(primaryContact?.name || '');
      setEmergencyRelationship(primaryContact?.relationship || '');
      setEmergencyMobile(primaryContact?.mobileNumber || '');
      setEmergencyEmail(primaryContact?.email || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!fullName || !mobileNumber || !vehicleNumber || !bloodGroup || !address || !emergencyName || !emergencyRelationship || !emergencyMobile) {
      setError('Please fill in all required fields.');
      return;
    }

    setFormLoading(true);
    const payload = {
      fullName,
      mobileNumber,
      vehicleNumber,
      bloodGroup,
      address,
      emergencyContacts: [
        {
          name: emergencyName,
          relationship: emergencyRelationship,
          mobileNumber: emergencyMobile,
          email: emergencyEmail
        }
      ]
    };

    try {
      const res = await updateProfile(payload);
      if (res.success) {
        setSuccess('Profile updated successfully.');
      } else {
        setError(res.message || 'Failed to update profile.');
      }
    } catch (err) {
      setError('Server connection failed.');
    } finally {
      setFormLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-navy"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-extrabold text-brand-dark mb-2">My Safety Profile</h1>
      <p className="text-sm text-brand-blue mb-8 font-light">
        Manage your personal emergency metrics and register contacts.
      </p>

      {error && (
        <div className="mb-6 bg-brand-red/10 border-l-4 border-brand-red p-4 rounded text-sm text-brand-crimson flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded text-sm text-emerald-700">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Driver Details Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-brand-navy/5 shadow-sm">
          <h2 className="text-lg font-bold text-brand-dark border-b border-brand-navy/5 pb-3 mb-6 flex items-center gap-2">
            <User size={18} className="text-brand-navy" /> Driver Profile Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-blue mb-1.5">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-brand-blue/50"><User size={16} /></span>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="block w-full pl-9 pr-4 py-2.5 bg-brand-light border border-brand-navy/10 rounded-xl text-brand-dark text-sm focus:outline-none focus:border-brand-navy"
                />
              </div>
            </div>

            {/* Email Address - Disabled */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-blue mb-1.5">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-brand-blue/55"><Mail size={16} /></span>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="block w-full pl-9 pr-4 py-2.5 bg-brand-light/70 border border-brand-navy/5 rounded-xl text-brand-blue/80 text-sm cursor-not-allowed"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-blue mb-1.5">Mobile Number</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-brand-blue/50"><Phone size={16} /></span>
                <input
                  type="text"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="block w-full pl-9 pr-4 py-2.5 bg-brand-light border border-brand-navy/10 rounded-xl text-brand-dark text-sm focus:outline-none focus:border-brand-navy"
                />
              </div>
            </div>

            {/* Vehicle Number */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-blue mb-1.5">Vehicle License Number</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-brand-blue/50"><Car size={16} /></span>
                <input
                  type="text"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  className="block w-full pl-9 pr-4 py-2.5 bg-brand-light border border-brand-navy/10 rounded-xl text-brand-dark text-sm focus:outline-none focus:border-brand-navy"
                />
              </div>
            </div>

            {/* Blood Group */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-blue mb-1.5">Blood Group</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-brand-red"><Heart size={16} /></span>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="block w-full pl-9 pr-4 py-2.5 bg-brand-light border border-brand-navy/10 rounded-xl text-brand-dark text-sm focus:outline-none focus:border-brand-navy"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>

            {/* Address */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-blue mb-1.5">Residential Address</label>
              <div className="relative">
                <span className="absolute top-3.5 left-0 pl-3 text-brand-blue/50"><Home size={16} /></span>
                <textarea
                  rows="2"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="block w-full pl-9 pr-4 py-2.5 bg-brand-light border border-brand-navy/10 rounded-xl text-brand-dark text-sm focus:outline-none focus:border-brand-navy"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Emergency Contacts Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-brand-navy/5 shadow-sm">
          <h2 className="text-lg font-bold text-brand-dark border-b border-brand-navy/5 pb-3 mb-6 flex items-center gap-2">
            <Users size={18} className="text-brand-navy" /> Emergency Contact Info
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Contact Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-blue mb-1.5">Contact Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-brand-blue/50"><User size={16} /></span>
                <input
                  type="text"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  className="block w-full pl-9 pr-4 py-2.5 bg-brand-light border border-brand-navy/10 rounded-xl text-brand-dark text-sm focus:outline-none focus:border-brand-navy"
                />
              </div>
            </div>

            {/* Relationship */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-blue mb-1.5">Relationship</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-brand-blue/50"><Users size={16} /></span>
                <input
                  type="text"
                  value={emergencyRelationship}
                  onChange={(e) => setEmergencyRelationship(e.target.value)}
                  className="block w-full pl-9 pr-4 py-2.5 bg-brand-light border border-brand-navy/10 rounded-xl text-brand-dark text-sm focus:outline-none focus:border-brand-navy"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-blue mb-1.5">Contact Mobile Number</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-brand-blue/50"><Phone size={16} /></span>
                <input
                  type="text"
                  value={emergencyMobile}
                  onChange={(e) => setEmergencyMobile(e.target.value)}
                  className="block w-full pl-9 pr-4 py-2.5 bg-brand-light border border-brand-navy/10 rounded-xl text-brand-dark text-sm focus:outline-none focus:border-brand-navy"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-blue mb-1.5">Contact Email (for Email Alerts)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-brand-blue/50"><Mail size={16} /></span>
                <input
                  type="email"
                  value={emergencyEmail}
                  onChange={(e) => setEmergencyEmail(e.target.value)}
                  className="block w-full pl-9 pr-4 py-2.5 bg-brand-light border border-brand-navy/10 rounded-xl text-brand-dark text-sm focus:outline-none focus:border-brand-navy"
                  placeholder="emergency@domain.com"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={formLoading}
            className="flex items-center gap-2 px-8 py-3.5 bg-brand-navy hover:bg-brand-dark text-white font-semibold rounded-xl transition-all shadow-md shadow-brand-navy/10 disabled:opacity-50"
          >
            <Save size={18} />
            {formLoading ? 'Saving changes...' : 'Save Settings'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default ProfilePage;

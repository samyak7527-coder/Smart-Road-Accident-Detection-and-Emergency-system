import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, User, Mail, Lock, Phone, Car, Heart, Home, Users, ArrowRight, ArrowLeft } from 'lucide-react';

const RegisterPage = () => {
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Form Fields State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [address, setAddress] = useState('');
  
  // Emergency Contact State
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRelationship, setEmergencyRelationship] = useState('');
  const [emergencyMobile, setEmergencyMobile] = useState('');
  const [emergencyEmail, setEmergencyEmail] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleNextStep = () => {
    // Validate Step 1
    if (!fullName || !email || !password || !mobileNumber || !vehicleNumber || !bloodGroup || !address) {
      setError('Please fill in all personal and vehicle details.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handlePrevStep = () => {
    setError('');
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate Step 2
    if (!emergencyName || !emergencyRelationship || !emergencyMobile) {
      setError('Please fill in all primary emergency contact details.');
      return;
    }

    setFormLoading(true);

    const payload = {
      fullName,
      email,
      password,
      mobileNumber,
      vehicleNumber,
      bloodGroup,
      address,
      emergencyContactName: emergencyName,
      emergencyContactRelationship: emergencyRelationship,
      emergencyContactMobile: emergencyMobile,
      emergencyContactEmail: emergencyEmail || email // Fallback to driver's email if not provided
    };

    try {
      const res = await register(payload);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.message || 'Registration failed. Check details.');
      }
    } catch (err) {
      setError('Failed to connect to the server.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] py-12 px-4 sm:px-6 lg:px-8 bg-brand-light relative flex items-center justify-center">
      {/* Decorative Gradients */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-brand-red/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-brand-navy/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-2xl w-full bg-white p-8 sm:p-10 rounded-2xl shadow-lg border border-brand-navy/5 relative z-10">
        
        {/* Title */}
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 bg-brand-red/10 rounded-full flex items-center justify-center text-brand-red animate-pulse mb-3">
            <ShieldAlert size={28} />
          </div>
          <h2 className="text-3xl font-extrabold text-brand-dark">Vehicle Safety Portal</h2>
          <p className="mt-2 text-sm text-brand-blue font-light">
            Register your vehicle details and configure emergency alerts.
          </p>
        </div>

        {/* Multi-step progress bar */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className={`flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all ${step === 1 ? 'bg-brand-navy text-white' : 'bg-brand-navy/10 text-brand-navy'}`}>
            <User size={12} /> Driver &amp; Vehicle
          </div>
          <div className="w-10 h-[2px] bg-brand-navy/20" />
          <div className={`flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all ${step === 2 ? 'bg-brand-navy text-white' : 'bg-brand-navy/10 text-brand-navy'}`}>
            <Users size={12} /> Emergency Contacts
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-brand-red/10 border-l-4 border-brand-red p-4 rounded text-sm text-brand-crimson">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 ? (
            /* Step 1: User & Vehicle Details */
            <div className="space-y-5">
              <h3 className="text-md font-bold text-brand-dark border-b border-brand-navy/5 pb-2 mb-4">Driver Profile Information</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-brand-blue mb-1.5">Full Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-brand-blue/50"><User size={16} /></span>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="block w-full pl-10 pr-4 py-2.5 bg-brand-light border border-brand-navy/10 rounded-xl text-brand-dark text-sm focus:outline-none focus:border-brand-navy transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-brand-blue mb-1.5">Email Address</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-brand-blue/50"><Mail size={16} /></span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-4 py-2.5 bg-brand-light border border-brand-navy/10 rounded-xl text-brand-dark text-sm focus:outline-none focus:border-brand-navy transition-all"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-brand-blue mb-1.5">Password</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-brand-blue/50"><Lock size={16} /></span>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-4 py-2.5 bg-brand-light border border-brand-navy/10 rounded-xl text-brand-dark text-sm focus:outline-none focus:border-brand-navy transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-brand-blue mb-1.5">Mobile Number</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-brand-blue/50"><Phone size={16} /></span>
                    <input
                      type="tel"
                      required
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      className="block w-full pl-10 pr-4 py-2.5 bg-brand-light border border-brand-navy/10 rounded-xl text-brand-dark text-sm focus:outline-none focus:border-brand-navy transition-all"
                      placeholder="+1 (555) 012-3456"
                    />
                  </div>
                </div>

                {/* Vehicle Number */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-brand-blue mb-1.5">Vehicle License Number</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-brand-blue/50"><Car size={16} /></span>
                    <input
                      type="text"
                      required
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value)}
                      className="block w-full pl-10 pr-4 py-2.5 bg-brand-light border border-brand-navy/10 rounded-xl text-brand-dark text-sm focus:outline-none focus:border-brand-navy transition-all"
                      placeholder="CAR-9988-NY"
                    />
                  </div>
                </div>

                {/* Blood Group */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-brand-blue mb-1.5">Blood Group</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-brand-blue/50"><Heart size={16} className="text-brand-red" /></span>
                    <select
                      value={bloodGroup}
                      required
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="block w-full pl-10 pr-4 py-2.5 bg-brand-light border border-brand-navy/10 rounded-xl text-brand-dark text-sm focus:outline-none focus:border-brand-navy transition-all appearance-none"
                    >
                      <option value="">Select Blood Group</option>
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

              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-blue mb-1.5">Residential Address</label>
                <div className="relative">
                  <span className="absolute top-3 left-0 pl-3.5 text-brand-blue/50"><Home size={16} /></span>
                  <textarea
                    rows="2"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2.5 bg-brand-light border border-brand-navy/10 rounded-xl text-brand-dark text-sm focus:outline-none focus:border-brand-navy transition-all"
                    placeholder="123 Main St, Apartment 4B, New York, NY"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-brand-navy/5 flex justify-end">
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="flex items-center gap-1.5 px-6 py-3 bg-brand-navy hover:bg-brand-dark text-white text-sm font-semibold rounded-xl transition-all"
                >
                  Continue to Contacts <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ) : (
            /* Step 2: Emergency Contact Details */
            <div className="space-y-5 animate-[fadeIn_0.2s_ease-out]">
              <h3 className="text-md font-bold text-brand-dark border-b border-brand-navy/5 pb-2 mb-4">Primary Emergency Contact</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Contact Name */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-brand-blue mb-1.5">Contact Full Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-brand-blue/50"><User size={16} /></span>
                    <input
                      type="text"
                      required
                      value={emergencyName}
                      onChange={(e) => setEmergencyName(e.target.value)}
                      className="block w-full pl-10 pr-4 py-2.5 bg-brand-light border border-brand-navy/10 rounded-xl text-brand-dark text-sm focus:outline-none focus:border-brand-navy transition-all"
                      placeholder="Jane Doe"
                    />
                  </div>
                </div>

                {/* Relationship */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-brand-blue mb-1.5">Relationship to Driver</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-brand-blue/50"><Users size={16} /></span>
                    <input
                      type="text"
                      required
                      value={emergencyRelationship}
                      onChange={(e) => setEmergencyRelationship(e.target.value)}
                      className="block w-full pl-10 pr-4 py-2.5 bg-brand-light border border-brand-navy/10 rounded-xl text-brand-dark text-sm focus:outline-none focus:border-brand-navy transition-all"
                      placeholder="Spouse / Parent / Sibling"
                    />
                  </div>
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-brand-blue mb-1.5">Contact Mobile Number</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-brand-blue/50"><Phone size={16} /></span>
                    <input
                      type="tel"
                      required
                      value={emergencyMobile}
                      onChange={(e) => setEmergencyMobile(e.target.value)}
                      className="block w-full pl-10 pr-4 py-2.5 bg-brand-light border border-brand-navy/10 rounded-xl text-brand-dark text-sm focus:outline-none focus:border-brand-navy transition-all"
                      placeholder="+1 (555) 098-7654"
                    />
                  </div>
                </div>

                {/* Contact Email (New!) */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-brand-blue mb-1.5">Contact Email (for Email Alerts)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-brand-blue/50"><Mail size={16} /></span>
                    <input
                      type="email"
                      value={emergencyEmail}
                      onChange={(e) => setEmergencyEmail(e.target.value)}
                      className="block w-full pl-10 pr-4 py-2.5 bg-brand-light border border-brand-navy/10 rounded-xl text-brand-dark text-sm focus:outline-none focus:border-brand-navy transition-all"
                      placeholder="emergency@domain.com (optional)"
                    />
                  </div>
                </div>

              </div>

              <div className="pt-6 border-t border-brand-navy/5 flex justify-between">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="flex items-center gap-1.5 px-6 py-3 border border-brand-navy/10 hover:border-brand-navy/20 text-brand-navy text-sm font-semibold rounded-xl transition-all"
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex items-center gap-1.5 px-8 py-3 bg-brand-red hover:bg-brand-crimson text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50"
                >
                  {formLoading ? 'Creating Account...' : 'Complete & Register'}
                </button>
              </div>
            </div>
          )}
        </form>

        <div className="text-center mt-6 text-xs text-brand-blue">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-brand-navy hover:underline transition-all">
            Sign In here
          </Link>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Mail, Lock, LogIn, ArrowLeft } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setFormLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.message || 'Invalid email or password.');
      }
    } catch (err) {
      setError('Failed to connect to the server.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-brand-light relative">
      {/* Decorative Gradients */}
      <div className="absolute top-10 right-10 w-72 h-72 bg-brand-red/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-brand-navy/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl shadow-lg border border-brand-navy/5 relative z-10">
        
        {/* Back Link */}
        <Link to="/" className="inline-flex items-center gap-1 text-xs text-brand-blue hover:text-brand-dark transition-all">
          <ArrowLeft size={12} /> Back to Home
        </Link>

        {/* Title */}
        <div className="text-center mt-2">
          <div className="mx-auto h-12 w-12 bg-brand-red/10 rounded-full flex items-center justify-center text-brand-red animate-pulse mb-4">
            <ShieldAlert size={28} />
          </div>
          <h2 className="text-3xl font-extrabold text-brand-dark">Welcome Back</h2>
          <p className="mt-2 text-sm text-brand-blue font-light">
            Sign in to check emergency states and pair Bluetooth hardware.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-brand-red/10 border-l-4 border-brand-red p-4 rounded text-sm text-brand-crimson">
            {error}
          </div>
        )}

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-brand-blue mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-brand-blue/50">
                  <Mail size={16} />
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-brand-light border border-brand-navy/10 rounded-xl text-brand-dark text-sm focus:outline-none focus:border-brand-navy transition-all"
                  placeholder="name@domain.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-brand-blue mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-brand-blue/50">
                  <Lock size={16} />
                </span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-brand-light border border-brand-navy/10 rounded-xl text-brand-dark text-sm focus:outline-none focus:border-brand-navy transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

          </div>

          <div>
            <button
              type="submit"
              disabled={formLoading}
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-brand-navy hover:bg-brand-dark focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-brand-navy/10"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <LogIn className="h-5 w-5 text-brand-blue group-hover:text-white transition-colors" aria-hidden="true" />
              </span>
              {formLoading ? 'Connecting...' : 'Sign In'}
            </button>
          </div>
        </form>

        <div className="text-center mt-6 text-xs text-brand-blue">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-brand-red hover:text-brand-crimson underline transition-all">
            Register your vehicle here
          </Link>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;

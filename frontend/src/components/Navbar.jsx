import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, User as UserIcon, LogOut, LayoutDashboard, History, Settings } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-brand-dark text-white sticky top-0 z-40 shadow-lg border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <div className="p-2 bg-brand-red rounded-lg animate-pulse-fast">
              <ShieldAlert size={22} className="text-white" />
            </div>
            <span className="font-extrabold text-lg sm:text-xl tracking-tight font-sans">
              SMART<span className="text-brand-red">CRASH</span>
            </span>
          </Link>

          {/* Links */}
          <div className="flex items-center gap-2 sm:gap-4">
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium hover:bg-brand-navy transition-all"
                >
                  <LayoutDashboard size={16} />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
                
                <Link 
                  to="/history" 
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium hover:bg-brand-navy transition-all"
                >
                  <History size={16} />
                  <span className="hidden sm:inline">History</span>
                </Link>

                {user.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-brand-accent bg-brand-navy hover:bg-brand-blue border border-brand-accent/20 transition-all"
                  >
                    <span>Admin Panel</span>
                  </Link>
                )}

                <Link 
                  to="/profile" 
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium hover:bg-brand-navy transition-all border border-white/10"
                >
                  <UserIcon size={16} className="text-brand-blue" />
                  <span className="hidden md:inline">{user.fullName.split(' ')[0]}</span>
                </Link>

                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-brand-red/10 text-brand-red hover:bg-brand-red hover:text-white transition-all ml-1"
                >
                  <LogOut size={16} />
                  <span className="hidden lg:inline">Logout</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link 
                  to="/login" 
                  className="px-4 py-2 text-sm font-medium hover:text-brand-red transition-all"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="px-4 py-2 text-sm font-medium bg-brand-red hover:bg-brand-crimson text-white rounded-lg transition-all shadow-md shadow-brand-red/20"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

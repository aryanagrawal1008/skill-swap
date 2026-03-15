import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const [darkMode] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  const [isOpen, setIsOpen] = useState(false);
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Determine if current page is home
  const isHome = location.pathname === '/';
  // Use lighter navbar for non-home pages
  const navBg = isHome
    ? (scrolled ? 'bg-brand-night/80 backdrop-blur-md shadow-md' : 'bg-transparent')
    : 'bg-white/90 shadow-card-lg border-b border-brand-pink/40';
  const navText = isHome ? 'text-white' : 'text-brand-plum';
  const navAccent = isHome ? 'hover:text-brand-pink' : 'hover:text-brand-orchid';
  const navLogo = isHome ? 'text-white' : 'text-brand-plum';

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${navBg} ${isOpen && isHome ? 'bg-brand-night/95 backdrop-blur-md' : ''} ${isOpen && !isHome ? 'bg-white' : ''}`} style={{backdropFilter: isHome && !isOpen ? undefined : 'blur(8px)'}}>
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-8 py-3">
        {/* Logo */}
        <div className="flex items-center">
          <span className={`text-2xl font-extrabold tracking-tight ${navLogo}`}>SkillSwap</span>
        </div>
        
        {/* Hamburger Menu Button (Mobile Only) */}
        <div className="md:hidden flex items-center">
          {isAuthenticated && (
            <Link to="/profile" className="mr-4">
              {user && user.profilePhoto ? (
                <img src={user.profilePhoto} alt="Profile" className="w-8 h-8 rounded-full object-cover border-2 border-brand-orchid shadow" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-brand-orchid flex items-center justify-center text-white font-bold text-sm">
                  {user && user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </Link>
          )}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`${navText} hover:${navAccent} focus:outline-none`}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex flex-1 justify-center">
          <div className={`flex space-x-10 text-lg font-medium ${navText}`}>
            <Link to="/" className={`${navAccent} transition-colors`}>Home</Link>
            <Link to="/browse" className={`${navAccent} transition-colors`}>Browse</Link>
            <Link to="/swaps" className={`${navAccent} transition-colors`}>My Swap Requests</Link>
          </div>
        </div>
        
        {/* Desktop Right: Login or Profile */}
        <div className="hidden md:flex items-center">
          {isAuthenticated ? (
            <Link to="/profile" className="ml-4">
              {user && user.profilePhoto ? (
                <img src={user.profilePhoto} alt="Profile" className="w-10 h-10 rounded-full object-cover border-2 border-brand-orchid shadow" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-brand-orchid flex items-center justify-center text-white font-bold text-xl">
                  {user && user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </Link>
          ) : (
            <Link to="/login" className={`ml-4 px-5 py-2 rounded-lg border font-semibold transition-colors ${isHome ? 'border-brand-orchid text-white hover:bg-brand-orchid hover:text-white' : 'border-brand-plum text-brand-plum hover:bg-brand-plum hover:text-white'}`}>Login</Link>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className={`md:hidden flex flex-col px-4 pt-2 pb-6 space-y-4 shadow-lg border-t ${isHome ? 'border-brand-plum/30 bg-brand-night/95' : 'border-brand-pink/20 bg-white'}`}>
          <Link to="/" className={`block text-lg font-medium ${navText} ${navAccent}`}>Home</Link>
          <Link to="/browse" className={`block text-lg font-medium ${navText} ${navAccent}`}>Browse</Link>
          <Link to="/swaps" className={`block text-lg font-medium ${navText} ${navAccent}`}>My Swap Requests</Link>
          
          {!isAuthenticated && (
            <div className="pt-2">
              <Link to="/login" className={`w-full block text-center px-5 py-2 rounded-lg border font-semibold transition-colors ${isHome ? 'border-brand-orchid text-white hover:bg-brand-orchid hover:text-white' : 'border-brand-plum text-brand-plum hover:bg-brand-plum hover:text-white'}`}>Login</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
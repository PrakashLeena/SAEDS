import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, User, Menu, X, Home, Library, Image, LogIn, Shield, Mail, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import img from '../assets/images/logo.png';

// Memoized nav link component
const NavLink = memo(({ link, isActive, onClick, isMobile = false }) => {
  const Icon = link.icon;
  const baseClass = `flex items-center space-x-${isMobile ? '2' : '1'} px-3 py-2 rounded-md font-medium transition-colors`;
  const sizeClass = isMobile ? 'text-base' : 'text-sm';
  const activeClass = isActive
    ? 'text-primary-600 bg-primary-50'
    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50';
  
  return (
    <Link
      to={link.path}
      onClick={onClick}
      className={`${baseClass} ${sizeClass} ${activeClass}`}
    >
      <Icon className={`h-${isMobile ? '5' : '4'} w-${isMobile ? '5' : '4'}`} />
      <span>{link.label}</span>
    </Link>
  );
});

NavLink.displayName = 'NavLink';

// Memoized admin link component
const AdminLink = memo(({ isActive, onClick, isMobile = false }) => {
  const baseClass = `flex items-center space-x-${isMobile ? '2' : '1'} px-3 py-2 rounded-md font-medium transition-colors`;
  const sizeClass = isMobile ? 'text-base' : 'text-sm';
  const activeClass = isActive
    ? 'text-purple-600 bg-purple-50'
    : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50';
  
  return (
    <Link
      to="/admin"
      onClick={onClick}
      className={`${baseClass} ${sizeClass} ${activeClass}`}
    >
      <Shield className={`h-${isMobile ? '5' : '4'} w-${isMobile ? '5' : '4'}`} />
      <span>{isMobile ? 'Admin Panel' : 'Admin'}</span>
    </Link>
  );
});

AdminLink.displayName = 'AdminLink';

// Memoized auth buttons component
const AuthButtons = memo(({ isMobile = false, onClick }) => {
  if (isMobile) {
    return (
      <>
        <Link
          to="/signin"
          onClick={onClick}
          className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
        >
          <LogIn className="h-5 w-5" />
          <span>Sign In</span>
        </Link>
        <Link
          to="/signup"
          onClick={onClick}
          className="flex items-center space-x-2 px-3 py-2 mx-3 rounded-md text-base font-medium text-white bg-primary-600 hover:bg-primary-700"
        >
          <User className="h-5 w-5" />
          <span>Sign Up</span>
        </Link>
      </>
    );
  }
  
  return (
    <div className="flex items-center space-x-2">
      <Link
        to="/signin"
        className="flex items-center space-x-1 px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
      >
        <LogIn className="h-4 w-4" />
        <span>Sign In</span>
      </Link>
      <Link
        to="/signup"
        className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
      >
        Sign Up
      </Link>
    </div>
  );
});

AuthButtons.displayName = 'AuthButtons';

const Navbar = memo(() => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(false);
  const location = useLocation();
  const { currentUser } = useAuth();

  // Memoize navigation links configuration
  const navLinks = useMemo(() => [
    { path: '/', label: 'Home', icon: Home },
    { path: '/members', label: 'Members', icon: Users },
    { path: '/activity', label: 'Activities', icon: Image },
    { path: '/gallery', label: 'Gallery', icon: Image },
    { path: '/browse', label: 'E-Library', icon: Library },
    { path: '/favorites', label: 'My Books', icon: Library },
    { path: '/contact', label: 'Contact', icon: Mail },
  ], []);

  // Memoized active path checker
  const isActive = useCallback((path) => location.pathname === path, [location.pathname]);

  // Memoized admin check status
  const isAdminPath = useMemo(() => 
    location.pathname.startsWith('/admin'),
    [location.pathname]
  );

  // Check admin status
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!currentUser) {
        setIsAdmin(false);
        return;
      }

      // Prevent duplicate checks
      if (isCheckingAdmin) return;
      
      setIsCheckingAdmin(true);
      try {
        const { data } = await userAPI.getByFirebaseUid(currentUser.uid);
        setIsAdmin(data?.role === 'admin');
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setIsCheckingAdmin(false);
      }
    };

    checkAdminStatus();
  }, [currentUser, isCheckingAdmin]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Handle menu toggle
  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  // Handle mobile menu close
  const handleMobileMenuClose = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  // Memoized user section for desktop
  const desktopUserSection = useMemo(() => {
    if (currentUser) {
      return (
        <>
          {isAdmin && <AdminLink isActive={isAdminPath} />}
          <Link
            to="/profile"
            className={`p-2 rounded-full transition-all hover:scale-110 ${
              isActive('/profile')
                ? 'text-primary-600 bg-primary-50'
                : 'text-gray-600 hover:text-primary-600 hover:bg-gray-100'
            }`}
          >
            <User className="h-5 w-5" />
          </Link>
        </>
      );
    }
    return <AuthButtons />;
  }, [currentUser, isAdmin, isAdminPath, isActive]);

  // Memoized user section for mobile
  const mobileUserSection = useMemo(() => {
    if (currentUser) {
      return (
        <>
          {isAdmin && (
            <AdminLink 
              isActive={isAdminPath} 
              onClick={handleMobileMenuClose}
              isMobile 
            />
          )}
          <Link
            to="/profile"
            onClick={handleMobileMenuClose}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
              isActive('/profile')
                ? 'text-primary-600 bg-primary-50'
                : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
            }`}
          >
            <User className="h-5 w-5" />
            <span>Profile</span>
          </Link>
        </>
      );
    }
    return <AuthButtons isMobile onClick={handleMobileMenuClose} />;
  }, [currentUser, isAdmin, isAdminPath, isActive, handleMobileMenuClose]);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 animate-fade-in-down">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 hover:scale-105 transition-transform"
            onClick={handleMobileMenuClose}
          >
            <img 
              src={img} 
              alt="SAEDS Logo" 
              className="h-10 w-10 object-contain"
              loading="eager"
            />
            <span className="text-2xl font-bold text-gray-900">Community Hub</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                link={link}
                isActive={isActive(link.path)}
              />
            ))}
          </div>

          {/* Right side icons */}
          <div className="hidden md:flex items-center space-x-4">
            <button 
              className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-full transition-all hover:scale-110 hover:rotate-12"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
            {desktopUserSection}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-primary-600 hover:bg-gray-100"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 animate-fade-in-down">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                link={link}
                isActive={isActive(link.path)}
                onClick={handleMobileMenuClose}
                isMobile
              />
            ))}
            {mobileUserSection}
          </div>
        </div>
      )}
    </nav>
  );
});

Navbar.displayName = 'Navbar';

export default Navbar;
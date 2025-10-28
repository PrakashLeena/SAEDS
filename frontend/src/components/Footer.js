import React from 'react';
import { Users, Mail, Phone, MapPin, Facebook } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <Users className="h-8 w-8 text-primary-500" />
              <span className="text-2xl font-bold text-white">Community Hub</span>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Building connections, sharing knowledge, and growing together as a vibrant community.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/share/19wmzf2Byh/" className="text-gray-400 hover:text-primary-500 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm hover:text-primary-500 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/browse" className="text-sm hover:text-primary-500 transition-colors">
                  E-Library
                </Link>
              </li>
              <li>
                <Link to="/favorites" className="text-sm hover:text-primary-500 transition-colors">
                  My Books
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-sm hover:text-primary-500 transition-colors">
                  My Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/browse" className="text-sm hover:text-primary-500 transition-colors">
                  E-Library
                </Link>
              </li>
              <li>
                <a href="#services" className="text-sm hover:text-primary-500 transition-colors">
                  Events & Workshops
                </a>
              </li>
              <li>
                <a href="#services" className="text-sm hover:text-primary-500 transition-colors">
                  Discussion Forum
                </a>
              </li>
             
              <li>
                <a href="#services" className="text-sm hover:text-primary-500 transition-colors">
                  Learning Resources
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2">
                <MapPin className="h-5 w-5 text-primary-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm">Ward No.01 ,Vankalai ,Mannar ,SriLanka</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-primary-500 flex-shrink-0" />
                <span className="text-sm">+94756175604</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-primary-500 flex-shrink-0" />
                <span className="text-sm">saedsmail2025@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Community Hub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

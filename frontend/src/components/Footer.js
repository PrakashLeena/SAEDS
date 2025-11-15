import React, { memo, useMemo } from 'react';
import { Users, Mail, Phone, MapPin, Facebook } from 'lucide-react';
import { Link } from 'react-router-dom';

// Memoized link component to prevent re-renders
const FooterLink = memo(({ to, href, children, external = false }) => {
  const linkClass = "text-sm hover:text-primary-500 transition-colors";
  
  if (external || href) {
    return (
      <a 
        href={href} 
        className={linkClass}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
      >
        {children}
      </a>
    );
  }
  
  return (
    <Link to={to} className={linkClass}>
      {children}
    </Link>
  );
});

FooterLink.displayName = 'FooterLink';

// Memoized contact item component
const ContactItem = memo(({ icon: Icon, children }) => (
  <li className="flex items-start space-x-2">
    <Icon className="h-5 w-5 text-primary-500 flex-shrink-0 mt-0.5" />
    <span className="text-sm">{children}</span>
  </li>
));

ContactItem.displayName = 'ContactItem';

const Footer = memo(() => {
  // Memoize current year to prevent recalculation
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  
  // Memoize navigation sections
  const quickLinks = useMemo(() => [
    { to: '/', label: 'Home' },
    { to: '/browse', label: 'E-Library' },
    { to: '/favorites', label: 'My Books' },
    { to: '/profile', label: 'My Profile' }
  ], []);

  const services = useMemo(() => [
    { to: '/browse', label: 'E-Library' },
    { href: '#services', label: 'Events & Workshops' },
    { href: '#services', label: 'Discussion Forum' },
    { href: '#services', label: 'Learning Resources' }
  ], []);

  // Memoize contact information
  const contactInfo = useMemo(() => [
    { icon: MapPin, text: 'Ward No.01 ,Vankalai ,Mannar ,SriLanka' },
    { icon: Phone, text: '+94756175604' },
    { icon: Mail, text: 'saedsmail2025@gmail.com' }
  ], []);

  // Memoize brand section
  const brandSection = useMemo(() => (
    <div className="col-span-1">
      <div className="flex items-center space-x-2 mb-4">
        <Users className="h-8 w-8 text-primary-500" />
        <span className="text-2xl font-bold text-white">Community Hub</span>
      </div>
      <p className="text-sm text-gray-400 mb-4">
        Building connections, sharing knowledge, and growing together as a vibrant community.
      </p>
      <div className="flex space-x-4">
        <a 
          href="https://www.facebook.com/share/19wmzf2Byh/" 
          className="text-gray-400 hover:text-primary-500 transition-colors"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visit our Facebook page"
        >
          <Facebook className="h-5 w-5" />
        </a>
      </div>
    </div>
  ), []);

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          {brandSection}

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <FooterLink to={link.to}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              {services.map((service, index) => (
                <li key={service.to || service.href || index}>
                  <FooterLink 
                    to={service.to} 
                    href={service.href}
                  >
                    {service.label}
                  </FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              {contactInfo.map((contact, index) => (
                <ContactItem key={index} icon={contact.icon}>
                  {contact.text}
                </ContactItem>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-400">
            © {currentYear} Community Hub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';

export default Footer;
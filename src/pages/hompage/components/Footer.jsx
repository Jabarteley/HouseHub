import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const Footer = () => {
  const currentYear = new Date()?.getFullYear();

  const footerSections = [
    {
      title: "For Buyers",
      links: [
        { label: "Search Properties", path: "/property-listings" },
        { label: "Mortgage Calculator", path: "/coming-soon" },
        { label: "Buyer's Guide", path: "/coming-soon" },
        { label: "Neighborhood Info", path: "/coming-soon" }
      ]
    },
    {
      title: "For Sellers",
      links: [
        { label: "List Your Property", path: "/coming-soon" },
        { label: "Home Valuation", path: "/coming-soon" },
        { label: "Seller's Guide", path: "/coming-soon" },
        { label: "Market Reports", path: "/coming-soon" }
      ]
    },
    {
      title: "For Agents",
      links: [
        { label: "Agent Dashboard", path: "/dashboard" },
        { label: "Join Our Team", path: "/coming-soon" },
        { label: "Agent Resources", path: "/coming-soon" },
        { label: "Training Center", path: "/coming-soon" }
      ]
    },
    {
      title: "Company",
      links: [
        { label: "About Us", path: "/about" },
        { label: "Contact", path: "/contact" },
        { label: "Careers", path: "/careers" },
        { label: "Press", path: "/press" }
      ]
    }
  ];

  const socialLinks = [
    { name: "Facebook", icon: "Facebook", url: "https://facebook.com" },
    { name: "Twitter", icon: "Twitter", url: "https://twitter.com" },
    { name: "Instagram", icon: "Instagram", url: "https://instagram.com" },
    { name: "LinkedIn", icon: "Linkedin", url: "https://linkedin.com" }
  ];

  return (
    <footer className="bg-secondary-700 text-text-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                  <Icon name="Home" size={20} color="white" />
                </div>
                <span className="text-xl font-semibold font-heading">HouseHub</span>
              </div>
              <p className="text-text-secondary mb-6 leading-relaxed">
                Your trusted partner in real estate. We connect buyers, sellers, and agents 
                to create successful property transactions across the country.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center space-x-2 text-text-secondary">
                  <Icon name="Phone" size={16} />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-2 text-text-secondary">
                  <Icon name="Mail" size={16} />
                  <span>info@estatehub.com</span>
                </div>
                <div className="flex items-center space-x-2 text-text-secondary">
                  <Icon name="MapPin" size={16} />
                  <span>123 Real Estate Ave, City, State 12345</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex space-x-4">
                {socialLinks?.map((social) => (
                  <a
                    key={social?.name}
                    href={social?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-secondary-600 rounded-full flex items-center justify-center
                             hover:bg-primary transition-all duration-200 ease-out micro-interaction"
                    aria-label={`Follow us on ${social?.name}`}
                  >
                    <Icon name={social?.icon} size={18} />
                  </a>
                ))}
              </div>
            </div>

            {/* Footer Links */}
            {footerSections?.map((section) => (
              <div key={section?.title}>
                <h3 className="text-lg font-semibold mb-4 text-text-primary">
                  {section?.title}
                </h3>
                <ul className="space-y-2">
                  {section?.links?.map((link) => (
                    <li key={link?.label}>
                      <Link
                        to={link?.path}
                        className="text-text-secondary hover:text-text-primary transition-colors duration-200"
                      >
                        {link?.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="py-8 border-t border-secondary-600">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="mb-4 lg:mb-0">
              <h3 className="text-lg font-semibold mb-2 text-text-primary">Stay Updated</h3>
              <p className="text-text-secondary">
                Get the latest property listings and market insights delivered to your inbox.
              </p>
            </div>
            <div className="flex w-full lg:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 lg:w-64 px-4 py-2 bg-secondary-600 border border-secondary-500 
                         rounded-l-md text-text-primary placeholder-text-secondary
                         focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
              />
              <button
                className="px-6 py-2 bg-primary text-white rounded-r-md font-medium hover:bg-primary-700 transition-all duration-200 ease-out micro-interaction"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="py-6 border-t border-secondary-600">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-text-secondary text-sm mb-4 md:mb-0">
              © {currentYear} EstateHub. All rights reserved.
            </div>
            <div className="flex flex-wrap items-center space-x-6 text-sm">
              <Link 
                to="/privacy" 
                className="text-text-secondary hover:text-text-primary transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <Link 
                to="/terms" 
                className="text-text-secondary hover:text-text-primary transition-colors duration-200"
              >
                Terms of Service
              </Link>
              <Link 
                to="/cookies" 
                className="text-text-secondary hover:text-text-primary transition-colors duration-200"
              >
                Cookie Policy
              </Link>
              <Link 
                to="/accessibility" 
                className="text-text-secondary hover:text-text-primary transition-colors duration-200"
              >
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
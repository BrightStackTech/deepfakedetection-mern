import React from "react";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 py-4 mt-10 border-t border-gray-200 dark:border-gray-700 w-full px-4">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        {/* Left: Contact Us */}
        <div className="text-sm text-gray-600 dark:text-gray-300">
          Contact us on{" "}
          <a href={`mailto:${import.meta.env.VITE_CONTACT_EMAIL}`} className="underline">
            {import.meta.env.VITE_CONTACT_EMAIL}
          </a>
        </div>
        {/* Center: Rights Reserved */}
        <div className="text-sm text-gray-600 dark:text-gray-300 text-center mt-2 md:mt-0">
          Rights reserved by DeepTrace.org @2024-25
        </div>
        {/* Right: Social Media Icons */}
        <div className="flex space-x-4 mt-2 md:mt-0">
          <a 
            href="https://facebook.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="text-gray-600 dark:text-gray-300"
          >
            <FaFacebook size={24} />
          </a>
          <a 
            href="https://twitter.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="Twitter"
            className="text-gray-600 dark:text-gray-300"
          >
            <FaTwitter size={24} />
          </a>
          <a 
            href="https://instagram.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="text-gray-600 dark:text-gray-300"
          >
            <FaInstagram size={24} />
          </a>
          <a 
            href="https://linkedin.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="text-gray-600 dark:text-gray-300"
          >
            <FaLinkedin size={24} />
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
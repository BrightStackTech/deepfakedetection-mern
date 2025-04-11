import React, { useState, useEffect } from "react";
import { FaMoon, FaSun } from "react-icons/fa";
import { createPortal } from "react-dom";

const Navbar = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  // On mount, read dark mode preference
  useEffect(() => {
    const storedDarkMode = localStorage.getItem("darkMode");
    if (storedDarkMode === "true") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Automatically close mobile menu when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenu(false);
      }
    };
    window.addEventListener("resize", handleResize);
    // Call once on mount
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleToggleTheme = () => {
    setDarkMode((prev) => {
      const newMode = !prev;
      if (newMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      localStorage.setItem("darkMode", newMode);
      return newMode;
    });
  };

  // Mobile dropdown rendered via portal
  const mobileDropdown = (
    <div className="fixed top-[80px] right-2 w-[85%] bg-white dark:bg-gray-800 shadow-lg p-4 flex flex-col space-y-2 rounded-2xl py-8 z-[9999]">
      <a
        href="/login"
        className="block text-center py-2 px-4 bg-[#f1f3f5] hover:bg-[#ddd] text-gray-900 font-bold rounded-full transition duration-200 dark:bg-gray-700 dark:text-white"
        onClick={() => setMobileMenu(false)}
      >
        Log In
      </a>
      <a
        href="/signup"
        className="block text-center py-2 px-4 border border-[#787878] bg-[#252525] hover:bg-[#ddd] text-[#f1f3f5] font-bold rounded-full transition duration-200 dark:border-white dark:bg-white dark:text-black"
        onClick={() => setMobileMenu(false)}
      >
        Sign Up
      </a>
      <button
        onClick={() => {
          handleToggleTheme();
          setMobileMenu(false);
        }}
        className="block text-center py-2 px-4 bg-[#f1f3f5] hover:bg-[#ddd] text-gray-900 font-bold rounded-full transition duration-200 dark:bg-gray-700 dark:text-white"
      >
        {darkMode ? (
          <div className="flex items-center justify-center gap-4">
            <FaMoon size={20} className="text-gray-800 dark:text-gray-100" /> Dark Mode
          </div>
        ) : (
          <div className="flex items-center justify-center gap-4">
            <FaSun size={20} className="text-gray-800 dark:text-gray-100" /> Light Mode
          </div>
        )}
      </button>
    </div>
  );

  return (
    <nav style={{ zIndex: 10000 }} className="z-100 fixed top-0 px-4 py-4 flex justify-between items-center w-[85%] bg-transparent">
      <a className="text-3xl font-bold leading-none" href="/">
        <p className="text-3xl font-semibold text-black dark:text-white">DeepTrace</p>
      </a>
      {/* Desktop Navigation */}
      <div className="hidden lg:flex items-center">
        <a
          className="ml-auto mr-3 py-2.5 px-5 bg-[#f1f3f5] hover:bg-[#ddd] text-4 text-gray-900 font-bold rounded-full transition duration-200 dark:bg-gray-800 dark:text-white"
          href="/login"
        >
          Log In
        </a>
        <a
          className="mr-3 py-2.5 px-5 border border-[#787878] bg-[#252525] text-4 text-[#f1f3f5] font-bold rounded-full transition duration-200 dark:border-white dark:bg-white dark:text-black"
          href="/signup"
        >
          Sign Up
        </a>
        <button
          onClick={handleToggleTheme}
          className="p-3 rounded-xl bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-200 border border-gray-500"
        >
          {darkMode ? (
            <FaMoon size={20} className="text-gray-800 dark:text-gray-100" />
          ) : (
            <FaSun size={20} className="text-yellow-500" />
          )}
        </button>
      </div>
      {/* Mobile Hamburger Icon */}
      <div className="lg:hidden">
        <button
          onClick={() => setMobileMenu(!mobileMenu)}
          className="p-3 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-200"
        >
          <svg className="w-6 h-6 fill-current text-gray-800 dark:text-gray-100" viewBox="0 0 20 20">
            <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
          </svg>
        </button>
      </div>
      {/* Render Mobile Dropdown Using a Portal */}
      {mobileMenu && createPortal(mobileDropdown, document.body)}
    </nav>
  );
};

export default Navbar;
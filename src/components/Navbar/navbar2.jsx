import React, { useEffect, useRef, useState } from "react";
import { FaMoon, FaSun } from "react-icons/fa";

const Navbar = ({ active, user }) => {
  const [hamburger, setHamburger] = useState(false);
  const timerRef = useRef(null);
  const [darkMode, setDarkMode] = useState(false);

  // On mount, read the dark mode preference from localStorage
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

  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setHamburger(true);
  };

  const handleMouseLeave = () => {
    // For desktop, hide dropdown after a short delay
    if (window.innerWidth >= 1024) {
      timerRef.current = setTimeout(() => {
        setHamburger(false);
      }, 300);
    }
  };

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

  useEffect(() => {
    if (user) {
      console.log("User:", user);
      if (user.profilePicture) {
        console.log("User profile picture:", user.profilePicture);
      } else {
        console.log("No profilePicture found on user");
      }
    } else {
      console.log("User prop is null or undefined");
    }
  }, [user]);

  return (
    <nav className="z-100 fixed top-0 px-2 md:px-12 py-4 flex justify-between items-center w-full h-[130px] bg-white dark:bg-gray-900 z-10">
      <div className="px-12 py-4 flex justify-between items-center bg-gray-100 dark:bg-gray-800 rounded-full w-full">
        {/* Main Logo */}
        <a className="text-3xl font-bold leading-none" href="/home">
          <p className="text-3xl font-semibold text-black dark:text-white">
            DeepTrace
          </p>
        </a>
        {/* Desktop Navigation */}
        <ul className="hidden lg:flex lg:mx-auto lg:items-center lg:w-auto lg:space-x-6">
          <li>
            <a
              className={
                active === 0
                  ? "text-sm text-white hover:font-bold bg-black py-2 px-4 border border-black rounded-xl dark:text-black dark:bg-white"
                  : "text-sm text-gray-400 hover:text-gray-500 hover:font-bold dark:hover:text-white"
              }
              href="/home"
            >
              Dashboard
            </a>
          </li>
          <li>
            <a
              className={
                active === 1
                  ? "text-sm text-white hover:font-bold bg-black py-2 px-4 border border-black rounded-xl dark:text-black dark:bg-white"
                  : "text-sm text-gray-400 hover:text-gray-500 hover:font-bold dark:hover:text-white"
              }
              href="/upload-video"
            >
              Upload Video
            </a>
          </li>
          <li>
            <a
              className={
                active === 2
                  ? "text-sm text-white hover:font-bold bg-black py-2 px-4 border border-black rounded-xl dark:text-black dark:bg-white"
                  : "text-sm text-gray-400 hover:text-gray-500 hover:font-bold dark:hover:text-white"
              }
              href="/upload-image"
            >
              Upload Image
            </a>
          </li>
          <li>
            <a
              className={
                active === 3
                  ? "text-sm text-white hover:font-bold bg-black py-2 px-4 border border-black rounded-xl dark:text-black dark:bg-white"
                  : "text-sm text-gray-400 hover:text-gray-500 hover:font-bold dark:hover:text-white"
              }
              href="/about-us"
            >
              About Us
            </a>
          </li>
        </ul>
        <div className="flex items-center gap-4">
          {/* Desktop Dark/Light Toggle: only show on lg and up */}
          <button
            onClick={handleToggleTheme}
            className="hidden lg:inline-block p-3 rounded-xl bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-200 border-[2px] border-gray-500 dark:border-gray-500 hover:border-gray-400 hover:text-black text-gray-600 dark:text-white"
          >
            {darkMode ? <FaMoon size={20} /> : <FaSun size={20} />}
          </button>
          {/* Desktop Profile Picture Dropdown */}
          <div
            className="relative hidden lg:block"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="flex gap-2">
              <div className="h-12 w-12 rounded-full bg-[#ffffff30] flex items-center justify-center hover:scale-105 transition cursor-pointer">
                {user && user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="h-[45px] w-[45px] bg-black dark:bg-white rounded-full flex items-center justify-center">
                    <svg
                      className="w-1/2 h-1/2 fill-current dark:fill-black text-secondary-400 dark:text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      <path d="M7.5 6.5C7.5 8.981 9.519 11 12 11s4.5-2.019 4.5-4.5S14.481 2 12 2 7.5 4.019 7.5 6.5zM20 21h1v-1c0-3.859-3.141-7-7-7h-4c-3.86 0-7 3.141-7 7v1h1 1 14H20z"></path>
                    </svg>
                  </div>
                )}
              </div>
            </div>
            {/* Desktop Profile Dropdown (on hover) */}
            {hamburger && (
              <div className="absolute top-full right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex flex-col gap-2 z-30">
                <a
                  href="/home"
                  className="block text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded px-2 py-1"
                >
                  Home
                </a>
                <a
                  href="/settings"
                  className="block text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded px-2 py-1"
                >
                  Settings
                </a>
                <a
                  href="/login"
                  className="block text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded px-2 py-1"
                >
                  Logout
                </a>
              </div>
            )}
          </div>
          {/* Mobile Profile: show only on mobile (below lg) */}
          <div className="lg:hidden">
            <button
              onClick={() => setHamburger(!hamburger)}
              className="h-12 w-12 rounded-full bg-[#ffffff30] flex items-center justify-center hover:scale-105 transition cursor-pointer"
            >
              {user && user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="h-[45px] w-[45px] bg-black dark:bg-white rounded-full flex items-center justify-center">
                  <svg
                    className="w-1/2 h-1/2 fill-current dark:fill-black text-secondary-400 dark:text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    <path d="M7.5 6.5C7.5 8.981 9.519 11 12 11s4.5-2.019 4.5-4.5S14.481 2 12 2 7.5 4.019 7.5 6.5zM20 21h1v-1c0-3.859-3.141-7-7-7h-4c-3.86 0-7 3.141-7 7v1h1 1 14H20z"></path>
                  </svg>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Menu: rendered when hamburger state is true on mobile */}
      {hamburger && (
        <div className="lg:hidden absolute top-[130px] right-2 bg-white dark:bg-gray-800 shadow-lg z-20 rounded-2xl w-[80%]">
          <div className="flex flex-col p-4 space-y-2">
            <a
              href="/home"
              className="block text-center py-2 px-4 border border-[#787878] bg-[#252525] hover:bg-[#ddd] text-[#f1f3f5] font-bold rounded-full transition duration-200 dark:border-white dark:bg-white dark:text-black "
            >
              Home
            </a>
            <a
              href="/upload-video"
              className="block text-center py-2 px-4 border border-[#787878] bg-[#252525] hover:bg-[#ddd] text-[#f1f3f5] font-bold rounded-full transition duration-200 dark:border-white dark:bg-white dark:text-black"
            >
              Upload Video
            </a>
            <a
              href="/upload-image"
              className="block text-center py-2 px-4 border border-[#787878] bg-[#252525] hover:bg-[#ddd] text-[#f1f3f5] font-bold rounded-full transition duration-200 dark:border-white dark:bg-white dark:text-black"
            >
              Upload Image
            </a>
            <a
              href="/settings"
              className="block text-center py-2 px-4 border border-[#787878] bg-[#252525] hover:bg-[#ddd] text-[#f1f3f5] font-bold rounded-full transition duration-200 dark:border-white dark:bg-white dark:text-black"
            >
              Settings
            </a>
            <a
              href="/about-us"
              className="block text-center py-2 px-4 border border-[#787878] bg-[#252525] hover:bg-[#ddd] text-[#f1f3f5] font-bold rounded-full transition duration-200 dark:border-white dark:bg-white dark:text-black"
            >
              About Us
            </a>
            <a
              href="/login"
              className="block text-center py-2 px-4 border border-[#787878] bg-[#252525] hover:bg-[#ddd] text-[#f1f3f5] font-bold rounded-full transition duration-200 dark:border-white dark:bg-white dark:text-black"
            >
              Logout
            </a>
            {/* Mobile Dark/Light Toggle inside hamburger menu */}
          <button
            onClick={() => {
              handleToggleTheme();
            }}
            className="block text-center py-2 px-4 bg-[#f1f3f5] hover:bg-[#ddd] text-gray-900 font-bold rounded-full transition duration-200 dark:bg-gray-800 dark:text-white"
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
        </div>
      )}
    </nav>
  );
};

export default Navbar;
import React, { useState, useEffect } from "react";
import axios from "axios";
import logo from "/src/assets/deeptrace_logo_transparent.png";
import { FcGoogle } from "react-icons/fc";
import { FaMoon, FaSun, FaEye, FaEyeSlash } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // On mount, set dark mode from localStorage if available
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

  // Check for error message coming from Google callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    if (error) {
      toast.error(error);
    }
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

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  // Only allow login if email and password fields are not empty and email is valid.
  const isSubmitDisabled =
    !email ||
    !password ||
    !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/login`,
        { email, password },
        { withCredentials: true }
      );
      toast.success(response.data.message, { position: "top-right" });
      setTimeout(() => {
        window.location.href = "/home";
      }, 3000);
    } catch (error) {
      console.error(error);
      toast.error("Invalid email or password. Please try again.");
    }
  };

  return (
    <div className="h-screen flex flex-col md:flex-row justify-center items-center gap-8 md:gap-36 bg-white dark:bg-gray-900">
      <ToastContainer />
      <div
        className="flex gap-[30px] cursor-pointer"
        onClick={() => (window.location.href = "/")}
      >
        <img src={logo} className="h-16" alt="DeepTrace Logo" />
        <div className="text-5xl font-bold text-black dark:text-white">
          DeepTrace
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 px-10 py-8 rounded-[20px] border border-2 w-full max-w-[360px]">
        <div>
          <div className="text-sm font-semibold text-[#787878]">Log In</div>
          <div className="text-3xl font-semibold text-black dark:text-white">
            Welcome Back!
          </div>
        </div>
        <div className="mt-4">
          <div className="text-md text-black dark:text-white">
            New User? <a href="/signup" className="text-[#1473E6]">Sign Up</a>
          </div>
        </div>
        <div className="mt-8">
          <button
            onClick={() => {
              window.location.href = `${import.meta.env.VITE_SERVER_URL}/auth/google`;
            }}
            className="w-full flex gap-4 justify-center items-center px-4 py-2.5 rounded-full border border-black dark:border-white text-smd text-black dark:text-white hover:bg-[#f1f3f505]"
          >
            <FcGoogle className="scale-[1.5]" /> Log In with Google
          </button>
        </div>
        <div className="mt-1">
          <div className="inline-flex items-center justify-center w-full">
            <hr className="w-full h-px my-8 bg-[#f1f3f515] border-0" />
            <span className="absolute px-3 font-medium text-black dark:text-white bg-white dark:bg-gray-800">
              Or
            </span>
          </div>
        </div>
        <div className="mt-1">
          <form onSubmit={handleSubmit} className="flex flex-col gap-1.5">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 rounded-full border border-gray-400 hover:border-gray-900 text-black dark:text-white"
            />
            <div className="mt-1 flex justify-end">
              <a
                href="/change-password"
                className="text-red-500 underline cursor-pointer text-sm"
              >
                Forgot Password?
              </a>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 rounded-full border border-gray-400 hover:border-gray-900 text-black dark:text-white"
              />
              <button
                type="button"
                onClick={toggleShowPassword}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
              >
                {showPassword ? (
                  <FaEyeSlash size={18} className="text-gray-600 dark:text-white" />
                ) : (
                  <FaEye size={18} className="text-gray-600 dark:text-white" />
                )}
              </button>
            </div>
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className={`w-full px-4 py-2.5 rounded-full bg-[#f1f3f5] hover:bg-black text-md text-gray-900 hover:text-white font-semibold ${
                isSubmitDisabled ? "opacity-50 cursor-not-allowed" : ""
              } transition`}
            >
              Log In
            </button>
          </form>
        </div>
      </div>
      {/* Dark/Light Toggle Button at Bottom Right */}
      <button
        onClick={handleToggleTheme}
        className="fixed bottom-4 right-4 flex items-center justify-center p-3 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
      >
        {darkMode ? (
          <FaMoon size={20} className="text-gray-800 dark:text-gray-100" />
        ) : (
          <FaSun size={20} className="text-yellow-500" />
        )}
      </button>
    </div>
  );
}

export default Login;
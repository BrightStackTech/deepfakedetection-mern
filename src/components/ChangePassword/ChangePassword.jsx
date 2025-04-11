import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { FaMoon, FaSun } from "react-icons/fa";
import { toast } from "react-toastify";

const ChangePassword = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailValid, setEmailValid] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  // Initialize theme
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

  // Email validation and checking (debounced)
  useEffect(() => {
    if (!email.trim()) {
      setEmailError("Email is required");
      setEmailValid(false);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Invalid email format");
      setEmailValid(false);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/checkEmail?email=${encodeURIComponent(email)}`);
        if (response.data.exists) {
          setEmailError("");
          setEmailValid(true);
        } else {
          setEmailError("This email is not registered. Try another email or check if you've entered the correct mail id");
          setEmailValid(false);
        }
      } catch (error) {
        console.error("Error checking email:", error);
        setEmailError("Error verifying email");
        setEmailValid(false);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [email]);

  const handleCaptchaChange = (value) => {
    setCaptchaVerified(!!value);
  };

  const handleResetPassword = async () => {
    if (emailValid && captchaVerified) {
      try {
        // Call backend to request a password reset; this sends the reset email.
        await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/requestPasswordReset`, { email });
        toast.success("An email has been sent to this mail id to reset the password. Please check inbox (spam folder included)");
        // Optionally navigate after a delay or let the user read the message.
        navigate("/login");
      } catch (error) {
        console.error("Error requesting password reset:", error);
        toast.error("Error sending reset email");
      }
    }
  };

  const handleToggleTheme = () => {
    setDarkMode((prevMode) => {
      const newMode = !prevMode;
      if (newMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      localStorage.setItem("darkMode", newMode);
      return newMode;
    });
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-white dark:bg-gray-900 text-black dark:text-white relative">
      {/* Back Button */}
      <button
        onClick={handleGoBack}
        className="absolute top-4 left-4 p-3 bg-gray-200 dark:bg-gray-700 rounded-xl font-bold text-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
      >
        Back
      </button>
      <div className="max-w-md w-full p-6 bg-gray-100 dark:bg-gray-800 rounded shadow">
        <h1 className="text-3xl font-bold mb-4">Change Password</h1>
        <label htmlFor="email" className="block text-lg font-semibold mb-2">
          Enter the email whose password you desire to change
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded bg-transparent mb-2"
        />
        {emailError && <small className="text-red-500">{emailError}</small>}
        {emailValid && (
          <div className="mt-4">
            <ReCAPTCHA
              sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
              onChange={handleCaptchaChange}
            />
          </div>
        )}
        <button
          onClick={handleResetPassword}
          disabled={!(emailValid && captchaVerified)}
          className={`mt-4 w-full p-3 rounded ${
            emailValid && captchaVerified
              ? "bg-green-500 hover:bg-green-600 text-white"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Reset Password
        </button>
      </div>
      {/* Dark/Light toggle */}
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
};

export default ChangePassword;
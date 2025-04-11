import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaMoon, FaSun, FaEye, FaEyeSlash } from "react-icons/fa";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  // Same regex as in Signup (8+ chars, 1 uppercase, 1 number, 1 special char)
  const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;

  // Set up dark mode from localStorage
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

  // Validate new password in real-time
  useEffect(() => {
    if (newPassword && !passwordRegex.test(newPassword)) {
      setPasswordError(
        "Password must contain at least 8 characters, 1 uppercase letter, 1 number, and 1 special character."
      );
    } else {
      setPasswordError("");
    }
  }, [newPassword]);

  // Validate password confirmation in real time
  useEffect(() => {
    if (confirmPassword && newPassword !== confirmPassword) {
      setConfirmError("Passwords do not match.");
    } else {
      setConfirmError("");
    }
  }, [confirmPassword, newPassword]);

  const isFormValid = () => {
    return (
      newPassword &&
      confirmPassword &&
      passwordRegex.test(newPassword) &&
      newPassword === confirmPassword
    );
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/resetPassword`, {
        token,
        newPassword,
      });
      toast.success(response.data.message);
      navigate("/login");
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error("Error resetting password");
    }
  };

  const onFormSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      toast.error("Please check your entries.");
      return;
    }
    setShowConfirmDialog(true);
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

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-white dark:bg-gray-900 text-black dark:text-white relative">
      <h1 className="text-3xl font-bold mb-4">Reset Password</h1>
      <form onSubmit={onFormSubmit} className="max-w-md w-full p-6 bg-gray-100 dark:bg-gray-800 rounded shadow flex flex-col gap-4">
        {/* New Password Field */}
        <div className="relative">
          <label className="block text-lg font-semibold mb-1">New Password</label>
          <input
            type={showNewPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-3 pr-10 border border-gray-300 rounded bg-transparent"
            required
          />
          <button
            type="button"
            onClick={() => setShowNewPassword((prev) => !prev)}
            className="absolute inset-y-0 right-0 flex items-center pr-3"
          >
            {showNewPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
          {passwordError && <small className="text-red-500">{passwordError}</small>}
        </div>

        {/* Confirm Password Field */}
        <div className="relative">
          <label className="block text-lg font-semibold mb-1">Confirm Password</label>
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-3 pr-10 border border-gray-300 rounded bg-transparent"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute inset-y-0 right-0 flex items-center pr-3"
          >
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
          {confirmError && <small className="text-red-500">{confirmError}</small>}
        </div>

        <button
          type="submit"
          disabled={!isFormValid()}
          className={`w-full p-3 rounded transition ${
            isFormValid() ? "bg-green-500 hover:bg-green-600 text-white" : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Reset Password
        </button>
      </form>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg">
            <p className="mb-4 text-lg">Are you sure you want to reset your password?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 rounded bg-gray-400 hover:bg-gray-500 text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowConfirmDialog(false);
                  handleSubmit();
                }}
                className="px-4 py-2 rounded bg-green-500 hover:bg-green-600 text-white transition"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

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

export default ResetPassword;
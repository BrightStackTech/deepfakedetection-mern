import React, { useState, useEffect } from "react";
import axios from "axios";
import logo from "/src/assets/deeptrace_logo_transparent.png";
import { FcGoogle } from "react-icons/fc";
import { FaMoon, FaSun, FaEye, FaEyeSlash } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Signup() {
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validEmail, setValidEmail] = useState(false);
  const [validPassword, setValidPassword] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;

  // Real-time validation for username (spaces and duplicate check)
  useEffect(() => {
    // Check for spaces
    if (username.includes(" ")) {
      setUsernameError("Username must not contain any spaces");
      return;
    } else {
      setUsernameError("");
    }

    // If username is empty, do nothing.
    if (!username) return;

    if (username.length < 3) {
      setUsernameError("Username cannot be this short");
      return;
    } else {
      setUsernameError("");
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/api/checkUsername?username=${username}`
        );
        if (!response.data.available) {
          setUsernameError("Username already taken, try with a different username");
        } else {
          setUsernameError("");
        }
      } catch (error) {
        console.error("Error checking username availability:", error);
      }
    }, 500); // delay of 500ms

    return () => clearTimeout(delayDebounceFn);
  }, [username]);

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setValidEmail(emailRegex.test(value));
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setValidPassword(passwordRegex.test(value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validEmail || !validPassword || password !== confirmPassword) {
      toast.error("Please make sure all fields are correctly filled out.");
      return;
    }
    if (usernameError) {
      return;
    }
    try {
      const response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/register`, {
        username,
        email,
        password,
      });
      toast.success(response.data.message);
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 400) {
        toast.error("Account on this email already exists, please try with a different email");
      } else {
        toast.error("An error occurred during registration. Please try again.");
      }
    }
  };

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

  // Disable submit button if there are errors or if required fields are empty
  const isSubmitDisabled =
    !username ||
    !email ||
    !password ||
    !confirmPassword ||
    !!usernameError ||
    !validEmail ||
    !validPassword ||
    password !== confirmPassword;

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
          <div className="text-sm font-semibold text-[#787878]">Sign Up</div>
          <div className="text-3xl font-semibold text-black dark:text-white">Create an account</div>
        </div>
        <div className="mt-4">
          <div className="text-md text-black dark:text-white">
            Already have an account? <a href="/login" className="text-[#1473E6]">Log In</a>
          </div>
        </div>
        <div className="mt-8">
          <button
            onClick={() => {
              window.location.href = `${import.meta.env.VITE_SERVER_URL}/auth/google`;
            }}
            className="w-full flex gap-4 justify-center items-center px-4 py-2.5 rounded-full border border-black dark:border-white text-smd text-black dark:text-white hover:bg-[#f1f3f505]"
          >
            <FcGoogle className="scale-[1.5]" /> Sign Up with Google
          </button>
        </div>
        <div className="mt-1">
          <div className="inline-flex items-center justify-center w-full relative">
            <hr className="w-full h-px my-8 bg-[#f1f3f515] border-0" />
            <span className="absolute px-3 font-medium text-black dark:text-white bg-white dark:bg-gray-800">
              Or
            </span>
          </div>
        </div>
        <div className="mt-1">
          <form onSubmit={handleSubmit} className="flex flex-col gap-1.5">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full px-4 py-2.5 bg-transparent rounded-full border border-gray-400 hover:border-gray-500 text-black dark:text-white"
            />
            {usernameError && <small className="text-red-500">{usernameError}</small>}
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              onBlur={() => setEmailTouched(true)}
              placeholder="Email Address"
              className={`w-full px-4 py-2.5 bg-transparent rounded-full border ${
                validEmail ? "border-green-500" : "border-gray-400"
              } hover:border-gray-500 text-black dark:text-white`}
            />
            {emailTouched && !validEmail && (
              <small className="text-red-500">Please enter a valid email address.</small>
            )}
            <div className="relative">
              <input
                type={passwordVisible ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                onBlur={() => setPasswordTouched(true)}
                placeholder="Password"
                className={`w-full px-4 py-2.5 bg-transparent rounded-full border ${
                  validPassword ? "border-green-500" : "border-gray-400"
                } hover:border-gray-500 text-black dark:text-white`}
              />
              <div
                className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer text-black"
                onClick={() => setPasswordVisible(!passwordVisible)}
              >
                {passwordVisible ? <FaEyeSlash className="text-gray-600 dark:text-white" /> : <FaEye className="text-gray-600 dark:text-white" />}
              </div>
            </div>
            {passwordTouched && !validPassword && (
              <small className="text-red-500">
                Password must contain at least 8 characters, 1 uppercase letter, 1 number, and 1 special character.
              </small>
            )}
            <div className="relative">
              <input
                type={confirmPasswordVisible ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                className={`w-full px-4 py-2.5 bg-transparent rounded-full border ${
                  password !== "" && confirmPassword !== "" && password === confirmPassword
                    ? "border-green-500"
                    : "border-gray-400"
                } hover:border-gray-500 text-black dark:text-white`}
              />
              <div
                className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer text-black"
                onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
              >
                {confirmPasswordVisible ? <FaEyeSlash className="text-gray-600 dark:text-white" /> : <FaEye className="text-gray-600 dark:text-white" />}
              </div>
            </div>
            {password !== confirmPassword && (
              <small className="text-red-500">Passwords do not match.</small>
            )}
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className={`w-full px-4 py-2.5 rounded-full font-semibold ${
                isSubmitDisabled
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#f1f3f5] hover:bg-black text-md text-gray-900 hover:text-white"
              } transition`}
            >
              Sign Up
            </button>
          </form>
        </div>
      </div>
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

export default Signup;
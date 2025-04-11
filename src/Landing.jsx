import React, { useEffect, useState } from "react";
import Navbar from "./components/Navbar/Navbar.jsx";
import { ArrowRight } from "lucide-react";
import { 
  FaFacebook, FaTwitter, FaInstagram, FaTiktok, FaGoogle, 
  FaWhatsapp, FaYoutube, FaReddit, FaLinkedin, FaSnapchat, 
  FaDiscord, FaPinterest, FaTelegram, FaTwitch 
} from "react-icons/fa";

const socialIcons = [
  { icon: <FaFacebook size={40} className="text-blue-500 glowing-icon" />, style: 'top-[15%] left-[5%]' },
  { icon: <FaTwitter size={40} className="text-blue-400 glowing-icon" />, style: 'top-[15%] right-[15%]' },
  { icon: <FaInstagram size={40} className="text-pink-500 glowing-icon" />, style: 'bottom-[40%] left-[7%]' },
  { icon: <FaTiktok size={40} className="text-black glowing-icon" />, style: 'bottom-[40%] right-[5%]' },
  { icon: <FaGoogle size={40} className="text-red-500 glowing-icon" />, style: 'bottom-[20%] left-[12%]' },
  { icon: <FaWhatsapp size={40} className="text-green-500 glowing-icon" />, style: 'bottom-[5%] right-[18%]' },
  { icon: <FaYoutube size={40} className="text-red-600 glowing-icon" />, style: 'bottom-[28%] left-[20%]' },
  { icon: <FaReddit size={40} className="text-orange-500 glowing-icon" />, style: 'top-[40%] right-[15%]' },
  { icon: <FaSnapchat size={40} className="text-yellow-500 glowing-icon" />, style: 'bottom-[35%] right-[20%]' },
  { icon: <FaDiscord size={40} className="text-indigo-500 glowing-icon" />, style: 'top-[35%] left-[17%]' },
  { icon: <FaTelegram size={40} className="text-blue-500 glowing-icon" />, style: 'top-[12%] left-[30%]' },
  { icon: <FaTwitch size={40} className="text-purple-500 glowing-icon" />, style: 'bottom-[15%] right-[30%]' },
];

function TypingEffect() {
  const text = "Frame by Frame";
  const [displayed, setDisplayed] = useState("");
  const [index, setIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const typingDelay = isDeleting ? 100 : 150;
    const pauseDelay = 1000;
    const timeout = setTimeout(() => {
      if (!isDeleting && index < text.length) {
        setDisplayed(text.substring(0, index + 1));
        setIndex(index + 1);
      } else if (!isDeleting && index === text.length) {
        setTimeout(() => setIsDeleting(true), pauseDelay);
      } else if (isDeleting && index > 0) {
        setDisplayed(text.substring(0, index - 1));
        setIndex(index - 1);
      } else if (isDeleting && index === 0) {
        setIsDeleting(false);
      }
    }, index === text.length || index === 0 ? pauseDelay : typingDelay);
    return () => clearTimeout(timeout);
  }, [index, isDeleting, text]);

  return (
    <span className="typing-effect">
      {displayed}
      <span className="cursor">|</span>
    </span>
  );
}

function Landing() {
  useEffect(() => {
    const glow = document.getElementById("cursor-glow");
    const handleMouseMove = (e) => {
      if (glow) {
        glow.style.left = e.clientX + "px";
        glow.style.top = e.clientY + "px";
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleIconMouseMove = (e) => {
    const icon = e.currentTarget;
    const rect = icon.getBoundingClientRect();
    const iconCenterX = rect.left + rect.width / 2;
    const iconCenterY = rect.top + rect.height / 2;
    const dx = iconCenterX - e.clientX;
    const dy = iconCenterY - e.clientY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const threshold = 80;
    if (distance < threshold) {
      const factor = ((threshold - distance) / threshold) * 20;
      const shiftX = (dx / distance) * factor;
      const shiftY = (dy / distance) * factor;
      icon.style.transform = `translate(${shiftX}px, ${shiftY}px)`;
    } else {
      icon.style.transform = "none";
    }
  };

  const handleIconMouseLeave = (e) => {
    e.currentTarget.style.transform = "none";
  };

  return (
    <div id="root" className="w-full h-screen flex justify-center items-center bg-white dark:bg-gray-900 relative overflow-hidden">
      {/* Internal CSS */}
      <style>{`
        .ai-particles {
          position: absolute;
          width: 100%;
          height: 100%;
          z-index: 1;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
        }
        .animate-float {
          animation: animateFloat 3s ease-in-out infinite;
        }
        @keyframes animateFloat {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        /* Default for light mode */
        #cursor-glow {
          position: fixed;
          pointer-events: none;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          z-index: 999;
          filter: blur(5px);
          animation: yellowGlowColor 8s ease-in-out infinite;
        }
        /* When in dark mode, override with a white glow */
        .dark #cursor-glow {
          animation: darkGlowColor 8s ease-in-out infinite;
        }
        @keyframes yellowGlowColor {
          0% {
            background: radial-gradient(circle, rgba(255,255,0,0.6), transparent 70%);
          }
          25% {
            background: radial-gradient(circle, rgba(255,230,0,0.6), transparent 70%);
          }
          50% {
            background: radial-gradient(circle, rgba(255,217,0,0.6), transparent 70%);
          }
          75% {
            background: radial-gradient(circle, rgba(255,204,0,0.6), transparent 70%);
          }
          100% {
            background: radial-gradient(circle, rgba(255,255,0,0.6), transparent 70%);
          }
        }
        @keyframes darkGlowColor {
          0% {
            background: radial-gradient(circle, rgba(255,255,255,0.6), transparent 70%);
          }
          25% {
            background: radial-gradient(circle, rgba(245,245,245,0.6), transparent 70%);
          }
          50% {
            background: radial-gradient(circle, rgba(235,235,235,0.6), transparent 70%);
          }
          75% {
            background: radial-gradient(circle, rgba(245,245,245,0.6), transparent 70%);
          }
          100% {
            background: radial-gradient(circle, rgba(255,255,255,0.6), transparent 70%);
          }
        }
     /* Typing effect styles */
      .typing-effect {
        font-size: 4rem;
        font-weight: bold;
        white-space: nowrap;
        color: black;  /* Black text for light mode */
      }
      .dark .typing-effect {
        color: white;  /* White text for dark mode */
      }
      @media (max-width: 768px) {
        .typing-effect {
          font-size: 2.5rem;
        }
      }
      @media (max-width: 480px) {
        .typing-effect {
          font-size: 2rem;
        }
      }
      .cursor {
        display: inline-block;
        margin-left: 2px;
        animation: blink 1s step-end infinite;
      }
      @keyframes blink {
        from, to { opacity: 0; }
        50% { opacity: 1; }
      }
      `}</style>

      {/* Glow element behind the cursor */}
      <div id="cursor-glow" />

      {/* AI Floating Particles */}
      <div className="ai-particles"></div>

      {/* Floating Social Media Icons */}
      {socialIcons.map((item, index) => (
        <div 
          key={index} 
          className={`absolute ${item.style} animate-float`}
          onMouseMove={handleIconMouseMove}
          onMouseLeave={handleIconMouseLeave}
        >
          {item.icon}
        </div>
      ))}

      <Navbar />

      {/* Main Content */}
      <div className="z-10 text-center flex flex-col gap-4 justify-center items-center">
        <a className="flex rounded-full border border-black dark:border-white px-3 py-1 scale-[0.9]" href="/login">
          <div className="text-black dark:text-white">Always be sure of what you see. </div>
          <div className="italic ml-1 text-black dark:text-white"> Get Started</div>
        </a>
        <h1 className="font-semibold text-6xl text-black dark:text-white">
          Breaking the Digital Lie.
        </h1>
        <div className="mt-4">
          {/* Typing effect with vertical line cursor in front of the text */}
          <TypingEffect />
        </div>
        <div className="flex justify-center items-center gap-4">
          <button
            className="hidden lg:inline-block py-2.5 px-5 bg-white hover:bg-[#ddd] ai-wave text-[1.185rem] text-gray-900 font-bold rounded-full transition duration-200 dark:bg-gray-800 dark:hover:bg-gray-600 dark:text-white"
            onClick={() => { window.location.href = '/login'; }}>
            <div className="flex items-center gap-2">Try Now <ArrowRight size={20} /></div>
          </button>
          <a href="/signup">
            <button className="hidden lg:inline-block py-2.5 px-5 border border-black dark:border-white hover:bg-[#252525] dark:hover:bg-white dark:hover:text-black text-[1.185rem] hover:text-white text-black dark:text-white dark:hover-font-normal rounded-full transition duration-200">
              Sign Up
            </button>
          </a>
        </div>
      </div>
    </div>
  );
}

export default Landing;
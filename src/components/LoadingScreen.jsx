import React, { useState, useEffect } from "react";

const images = [
  "https://res.cloudinary.com/dpyquo88b/image/upload/v1742330351/f6_u1bfp9.jpg",
  "https://res.cloudinary.com/dpyquo88b/image/upload/v1742330351/f5_chhjde.jpg",
  "https://res.cloudinary.com/dpyquo88b/image/upload/v1742330350/f10_ppd5sy.webp",
  "https://res.cloudinary.com/dpyquo88b/image/upload/v1742330350/f4_fnkx99.jpg",
  "https://res.cloudinary.com/dpyquo88b/image/upload/v1742330350/f7_khvoeq.jpg",
  "https://res.cloudinary.com/dpyquo88b/image/upload/v1742330350/f9_izpjpi.jpg",
  "https://res.cloudinary.com/dpyquo88b/image/upload/v1742330349/f1_gkugy1.jpg",
  "https://res.cloudinary.com/dpyquo88b/image/upload/v1742330349/f3_nfocpu.jpg",
  "https://res.cloudinary.com/dpyquo88b/image/upload/v1742330349/f8_kdtrwt.jpg",
  "https://res.cloudinary.com/dpyquo88b/image/upload/v1742330349/f2_yhukmh.jpg",
];

const funfacts = [
  "Deepfake technology emerged in 2017, when early models began swapping faces in videos convincingly.",
  "Deepfake applications extend beyond deception, including film production, education, and entertainment.",
  "AI-based deepfake detection tools are being developed to combat misinformation and fraud.",
  "Early deepfake models struggled with natural blinking, making it easier to detect fake videos.",
  "Political figures have been targeted by deepfakes, raising concerns about misinformation and cybersecurity threats.",
  "Tech giants like Google, Microsoft, and Meta invest heavily in deepfake detection and prevention.",
  "Deepfake-generated voices have been used in audiobooks, AI assistants, and even movie dubbing.",
  "Deepfake detection remains an ongoing challenge, as AI models continuously improve their realism.",
];

const ImageCarousel = ({ currentIndex }) => {
  const total = images.length;
  // Calculate indices for previous two and next two images
  const prev2 = (currentIndex - 2 + total) % total;
  const prev1 = (currentIndex - 1 + total) % total;
  const next1 = (currentIndex + 1) % total;
  const next2 = (currentIndex + 2) % total;

  return (
    <div className="relative flex items-center justify-center space-x-2">
      <img
        src={images[prev2]}
        alt="prev2"
        className="object-contain opacity-60 rounded-lg"
        style={{ height: "8rem", transition: "all 0.5s ease-in-out" }}
      />
      <img
        src={images[prev1]}
        alt="prev1"
        className="object-contain opacity-80 rounded-lg"
        style={{ height: "10rem", transition: "all 0.5s ease-in-out" }}
      />
      <img
        src={images[currentIndex]}
        alt="current"
        className="object-contain rounded-lg"
        style={{ height: "15rem", transition: "all 0.5s ease-in-out" }}
      />
      <img
        src={images[next1]}
        alt="next1"
        className="object-contain opacity-80 rounded-lg"
        style={{ height: "10rem", transition: "all 0.5s ease-in-out" }}
      />
      <img
        src={images[next2]}
        alt="next2"
        className="object-contain opacity-60"
        style={{ height: "8rem", transition: "all 0.5s ease-in-out" }}
      />
    </div>
  );
};

const FunFactTicker = ({ currentIndex }) => {
  return (
    <>
      <style>{`
        @keyframes slideFact {
          0%   { transform: translateX(100%); opacity: 0; }
          25%  { transform: translateX(0); opacity: 1; }
          75%  { transform: translateX(0); opacity: 1; }
          100% { transform: translateX(-100%); opacity: 0; }
        }
      `}</style>
      <div className="w-full text-center mt-[55px]">
        <div
          key={currentIndex}
          className="inline-block text-white text-xl font-mono px-4 whitespace-normal"
          style={{ 
            animation: "slideFact 4s ease-in-out forwards",
            maxWidth: "600px",
            margin: "0 auto"
          }}
        >
          {funfacts[currentIndex % funfacts.length]}
        </div>
      </div>
    </>
  );
};

const LoadingScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const total = images.length;

  useEffect(() => {
    // Update currentIndex every 4000ms so both images and funfacts sync together
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 4000);
    return () => clearInterval(timer);
  }, [total]);

  return (
    <>
      {/* Full-screen translucent overlay */}
      <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-black bg-opacity-50">
        {/* Image carousel in the middle */}
        <ImageCarousel currentIndex={currentIndex} />
        {/* Fun Fact ticker below images */}
        <FunFactTicker currentIndex={currentIndex} />
      </div>
    </>
  );
};

export default LoadingScreen;
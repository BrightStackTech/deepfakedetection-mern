import React, { useState, useEffect } from "react";
import { getUserDetails } from "../../APIs/userDetails"; // adjust import as needed
import Navbar from "../Navbar/navbar2";
import Footer from "../Footer/footer";

function AboutUs() {

  const [user, setUser] = useState(null);
  
  useEffect(() => {
    async function fetchUser() {
      const userDetails = await getUserDetails();
      if (userDetails) setUser(userDetails);
    }
    fetchUser();
  }, []);
  return (
      <div className="min-h-screen pt-32 bg-white dark:bg-gray-900 text-black dark:text-white">
         <Navbar user={user} active={3} />
      {/* Page Title and Subtitle */}
      <div className="container mx-auto px-10 sm:px-10 md:px-20 lg:px-24 xl:px-32 pt-10">
        <h1 className="text-6xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold ml-4">DeepTrace</h1>
        <h2 className="text-3xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-4xl font-semibold mt-4 ml-4">
          A Deepfake detection tool
        </h2>

        {/* Content Section */}
        <div className="mt-6 ml-4">
          <p className="text-lg">
            In an era where artificial intelligence is being leveraged to create hyper-realistic fake content, ensuring authenticity has never been more critical.
            DeepTrace is your trusted companion in detecting and identifying deepfakes with cutting-edge accuracy. Whether you're an individual, an organization,
            or a media professional, our AI-powered platform helps you verify images and videos, ensuring that manipulated content does not mislead or deceive.
          </p>
        </div>
              
        <div className="mt-6 ml-4">
          <p className="text-lg">
            DeepTrace employs advanced machine learning algorithms to scrutinize digital media. Our system examines subtle inconsistencies, facial distortions,
            and unnatural artifacts to determine whether an image or video has been altered. With real-time processing and
            high-precision detection, our platform provides a comprehensive report on the authenticity of your uploaded media.
          </p>
        </div>

        {/* Features Section */}
        <div className="mt-32 ml-4">
          <h3 className="text-5xl md:text-6xl font-bold">Features</h3>

          {/* Feature A: Image Detection Support (Image on right) */}
          <div className="flex flex-col md:flex-row items-center mt-6 gap-8">
            <div className="md:w-1/2">
              <h4 className="text-4xl font-semibold">
                A. Image Detection Support
              </h4>
              <p className="mt-2 text-lg">
                Our platform leverages cutting-edge artificial intelligence and machine learning algorithms to perform advanced image detection with high accuracy.
                We ensure precise analysis, delivering reliable and efficient results for various applications, including deepfake detection, facial recognition,
                and content authentication.
              </p>
            </div>
            <div className="md:w-1/2 flex justify-center md:justify-end mt-4 md:mt-0">
              <img
                src="https://res.cloudinary.com/dpyquo88b/image/upload/v1743605847/w_eytohj.jpg"
                alt="Image Detection"
                className="w-full h-full object-cover border rounded-lg"
              />
            </div>
          </div>

          {/* Feature B: Video Detection Support (Image on left) */}
          <div className="flex flex-col md:flex-row items-center mt-12 gap-10">
            <div className="md:w-1/2 flex justify-center md:justify-end mt-4 md:mt-0">
              <img
                src="https://res.cloudinary.com/dvb5mesnd/image/upload/v1741364390/Screenshot_2025-03-07_214928_wwkdtt.png"
                alt="Image Detection"
                className="w-full h-full object-cover border rounded-lg"
              />
            </div>
            <div className="md:w-1/2">
              <h4 className="text-4xl font-semibold">
                B. Video Detection Support
              </h4>
              <p className="mt-2 text-lg">
                Our platform harnesses advanced artificial intelligence and machine learning algorithms to deliver highly accurate video and image analysis.
                With cutting-edge detection capabilities, it ensures precise results for deepfake identification, facial recognition, and content authentication,
                providing reliability across various applications.
              </p>
            </div>
          </div>
        </div>

        {/* Developers Section */}
        <div className="mt-32 ml-4 mb-40">
          <h3 className="text-5xl md:text-6xl font-bold">Developers</h3>
          <div className="flex flex-col md:flex-row justify-between mt-24">
            {/* Left Developer */}
            <div className="md:w-1/2 flex flex-col items-center">
              <img
                src="https://res.cloudinary.com/dvb5mesnd/image/upload/v1741365022/Screenshot_2025-03-07_215836_yq8ktm.png"
                alt="Developer"
                className="w-80 h-80 object-cover rounded-full"
              />
              <p className="mt-10 text-2xl text-center font-bold">
                Bhuvanesh Angane
            </p>
              <p className="mt-8 text-xl text-center">
                Student at K.C. College
            </p>
                          
              <p className="mt-4 text-lg text-center  text-gray-500">
                              Expertise in Python <br />
                              and Machine Learning.
              </p>
              <a href="https://github.com/Bhuv09" target="_blank"><button className="mt-8 px-16 py-4 bg-black text-white rounded-3xl hover:bg-gray-700 ">
                GitHub
              </button></a>
            </div>

            {/* Right Developer */}
            <div className="md:w-1/2 flex flex-col items-center mt-8 md:mt-0">
              <img
                src="https://res.cloudinary.com/dvb5mesnd/image/upload/v1741365022/Screenshot_2025-03-07_215959_gs9sb8.png"
                alt="Developer"
                className="w-80 h-80 object-cover rounded-full"
              />
              <p className="mt-10 text-2xl text-center font-bold">
                Yash Agrawal
            </p>
              <p className="mt-8 text-xl text-center">
                Student at K.C. College
                          </p>
              <p className="mt-4 text-lg text-center text-gray-500">
                              Expertise in React <br />
                              and UI designing.
              </p>
              <a href="https://github.com/Yashag10" target="_blank"><button className="mt-8 px-16 py-4 bg-black text-white rounded-3xl hover:bg-gray-700 ">
                GitHub
              </button></a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default AboutUs;
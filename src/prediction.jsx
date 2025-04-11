import { ArrowLeft, Loader, InfoIcon } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar/navbar2";
import { getUserDetails } from "../src/APIs/userDetails";
import { ToastContainer, toast } from "react-toastify";
import Footer from "../src/components/Footer/footer";
import LoadingScreen from "./components/LoadingScreen";

function VideoUpload() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [file, setFile] = useState(null);
  const [framesPerVideo, setFramesPerVideo] = useState(50); // Default value
  const [result, setResult] = useState(null);
  const [LoaderActive, setLoaderActive] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const userDetails = await getUserDetails();
      if (userDetails) setUser(userDetails);
    };
    fetchUserDetails();
  }, []);
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    console.log("Selected file:", selectedFile);
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please upload a video file.");
      return;
    }

    setLoaderActive(true);

    // 1. Upload file to Cloudinary
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append("file", file);
    cloudinaryFormData.append("upload_preset", `${import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET}`);

    let cloudinaryUrl = "";
    try {
      const cloudinaryResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/video/upload`,
        { method: "POST", body: cloudinaryFormData }
      );
      if (!cloudinaryResponse.ok) {
        throw new Error("Cloudinary upload failed");
      }
      const cloudinaryData = await cloudinaryResponse.json();
      cloudinaryUrl = cloudinaryData.secure_url;
      console.log("Cloudinary URL:", cloudinaryUrl);
    } catch (error) {
      console.error("Cloudinary Error:", error);
      toast.error("An error occurred while uploading to Cloudinary.");
      setLoaderActive(false);
      return;
    }

    // 2. Get prediction result from your video prediction API
    const formData = new FormData();
    formData.append("video", file);
    formData.append("frames_per_video", framesPerVideo);

    let predictionResult = "";
    try {
      const response = await fetch(`${import.meta.env.VITE_VIDEO_SERVER_URL}/predict-video`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Video prediction failed");
      }
      const data = await response.json();
      console.log("Video prediction result:", data);
      setResult(data);
      predictionResult = data.prediction; // Must be a valid string (e.g., "Fake" or "Real")
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while processing the video.");
      setLoaderActive(false);
      return;
    }

    // 3. Send Cloudinary URL and prediction result to store in MongoDB
    try {
      await fetch(`${import.meta.env.VITE_SERVER_URL}/api/addMediaUrl`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          mediaUrl: cloudinaryUrl,
          prediction: predictionResult,
          type: "video", // explicitly mark this as a video
        }),
      });
    } catch (error) {
      console.error("Error adding media:", error);
      toast.error("An error occurred while storing video data.");
    } finally {
      setLoaderActive(false);
    }
  };

  return (
    <div className="relative flex flex-col justify-center items-center h-auto min-h-screen pt-32 bg-white dark:bg-gray-900">
      <ToastContainer />
      <Navbar active={1} user={user}/>

      {LoaderActive && <LoadingScreen className="z-100 bg-black bg-opacity-60"/>}

      {/* Loader Mask */}
      {LoaderActive && (
        <div className="absolute inset-0 z-50 flex justify-center items-center mt-[480px]">
          <Loader size={64} className="animate-spin text-white" />
          <div className="text-white text-2xl font-semibold ml-4 ">
            Uploading Video...
          </div>
        </div>
      )}

      {/* Page Content */}
      <div
        className={`w-screen flex justify-evenly ${
          LoaderActive ? "opacity-50" : ""
        }`}
      >
        {/* Video Upload Section */}
        <div className="flex flex-col justify-center items-center gap-4">
          <div className="text-5xl font-semibold text-black dark:text-white">
            Upload Video
          </div>
          {!file ? (
            <div className="">
              <label className="flex h-56 w-116 cursor-pointer items-center justify-center rounded-md border-2 border-dashed border-gray-600 dark:border-gray-300 p-6">
                <div className="space-y-1 text-center">
                  <div className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="h-6 w-6 text-gray-900 dark:text-white"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
                      />
                    </svg>
                  </div>
                  <div className="text-black dark:text-white">
                    <a
                      href="#"
                      className="font-medium text-primary-500 hover:text-primary-700"
                    >
                      Click to upload
                    </a>{" "}
                    or drag and drop
                  </div>
                  <p className="text-sm text-gray-400">
                    strictly mp4 only!
                  </p>
                </div>
                <input
                  type="file"
                  accept="video/mp4,video/mov,video/webm,video/avi,video/wmv"
                  className="sr-only"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          ) : (
            <div>
              <video width="400" controls>
                <source src={URL.createObjectURL(file)} type={file.type} />
                Your browser does not support HTML video.
              </video>
            </div>
          )}
          <div className="flex gap-4 justify-center items-center">
            {file && (
              <button
                onClick={() => setFile(null)}
                className="py-1.5 px-3 bg-[#1e1e1e] hover:bg-gray-200 dark:hover:bg-gray-700 text-red-600 font-semibold rounded-full"
              >
                Remove Video
              </button>
            )}
          </div>

          <button
            onClick={handleUpload}
            className="py-2.5 px-5 bg-[#f1f3f5] dark:bg-gray-700 hover:bg-[#ddd] dark:hover:bg-gray-600 text-[1.185rem] text-gray-900 dark:text-white font-semibold rounded-full"
          >
            Upload
          </button>

          {result && (
            <div className="results-container p-4 m-4 border border-gray-300 dark:border-gray-600 rounded-md text-black dark:text-white bg-white dark:bg-gray-800">
              <h3 className="text-xl font-semibold mb-2">
                Prediction Results
              </h3>
              <p>
                <strong>Prediction:</strong> {result.prediction}
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default VideoUpload;
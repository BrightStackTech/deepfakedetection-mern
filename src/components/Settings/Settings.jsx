import React, { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import ReactDOM from "react-dom";
import Cropper from "react-easy-crop";
import Navbar from "../Navbar/navbar2";
import { getUserDetails } from "../../APIs/userDetails";
import { FaCamera } from "react-icons/fa";
import { toast } from "react-toastify";

// Helper function to crop image using canvas
const getCroppedImg = (imageSrc, pixelCrop) => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      const ctx = canvas.getContext("2d");

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );

      resolve(canvas.toDataURL("image/png"));
    };
    image.onerror = (error) => {
      reject(error);
    };
  });
};

const Settings = () => {
  const [user, setUser] = useState(null);
  const [nickname, setNickname] = useState("");
  const [nicknameError, setNicknameError] = useState("");
  // Preview profile picture (UI only, not saved to DB)
  const [previewProfilePic, setPreviewProfilePic] = useState(null);
  // For camera dropdown & interface
  const [showCameraDropdown, setShowCameraDropdown] = useState(false);
  const [showCameraInterface, setShowCameraInterface] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  // For enlarged image dialog on clicking profile image
  const [showImageDialog, setShowImageDialog] = useState(false);

  // Crop states for react-easy-crop
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    async function fetchUser() {
      const userData = await getUserDetails();
      if (userData) {
        setUser(userData);
        setNickname(userData.username); // initial nickname set to username
        setPreviewProfilePic(userData.profilePicture); // default profile picture
      }
    }
    fetchUser();
  }, []);

  useEffect(() => {
    if (!nickname) {
      setNicknameError("Username is required");
      return;
    }
    // Check for spaces
    if (nickname.includes(" ")) {
      setNicknameError("Username cannot have spaces");
      return;
    }
    // Check for minimum length
    if (nickname.length < 3) {
      setNicknameError("Username cannot be this short");
      return;
    } else {
      setNicknameError("");
    }
    // Only check availability if nickname is changed from original
    if (user && nickname !== user.username) {
      const delayDebounceFn = setTimeout(async () => {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_SERVER_URL}/api/checkUsername?username=${nickname}`
          );
          if (!response.data.available) {
            setNicknameError("Username already taken, try with a different username");
          } else {
            setNicknameError("");
          }
        } catch (error) {
          console.error("Error checking username availability:", error);
        }
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [nickname, user]);
  
    const isProfileChanged = user 
    ? (nickname !== user.username || previewProfilePic !== user.profilePicture)
    : false;
    // Disable Save if there is an error or if no changes
    const isSaveDisabled = !isProfileChanged || !!nicknameError;

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen bg-white dark:bg-gray-900 text-black dark:text-white">
        Loading...
      </div>
    );
  }

  // Handle Save for nickname (and preview profile pic will be shown)
 const handleSave = async () => {
    try {
      setNicknameError("");
      let imageUrl = previewProfilePic;
      if (previewProfilePic && previewProfilePic.startsWith("data:image")) {
        const cloudinaryFormData = new FormData();
        cloudinaryFormData.append("file", previewProfilePic);
        cloudinaryFormData.append("upload_preset", `${import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET}`);

        const cloudinaryResponse = await axios.post(
          `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
          cloudinaryFormData
        );
        if (cloudinaryResponse.data.secure_url) {
          imageUrl = cloudinaryResponse.data.secure_url;
        }
      }

      const response = await axios.put(
        `${import.meta.env.VITE_SERVER_URL}/api/updateUserProfile`,
        { nickname, profilePicture: previewProfilePic },
        { withCredentials: true }
      );
      toast.success(response.data.message);
      window.location.reload();
    } catch (error) {
      console.error("Update error: ", error);
      if (error.response && error.response.data && error.response.data.error) {
        setNicknameError(error.response.data.error);
      } else {
        toast.error("Failed to update profile");
      }
    }
  };

  const handleChangePassword = () => {
    window.location.href = "/change-password";
  };

  // Handle click on the camera overlay icon
  const toggleCameraDropdown = () => {
    setShowCameraDropdown((prev) => !prev);
  };

  // When "Capture" is chosen, show camera interface
  const handleCaptureOption = async () => {
    setShowCameraDropdown(false);
    setShowCameraInterface(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  // When "Upload" is chosen, trigger file upload
  const handleUploadOption = () => {
    setShowCameraDropdown(false);
    document.getElementById("fileInput")?.click();
  };

  // Updated file upload: load browsed image into the cropper
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Instead of setting directly the preview, set as captured and show cropper.
        setCapturedImage(reader.result);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Capture frame from video
  const handleCaptureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/png");
      console.log("Captured image:", dataUrl);
      setCapturedImage(dataUrl);
      setShowCameraInterface(false);
      setShowCropper(true);

      // Stop video stream
      let stream = video.srcObject;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    }
  };

  // Capture crop area on complete
  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  // Save the cropped image (for preview only)
  const handleSaveCropped = async () => {
    try {
      const croppedImage = await getCroppedImg(capturedImage, croppedAreaPixels);
      setPreviewProfilePic(croppedImage);
      setShowCropper(false);
      setCapturedImage(null);
    } catch (error) {
      console.error("Error cropping image:", error);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white py-40 ">
      <Navbar active={3} user={user} />
      <div className="flex flex-col items-center px-10">
        {/* Profile Picture Container */}
        <div className="relative group mb-4">
          <div className="relative group mb-4 rounded-full overflow-hidden">
            {/* Clicking on profile image (outside camera overlay) opens enlarged dialog */}
            <img
              onClick={() => setShowImageDialog(true)}
              src={previewProfilePic}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover cursor-pointer"
            />
            {/* Camera icon overlay */}
            <div
              className="absolute bottom-0 left-0 right-0 h-10 bg-black bg-opacity-50 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                toggleCameraDropdown();
              }}
            >
              <FaCamera size={20} className="text-white" />
            </div>
          </div>
          {/* Camera Options Dropdown */}
          {showCameraDropdown && (
            <div className="absolute bottom-0 -right-20 bg-white dark:bg-gray-800 rounded shadow p-2 z-10">
              <button
                onClick={handleCaptureOption}
                className="block w-full text-left p-2 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Capture
              </button>
              <button
                onClick={handleUploadOption}
                className="block w-full text-left p-2 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Upload
              </button>
            </div>
            )}
          </div>
        {/* Greeting */}
        <h1 className="text-4xl font-bold mb-6">
          Hi, {user.username} <span role="img" aria-label="waving hand">👋</span>
        </h1>
        <div className="w-full max-w-md">
          {/* Email Field */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-red-500 font-semibold mb-1">
              You're associated with this email id:
            </label>
            <input
              id="email"
              type="email"
              value={user.email}
              readOnly
              className="w-full p-3 border border-gray-300 rounded bg-transparent"
            />
          </div>
          {/* Nickname Field */}
          <div className="mb-4">
            <label htmlFor="nickname" className="block font-semibold mb-1">
              What do we call you?
            </label>
            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                setNicknameError("");
              }}
              className="w-full p-3 border border-gray-300 rounded bg-transparent"
            />
            {nicknameError && <small className="text-red-500">{nicknameError}</small>}
          </div>
          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaveDisabled}
              className={`px-4 py-2 rounded ${
                isSaveDisabled
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600 transition"
              }`}
            >
              Save
            </button>
          </div>
          {/* Change Password Button */}
          <div className="flex justify-end mt-4">
            <button
              onClick={handleChangePassword}
              className="px-4 py-2 bg-gray-200 text-red-500 dark:bg-gray-700 dark:hover:bg-gray-800 font-bold rounded hover:bg-gray-300 transition"
            >
              Change Password
            </button>
          </div>
        </div>
      </div>

      {/* Hidden file input for image upload option */}
      <input
        id="fileInput"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Camera Interface Modal */}
      {showCameraInterface && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
          <div className="bg-white p-4 rounded shadow-lg">
            <video ref={videoRef} className="w-80 h-60 bg-black" autoPlay />
            <div className="flex justify-between mt-4">
              <button
                onClick={handleCaptureFrame}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                Capture
              </button>
              <button
                onClick={() => {
                  if (videoRef.current && videoRef.current.srcObject) {
                    let stream = videoRef.current.srcObject;
                    stream.getTracks().forEach((track) => track.stop());
                  }
                  setShowCameraInterface(false);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cropper Preview Modal */}
      {showCropper && capturedImage && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50"
          style={{ display: showCropper && capturedImage ? "flex" : "none" }}
        >
          <div className="bg-white p-4 rounded shadow-lg">
            <h2 className="mb-4 text-xl font-bold text-gray-700">Crop your image</h2>
            <div className="relative w-80 h-60 bg-black">
              <Cropper
                key={capturedImage} // Forces remount on image change
                image={capturedImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="flex justify-between mt-4">
              <button
                onClick={handleSaveCropped}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowCropper(false);
                  setCapturedImage(null);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enlarged Image Dialog */}
      {showImageDialog && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50"
          onClick={() => setShowImageDialog(false)}
        >
          <div className="bg-white p-4 rounded shadow-lg">
            <img src={previewProfilePic} alt="Enlarged Profile" className="w-96" />
          </div>
        </div>
      )}

      {/* Hidden canvas for capturing video frame */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default Settings;
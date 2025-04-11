import React, { useState, useEffect } from "react";
import { getUserDetails } from "../../APIs/userDetails";
import Navbar from "../Navbar/navbar2";
import { FileUp, FileChartPie, Target, Search } from "lucide-react";
import { MdOutlineDeleteSweep } from "react-icons/md";
import { toast } from "react-toastify";
import Footer from "../Footer/footer";

function Home() {
  const [user, setUser] = useState(null);
  const [mediaImages, setMediaImages] = useState([]);
  const [mediaVideos, setMediaVideos] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState(null);
  const [mediaType, setMediaType] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const userDetails = await getUserDetails();
      if (userDetails) setUser(userDetails);
    };
    fetchUserDetails();
  }, []);

  useEffect(() => {
    async function fetchUserMedia() {
      try {
        const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/getMedia`, {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setMediaImages(data.images || []);
          setMediaVideos(data.videos || []);
        } else {
          console.error("Failed to fetch media");
        }
      } catch (err) {
        console.error("Error fetching media:", err);
      }
    }
    fetchUserMedia();
  }, []);

  const deepfakesCount =
    mediaImages.filter(
      (entry) =>
        entry.prediction.toLowerCase() === "fake" ||
        entry.prediction.toLowerCase() === "deepfake"
    ).length +
    mediaVideos.filter(
      (entry) =>
        entry.prediction.toLowerCase() === "fake" ||
        entry.prediction.toLowerCase() === "deepfake"
    ).length;

  // Handler for clicking delete icon
  const handleDeleteClick = (item, type) => {
    setMediaToDelete(item);
    setMediaType(type);
    setShowDeleteModal(true);
  };

  // Called when user cancels deletion
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setMediaToDelete(null);
    setMediaType("");
  };

  const handleConfirmDelete = async () => {
    if (!mediaToDelete || !mediaToDelete._id) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/deleteMedia`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ mediaId: mediaToDelete._id }),
      });
      if (response.ok) {
        toast.success("Media deleted successfully");
        // Remove the deleted media from state
        if (mediaToDelete.type === "image") {
          setMediaImages((prev) =>
            prev.filter((item) => item._id !== mediaToDelete._id)
          );
        } else {
          setMediaVideos((prev) =>
            prev.filter((item) => item._id !== mediaToDelete._id)
          );
        }
        setShowDeleteModal(false);
        setMediaToDelete(null);
        setMediaType("");
      } else {
        toast.error("Failed to delete media");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error deleting media");
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="relative dark:bg-gray-900">
      <div className="flex flex-col items-center mt-32 bg-white dark:bg-gray-900 h-auto pb-20 pt-10">
        <Navbar active={0} user={user} />
        {/* Responsive container: flex-col on small screens, row on medium and up */}
        <div className="flex flex-col md:flex-row justify-between w-full md:w-[64%] px-4">
          <div className="flex flex-col gap-2">
            <div className="text-2xl text-black dark:text-white">
              Hi, {user.username} 👋
            </div>
            <div className="text-5xl font-medium text-black dark:text-white">
              Dashboard
            </div>
          </div>
          <div className="flex gap-8 mt-4 md:mt-0 px-4 py-4 rounded-[10px] bg-gray-100 dark:bg-gray-700 items-center justify-center hover:scale-105 cursor-pointer">
            <div className="flex flex-col text-black dark:text-white">
              <div>Detect Deepfakes with High Accuracy!</div>
              <div>Upload your video now.</div>
            </div>
            <a href="/upload-video">
              <button className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-[#1e1e1e] rounded-full font-semibold text-xl flex gap-2 dark:text-white">
                <FileUp /> Upload Video
              </button>
            </a>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 mt-4 justify-center items-center w-full px-4 md:px-40">
          <div className="flex gap-8 px-[20px] py-4 bg-gray-200 dark:bg-gray-700 rounded-[10px] hover:scale-110 cursor-pointer">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-[#B535BE25]">
              <FileChartPie color="#B535BE" size={32} />
            </div>
            <div>
              <div className="text-4xl font-medium text-black dark:text-white">
                {mediaVideos.length}
              </div>
              <div className="text-xl text-gray-600 dark:text-gray-300">
                Videos Analyzed
              </div>
            </div>
          </div>

          <div className="flex gap-8 px-[20px] py-4 bg-gray-200 dark:bg-gray-700 rounded-[10px] hover:scale-110 cursor-pointer">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-[#FFDD5525]">
              <Target color="#FFDD55" size={32} />
            </div>
            <div>
              <div className="text-4xl font-medium text-black dark:text-white">
                {mediaImages.length}
              </div>
              <div className="text-xl text-gray-600 dark:text-gray-300">
                Images Analyzed
              </div>
            </div>
          </div>
          <div className="flex gap-8 px-[20px] py-4 bg-gray-200 dark:bg-gray-700 rounded-[10px] hover:scale-110 cursor-pointer">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-[#FF004F25]">
              <Search color="#FF004F" size={32} />
            </div>
            <div>
              <div className="text-4xl font-medium text-black dark:text-white">
                {deepfakesCount}
              </div>
              <div className="text-xl text-gray-600 dark:text-gray-300">
                Deepfakes Detected
              </div>
            </div>
          </div>
        </div>

        {/* Recents Header */}
        <div className="mt-[70px] w-full pl-40 md:pl-40">
          <h2 className="text-4xl font-semibold text-black dark:text-white">
            Recents
          </h2>
        </div>

        {/* Images and Videos Section */}
        <div className="flex flex-col md:flex-row items-start justify-center gap-6 mt-4 w-full px-4 md:px-40">
          <div className="w-full md:w-[50%]">
            <div className="flex justify-between">
              <div className="text-2xl font-semibold text-black dark:text-white">
                Images
              </div>
            </div>
            <div className="mt-2 bg-gray-200 dark:bg-gray-600 rounded-[10px] p-4 w-full pr-10 text-black dark:text-gray-200 h-[400px] overflow-y-auto">
              {mediaImages && mediaImages.length > 0 ? (
                [...mediaImages]
                  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                  .map((entry, index) => (
                    <div key={index} className="flex items-center gap-4 my-2">
                      {/* Clicking the image opens the preview modal */}
                      <img
                        src={entry.url}
                        alt="Analyzed Media"
                        className="w-h-40 h-auto w-60 object-cover rounded cursor-pointer"
                        onClick={() => setPreviewImage(entry.url)}
                      />
                      <div className="text-lg">
                        Prediction:{" "}
                        <span className="font-medium">{entry.prediction}</span>
                      </div>
                      <MdOutlineDeleteSweep
                        onClick={() => handleDeleteClick(entry, "image")}
                        className="ml-auto cursor-pointer h-8 w-8 hover:text-red-500"
                      />
                    </div>
                  ))
              ) : (
                <div className="flex justify-center items-center h-[360px] text-xl">
                  No images available
                </div>
              )}
            </div>
          </div>
          <div className="w-full md:w-[50%]">
            <div className="flex justify-between">
              <div className="text-2xl font-semibold text-black dark:text-white">
                Videos
              </div>
            </div>
            <div className="mt-2 bg-gray-200 dark:bg-gray-600 rounded-[10px] p-4 w-full pr-10 text-black dark:text-gray-200 h-[400px] overflow-y-auto">
              {mediaVideos && mediaVideos.length > 0 ? (
                [...mediaVideos]
                  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                  .map((entry, index) => (
                    <div key={index} className="flex items-center gap-4 my-2">
                      {/* Clicking the video opens the video preview modal */}
                      <video
                        onClick={(e) => {
                          e.preventDefault();
                          setPreviewVideo(entry.url);
                        }}
                        className="max-h-60 h-auto w-60 object-cover rounded cursor-pointer"
                      >
                        <source src={entry.url} type="video/mp4" />
                      </video>
                      <div className="text-lg">
                        Prediction:{" "}
                        <span className="font-medium">{entry.prediction}</span>
                      </div>
                      <MdOutlineDeleteSweep
                        onClick={() => handleDeleteClick(entry, "video")}
                        className="ml-auto cursor-pointer h-8 w-8 hover:text-red-500"
                      />
                    </div>
                  ))
              ) : (
                <div className="flex justify-center items-center h-[360px] text-xl">
                  No videos available
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
          <div className="relative">
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-[600px] rounded-lg"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-2 right-2 bg-gray-200 hover:bg-gray-300 text-black rounded-full p-2"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Video Preview Modal */}
      {previewVideo && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
          <div className="relative">
            <video
              src={previewVideo}
              controls
              autoPlay
              className="max-w-full max-h-[600px] rounded-lg"
            ></video>
            <button
              onClick={() => setPreviewVideo(null)}
              className="absolute top-2 right-2 bg-gray-200 hover:bg-gray-300 text-black rounded-full p-2"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-700 p-6 rounded shadow-md">
            <p className="mb-4 text-lg text-black dark:text-white">
              Are you sure you want to delete this media?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-black"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
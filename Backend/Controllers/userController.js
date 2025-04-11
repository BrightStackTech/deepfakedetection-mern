const User = require("../Models/user");

exports.addMediaUrl = async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "User not authenticated" });
  }
  
  const { mediaUrl, prediction, type = "image" } = req.body; // default to 'image'
  if (!mediaUrl || !prediction) {
    return res.status(400).json({ error: "mediaUrl and prediction are required" });
  }
  
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: "User not found" });
    
    // Append the new media entry to the media array
    user.media.push({ url: mediaUrl, prediction, type });
    await user.save();
    
    return res.status(200).json({ message: "Media added successfully", media: user.media });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to add media URL" });
  }
};

exports.getUserMedia = async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    
    try {
      // Fetch only the media field from the user document
      const user = await User.findById(req.user._id).select("media");
      if (!user) return res.status(404).json({ error: "User not found" });
      
      // Separate the media entries based on their type
      const images = user.media.filter(item => item.type === "image");
      const videos = user.media.filter(item => item.type === "video");
      
      return res.status(200).json({ images, videos });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to fetch media" });
    }
  };

exports.deleteMedia = async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "User not authenticated" });
  }
  
  const { mediaId } = req.body;
  if (!mediaId) {
    return res.status(400).json({ error: "mediaId is required" });
  }
  
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: "User not found" });
    
    const initialCount = user.media.length;
    user.media = user.media.filter((item) => item._id.toString() !== mediaId);
    if (user.media.length === initialCount) {
      return res.status(404).json({ error: "Media not found" });
    }
    
    await user.save();
    return res.status(200).json({ message: "Media deleted successfully", media: user.media });
  } catch (error) {
    console.error("Error in deleteMedia:", error);
    return res.status(500).json({ error: "Failed to delete media" });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { nickname, profilePicture } = req.body;

    // Check if nickname is already taken by any other user
    const existingUser = await User.findOne({ username: nickname, _id: { $ne: req.user._id } });
    if (existingUser) {
      return res.status(400).json({ error: "Name already taken. Try with a different name" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.username = nickname || user.username;
    user.profilePicture = profilePicture || user.profilePicture;
    
    await user.save();

    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error("Error updating profile: ", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.checkUsername = async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }
    const user = await require("../Models/user").findOne({ username });
    if (user) {
      return res.json({ available: false });
    } else {
      return res.json({ available: true });
    }
  } catch (error) {
    console.error("Error in checkUsername:", error);
    res.status(500).json({ error: "Server error" });
  }
};
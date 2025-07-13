const Video = require("../schemas/Video"); // Assuming you have a Video schema
const { videoUpload } = require("./multerController");
const mongoose = require("mongoose");
const User = require("../schemas/User"); // Child model
const ffmpeg = require("fluent-ffmpeg");
// Video upload API for admins
exports.uploadVideo = [
  videoUpload.single("video"), // Accept a single video file
  async (req, res) => {
    try {
      const { title, description, category } = req.body;

      // Validate required fields
      if (!title || !description) {
        return res.status(400).json({ error: "Title, description, and category are required!" });
      }

      if (!req.file) {
        return res.status(400).json({ error: "No video file uploaded!" });
      }

      // Store the video path
      const videoPath = `uploads/videos/${req.file.filename}`;

      // Extract video metadata (duration) using ffprobe from fluent-ffmpeg
      ffmpeg.ffprobe(videoPath, async (err, metadata) => {
        if (err) {
          return res.status(500).json({ error: "Error extracting video metadata" });
        }
        const durationInSeconds = metadata.format.duration;
        const durationInMinutes = parseFloat((durationInSeconds / 60).toFixed(0)); // seconds
        // Create and save the video document with the new fields
        const video = new Video({
          title,
          description,
          category,
          videoPath,
          duration: durationInMinutes, // store the extracted duration
        });

        await video.save();
        res.status(201).json({ message: "Video uploaded successfully!", video });
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
];
//Get uploaded videos
exports.getAllVideos = async (req, res) => {
  try {
    const videos = await Video.find().sort({ uploadedAt: -1 }); // Sort by newest first

    if (!videos.length) {
      return res.status(404).json({ error: "No videos found!" });
    }

    res.status(200).json(videos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
//get a video
exports.getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ error: "Video not found!" });
    }

    res.status(200).json(video);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//push video to child

exports.pushVideoToChild = async (req, res) => {
  try {
    // Expecting the child's username and the video ID in the request body.
    const { childUserName, videoId } = req.body;
    if (!childUserName || !videoId) {
      return res.status(400).json({ error: "Child username and video ID are required" });
    }

    // Ensure that JWT middleware is in place,
    // so that req.user contains the parent's decoded token.
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    // Get parent's id from the token (adjust based on how you set your token payload)
    const parentId = req.user._id || req.user.userId;
    if (!parentId) {
      return res.status(401).json({ error: "Parent ID not found in token" });
    }

    // Find the child ensuring it belongs to the logged-in parent.
    const child = await User.findOne({ userName: childUserName, parentId: parentId });
    if (!child) {
      return res.status(404).json({
        error: "Child not found or not associated with the logged-in parent.",
      });
    }

    // Validate the videoId format.
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      return res.status(400).json({ error: "Invalid video ID format." });
    }

    // Check that the video exists.
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ error: "Video not found." });
    }

    // Push the video ObjectId into the child's videos array.
    child.videos.push(video._id);
    await child.save();

    res.status(200).json({
      message: "Video pushed to child successfully.",
      child,
    });
  } catch (err) {
    console.error("Error pushing video to child:", err);
    res.status(500).json({ error: err.message });
  }
};
//get all pushed videos
exports.getChildPushedVideos = async (req, res) => {
  try {
    // Assuming the child's token is used to access this endpoint.
    // JWT middleware should have set req.user for the authenticated child.
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Find the child by ID and populate the "videos" field.
    const child = await User.findById(req.user.userId).populate("videos");
    if (!child) {
      return res.status(404).json({ error: "Child not found" });
    }

    res.status(200).json({ videos: child.videos });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

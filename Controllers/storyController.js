const Story = require("../schemas/Story");
const { combinedUpload } = require("./multerController");
const User = require("../schemas/User"); // Child model
const mongoose = require("mongoose");

// Create Story API
exports.createStory = [
  // Accept files for two fields: "photos" (up to 5 files) and "audio" (1 file)
  combinedUpload.fields([
    { name: "photos", maxCount: 5 },
    { name: "audio", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { title, content, author, category } = req.body;

      // Validate required fields
      if (!title || !content || !author) {
        return res.status(400).json({ error: "Title, content, and author are required!" });
      }

      // For photos, req.files.photos will be an array, if any
      const photoURLs = req.files.photos
        ? req.files.photos.map((file) => `uploads/photos/${file.filename}`)
        : [];
      // For audio, req.files.audio is an array of max 1 file; pick the first if exists
      const audioURL = req.files.audio ? `uploads/audios/${req.files.audio[0].filename}` : null;

      // Create and save the story
      const story = new Story({
        title,
        content,
        author,
        category,
        photoURLs,
        audioURL,
      });

      await story.save();
      res.status(201).json({ message: "Story saved successfully!", story });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
];

// Get All Stories API
exports.getAllStories = async (req, res) => {
  try {
    const stories = await Story.find().sort({ title: 1 }); // Sorted A-Z by title
    console.log("hi there");
    res.status(200).json(stories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Specific Story by ID API
exports.getStoryById = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({ error: "Story not found!" });
    }

    res.status(200).json(story);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
//push story from parent to child

exports.pushStoryToChild = async (req, res) => {
  try {
    // Expecting the child's username and the story ID in the request body.
    const { childUserName, storyId } = req.body;
    if (!childUserName || !storyId) {
      return res.status(400).json({ error: "Child username and story ID are required" });
    }

    // Get parent's id from the decoded JWT (req.user)
    const parentId = new mongoose.Types.ObjectId(req.user._id || req.user.userId);

    // Find the child belonging to the logged-in parent.
    const child = await User.findOne({ userName: childUserName, parentId: parentId });
    if (!child) {
      return res
        .status(404)
        .json({ error: "Child not found or not associated with the logged-in parent." });
    }

    // Validate the storyId
    if (!mongoose.Types.ObjectId.isValid(storyId)) {
      return res.status(400).json({ error: "Invalid story ID format." });
    }

    // Verify that the story exists.
    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({ error: "Story not found." });
    }

    // Push the story's ObjectId into the child's stories array.
    child.stories.push(story._id);
    await child.save();

    res.status(200).json({
      message: "Story pushed to child successfully.",
      child,
    });
  } catch (err) {
    console.error("Error pushing story to child:", err);
    res.status(500).json({ error: err.message });
  }
};
//get all pushed stories
exports.getChildPushedStories = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const child = await User.findById(req.user.userId).populate("stories");

    if (!child) {
      return res.status(404).json({ error: "Child not found" });
    }

    // Return the fully populated pushed stories.
    res.status(200).json({ stories: child.stories });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
//save stories from AI

exports.createAndPushStory = [
  // Use multer for handling photos (up to 5 files) and one audio file.
  combinedUpload.fields([
    { name: "photos", maxCount: 5 },
    { name: "audio", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      // Extract title and content from the form-data body.
      const { title, content } = req.body;
      if (!title || !content) {
        return res.status(400).json({ error: "Title and content are required" });
      }

      // Build file paths for photos and audio based on the uploaded files.
      const photoURLs = req.files.photos
        ? req.files.photos.map((file) => `uploads/photos/${file.filename}`)
        : [];
      const audioURL = req.files.audio ? `uploads/audios/${req.files.audio[0].filename}` : null;

      // Create a new Story document with the provided data.
      // The author field is left empty.
      const newStory = new Story({
        title,
        content,
        author: "", // Author remains empty as specified.
        photoURLs,
        audioURL,
      });

      // Save the new story into the database.
      await newStory.save();

      // Ensure the request is authenticated.
      // Your JWT middleware should attach the authenticated child's data to req.user.
      if (!req.user || !req.user.userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      // Find the child using the authenticated user's ID.
      const child = await User.findById(req.user.userId);
      if (!child) {
        return res.status(404).json({ error: "Child not found" });
      }

      // Push the new story's ObjectId into the child's stories array.
      child.stories.push(newStory._id);
      await child.save();

      // Send a success response.
      res.status(201).json({
        message: "Story created and pushed successfully!",
        story: newStory,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
];
//search for a story by title

exports.searchStoriesByTitle = async (req, res) => {
  try {
    // Extract title query parameter
    const { title } = req.query;
    if (!title) {
      return res.status(400).json({ error: "Title query parameter is required." });
    }

    // Perform a case-insensitive search using regex.
    // This approach finds any story with the given text in its title.
    const stories = await Story.find({
      title: { $regex: title, $options: "i" },
    });

    if (!stories.length) {
      return res.status(404).json({ message: "No stories found matching the given title." });
    }

    res.status(200).json(stories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
//add story to favorite
exports.addFavoriteStory = async (req, res) => {
  try {
    // Check that the child is authenticated by verifying that req.user exists
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: "User not authenticated." });
    }

    // Extract storyId from the request body.
    const { storyId } = req.body;
    if (!storyId) {
      return res.status(400).json({ error: "Story ID is required." });
    }

    // Validate that the provided storyId is a valid MongoDB ObjectId.
    if (!mongoose.Types.ObjectId.isValid(storyId)) {
      return res.status(400).json({ error: "Invalid story ID format." });
    }

    // Optionally, check if the story exists in the database.
    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({ error: "Story not found." });
    }

    // Update the authenticated child's document by pushing the storyId into favoriteStories.
    // Using $addToSet to avoid duplicate entries.
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { $addToSet: { favoriteStories: storyId } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found." });
    }

    res.status(200).json({
      message: "Favorite story added successfully.",
      favoriteStories: updatedUser.favoriteStories,
    });
  } catch (err) {
    console.error("Error adding favorite story:", err);
    res.status(500).json({ error: err.message });
  }
};
//retrive favorite stories
exports.getFavoriteStories = async (req, res) => {
  try {
    // Ensure the child is authenticated.
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: "User not authenticated." });
    }

    // Find the child document by ID and populate the favoriteStories field.
    const child = await User.findById(req.user.userId).populate("favoriteStories");
    if (!child) {
      return res.status(404).json({ error: "Child not found." });
    }

    // Return the favorite stories
    res.status(200).json({ favoriteStories: child.favoriteStories });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

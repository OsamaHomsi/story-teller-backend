const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const multer = require("multer");
const upload = multer({ dest: "/uploads" });
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const parentController = require("./Controllers/parentController");
const adminController = require("./Controllers/adminController");
const childController = require("./Controllers/childController");
const tokenController = require("./Controllers/tokenController");
const storyController = require("./Controllers/storyController");
const videoController = require("./Controllers/videoController");
const quizController = require("./Controllers/quizController");
const notificationController = require("./Controllers/notficationController");
const DB = "mongodb://localhost:27017/Seniour";

mongoose
  .connect(DB, {
    useNewUrlParser: true,
  })
  .then(() => console.log("DB connection successful"))
  .catch((err) => console.error("DB connection error:", err));
app.use(express.json());

app.use("/uploads", express.static("uploads"));
//auth routes
app.post("/signUp", parentController.signUp);
app.post("/login", parentController.login);

app.post("/createChild", tokenController.verifyToken, childController.createChild);
app.post("/childLogin", childController.childLogin);

app.post("/adminSignUp", adminController.adminSignUp);
app.post("/adminLogin", adminController.adminLogin);
//increase child level
app.post("/incLvl", tokenController.verifyToken, childController.increaseChildLevel);
//get level
app.get("/getLvl", tokenController.verifyToken, childController.getLevel);
//######################//////

//story routes

//admin upload Story
app.post("/uploadStory", tokenController.verifyToken, storyController.createStory);
// Get all stories
app.get("/getStories", storyController.getAllStories);
// Get a specific story by ID
app.get("/getStory/:id", storyController.getStoryById);
//push story from parent to child
app.post("/pushStory", tokenController.verifyToken, storyController.pushStoryToChild);
//get pushed stories to child
app.get("/getPushedStories", tokenController.verifyToken, storyController.getChildPushedStories);
//save story from AI
app.post("/saveStory", tokenController.verifyToken, storyController.createAndPushStory);
//search for a story using title
app.get("/getStoryBytitle", storyController.searchStoriesByTitle);
//add story to favorite
app.post("/addFav", tokenController.verifyToken, storyController.addFavoriteStory);
//get favorite stories
app.get("/getFav", tokenController.verifyToken, storyController.getFavoriteStories);
//######################///////

//video routes
//admin upload videos
app.post("/uploadVideo", tokenController.verifyToken, videoController.uploadVideo);
//parent get all videos
app.get("/getVideos", videoController.getAllVideos);
//parent get a video
app.get("/getVideo/:id", videoController.getVideoById);
//push video to child
app.post("/pushVideo", tokenController.verifyToken, videoController.pushVideoToChild);
//get all pushed video
app.get("/getPushedVideos", tokenController.verifyToken, videoController.getChildPushedVideos);

//quiz route
app.post("/uploadQuiz", tokenController.verifyToken, quizController.createQuizQuestion);
app.get("/getQuizzes", quizController.getAllQuizQuestions);
app.get("/getQuiz/:id", quizController.getQuizQuestionById);
//notification
app.post("/notify", tokenController.verifyToken, notificationController.createNotification);
app.get(
  "/getNotify",
  tokenController.verifyToken,
  notificationController.getNotificationsForParent
);
// Start server on port 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;

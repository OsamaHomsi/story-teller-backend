const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "photos") {
      cb(null, "uploads/photos");
    } else if (file.fieldname === "audio") {
      cb(null, "uploads/audios");
    } else {
      cb(new Error("Unexpected field"), null);
    }
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /^image\/.*/;
  const allowedAudioTypes = /^audio\/.*/;
  const allowedVideoTypes = /^video\/.*/;

  if (
    allowedImageTypes.test(file.mimetype) ||
    allowedAudioTypes.test(file.mimetype) ||
    allowedVideoTypes.test(file.mimetype)
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only image and audio files are allowed"), false);
  }
};
// Define storage location and naming convention
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/videos"); // Ensure this folder exists
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Filter only video files
const videoFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("video/")) {
    cb(null, true);
  } else {
    cb(new Error("Only video files are allowed"), false);
  }
};

exports.videoUpload = multer({ storage: videoStorage, fileFilter: videoFilter });

exports.combinedUpload = multer({ storage, fileFilter });

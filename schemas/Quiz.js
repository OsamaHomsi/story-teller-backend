const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }], // Array of 3 options
  correctAnswer: { type: String, required: true }, // Correct option
  category: { type: String }, // Can be general knowledge, ethics, math, etc.
  difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "easy" }, // Difficulty level
  createdAt: { type: Date, default: Date.now },
});

const Quiz = mongoose.model("Quiz", quizSchema);
module.exports = Quiz;

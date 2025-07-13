const Quiz = require("../schemas/Quiz");

exports.createQuizQuestion = async (req, res) => {
  try {
    const { questionText, options, correctAnswer, category, difficulty } = req.body;

    if (options.length !== 3) {
      return res.status(400).json({ message: "There must be exactly 3 options" });
    }

    if (!options.includes(correctAnswer)) {
      return res.status(400).json({ message: "Correct answer must be one of the options" });
    }

    const newQuiz = new Quiz({
      questionText,
      options,
      correctAnswer,
      category,
      difficulty,
    });

    await newQuiz.save();
    res.status(201).json({ message: "Quiz question created successfully", quiz: newQuiz });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.getAllQuizQuestions = async (req, res) => {
  try {
    const quizzes = await Quiz.find();
    res.status(200).json({ quizzes });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.getQuizQuestionById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz question not found" });
    }
    res.status(200).json({ quiz });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

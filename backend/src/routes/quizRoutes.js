const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const User = require('../models/User');
const { protect, admin } = require('../middleware/auth');

// @desc    Create a new quiz
// @route   POST /api/quizzes
// @access  Private (Admin Only)
router.post('/', protect, admin, async (req, res) => {
  try {
    const { title, subject, pointsForCompletion, questions } = req.body;

    if (!title || !subject || !questions || !Array.isArray(questions)) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const quiz = await Quiz.create({
      title,
      subject,
      pointsForCompletion: pointsForCompletion || 50,
      questions
    });

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: quiz
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create quiz: ' + error.message
    });
  }
});

// @desc    Delete a quiz
// @route   DELETE /api/quizzes/:id
// @access  Private (Admin Only)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    await QuizAttempt.deleteMany({ quiz: req.params.id });
    await quiz.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete quiz: ' + error.message
    });
  }
});

// @desc    Get active quizzes for today
// @route   GET /api/quizzes
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const quizzes = await Quiz.find({ isActive: true });
    res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quizzes: ' + error.message
    });
  }
});

// @desc    Get global state-wide leaderboard
// @route   GET /api/quizzes/leaderboard
// @access  Private
router.get('/leaderboard', protect, async (req, res) => {
  try {
    const topUsers = await User.find({ role: 'user' })
      .select('name streak totalPoints email')
      .sort({ totalPoints: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: topUsers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard: ' + error.message
    });
  }
});

// @desc    Submit answers for a quiz, evaluate score, update streak, increment points
// @route   POST /api/quizzes/:id/submit
// @access  Private
router.post('/:id/submit', protect, async (req, res) => {
  try {
    const { answers } = req.body; // Array of selected option indices (0-3)
    const quizId = req.params.id;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: 'Please provide selected answers' });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    let score = 0;
    const questionsCount = quiz.questions.length;

    // Calculate score
    quiz.questions.forEach((q, idx) => {
      if (answers[idx] !== undefined && answers[idx] === q.correctOptionIndex) {
        score += 1;
      }
    });

    // Gamified point scoring (10 points per right answer + 50 points completion bonus)
    const pointsEarned = (score * 10) + quiz.pointsForCompletion;

    // Retrieve active student
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Daily Streak Logic (Calendar Day Comparison)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let currentStreak = user.streak || 0;
    const lastActive = user.lastActiveDate;

    if (lastActive) {
      const lastActiveDateOnly = new Date(lastActive);
      lastActiveDateOnly.setHours(0, 0, 0, 0);
      
      const diffTime = Math.abs(today - lastActiveDateOnly);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Active yesterday -> Increment streak
        currentStreak += 1;
      } else if (diffDays > 1) {
        // Inactive since day before yesterday -> Reset to 1
        currentStreak = 1;
      }
      // If diffDays === 0, they already submitted today -> Keep current streak
    } else {
      // First time starting
      currentStreak = 1;
    }

    // Update User Gamified Stats
    user.streak = currentStreak;
    user.lastActiveDate = new Date();
    user.totalPoints = (user.totalPoints || 0) + pointsEarned;
    await user.save();

    // Persist attempt record
    const attempt = await QuizAttempt.create({
      user: req.user.id,
      quiz: quizId,
      score,
      totalQuestions: questionsCount,
      pointsEarned,
      answers
    });

    res.status(200).json({
      success: true,
      message: 'Quiz submitted and graded successfully',
      data: {
        attemptId: attempt._id,
        score,
        totalQuestions: questionsCount,
        pointsEarned,
        streak: currentStreak,
        totalPoints: user.totalPoints,
        correctAnswers: quiz.questions.map(q => q.correctOptionIndex)
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Evaluation failed: ' + error.message
    });
  }
});

// @desc    Seed default high-fidelity practice quizzes (Admin or User access)
// @route   POST /api/quizzes/seed
// @access  Private
router.post('/seed', protect, async (req, res) => {
  try {
    // Delete existing quizzes to ensure clean seed
    await Quiz.deleteMany({});

    const seededQuizzes = await Quiz.create([
      {
        title: 'ગુજરાતી વ્યાકરણ - સંધિ અને જોડણી (Sandhi & Spelling)',
        subject: 'Gujarati Grammer',
        pointsForCompletion: 50,
        questions: [
          {
            questionText: 'નીચેનામાંથી કઈ જોડણી શુદ્ધ/સાચી છે?',
            options: ['કીર્તિ', 'કિર્તી', 'કીર્તી', 'કિર્તિ'],
            correctOptionIndex: 0,
            explanation: 'કિર્તિ શબ્દમાં કી દીર્ઘ અને ર્તિ હસ્વ હોવું સાચું છે (કીર્તિ).'
          },
          {
            questionText: '‘મન્વંતર’ શબ્દની સાચી સંધિ કઈ છે?',
            options: ['મનુ + અંતર', 'મન + વંતર', 'મનન + અંતર', 'મનુ + વંતર'],
            correctOptionIndex: 0,
            explanation: 'સંધિ નિયમ મુજબ ઉ + અ = વ બને છે, તેથી મનુ + અંતર = મન્વંતર.'
          },
          {
            questionText: '‘નયન’ શબ્દની સંધિ છોડો.',
            options: ['ને + અન', 'ન + યન', 'નય + અન', 'નૈ + અન'],
            correctOptionIndex: 0,
            explanation: 'અય્ પ્રત્યય મુજબ એ + અ = અય્ બને છે, તેથી ને + અન = નયન.'
          },
          {
            questionText: 'નીચેનામાંથી કયો શબ્દ સૂર્યનો પર્યાય નથી?',
            options: ['નિશાકર', 'દિનકર', 'ભાસ્કર', 'આદિત્ય'],
            correctOptionIndex: 0,
            explanation: 'દિનકર, ભાસ્કર અને આદિત્ય સૂર્યના પર્યાય છે, જ્યારે નિશાકર એ ચંદ્રનો પર્યાય છે.'
          },
          {
            questionText: '‘હું રાતે વહેલો સૂઈ ગયો.’ આ વાક્યમાં ‘વહેલો’ શું છે?',
            options: ['ક્રિયા વિશેષણ', 'સંજ્ઞા', 'ક્રિયાપદ', 'સર્વનામ'],
            correctOptionIndex: 0,
            explanation: 'સૂવાની ક્રિયાના સમય કે રીતમાં વધારો કરતો હોવાથી ‘વહેલો’ એ ક્રિયા વિશેષણ છે.'
          }
        ]
      },
      {
        title: 'English Grammer - Prepositions & Verb Concord',
        subject: 'English Grammer',
        pointsForCompletion: 50,
        questions: [
          {
            questionText: 'Choose the correct option: She ______ to school every day.',
            options: ['goes', 'go', 'going', 'gone'],
            correctOptionIndex: 0,
            explanation: 'For regular habits in simple present tense, singular subject (She) takes verb with s/es (goes).'
          },
          {
            questionText: 'He is senior ______ me in office.',
            options: ['to', 'than', 'of', 'from'],
            correctOptionIndex: 0,
            explanation: "Adjectives like senior, junior, superior are followed by 'to' instead of 'than'."
          },
          {
            questionText: 'If it ______ tomorrow, we will cancel the picnic.',
            options: ['rains', 'will rain', 'rain', 'rained'],
            correctOptionIndex: 0,
            explanation: "In conditional type 1 sentences, the 'if' clause uses Simple Present tense (rains)."
          },
          {
            questionText: 'Identify the correct spelling:',
            options: ['Committee', 'Commitee', 'Comittee', 'Comite'],
            correctOptionIndex: 0,
            explanation: 'The correct spelling has double m, double t and double e (Committee).'
          },
          {
            questionText: 'He has been living here ______ 2018.',
            options: ['since', 'for', 'from', 'during'],
            correctOptionIndex: 0,
            explanation: "'Since' is used for a specific point in time in perfect continuous tenses."
          }
        ]
      },
      {
        title: 'Reasoning Challenge - તાર્કિક ક્ષમતા કસોટી',
        subject: 'Reasoning',
        pointsForCompletion: 50,
        questions: [
          {
            questionText: 'જો 2, 6, 12, 20, ? તો ખાલી જગ્યા પૂરો.',
            options: ['30', '28', '32', '26'],
            correctOptionIndex: 0,
            explanation: 'શ્રેણીમાં ક્રમશઃ +4, +6, +8 ઉમેરાય છે, તેથી આગામી અંક 20 + 10 = 30 થશે.'
          },
          {
            questionText: 'ગુજરાતના પ્રથમ મુખ્યમંત્રી કોણ હતા?',
            options: ['ડૉ. જીવરાજ મહેતા', 'બળવંતરાય મહેતા', 'ચીમનભાઈ પટેલ', 'હિતેન્દ્ર દેસાઈ'],
            correctOptionIndex: 0,
            explanation: '૧ મે ૧૯૬૦ ના રોજ ગુજરાત સ્થાપના સમયે ડૉ. જીવરાજ મહેતા પ્રથમ મુખ્યમંત્રી બન્યા હતા.'
          },
          {
            questionText: 'જો A = 1, B = 2, તો CAT નો સરવાળો કેટલો થાય?',
            options: ['24', '20', '26', '22'],
            correctOptionIndex: 0,
            explanation: 'C=3, A=1, T=20. સરવાળો: 3 + 1 + 20 = 24.'
          },
          {
            questionText: 'વિશ્વ પર્યાવરણ દિવસ ક્યારે ઉજવવામાં આવે છે?',
            options: ['5 જૂન', '10 ડિસેમ્બર', '22 એપ્રિલ', '16 સપ્ટેમ્બર'],
            correctOptionIndex: 0,
            explanation: '૫ જૂન સમગ્ર વિશ્વમાં પર્યાવરણ જાગૃતિ અને સુરક્ષા માટે ઉજવવામાં આવે છે.'
          },
          {
            questionText: 'નીચેનામાંથી કઈ જોડી તાર્કિક રીતે અલગ પડે છે?',
            options: ['વાહન: ચલાવવું', 'પેન: લખવું', 'પુસ્તક: વાંચવું', 'ખોરાક: રાંધવો'],
            correctOptionIndex: 3,
            explanation: "અન્ય બધી જોડીઓ વસ્તુ અને તેનો સીધો ઉપયોગ દર્શાવે છે (વાહન ચલાવવા, પેન લખવા, પુસ્તક વાંચવા), જ્યારે ખોરાકનો ઉપયોગ 'ખાવો' થાય, રાંધવો એ બનાવવાની ક્રિયા છે."
          }
        ]
      }
    ]);

    res.status(200).json({
      success: true,
      message: 'Seeded 3 high-fidelity MCQ practice quizzes successfully',
      count: seededQuizzes.length,
      data: seededQuizzes
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Seeding practice quizzes failed: ' + error.message
    });
  }
});

module.exports = router;

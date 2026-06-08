const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const Quiz = require('../models/Quiz');
const connectDB = require('../config/db');

const mockQuizzes = [
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
        options: ['ને + અન', 'ન + ยન', 'નય + અન', 'નૈ + અન'],
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
];

const seedQuizzes = async () => {
  try {
    console.log('[Seeder] Connecting to database...');
    await connectDB();

    console.log('[Seeder] Clearing old quizzes...');
    await Quiz.deleteMany({});
    console.log('[Seeder] Cleaned existing quizzes successfully.');

    console.log('[Seeder] Inserting 3 high-fidelity practice quizzes...');
    const inserted = await Quiz.insertMany(mockQuizzes);
    console.log(`[Seeder] Successfully seeded ${inserted.length} practice quizzes!`);

    mongoose.connection.close();
    console.log('[Seeder] Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('[Seeder Failed]:', error.message);
    process.exit(1);
  }
};

seedQuizzes();

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const Material = require('../models/Material');
const connectDB = require('../config/db');

const mockMaterials = [
  // 1. Gujarati Grammer
  {
    title: 'ગુજરાતી વ્યાકરણ માસ્ટર નોટ્સ (Gujarati Grammar PDF)',
    description: 'સંજ્ઞા, વિશેષણ, ક્રિયાપદ, સંધિ અને જોડણીના નિયમોની સવિસ્તર સમજૂતી ધરાવતી પીડીએફ ફાઈલ.',
    category: 'Gujarati Grammer',
    type: 'pdf',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop',
    accessType: 'free',
  },
  {
    title: 'ગુજરાતી જોડણી અને અર્થભેદ વિડીયો કોર્સ',
    description: 'સ્પર્ધાત્મક પરીક્ષાઓમાં અવારનવાર પૂછાતા જોડણીના અઘરા નિયમો વિશેનું લાઈવ લેક્ચર.',
    category: 'Gujarati Grammer',
    type: 'video',
    fileUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop',
    accessType: 'premium',
  },

  // 2. English Grammer
  {
    title: 'English Tenses & Active-Passive Cheat Sheet',
    description: 'Master all 12 English tenses, formulas and direct passive conversions in this quick cheat sheet PDF.',
    category: 'English Grammer',
    type: 'pdf',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    thumbnailUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=600&auto=format&fit=crop',
    accessType: 'free',
  },
  {
    title: 'Direct-Indirect & Idioms Master Class Video',
    description: 'Learn narrative speech and complex grammar clauses with shortcuts designed for high score.',
    category: 'English Grammer',
    type: 'video',
    fileUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop',
    accessType: 'premium',
  },

  // 3. Std 9 Maths
  {
    title: 'Std 9 Maths - Chapter 1 Number Systems PDF',
    description: 'Class 9 Mathematics NCERT Chapter 1 Number Systems step-by-step solved exercises and theory notes.',
    category: 'Std 9 Maths',
    type: 'pdf',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    thumbnailUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=600&auto=format&fit=crop',
    accessType: 'free',
  },
  {
    title: 'Std 9 Maths - Algebra & Polynomials Solved Papers Pack',
    description: 'Exclusive formulas, sample problem sets and board-aligned practice questions ZIP file.',
    category: 'Std 9 Maths',
    type: 'zip',
    fileUrl: 'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-zip-file.zip',
    thumbnailUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=600&auto=format&fit=crop',
    accessType: 'premium',
  },

  // 4. Std 9 Science
  {
    title: 'Std 9 Science - Cell: The Fundamental Unit of Life',
    description: 'Detailed diagrammatic notes of cell structure, organelles, and functions for Std 9 exam.',
    category: 'Std 9 Science',
    type: 'pdf',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    thumbnailUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=600&auto=format&fit=crop',
    accessType: 'free',
  },
  {
    title: 'Std 9 Science - Structure of Atom & Laws of Motion Lecture',
    description: 'Premium video lecture covering sub-atomic particles, electronic configurations, and Newton laws.',
    category: 'Std 9 Science',
    type: 'video',
    fileUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop',
    accessType: 'premium',
  },

  // 5. Std 10 Maths
  {
    title: 'Std 10 Board - Trigonometry Cheat Sheet PDF',
    description: 'All trigonometric ratios, identities, and height & distance formulas compiled in one page.',
    category: 'Std 10 Maths',
    type: 'pdf',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    thumbnailUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=600&auto=format&fit=crop',
    accessType: 'free',
  },
  {
    title: 'Std 10 Maths Board - 50 Most Repeated Board Exam Questions',
    description: 'Premium PDF guide explaining questions with high probability of repeating in Board examinations.',
    category: 'Std 10 Maths',
    type: 'pdf',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    thumbnailUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=600&auto=format&fit=crop',
    accessType: 'premium',
  },

  // 6. Std 10 Science
  {
    title: 'Std 10 Science - Chemical Reactions & Equations Notes',
    description: 'Short summaries, balanced equations, and oxidation/reduction concepts for quick revision.',
    category: 'Std 10 Science',
    type: 'pdf',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    thumbnailUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=600&auto=format&fit=crop',
    accessType: 'free',
  },
  {
    title: 'Std 10 Science - Life Processes & Human Organs Video',
    description: 'Animated digital lesson explaining the digestive, respiratory, circulatory, and excretory systems.',
    category: 'Std 10 Science',
    type: 'video',
    fileUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop',
    accessType: 'premium',
  },

  // 7. Manovigyan
  {
    title: 'મનોવિજ્ઞાન અને બાળ વિકાસની મૂળભૂત બાબતો (Child Psychology)',
    description: 'TET/TAT પરીક્ષા માટે ઉપયોગી બાળ મનોવિજ્ઞાન અને વૃદ્ધિ અને વિકાસના તબક્કાઓની વિગતો.',
    category: 'Manovigyan',
    type: 'pdf',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=600&auto=format&fit=crop',
    accessType: 'free',
  },
  {
    title: 'પિયાજે, વાયગોત્સ્કી અને કોહલબર્ગના સિદ્ધાંતો (Video)',
    description: 'જ્ઞાનાત્મક વિકાસ અને નૈતિક વિકાસના સિદ્ધાંતોનું ઊંડાણપૂર્વક પૃથ્થકરણ કરતો વિડીયો.',
    category: 'Manovigyan',
    type: 'video',
    fileUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop',
    accessType: 'premium',
  },

  // 8. Pedagogy
  {
    title: 'શિક્ષણશાસ્ત્ર અને અધ્યાપન પદ્ધતિઓ (Pedagogy Theory)',
    description: 'નવી શિક્ષણ નીતિ ૨૦૨૦ (NEP) અને વર્ગવ્યવહારના સિદ્ધાંતો દર્શાવતી સચોટ પીડીએફ.',
    category: 'Pedagogy',
    type: 'pdf',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    thumbnailUrl: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=600&auto=format&fit=crop',
    accessType: 'free',
  },
  {
    title: 'TET/TAT પેડાગોજી ૫૦૦+ પ્રશ્નોત્તરી બેંક (Practice MCQ ZIP)',
    description: 'અધ્યાપન શાસ્ત્રના અતિ મહત્વના પૂછાઈ શકે તેવા વૈકલ્પિક પ્રશ્નોનું સોલ્યુશન સેટ.',
    category: 'Pedagogy',
    type: 'zip',
    fileUrl: 'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-zip-file.zip',
    thumbnailUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=600&auto=format&fit=crop',
    accessType: 'premium',
  },

  // 9. Reasoning
  {
    title: 'દિશા-અંતર અને લોહીના સંબંધો (Reasoning Solved Puzzles)',
    description: 'દિશા અને લોહીના સંબંધો (Blood Relations) ની પાયાની ટ્રીક્સ અને સોલ્વ કરેલા દાખલા.',
    category: 'Reasoning',
    type: 'pdf',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop',
    accessType: 'free',
  },
  {
    title: 'રીઝનીંગ શોર્ટકટ્સ - સિલોજિઝમ અને બેઠક વ્યવસ્થા ટ્રીક્સ',
    description: 'Syllogism, Sitting Arrangement, અને શ્રેણી (Series) ના પ્રશ્નો ૨ સેકન્ડમાં ઉકેલવાની રીતો.',
    category: 'Reasoning',
    type: 'video',
    fileUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop',
    accessType: 'premium',
  },

  // 10. Maths
  {
    title: 'ગણિતની શોર્ટકટ ટ્રીક્સ - ટકાવારી અને નફો-નુકસાન',
    description: 'ટકાવારી (Percentage) અને નફો-નુકસાન (Profit/Loss) ના જટિલ કોયડાઓ ઉકેલવાની શાનદાર વિધિ.',
    category: 'Maths',
    type: 'pdf',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    thumbnailUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=600&auto=format&fit=crop',
    accessType: 'free',
  },
  {
    title: 'સ્પર્ધાત્મક અંકગણિત સંપૂર્ણ વિડીયો ક્રેશ કોર્સ',
    description: 'વ્યાજબી વ્યાજ, કામ અને સમય, સરેરાશ અને અંતર-સમય પ્રકરણના વિડીયો લેક્ચર્સ.',
    category: 'Maths',
    type: 'video',
    fileUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop',
    accessType: 'premium',
  },

  // 11. GK
  {
    title: 'ગુજરાતનો ઇતિહાસ, ભૂગોળ અને વારસો ટૂંકી નોંધો',
    description: 'ગુજરાતના જિલ્લાઓ, સાહિત્યિક વારસો અને સોલંકી વંશના ઇતિહાસની પ્રીમિયમ વન-લાઇનર પીડીએફ.',
    category: 'GK',
    type: 'pdf',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    thumbnailUrl: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=600&auto=format&fit=crop',
    accessType: 'free',
  },
  {
    title: 'વર્તમાન પ્રવાહો માસિક સંકલન (Monthly Current Affairs)',
    description: 'તમામ સ્પર્ધાત્મક પરીક્ષાઓ માટે ઉપયોગી રાષ્ટ્રીય અને આંતરરાષ્ટ્રીય સ્તરના મહત્વના બનાવો.',
    category: 'GK',
    type: 'pdf',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    thumbnailUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=600&auto=format&fit=crop',
    accessType: 'premium',
  },

  // 12. Others
  {
    title: 'સ્પર્ધાત્મક પરીક્ષા ટાઇમ મેનેજમેન્ટ અને સિલેબસ વિગત',
    description: 'પરીક્ષાઓ ક્રેક કરવા માટે શ્રેષ્ઠ ટાઈમ ટેબલ બનાવવાની અને વાંચન કઈ રીતે કરવું તેની માર્ગદર્શિકા.',
    category: 'Others',
    type: 'pdf',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    thumbnailUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=600&auto=format&fit=crop',
    accessType: 'free',
  },
  {
    title: 'TAT & TET સંપૂર્ણ મોક ટેસ્ટ પેપર સેટ (ZIP Package)',
    description: 'તમામ વિષયોના ઉત્તરો અને વિસ્તૃત સોલ્યુશન સાથેના ૨૦ મોક ટેસ્ટ પેપરનો સંગ્રહ.',
    category: 'Others',
    type: 'zip',
    fileUrl: 'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-zip-file.zip',
    thumbnailUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=600&auto=format&fit=crop',
    accessType: 'premium',
  },
];

const seedData = async () => {
  try {
    console.log('[Seeder] Connecting to database...');
    await connectDB();

    console.log('[Seeder] Clearing old study materials...');
    await Material.deleteMany({});
    console.log('[Seeder] Cleaned existing materials successfully.');

    console.log('[Seeder] Inserting 24 new high-fidelity materials...');
    const inserted = await Material.insertMany(mockMaterials);
    console.log(`[Seeder] Successfully seeded ${inserted.length} study materials!`);

    mongoose.connection.close();
    console.log('[Seeder] Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('[Seeder Failed]:', error.message);
    process.exit(1);
  }
};

seedData();

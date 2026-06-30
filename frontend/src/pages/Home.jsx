import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Sparkles, Video, FileDown, ArrowRight, Languages, Percent, FlaskConical, Binary, Atom, Brain, GraduationCap, Lightbulb, Calculator, Globe, FolderOpen, Phone, Mail, Heart, Share2, Award } from 'lucide-react';

export default function Home() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const categories = [
    { name: 'Gujarati Grammer', icon: BookOpen, color: 'from-orange-500 to-rose-600', desc: 'ગુજરાતી વ્યાકરણ અને સાહિત્ય લક્ષી નોટ્સ' },
    { name: 'English Grammer', icon: Languages, color: 'from-blue-500 to-indigo-600', desc: 'English tenses, active-passive & idioms' },
    { name: 'Std 9 Maths', icon: Percent, color: 'from-emerald-500 to-teal-600', desc: 'ધોરણ ૯ ગણિત પ્રકરણ-વાર સોલ્યુશન્સ' },
    { name: 'Std 9 Science', icon: FlaskConical, color: 'from-purple-500 to-pink-600', desc: 'ધોરણ ૯ વિજ્ઞાન અને ટેકનોલોજી પ્રયોગો' },
    { name: 'Std 9 SS', icon: Globe, color: 'from-orange-400 to-amber-600', desc: 'ધોરણ ૯ સામાજિક વિજ્ઞાન સોલ્યુશન્સ' },
    { name: 'Std 10 Maths', icon: Binary, color: 'from-cyan-500 to-blue-600', desc: 'ધોરણ ૧૦ બોર્ડ ગણિત આઈએમપી પ્રશ્નો' },
    { name: 'Std 10 Science', icon: Atom, color: 'from-rose-500 to-red-600', desc: 'ધોરણ ૧૦ વિજ્ઞાન મહત્વના પ્રશ્નોત્તરી' },
    { name: 'Std 10 SS', icon: Globe, color: 'from-amber-500 to-rose-500', desc: 'ધોરણ ૧૦ સામાજિક વિજ્ઞાન આઈએમપી પ્રશ્નો' },
    { name: 'Manovigyan', icon: Brain, color: 'from-violet-500 to-purple-600', desc: 'TET/TAT મનોવિજ્ઞાન અને બાળ વિકાસ' },
    { name: 'Pedagogy', icon: GraduationCap, color: 'from-fuchsia-500 to-pink-600', desc: 'અધ્યાપન પદ્ધતિઓ અને વર્ગવ્યવહાર' },
    { name: 'Reasoning', icon: Lightbulb, color: 'from-amber-500 to-orange-600', desc: 'કોડિંગ, દિશા-અંતર અને તાર્કિક કોયડા' },
    { name: 'Maths', icon: Calculator, color: 'from-teal-500 to-emerald-600', desc: 'સ્પર્ધાત્મક અંકગણિત શોર્ટકટ ટ્રીક્સ' },
    { name: 'GK', icon: Globe, color: 'from-sky-500 to-blue-600', desc: 'ગુજરાત સામાન્ય જ્ઞાન અને વર્તમાન પ્રવાહો' },
    { name: 'TAT', icon: Sparkles, color: 'from-fuchsia-500 to-indigo-650', desc: 'TAT પરીક્ષાનું સંપૂર્ણ સાહિત્ય અને પેપર્સ' },
    { name: 'TET', icon: Award, color: 'from-rose-500 to-pink-600', desc: 'TET ૧ અને ૨ માટે ઉપયોગી મટીરીયલ્સ' },
    { name: 'Std 6', icon: GraduationCap, color: 'from-emerald-500 to-teal-600', desc: 'ધોરણ ૬ અભ્યાસક્રમ અને પુસ્તકો' },
    { name: 'Std 7', icon: GraduationCap, color: 'from-teal-500 to-cyan-600', desc: 'ધોરણ ૭ અભ્યાસક્રમ અને પુસ્તકો' },
    { name: 'Std 8', icon: GraduationCap, color: 'from-cyan-500 to-sky-600', desc: 'ધોરણ ૮ અભ્યાસક્રમ અને પુસ્તકો' },
    { name: 'Others', icon: FolderOpen, color: 'from-slate-500 to-slate-600', desc: 'અન્ય ઉપયોગી ફાઈલો અને મોક પેપર્સ' },
    { name: 'Teachers Material (Maths Science)', icon: GraduationCap, color: 'from-emerald-500 to-teal-600', desc: 'શિક્ષકો માટે ગણિત અને વિજ્ઞાનનું સાહિત્ય' },
    { name: 'Others (For Teachers)', icon: FolderOpen, color: 'from-indigo-500 to-purple-600', desc: 'શિક્ષકો માટે અન્ય ઉપયોગી મટીરીયલ્સ' },
  ];

  const handleShareApp = async () => {
    const downloadLink = 'https://github.com/meetbhai78/premium-study-platform/releases/latest/download/app-debug.apk';
    try {
      await navigator.share({
        title: 'EDUCATION07_ - Premium Study Material App',
        text: 'EDUCATION07_ એપ ડાઉનલોડ કરો! ધોરણ 6 થી 10 અને સરકારી પરીક્ષાઓની શ્રેષ્ઠ તૈયારી. PDFs, Videos, Quizzes - બધું એક જ જગ્યાએ.',
        url: downloadLink,
      });
    } catch (err) {
      // Fallback: WhatsApp share
      const msg = encodeURIComponent(`EDUCATION07_ - Premium Study Material App 📚\n\nધોરણ 6 થી 10 અને સરકારી પરીક્ષાઓની શ્રેષ્ઠ તૈયારી.\nPDFs, Videos, Daily Quizzes - બધું Free!\n\nડાઉનલોડ લિંક 👉 ${downloadLink}`);
      window.open(`https://wa.me/?text=${msg}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-darkbg-100 transition-colors flex flex-col">
      {/* ===== SEO HELMET ===== */}
      <Helmet>
        <title>EDUCATION07_ | TET TAT Std 6-10 Study Material Gujarat | Free Premium PDF Notes</title>
        <meta name="description" content="EDUCATION07_ - Gujarat Board Std 6 to 10 ના PDF Notes, TET TAT Manovigyan Pedagogy Reasoning GK. ₹99 માં Premium Access. ધોરણ 9-10 IMP Questions, Gujarati English Maths Science." />
        <meta name="keywords" content="TET study material Gujarat, TAT preparation, ધોરણ 10 IMP questions, Std 9 10 PDF notes Gujarat, Manovigyan TET TAT, Pedagogy notes Gujarati, Gujarat GK, education07" />
        <link rel="canonical" href="https://education07.in/" />
        <meta property="og:title" content="EDUCATION07_ | Premium Study Materials for TET TAT & Gujarat Board" />
        <meta property="og:description" content="ધોરણ 6 થી 10 અને TET TAT સ્પર્ધાત્મક પરીક્ષા માટે PDFs, Videos, Mock Tests. ₹99 Only." />
        <meta property="og:url" content="https://education07.in/" />
        <meta property="og:image" content="https://education07.in/study_banner.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="EDUCATION07_ | TET TAT & Gujarat Board Study Materials" />
        <meta name="twitter:description" content="Std 6-10, TET, TAT, Manovigyan, Pedagogy PDFs at ₹99. Gujarat's #1 Digital Study Platform." />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://education07.in/" },
            { "@type": "ListItem", "position": 2, "name": "Study Materials", "item": "https://education07.in/materials" }
          ]
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "EDUCATION07_ platform shun offer kare che?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "EDUCATION07_ Gujarat Board Std 6 to 10 na PDF notes, TET TAT preparation material, Manovigyan, Pedagogy, Reasoning, GK, Video Tutorials ane Mock Tests provide kare che. Rs 99 ma premium access male che."
              }
            },
            {
              "@type": "Question",
              "name": "TET TAT na study materials kyatha malse?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "EDUCATION07_ platform par TET 1, TET 2, TAT Secondary na Manovigyan, Pedagogy, Reasoning, Gujarat GK, Gujarati Grammar, English Grammar na complete PDF notes ane video tutorials malse."
              }
            },
            {
              "@type": "Question",
              "name": "Premium access ni kimat keti che?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Sirf Rs 99 ma ek vakhani payment karva thi tamne lifetime premium access male che. Koi monthly subscription nathi."
              }
            }
          ]
        })}</script>
      </Helmet>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-purple-500/5 via-transparent to-transparent">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-r from-premium-500/10 to-indigo-500/10 blur-3xl opacity-50 rounded-full" />
          
          <div className="relative max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-premium-500/10 px-4 py-1.5 text-xs font-bold text-premium-600 dark:text-premium-300">
              <Sparkles className="h-4 w-4 text-premium-500 fill-premium-500" />
              EDUCATION07_ — તમારી તૈયારીનો વિશ્વાસુ સાથી
            </div>
   
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-800 dark:text-white font-sans">
              Premium Study Materials <br />
              <span className="bg-gradient-to-r from-premium-500 via-pink-500 to-indigo-500 bg-clip-text text-transparent">
                Unlocked at ₹99 Only
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-700 dark:text-slate-350 leading-relaxed font-medium">
              ધોરણ 6 થી 10, Std 6 to 8 અને સરકારી પરીક્ષાઓ (TET, TAT, વગેરે) માટે organized PDFs, video tutorials, mock tests, અને ZIP files. Gujarati Grammer, English, Maths, Science, Manovigyan, Pedagogy, Reasoning, અને GK.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 rounded-2xl bg-premium-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-premium-500/25 hover:bg-premium-600 hover:-translate-y-0.5 transition-all w-full sm:w-auto"
                >
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="flex items-center justify-center gap-2 rounded-2xl bg-premium-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-premium-500/25 hover:bg-premium-600 hover:-translate-y-0.5 transition-all w-full sm:w-auto"
                  >
                    Start Learning Free
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/login"
                    className="flex items-center justify-center rounded-2xl bg-white dark:bg-slate-800 px-6 py-3.5 text-sm font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 hover:-translate-y-0.5 transition-all w-full sm:w-auto shadow-sm"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white">
              Targeted Syllabus Coverage
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
              Browse through curated materials prepared by platform subject experts.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <div
                key={cat.name}
                onClick={() => isAuthenticated ? navigate(`/materials?category=${encodeURIComponent(cat.name)}`) : navigate('/register')}
                className="glass premium-card rounded-3xl p-5 border border-slate-200/50 dark:border-slate-800/50 flex flex-col justify-between h-48 cursor-pointer hover:scale-[1.02] hover:shadow-lg hover:border-premium-400/30 transition-all group"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl text-white bg-gradient-to-tr shadow-md shadow-slate-900/5 dark:shadow-none group-hover:scale-110 transition-transform">
                  <div className={`flex h-full w-full items-center justify-center rounded-2xl bg-gradient-to-tr ${cat.color}`}>
                    <cat.icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 group-hover:text-premium-500 transition-colors">{cat.name}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-350 mt-1 font-medium">{cat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Feature Highlights */}
        <section className="border-t border-slate-200/50 dark:border-slate-800/50 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-500">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">Premium Vault</h3>
              <p className="text-xs text-slate-600 dark:text-slate-350 max-w-xs font-medium">
                Unlock PDFs, code archives, ZIP templates, and detailed solution booklets instantly.
              </p>
            </div>

            <div className="flex flex-col items-center space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-400/10 border border-purple-400/20 text-purple-500">
                <Video className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">Video Tutorials</h3>
              <p className="text-xs text-slate-600 dark:text-slate-350 max-w-xs font-medium">
                Stream clear chapter videos directly inside your dashboard browser window.
              </p>
            </div>

            <div className="flex flex-col items-center space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/10 border border-emerald-400/20 text-emerald-500">
                <FileDown className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">Direct Downloads</h3>
              <p className="text-xs text-slate-600 dark:text-slate-350 max-w-xs font-medium">
                Download assets directly to your device. Full support for Android offline reading.
              </p>
            </div>
          </div>
        </section>

        {/* Premium Banner */}
        <section className="bg-gradient-to-tr from-premium-600 to-indigo-700 py-16 px-4 text-center text-white">
          <div className="max-w-2xl mx-auto space-y-6">
            <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider">
              Limited Time Offer
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold">All-Access Premium Pass</h2>
            <p className="text-sm text-purple-100 max-w-lg mx-auto">
              Pay ₹99 only. No recurring subscriptions, no processing fees. Remove ads, enable all downloads, and view premium mock papers.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to={isAuthenticated ? '/payment' : '/register'}
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-extrabold text-premium-600 shadow-xl shadow-slate-900/10 hover:bg-slate-50 hover:-translate-y-0.5 transition-all"
              >
                Get Premium Access Now
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                onClick={handleShareApp}
                className="inline-flex items-center gap-2 rounded-2xl bg-white/15 border border-white/25 px-5 py-3 text-sm font-bold text-white hover:bg-white/25 transition-all"
              >
                <Share2 className="h-4 w-4" />
                Share with Friends
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-darkbg-200 text-white py-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 pb-8 border-b border-slate-800">
            {/* Brand */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-premium-500 to-indigo-600 text-white font-extrabold text-xs shadow-md">
                  ED
                </div>
                <span className="font-bold text-lg">EDUCATION07_</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                ધોરણ 6 થી 10 અને સરકારી સ્પર્ધાત્મક પરીક્ષાઓ (TET, TAT) માટેનું ગુજરાતનું શ્રેષ્ઠ ડિજિટલ અભ્યાસ પ્લેટફોર્મ.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-slate-300 uppercase tracking-wider">Quick Links</h3>
              <div className="flex flex-col gap-2 text-xs text-slate-400">
                <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
                <Link to="/register" className="hover:text-white transition-colors">Create Account</Link>
                {isAuthenticated && <Link to="/materials" className="hover:text-white transition-colors">Study Library</Link>}
                {isAuthenticated && <Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>}
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-slate-300 uppercase tracking-wider">Contact & Support</h3>
              <div className="flex flex-col gap-2.5 text-xs text-slate-400">
                <a href="tel:9727353339" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Phone className="h-3.5 w-3.5 text-emerald-500" />
                  Admin: 9727353339
                </a>
                <a href="mailto:meetberani78@gmail.com" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Mail className="h-3.5 w-3.5 text-indigo-400" />
                  meetberani78@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-slate-450">
            <p>© 2026 EDUCATION07_. All rights reserved.</p>
            <p className="flex items-center gap-1">
              Made with <Heart className="h-3 w-3 text-rose-500 fill-rose-500" /> by Meet Berani
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

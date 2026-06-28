import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Trophy, 
  Volume2, 
  Compass, 
  ArrowRight, 
  LockKeyhole, 
  Loader2, 
  CheckCircle, 
  Eye, 
  EyeOff, 
  Mail, 
  MapPin, 
  Phone, 
  Check, 
  Users, 
  Activity, 
  Zap, 
  ShieldAlert,
  ArrowUpRight,
  ChevronRight,
  Play,
  Pause,
  Clock,
  Target,
  Sliders,
  RefreshCw,
  AlertCircle,
  Terminal,
  Flame,
  Cpu,
  Lock,
  Crown
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
const DEMO_CREDENTIALS = {
  email: "demo@synergy.com",
  password: "synergy_demo_2026",
  name: "Alex Mercer",
  role: "Principal Crisis Coordinator at Global Tech"
};

const loginUser = async (email: string, password: string) => {
  const trimmedEmail = email.trim();
  if (trimmedEmail.toLowerCase() === DEMO_CREDENTIALS.email.toLowerCase() && password === DEMO_CREDENTIALS.password) {
    return {
      user: {
        uid: "demo-user-alex-mercer",
        email: DEMO_CREDENTIALS.email,
        displayName: DEMO_CREDENTIALS.name,
        emailVerified: true
      },
      isDemo: true
    };
  }
  throw { code: "auth/invalid-credential" };
};

interface LandingPageProps {
  onLoginSuccess: (user: any, profileData?: any) => void;
}

export default function LandingPage({ onLoginSuccess }: LandingPageProps) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Active Interactive Feature Tab
  const [activeFeature, setActiveFeature] = useState<"arena" | "rescue" | "wave" | "synth" | "mind" | "autonomy">("arena");

  // Focus Synth Interactive State
  const [synthSound, setSynthSound] = useState<"alpha" | "quantum" | "lofi">("alpha");
  const [isSynthPlaying, setIsSynthPlaying] = useState(false);
  const [synthTimer, setSynthTimer] = useState(1500); // 25 mins in seconds

  // Rescue Hub Simulation State
  const [rescueStatus, setRescueStatus] = useState<"warning" | "loading" | "resolved">("warning");

  // Cognitive Wave Timeline State
  const [selectedTime, setSelectedTime] = useState<"8am" | "10am" | "3pm" | "8pm">("10am");

  // Clarity Converter Simulation State
  const [converterState, setConverterState] = useState<"idle" | "converting" | "finished">("idle");

  // Autonomy Calibration State
  const [autonomyLevel, setAutonomyLevel] = useState<"manual" | "copilot" | "autonomous">("copilot");

  // Sound Synth Timer Tick Effect
  useEffect(() => {
    let interval: any;
    if (isSynthPlaying) {
      interval = setInterval(() => {
        setSynthTimer((prev) => {
          if (prev <= 1) {
            setIsSynthPlaying(false);
            return 1500;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSynthPlaying]);

  const formatSynthTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleRescueDeploy = () => {
    setRescueStatus("loading");
    setTimeout(() => {
      setRescueStatus("resolved");
    }, 1500);
  };

  const handleClarityConvert = () => {
    setConverterState("converting");
    setTimeout(() => {
      setConverterState("finished");
    }, 1200);
  };

  // Contact Form State
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);

  // Autofill Demo Account Helper
  const handleAutofillDemo = () => {
    setEmail(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
    setErrorMessage("");
  };

  // Submit Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await loginUser(email, password);
      setLoginSuccess(true);
      setTimeout(() => {
        setIsLoading(false);
        setIsLoginModalOpen(false);
        // Map user to local storage profile structure if it's the demo account
        if (result.isDemo) {
          onLoginSuccess(result.user, {
            name: DEMO_CREDENTIALS.name,
            role: DEMO_CREDENTIALS.role,
            subscriptionTier: "Priority Executive"
          });
        } else {
          onLoginSuccess(result.user);
        }
      }, 1000);
    } catch (error: any) {
      setIsLoading(false);
      console.error("Login submission error:", error);
      
      // Map standard Firebase Auth error codes to user friendly messages
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        setErrorMessage("Invalid email or password. Feel free to use the Quick Autofill Demo button below.");
      } else if (error.code === "auth/invalid-email") {
        setErrorMessage("The email address format is invalid.");
      } else {
        setErrorMessage(error.message || "An authentication error occurred. Please try again.");
      }
    }
  };

  // Contact Submit
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) return;

    setContactLoading(true);
    setTimeout(() => {
      setContactLoading(false);
      setContactSubmitted(true);
      setContactName("");
      setContactEmail("");
      setContactMessage("");
    }, 1200);
  };

  // Smooth scroll helper
  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 selection:bg-orange-500/10 selection:text-[#FF5416] font-sans antialiased overflow-x-hidden">
      
      {/* HEADER NAVBAR */}
      <header className="sticky top-0 z-40 bg-[#FDFDFD]/90 backdrop-blur-md border-b border-slate-100 px-4 sm:px-6 py-3 sm:py-4 transition-all">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-1.5 sm:gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-tr from-[#FF5416] to-[#FF8A00] rounded-xl flex items-center justify-center text-white shadow-md shadow-orange-500/10">
              <Compass className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            </div>
            <span className="text-lg sm:text-xl font-black tracking-tight bg-gradient-to-r from-slate-900 to-slate-800 bg-clip-text text-transparent">
              LM<span className="text-[#FF5416]">.LifeSaver</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToId("features")} className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">Features</button>
            <button onClick={() => scrollToId("about")} className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">About Philosophy</button>
            <button onClick={() => scrollToId("pricing")} className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">Pricing</button>
            <button onClick={() => scrollToId("contact")} className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">Contact</button>
          </nav>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsLoginModalOpen(true)}
              className="px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-black text-white bg-[#FF5416] hover:bg-[#E0440D] transition-all shadow-lg shadow-orange-500/10 flex items-center gap-1.5"
            >
              <span>Launch<span className="hidden sm:inline"> Console</span></span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-24 md:py-32 px-6 overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[350px] bg-gradient-to-tr from-amber-400/10 to-orange-500/5 rounded-full blur-[140px] pointer-events-none -z-10" />
        
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 px-3.5 py-1 rounded-full text-xs font-extrabold text-[#FF5416] uppercase tracking-wider"
          >
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            Beyond Simple Task Management
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-slate-950 leading-[1.08]"
          >
            A High-Performance <br/>
            <span className="bg-gradient-to-r from-[#FF5416] via-amber-500 to-amber-600 bg-clip-text text-transparent">Cognitive Workspace</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto text-base sm:text-lg text-slate-500 font-medium leading-relaxed"
          >
            Stop listing tasks. Start orchestrating flow. Catalyst OS combines predictive burnout sensors, spatial focus soundscapes, and gamified league mechanics to align your cognitive focus with perfect execution.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4"
          >
            <button 
              onClick={() => setIsLoginModalOpen(true)}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-black text-white bg-[#FF5416] hover:bg-[#E0440D] hover:scale-[1.02] transition-all shadow-xl shadow-orange-500/10 flex items-center justify-center gap-2"
            >
              Sign In to Sandbox
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>
            <button 
              onClick={() => scrollToId("features")}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 transition-all flex items-center justify-center gap-1.5"
            >
              Explore Features
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>

        {/* Dynamic interactive visual card wrapper */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-5xl mx-auto mt-16 border border-slate-200/80 rounded-[32px] p-2 bg-slate-50 shadow-2xl overflow-hidden shadow-slate-200/50"
        >
          <div className="bg-[#0B132B] rounded-[24px] overflow-hidden aspect-auto md:aspect-[16/9] min-h-[520px] md:min-h-0 border border-slate-950 p-4 sm:p-6 md:p-8 flex flex-col justify-between relative">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF5416]/10 rounded-full blur-[100px] pointer-events-none" />
            
            {/* Mock Header */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center pb-4 border-b border-slate-800/40">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-[10px] font-mono text-slate-400 ml-2">CATALYST_OS_CONSOLE v2.4</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-[10px] font-mono text-[#FF5416] font-bold">
                ● CO-PILOT OPTIMIZER LIVE
              </div>
            </div>

            {/* Mock Body */}
            <div className="flex flex-col md:grid md:grid-cols-12 gap-4 my-6 md:my-auto">
              <div className="w-full md:col-span-8 space-y-4">
                <div className="bg-slate-900/50 border border-slate-800/60 rounded-2xl p-4 sm:p-5 space-y-3">
                  <div className="flex flex-col sm:flex-row gap-2 justify-between items-start sm:items-center">
                    <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Active Cognitive Proposal</span>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">94% Overload Protected</span>
                  </div>
                  <h4 className="text-white text-sm sm:text-base font-black">AI detected high cognitive fatigue at 3:00 PM. Move "Taxes Review" to tomorrow?</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    By shifting low-stress administrative tasks to tomorrow morning's cognitive buffer, you recover 2.5 hours of high-focus creative time today.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button className="bg-[#FF5416] hover:bg-[#E0440D] transition-all text-white text-[11px] font-black px-4 py-2.5 rounded-xl cursor-pointer">Accept Auto-Reschedule</button>
                    <button className="bg-slate-800 hover:bg-slate-700 transition-all text-slate-300 text-[11px] font-bold px-4 py-2.5 rounded-xl cursor-pointer">Dismiss</button>
                  </div>
                </div>
              </div>

              <div className="w-full md:col-span-4 flex">
                {/* Audio block preview */}
                <div className="bg-[#FF5416]/10 border border-[#FF5416]/20 rounded-2xl p-4 flex flex-col justify-between w-full min-h-[140px] md:min-h-0">
                  <div className="flex justify-between items-start">
                    <div className="bg-[#FF5416]/20 p-2 rounded-xl text-[#FF5416]">
                      <Volume2 className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] text-[#FF5416] font-black uppercase tracking-widest bg-[#FF5416]/15 px-2 py-0.5 rounded-full">Focused</span>
                  </div>
                  <div>
                    <h5 className="text-white text-xs font-black">Alpha Waves Audio Active</h5>
                    <p className="text-[10px] text-slate-400 mt-1">Noise shielding active (64Hz Binaural).</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mock Footer */}
            <div className="flex flex-col sm:flex-row gap-2 justify-between items-center pt-3 border-t border-slate-800/40 text-[10px] font-mono text-slate-500">
              <span>USER_ID: ALEX_MERCER</span>
              <span>STREAK: 14 DAYS</span>
              <span>COGNITIVE_SCORE: 890 XP</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* HIGHLIGHTED FEATURES SECTION (INTERACTIVE TOUR CONSOLE) */}
      <section id="features" className="py-24 bg-slate-50 border-y border-slate-100 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-16">
          
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 bg-[#FF5416]/10 border border-[#FF5416]/15 px-3 py-1 rounded-full text-xs font-extrabold text-[#FF5416] uppercase tracking-wider">
              <Cpu className="w-3.5 h-3.5" />
              Core Console Protocol Tour
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 leading-none">
              Experience the Feature Engine
            </h2>
            <p className="text-slate-500 font-medium text-sm sm:text-base">
              Click any protocol below to experience how the Catalyst OS co-pilot dynamically orchestrates your daily work, focus, and collaboration loops.
            </p>
          </div>

          {/* Interactive Bento Dashboard Component */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left Nav: Selector Tabs */}
            <div className="lg:col-span-4 flex flex-col justify-start space-y-2">
              
              {/* Horizontal Scroll for Mobile, Stacked for Desktop */}
              <div className="flex overflow-x-auto lg:overflow-visible gap-2 lg:flex-col pb-4 lg:pb-0 -mx-6 px-6 lg:mx-0 lg:px-0 scrollbar-none snap-x">
                
                {/* Tab 1: Arena */}
                <button
                  onClick={() => setActiveFeature("arena")}
                  className={`snap-center shrink-0 w-[240px] lg:w-full text-left p-4 rounded-2xl border transition-all duration-300 flex items-start gap-3.5 ${
                    activeFeature === "arena"
                      ? "bg-white border-orange-500/30 shadow-md shadow-orange-500/5 text-slate-900"
                      : "bg-transparent border-transparent text-slate-500 hover:bg-slate-100/80 hover:text-slate-800"
                  }`}
                >
                  <div className={`p-2.5 rounded-xl shrink-0 transition-colors ${
                    activeFeature === "arena" ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-500"
                  }`}>
                    <Trophy className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider">Competitive Arena</h4>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5 leading-relaxed">Daily Co-Op Quests & Mastery Badges.</p>
                  </div>
                </button>

                {/* Tab 2: Rescue */}
                <button
                  onClick={() => setActiveFeature("rescue")}
                  className={`snap-center shrink-0 w-[240px] lg:w-full text-left p-4 rounded-2xl border transition-all duration-300 flex items-start gap-3.5 ${
                    activeFeature === "rescue"
                      ? "bg-white border-orange-500/30 shadow-md shadow-orange-500/5 text-slate-900"
                      : "bg-transparent border-transparent text-slate-500 hover:bg-slate-100/80 hover:text-slate-800"
                  }`}
                >
                  <div className={`p-2.5 rounded-xl shrink-0 transition-colors ${
                    activeFeature === "rescue" ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-500"
                  }`}>
                    <ShieldAlert className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider">Crisis Rescue Priority</h4>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5 leading-relaxed">Task Breakdown & Early Warnings.</p>
                  </div>
                </button>

                {/* Tab 3: Wave */}
                <button
                  onClick={() => setActiveFeature("wave")}
                  className={`snap-center shrink-0 w-[240px] lg:w-full text-left p-4 rounded-2xl border transition-all duration-300 flex items-start gap-3.5 ${
                    activeFeature === "wave"
                      ? "bg-white border-orange-500/30 shadow-md shadow-orange-500/5 text-slate-900"
                      : "bg-transparent border-transparent text-slate-500 hover:bg-slate-100/80 hover:text-slate-800"
                  }`}
                >
                  <div className={`p-2.5 rounded-xl shrink-0 transition-colors ${
                    activeFeature === "wave" ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-500"
                  }`}>
                    <Activity className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider">Cognitive Wave</h4>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5 leading-relaxed">Natural energy peak tracking at 10 AM.</p>
                  </div>
                </button>

                {/* Tab 4: Synth */}
                <button
                  onClick={() => setActiveFeature("synth")}
                  className={`snap-center shrink-0 w-[240px] lg:w-full text-left p-4 rounded-2xl border transition-all duration-300 flex items-start gap-3.5 ${
                    activeFeature === "synth"
                      ? "bg-white border-orange-500/30 shadow-md shadow-orange-500/5 text-slate-900"
                      : "bg-transparent border-transparent text-slate-500 hover:bg-slate-100/80 hover:text-slate-800"
                  }`}
                >
                  <div className={`p-2.5 rounded-xl shrink-0 transition-colors ${
                    activeFeature === "synth" ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-500"
                  }`}>
                    <Volume2 className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider">Productivity Synth</h4>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5 leading-relaxed">Quantum focus resonator & deep timers.</p>
                  </div>
                </button>

                {/* Tab 5: Mind Dump */}
                <button
                  onClick={() => setActiveFeature("mind")}
                  className={`snap-center shrink-0 w-[240px] lg:w-full text-left p-4 rounded-2xl border transition-all duration-300 flex items-start gap-3.5 ${
                    activeFeature === "mind"
                      ? "bg-white border-orange-500/30 shadow-md shadow-orange-500/5 text-slate-900"
                      : "bg-transparent border-transparent text-slate-500 hover:bg-slate-100/80 hover:text-slate-800"
                  }`}
                >
                  <div className={`p-2.5 rounded-xl shrink-0 transition-colors ${
                    activeFeature === "mind" ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-500"
                  }`}>
                    <Compass className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider">Clarity Converter</h4>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5 leading-relaxed">Instantly convert messy mental notes.</p>
                  </div>
                </button>

                {/* Tab 6: Autonomy */}
                <button
                  onClick={() => setActiveFeature("autonomy")}
                  className={`snap-center shrink-0 w-[240px] lg:w-full text-left p-4 rounded-2xl border transition-all duration-300 flex items-start gap-3.5 ${
                    activeFeature === "autonomy"
                      ? "bg-white border-orange-500/30 shadow-md shadow-orange-500/5 text-slate-900"
                      : "bg-transparent border-transparent text-slate-500 hover:bg-slate-100/80 hover:text-slate-800"
                  }`}
                >
                  <div className={`p-2.5 rounded-xl shrink-0 transition-colors ${
                    activeFeature === "autonomy" ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-500"
                  }`}>
                    <Sliders className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider">AI Autonomy Calibration</h4>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5 leading-relaxed">Dual-engine calibration slider.</p>
                  </div>
                </button>

              </div>
              
              {/* Call to action card */}
              <div className="hidden lg:block bg-slate-900/5 border border-slate-200/50 p-6 rounded-2xl space-y-4 mt-auto">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">System Integration ready</span>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  These 6 protocols operate under a unified core architecture. Switch between focus, team-coordination, and AI safety features with zero overhead.
                </p>
                <button 
                  onClick={() => setIsLoginModalOpen(true)}
                  className="w-full text-center py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1"
                >
                  Start Live Trial
                  <ArrowUpRight className="w-3.5 h-3.5 stroke-[3px]" />
                </button>
              </div>

            </div>

            {/* Right Display: Visual Sandbox */}
            <div className="lg:col-span-8 flex flex-col">
              
              <div className="bg-[#0B132B] rounded-[32px] border border-slate-950 p-6 md:p-8 text-white flex flex-col justify-between flex-grow min-h-[440px] relative overflow-hidden shadow-2xl shadow-slate-900/20">
                
                {/* Background ambient light */}
                <div className="absolute -top-24 -right-24 w-80 h-80 bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

                {/* Console header */}
                <div className="flex justify-between items-center pb-4 border-b border-slate-800/60 mb-6 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
                    <span className="text-[10px] font-mono text-[#FF5416] font-black uppercase tracking-wider">
                      PROTOCOL::{activeFeature.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 uppercase flex gap-4">
                    <span>COGNITIVE LOCK: ACTIVE</span>
                    <span className="hidden sm:inline">BUFFER_INDEX: 98%</span>
                  </div>
                </div>

                {/* Screen Content Wrapper */}
                <div className="flex-grow flex flex-col justify-center">
                  
                  {/* FEATURE VIEW 1: COMPETITIVE ARENA */}
                  {activeFeature === "arena" && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center"
                    >
                      <div className="md:col-span-6 space-y-4">
                        <span className="text-[9px] bg-orange-500/20 border border-orange-500/30 text-orange-400 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                          Human-AI Co-Op
                        </span>
                        <h3 className="text-xl font-black text-white leading-tight">
                          Arena Leaderboard & Co-Op Quests
                        </h3>
                        <p className="text-slate-400 text-xs leading-relaxed">
                          Elevate focus with friendly social accountability. Form alliances with the AI co-pilot, unlock mastery badges together, and dominate daily leaderboard quests.
                        </p>
                        <div className="space-y-2 pt-1">
                          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                            <span className="text-amber-500 text-lg">★</span>
                            <span>Level up with 3 lock-shield focus badges.</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                            <span className="text-amber-500 text-lg">★</span>
                            <span>Earn multiplier points for streak maintenance.</span>
                          </div>
                        </div>
                      </div>

                      {/* Sandbox visualization */}
                      <div className="md:col-span-6 bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-inner">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            <Crown className="w-3.5 h-3.5 text-amber-500" />
                            Synergy League
                          </span>
                          <span className="text-[9px] text-slate-500 font-mono">Week 25</span>
                        </div>

                        {/* Leaderboard rows */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center p-2 bg-[#FF5416]/10 border border-[#FF5416]/20 rounded-xl">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="font-extrabold text-amber-400 text-[11px]">#1</span>
                              <div className="w-5 h-5 rounded bg-orange-500 text-white font-black flex items-center justify-center text-[10px]">AM</div>
                              <span className="font-black text-white">Alex Mercer (You)</span>
                            </div>
                            <span className="text-xs font-mono font-black text-orange-400">1,450 XP</span>
                          </div>

                          <div className="flex justify-between items-center p-2 bg-slate-950/40 border border-slate-800/40 rounded-xl opacity-85">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="font-extrabold text-slate-400 text-[11px]">#2</span>
                              <div className="w-5 h-5 rounded bg-indigo-600 text-white font-black flex items-center justify-center text-[10px]">CP</div>
                              <span className="font-semibold text-slate-300">AI Co-Pilot</span>
                            </div>
                            <span className="text-xs font-mono text-slate-400">1,380 XP</span>
                          </div>
                        </div>

                        {/* Badges Box */}
                        <div className="pt-2">
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-2">Unlocked Mastery Awards</span>
                          <div className="flex gap-2">
                            <div className="px-2.5 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500 flex items-center gap-1 hover:bg-amber-500/20 transition-all cursor-help" title="Completed 3 high priority tasks.">
                              <Flame className="w-3.5 h-3.5 fill-current" />
                              <span className="text-[10px] font-black">Deep Work</span>
                            </div>
                            <div className="px-2.5 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400 flex items-center gap-1 hover:bg-cyan-500/20 transition-all cursor-help" title="Accepted and auto-applied 3 scheduling recommendations.">
                              <Zap className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-black">Co-Pilot Legend</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* FEATURE VIEW 2: CRISC RESCUE */}
                  {activeFeature === "rescue" && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center"
                    >
                      <div className="md:col-span-6 space-y-4">
                        <span className="text-[9px] bg-[#FF5416]/20 border border-[#FF5416]/30 text-[#FF5416] px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                          Crisis Safety Protocol
                        </span>
                        <h3 className="text-xl font-black text-white leading-tight">
                          Early Warning & Crisis Rescue Hub
                        </h3>
                        <p className="text-slate-400 text-xs leading-relaxed">
                          Your calendar shouldn't trigger anxiety. Our early warning sensors look ahead for overcommit conflicts, back-to-back overlaps, and energy blocks, compiling instant auto-rescheduling recommendations.
                        </p>
                        <div className="space-y-1.5 bg-slate-900/40 p-3 rounded-xl border border-slate-800/40">
                          <p className="text-[11px] text-slate-300 font-bold">
                            💥 <span className="text-white">Crisis Defuser:</span> Move routine emails to your daily trough, preserving high focus peaks.
                          </p>
                        </div>
                      </div>

                      {/* Interactive Sandbox for Rescue */}
                      <div className="md:col-span-6 bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-inner">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                          <span className="text-[10px] font-mono text-slate-400 font-black">ALERTS_FEED_DAEMON</span>
                          <span className="text-[9px] bg-red-500/15 text-red-400 px-1.5 py-0.5 rounded-full font-mono font-black">1 WARNING</span>
                        </div>

                        <AnimatePresence mode="wait">
                          {rescueStatus === "warning" && (
                            <motion.div 
                              key="warn"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="space-y-4"
                            >
                              <div className="bg-red-500/10 border border-red-500/20 p-3.5 rounded-xl space-y-2">
                                <div className="flex items-center gap-2 text-red-400 text-xs font-black">
                                  <AlertCircle className="w-4 h-4" />
                                  <span>COGNITIVE OVERLOAD PREDICTED</span>
                                </div>
                                <p className="text-[10.5px] text-slate-300 font-semibold leading-relaxed">
                                  Double meeting booking at 3:00 PM overlaps with high-difficulty "VR Design Sync Review". Fatigue index predicted: <span className="text-red-400 font-black">88%</span>.
                                </p>
                              </div>
                              <button
                                onClick={handleRescueDeploy}
                                className="w-full py-3 bg-[#FF5416] hover:bg-[#E0440D] text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-orange-500/10 flex items-center justify-center gap-1.5 transition-all"
                              >
                                <Zap className="w-4 h-4 fill-current" />
                                Deploy Co-Pilot Rescue
                              </button>
                            </motion.div>
                          )}

                          {rescueStatus === "loading" && (
                            <motion.div 
                              key="load"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="py-6 flex flex-col items-center justify-center space-y-3"
                            >
                              <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                              <div className="space-y-1 text-center">
                                <p className="text-xs font-mono font-black text-orange-400 uppercase tracking-widest">Resolving clashes...</p>
                                <p className="text-[10px] text-slate-500">Shifting routine triage. Securing focus buffers.</p>
                              </div>
                            </motion.div>
                          )}

                          {rescueStatus === "resolved" && (
                            <motion.div 
                              key="ok"
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="space-y-4"
                            >
                              <div className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl space-y-2">
                                <div className="flex items-center gap-2 text-emerald-400 text-xs font-black">
                                  <CheckCircle className="w-4 h-4" />
                                  <span>CO-PILOT SCHEDULE BALANCED</span>
                                </div>
                                <p className="text-[10.5px] text-slate-300 font-semibold leading-relaxed">
                                  "VR Design Review" deferred to tomorrow at 10:00 AM (Cognitive Peak). Routine triage compressed into 15 mins. Conflict cleared safely!
                                </p>
                              </div>
                              <button
                                onClick={() => setRescueStatus("warning")}
                                className="w-full py-2.5 border border-slate-700 hover:border-slate-600 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-bold transition-all"
                              >
                                Reset Simulation
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}

                  {/* FEATURE VIEW 3: COGNITIVE WAVE */}
                  {activeFeature === "wave" && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center"
                    >
                      <div className="md:col-span-6 space-y-4">
                        <span className="text-[9px] bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                          Circadian Calibration
                        </span>
                        <h3 className="text-xl font-black text-white leading-tight">
                          Cognitive Wave Analyzer
                        </h3>
                        <p className="text-slate-400 text-xs leading-relaxed">
                          Your concentration levels spike naturally at 10:00 AM. Stop forcing constant focus. Instead, align your high-friction goals with metabolic peaks and let the co-pilot block secondary clutter automatically.
                        </p>
                        <div className="text-xs font-bold text-slate-400 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                          🎯 <span className="text-slate-200">User Spike Alert:</span> Focus peak rises by 125% between 10 AM and 1 PM.
                        </div>
                      </div>

                      {/* Timeline Interaction */}
                      <div className="md:col-span-6 bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-inner">
                        <span className="text-[10px] font-mono text-slate-400 font-black uppercase tracking-wider block">Timeline Wave Control</span>
                        
                        {/* Selector timeline row */}
                        <div className="grid grid-cols-4 gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800/60">
                          {(["8am", "10am", "3pm", "8pm"] as const).map((t) => (
                            <button
                              key={t}
                              onClick={() => setSelectedTime(t)}
                              className={`py-1.5 text-[10px] font-black uppercase rounded-lg transition-all ${
                                selectedTime === t 
                                  ? "bg-orange-500 text-white shadow-sm" 
                                  : "text-slate-400 hover:bg-slate-900"
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>

                        {/* Interactive Timeline Outcome */}
                        <div className="bg-slate-950 p-3 rounded-xl space-y-3.5 border border-slate-800/40">
                          {selectedTime === "8am" && (
                            <>
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase text-slate-400">Warm-up Phase</span>
                                <span className="text-amber-400 font-bold text-xs">Energy: 65%</span>
                              </div>
                              <p className="text-[10.5px] text-slate-400 leading-relaxed font-semibold">
                                "Suggested activity: Quick inbox cleanup & routine review. Save high-difficulty design blocks for later."
                              </p>
                            </>
                          )}
                          {selectedTime === "10am" && (
                            <>
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">🎯 Cognitive Peak Spiking</span>
                                <span className="text-emerald-400 font-black text-xs">Energy: 98%</span>
                              </div>
                              <p className="text-[10.5px] text-slate-300 leading-relaxed font-semibold">
                                "Focus peak activated. Launching 'Final Project Report' drafting now. Screen lock and alpha sound waves initiated."
                              </p>
                            </>
                          )}
                          {selectedTime === "3pm" && (
                            <>
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase text-rose-400">Metabolic Low</span>
                                <span className="text-rose-400 font-bold text-xs">Energy: 42%</span>
                              </div>
                              <p className="text-[10.5px] text-slate-400 leading-relaxed font-semibold">
                                "Cognitive fatigue peak. Take a 15-minute hydration break. Launch alpha synthesizer for automatic recovery."
                              </p>
                            </>
                          )}
                          {selectedTime === "8pm" && (
                            <>
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase text-indigo-400">Evening Taper</span>
                                <span className="text-indigo-400 font-bold text-xs">Energy: 55%</span>
                              </div>
                              <p className="text-[10.5px] text-slate-400 leading-relaxed font-semibold">
                                "Routine checklist logging active. AI compiled tomorrow's high-pacing proposal queue."
                              </p>
                            </>
                          )}
                        </div>

                        {/* Tiny dynamic SVG visualization */}
                        <div className="h-10 bg-slate-950/40 border border-slate-800/40 rounded-xl flex items-center justify-around px-4">
                          <span className="text-[9px] font-mono text-slate-500">Circadian Line</span>
                          <div className="flex items-end gap-1 h-6">
                            <div className="w-1.5 h-3 bg-slate-700 rounded-t" />
                            <div className={`w-1.5 rounded-t transition-all ${selectedTime === "8am" ? "bg-orange-500 h-5" : "bg-slate-700 h-4"}`} />
                            <div className={`w-1.5 rounded-t transition-all ${selectedTime === "10am" ? "bg-orange-500 h-6" : "bg-slate-600 h-6"}`} />
                            <div className={`w-1.5 rounded-t transition-all ${selectedTime === "3pm" ? "bg-orange-500 h-2" : "bg-slate-800 h-2.5"}`} />
                            <div className={`w-1.5 rounded-t transition-all ${selectedTime === "8pm" ? "bg-orange-500 h-4 animate-pulse" : "bg-slate-700 h-3.5"}`} />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* FEATURE VIEW 4: PRODUCTIVITY SYNTH */}
                  {activeFeature === "synth" && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center"
                    >
                      <div className="md:col-span-6 space-y-4">
                        <span className="text-[9px] bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                          Focus Synthesizer
                        </span>
                        <h3 className="text-xl font-black text-white leading-tight">
                          Quantum Focus Resonator & Audio Synthesizer
                        </h3>
                        <p className="text-slate-400 text-xs leading-relaxed">
                          Shield your sensory workspace. Play active alpha waveforms, deep brown resonance loops, and custom focus sounds that mask environmental noise and guide your neural pacing.
                        </p>
                        <div className="flex gap-2 text-xs">
                          <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-cyan-400 font-mono">64Hz Binaural</span>
                          <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-orange-400 font-mono">Alpha Sine</span>
                        </div>
                      </div>

                      {/* Interactive Music/Timer Controller */}
                      <div className="md:col-span-6 bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-inner">
                        
                        {/* Audio track selectors */}
                        <div className="flex gap-1.5">
                          {(["alpha", "quantum", "lofi"] as const).map((sound) => (
                            <button
                              key={sound}
                              onClick={() => setSynthSound(sound)}
                              className={`flex-1 py-2 text-[9.5px] font-black uppercase rounded-xl border transition-all ${
                                synthSound === sound 
                                  ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400" 
                                  : "bg-slate-950 border-slate-800/60 text-slate-400 hover:text-slate-200"
                              }`}
                            >
                              {sound === "alpha" && "Alpha Waves"}
                              {sound === "quantum" && "Quantum Synth"}
                              {sound === "lofi" && "Focus Lofi"}
                            </button>
                          ))}
                        </div>

                        {/* Interactive Timer Block */}
                        <div className="bg-slate-950 p-4 rounded-xl flex items-center justify-between border border-slate-800/40">
                          <div>
                            <span className="text-[9px] font-mono text-slate-500 uppercase block">Focus Timer</span>
                            <span className="text-3xl font-mono font-black text-white leading-none">
                              {formatSynthTime(synthTimer)}
                            </span>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setIsSynthPlaying(!isSynthPlaying);
                              }}
                              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                                isSynthPlaying 
                                  ? "bg-rose-500 text-white" 
                                  : "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/10"
                              }`}
                            >
                              {isSynthPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                            </button>

                            <button
                              onClick={() => {
                                setIsSynthPlaying(false);
                                setSynthTimer(1500);
                              }}
                              className="w-11 h-11 rounded-full bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white flex items-center justify-center border border-slate-800"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Live Soundwave Bars */}
                        <div className="h-6 flex items-center justify-center gap-1 bg-slate-950/40 border border-slate-800/40 rounded-xl px-4 overflow-hidden">
                          <span className="text-[9px] font-mono text-slate-500 mr-auto">Spectrum</span>
                          <div className="flex items-end gap-1 h-3.5">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                              <div
                                key={i}
                                className={`w-1 rounded-t transition-all ${
                                  isSynthPlaying 
                                    ? "bg-cyan-400" 
                                    : "bg-slate-800"
                                }`}
                                style={{
                                  height: isSynthPlaying 
                                    ? `${Math.sin(i + synthTimer) * 4 + 10}px` 
                                    : "2px",
                                  transitionDuration: "200ms"
                                }}
                              />
                            ))}
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  )}

                  {/* FEATURE VIEW 5: MIND DUMP CLARITY */}
                  {activeFeature === "mind" && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center"
                    >
                      <div className="md:col-span-6 space-y-4">
                        <span className="text-[9px] bg-amber-500/20 border border-amber-500/30 text-amber-400 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                          Messy Thoughts Triage
                        </span>
                        <h3 className="text-xl font-black text-white leading-tight">
                          Mind Dump & Clarity Converter
                        </h3>
                        <p className="text-slate-400 text-xs leading-relaxed">
                          Clear your head in seconds. Spill your messy thoughts, half-baked deadlines, and stressful notes directly into our open textbox. Our cognitive processor parses, organizes, and inserts them straight into your daily queue as clean, estimated tasks.
                        </p>
                      </div>

                      {/* Interactive Parser Playground */}
                      <div className="md:col-span-6 bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-3.5 shadow-inner">
                        <span className="text-[10px] font-mono text-slate-400 font-black block">Messy Notes Input</span>
                        
                        <AnimatePresence mode="wait">
                          {converterState === "idle" && (
                            <motion.div 
                              key="idle"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="space-y-3"
                            >
                              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-[10.5px] font-mono text-slate-400 italic leading-relaxed">
                                "need to complete the pitch deck outline before 5pm but i also need to email john about the API key and somehow fix the CSS bugs that are breaking the safari mobile layout oh and gym at some point today too"
                              </div>
                              <button
                                onClick={handleClarityConvert}
                                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 uppercase tracking-wider transition-all"
                              >
                                <Sparkles className="w-4 h-4 fill-current" />
                                Run Clarity Converter
                              </button>
                            </motion.div>
                          )}

                          {converterState === "converting" && (
                            <motion.div 
                              key="converting"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="py-10 flex flex-col items-center justify-center space-y-3"
                            >
                              <Loader2 className="w-7 h-7 text-amber-500 animate-spin" />
                              <p className="text-xs font-mono text-amber-400 font-black tracking-widest uppercase">Converting raw thought streams...</p>
                            </motion.div>
                          )}

                          {converterState === "finished" && (
                            <motion.div 
                              key="finished"
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="space-y-3"
                            >
                              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                                <div className="p-2.5 bg-slate-950 border-l-2 border-red-500 rounded-r-xl flex justify-between items-center text-xs">
                                  <div>
                                    <p className="font-black text-white text-[11px]">1. Draft Pitch Deck Outline</p>
                                    <span className="text-[9px] text-slate-500 font-bold">1.5 hrs • Focus: Deep</span>
                                  </div>
                                  <span className="text-[9px] bg-red-500/15 text-red-400 px-2 py-0.5 rounded-full font-black uppercase">Urgent</span>
                                </div>

                                <div className="p-2.5 bg-slate-950 border-l-2 border-orange-500 rounded-r-xl flex justify-between items-center text-xs">
                                  <div>
                                    <p className="font-black text-white text-[11px]">2. Fix Safari Mobile CSS Layout</p>
                                    <span className="text-[9px] text-slate-500 font-bold">1.0 hrs • Focus: Creative</span>
                                  </div>
                                  <span className="text-[9px] bg-orange-500/15 text-orange-400 px-2 py-0.5 rounded-full font-black uppercase">Medium</span>
                                </div>

                                <div className="p-2.5 bg-slate-950 border-l-2 border-slate-500 rounded-r-xl flex justify-between items-center text-xs">
                                  <div>
                                    <p className="font-semibold text-slate-300 text-[11px]">3. Send API key to John</p>
                                    <span className="text-[9px] text-slate-500 font-bold">10 mins • Focus: Admin</span>
                                  </div>
                                  <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-bold uppercase">Low</span>
                                </div>
                              </div>
                              <button
                                onClick={() => setConverterState("idle")}
                                className="w-full py-2 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 text-xs font-bold rounded-xl transition-all"
                              >
                                Edit / Try again
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>

                      </div>
                    </motion.div>
                  )}

                  {/* FEATURE VIEW 6: AUTONOMY SLIDER */}
                  {activeFeature === "autonomy" && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center"
                    >
                      <div className="md:col-span-6 space-y-4">
                        <span className="text-[9px] bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                          Orchestration Control
                        </span>
                        <h3 className="text-xl font-black text-white leading-tight">
                          AI Autonomy Calibration & Dual-Engine
                        </h3>
                        <p className="text-slate-400 text-xs leading-relaxed">
                          Calibrate how much planning control your assistant has. From strict manual confirmation guardrails to a fully autonomous, self-healing scheduling orchestrator that coordinates deadlines automatically with colleagues.
                        </p>
                        <div className="text-xs font-bold text-slate-400 bg-slate-900/50 p-3 rounded-xl border border-slate-800 leading-relaxed">
                          🔗 <span className="text-slate-200">Integration Hub:</span> Stream natively to Slack, Google Calendar, and Email threads.
                        </div>
                      </div>

                      {/* Interactive Calibration Panel */}
                      <div className="md:col-span-6 bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-inner">
                        <span className="text-[10px] font-mono text-slate-400 font-black block">Autonomy Slider Control</span>
                        
                        {/* Selector Row */}
                        <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800/60">
                          {(["manual", "copilot", "autonomous"] as const).map((level) => (
                            <button
                              key={level}
                              onClick={() => setAutonomyLevel(level)}
                              className={`py-2 text-[8.5px] font-black uppercase rounded-lg transition-all ${
                                autonomyLevel === level 
                                  ? "bg-[#FF5416] text-white shadow-sm" 
                                  : "text-slate-400 hover:bg-slate-900"
                              }`}
                            >
                              {level === "manual" && "Manual Guard"}
                              {level === "copilot" && "Co-Pilot"}
                              {level === "autonomous" && "Autonomous"}
                            </button>
                          ))}
                        </div>

                        {/* Interactive Outcomes description */}
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/40 min-h-[110px] flex flex-col justify-between">
                          {autonomyLevel === "manual" && (
                            <>
                              <span className="text-[9px] font-black text-orange-400 uppercase tracking-widest">Active Level: Manual Guardrails</span>
                              <p className="text-[10.5px] text-slate-400 leading-relaxed font-semibold mt-1">
                                AI only produces proposals. No scheduling, messaging, or calendar events are changed without your explicit click. High safety, manual administration.
                              </p>
                            </>
                          )}
                          {autonomyLevel === "copilot" && (
                            <>
                              <span className="text-[9px] font-black text-cyan-400 tracking-widest uppercase">Active Level: Standard Co-Pilot</span>
                              <p className="text-[10.5px] text-slate-300 leading-relaxed font-semibold mt-1">
                                AI groups routine checklist slots, alerts you to conflict warning indices, and triggers active focus waves, leaving high priority calendar modifications for user approval.
                              </p>
                            </>
                          )}
                          {autonomyLevel === "autonomous" && (
                            <>
                              <span className="text-[9px] font-black text-indigo-400 tracking-widest uppercase">Active Level: Autonomous Orchestrator</span>
                              <p className="text-[10.5px] text-slate-300 leading-relaxed font-semibold mt-1">
                                AI acts as a premium personal administrator. Automatically moves client meetings when friction points trigger, negotiates buffers with colleagues, and toggles Slack DND during peaks.
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                </div>

                {/* Console footer metadata */}
                <div className="flex flex-col sm:flex-row gap-2 justify-between items-center pt-3 border-t border-slate-800/60 text-[10px] font-mono text-slate-500 shrink-0">
                  <div className="flex items-center gap-1">
                    <span>SECURITY: FIREBASE SANDBOX</span>
                  </div>
                  <span>CALIBRATION PROTOCOL V4.2</span>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ABOUT PHILOSOPHY SECTION */}
      <section id="about" className="py-24 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3 py-0.5 rounded-full text-xs font-extrabold text-amber-600 uppercase tracking-wider">
            Our Core Thesis
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-950 leading-tight">
            Designed for human cognitive rhythms, not corporate machines.
          </h2>
          <p className="text-slate-500 font-medium leading-relaxed text-base">
            Modern productivity tools treat humans like conveyor belts—expecting infinite throughput at constant velocities. The result is chronic stress, fragmentation, and task paralysis.
          </p>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-[#FF5416]/10 text-[#FF5416] flex items-center justify-center shrink-0">
                <Check className="w-5 h-5 stroke-[3px]" />
              </div>
              <div>
                <h4 className="text-base font-black text-slate-900">Cognitive Load Distribution</h4>
                <p className="text-sm text-slate-500 leading-relaxed mt-0.5">We map your focus levels dynamically. Heavy creative work is isolated during peaks, while routine checklist items are pooled inside secondary relaxation windows.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                <Check className="w-5 h-5 stroke-[3px]" />
              </div>
              <div>
                <h4 className="text-base font-black text-slate-900">Noisy Environment Shields</h4>
                <p className="text-sm text-slate-500 leading-relaxed mt-0.5">With single-key focus lockdowns, ambient focus music streams natively while blocking app interruptions, creating an absolute cocoon of concentration.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[36px] p-8 text-white space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-orange-500/10 rounded-full blur-[50px] pointer-events-none" />
          
          <h3 className="text-2xl font-black tracking-tight">Catalyst Flow Index</h3>
          <p className="text-slate-300 text-xs font-medium leading-relaxed">
            "By implementing predictive rescheduling, my team's average streak rose from 4 days to 14 days. It removed the stress of task clutter completely."
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-xs font-black border border-slate-700">
              PM
            </div>
            <div>
              <p className="text-xs font-black text-white">Alex Mercer</p>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Priority Tier Member</p>
            </div>
          </div>
          
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Streak Recovery Rate</span>
              <span className="text-[#FF5416] font-black">+145%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-[#FF5416] h-full w-[85%]" />
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="py-24 bg-slate-50 border-t border-slate-100 px-6">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900">
              Simple, transparent pricing
            </h2>
            <p className="text-slate-500 font-medium">
              Unlock access to the high-performance console. Standard plans or executive priorities.
            </p>
          </div>

          <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Free Tier */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-8 flex flex-col justify-between space-y-8 shadow-sm">
              <div className="space-y-4">
                <span className="text-[10px] font-black bg-slate-100 border border-slate-200 px-3 py-1 rounded-full text-slate-600 uppercase tracking-wider">Standard</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900">$0</span>
                  <span className="text-slate-400 font-semibold text-sm">/ month</span>
                </div>
                <p className="text-xs text-slate-400 font-medium">Essential cognitive tools for solo specialists.</p>
                
                <ul className="space-y-3 pt-4 border-t border-slate-100 text-xs text-slate-600 font-semibold">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#FF5416]" /> Paced Queue List
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#FF5416]" /> basic Binaural Frequencies
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#FF5416]" /> AI Assistant Prompts (Limited)
                  </li>
                </ul>
              </div>
              <button 
                onClick={() => setIsLoginModalOpen(true)}
                className="w-full py-3 rounded-xl border border-slate-200 text-xs font-black hover:bg-slate-50 transition-all text-slate-700"
              >
                Access Free Console
              </button>
            </div>

            {/* Priority Tier */}
            <div className="bg-slate-950 text-white rounded-3xl p-8 flex flex-col justify-between space-y-8 shadow-xl border border-slate-900 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#FF5416] text-white text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-2xl">
                Highly Recommended
              </div>
              
              <div className="space-y-4">
                <span className="text-[10px] font-black bg-[#FF5416]/20 border border-[#FF5416]/30 px-3 py-1 rounded-full text-[#FF5416] uppercase tracking-wider">Priority Executive</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">$19</span>
                  <span className="text-slate-500 font-semibold text-sm">/ month</span>
                </div>
                <p className="text-xs text-slate-400 font-medium">Full AI scheduling feedback loops, social league rankings, and unlimited wave generator presets.</p>
                
                <ul className="space-y-3 pt-4 border-t border-slate-900 text-xs text-slate-300 font-semibold">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#FF5416]" /> Unlimited AI Co-Pilot proposal nets
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#FF5416]" /> Full Sound resonance library
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#FF5416]" /> Entry to Competitive Synergy Arena
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#FF5416]" /> Advanced Analytics & Trend Warnings
                  </li>
                </ul>
              </div>
              <button 
                onClick={() => setIsLoginModalOpen(true)}
                className="w-full py-3 rounded-xl bg-[#FF5416] hover:bg-[#E0440D] text-xs font-black transition-all text-white shadow-lg shadow-orange-500/20"
              >
                Unlock Priority Console
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="py-24 max-w-4xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-950">
            Talk with our specialists
          </h2>
          <p className="text-slate-500 font-medium max-w-lg mx-auto">
            Need customized integrations, team accounts, or priority setups? Drop us a prompt.
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 p-8 rounded-[32px] shadow-sm relative">
          <AnimatePresence mode="wait">
            {!contactSubmitted ? (
              <motion.form 
                key="form"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleContactSubmit} 
                className="space-y-5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Your Name</label>
                    <input 
                      type="text" 
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Alex Mercer" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#FF5416] transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="alex@globaltech.com" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#FF5416] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Your Message</label>
                  <textarea 
                    rows={4}
                    required
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="We would love to request custom audio streams and enterprise security settings..." 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#FF5416] transition-all resize-none"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={contactLoading}
                  className="w-full py-4 rounded-xl text-xs font-black text-white bg-[#FF5416] hover:bg-[#E0440D] transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/10 cursor-pointer disabled:opacity-70"
                >
                  {contactLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending Prompt...
                    </>
                  ) : (
                    <>
                      Send Message
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 space-y-4"
              >
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle className="w-8 h-8 stroke-[2.5]" />
                </div>
                <h3 className="text-2xl font-black text-slate-900">Message successfully transmitted!</h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto font-medium leading-relaxed">
                  Thanks for reaching out! Our high-performance specialist will respond within 4 hours.
                </p>
                <button 
                  onClick={() => setContactSubmitted(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Submit another inquiry
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-tr from-[#FF5416] to-[#FF8A00] rounded-lg flex items-center justify-center text-white">
              <Compass className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="font-extrabold text-white">CATALYST.OS</span>
          </div>
          <p>© 2026 Catalyst Inc. All rights reserved. Secure Firebase Sandbox.</p>
          <div className="flex gap-4 text-xs font-semibold">
            <span className="hover:text-white cursor-pointer">Privacy Protocol</span>
            <span className="hover:text-white cursor-pointer">Terms of Service</span>
            <span className="hover:text-white cursor-pointer">Security Audits</span>
          </div>
        </div>
      </footer>

      {/* LOGIN MODAL (OVERLAY) */}
      <AnimatePresence>
        {isLoginModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (!isLoading) setIsLoginModalOpen(false); }}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white border border-slate-200 rounded-[32px] shadow-2xl p-6 sm:p-8 w-full max-w-md relative overflow-hidden z-10"
            >
              {/* Top orange glow decor */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#FF5416] to-[#FF8A00]" />

              <div className="space-y-6">
                
                {/* Header info */}
                <div className="space-y-1.5 text-center">
                  <div className="w-12 h-12 bg-orange-500/10 text-[#FF5416] rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                    <LockKeyhole className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-950 mt-4">Security Login</h3>
                  <p className="text-xs text-slate-500 font-medium">Enter your sandbox credentials to load the console</p>
                </div>

                {errorMessage && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl text-xs font-semibold leading-relaxed flex items-start gap-2.5">
                    <span className="text-red-500 text-sm">⚠️</span>
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Email Address</label>
                    <input 
                      type="email" 
                      required
                      disabled={isLoading || loginSuccess}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="demo@synergy.com" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#FF5416] transition-all disabled:opacity-60"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Password</label>
                    </div>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        required
                        disabled={isLoading || loginSuccess}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••" 
                        className="w-full pl-4 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#FF5416] transition-all disabled:opacity-60"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={isLoading || loginSuccess}
                    className="w-full py-3.5 rounded-xl text-sm font-black text-white bg-[#FF5416] hover:bg-[#E0440D] shadow-lg shadow-orange-500/10 cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-75"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {loginSuccess ? "Security Cleared..." : "Verifying Auth..."}
                      </>
                    ) : loginSuccess ? (
                      <>
                        <Check className="w-4 h-4 stroke-[3px]" />
                        Access Granted!
                      </>
                    ) : (
                      <>
                        Login to Console
                        <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                      </>
                    )}
                  </button>
                </form>

                {/* Demo autofill section */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Demo Quick Access</span>
                  </div>
                  
                  <button 
                    onClick={handleAutofillDemo}
                    disabled={isLoading || loginSuccess}
                    className="w-full py-2.5 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 text-amber-600 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 fill-current" />
                    Quick Autofill Demo Credentials
                  </button>

                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-[10px] text-slate-500 space-y-1 font-medium">
                    <p className="flex justify-between">
                      <span>Demo Login:</span>
                      <span className="font-extrabold text-slate-700">demo@synergy.com</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Demo Password:</span>
                      <span className="font-extrabold text-slate-700">synergy_demo_2026</span>
                    </p>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

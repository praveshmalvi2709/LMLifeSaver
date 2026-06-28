import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  Activity, 
  Play, 
  Pause, 
  Award, 
  Brain, 
  Volume2, 
  VolumeX, 
  Send, 
  Check, 
  Plus, 
  RotateCcw,
  Compass,
  ArrowRight,
  ShieldAlert,
  Mic,
  MicOff
} from "lucide-react";
import DeepFocusTimer from "./DeepFocusTimer";

interface AbstractProps {
  onAddTask: (title: string, priority: "URGENT" | "HIGH" | "MEDIUM" | "LOW", description: string) => void;
}

export default function Abstract({ onAddTask }: AbstractProps) {
  // --- STATE FOR RESONATOR ---
  const [focusFrequency, setFocusFrequency] = useState<"Alpha" | "Beta" | "Theta" | "Delta">("Alpha");
  const [isResonatorActive, setIsResonatorActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<"Inhale" | "Hold" | "Exhale">("Inhale");
  const [breathingProgress, setBreathingProgress] = useState(0); 
  const [cognitiveScore, setCognitiveScore] = useState(76);
  const [loggedSessions, setLoggedSessions] = useState(0);

  // --- STATE FOR BINAURAL AUDIO SYNTHESIZER ---
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const [soundProfile, setSoundProfile] = useState<"Binaural" | "DeepSpace" | "PinkNoise">("Binaural");
  
  // Audio Refs for Web Audio API
  const audioCtxRef = useRef<AudioContext | null>(null);
  const mainGainRef = useRef<GainNode | null>(null);
  const oscLRef = useRef<OscillatorNode | null>(null);
  const oscRRef = useRef<OscillatorNode | null>(null);
  const lfoRef = useRef<OscillatorNode | null>(null);
  const noiseNodeRef = useRef<AudioWorkletNode | ScriptProcessorNode | null>(null);

  // Animation Canvas Ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // --- STATE FOR TELL ME ANYTHING (AI MIND DUMP) ---
  const [dumpText, setDumpText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    refactorFeedback: string;
    stressReleasePct: number;
    suggestedTasks: Array<{ title: string; priority: "URGENT" | "HIGH" | "MEDIUM" | "LOW"; description: string }>;
  } | null>(null);
  const [addedTasks, setAddedTasks] = useState<Record<number, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // --- VOICE VENTING (AUDIO INPUT) STATES & REFS ---
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [isSimulated, setIsSimulated] = useState(false);
  const recognitionRef = useRef<any>(null);
  const recordingTimerRef = useRef<any>(null);

  const startVoiceRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      triggerToast("Web Speech API not supported. Initializing Simulated Voice Mode.");
      startSimulatedRecording();
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsRecording(true);
        setIsSimulated(false);
        setRecordDuration(0);
        triggerToast("Voice channel active. Vent freely now!");
        
        recordingTimerRef.current = setInterval(() => {
          setRecordDuration(prev => prev + 1);
        }, 1000);
      };

      rec.onresult = (event: any) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + " ";
          }
        }
        if (finalTranscript) {
          setDumpText(prev => {
            const trimmed = prev.trim();
            return trimmed ? `${trimmed} ${finalTranscript.trim()}` : finalTranscript.trim();
          });
        }
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === "not-allowed") {
          triggerToast("Microphone permissions denied. Launching Simulated Venting.");
          startSimulatedRecording();
        } else {
          triggerToast(`Microphone notice: ${event.error}. Switching to Simulated Mode.`);
          startSimulatedRecording();
        }
      };

      rec.onend = () => {
        setIsRecording(false);
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err: any) {
      console.error(err);
      triggerToast("Speech initialization error. Launching simulated capture.");
      startSimulatedRecording();
    }
  };

  const stopVoiceRecording = () => {
    if (isSimulated) {
      stopSimulatedRecording();
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.warn(e);
      }
      recognitionRef.current = null;
    }
    
    setIsRecording(false);
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    triggerToast("Voice vent completed! Text appended to mind dump.");
  };

  const startSimulatedRecording = () => {
    setIsRecording(true);
    setIsSimulated(true);
    setRecordDuration(0);
    recordingTimerRef.current = setInterval(() => {
      setRecordDuration(prev => prev + 1);
    }, 1000);
  };

  const stopSimulatedRecording = () => {
    setIsRecording(false);
    setIsSimulated(false);
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    const simulatedVents = [
      "Honestly, I'm just incredibly overwhelmed by this upcoming design review and feel like I have zero space to think clearly.",
      "My desk is super messy, I haven't drafted the crucial client follow-up email, and I'm stressed about the presentation layout scaling issues.",
      "Every time I look at my schedule, I see back-to-back syncs and I literally haven't had a block to actually write code or compile."
    ];
    const chosen = simulatedVents[Math.floor(Math.random() * simulatedVents.length)];
    setDumpText(prev => {
      const trimmed = prev.trim();
      return trimmed ? `${trimmed} ${chosen}` : chosen;
    });
    triggerToast("Voice vent synthesized! Mind dump content appended.");
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Trigger brief alert toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // --- 1. BREEDING CYCLE SIMULATION (RESONATOR) ---
  useEffect(() => {
    let interval: NodeJS.Timeout;
    let timer: NodeJS.Timeout;
    if (isResonatorActive) {
      let cycle = 0;
      interval = setInterval(() => {
        cycle = (cycle + 1) % 3;
        if (cycle === 0) {
          setBreathingPhase("Inhale");
          setCognitiveScore(prev => Math.min(prev + 2, 99));
        } else if (cycle === 1) {
          setBreathingPhase("Hold");
          setCognitiveScore(prev => Math.min(prev + 1, 99));
        } else {
          setBreathingPhase("Exhale");
          setCognitiveScore(prev => Math.min(prev + 1, 99));
        }
      }, 4000);

      let progress = 0;
      let direction = 1;
      timer = setInterval(() => {
        progress += direction * 4;
        if (progress >= 100) {
          progress = 100;
          direction = -1;
        } else if (progress <= 0) {
          progress = 0;
          direction = 1;
        }
        setBreathingProgress(progress);
      }, 80);
    } else {
      setBreathingProgress(0);
    }
    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, [isResonatorActive]);

  // --- 2. WEB AUDIO API SYNTHESIZER ---
  const startAudio = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      const mainGain = ctx.createGain();
      mainGain.gain.setValueAtTime(volume, ctx.currentTime);
      mainGain.connect(ctx.destination);
      mainGainRef.current = mainGain;

      if (soundProfile === "Binaural") {
        // Left Ear Oscillator (e.g. 200Hz)
        const oscL = ctx.createOscillator();
        oscL.type = "sine";
        oscL.frequency.setValueAtTime(180, ctx.currentTime);
        
        const pannerL = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        if (pannerL) {
          pannerL.pan.setValueAtTime(-1, ctx.currentTime);
          oscL.connect(pannerL);
          pannerL.connect(mainGain);
        } else {
          oscL.connect(mainGain);
        }
        oscL.start();
        oscLRef.current = oscL;

        // Right Ear Oscillator (Frequency + Beat Frequency)
        // Alpha = 12Hz, Beta = 20Hz, Theta = 6Hz, Delta = 3Hz
        let diff = 12;
        if (focusFrequency === "Beta") diff = 20;
        if (focusFrequency === "Theta") diff = 6;
        if (focusFrequency === "Delta") diff = 3;

        const oscR = ctx.createOscillator();
        oscR.type = "sine";
        oscR.frequency.setValueAtTime(180 + diff, ctx.currentTime);

        const pannerR = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        if (pannerR) {
          pannerR.pan.setValueAtTime(1, ctx.currentTime);
          oscR.connect(pannerR);
          pannerR.connect(mainGain);
        } else {
          oscR.connect(mainGain);
        }
        oscR.start();
        oscRRef.current = oscR;

        // Add a very low filter for soothing sound
        const lowpass = ctx.createBiquadFilter();
        lowpass.type = "lowpass";
        lowpass.frequency.setValueAtTime(300, ctx.currentTime);
      } 
      else if (soundProfile === "DeepSpace") {
        // Deep Space Ambient: combination of detuned triangle waves with an LFO filter sweep
        const osc1 = ctx.createOscillator();
        osc1.type = "triangle";
        osc1.frequency.setValueAtTime(90, ctx.currentTime); // F#2

        const osc2 = ctx.createOscillator();
        osc2.type = "triangle";
        osc2.frequency.setValueAtTime(135, ctx.currentTime); // C#3 (perfect fifth)

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(250, ctx.currentTime);
        filter.Q.setValueAtTime(8, ctx.currentTime);

        // LFO modulating filter cutoff for spacey feel
        const lfo = ctx.createOscillator();
        lfo.type = "sine";
        lfo.frequency.setValueAtTime(0.15, ctx.currentTime); // extremely slow modulation

        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(120, ctx.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        lfo.start();
        lfoRef.current = lfo;

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(mainGain);

        osc1.start();
        osc2.start();
        oscLRef.current = osc1;
        oscRRef.current = osc2;
      } 
      else if (soundProfile === "PinkNoise") {
        // Pink Noise generator via custom synth nodes
        const bufferSize = 4096;
        const pinkNoise = ctx.createScriptProcessor(bufferSize, 1, 1);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        pinkNoise.onaudioprocess = (e) => {
          const output = e.outputBuffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
            output[i] *= 0.11; // rescue scale volume
            b6 = white * 0.115926;
          }
        };
        const lowpass = ctx.createBiquadFilter();
        lowpass.type = "lowpass";
        lowpass.frequency.setValueAtTime(400, ctx.currentTime);

        pinkNoise.connect(lowpass);
        lowpass.connect(mainGain);
        noiseNodeRef.current = pinkNoise;
      }

      setAudioPlaying(true);
    } catch (e) {
      console.error("Failed to start audio synthesizer:", e);
    }
  };

  const stopAudio = () => {
    try {
      if (oscLRef.current) { oscLRef.current.stop(); oscLRef.current.disconnect(); oscLRef.current = null; }
      if (oscRRef.current) { oscRRef.current.stop(); oscRRef.current.disconnect(); oscRRef.current = null; }
      if (lfoRef.current) { lfoRef.current.stop(); lfoRef.current.disconnect(); lfoRef.current = null; }
      if (noiseNodeRef.current) { noiseNodeRef.current.disconnect(); noiseNodeRef.current = null; }
      if (audioCtxRef.current) { audioCtxRef.current.close(); audioCtxRef.current = null; }
      setAudioPlaying(false);
    } catch (e) {
      console.error("Failed to cleanly stop audio synthesizer:", e);
    }
  };

  const handleToggleAudio = () => {
    if (audioPlaying) {
      stopAudio();
    } else {
      startAudio();
    }
  };

  // Handle dynamic frequency change during live play
  useEffect(() => {
    if (audioPlaying && soundProfile === "Binaural") {
      stopAudio();
      setTimeout(() => startAudio(), 80);
    }
  }, [focusFrequency, soundProfile]);

  // Adjust volume on the fly
  useEffect(() => {
    if (mainGainRef.current && audioCtxRef.current) {
      mainGainRef.current.gain.setValueAtTime(volume, audioCtxRef.current.currentTime);
    }
  }, [volume]);

  // Cleanup audio context on unmount
  useEffect(() => {
    return () => {
      stopAudio();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // --- 3. WAVE ANIMATION CANVAS ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;

    const handleResize = () => {
      if (canvas) {
        width = canvas.width = canvas.offsetWidth;
        height = canvas.height = canvas.offsetHeight;
      }
    };
    window.addEventListener("resize", handleResize);

    let phase = 0;
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Determine colors based on play state
      const strokeColor = audioPlaying ? "rgba(6, 182, 212, 0.75)" : "rgba(148, 163, 184, 0.25)";
      const glowColor = audioPlaying ? "rgba(6, 182, 212, 0.15)" : "transparent";

      // Draw beautiful ambient wave
      ctx.shadowBlur = audioPlaying ? 15 : 0;
      ctx.shadowColor = strokeColor;
      ctx.lineWidth = 2.5;

      // Draw Wave 1 (Base Wave)
      ctx.beginPath();
      for (let x = 0; x < width; x++) {
        const frequencyScale = focusFrequency === "Beta" ? 0.04 : focusFrequency === "Alpha" ? 0.025 : 0.015;
        const amplitude = audioPlaying ? (20 + Math.sin(phase * 0.5) * 5) : 3;
        const y = height / 2 + Math.sin(x * frequencyScale + phase) * amplitude;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = strokeColor;
      ctx.stroke();

      // Draw Wave 2 (Harmonic Wave)
      ctx.shadowBlur = 0;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let x = 0; x < width; x++) {
        const frequencyScale = focusFrequency === "Beta" ? 0.08 : focusFrequency === "Alpha" ? 0.05 : 0.03;
        const amplitude = audioPlaying ? (10 + Math.cos(phase * 0.3) * 3) : 2;
        const y = height / 2 + Math.cos(x * frequencyScale - phase * 1.5) * amplitude;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = audioPlaying ? "rgba(99, 102, 241, 0.45)" : "rgba(148, 163, 184, 0.15)";
      ctx.stroke();

      phase += audioPlaying ? (focusFrequency === "Beta" ? 0.12 : focusFrequency === "Alpha" ? 0.07 : 0.04) : 0.005;
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [audioPlaying, focusFrequency, soundProfile]);

  // --- 4. TELL ME ANYTHING (AI MIND DUMP) SUBMISSION ---
  const handleDumpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dumpText.trim()) return;

    setIsAnalyzing(true);
    setAnalysisResult(null);
    setAddedTasks({});

    try {
      const response = await fetch("/api/dump", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dumpText })
      });
      const data = await response.json();
      setAnalysisResult({
        refactorFeedback: data.refactorFeedback,
        stressReleasePct: data.stressReleasePct || 40,
        suggestedTasks: data.suggestedTasks || []
      });
      triggerToast("Mind Dump processed successfully. Emotional clarity restored!");
    } catch (err) {
      console.error(err);
      triggerToast("Failed to process dump. Falling back to offline local converter.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConvertTask = (task: any, index: number) => {
    onAddTask(task.title, task.priority, task.description || "Task generated from Mind Dump session.");
    setAddedTasks(prev => ({ ...prev, [index]: true }));
    triggerToast(`Added "${task.title}" to active planner!`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20">
      
      {/* LEFT COLUMN: Sound Resonator & Ambient Beats Synthesis (7 Cols) */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Abstract Soundscape Synth Module */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-[28px] p-6 shadow-xl relative overflow-hidden text-white">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[70px] pointer-events-none"></div>
          
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-cyan-400" />
                <h2 className="font-extrabold text-base text-white tracking-tight">Audio Focus Synthesizer</h2>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time Web Audio Resonance Engine</p>
            </div>
            <div className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
              audioPlaying 
                ? 'bg-cyan-950/80 text-cyan-400 border border-cyan-500/30' 
                : 'bg-slate-800 text-slate-500 border border-slate-700/50'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${audioPlaying ? 'bg-cyan-400 animate-ping' : 'bg-slate-600'}`}></span>
              {audioPlaying ? 'Synthesizing Audio' : 'Standby'}
            </div>
          </div>

          {/* Sound Wave Canvas Indicator */}
          <div className="bg-slate-950/80 border border-slate-800/60 rounded-2xl h-24 mb-6 relative overflow-hidden flex items-center justify-center">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
            {!audioPlaying && (
              <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest bg-slate-900/60 px-3 py-1 rounded-full border border-slate-800/40 z-10 pointer-events-none">
                Hit play to start wave synthesis
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            {/* Audio Profile Selector */}
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Soundscapes</label>
              <div className="space-y-1.5">
                {[
                  { id: "Binaural", label: "Binaural Beats", desc: "Dual frequency acoustic wave entrainment." },
                  { id: "DeepSpace", label: "Deep Space Ambient", desc: "Slow frequency sweeping cosmic synthesizers." },
                  { id: "PinkNoise", label: "Organic Pink Noise", desc: "Soothing natural static noise blocks." }
                ].map((prof) => {
                  const isActive = soundProfile === prof.id;
                  return (
                    <button
                      key={prof.id}
                      onClick={() => {
                        setSoundProfile(prof.id as any);
                        triggerToast(`Soundscape profile changed to ${prof.label}`);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all ${
                        isActive
                          ? "bg-cyan-500 border-cyan-400 text-slate-950 font-extrabold"
                          : "bg-slate-950/50 border-slate-800/80 hover:bg-slate-800/60 text-slate-300"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold">{prof.label}</span>
                        {isActive && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                      </div>
                      <p className={`text-[9px] mt-0.5 ${isActive ? 'text-slate-900/75' : 'text-slate-500'}`}>{prof.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Frequencies / Tone modulation */}
            <div className="flex flex-col justify-between">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Entrainment Frequency</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
                  {[
                    { id: "Alpha", wave: "Alpha (12Hz)", use: "Deep Study" },
                    { id: "Beta", wave: "Beta (20Hz)", use: "High Focus" },
                    { id: "Theta", wave: "Theta (6Hz)", use: "Meditation" },
                    { id: "Delta", wave: "Delta (3Hz)", use: "Deep Rest" }
                  ].map((freq) => {
                    const isActive = focusFrequency === freq.id;
                    return (
                      <button
                        key={freq.id}
                        disabled={soundProfile !== "Binaural"}
                        onClick={() => {
                          setFocusFrequency(freq.id as any);
                          triggerToast(`Synthesizer shifted to ${freq.wave}`);
                        }}
                        className={`p-2 rounded-lg text-left transition-all ${
                          soundProfile !== "Binaural" 
                            ? "opacity-30 cursor-not-allowed" 
                            : isActive
                              ? "bg-cyan-950 text-cyan-400 border border-cyan-800 font-extrabold shadow-inner"
                              : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <p className="text-[10px] font-black uppercase tracking-wider">{freq.id}</p>
                        <p className="text-[9px] text-slate-500 mt-0.5">{freq.use}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Volume Slider */}
              <div className="mt-4">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 mb-1">
                  <span>Synthesizer Volume</span>
                  <span className="font-black text-cyan-400">{Math.round(volume * 100)}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <VolumeX className="w-4 h-4 text-slate-500" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="flex-grow h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
                  />
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Master Control Trigger */}
          <div className="flex gap-4 border-t border-slate-800/80 pt-5 items-center justify-between">
            <p className="text-[10px] text-slate-400 font-medium leading-relaxed max-w-sm">
              *Synthesizers use browser-synthesized audio nodes. Works instantly offline without external asset downloading. Best experienced with headphones.
            </p>
            <button
              onClick={handleToggleAudio}
              className={`px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all ${
                audioPlaying
                  ? 'bg-rose-600 text-white hover:bg-rose-500 shadow-lg shadow-rose-950/40'
                  : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-lg shadow-cyan-500/20'
              }`}
            >
              {audioPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  Deactivate Sound
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  Activate Resonance
                </>
              )}
            </button>
          </div>
        </div>

        {/* Relocated Quantum Focus Resonator Component */}
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border border-cyan-500/20 rounded-[28px] p-6 shadow-2xl relative overflow-hidden text-white">
          <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-[60px] pointer-events-none"></div>

          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
              <div>
                <h3 className="font-extrabold text-sm text-white">Quantum Focus Resonator</h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Cognitive Entrainment Engine</p>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-cyan-950/80 border border-cyan-800/60 px-2 py-0.5 rounded-full text-[9px] font-extrabold text-cyan-400">
              <Sparkles className="w-3 h-3 fill-current animate-spin" />
              Resonance Active
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800/60 mb-4">
            {(["Alpha", "Beta", "Theta", "Delta"] as const).map((freq) => {
              const isActive = focusFrequency === freq;
              return (
                <button
                  key={freq}
                  onClick={() => {
                    setFocusFrequency(freq);
                    triggerToast(`Resonator frequency shifted to ${freq} waves.`);
                  }}
                  className={`py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                    isActive
                      ? "bg-cyan-500 text-slate-950 shadow-md font-black"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {freq}
                </button>
              );
            })}
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden min-h-[140px] mb-4">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.06)_0%,transparent_70%)]"></div>

            {isResonatorActive ? (
              <div className="flex flex-col items-center justify-center w-full z-10 text-center">
                <div 
                  className="w-16 h-16 rounded-full border border-cyan-500/40 flex items-center justify-center bg-cyan-500/10 transition-all duration-300 relative"
                  style={{ 
                    transform: `scale(${1 + (breathingProgress / 200)})`,
                    boxShadow: `0 0 ${20 + (breathingProgress / 5)}px rgba(6, 182, 212, ${0.15 + (breathingProgress / 200)})` 
                  }}
                >
                  <div className="w-10 h-10 rounded-full bg-cyan-400/25 flex items-center justify-center">
                    <div className="w-5 h-5 rounded-full bg-cyan-400 animate-ping"></div>
                  </div>
                </div>
                
                <p className="text-xs font-black text-white mt-4 uppercase tracking-widest min-h-[20px]">
                  {breathingPhase === "Inhale" && "Inhale..."}
                  {breathingPhase === "Hold" && "Hold Focus..."}
                  {breathingPhase === "Exhale" && "Exhale..."}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Synchronizing heart-rate variability for high-efficiency deep blocks
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center z-10 py-2">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 mb-2">
                  <Play className="w-5 h-5 text-slate-400 ml-0.5" />
                </div>
                <p className="text-xs font-black text-slate-300">Resonator Standby</p>
                <p className="text-[10px] text-slate-500 mt-1 max-w-[200px]">
                  Align audio-visual frequency blocks to calibrate cognitive endurance.
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-between items-center bg-slate-900/50 p-3 rounded-xl border border-slate-800/40">
            <div className="text-left">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Cognitive Core Score</p>
              <p className="text-lg font-black text-cyan-400 tracking-tight">{cognitiveScore}% <span className="text-[10px] font-bold text-emerald-500">Peak</span></p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  const nextActive = !isResonatorActive;
                  setIsResonatorActive(nextActive);
                  if (nextActive) {
                    triggerToast("Quantum Focus Resonator activated.");
                  }
                }}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                  isResonatorActive
                    ? "bg-rose-500 hover:bg-rose-600 text-white"
                    : "bg-cyan-500 hover:bg-cyan-400 text-slate-950"
                }`}
              >
                {isResonatorActive ? "Pause Core" : "Initiate Focus"}
              </button>

              {isResonatorActive && (
                <button
                  onClick={() => {
                    setLoggedSessions(prev => prev + 1);
                    setCognitiveScore(99);
                    triggerToast("Focus Milestone logged securely!");
                  }}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 border border-slate-700"
                >
                  <Award className="w-3.5 h-3.5 text-amber-400 fill-current" />
                  Log Peak
                </button>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: "Tell Me Anything" Brain Dump & Clarity Converter (5 Cols) */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* Deep Focus Timer */}
        <DeepFocusTimer />
        
        <div className="bg-white border border-slate-200 rounded-[28px] p-6 shadow-sm flex flex-col justify-between min-h-[500px]">
          <div>
            <div className="flex items-center gap-2.5 mb-2 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">"Tell Me Anything" Panel</h3>
                <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Mind Dump & Clarity Converter</p>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed mb-4 font-medium">
              We always ask AI to do things. Let's start with **telling** it something. Vent your frustrations, stream your ideas, list your unstructured thoughts, or dump your anxieties below. The AI will listen, synthesize, and extract structured actions to clear your mind.
            </p>

            {/* Voice Venting Module Controls */}
            <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 mb-4.5 space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-rose-500 animate-pulse' : 'bg-slate-300'}`} />
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
                    {isRecording ? (isSimulated ? "Voice Simulation Channel Active" : "Live Speech Capture Active") : "Voice Channel Ready"}
                  </span>
                </div>
                {isRecording && (
                  <span className="text-xs font-mono font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                    {formatDuration(recordDuration)}
                  </span>
                )}
              </div>

              {isRecording ? (
                <div className="flex flex-col items-center justify-center py-4 bg-slate-900 rounded-xl text-white relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.1)_0%,transparent_70%)] animate-pulse pointer-events-none"></div>
                  
                  {/* Glowing Pulse Rings */}
                  <div className="relative flex items-center justify-center mb-2">
                    <div className="absolute w-12 h-12 rounded-full bg-rose-500/25 animate-ping"></div>
                    <div className="w-10 h-10 rounded-full bg-rose-600 flex items-center justify-center shadow-lg shadow-rose-600/30">
                      <Mic className="w-4.5 h-4.5 text-white animate-pulse" />
                    </div>
                  </div>

                  {/* Equalizer Waveform Lines */}
                  <div className="flex items-end gap-1 mt-2.5 h-6">
                    {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((v, i) => {
                      const heights = [14, 20, 24, 18, 12, 16, 22, 15, 10];
                      return (
                        <span 
                          key={i} 
                          className="w-1 bg-gradient-to-t from-indigo-400 to-rose-400 rounded-full transition-all duration-200"
                          style={{
                            height: `${heights[i]}px`,
                          }}
                        />
                      );
                    })}
                  </div>

                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2.5">
                    {isSimulated ? "Simulated Speech Capturer" : "Dictating stream into mind dump..."}
                  </p>
                  
                  <button
                    type="button"
                    onClick={stopVoiceRecording}
                    className="mt-3.5 px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition-all shadow-md shadow-rose-950/20"
                  >
                    Finish Recording
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-white border border-slate-200/50 p-3 rounded-xl">
                  <div className="text-left">
                    <p className="text-[10px] font-black text-slate-800 uppercase tracking-wide">Vent via Voice Channel</p>
                    <p className="text-[9px] text-slate-400 font-semibold leading-relaxed">No typing needed. Just tap mic to talk and we'll translate.</p>
                  </div>
                  <button
                    type="button"
                    onClick={startVoiceRecording}
                    className="p-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 hover:text-indigo-700 rounded-xl transition-all border border-indigo-100 flex items-center justify-center shadow-sm"
                    title="Start Voice Venting"
                  >
                    <Mic className="w-4.5 h-4.5" />
                  </button>
                </div>
              )}
            </div>

            <form onSubmit={handleDumpSubmit} className="space-y-4">
              <div className="relative">
                <textarea
                  value={dumpText}
                  onChange={(e) => setDumpText(e.target.value)}
                  placeholder="Tell me anything... E.g., 'I have this massive design review on Friday, but my desk is messy, I haven't written the email draft, and I'm stressed about the presentation layout...'"
                  rows={6}
                  className="w-full text-xs p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none text-slate-800 font-medium"
                />
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  {dumpText.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setDumpText("");
                        triggerToast("Text cleared.");
                      }}
                      className="text-[9px] text-slate-400 font-bold bg-white px-2 py-0.5 rounded-full border border-slate-200 hover:text-rose-500 transition-colors shadow-sm"
                    >
                      Clear
                    </button>
                  )}
                  <span className="text-[9px] text-slate-400 font-bold bg-white px-2 py-0.5 rounded-full border border-slate-100 shadow-sm pointer-events-none">
                    {dumpText.length} chars
                  </span>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isAnalyzing || !dumpText.trim()}
                  className={`px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all ${
                    isAnalyzing || !dumpText.trim()
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                      : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-950/20"
                  }`}
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin"></div>
                      De-cluttering Mind...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Refactor Thoughts
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* AI Clarity Response */}
          {analysisResult && (
            <div className="mt-6 bg-slate-50 border border-slate-200/60 rounded-2xl p-4.5 space-y-4 animate-scaleUp">
              
              {/* Feedback Summary */}
              <div>
                <h4 className="text-[10px] font-black uppercase text-indigo-600 tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 fill-current" />
                  AI Clarity Reflection
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed font-semibold italic">
                  "{analysisResult.refactorFeedback}"
                </p>
              </div>

              {/* Stress Release Score Meter */}
              <div className="bg-white border border-slate-200/50 p-3 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Cognitive Release Index</p>
                  <p className="text-xs font-black text-slate-800 mt-0.5">Your mind is lighter by <span className="text-emerald-500">+{analysisResult.stressReleasePct}%</span></p>
                </div>
                <div className="w-12 h-12 rounded-full border-4 border-emerald-100 flex items-center justify-center bg-emerald-50 text-emerald-600 text-xs font-black">
                  {analysisResult.stressReleasePct}%
                </div>
              </div>

              {/* Action Extraction */}
              {analysisResult.suggestedTasks && analysisResult.suggestedTasks.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[9px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 text-slate-500" />
                    Structured Tasks Extracted
                  </h4>
                  
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                    {analysisResult.suggestedTasks.map((task, idx) => {
                      const isAdded = addedTasks[idx];
                      return (
                        <div key={idx} className="bg-white border border-slate-200 p-3 rounded-xl flex items-start justify-between gap-3 shadow-xs">
                          <div className="space-y-0.5">
                            <span className={`inline-block px-1.5 py-0.25 rounded text-[8px] font-black uppercase tracking-wider ${
                              task.priority === 'URGENT' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                              task.priority === 'HIGH' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                              'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}>
                              {task.priority}
                            </span>
                            <h5 className="text-xs font-black text-slate-800">{task.title}</h5>
                            <p className="text-[10px] text-slate-500 leading-normal font-medium">{task.description}</p>
                          </div>
                          
                          <button
                            onClick={() => handleConvertTask(task, idx)}
                            disabled={isAdded}
                            className={`p-1.5 rounded-lg border transition-all shrink-0 ${
                              isAdded
                                ? "bg-emerald-50 border-emerald-200 text-emerald-600 cursor-default"
                                : "bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-600 hover:text-white"
                            }`}
                          >
                            {isAdded ? <Check className="w-3.5 h-3.5 stroke-[3.5px]" /> : <Plus className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Shared Alerts / Toast Messages */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl z-50 text-xs font-bold border border-slate-800 flex items-center gap-2 animate-scaleUp">
          <Sparkles className="w-4 h-4 text-cyan-400 fill-current animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}

import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Shield, 
  Sparkles, 
  Clock, 
  Flame, 
  Check, 
  Coffee,
  AlertCircle
} from "lucide-react";

export default function DeepFocusTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // Default 25 minutes
  const [initialTime, setInitialTime] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isDndActive, setIsDndActive] = useState(true);
  const [soundSelected, setSoundSelected] = useState<"Mute" | "Binaural" | "Rain" | "Hum">("Mute");
  const [volume, setVolume] = useState(0.4);

  // Audio nodes refs for Web Audio API
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Interval reference
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Manage countdown timer
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            stopAudio();
            if (intervalRef.current) clearInterval(intervalRef.current);
            // Trigger browser sound/alert if possible
            try {
              const alertCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
              const osc = alertCtx.createOscillator();
              const gain = alertCtx.createGain();
              osc.connect(gain);
              gain.connect(alertCtx.destination);
              osc.type = "sine";
              osc.frequency.setValueAtTime(523.25, alertCtx.currentTime); // C5 note
              gain.gain.setValueAtTime(0.1, alertCtx.currentTime);
              osc.start();
              osc.stop(alertCtx.currentTime + 1);
            } catch (e) {
              console.warn(e);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  // Manage Web Audio synthesis based on soundSelected & isRunning
  useEffect(() => {
    if (isRunning && soundSelected !== "Mute") {
      startAudio();
    } else {
      stopAudio();
    }
  }, [soundSelected, isRunning]);

  // Handle live volume change
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(volume, audioCtxRef.current.currentTime);
    }
  }, [volume]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startAudio = () => {
    stopAudio(); // Reset any existing active sounds first

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(volume, ctx.currentTime);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      if (soundSelected === "Binaural") {
        // Binaural Beat: Left Ear 150Hz, Right Ear 162Hz (12Hz Alpha frequency)
        const oscL = ctx.createOscillator();
        const oscR = ctx.createOscillator();
        const pannerL = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        const pannerR = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

        oscL.frequency.setValueAtTime(150, ctx.currentTime);
        oscR.frequency.setValueAtTime(162, ctx.currentTime);

        if (pannerL && pannerR) {
          pannerL.pan.setValueAtTime(-1, ctx.currentTime);
          pannerR.pan.setValueAtTime(1, ctx.currentTime);
          oscL.connect(pannerL).connect(masterGain);
          oscR.connect(pannerR).connect(masterGain);
        } else {
          oscL.connect(masterGain);
          oscR.connect(masterGain);
        }

        oscL.start();
        oscR.start();

        // Save reference (we'll pack oscillators inside an array or dynamic structure)
        sourceNodeRef.current = oscL; // Save left oscillator as standard handle
        // Stash right osc to close it on stop
        (sourceNodeRef as any).secondaryNode = oscR;

      } else if (soundSelected === "Rain") {
        // Synthesizing rain using custom white noise buffer
        const bufferSize = ctx.sampleRate * 2; // 2 seconds of noise
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noiseNode = ctx.createBufferSource();
        noiseNode.buffer = buffer;
        noiseNode.loop = true;

        // Lowpass filter to make it sound like gentle rain/brownian sound
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(750, ctx.currentTime);

        noiseNode.connect(filter);
        filter.connect(masterGain);
        noiseNode.start();

        sourceNodeRef.current = noiseNode;

      } else if (soundSelected === "Hum") {
        // Deep Space Hum: Low triangle oscillator modulated by a slow LFO
        const mainOsc = ctx.createOscillator();
        mainOsc.type = "triangle";
        mainOsc.frequency.setValueAtTime(80, ctx.currentTime); // low hum

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(250, ctx.currentTime);

        // Slow LFO to sweep filter frequency gently
        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.15, ctx.currentTime); // extremely slow sweep
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(100, ctx.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        mainOsc.connect(filter);
        filter.connect(masterGain);

        mainOsc.start();
        lfo.start();

        sourceNodeRef.current = mainOsc;
        (sourceNodeRef as any).secondaryNode = lfo;
      }
    } catch (err) {
      console.error("Failed to compile Web Audio focus noise:", err);
    }
  };

  const stopAudio = () => {
    try {
      if (sourceNodeRef.current) {
        (sourceNodeRef.current as any).stop?.();
        sourceNodeRef.current.disconnect();
        sourceNodeRef.current = null;
      }
      if ((sourceNodeRef as any).secondaryNode) {
        (sourceNodeRef as any).secondaryNode.stop?.();
        (sourceNodeRef as any).secondaryNode.disconnect();
        (sourceNodeRef as any).secondaryNode = null;
      }
      if (audioCtxRef.current) {
        if (audioCtxRef.current.state !== "closed") {
          audioCtxRef.current.close();
        }
        audioCtxRef.current = null;
      }
      gainNodeRef.current = null;
    } catch (e) {
      console.warn(e);
    }
  };

  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(initialTime);
    stopAudio();
  };

  const handlePreset = (mins: number) => {
    setIsRunning(false);
    setInitialTime(mins * 60);
    setTimeLeft(mins * 60);
    stopAudio();
  };

  // Calculate percentage of progress circle
  const progressPercent = ((initialTime - timeLeft) / initialTime) * 100;
  // Circumference for a radius 70 circle is 2 * PI * r = 439.8
  const strokeDashoffset = 439.8 - (439.8 * progressPercent) / 100;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-[28px] p-6 shadow-xl relative overflow-hidden text-white">
      {/* Decorative Blur */}
      <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-orange-500/10 rounded-full blur-[60px] pointer-events-none"></div>
      
      <div className="flex justify-between items-start mb-5">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-orange-400 animate-pulse" />
          <div>
            <h3 className="font-extrabold text-sm text-white">Deep Focus Timer</h3>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">High-Priority Task Shield</p>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase transition-all ${
          isRunning 
            ? "bg-orange-500/20 text-orange-400 border border-orange-500/30 animate-pulse" 
            : "bg-slate-800 text-slate-500 border border-slate-700/50"
        }`}>
          <Flame className="w-3.5 h-3.5 fill-current" />
          {isRunning ? "Focusing" : "Standby"}
        </div>
      </div>

      {/* Circle Countdown Display */}
      <div className="flex flex-col items-center justify-center my-4 relative">
        <div className="relative w-44 h-44 flex items-center justify-center">
          {/* SVG Progress Circle */}
          <svg className="w-full h-full transform -rotate-90">
            {/* Background Track */}
            <circle
              cx="88"
              cy="88"
              r="70"
              className="stroke-slate-800"
              strokeWidth="8"
              fill="transparent"
            />
            {/* Progress Bar */}
            <circle
              cx="88"
              cy="88"
              r="70"
              className="stroke-orange-500 transition-all duration-300"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray="439.8"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          
          {/* Inner Text Timer */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-black text-white tracking-tighter leading-none">{formatTime(timeLeft)}</span>
            <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider mt-1.5">
              {isRunning ? "Blocks Locked" : "Set Cycle"}
            </span>
          </div>
        </div>

        {/* Preset Buttons */}
        <div className="flex gap-1.5 mt-3 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
          {[15, 25, 45, 60].map((mins) => {
            const isSelected = initialTime === mins * 60;
            return (
              <button
                key={mins}
                onClick={() => handlePreset(mins)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                  isSelected 
                    ? "bg-orange-500 text-slate-950 font-black shadow-md" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {mins}m
              </button>
            );
          })}
        </div>
      </div>

      {/* Sound Selection Grid */}
      <div className="space-y-2.5 mb-5">
        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">
          Focus Audio Shields
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { id: "Mute", label: "Silent" },
            { id: "Binaural", label: "Alpha" },
            { id: "Rain", label: "Rain" },
            { id: "Hum", label: "Hum" }
          ].map((snd) => {
            const isActive = soundSelected === snd.id;
            return (
              <button
                key={snd.id}
                onClick={() => {
                  setSoundSelected(snd.id as any);
                }}
                className={`py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all ${
                  isActive
                    ? "bg-orange-500 border-orange-400 text-slate-950 font-black"
                    : "bg-slate-950/50 border-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                {snd.label}
              </button>
            );
          })}
        </div>

        {soundSelected !== "Mute" && (
          <div className="flex items-center gap-2 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800">
            <VolumeX className="w-3.5 h-3.5 text-slate-500" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="flex-grow h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
            <Volume2 className="w-3.5 h-3.5 text-orange-400" />
          </div>
        )}
      </div>

      {/* DND Toggle & Actions */}
      <div className="space-y-4 border-t border-slate-800/80 pt-4.5">
        
        {/* Block Notifications Shield Indicator */}
        <div 
          onClick={() => setIsDndActive(!isDndActive)}
          className="flex items-center justify-between p-3 bg-slate-950/50 border border-slate-800 rounded-xl cursor-pointer hover:bg-slate-950/80 transition-all"
        >
          <div className="flex items-center gap-2.5">
            <Shield className={`w-4 h-4 ${isDndActive ? "text-emerald-500" : "text-slate-500"}`} />
            <div className="text-left">
              <span className="block text-[10px] font-black uppercase text-slate-200">
                Notification Shield (DND)
              </span>
              <p className="text-[9px] text-slate-500 font-semibold leading-none mt-0.5">
                {isDndActive ? "Active: All warnings and pings muted" : "Inactive: System alerts allowed"}
              </p>
            </div>
          </div>
          <div className={`w-7 h-4 rounded-full p-0.5 transition-colors ${isDndActive ? 'bg-emerald-500' : 'bg-slate-700'}`}>
            <div className={`w-3 h-3 rounded-full bg-white transition-transform ${isDndActive ? 'translate-x-3' : 'translate-x-0'}`} />
          </div>
        </div>

        {/* Master Control Buttons */}
        <div className="flex gap-2.5">
          <button
            onClick={handleStartStop}
            className={`flex-grow py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              isRunning 
                ? "bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/30" 
                : "bg-orange-500 hover:bg-orange-400 text-slate-950 shadow-lg shadow-orange-500/25"
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                Pause Focus
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                Lock focus cycle
              </>
            )}
          </button>
          
          <button
            onClick={handleReset}
            className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all border border-slate-700"
            title="Reset Timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, Sparkles, X, ChevronRight, AlertTriangle, Play, RefreshCw, Bot, Mic, MicOff, Volume2, Car } from "lucide-react";
import { Task, AutonomySettings } from "../types";

interface AiChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentTasks: Task[];
  autonomySettings: AutonomySettings;
  onAddTask: (title: string, priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW', description: string) => void;
  onOptimizeSchedule: () => void;
  currentRoutines: any[];
  onAddRoutine: (title: string, duration: string) => void;
  onNavigate?: (tab: string) => void;
}

interface ChatMessage {
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export default function AiChatDrawer({
  isOpen,
  onClose,
  currentTasks,
  autonomySettings,
  onAddTask,
  onOptimizeSchedule,
  currentRoutines,
  onAddRoutine,
  onNavigate
}: AiChatDrawerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'assistant',
      text: "I'm monitoring your schedule. Your biggest commitment window is approaching. Type 'brief' for a quick morning strategic outlook, or ask me to reschedule overlapping tasks.",
      timestamp: "10:23 AM"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    // Set up SpeechRecognition if available in the browser window
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false; // Capture a single utterance
      rec.interimResults = false; // Only finalize on complete sentence
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
        setRecognitionError(null);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputValue(prev => {
            const gap = prev.trim() ? " " : "";
            return prev + gap + transcript;
          });
        }
      };

      rec.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error);
        if (event.error === 'not-allowed') {
          setRecognitionError("Microphone access denied. Please check your browser permission settings.");
        } else {
          setRecognitionError(`Voice Input Error: ${event.error}`);
        }
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if (!recognitionRef.current) {
        setRecognitionError("Speech-to-Text is not fully supported in your current browser.");
        return;
      }
      try {
        setRecognitionError(null);
        recognitionRef.current.start();
      } catch (err: any) {
        console.error("Failed to start speech recognition:", err);
        setRecognitionError("Failed to access microphone. Please check permissions.");
      }
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanedText = text
        .replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDFFF]/g, '')
        .replace(/[*#_`~]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanedText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } else {
      setRecognitionError("Speech synthesis is not supported in this browser.");
    }
  };

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputValue.trim();
    if (!text) return;

    if (!textToSend) {
      setInputValue("");
    }

    const wasListening = isListening;
    // Stop listening if we send message
    if (isListening) {
      recognitionRef.current?.stop();
    }

    const newMsg: ChatMessage = {
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-10).map(m => ({ role: m.sender === 'user' ? 'user' : 'model', parts: [{ text: m.text }] })),
          currentTasks,
          currentRoutines,
          autonomyLevel: autonomySettings.level
        })
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      
      // Proactively handle tasks parsed directly from AI response
      if (data.taskToAdd) {
        onAddTask(
          data.taskToAdd.title, 
          data.taskToAdd.priority || "HIGH", 
          data.taskToAdd.description || "Identified and added via AI co-pilot voice/chat command."
        );
      } else if (data.routineToAdd) {
        onAddRoutine(
          data.routineToAdd.title,
          data.routineToAdd.duration || "15 min"
        );
      } else if (text.toLowerCase().includes("add routine") || text.toLowerCase().includes("schedule routine")) {
        // Fallback local keyword trigger for routines
        const routineTitle = text.replace(/add routine|schedule routine/gi, "").trim() || "AI Generated Routine Chores";
        onAddRoutine(routineTitle, "15 min");
      } else if (text.toLowerCase().includes("add") || text.toLowerCase().includes("schedule task")) {
        // Fallback local keyword trigger for tasks
        const taskTitle = text.replace(/add task|schedule task/gi, "").trim() || "AI Generated Action Item";
        onAddTask(taskTitle, "HIGH", "Added via AI Smart Voice/Chat Assistant context.");
      }

      if (data.shouldOptimize) {
        onOptimizeSchedule();
      } else if (text.toLowerCase().includes("optimize") || text.toLowerCase().includes("reschedule")) {
        // Fallback local keyword trigger
        onOptimizeSchedule();
      }

      setMessages(prev => [...prev, {
        sender: 'assistant',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      }]);

      // Speak the response if the user triggered it via voice or if autoSpeak is desired
      if (wasListening) {
        speakText(data.reply);
      }
    } catch (err: any) {
      const offlineReply = `I had an issue connecting to my core. Here is my offline response: Let's focus on your high-risk deadlines, and starting work now ensures a safe completion window before tonight.`;
      setMessages(prev => [...prev, {
        sender: 'assistant',
        text: offlineReply,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      }]);
      if (wasListening) {
        speakText(offlineReply);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (actionText: string) => {
    handleSend(actionText);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-slate-950 border-l border-slate-800 shadow-2xl z-50 flex flex-col font-sans text-slate-100">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center shadow-lg shadow-orange-950/50">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-base flex items-center gap-1.5">
              AI Command Assistant
              <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Online
              </span>
            </h3>
            <p className="text-xs text-slate-400">Autonomous co-pilot mode calibrated</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Window */}
      <div className="flex-grow p-4 overflow-y-auto space-y-4">
        {/* Warning notification */}
        <div className="bg-orange-950/40 border border-orange-900/50 rounded-2xl p-4 flex gap-3 text-sm">
          <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-orange-200">Autonomous Rescue Active</p>
            <p className="text-xs text-orange-300 mt-1">
              The AI can automatically detect deadline warnings and recommend micro-actions. Ask for your morning brief to start.
            </p>
          </div>
        </div>

        {messages.map((m, idx) => {
          const isLogistical = m.sender === 'assistant' && (
            m.text.toLowerCase().includes("taxi") || 
            m.text.toLowerCase().includes("uber") || 
            m.text.toLowerCase().includes("flight") || 
            m.text.toLowerCase().includes("boarding") || 
            m.text.toLowerCase().includes("dispatch") || 
            m.text.toLowerCase().includes("logistics") || 
            m.text.toLowerCase().includes("quick assist") || 
            m.text.toLowerCase().includes("action targets") || 
            m.text.toLowerCase().includes("track ride") || 
            m.text.toLowerCase().includes("sfo") || 
            m.text.toLowerCase().includes("airport")
          );

          return (
            <div 
              key={idx} 
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className={`max-w-[85%] rounded-2xl p-4 ${
                m.sender === 'user' 
                  ? 'bg-orange-600 text-white rounded-tr-none' 
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
              }`}>
                <div className="flex items-center gap-2 mb-1.5">
                  {m.sender === 'assistant' ? (
                    <>
                      <Bot className="w-4 h-4 text-orange-400" />
                      <button 
                        onClick={() => speakText(m.text)}
                        className="p-1 hover:bg-slate-800 text-slate-400 hover:text-orange-400 rounded-lg transition-colors cursor-pointer"
                        title="Speak message aloud"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : null}
                  <span className="text-[10px] font-bold opacity-60 uppercase tracking-wider">
                    {m.sender === 'user' ? 'You' : 'LM Co-Pilot'}
                  </span>
                  <span className="text-[9px] opacity-40 ml-auto">{m.timestamp}</span>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</p>
              </div>

              {isLogistical && onNavigate && (
                <div className="mt-2 bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-3.5 max-w-[85%] shadow-xl shadow-cyan-950/20">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-lg bg-cyan-950 text-cyan-400 flex items-center justify-center border border-cyan-800/30">
                      <Car className="w-3.5 h-3.5 animate-pulse" />
                    </div>
                    <p className="text-[10px] font-black text-cyan-300 uppercase tracking-widest">
                      Switch to Dispatch Deck
                    </p>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed mb-2.5">
                    This Chat Assistant handles verbal workflows. Uber rides, flight tracking, and action target configurations should be managed & tracked visually in the **Quick Assist** cockpit!
                  </p>
                  <button
                    onClick={() => {
                      onNavigate("quick-assist");
                      onClose();
                    }}
                    className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer shadow-md"
                  >
                    Open Dispatch Deck
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 rounded-tl-none flex items-center gap-3">
              <RefreshCw className="w-4 h-4 text-orange-500 animate-spin" />
              <span className="text-xs text-slate-400 font-medium">Co-Pilot is planning...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Suggestions */}
      <div className="p-3 bg-slate-900/30 border-t border-slate-900 flex flex-wrap gap-2">
        <button 
          onClick={() => handleQuickAction("Generate daily morning brief")}
          className="text-xs font-semibold px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 rounded-full flex items-center gap-1.5 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-orange-400" />
          Morning Strategy Brief
        </button>
        <button 
          onClick={() => handleQuickAction("Do I have any deadline collision risks today?")}
          className="text-xs font-semibold px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 rounded-full flex items-center gap-1.5 transition-colors"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
          Deadline Risks Check
        </button>
        <button 
          onClick={() => handleQuickAction("Help me reschedule my routine tasks")}
          className="text-xs font-semibold px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 rounded-full flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-orange-400" />
          Reschedule Overlaps
        </button>
      </div>

      {/* Input Box with Voice & Send */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex flex-col gap-2">
        {recognitionError && (
          <div className="text-[11px] text-red-400 font-semibold px-3 py-1.5 bg-red-950/40 rounded-xl border border-red-900/50">
            {recognitionError}
          </div>
        )}
        <div className="flex items-center gap-2.5">
          <button
            onClick={toggleListening}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all shrink-0 border relative ${
              isListening
                ? "bg-red-600 border-red-500 text-white animate-pulse shadow-lg shadow-red-950/40"
                : "bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white"
            }`}
            title={isListening ? "Stop Listening" : "Start Voice Input (Speech to Text)"}
          >
            {isListening ? (
              <>
                <MicOff className="w-5 h-5 z-10" />
                <span className="absolute inset-0 rounded-xl bg-red-500/20 animate-ping"></span>
              </>
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>
          
          <input 
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isListening ? "Listening to your voice... Speak now!" : "Ask AI to schedule, rescue, or plan..."}
            className={`flex-grow bg-slate-950 border focus:border-orange-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all placeholder:text-slate-600 text-white ${
              isListening ? "ring-2 ring-red-500/40 border-red-500 placeholder:text-red-400" : "border-slate-800"
            }`}
          />
          
          <button 
            onClick={() => handleSend()}
            className="w-11 h-11 rounded-xl bg-orange-600 hover:bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-950/40 transition-all text-white shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  Mic, 
  MicOff, 
  Zap, 
  Clock, 
  CheckCircle2, 
  Calendar, 
  Plane, 
  MapPin, 
  Compass, 
  ChevronRight, 
  Sliders, 
  X, 
  ShieldAlert, 
  Check, 
  Cpu, 
  Smartphone, 
  MessageSquare,
  Volume2,
  TrendingUp,
  AlertTriangle,
  History,
  Navigation,
  Activity,
  Play,
  Award,
  Plus,
  Trash2,
  Edit2,
  Car,
  Bot
} from "lucide-react";
import { Task, AIProposal, AutonomySettings } from "../types";

interface QuickAssistAiProps {
  tasks: Task[];
  settings: AutonomySettings;
  proposals: AIProposal[];
  onUpdateSettings: (settings: AutonomySettings) => void;
  onApplyProposal: (id: string) => void;
  onApplyAllProposals: () => void;
  onAddTask: (title: string, priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW', description?: string, dueDate?: string) => void;
  onLogActivity?: (type: 'AI_ASSISTANT' | 'SYSTEM_ALERT' | 'USER_ACTION', message: string) => void;
  onOpenChat?: () => void;
}

export default function QuickAssistAi({
  tasks,
  settings,
  proposals,
  onUpdateSettings,
  onApplyProposal,
  onApplyAllProposals,
  onAddTask,
  onLogActivity,
  onOpenChat
}: QuickAssistAiProps) {
  // Voice simulation state
  const [isListening, setIsListening] = useState(false);
  const [captionIndex, setCaptionIndex] = useState(-1);
  const [customCommand, setCustomCommand] = useState("");
  
  // Interface definitions for dynamic dispatch & action targets
  interface DispatchOperation {
    id: string;
    type: 'FLIGHT' | 'MEETING' | 'TAXI' | 'EMAIL_SUMMARY' | 'CUSTOM';
    title: string;
    description: string;
    urgency: 'URGENT' | 'CALENDAR' | 'LIVE' | 'INFO' | 'ROUTINE';
    statusLabel?: string;
    statusColor?: string;
    iconType: 'plane' | 'calendar' | 'car' | 'mail' | 'zap' | 'navigation';
    meta?: {
      taxiStatus?: 'idle' | 'dispatching' | 'on_way' | 'arrived';
      taxiEta?: number;
      boardingPassNum?: string;
      seat?: string;
      emailPoints?: string[];
    };
  }

  interface ActionTarget {
    id: string;
    title: string;
    icon: 'map-pin' | 'compass' | 'phone' | 'mail' | 'zap' | 'car' | 'calendar' | 'plane';
    actionType: 'TAXI' | 'EMAIL_SUMMARY' | 'FLIGHT' | 'MEETING' | 'CUSTOM';
    description?: string;
  }

  // Dynamic state for Active Dispatch Operations
  const [operations, setOperations] = useState<DispatchOperation[]>([
    {
      id: "op-flight",
      type: "FLIGHT",
      title: "Booked your flight",
      description: "Delta DL142 leaves at 6:45 PM tomorrow. Seat 4C reserved. Flight info sync completed.",
      urgency: "URGENT",
      statusLabel: "URGENT",
      statusColor: "bg-amber-50 text-amber-600 border-amber-100",
      iconType: "plane",
      meta: {
        boardingPassNum: "DL-142-4C",
        seat: "4C"
      }
    },
    {
      id: "op-meeting",
      type: "MEETING",
      title: "Rescheduled Meeting",
      description: "Sync with Marketing moved to Friday at 9:00 AM. 3 attendees notified. Checked for conflicts.",
      urgency: "CALENDAR",
      statusLabel: "CALENDAR",
      statusColor: "bg-cyan-50 text-cyan-600 border-cyan-100",
      iconType: "calendar"
    }
  ]);

  // Compatibility wrappers & getters to prevent breaking existing scripts
  const hasFlight = operations.some(o => o.type === 'FLIGHT');
  const setHasFlight = (val: boolean) => {
    if (val) {
      if (!operations.some(o => o.type === 'FLIGHT')) {
        setOperations(prev => [
          ...prev,
          {
            id: "op-flight",
            type: "FLIGHT",
            title: "Booked your flight",
            description: "Delta DL142 leaves at 6:45 PM tomorrow. Seat 4C reserved. Flight info sync completed.",
            urgency: "URGENT",
            statusLabel: "URGENT",
            statusColor: "bg-amber-50 text-amber-600 border-amber-100",
            iconType: "plane",
            meta: {
              boardingPassNum: "DL-142-4C",
              seat: "4C"
            }
          }
        ]);
      }
    } else {
      setOperations(prev => prev.filter(o => o.type !== 'FLIGHT'));
    }
  };

  const hasMeeting = operations.some(o => o.type === 'MEETING');
  const setHasMeeting = (val: boolean) => {
    if (val) {
      if (!operations.some(o => o.type === 'MEETING')) {
        setOperations(prev => [
          ...prev,
          {
            id: "op-meeting",
            type: "MEETING",
            title: "Rescheduled Meeting",
            description: "Sync with Marketing moved to Friday at 9:00 AM. 3 attendees notified. Checked for conflicts.",
            urgency: "CALENDAR",
            statusLabel: "CALENDAR",
            statusColor: "bg-cyan-50 text-cyan-600 border-cyan-100",
            iconType: "calendar"
          }
        ]);
      }
    } else {
      setOperations(prev => prev.filter(o => o.type !== 'MEETING'));
    }
  };

  const taxiOp = operations.find(o => o.type === 'TAXI');
  const taxiStatus = taxiOp ? (taxiOp.meta?.taxiStatus ?? "idle") : "idle";
  const taxiEta = taxiOp ? (taxiOp.meta?.taxiEta ?? 12) : 12;

  const setTaxiStatus = (status: 'idle' | 'dispatching' | 'on_way' | 'arrived') => {
    if (status === 'idle') {
      setOperations(prev => prev.filter(o => o.type !== 'TAXI'));
    } else {
      setOperations(prev => {
        const exists = prev.some(o => o.type === 'TAXI');
        if (exists) {
          return prev.map(o => o.type === 'TAXI' ? {
            ...o,
            title: status === "dispatching" ? "Allocating Vehicle..." : status === "on_way" ? "Tesla Model Y en route" : "Driver Michael has Arrived!",
            description: status === "dispatching" ? "Finding nearest Uber Black..." : status === "on_way" ? "Tesla Model Y en route (Michael)." : "Driver Michael is waiting outside.",
            statusLabel: status.toUpperCase(),
            statusColor: status === "arrived" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-cyan-50 text-cyan-700 border-cyan-100",
            meta: { ...o.meta, taxiStatus: status }
          } : o);
        } else {
          return [
            ...prev,
            {
              id: "op-taxi-" + Date.now(),
              type: "TAXI",
              title: "Allocating Vehicle...",
              description: "Finding nearest Uber Black...",
              urgency: "LIVE",
              statusLabel: "DISPATCHING",
              statusColor: "bg-cyan-50 text-cyan-700 border-cyan-100",
              iconType: "car",
              meta: { taxiStatus: status, taxiEta: 12 }
            }
          ];
        }
      });
    }
  };

  const setTaxiEta = (eta: number | ((prev: number) => number)) => {
    setOperations(prev => prev.map(o => {
      if (o.type === 'TAXI') {
        const nextEta = typeof eta === 'function' ? eta(o.meta?.taxiEta ?? 12) : eta;
        return {
          ...o,
          meta: { ...o.meta, taxiEta: nextEta }
        };
      }
      return o;
    }));
  };

  const [showBoardingPass, setShowBoardingPass] = useState(false);
  const showSummary = operations.some(o => o.type === 'EMAIL_SUMMARY');
  const setShowSummary = (val: boolean) => {
    if (val) {
      if (!operations.some(o => o.type === 'EMAIL_SUMMARY')) {
        setOperations(prev => [
          ...prev,
          {
            id: "op-email-summary",
            type: "EMAIL_SUMMARY",
            title: "AI Inbox Triage Summary",
            description: "14 items analyzed today. Focus saved: 1.5h.",
            urgency: "INFO",
            statusLabel: "INFO",
            statusColor: "bg-slate-50 text-slate-700 border-slate-200",
            iconType: "mail",
            meta: {
              emailPoints: [
                "OMEGA Project Approved: Client signed off on phase 2. Wants final documents before Friday noon.",
                "Conflict Mitigation: VP asked to push VR latency reviews back to avoid calendar overlap."
              ]
            }
          }
        ]);
      }
    } else {
      setOperations(prev => prev.filter(o => o.type !== 'EMAIL_SUMMARY'));
    }
  };

  // Action targets dynamic state with Create, Edit, Delete capability
  const [actionTargets, setActionTargets] = useState<ActionTarget[]>([
    { id: 'target-1', title: "Call a taxi to the airport", icon: 'car', actionType: 'TAXI', description: 'Uber Black dispatch SFO' },
    { id: 'target-2', title: "Summary of today's emails", icon: 'mail', actionType: 'EMAIL_SUMMARY', description: 'Inbox AI triage report' },
    { id: 'target-3', title: "Reschedule Marketing Sync", icon: 'calendar', actionType: 'MEETING', description: 'Calendar conflict repair' }
  ]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editTargetId, setEditTargetId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formIcon, setFormIcon] = useState<'map-pin' | 'compass' | 'phone' | 'mail' | 'zap' | 'car' | 'calendar' | 'plane'>("car");
  const [formActionType, setFormActionType] = useState<'TAXI' | 'EMAIL_SUMMARY' | 'FLIGHT' | 'MEETING' | 'CUSTOM'>("CUSTOM");

  const handleOpenCreateForm = () => {
    setEditTargetId(null);
    setFormTitle("");
    setFormDescription("");
    setFormIcon("car");
    setFormActionType("CUSTOM");
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (target: ActionTarget) => {
    setEditTargetId(target.id);
    setFormTitle(target.title);
    setFormDescription(target.description || "");
    setFormIcon(target.icon);
    setFormActionType(target.actionType);
    setIsFormOpen(true);
  };

  const handleSaveTarget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editTargetId) {
      setActionTargets(prev => prev.map(t => t.id === editTargetId ? {
        ...t,
        title: formTitle,
        description: formDescription,
        icon: formIcon,
        actionType: formActionType
      } : t));
      triggerToast("Target updated successfully!");
      addActivity("User Action", `Updated next action target: "${formTitle}"`, "user");
    } else {
      const newTarget: ActionTarget = {
        id: "target-" + Date.now(),
        title: formTitle,
        description: formDescription,
        icon: formIcon,
        actionType: formActionType
      };
      setActionTargets(prev => [...prev, newTarget]);
      triggerToast("New target added!");
      addActivity("User Action", `Created next action target: "${formTitle}"`, "user");
    }

    setIsFormOpen(false);
    setEditTargetId(null);
  };

  const handleDeleteTarget = (id: string, name: string) => {
    setActionTargets(prev => prev.filter(t => t.id !== id));
    triggerToast("Target removed.");
    addActivity("User Action", `Deleted next action target: "${name}"`, "user");
  };

  const handleRunTarget = (target: ActionTarget) => {
    addActivity("User Action", `Triggered target: "${target.title}"`, "user");
    
    if (target.actionType === 'TAXI') {
      startTaxiSimulation();
    } else if (target.actionType === 'EMAIL_SUMMARY') {
      setShowSummary(true);
      triggerToast("Sifting inboxes and compiling report...");
    } else if (target.actionType === 'FLIGHT') {
      setHasFlight(true);
      triggerToast("Flight details synchronized!");
    } else if (target.actionType === 'MEETING') {
      setHasMeeting(true);
      triggerToast("Meeting rescheduled successfully.");
    } else {
      // Custom operational card dispatch!
      setOperations(prev => {
        if (prev.some(o => o.id === `op-custom-${target.id}`)) {
          triggerToast(`Target "${target.title}" is already running!`);
          return prev;
        }
        return [
          ...prev,
          {
            id: `op-custom-${target.id}`,
            type: 'CUSTOM',
            title: target.title,
            description: target.description || "Custom operational task initiated by user dispatch.",
            urgency: "LIVE",
            statusLabel: "RUNNING",
            statusColor: "bg-indigo-50 text-indigo-700 border-indigo-150",
            iconType: target.icon === 'car' ? 'car' :
                      target.icon === 'mail' ? 'mail' :
                      target.icon === 'calendar' ? 'calendar' :
                      target.icon === 'plane' ? 'plane' : 'zap'
          }
        ];
      });
      triggerToast(`Task dispatched: ${target.title}`);
    }
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'map-pin':
        return <MapPin className="w-4 h-4 text-slate-400 shrink-0" />;
      case 'compass':
        return <Compass className="w-4 h-4 text-slate-400 shrink-0" />;
      case 'mail':
        return <Compass className="w-4 h-4 text-slate-400 shrink-0" />;
      case 'plane':
        return <Plane className="w-4 h-4 text-slate-400 shrink-0" />;
      case 'car':
        return <Car className="w-4 h-4 text-slate-400 shrink-0" />;
      case 'calendar':
        return <Calendar className="w-4 h-4 text-slate-400 shrink-0" />;
      case 'zap':
        return <Zap className="w-4 h-4 text-slate-400 shrink-0" />;
      default:
        return <MapPin className="w-4 h-4 text-slate-400 shrink-0" />;
    }
  };

  // Dynamic Activity Feed State (Forwarded to global logger)
  const addActivity = (label: string, desc: string, type: 'assistant' | 'alert' | 'user') => {
    let globalType: 'AI_ASSISTANT' | 'SYSTEM_ALERT' | 'USER_ACTION' = 'AI_ASSISTANT';
    if (type === 'alert') globalType = 'SYSTEM_ALERT';
    if (type === 'user') globalType = 'USER_ACTION';
    
    if (onLogActivity) {
      onLogActivity(globalType, desc);
    }
  };

  // Quantum Focus Resonator states
  const [focusFrequency, setFocusFrequency] = useState<"Alpha" | "Beta" | "Theta">("Alpha");
  const [isResonatorActive, setIsResonatorActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<"Inhale" | "Hold" | "Exhale">("Inhale");
  const [breathingProgress, setBreathingProgress] = useState(0); // 0 to 100 for visual pulse
  const [cognitiveScore, setCognitiveScore] = useState(74);
  const [loggedSessions, setLoggedSessions] = useState(0);

  // Optimizer interactive states
  const [energyLevel, setEnergyLevel] = useState<number[]>([85, 90, 80, 45, 30, 65, 75, 40]);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Simulated Voice Scripts
  const SIMULATED_SCRIPTS = [
    {
      user: "Find me the next flight to New York...",
      ai: "Confirmed: First class seating available for tomorrow. Delta DL142 leaves at 6:45 PM. Seat 4C reserved.",
      action: () => { 
        setHasFlight(true); 
        triggerToast("Delta DL142 Flight Information synced to Wallet!"); 
        addActivity("AI Assistant", "Delta DL142 Flight Reservation auto-generated and synced to Wallet.", "assistant");
      }
    },
    {
      user: "Reschedule today's design review...",
      ai: "Sync with Marketing moved to Friday at 9:00 AM. 3 attendees notified. Free focus slot reserved today.",
      action: () => { 
        setHasMeeting(true); 
        triggerToast("Meeting successfully rescheduled with stakeholders."); 
        addActivity("AI Assistant", "Rescheduled design review meeting to eliminate peak focus conflict.", "assistant");
      }
    },
    {
      user: "Call a taxi to the airport...",
      ai: "Uber Black dispatched. ETA: 12 minutes. Driver 'Michael' in Tesla Model Y. License: SF-412X.",
      action: () => { 
        startTaxiSimulation(); 
        addActivity("AI Assistant", "Uber Black dispatched to SFO. Vehicle: Tesla Model Y (Michael).", "assistant");
      }
    },
    {
      user: "Summary of today's emails...",
      ai: "Sifting 14 urgent items. Main takeaway: VP approved the OMEGA budget; needs final design review before Friday.",
      action: () => { 
        setShowSummary(true); 
        triggerToast("Email brief compiled from OMEGA project thread!"); 
        addActivity("AI Assistant", "Compiled Project OMEGA high-priority email intelligence brief.", "assistant");
      }
    }
  ];

  // Toast notifier helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowSuccessToast(true);
  };

  useEffect(() => {
    if (showSuccessToast) {
      const t = setTimeout(() => setShowSuccessToast(false), 4000);
      return () => clearTimeout(t);
    }
  }, [showSuccessToast]);

  // Taxi ETA Countdown Simulator
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (taxiStatus === "on_way") {
      interval = setInterval(() => {
        setTaxiEta(prev => {
          if (prev <= 1) {
            setTaxiStatus("arrived");
            triggerToast("Your Tesla Model Y has arrived outside!");
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 5000); // Countdown every 5s for fast simulation
    }
    return () => clearInterval(interval);
  }, [taxiStatus]);

  // Focus Resonator Breathing Cycle Simulator
  useEffect(() => {
    let interval: NodeJS.Timeout;
    let timer: NodeJS.Timeout;
    if (isResonatorActive) {
      let cycle = 0;
      interval = setInterval(() => {
        cycle = (cycle + 1) % 3;
        if (cycle === 0) {
          setBreathingPhase("Inhale");
          setCognitiveScore(prev => Math.min(prev + 2, 98));
        } else if (cycle === 1) {
          setBreathingPhase("Hold");
          setCognitiveScore(prev => Math.min(prev + 1, 98));
        } else {
          setBreathingPhase("Exhale");
          setCognitiveScore(prev => Math.min(prev + 1, 98));
        }
      }, 4000);

      // Smooth progress pulse
      let progress = 0;
      let direction = 1;
      timer = setInterval(() => {
        progress += direction * 5;
        if (progress >= 100) {
          progress = 100;
          direction = -1;
        } else if (progress <= 0) {
          progress = 0;
          direction = 1;
        }
        setBreathingProgress(progress);
      }, 100);
    } else {
      setBreathingProgress(0);
    }
    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, [isResonatorActive]);

  const startTaxiSimulation = () => {
    setTaxiStatus("dispatching");
    setTimeout(() => {
      setTaxiStatus("on_way");
      setTaxiEta(12);
      triggerToast("Uber Black has been dispatched to your current location!");
    }, 1500);
  };

  const handleMicToggle = () => {
    if (!isListening) {
      setIsListening(true);
      // Automatically cycle a random instruction for high-fidelity engagement
      const nextIdx = (captionIndex + 1) % SIMULATED_SCRIPTS.length;
      setCaptionIndex(nextIdx);
      
      // Simulate speech recognition timing
      setTimeout(() => {
        SIMULATED_SCRIPTS[nextIdx].action();
      }, 2500);
    } else {
      setIsListening(false);
    }
  };

  const handleCustomCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCommand.trim()) return;

    // Direct command parser simulation
    const cmd = customCommand.toLowerCase();
    setIsListening(true);
    
    setTimeout(() => {
      setIsListening(false);
      const isConversational = cmd.includes("why") || cmd.includes("how") || cmd.includes("what") || cmd.includes("explain") || cmd.includes("brief") || cmd.includes("risk") || cmd.includes("stress") || cmd.includes("recommend") || cmd.includes("hello") || cmd.includes("hi") || cmd.includes("optimize");

      if (isConversational) {
        triggerToast("Conversational inquiry detected! Redirecting to the floating Command Co-Pilot.");
        if (onOpenChat) {
          onOpenChat();
        }
      } else if (cmd.includes("flight") || cmd.includes("ny") || cmd.includes("new york")) {
        setHasFlight(true);
        triggerToast("Delta DL142 Boarding Pass updated!");
      } else if (cmd.includes("meeting") || cmd.includes("review") || cmd.includes("reschedule")) {
        setHasMeeting(true);
        triggerToast("Calendar repaired! Conflicts auto-scheduled.");
      } else if (cmd.includes("taxi") || cmd.includes("cab") || cmd.includes("uber") || cmd.includes("airport")) {
        startTaxiSimulation();
      } else if (cmd.includes("email") || cmd.includes("summary") || cmd.includes("sift")) {
        setShowSummary(true);
        triggerToast("Email analysis compiled successfully.");
      } else {
        // Fallback generic AI response
        triggerToast("AI Command parsed: " + customCommand + " | Scheduled for execution.");
        onAddTask(customCommand, "MEDIUM", "Automated dispatcher task triggered from voice command");
      }
      setCustomCommand("");
    }, 1200);
  };

  const applyOptimizations = () => {
    onApplyAllProposals();
    triggerToast("All scheduling corrections synced with system tasks successfully!");
    addActivity("System Alert", "Applied all schedule optimization recommendations to core planner.", "alert");
  };

  // Compute stats
  const activeUnappliedProposals = proposals.filter(p => !p.applied);

  return (
    <div className="w-full flex flex-col gap-6 font-sans">
      
      {/* AI Assistants Scope Comparison Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/5 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="flex-grow z-10 space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-950 border border-cyan-800 text-cyan-400 text-[10px] font-black uppercase tracking-wider rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            Core AI Assistant Architecture
          </div>
          <h2 className="text-xl font-black text-white">
            Dual-Engine Assistant Calibration
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
            Our platform splits intelligence into two specialized co-pilots tailored for separate productivity modes. Switch between them or cross-trigger actions depending on your immediate workload requirements.
          </p>
          
          {/* Comparison Matrix columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-800/80">
            <div className="space-y-1.5 text-left bg-slate-900/40 p-3.5 rounded-2xl border border-slate-800/60">
              <p className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                <Car className="w-4 h-4" />
                1. Dispatch Cockpit (This View)
              </p>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                <strong>Tactical, Visual & Logistical:</strong> Trigger dynamic actions visually. Track mock Uber/Taxi GPS paths, flight wallet details, and configure custom targeted operations instantly.
              </p>
            </div>
            
            <div className="space-y-1.5 text-left bg-slate-900/40 p-3.5 rounded-2xl border border-slate-800/60">
              <p className="text-xs font-bold text-orange-400 flex items-center gap-1.5">
                <Bot className="w-4 h-4" />
                2. Command Co-Pilot (Floating Assistant)
              </p>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                <strong>Conversational, Speech & Strategic:</strong> Tap the bottom-right bubble to chat or speak. Best for verbal morning briefs, analyzing stress factors, and scheduling complex tasks.
              </p>
            </div>
          </div>
        </div>

        {onOpenChat && (
          <div className="shrink-0 z-10 flex flex-col items-center gap-2 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl text-center min-w-[180px]">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Conversational Engine
            </p>
            <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center text-white shadow-lg animate-pulse">
              <Bot className="w-6 h-6" />
            </div>
            <button
              onClick={onOpenChat}
              className="mt-2 w-full py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
            >
              Open Chat co-pilot
            </button>
            <p className="text-[9px] text-slate-500 font-bold">
              Speech-to-Text Enabled
            </p>
          </div>
        )}
      </div>
      
      {/* Toast Notice */}
      {showSuccessToast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3.5 bg-slate-900 border border-cyan-500/40 text-white px-5 py-4 rounded-2xl shadow-2xl animate-bounce">
          <div className="w-8 h-8 rounded-full bg-cyan-950 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-800">
            <Sparkles className="w-4 h-4 fill-current" />
          </div>
          <div>
            <p className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-wider">AI Operations Core</p>
            <p className="text-xs font-bold">{toastMessage}</p>
          </div>
        </div>
      )}

      {/* Main Grid: Dual Column Bento Structure to keep BOTH layouts visible */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT PANEL: VOICE & LOGISTICS DISPATCHER (Image 2 Screen) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Cyber Voice Assistant Core */}
          <div className="bg-slate-950 border border-slate-900 rounded-[28px] p-6 text-white relative overflow-hidden shadow-xl min-h-[440px] flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-[90px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-10 w-60 h-60 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none"></div>

            {/* Header Status */}
            <div className="flex justify-between items-center relative z-10">
              <div className="flex items-center gap-2.5">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className={`absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75 ${isListening ? "animate-ping" : ""}`}></span>
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isListening ? "bg-cyan-400" : "bg-slate-600"}`}></span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {isListening ? "ACTIVE TRANSCRIBING MODE" : "COCKPIT DISPATCH STANDBY"}
                </span>
              </div>
              <div className="bg-slate-900/80 px-3 py-1 border border-slate-800 rounded-lg text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-cyan-500" />
                Speech Synthesis V4
              </div>
            </div>

            {/* Main Title Center */}
            <div className="text-center my-6 relative z-10 max-w-lg mx-auto">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2 leading-tight">
                How can I assist you?
              </h2>
              <p className="text-xs text-slate-400 font-medium px-4">
                I'm standing by to manage your high-stakes schedule, auto-repair calendar conflicts, and coordinate instant logistics.
              </p>
            </div>

            {/* Pulsing Mic Interactive Core */}
            <div className="flex flex-col items-center justify-center my-4 relative z-10">
              <button
                onClick={handleMicToggle}
                className={`w-24 h-24 rounded-3xl flex items-center justify-center transition-all duration-300 relative group shadow-lg ${
                  isListening 
                    ? "bg-cyan-500 text-slate-950 scale-105 shadow-cyan-500/20" 
                    : "bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 hover:border-slate-700"
                }`}
                title={isListening ? "Click to Mute Engine" : "Click to Start Voice command"}
              >
                {/* Listening ring ripples */}
                {isListening && (
                  <>
                    <span className="absolute inset-0 rounded-3xl border-2 border-cyan-400/60 animate-ping" style={{ animationDuration: '2s' }}></span>
                    <span className="absolute -inset-2 rounded-[32px] border-2 border-cyan-400/30 animate-pulse" style={{ animationDuration: '3s' }}></span>
                  </>
                )}
                {isListening ? (
                  <Mic className="w-10 h-10 stroke-[2.5]" />
                ) : (
                  <MicOff className="w-10 h-10 text-slate-500" />
                )}
              </button>
              
              <p className="text-[10px] font-black uppercase text-cyan-400 tracking-wider mt-4">
                {isListening ? "LISTENING IN REALTIME..." : "CLICK MIC TO EMULATE AUDIO CAPTURE"}
              </p>
            </div>

            {/* Transcript Captions Mockups */}
            <div className="bg-slate-900/60 border border-slate-900 p-4 rounded-2xl min-h-[92px] flex flex-col justify-center text-center relative z-10 backdrop-blur-sm">
              {captionIndex >= 0 ? (
                <div>
                  <p className="text-xs text-slate-400 italic font-medium">"{SIMULATED_SCRIPTS[captionIndex].user}"</p>
                  <p className="text-xs text-cyan-300 font-bold mt-1.5">"{SIMULATED_SCRIPTS[captionIndex].ai}"</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-bold">"Find me the next flight to New York..."</p>
                  <p className="text-[10px] text-slate-600 font-semibold">Select one below or click mic to cycle voice prompts.</p>
                </div>
              )}
            </div>

            {/* Quick-tap Command Simulation Chips */}
            <div className="mt-5 space-y-3 relative z-10 border-t border-slate-900 pt-4">
              <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest text-center">
                Interactive Quick-Tap Directives
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {SIMULATED_SCRIPTS.map((script, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setIsListening(true);
                      setCaptionIndex(idx);
                      setTimeout(() => {
                        script.action();
                      }, 1500);
                    }}
                    className="px-3 py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 rounded-xl text-[11px] font-bold border border-slate-800 transition-colors shadow-inner hover:text-cyan-400 flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    {script.user.replace("...", "")}
                  </button>
                ))}
              </div>
            </div>

            {/* Typed Input bar fallback */}
            <form onSubmit={handleCustomCommandSubmit} className="mt-5 relative z-10 flex gap-2">
              <input
                type="text"
                value={customCommand}
                onChange={(e) => setCustomCommand(e.target.value)}
                placeholder="Type custom command (e.g. 'flight to LA', 'call taxi', 'summarize')..."
                className="flex-grow bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors shadow-inner"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-slate-850 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-cyan-400 text-xs font-bold rounded-xl transition-colors shrink-0"
              >
                Send
              </button>
            </form>

            {/* Bottom load bars */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between sm:items-center mt-5 border-t border-slate-900 pt-4 text-slate-500 text-[10px] font-bold">
              <div className="flex items-center gap-2 justify-between sm:justify-start">
                <span>SYSTEM DISPATCH LOAD</span>
                <div className="w-20 bg-slate-800 h-1 rounded-full overflow-hidden">
                  <div className="bg-cyan-500 h-full w-[35%] rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-500 justify-end sm:justify-start">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Secure AI Link Protocol Active
              </div>
            </div>

          </div>

          {/* ACTIVE DISPATCH OPERATIONS PANELS (Image 2 cards) */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-600" />
              Live Operations & Logistics Dispatch
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {operations.map((op) => {
                const isTaxi = op.type === 'TAXI';
                const isFlight = op.type === 'FLIGHT';
                const isMeeting = op.type === 'MEETING';
                const isSummary = op.type === 'EMAIL_SUMMARY';

                return (
                  <div key={op.id} className="bg-white border-2 border-slate-100 rounded-2xl p-4.5 shadow-sm flex flex-col justify-between hover:border-cyan-200 transition-all group">
                    
                    <div>
                      <div className="flex justify-between items-start mb-3 gap-2">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          isFlight ? 'bg-orange-50 text-orange-600' :
                          isMeeting ? 'bg-cyan-50 text-cyan-600' :
                          isTaxi ? 'bg-indigo-50 text-indigo-600' :
                          isSummary ? 'bg-slate-100 text-slate-700' : 'bg-slate-50 text-slate-600'
                        }`}>
                          {op.iconType === 'plane' && <Plane className="w-5 h-5" />}
                          {op.iconType === 'calendar' && <Calendar className="w-5 h-5" />}
                          {op.iconType === 'car' && <Car className="w-5 h-5" />}
                          {op.iconType === 'mail' && <Compass className="w-5 h-5" />}
                          {op.iconType === 'zap' && <Zap className="w-5 h-5" />}
                        </div>
                        <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border shrink-0 ${op.statusColor || 'bg-slate-50 text-slate-600 border-slate-150'}`}>
                          {op.statusLabel || op.urgency}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-sm text-slate-900">{op.title}</h4>
                      
                      {isSummary && op.meta?.emailPoints ? (
                        <div className="space-y-2 mt-2">
                          {op.meta.emailPoints.map((pt, idx) => (
                            <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                              <p className="text-[10px] text-slate-700 font-bold leading-relaxed">{pt}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 leading-relaxed mt-1.5">
                          {op.description}
                        </p>
                      )}
                    </div>

                    {/* Taxi Interactive Map tracker inside the card */}
                    {isTaxi && op.meta?.taxiStatus !== 'idle' && (
                      <div className="mt-3">
                        <div className="relative h-14 bg-slate-950 rounded-xl overflow-hidden border border-slate-900 flex items-center justify-center mb-1">
                          <div className="absolute inset-0 grid grid-cols-6 grid-rows-2 gap-px opacity-10 pointer-events-none">
                            {Array.from({ length: 12 }).map((_, i) => (
                              <div key={i} className="border border-slate-400"></div>
                            ))}
                          </div>

                          <div className="w-[80%] h-1 bg-slate-800 rounded-full relative">
                            <div 
                              className="absolute left-0 h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all duration-1000"
                              style={{ width: op.meta.taxiStatus === "on_way" ? `${100 - ((op.meta.taxiEta ?? 12) * 8)}%` : op.meta.taxiStatus === "arrived" ? "100%" : "10%" }}
                            ></div>
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-indigo-500 rounded-full border border-white shadow-md"></span>
                            <span 
                              className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-cyan-400 rounded-full border border-slate-950 shadow-md flex items-center justify-center transition-all duration-1000"
                              style={{ left: op.meta.taxiStatus === "on_way" ? `${100 - ((op.meta.taxiEta ?? 12) * 8)}%` : op.meta.taxiStatus === "arrived" ? "100%" : "10%" }}
                            >
                              <Navigation className="w-1.5 h-1.5 text-slate-950 fill-current rotate-90" />
                            </span>
                            <span className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white shadow-md"></span>
                          </div>
                        </div>
                        <p className="text-[9px] text-slate-400 font-bold text-center">
                          Financial District SF → SFO Airport
                        </p>
                      </div>
                    )}

                    <div className="mt-4 flex gap-2 pt-2 border-t border-slate-50 items-center justify-between">
                      {isFlight && (
                        <button
                          onClick={() => setShowBoardingPass(true)}
                          className="px-3 py-1.5 bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
                        >
                          <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                          Boarding Pass
                        </button>
                      )}
                      
                      {isMeeting && (
                        <div className="flex -space-x-1.5 overflow-hidden shrink-0 items-center">
                          <img className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover" src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100&h=100" alt="team member" />
                          <img className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100&h=100" alt="team member" />
                          <span className="text-[8px] font-extrabold text-slate-400 pl-2 uppercase tracking-wider">+3 notified</span>
                        </div>
                      )}

                      <button
                        onClick={() => {
                          setOperations(prev => prev.filter(p => p.id !== op.id));
                          addActivity("System Alert", `Dismissed logistics card: "${op.title}"`, "alert");
                        }}
                        className="ml-auto p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl transition-colors"
                        title="Dismiss Operation"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {operations.length === 0 && (
                <div className="col-span-1 md:col-span-2 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[180px]">
                  <Cpu className="w-8 h-8 text-slate-300 mb-2 animate-pulse" />
                  <p className="text-sm font-bold text-slate-700">No Active Dispatch Operations</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    All logistics are synchronized. Trigger a pre-configured target below or dispatch a custom operational card.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    <button
                      onClick={() => setHasFlight(true)}
                      className="px-2.5 py-1 bg-white border border-slate-200 text-[10px] font-extrabold text-slate-600 hover:bg-slate-50 rounded-lg transition-all shadow-xs"
                    >
                      + Flight DL142
                    </button>
                    <button
                      onClick={() => setHasMeeting(true)}
                      className="px-2.5 py-1 bg-white border border-slate-200 text-[10px] font-extrabold text-slate-600 hover:bg-slate-50 rounded-lg transition-all shadow-xs"
                    >
                      + Meeting Sync
                    </button>
                    <button
                      onClick={() => startTaxiSimulation()}
                      className="px-2.5 py-1 bg-white border border-slate-200 text-[10px] font-extrabold text-slate-600 hover:bg-slate-50 rounded-lg transition-all shadow-xs"
                    >
                      + Dispatch Uber
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Next Actions Lists */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-2 justify-between sm:items-center mb-3.5">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest block">
                  Immediate Next Action Targets
                </span>
                <button
                  onClick={handleOpenCreateForm}
                  className="px-2.5 py-1.5 sm:py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-black text-[9px] uppercase tracking-wider flex items-center justify-center gap-1 transition-colors w-full sm:w-auto"
                >
                  <Plus className="w-3 h-3" /> Add Target
                </button>
              </div>

              {/* Dynamic Target Create/Edit Form */}
              {isFormOpen && (
                <form onSubmit={handleSaveTarget} className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-3 mb-4 transition-all animate-scaleUp">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-black uppercase text-slate-700">
                      {editTargetId ? "Edit Action Target" : "Create Action Target"}
                    </h4>
                    <button 
                      type="button" 
                      onClick={() => setIsFormOpen(false)}
                      className="p-1 hover:bg-slate-200 rounded text-slate-400"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Target Action Title</label>
                      <input
                        type="text"
                        required
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        placeholder="e.g. Order taxi to office"
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Sub Description (Optional)</label>
                      <input
                        type="text"
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        placeholder="e.g. Dispatches an autonomous vehicle"
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Action Type</label>
                        <select
                          value={formActionType}
                          onChange={(e) => setFormActionType(e.target.value as any)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold focus:outline-none"
                        >
                          <option value="CUSTOM">Custom Card</option>
                          <option value="TAXI">Taxi / Uber Ride</option>
                          <option value="EMAIL_SUMMARY">Email Summary</option>
                          <option value="FLIGHT">Flight Reservation</option>
                          <option value="MEETING">Calendar Meeting</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Icon Representation</label>
                        <select
                          value={formIcon}
                          onChange={(e) => setFormIcon(e.target.value as any)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold focus:outline-none"
                        >
                          <option value="car">Car / Taxi</option>
                          <option value="mail">Mail / Inbox</option>
                          <option value="calendar">Calendar</option>
                          <option value="plane">Flight / Plane</option>
                          <option value="map-pin">Map Pin</option>
                          <option value="compass">Compass</option>
                          <option value="zap">Zap / Speed</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="submit"
                      className="flex-grow py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-lg transition-all"
                    >
                      {editTargetId ? "Save Changes" : "Create Target"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold text-[10px] uppercase tracking-wider rounded-lg transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Action Targets List */}
              <div className="space-y-2">
                {actionTargets.map((target) => (
                  <div 
                    key={target.id} 
                    className="flex items-center gap-2 group p-1.5 bg-slate-50 hover:bg-slate-100/70 border border-slate-150 rounded-xl transition-all"
                  >
                    <button
                      onClick={() => handleRunTarget(target)}
                      className="flex-grow flex items-center gap-2.5 p-1 text-left font-bold text-slate-800 text-xs hover:text-cyan-600 transition-colors"
                      title="Run target dispatch"
                    >
                      {getIconComponent(target.icon)}
                      <div className="min-w-0">
                        <span className="block truncate">"{target.title}"</span>
                        {target.description && (
                          <span className="block text-[10px] text-slate-400 font-normal truncate mt-0.5">{target.description}</span>
                        )}
                      </div>
                    </button>
                    <div className="flex items-center gap-1 pr-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEditForm(target)}
                        className="p-1.5 text-slate-400 hover:text-cyan-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all"
                        title="Edit Target"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTarget(target.id, target.title)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all"
                        title="Delete Target"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {actionTargets.length === 0 && (
                  <p className="text-center text-xs text-slate-400 py-4 font-bold">
                    No custom action targets configured. Add one to start dispatching!
                  </p>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* RIGHT PANEL: ENERGY OPTIMIZER & SETTINGS (Image 1 Elements) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* AI Optimizer Card */}
          <div className="bg-white border border-slate-200/80 rounded-[28px] p-6 shadow-sm">
            
            <div className="flex flex-col sm:flex-row gap-3 justify-between sm:items-start mb-5 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-cyan-50 text-cyan-600 border border-cyan-100 rounded-xl flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">AI Schedule Optimizer</h3>
                  <p className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                    Energy-Based Scheduling Active
                  </p>
                </div>
              </div>
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider self-start sm:self-auto bg-slate-100 sm:bg-transparent px-2 py-0.5 sm:p-0 rounded">
                COGNITIVE TUNING
              </span>
            </div>

            {/* Energy Chart Visualizer */}
            <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4.5 mb-5">
              <div className="flex justify-between items-baseline mb-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Current Energy</span>
                <span className="text-[10px] font-extrabold text-cyan-600 uppercase bg-cyan-50 px-2 py-0.5 rounded-md">
                  Optimal for Deep Work
                </span>
              </div>

              {/* Bar Chart Container */}
              <div className="h-24 flex items-end gap-1 sm:gap-2 px-1 sm:px-2 pt-2 pb-1 bg-white border border-slate-100 rounded-xl shadow-inner">
                {energyLevel.map((lvl, index) => {
                  const hours = ["9a", "11a", "12p", "2p", "3p", "5p", "7p", "9p"];
                  const isCurrentHour = index === 1; // 11 AM active highlight
                  return (
                    <div key={index} className="flex-grow flex flex-col items-center h-full justify-end group cursor-pointer">
                      <div className="w-full relative rounded-t-md transition-all duration-300"
                        style={{ 
                          height: `${lvl}%`,
                          backgroundColor: isCurrentHour 
                            ? "#06B6D4" // Bright Cyan
                            : lvl < 50 
                              ? "#F59E0B" // Amber for dip
                              : "#38BDF8"  // Blue
                        }}
                      >
                        {/* Tooltip */}
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-950 text-white text-[9px] font-black px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-15 whitespace-nowrap">
                          {lvl}% Energy
                        </div>
                      </div>
                      <span className={`text-[9px] font-bold mt-1.5 ${isCurrentHour ? "text-cyan-600 font-extrabold" : "text-slate-400"}`}>
                        {hours[index]}
                      </span>
                    </div>
                  );
                })}
              </div>

              <p className="text-[10px] text-slate-500 font-bold leading-relaxed mt-3.5 text-center bg-white border border-slate-100 p-2.5 rounded-xl">
                Predicted dip at <strong className="text-slate-800">2:00 PM</strong>. AI recommends scheduling routine/administrative batch tasks then.
              </p>
            </div>

            {/* Smart Suggestions Panel */}
            <div className="space-y-3.5">
              <div className="flex justify-between items-center text-[10px] font-black text-slate-400 tracking-wider">
                <span>SMART SUGGESTIONS</span>
                <span className="text-cyan-600 font-bold uppercase shrink-0">
                  {activeUnappliedProposals.length} Suggestions Left
                </span>
              </div>

              {/* Suggestion 1: Batch */}
              <div className="bg-white border border-slate-200 rounded-xl p-4.5 hover:border-cyan-200 transition-all flex flex-col justify-between shadow-sm relative overflow-hidden group">
                <span className="absolute top-0 left-0 bottom-0 w-1 bg-cyan-500"></span>
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black uppercase text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-md tracking-wider">
                      Batch Optimization
                    </span>
                    <span className="text-[9px] text-slate-400 font-extrabold">2:15 PM slot</span>
                  </div>
                  <p className="text-xs font-black text-slate-900 mt-2">
                    Move "Email Clean-up" to 2:15 PM
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    "Matches your predicted low-energy window perfectly to preserve peak focus."
                  </p>
                </div>
              </div>

              {/* Suggestion 2: Deep Work block */}
              <div className="bg-white border border-slate-200 rounded-xl p-4.5 hover:border-cyan-200 transition-all flex flex-col justify-between shadow-sm relative overflow-hidden group">
                <span className="absolute top-0 left-0 bottom-0 w-1 bg-amber-500"></span>
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md tracking-wider">
                      Deep Work Block
                    </span>
                    <span className="text-[9px] text-slate-400 font-extrabold">10:00 AM - 11:30 AM</span>
                  </div>
                  <p className="text-xs font-black text-slate-900 mt-2">
                    Block focus reserves for forecasting
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    "High focus predicted. Best window for Final Project Report draft tasks."
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5 mt-6 pt-3 border-t border-slate-100">
                <button
                  onClick={applyOptimizations}
                  className="w-full sm:flex-grow py-3 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-cyan-950/10 flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  Apply All Changes
                </button>
                <button
                  onClick={() => triggerToast("AI suggestions cleared. Recalibrating on next trigger.")}
                  className="w-full sm:w-auto px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-xs uppercase tracking-wider rounded-xl transition-all border border-slate-200"
                >
                  Dismiss AI Advice
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* BOARDING PASS SVG MODAL */}
      {showBoardingPass && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#121620] border border-cyan-500/30 text-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative animate-scaleUp">
            
            {/* Hologram card effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 to-indigo-500/5 pointer-events-none"></div>

            {/* Top Border Bar */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-1.5 w-full"></div>

            {/* Header */}
            <div className="p-6 pb-4 flex justify-between items-center border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Plane className="w-5 h-5 text-cyan-400" />
                <span className="text-xs font-black uppercase tracking-widest text-slate-300">DELTA AIRLINES</span>
              </div>
              <button 
                onClick={() => setShowBoardingPass(false)}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ticket Contents */}
            <div className="p-6 space-y-6">
              
              {/* Destinations */}
              <div className="flex justify-between items-center text-center">
                <div>
                  <p className="text-3xl font-black tracking-tight text-white">SFO</p>
                  <p className="text-[10px] text-slate-400 font-bold">San Francisco</p>
                </div>
                <div className="flex-grow mx-4 flex flex-col items-center justify-center relative">
                  <span className="text-[9px] text-cyan-400 font-extrabold tracking-widest uppercase">DL 142</span>
                  <div className="w-full border-t border-dashed border-slate-700 my-1 relative">
                    <Plane className="w-3.5 h-3.5 text-cyan-400 absolute left-1/2 -translate-x-1/2 -top-1.5 fill-current" />
                  </div>
                  <span className="text-[8px] text-slate-500 font-bold">5h 20m Nonstop</span>
                </div>
                <div>
                  <p className="text-3xl font-black tracking-tight text-white">JFK</p>
                  <p className="text-[10px] text-slate-400 font-bold">New York</p>
                </div>
              </div>

              {/* Row Stats */}
              <div className="grid grid-cols-2 gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 text-xs">
                <div>
                  <p className="text-[9px] text-slate-500 font-black uppercase">PASSENGER</p>
                  <p className="font-bold text-white mt-0.5">Alex Mercer</p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 font-black uppercase">SEAT RESERVED</p>
                  <p className="font-bold text-cyan-400 mt-0.5">Seat 4C (First Class)</p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 font-black uppercase">GATE DEPARTURE</p>
                  <p className="font-bold text-white mt-0.5">Terminal 3, Gate B22</p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 font-black uppercase">BOARDING TIME</p>
                  <p className="font-bold text-amber-500 mt-0.5">6:10 PM Tomorrow</p>
                </div>
              </div>

              {/* Barcode representation */}
              <div className="pt-2 flex flex-col items-center">
                <div className="h-14 w-full bg-slate-800/40 rounded-xl border border-slate-800 flex items-center justify-center px-4 relative overflow-hidden">
                  {/* Styled simulated barcode lines */}
                  <div className="w-full flex justify-between h-8 opacity-75">
                    {[2, 4, 1, 3, 2, 5, 2, 1, 4, 3, 2, 1, 3, 5, 1, 4, 2, 3, 2, 1, 4, 3].map((w, idx) => (
                      <span key={idx} className="bg-white rounded-sm" style={{ width: `${w}px` }}></span>
                    ))}
                  </div>
                </div>
                <p className="text-[8px] text-slate-500 font-bold tracking-widest mt-2 uppercase">SYNCED SECURELY WITH APPLE WALLET & G-PAY</p>
              </div>

            </div>

            {/* Bottom Actions */}
            <div className="p-6 bg-slate-900 border-t border-slate-850 flex gap-3 text-xs">
              <button 
                onClick={() => setShowBoardingPass(false)}
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black uppercase tracking-wider rounded-xl transition-colors text-center"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

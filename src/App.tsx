import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  LayoutDashboard, 
  CalendarRange, 
  Target, 
  Sliders, 
  Clock, 
  Settings, 
  MessageSquare, 
  Menu, 
  X,
  HelpCircle,
  Bot,
  User,
  Infinity,
  Zap,
  Trophy,
  LogOut,
  Activity
} from "lucide-react";
import { Task, Goal, Habit, AIProposal, AutonomySettings, ActivityLog, ProfileData } from "./types";
import CommandCenter from "./components/CommandCenter";
import TasksPlanner from "./components/TasksPlanner";
import GoalsHabits from "./components/GoalsHabits";
import SettingsConfig from "./components/SettingsConfig";
import UserProfile from "./components/UserProfile";
import AiChatDrawer from "./components/AiChatDrawer";
import QuickAssistAi from "./components/QuickAssistAi";
import Abstract from "./components/Abstract";
import Dashboard from "./components/Dashboard";
import SynergyArena from "./components/SynergyArena";
import LandingPage from "./components/LandingPage";
import ActivityFeed from "./components/ActivityFeed";
// Clear old demo data once to start with clean and fresh data
if (typeof window !== "undefined" && !localStorage.getItem("lifesaver_fresh_v6")) {
  localStorage.removeItem("lm_tasks");
  localStorage.removeItem("lm_goals");
  localStorage.removeItem("lm_habits");
  localStorage.removeItem("lm_proposals");
  localStorage.removeItem("lifesaver_routines");
  localStorage.setItem("lifesaver_fresh_v6", "true");
}

const INITIAL_TASKS: Task[] = [
  {
    id: "task-1",
    title: "Final Project Report Drafting Phase 2",
    description: "Prepare and synthesize key findings, user metrics, and market feasibility blocks. AI detected a 2-hour window right now.",
    project: "OMEGA",
    priority: "URGENT",
    status: "IN_PROGRESS",
    dueDate: "2026-06-24T18:00:00",
    estimatedHours: 2,
    riskLevel: "HIGH",
    riskReason: "AI analyzed: Starting immediately is required to achieve a 98% buffer before night meeting schedules.",
    milestones: [
      { id: "m-1", text: "Synthesize customer research data", durationMin: 45, focusType: "High Focus", completed: true },
      { id: "m-2", text: "Draft executive summary findings", durationMin: 30, focusType: "Creative", completed: false },
      { id: "m-3", text: "Format metric tables and tables", durationMin: 20, focusType: "Design Work", completed: false },
      { id: "m-4", text: "Final revision and export pdf", durationMin: 15, focusType: "Admin", completed: false }
    ]
  },
  {
    id: "task-2",
    title: "Client Escalation: VR Sync Review",
    description: "Resolve latency conflicts reported by customer VR core teams during sync audits.",
    project: "VIRTUAL",
    priority: "URGENT",
    status: "TODO",
    dueDate: "2026-06-25T11:00:00",
    estimatedHours: 1.5,
    riskLevel: "HIGH",
    riskReason: "High priority overcommit analyzed due to back-to-back presentations tomorrow morning.",
    milestones: [
      { id: "m-5", text: "Download latency reports", durationMin: 15, focusType: "Admin", completed: false },
      { id: "m-6", text: "Review VR core performance trace logs", durationMin: 60, focusType: "High Focus", completed: false }
    ]
  },
  {
    id: "task-3",
    title: "Inbox Triage & Communications Review",
    description: "Read, categorize, and answer urgent team queries, Slack notifications, and calendar invites.",
    project: "ROUTINE",
    priority: "LOW",
    status: "TODO",
    dueDate: "2026-06-24T20:00:00",
    estimatedHours: 0.5,
    riskLevel: "LOW",
    milestones: []
  },
  {
    id: "task-4",
    title: "Quarterly Taxes Preparation Logs",
    description: "Sift receipt scans and document statements for final submissions.",
    project: "ADMIN",
    priority: "MEDIUM",
    status: "TODO",
    dueDate: "2026-06-26T17:00:00",
    estimatedHours: 3.5,
    riskLevel: "MONITORING",
    riskReason: "Missing receipts from August could cause severe completion drag. Spend 15m auditing scan files today.",
    milestones: []
  }
];

const INITIAL_GOALS: Goal[] = [
  { id: "g-1", title: "Marathon Ready", target: "42.2km", current: "28.5km", progress: 68, category: "PHYSICAL" },
  { id: "g-2", title: "Investment Fund", target: "$10k Milestone", current: "$4k", progress: 40, category: "FINANCE" },
  { id: "g-3", title: "Client Success", target: "15 onboarded", current: "12 onboarded", progress: 80, category: "WORK" },
  { id: "g-4", title: "Daily Mind & Meditation", target: "30 sessions", current: "15 sessions", progress: 50, category: "MENTAL" }
];

const INITIAL_HABITS: Habit[] = [
  { id: "h-1", name: "Hydrate (3L Water Intake)", category: "Physical", streak: 14, history: { "2026-06-23": true, "2026-06-22": true, "2026-06-21": true }, frequency: "daily" },
  { id: "h-2", name: "Evening Reading", category: "Mental", streak: 8, history: { "2026-06-23": true, "2026-06-22": true }, frequency: "daily" },
  { id: "h-3", name: "Gym Workout Routine", category: "Physical", streak: 4, history: { "2026-06-21": true }, frequency: "weekly" }
];

const INITIAL_PROPOSALS: AIProposal[] = [
  {
    id: "prop-1",
    type: "RESCHEDULE",
    targetTaskId: "task-3",
    targetTaskTitle: "Inbox Triage",
    title: "Reschedule Inbox Triage to 2:00 PM",
    description: "Move routine inbox review to 2:00 PM to matching your predicted afternoon low-energy window perfectly.",
    applied: false
  },
  {
    id: "prop-2",
    type: "BATCH",
    targetTaskId: "task-4",
    targetTaskTitle: "Quarterly Taxes",
    title: "Bundle Documentation Steps",
    description: "Batch receipt scans for taxes into a 15-minute chunk before your lunch break.",
    applied: false
  },
  {
    id: "prop-3",
    type: "POSTPONE",
    targetTaskId: "task-2",
    targetTaskTitle: "VR Sync Review",
    title: "Postpone Sync Design Review",
    description: "Shift low urgency styling sync tomorrow to free up focus buffers for the high latency client escalations.",
    applied: false
  }
];

const INITIAL_SETTINGS: AutonomySettings = {
  level: "Co-Pilot",
  optimizationAggression: 65,
  interruptDoNotDisturb: true,
  smsFallback: true,
  morningBrief: true,
  contextualReminders: true
};

const getInitials = (name: string) => {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getTierDisplay = (tier: string) => {
  if (!tier) return "STANDARD TIER";
  const t = tier.toUpperCase();
  if (t.includes("PRIORITY")) return "PRIORITY TIER";
  if (t.includes("EXECUTIVE")) return "PRIORITY TIER";
  return t;
};

const INITIAL_ACTIVITIES: ActivityLog[] = [
  { id: "act-1", timestamp: "11:00 AM", type: 'AI_ASSISTANT', message: 'Rescheduled "Weekly Sync" to accommodate new priority.' },
  { id: "act-2", timestamp: "09:30 AM", type: 'SYSTEM_ALERT', message: 'New high-priority task added: Client Onboarding.' },
  { id: "act-3", timestamp: "09:15 AM", type: 'USER_ACTION', message: 'Completed a 30-minute Evening Reading habit session.' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "command" | "tasks" | "goals" | "settings" | "profile" | "quick-assist" | "abstract" | "arena" | "activity-feed">("dashboard");
  const workspaceRef = useRef<HTMLDivElement>(null);

  const [activities, setActivities] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem("lifesaver_activities_v1");
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITIES;
  });

  useEffect(() => {
    localStorage.setItem("lifesaver_activities_v1", JSON.stringify(activities));
  }, [activities]);

  const logActivity = (type: 'AI_ASSISTANT' | 'SYSTEM_ALERT' | 'USER_ACTION', message: string) => {
    const now = new Date();
    const timestampStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    const newLog: ActivityLog = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: timestampStr,
      type,
      message
    };
    setActivities(prev => [newLog, ...prev]);
  };

  // Scroll workspace area to top when active tab changes
  useEffect(() => {
    if (workspaceRef.current) {
      workspaceRef.current.scrollTop = 0;
    }
    window.scrollTo(0, 0);
  }, [activeTab]);
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem("lm_tasks");
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });
  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem("lm_goals");
    let loaded = saved ? JSON.parse(saved) : INITIAL_GOALS;
    // Ensure returning users have the new MENTAL goal card
    if (loaded && Array.isArray(loaded) && !loaded.some((g: Goal) => g.id === "g-4")) {
      loaded = [
        ...loaded,
        { id: "g-4", title: "Daily Mind & Meditation", target: "30 sessions", current: "15 sessions", progress: 50, category: "MENTAL" }
      ];
    }
    return loaded;
  });
  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem("lm_habits");
    return saved ? JSON.parse(saved) : INITIAL_HABITS;
  });
  const [proposals, setProposals] = useState<AIProposal[]>(() => {
    const saved = localStorage.getItem("lm_proposals");
    return saved ? JSON.parse(saved) : INITIAL_PROPOSALS;
  });
  const [settings, setSettings] = useState<AutonomySettings>(() => {
    const saved = localStorage.getItem("lm_settings");
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [routines, setRoutines] = useState<any[]>(() => {
    const saved = localStorage.getItem("lifesaver_routines");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return [
      { id: 'r-1', title: "Inbox Triage", duration: "30 min", done: false },
      { id: 'r-2', title: "Sync Design Assets", duration: "15 min", done: true },
      { id: 'r-3', title: "Energy Restoration Break", duration: "10 min", done: false }
    ];
  });

  useEffect(() => {
    localStorage.setItem("lifesaver_routines", JSON.stringify(routines));
  }, [routines]);

  const handleToggleRoutine = (id: string) => {
    setRoutines(prev => prev.map(r => r.id === id ? { ...r, done: !r.done } : r));
  };

  const handleAddRoutine = (title: string, duration: string) => {
    const newR = {
      id: `r-${Date.now()}`,
      title: title.trim(),
      duration: duration.trim() || "15 min",
      done: false
    };
    setRoutines(prev => [...prev, newR]);
  };

  const handleDeleteRoutine = (id: string) => {
    setRoutines(prev => prev.filter(r => r.id !== id));
  };

  const [profile, setProfile] = useState<ProfileData>(() => {
    const saved = localStorage.getItem("lm_profile");
    return saved ? JSON.parse(saved) : {
      name: "Alex Mercer",
      role: "Principal Crisis Coordinator at Global Tech",
      location: "San Francisco, CA",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250&h=250",
      email: "alex.mercer@globaltech.com",
      phone: "+1 (555) 092-4412",
      timezone: "Pacific Standard Time (PST)",
      twoFactorEnabled: true,
      subscriptionTier: "Priority Executive"
    };
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem("lm_is_authenticated") === "true";
  });

  const handleLoginSuccess = (user: any, customProfile?: any) => {
    setIsAuthenticated(true);
    localStorage.setItem("lm_is_authenticated", "true");
    if (customProfile) {
      setProfile(customProfile);
      localStorage.setItem("lm_profile", JSON.stringify(customProfile));
    }
  };

  const handleLogout = async () => {
    setIsAuthenticated(false);
    localStorage.removeItem("lm_is_authenticated");
    localStorage.removeItem("lm_profile");
    // Also reset back to default profile so it doesn't get stuck
    setProfile({
      name: "Alex Mercer",
      role: "Principal Crisis Coordinator at Global Tech",
      location: "San Francisco, CA",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250&h=250",
      email: "alex.mercer@globaltech.com",
      phone: "+1 (555) 092-4412",
      timezone: "Pacific Standard Time (PST)",
      twoFactorEnabled: true,
      subscriptionTier: "Priority Executive"
    });
  };

  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Server-side health status
  const [aiBackendEnabled, setAiBackendEnabled] = useState(true);

  // Sync state with localStorage
  useEffect(() => {
    localStorage.setItem("lm_tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("lm_goals", JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem("lm_habits", JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem("lm_proposals", JSON.stringify(proposals));
  }, [proposals]);

  useEffect(() => {
    localStorage.setItem("lm_settings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem("lm_profile", JSON.stringify(profile));
  }, [profile]);

  // Clock updates
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      setCurrentDate(now.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Check backend server AI integration status
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch("/api/health");
        const data = await res.json();
        setAiBackendEnabled(data.aiEnabled);
      } catch (err) {
        setAiBackendEnabled(false);
      }
    };
    checkHealth();
  }, []);

  // Core functions
  const handleToggleTask = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextStatus = t.status === 'COMPLETED' ? 'TODO' : 'COMPLETED';
        logActivity('USER_ACTION', `Marked task "${t.title}" as ${nextStatus === 'COMPLETED' ? 'completed' : 'pending'}.`);
        return {
          ...t,
          status: nextStatus,
          completedAt: nextStatus === 'COMPLETED' ? new Date().toISOString() : undefined,
          riskLevel: nextStatus === 'COMPLETED' ? 'LOW' : t.riskLevel
        };
      }
      return t;
    }));
  };

  const handleToggleMilestone = (taskId: string, milestoneId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const updatedMilestones = t.milestones.map(m => m.id === milestoneId ? { ...m, completed: !m.completed } : m);
        const targetMilestone = t.milestones.find(m => m.id === milestoneId);
        if (targetMilestone) {
          logActivity('USER_ACTION', `Toggled milestone "${targetMilestone.text}" in task "${t.title}".`);
        }
        const allCompleted = updatedMilestones.length > 0 && updatedMilestones.every(m => m.completed);
        return {
          ...t,
          milestones: updatedMilestones,
          status: allCompleted ? 'COMPLETED' : t.status
        };
      }
      return t;
    }));
  };

  const handleAddTaskMilestones = (taskId: string, milestones: any[]) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        logActivity('USER_ACTION', `Added ${milestones.length} micro-milestones to task "${t.title}".`);
        return {
          ...t,
          milestones: [...t.milestones, ...milestones]
        };
      }
      return t;
    }));
  };

  const handleResolveTask = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        logActivity('USER_ACTION', `Resolved high-stakes crisis: "${t.title}".`);
        return { ...t, status: 'COMPLETED', riskLevel: 'LOW' };
      }
      return t;
    }));
  };

  const handleDeleteTask = (taskId: string) => {
    const target = tasks.find(t => t.id === taskId);
    if (target) {
      logActivity('SYSTEM_ALERT', `Removed task entry: "${target.title}".`);
    }
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const handleAddTask = (title: string, priority: any, description: string = "", dueDate: string = "") => {
    const finalDueDate = dueDate || new Date(Date.now() + 86400000 * 2).toISOString(); // 2 days buffer
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title,
      description,
      priority,
      status: "TODO",
      dueDate: finalDueDate,
      estimatedHours: 2,
      riskLevel: "LOW",
      milestones: []
    };
    logActivity('USER_ACTION', `Created a new task: "${title}" [${priority} Priority].`);
    setTasks(prev => [newTask, ...prev]);
  };

  const handleAddGoal = (title: string, category: string, target: string, progress: number) => {
    const newGoal: Goal = {
      id: `g-${Date.now()}`,
      title,
      category: category.toUpperCase(),
      target,
      current: `0 of ${target}`,
      progress: Math.min(100, Math.max(0, progress))
    };
    logActivity('USER_ACTION', `Established a new goal: "${title}" in category ${category.toUpperCase()}.`);
    setGoals(prev => [...prev, newGoal]);
  };

  const handleUpdateGoalProgress = (id: string, progress: number) => {
    setGoals(prev => prev.map(g => {
      if (g.id === id) {
        logActivity('USER_ACTION', `Updated goal progress for "${g.title}" to ${progress}%.`);
        // Derive approximate current count for aesthetic fidelity
        let currentText = g.current;
        const numericTarget = parseFloat(g.target.replace(/[^0-9.]/g, ''));
        if (!isNaN(numericTarget)) {
          const unit = g.target.replace(/[0-9.\s]/g, '');
          const calculatedVal = Math.round((numericTarget * progress) / 100);
          currentText = `${calculatedVal}${unit ? ' ' + unit : ''}`;
        }
        return {
          ...g,
          progress: Math.min(100, Math.max(0, progress)),
          current: currentText
        };
      }
      return g;
    }));
  };

  const handleToggleHabit = (habitId: string, dateStr: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id === habitId) {
        const updatedHistory = { ...h.history };
        const isCheckingIn = !updatedHistory[dateStr];
        if (isCheckingIn) {
          updatedHistory[dateStr] = true;
        } else {
          delete updatedHistory[dateStr];
        }
        
        logActivity('USER_ACTION', `${isCheckingIn ? 'Completed' : 'Reset'} habit check-in: "${h.name}".`);
        
        // Calculate dynamic mock streak change
        const currentStreak = h.streak;
        const newStreak = updatedHistory[dateStr] ? currentStreak + 1 : Math.max(0, currentStreak - 1);

        return {
          ...h,
          history: updatedHistory,
          streak: newStreak
        };
      }
      return h;
    }));
  };

  const handleApplyProposal = (id: string) => {
    setProposals(prev => prev.map(p => p.id === id ? { ...p, applied: true } : p));
    
    // Find target and modify schedule constraints
    const targetProp = proposals.find(p => p.id === id);
    if (targetProp) {
      logActivity('AI_ASSISTANT', `Applied AI optimization suggestion: "${targetProp.title}".`);
      if (targetProp.type === "RESCHEDULE") {
        setTasks(prev => prev.map(t => t.id === targetProp.targetTaskId ? {
          ...t,
          dueDate: new Date(Date.now() + 18000000).toISOString() // Shift due times safely
        } : t));
      }
    }
  };

  const handleApplyAllProposals = () => {
    logActivity('AI_ASSISTANT', 'Applied all AI schedule optimization recommendations to core planner.');
    setProposals(prev => prev.map(p => ({ ...p, applied: true })));
    setTasks(prev => prev.map(t => {
      if (t.riskLevel !== 'LOW') {
        return {
          ...t,
          dueDate: new Date(Date.now() + 28800000).toISOString() // Add robust 8 hours buffer shift
        };
      }
      return t;
    }));
  };

  const handleUpdateSettings = (newSettings: AutonomySettings) => {
    logActivity('USER_ACTION', `Calibrated decision core level to "${newSettings.level}".`);
    setSettings(newSettings);
  };

  const handleClearData = () => {
    logActivity('SYSTEM_ALERT', 'Reset platform databases and calibration settings to default values.');
    localStorage.removeItem("lm_tasks");
    localStorage.removeItem("lm_goals");
    localStorage.removeItem("lm_habits");
    localStorage.removeItem("lm_proposals");
    localStorage.removeItem("lm_settings");
    setTasks(INITIAL_TASKS);
    setGoals(INITIAL_GOALS);
    setHabits(INITIAL_HABITS);
    setProposals(INITIAL_PROPOSALS);
    setSettings(INITIAL_SETTINGS);
  };

  // Run dynamic fetch optimization proposals based on workload
  const handleTriggerOptimize = async () => {
    logActivity('AI_ASSISTANT', 'Analyzing schedule load and optimizing high-priority commitments...');
    try {
      const response = await fetch("/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks })
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      setProposals(data.suggestions);
    } catch (err) {
      console.warn("Offline fallback optimization proposals triggered");
    }
  };

  if (!isAuthenticated) {
    return <LandingPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans text-slate-800 antialiased overflow-x-hidden">
      
      {/* Main Full-Width Shell */}
      <div className="flex-grow flex flex-col lg:flex-row">
        
        {/* SIDE NAVIGATION PANEL (Client navigation) */}
        <nav className="hidden lg:flex h-screen sticky top-0 w-72 bg-slate-950 text-slate-200 p-6 flex-col shrink-0 border-r border-slate-900 justify-between overflow-hidden">
          {/* Header / Brand (Fixed/Non-scrolling) */}
          <div className="flex items-center gap-3.5 shrink-0 mb-6">
            <div className="w-10 h-10 bg-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-950/40">
              <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin" style={{ animationDuration: '4s' }}></div>
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-white uppercase">LM Life Saver</h1>
              <p className="text-[10px] text-slate-400 font-extrabold tracking-widest uppercase">Your AI Companion</p>
            </div>
          </div>

          {/* Menu Items (Scrollable portion) */}
          <div className="flex-grow overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
            <button 
              onClick={() => { setActiveTab("dashboard"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all ${
                activeTab === "dashboard" 
                  ? 'bg-slate-900 text-orange-400 shadow-md border-l-4 border-orange-500 pl-3' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              Synergy Dashboard
            </button>

            <button 
              onClick={() => { setActiveTab("command"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all ${
                activeTab === "command" 
                  ? 'bg-slate-900 text-orange-400 shadow-md border-l-4 border-orange-500 pl-3' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Zap className="w-5 h-5" />
              Action Rescue Hub
            </button>

            <button 
              onClick={() => { setActiveTab("tasks"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all ${
                activeTab === "tasks" 
                  ? 'bg-slate-900 text-orange-400 shadow-md border-l-4 border-orange-500 pl-3' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <CalendarRange className="w-5 h-5" />
              Tasks & Planner
            </button>

            <button 
              onClick={() => { setActiveTab("goals"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all ${
                activeTab === "goals" 
                  ? 'bg-slate-900 text-orange-400 shadow-md border-l-4 border-orange-500 pl-3' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Target className="w-5 h-5" />
              Goals & Habits
            </button>

            {/* NEW MODULE: Activity Feed */}
            <button 
              onClick={() => { setActiveTab("activity-feed"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all ${
                activeTab === "activity-feed" 
                  ? 'bg-slate-900 text-indigo-400 shadow-md border-l-4 border-indigo-500 pl-3' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Activity className="w-5 h-5" />
              Activity Feed
            </button>

            <button 
              onClick={() => { setActiveTab("arena"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all ${
                activeTab === "arena" 
                  ? 'bg-slate-900 text-amber-400 shadow-md border-l-4 border-amber-500 pl-3' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Trophy className="w-5 h-5" />
              Synergy Arena
            </button>

            <button 
              onClick={() => { setActiveTab("abstract"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all ${
                activeTab === "abstract" 
                  ? 'bg-slate-900 text-indigo-400 shadow-md border-l-4 border-indigo-500 pl-3' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Infinity className="w-5 h-5 text-indigo-400 animate-pulse" />
              Abstract Core
            </button>

            <button 
              onClick={() => { setActiveTab("settings"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all ${
                activeTab === "settings" 
                  ? 'bg-slate-900 text-orange-400 shadow-md border-l-4 border-orange-500 pl-3' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Settings className="w-5 h-5" />
              Calibration Settings
            </button>
          </div>

          {/* Quick Assist Floating Trigger bottom of navigation (Fixed/Non-scrolling) */}
          <div className="pt-4 border-t border-slate-900 hidden lg:block shrink-0">
            <button 
              onClick={() => { setActiveTab("quick-assist"); setMobileMenuOpen(false); }}
              className={`w-full py-4 rounded-[24px] font-black text-base tracking-wide transition-all flex items-center justify-center gap-2.5 shadow-lg bg-[#FF5416] hover:bg-[#E0440D] text-white shadow-[#FF5416]/10`}
            >
              <Sparkles className="w-5 h-5 fill-current" />
              Quick Assist AI
            </button>
            
            {/* Simple User Status Card styled like screenshot */}
            <div 
              onClick={() => setActiveTab("profile")}
              className="flex items-center justify-between gap-2 mt-4 p-4 bg-[#0B132B]/50 hover:bg-[#0B132B]/80 rounded-[20px] border border-[#1E293B]/60 cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 bg-slate-800 border border-slate-700/80 text-slate-200 font-extrabold flex items-center justify-center text-sm rounded-[14px] overflow-hidden shrink-0 shadow-inner">
                  {profile.avatarUrl ? (
                    <img 
                      src={profile.avatarUrl} 
                      alt={profile.name} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getInitials(profile.name)
                  )}
                </div>
                <div className="truncate">
                  <p className="text-xs font-black text-white group-hover:text-amber-400 transition-colors leading-tight truncate">{profile.name}</p>
                  <p className="text-[9px] text-slate-500 font-black uppercase tracking-wider mt-0.5 truncate">{getTierDisplay(profile.subscriptionTier)}</p>
                </div>
              </div>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleLogout();
                }}
                title="Logout from console"
                className="p-2 bg-slate-900 hover:bg-[#FF5416] hover:text-white text-slate-400 rounded-xl transition-all border border-slate-800/80 hover:border-[#FF5416] shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </nav>

        {/* WORKSPACE AREA */}
        <div ref={workspaceRef} className="flex-grow flex flex-col max-h-screen overflow-y-auto bg-[#F8F9FA]">
          
          {/* Header Bar */}
          <header className="sticky top-0 z-30 bg-[#F8F9FA]/90 backdrop-blur-md px-4 sm:px-6 py-4 border-b border-slate-200/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              {/* Mobile menu toggle */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 transition-colors"
              >
                <Menu className="w-5 h-5 text-slate-700" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                  {activeTab === "dashboard" && "Synergy Dashboard"}
                  {activeTab === "command" && "Action Rescue Hub"}
                  {activeTab === "tasks" && "Daily Paced Queue"}
                  {activeTab === "goals" && "Milestone Momentum"}
                  {activeTab === "abstract" && "Abstract Focus Resonance"}
                  {activeTab === "settings" && "Calibrate Decision Core"}
                  {activeTab === "profile" && "User Profile & Stats"}
                  {activeTab === "quick-assist" && "Quick Assist AI Cockpit"}
                  {activeTab === "arena" && "Synergy Arena & Leaderboard"}
                </h1>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                  The Last-Minute Life Saver
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-4 w-full sm:w-auto justify-end">
              {/* Dynamic Active AI status indicator */}
              <div className="bg-white px-4 py-2 rounded-2xl border border-slate-200 flex items-center gap-2.5 shadow-sm text-xs font-bold text-slate-700">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                AI Active: Monitoring Deadlines
              </div>

              {/* Dynamic Date and Clock */}
              <div className="text-right shrink-0">
                <p className="text-sm font-black text-slate-800">{currentDate}</p>
                <p className="text-[10px] text-slate-400 font-extrabold tracking-widest uppercase">{currentTime}</p>
              </div>
            </div>
          </header>

          <div className="p-4 sm:p-6 flex flex-col gap-6 flex-grow">
            {/* Render Views based on tab */}
            <main className="flex-grow flex flex-col">
            {activeTab === "dashboard" && (
              <Dashboard 
                tasks={tasks}
                goals={goals}
                habits={habits}
                proposals={proposals}
                settings={settings}
                onNavigate={(tab) => {
                  setActiveTab(tab);
                  setMobileMenuOpen(false);
                }}
              />
            )}

            {activeTab === "command" && (
              <CommandCenter 
                tasks={tasks}
                onToggleTask={handleToggleTask}
                onToggleMilestone={handleToggleMilestone}
                onAddTaskMilestones={handleAddTaskMilestones}
                onResolveTask={handleResolveTask}
              />
            )}
            
            {activeTab === "tasks" && (
              <TasksPlanner 
                tasks={tasks}
                proposals={proposals}
                routines={routines}
                onAddTask={handleAddTask}
                onToggleTask={handleToggleTask}
                onApplyProposal={handleApplyProposal}
                onApplyAllProposals={handleApplyAllProposals}
                onDeleteTask={handleDeleteTask}
                onAddRoutine={handleAddRoutine}
                onToggleRoutine={handleToggleRoutine}
                onDeleteRoutine={handleDeleteRoutine}
              />
            )}

            {activeTab === "goals" && (
              <GoalsHabits 
                goals={goals}
                habits={habits}
                onToggleHabit={handleToggleHabit}
                onAddGoal={handleAddGoal}
                onUpdateGoalProgress={handleUpdateGoalProgress}
              />
            )}

            {activeTab === "settings" && (
              <SettingsConfig 
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
                onClearData={handleClearData}
              />
            )}

            {activeTab === "profile" && (
              <UserProfile 
                tasks={tasks}
                habitsCount={habits.length}
                goalsCount={goals.length}
                profile={profile}
                onUpdateProfile={setProfile}
              />
            )}

            {activeTab === "abstract" && (
              <Abstract 
                onAddTask={handleAddTask}
              />
            )}

            {activeTab === "quick-assist" && (
              <QuickAssistAi 
                tasks={tasks}
                settings={settings}
                proposals={proposals}
                onUpdateSettings={handleUpdateSettings}
                onApplyProposal={handleApplyProposal}
                onApplyAllProposals={handleApplyAllProposals}
                onAddTask={handleAddTask}
                onLogActivity={logActivity}
                onOpenChat={() => setIsChatOpen(true)}
              />
            )}

            {activeTab === "arena" && (
              <SynergyArena 
                tasks={tasks}
                goals={goals}
                habits={habits}
                proposals={proposals}
                settings={settings}
                onNavigate={(tab) => {
                  setActiveTab(tab);
                  setMobileMenuOpen(false);
                }}
              />
            )}

            {activeTab === "activity-feed" && (
              <ActivityFeed 
                activities={activities}
                onClearActivities={() => setActivities([])}
                onLogManualActivity={(msg) => logActivity('USER_ACTION', msg)}
              />
            )}
          </main>

          {/* Bottom AI Status Strip & Dynamic Insights Footer */}
          <footer className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-6 text-slate-600">
            {/* Column 1: AI Stress Index */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-between shadow-sm">
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">
                  Cognitive Stress Index
                </span>
                <div className="flex items-baseline gap-2">
                  <span className={`text-xl font-black ${
                    tasks.filter(t => t.priority === 'URGENT' && t.status !== 'COMPLETED').length > 1
                      ? 'text-orange-600'
                      : 'text-emerald-600'
                  }`}>
                    {tasks.filter(t => t.priority === 'URGENT' && t.status !== 'COMPLETED').length > 1 ? "Moderate Stress" : "Optimal Focus"}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">
                    ({tasks.filter(t => t.priority === 'URGENT' && t.status !== 'COMPLETED').length} urgent tasks left)
                  </span>
                </div>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    tasks.filter(t => t.priority === 'URGENT' && t.status !== 'COMPLETED').length > 1 ? 'bg-orange-500 w-1/2' : 'bg-emerald-500 w-1/4'
                  }`}
                ></div>
              </div>
            </div>

            {/* Column 2: Contextual AI Directives */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-between shadow-sm">
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">
                  Contextual AI Directive
                </span>
                <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                  {tasks.filter(t => t.priority === 'URGENT' && t.status !== 'COMPLETED').length > 0
                    ? `Priority target: "${tasks.filter(t => t.priority === 'URGENT' && t.status !== 'COMPLETED')[0].title}". Minimize multitasking triggers.`
                    : "Task queue cleared. Perfect window to reinforce daily habits & calibrate future sprints."
                  }
                </p>
              </div>
              <span className="text-[9px] font-extrabold text-amber-600 uppercase tracking-wider mt-2 block">
                ⚡ Real-time Smart Co-pilot
              </span>
            </div>

            {/* Column 3: Stats Ledger */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-between shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  Daily Progress Ledger
                </span>
                <span className="text-[11px] font-extrabold text-slate-700 bg-slate-200 px-2 py-0.5 rounded-full">
                  {tasks.filter(t => t.status === 'COMPLETED').length}/{tasks.length} Completed
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div className="bg-white p-2 rounded-xl border border-slate-100 text-center">
                  <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Total Streaks</p>
                  <p className="text-sm font-black text-slate-800">
                    {habits.reduce((acc, h) => acc + h.streak, 0)} Days
                  </p>
                </div>
                <div className="bg-white p-2 rounded-xl border border-slate-100 text-center">
                  <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Active Goals</p>
                  <p className="text-sm font-black text-slate-800">
                    {goals.filter(g => g.progress < 100).length} Enrolled
                  </p>
                </div>
              </div>
            </div>
          </footer>
          </div>

        </div>
      </div>

      {/* Slide-out AI Quick Assist Drawer */}
      <AiChatDrawer 
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentTasks={tasks}
        autonomySettings={settings}
        onAddTask={handleAddTask}
        onOptimizeSchedule={handleTriggerOptimize}
        currentRoutines={routines}
        onAddRoutine={handleAddRoutine}
        onNavigate={(tab) => {
          setActiveTab(tab);
          setMobileMenuOpen(false);
        }}
      />

      {/* Universal Floating AI Assistant trigger with pulsing animation and Bot icon */}
      {!isChatOpen && (
        <button 
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 w-14 h-14 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full shadow-2xl flex items-center justify-center z-[9999] transition-transform hover:scale-110 active:scale-95 group duration-200"
          title="Ask AI Assistant"
        >
          <Bot className="w-7 h-7 transition-transform group-hover:rotate-12" />
        </button>
      )}

      {/* Mobile Sidebar overlay Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-950/50 z-50 flex justify-start">
          <div className="bg-slate-950 w-72 h-full p-6 flex flex-col justify-between">
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-orange-600 rounded-xl flex items-center justify-center">
                    <span className="w-4 h-4 border border-white rounded-full border-t-transparent animate-spin"></span>
                  </div>
                  <h1 className="text-base font-black tracking-tight text-white uppercase">LM Life Saver</h1>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-1.5">
                <button 
                  onClick={() => { setActiveTab("dashboard"); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm text-left transition-all ${
                    activeTab === "dashboard" ? 'bg-slate-900 text-orange-400' : 'text-slate-400'
                  }`}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  Synergy Dashboard
                </button>
                <button 
                  onClick={() => { setActiveTab("command"); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm text-left transition-all ${
                    activeTab === "command" ? 'bg-slate-900 text-orange-400' : 'text-slate-400'
                  }`}
                >
                  <Zap className="w-5 h-5" />
                  Action Rescue Hub
                </button>
                <button 
                  onClick={() => { setActiveTab("tasks"); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm text-left transition-all ${
                    activeTab === "tasks" ? 'bg-slate-900 text-orange-400' : 'text-slate-400'
                  }`}
                >
                  <CalendarRange className="w-5 h-5" />
                  Tasks & Planner
                </button>
                <button 
                  onClick={() => { setActiveTab("goals"); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm text-left transition-all ${
                    activeTab === "goals" ? 'bg-slate-900 text-orange-400' : 'text-slate-400'
                  }`}
                >
                  <Target className="w-5 h-5" />
                  Goals & Habits
                </button>
                <button 
                  onClick={() => { setActiveTab("arena"); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm text-left transition-all ${
                    activeTab === "arena" ? 'bg-slate-900 text-amber-400 font-extrabold' : 'text-slate-400'
                  }`}
                >
                  <Trophy className="w-5 h-5" />
                  Synergy Arena
                </button>
                <button 
                  onClick={() => { setActiveTab("activity-feed"); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm text-left transition-all ${
                    activeTab === "activity-feed" ? 'bg-slate-900 text-indigo-400 font-extrabold' : 'text-slate-400'
                  }`}
                >
                  <Activity className="w-5 h-5" />
                  Activity Feed
                </button>
                <button 
                  onClick={() => { setActiveTab("abstract"); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm text-left transition-all ${
                    activeTab === "abstract" ? 'bg-slate-900 text-indigo-400 font-extrabold' : 'text-slate-400'
                  }`}
                >
                  <Infinity className="w-5 h-5 text-indigo-400" />
                  Abstract Core
                </button>
                <button 
                  onClick={() => { setActiveTab("settings"); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm text-left transition-all ${
                    activeTab === "settings" ? 'bg-slate-900 text-orange-400' : 'text-slate-400'
                  }`}
                >
                  <Settings className="w-5 h-5" />
                  Calibration Settings
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              <button 
                onClick={() => { setActiveTab("quick-assist"); setMobileMenuOpen(false); }}
                className={`w-full py-4.5 rounded-[24px] font-black text-base tracking-wide transition-all flex items-center justify-center gap-2.5 bg-[#FF5416] hover:bg-[#E0440D] text-white shadow-lg`}
              >
                <Sparkles className="w-5 h-5 fill-current" />
                Quick Assist AI
              </button>

              {/* Status Card on mobile */}
              <div 
                onClick={() => { setActiveTab("profile"); setMobileMenuOpen(false); }}
                className="flex items-center justify-between gap-2 p-4 bg-[#0B132B]/50 hover:bg-[#0B132B]/80 rounded-[20px] border border-[#1E293B]/60 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-11 h-11 bg-slate-800 border border-slate-700/80 text-slate-200 font-extrabold flex items-center justify-center text-xs rounded-[12px] overflow-hidden shrink-0 shadow-inner">
                    {profile.avatarUrl ? (
                      <img 
                        src={profile.avatarUrl} 
                        alt={profile.name} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      getInitials(profile.name)
                    )}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-black text-white leading-tight truncate">{profile.name}</p>
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-wider mt-0.5 truncate">{getTierDisplay(profile.subscriptionTier)}</p>
                  </div>
                </div>

                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  title="Logout from console"
                  className="p-2.5 bg-slate-900 hover:bg-[#FF5416] hover:text-white text-slate-400 rounded-xl transition-all border border-slate-800/80 hover:border-[#FF5416] shrink-0"
                >
                  <LogOut className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

import React, { useState, useEffect } from "react";
import { 
  Settings, 
  ShieldCheck, 
  HelpCircle, 
  Bell, 
  User, 
  CloudLightning, 
  RefreshCw, 
  AlertTriangle, 
  ToggleLeft, 
  ToggleRight, 
  Trash2, 
  Link, 
  Unlink, 
  Sparkles, 
  Bot, 
  Plus, 
  Check, 
  Loader2, 
  Info, 
  X, 
  Send,
  ExternalLink,
  Eye,
  Lock,
  Clock,
  Calendar,
  Mail,
  File,
  Folder,
  AlertCircle,
  CheckSquare,
  Globe,
  FileText
} from "lucide-react";
import { AutonomySettings } from "../types";

interface SettingsConfigProps {
  settings: AutonomySettings;
  onUpdateSettings: (newSettings: AutonomySettings) => void;
  onClearData: () => void;
}

interface PipelineTool {
  id: string;
  name: string;
  icon: string;
  category: 'GOOGLE' | 'THIRD_PARTY';
  status: 'CONNECTED' | 'NOT_LINKED';
  isSynced: boolean;
  lastSynced: string;
  syncInfo?: string;
  scope?: string;
}

interface MockEvent {
  id: string;
  title: string;
  time: string;
  duration: string;
  priority: 'High' | 'Medium' | 'Low';
}

interface MockEmail {
  id: string;
  from: string;
  subject: string;
  priority: 'High' | 'Normal' | 'Info';
  snippet: string;
  actioned: boolean;
}

interface MockFile {
  id: string;
  name: string;
  size: string;
  type: string;
  lastModified: string;
}

interface MockSheetRow {
  id: string;
  task: string;
  effort: string;
  status: 'Done' | 'In Progress' | 'Pending';
}

const DEFAULT_TOOLS: PipelineTool[] = [
  { id: "g-calendar", name: "Google Calendar", icon: "📅", category: "GOOGLE", status: "CONNECTED", isSynced: true, lastSynced: "Just now", syncInfo: "4 events synced today", scope: "https://www.googleapis.com/auth/calendar.events.readonly" },
  { id: "g-gmail", name: "Gmail Priorities", icon: "✉️", category: "GOOGLE", status: "CONNECTED", isSynced: true, lastSynced: "5m ago", syncInfo: "3 priority emails analyzed", scope: "https://www.googleapis.com/auth/gmail.metadata" },
  { id: "g-drive", name: "Google Drive Auditer", icon: "📁", category: "GOOGLE", status: "NOT_LINKED", isSynced: false, lastSynced: "Never", syncInfo: "Unlinked", scope: "https://www.googleapis.com/auth/drive.metadata.readonly" },
  { id: "g-docs", name: "Google Docs Synthesizer", icon: "📄", category: "GOOGLE", status: "NOT_LINKED", isSynced: false, lastSynced: "Never", syncInfo: "Unlinked", scope: "https://www.googleapis.com/auth/documents.readonly" },
  { id: "g-sheets", name: "Google Sheets Planner", icon: "📊", category: "GOOGLE", status: "NOT_LINKED", isSynced: false, lastSynced: "Never", syncInfo: "Unlinked", scope: "https://www.googleapis.com/auth/spreadsheets.readonly" },
  { id: "slack", name: "Slack Workspaces", icon: "💬", category: "THIRD_PARTY", status: "NOT_LINKED", isSynced: false, lastSynced: "Never", syncInfo: "Unlinked" },
  { id: "outlook", name: "Outlook Mail", icon: "📧", category: "THIRD_PARTY", status: "NOT_LINKED", isSynced: false, lastSynced: "Never", syncInfo: "Unlinked" }
];

export default function SettingsConfig({
  settings,
  onUpdateSettings,
  onClearData
}: SettingsConfigProps) {
  const [aggression, setAggression] = useState(settings.optimizationAggression || 65);
  const [showRescueSim, setShowRescueSim] = useState(false);
  const [simStep, setSimStep] = useState(0);

  // Integrations state loaded from localStorage
  const [tools, setTools] = useState<PipelineTool[]>(() => {
    const saved = localStorage.getItem("lifesaver_pipeline_tools_v1");
    return saved ? JSON.parse(saved) : DEFAULT_TOOLS;
  });

  // Mock Workspace Sandbox Database States for Checkout and Previews
  const [mockEvents, setMockEvents] = useState<MockEvent[]>(() => {
    const saved = localStorage.getItem("ls_mock_events_v1");
    return saved ? JSON.parse(saved) : [
      { id: "e1", title: "Q4 Product Milestone Review", time: "09:00 AM", duration: "1h", priority: "High" },
      { id: "e2", title: "Synergy Alignment Session", time: "11:30 AM", duration: "30m", priority: "Medium" },
      { id: "e3", title: "Deep Work Block: Core Algorithms", time: "01:30 PM", duration: "2h", priority: "High" }
    ];
  });

  const [mockEmails, setMockEmails] = useState<MockEmail[]>(() => {
    const saved = localStorage.getItem("ls_mock_emails_v1");
    return saved ? JSON.parse(saved) : [
      { id: "m1", from: "Sarah Jenkins (CEO)", subject: "URGENT: Slide Deck updates needed before 3pm", priority: "High", snippet: "Please review the Q4 overcommit metrics slides before we pitch to board members.", actioned: false },
      { id: "m2", from: "Synergy Health Bot", subject: "Workspace alignment is 98% efficient", priority: "Normal", snippet: "No active overcommitment fatigue risk detected in the local time zone.", actioned: false },
      { id: "m3", from: "GitHub Alerts", subject: "[Success] Build #2094 deployed successfully", priority: "Info", snippet: "Production build deployed to Cloud Run containers.", actioned: true }
    ];
  });

  const [mockFiles, setMockFiles] = useState<MockFile[]>(() => {
    const saved = localStorage.getItem("ls_mock_files_v1");
    return saved ? JSON.parse(saved) : [
      { id: "f1", name: "Product_Strategy_Brief_2026.docx", size: "1.2 MB", type: "document", lastModified: "2h ago" },
      { id: "f2", name: "Milestone_Fatigue_Metrics.xlsx", size: "450 KB", type: "spreadsheet", lastModified: "Just now" },
      { id: "f3", name: "Architecture_Overview_v2.pdf", size: "3.1 MB", type: "pdf", lastModified: "Yesterday" }
    ];
  });

  const [mockSheetRows, setMockSheetRows] = useState<MockSheetRow[]>(() => {
    const saved = localStorage.getItem("ls_mock_sheet_rows_v1");
    return saved ? JSON.parse(saved) : [
      { id: "s1", task: "Deploy Firestore & Secure Rules", effort: "2h", status: "Done" },
      { id: "s2", task: "Configure Deep Focus Audio Synthesizer", effort: "4h", status: "In Progress" },
      { id: "s3", task: "Refactor Settings Layout for High Responsiveness", effort: "1h", status: "Done" }
    ];
  });

  const [activePreviewTool, setActivePreviewTool] = useState<PipelineTool | null>(null);

  // Temporary sandbox form inputs
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventTime, setNewEventTime] = useState("10:00 AM");
  const [newEventPriority, setNewEventPriority] = useState<'High' | 'Medium' | 'Low'>("High");

  const [newFileName, setNewFileName] = useState("");
  const [newFileSize, setNewFileSize] = useState("1.5 MB");

  const [newSheetTask, setNewSheetTask] = useState("");
  const [newSheetEffort, setNewSheetEffort] = useState("2h");
  const [newSheetStatus, setNewSheetStatus] = useState<'Pending' | 'In Progress' | 'Done'>("Pending");

  // Save to localStorage whenever tools or mock data updates
  useEffect(() => {
    localStorage.setItem("lifesaver_pipeline_tools_v1", JSON.stringify(tools));
  }, [tools]);

  useEffect(() => {
    localStorage.setItem("ls_mock_events_v1", JSON.stringify(mockEvents));
  }, [mockEvents]);

  useEffect(() => {
    localStorage.setItem("ls_mock_emails_v1", JSON.stringify(mockEmails));
  }, [mockEmails]);

  useEffect(() => {
    localStorage.setItem("ls_mock_files_v1", JSON.stringify(mockFiles));
  }, [mockFiles]);

  useEffect(() => {
    localStorage.setItem("ls_mock_sheet_rows_v1", JSON.stringify(mockSheetRows));
  }, [mockSheetRows]);

  // Real-time toast state
  const [toast, setToast] = useState<string | null>(null);

  const showToastMsg = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const getExternalUrl = (id: string) => {
    switch (id) {
      case "g-calendar": return "https://calendar.google.com";
      case "g-gmail": return "https://mail.google.com";
      case "g-drive": return "https://drive.google.com";
      case "g-docs": return "https://docs.google.com";
      case "g-sheets": return "https://sheets.google.com";
      case "g-slides": return "https://docs.google.com/presentation";
      case "g-tasks": return "https://mail.google.com/tasks/canvas";
      case "g-keep": return "https://keep.google.com";
      case "g-meet": return "https://meet.google.com";
      case "slack": return "https://slack.com";
      case "outlook": return "https://outlook.live.com";
      default: return "https://google.com";
    }
  };

  // Mock workspace database state action handlers
  const handleAddMockEvent = (title: string, time: string, priority: 'High' | 'Medium' | 'Low') => {
    if (!title.trim()) return;
    const newEvent: MockEvent = {
      id: `e-custom-${Date.now()}`,
      title,
      time: time || "12:00 PM",
      duration: "1h",
      priority
    };
    setMockEvents(prev => [...prev, newEvent]);
    showToastMsg(`New event "${title}" added to Google Calendar sandbox!`);
  };

  const handleDeleteMockEvent = (id: string) => {
    setMockEvents(prev => prev.filter(e => e.id !== id));
    showToastMsg(`Removed calendar event.`);
  };

  const handleActionMockEmail = (id: string, subject: string) => {
    setMockEmails(prev => prev.map(m => m.id === id ? { ...m, actioned: !m.actioned } : m));
    showToastMsg(`Email state updated.`);
  };

  const handleAddMockFile = (name: string, size: string) => {
    if (!name.trim()) return;
    const newFile: MockFile = {
      id: `f-custom-${Date.now()}`,
      name,
      size: size || "240 KB",
      type: name.includes(".") ? name.split(".").pop() || "document" : "document",
      lastModified: "Just now"
    };
    setMockFiles(prev => [newFile, ...prev]);
    showToastMsg(`"${name}" synced to Google Drive sandbox successfully!`);
  };

  const handleDeleteMockFile = (id: string) => {
    setMockFiles(prev => prev.filter(f => f.id !== id));
    showToastMsg(`Removed document.`);
  };

  const handleAddMockRow = (task: string, effort: string, status: 'Done' | 'In Progress' | 'Pending') => {
    if (!task.trim()) return;
    const newRow: MockSheetRow = {
      id: `s-custom-${Date.now()}`,
      task,
      effort: effort || "1h",
      status
    };
    setMockSheetRows(prev => [...prev, newRow]);
    showToastMsg(`Appended plan to Google Sheets spreadsheet!`);
  };

  const handleDeleteMockRow = (id: string) => {
    setMockSheetRows(prev => prev.filter(s => s.id !== id));
    showToastMsg(`Removed row.`);
  };

  const handleLevelChange = (level: 'Assistant' | 'Co-Pilot' | 'Autopilot') => {
    onUpdateSettings({
      ...settings,
      level
    });
    showToastMsg(`Autonomy mode updated to "${level}" in real-time!`);
  };

  const togglePreference = (key: keyof AutonomySettings) => {
    if (typeof settings[key] === 'boolean') {
      const nextVal = !settings[key];
      onUpdateSettings({
        ...settings,
        [key]: nextVal
      });
      showToastMsg(`Preference "${key}" toggled to ${nextVal ? 'ON' : 'OFF'} successfully!`);
    }
  };

  // Run mock AI Override animation
  const startRescueSimulation = () => {
    setShowRescueSim(true);
    setSimStep(1);
    
    setTimeout(() => {
      setSimStep(2);
    }, 2000);

    setTimeout(() => {
      setSimStep(3);
    }, 4500);
  };

  // Integration pipeline interactions
  const [spinningId, setSpinningId] = useState<string | null>(null);

  // Manual link & unlink toggles
  const handleLinkTool = (id: string, name: string) => {
    const isGoogle = id.startsWith("g-") || id === "g-slides" || id === "g-tasks" || id === "g-keep" || id === "g-meet";
    const actionMsg = isGoogle 
      ? `Would you like to securely authorize and link "${name}" through Google Workspace OAuth? This requests least-privilege sandbox scopes.`
      : `Would you like to authorize and link third-party provider "${name}"?`;

    if (window.confirm(actionMsg)) {
      setSpinningId(id);
      setTimeout(() => {
        setTools(prev => prev.map(t => t.id === id ? {
          ...t,
          status: "CONNECTED",
          isSynced: true,
          lastSynced: "Just now",
          syncInfo: isGoogle ? "Linked via Firebase Auth Google Provider" : "API endpoint established"
        } : t));
        setSpinningId(null);
        showToastMsg(`Successfully authorized & linked ${name}!`);
      }, 1200);
    }
  };

  const handleUnlinkTool = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to unlink and revoke OAuth permissions for "${name}"? This deletes cached access credentials.`)) {
      setTools(prev => prev.map(t => t.id === id ? {
        ...t,
        status: "NOT_LINKED",
        isSynced: false,
        lastSynced: "Never",
        syncInfo: "Unlinked"
      } : t));
      showToastMsg(`Revoked permissions & unlinked ${name}.`);
    }
  };

  // Manual toggle of Sync / Unsync
  const handleToggleSync = (id: string, name: string) => {
    setTools(prev => prev.map(t => {
      if (t.id === id) {
        const nextSync = !t.isSynced;
        showToastMsg(`${name} live sync is now ${nextSync ? 'ENABLED' : 'DISABLED'}`);
        return {
          ...t,
          isSynced: nextSync,
          syncInfo: nextSync ? "Automatic live sync active" : "Sync paused manually"
        };
      }
      return t;
    }));
  };

  // Manual immediate Sync Now trigger
  const handleSyncNow = (id: string, name: string) => {
    setSpinningId(id);
    setTimeout(() => {
      setTools(prev => prev.map(t => t.id === id ? {
        ...t,
        lastSynced: "Just now",
        syncInfo: `Synced successfully (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`
      } : t));
      setSpinningId(null);
      showToastMsg(`${name} data synchronized in real-time!`);
    }, 1000);
  };

  // AI-Driven custom tool integration state
  const [aiInput, setAiInput] = useState("");
  const [aiIntegrating, setAiIntegrating] = useState(false);
  const [aiStep, setAiStep] = useState(0);
  const [aiLogs, setAiLogs] = useState<string[]>([]);

  const handleAiIntegrateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim()) return;

    setAiIntegrating(true);
    setAiStep(1);
    setAiLogs(["Initiating Synergy AI Deep Agent..."]);

    // Step 1: Analyze request
    setTimeout(() => {
      setAiStep(2);
      setAiLogs(prev => [...prev, `AI identified tool request: "${aiInput.trim()}"`, "Mapping OAuth scope schema configurations..."]);
    }, 1200);

    // Step 2: Establish pipeline connections
    setTimeout(() => {
      setAiStep(3);
      setAiLogs(prev => [...prev, "Dynamic routing established with Google Cloud Workspace endpoint.", "Setting up client permission sandboxes..."]);
    }, 2400);

    // Step 3: Grant access & finalize
    setTimeout(() => {
      setAiStep(4);
      setAiLogs(prev => [...prev, "OAuth handshake validated. Token parameters set.", "Injecting custom UI controls..."]);
    }, 3800);

    // Finalize
    setTimeout(() => {
      // Determine appropriate name, icon and ID
      const query = aiInput.toLowerCase();
      let toolId = `g-custom-${Date.now()}`;
      let toolName = "AI Custom Tool";
      let toolIcon = "🔗";
      let toolScope = "";

      if (query.includes("slide")) {
        toolId = "g-slides";
        toolName = "Google Slides Presentations";
        toolIcon = "🛝";
        toolScope = "https://www.googleapis.com/auth/presentations.readonly";
      } else if (query.includes("meet")) {
        toolId = "g-meet";
        toolName = "Google Meet Video Sync";
        toolIcon = "📹";
        toolScope = "https://www.googleapis.com/auth/meetings.space.readonly";
      } else if (query.includes("task")) {
        toolId = "g-tasks";
        toolName = "Google Tasks Organizer";
        toolIcon = "📋";
        toolScope = "https://www.googleapis.com/auth/tasks";
      } else if (query.includes("keep")) {
        toolId = "g-keep";
        toolName = "Google Keep Notes";
        toolIcon = "💡";
        toolScope = "https://www.googleapis.com/auth/keep.readonly";
      } else if (query.includes("youtube")) {
        toolId = "g-youtube";
        toolName = "YouTube Studio";
        toolIcon = "📺";
      } else if (query.includes("notion")) {
        toolId = "notion";
        toolName = "Notion Pages";
        toolIcon = "📓";
      } else {
        // Extract capitalized words if possible
        const cleanName = aiInput.replace(/integrate|connect|add/gi, "").trim();
        toolName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
        if (toolName.toLowerCase().includes("google")) {
          toolIcon = "������";
        }
      }

      // Append new tool to tools list (either override existing or add new)
      setTools(prev => {
        if (prev.some(t => t.id === toolId)) {
          return prev.map(t => t.id === toolId ? {
            ...t,
            status: "CONNECTED",
            isSynced: true,
            lastSynced: "Just now",
            syncInfo: "AI configuration updated successfully"
          } : t);
        }
        const newTool: PipelineTool = {
          id: toolId,
          name: toolName,
          icon: toolIcon,
          category: toolId.startsWith("g-") ? "GOOGLE" : "THIRD_PARTY",
          status: "CONNECTED",
          isSynced: true,
          lastSynced: "Just now",
          syncInfo: "Configured & linked automatically by AI Agent",
          scope: toolScope || undefined
        };
        return [...prev, newTool];
      });

      setAiIntegrating(false);
      setAiInput("");
      setAiStep(0);
      setAiLogs([]);
      showToastMsg(`AI Agent successfully integrated and connected "${toolName}"!`);
    }, 5000);
  };

  return (
    <div id="settings-config-root" className="grid grid-cols-12 gap-5 w-full max-w-7xl mx-auto font-sans text-slate-800 relative">
      
      {/* Toast Alert Popups for Real-Time Confirmation */}
      {toast && (
        <div className="fixed bottom-6 left-6 bg-slate-900 border border-indigo-500 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 z-50 animate-slideUp">
          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-ping"></div>
          <p className="text-xs font-bold">{toast}</p>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-white ml-2">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Simulation overlay */}
      {showRescueSim && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 max-w-lg w-full rounded-3xl border border-orange-500 p-6 text-slate-100 flex flex-col items-center text-center shadow-2xl">
            {simStep === 1 && (
              <div className="animate-pulse">
                <AlertTriangle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                <h3 className="text-xl font-extrabold text-orange-400">CRITICAL PRIORITY COLLISION</h3>
                <p className="text-sm text-slate-300 mt-2">
                  Analyzing upcoming slot conflict. 'Q4 Shareholder Presentation' overlaps with 'Sync Review Meetings'.
                </p>
                <div className="mt-6 flex items-center justify-center gap-2">
                  <RefreshCw className="w-5 h-5 text-orange-500 animate-spin" />
                  <span className="text-xs text-slate-400">Recalibrating schedule weights...</span>
                </div>
              </div>
            )}
            
            {simStep === 2 && (
              <div className="animate-pulse">
                <CloudLightning className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
                <h3 className="text-xl font-extrabold text-indigo-400">AI OPTIMIZATION APPLIED</h3>
                <p className="text-sm text-slate-300 mt-2">
                  Routine meeting 'Sync Review' moved to 14:30 (Matches lowest cognitive fatigue slot).
                  Buffer secured: 2 hours 15 minutes restored.
                </p>
                <div className="mt-6 flex items-center justify-center gap-2">
                  <span className="text-xs text-green-400 font-bold uppercase">Securing notification protocols...</span>
                </div>
              </div>
            )}

            {simStep === 3 && (
              <div>
                <ShieldCheck className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-extrabold text-green-400">SCHEDULE OVERRIDE SECURE</h3>
                <p className="text-sm text-slate-300 mt-2">
                  Completed in {settings.level} autonomous mode. No user efforts required. Overcommit risk reduced to 2%.
                </p>
                <button 
                  onClick={() => setShowRescueSim(false)}
                  className="mt-6 px-6 py-2.5 bg-green-600 hover:bg-green-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
                >
                  Dismiss Safe Alert
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* LEFT COLUMN - Configuration Details (7 columns) */}
      <div className="col-span-12 lg:col-span-7 flex flex-col gap-5">
        
        {/* Autonomy calibration */}
        <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-400">AI Autonomy Calibration</h3>
                <p className="text-xs text-slate-500 mt-0.5">Control the Life Saver's dynamic schedule authority</p>
              </div>
              <span className="self-start sm:self-center text-[10px] bg-orange-100 text-orange-600 border border-orange-200 font-extrabold px-3 py-1 rounded-full uppercase shrink-0">
                Crucial Setting
              </span>
            </div>

            {/* Selector boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <div 
                onClick={() => handleLevelChange('Assistant')}
                className={`p-4.5 rounded-2xl border cursor-pointer hover:shadow-sm transition-all ${
                  settings.level === 'Assistant' 
                    ? 'border-indigo-600 bg-indigo-50/20' 
                    : 'border-slate-100 bg-slate-50'
                }`}
              >
                <span className="text-xs font-bold block text-slate-800">Assistant</span>
                <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                  Proposes options. You make every final calendar adjustment.
                </p>
              </div>

              <div 
                onClick={() => handleLevelChange('Co-Pilot')}
                className={`p-4.5 rounded-2xl border cursor-pointer hover:shadow-sm transition-all ${
                  settings.level === 'Co-Pilot' 
                    ? 'border-orange-500 bg-orange-50/20' 
                    : 'border-slate-100 bg-slate-50'
                }`}
              >
                <span className="text-xs font-bold block text-slate-800">Co-Pilot</span>
                <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                  Drafts recommendations, lists warnings, asks for click approval.
                </p>
              </div>

              <div 
                onClick={() => handleLevelChange('Autopilot')}
                className={`p-4.5 rounded-2xl border cursor-pointer hover:shadow-sm transition-all ${
                  settings.level === 'Autopilot' 
                    ? 'border-emerald-600 bg-emerald-50/20' 
                    : 'border-slate-100 bg-slate-50'
                }`}
              >
                <span className="text-xs font-bold block text-slate-800">Autopilot</span>
                <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                  AI automatically manages routine overlaps autonomously.
                </p>
              </div>
            </div>

            {/* Slider aggression */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-700">Optimization Aggression</span>
                <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  Balanced ({aggression}%)
                </span>
              </div>
              <input 
                type="range"
                min="10"
                max="100"
                value={aggression}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setAggression(val);
                  onUpdateSettings({ ...settings, optimizationAggression: val });
                }}
                onMouseUp={() => showToastMsg(`Aggression updated to ${aggression}% (real-time applied)`)}
                onTouchEnd={() => showToastMsg(`Aggression updated to ${aggression}% (real-time applied)`)}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-400 font-semibold uppercase mt-1">
                <span>Passive</span>
                <span>Balanced</span>
                <span>Critical Focus</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notification preferences */}
        <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-slate-100 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-400">Notification Preferences</h3>
              <p className="text-xs text-slate-500 mt-0.5">Control how and when the co-pilot interrupts</p>
            </div>
            <button 
              onClick={startRescueSimulation}
              className="w-full sm:w-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer text-center"
            >
              Test Alert Protocol
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 bg-slate-50 rounded-2xl flex justify-between items-center border border-slate-100">
              <div>
                <p className="text-xs font-bold text-slate-800">Interrupt "Do Not Disturb"</p>
                <p className="text-[10px] text-slate-400 mt-0.5">If deadline completion risk hits high</p>
              </div>
              <button onClick={() => togglePreference('interruptDoNotDisturb')} className="text-slate-600 focus:outline-none cursor-pointer">
                {settings.interruptDoNotDisturb ? (
                  <ToggleRight className="w-10 h-10 text-orange-500" />
                ) : (
                  <ToggleLeft className="w-10 h-10 text-slate-300" />
                )}
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl flex justify-between items-center border border-slate-100">
              <div>
                <p className="text-xs font-bold text-slate-800">Sms Fallback for Overdue</p>
                <p className="text-[10px] text-slate-400 mt-0.5">If app is completely offline</p>
              </div>
              <button onClick={() => togglePreference('smsFallback')} className="text-slate-600 focus:outline-none cursor-pointer">
                {settings.smsFallback ? (
                  <ToggleRight className="w-10 h-10 text-orange-500" />
                ) : (
                  <ToggleLeft className="w-10 h-10 text-slate-300" />
                )}
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl flex justify-between items-center border border-slate-100">
              <div>
                <p className="text-xs font-bold text-slate-800">Morning Strategy Brief</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Auto-generates brief overview at 8am</p>
              </div>
              <button onClick={() => togglePreference('morningBrief')} className="text-slate-600 focus:outline-none cursor-pointer">
                {settings.morningBrief ? (
                  <ToggleRight className="w-10 h-10 text-orange-500" />
                ) : (
                  <ToggleLeft className="w-10 h-10 text-slate-300" />
                )}
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl flex justify-between items-center border border-slate-100">
              <div>
                <p className="text-xs font-bold text-slate-800">Contextual Task Reminders</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Alerts with buffer remaining estimates</p>
              </div>
              <button onClick={() => togglePreference('contextualReminders')} className="text-slate-600 focus:outline-none cursor-pointer">
                {settings.contextualReminders ? (
                  <ToggleRight className="w-10 h-10 text-orange-500" />
                ) : (
                  <ToggleLeft className="w-10 h-10 text-slate-300" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN - Integrations list & Purge data (5 columns) */}
      <div className="col-span-12 lg:col-span-5 flex flex-col gap-5">
        
        {/* Integrations panel */}
        <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm flex flex-col gap-5">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-1">
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-1.5">
                <CloudLightning className="w-4 h-4 text-indigo-500 animate-pulse shrink-0" />
                <span>Integrations Pipeline</span>
              </h3>
              <span className="self-start sm:self-center text-[9px] bg-indigo-50 text-indigo-600 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider border border-indigo-100">
                OAuth Active
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-bold mb-4">
              Manually link / unlink and toggle automatic sync on-demand.
            </p>
            
            {/* Dynamic Tools List */}
            <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
              {tools.map((tool) => {
                const isConnected = tool.status === "CONNECTED";
                const isSpinning = spinningId === tool.id;

                return (
                  <div 
                    key={tool.id} 
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isConnected 
                        ? 'bg-slate-50/50 border-slate-100 hover:bg-slate-50' 
                        : 'bg-slate-100/30 border-dashed border-slate-200 opacity-75'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl shrink-0">{tool.icon}</span>
                        <div>
                          <p className="text-xs font-black text-slate-850 flex items-center gap-1 flex-wrap">
                            {tool.name}
                            {isConnected && (
                              <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping ml-1 shrink-0" />
                            )}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className={`text-[9px] font-black uppercase tracking-wider ${
                              isConnected ? 'text-emerald-600' : 'text-slate-400'
                            }`}>
                              {tool.status}
                            </span>
                            <span className="text-[9px] text-slate-400 font-bold">
                              • Last synced: {tool.lastSynced}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Main Action buttons */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center ml-11 sm:ml-0 flex-wrap shrink-0">
                        {isSpinning ? (
                          <div className="p-1.5 bg-slate-100 rounded-lg text-slate-400 animate-spin">
                            <Loader2 className="w-3.5 h-3.5" />
                          </div>
                        ) : isConnected ? (
                          <>
                            {/* Inside-platform Checkout/Preview button */}
                            <button 
                              onClick={() => setActivePreviewTool(tool)}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-sm shrink-0"
                              title="Checkout Real-Time Synced Sandbox Data"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Checkout</span>
                            </button>

                            {/* Direct off-platform URL checkout */}
                            <a 
                              href={getExternalUrl(tool.id)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition-all cursor-pointer"
                              title={`Open official ${tool.name} in new tab`}
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>

                            {/* Refresh sync button */}
                            <button 
                              onClick={() => handleSyncNow(tool.id, tool.name)}
                              className="p-1.5 hover:bg-indigo-50 text-indigo-600 hover:text-indigo-800 rounded-lg transition-all cursor-pointer"
                              title="Sync Data Now"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>

                            {/* Unlink permission */}
                            <button 
                              onClick={() => handleUnlinkTool(tool.id, tool.name)}
                              className="p-1.5 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-lg transition-all cursor-pointer"
                              title="Unlink Provider"
                            >
                              <Unlink className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          /* Link permission */
                          <button 
                            onClick={() => handleLinkTool(tool.id, tool.name)}
                            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold rounded-lg transition-all cursor-pointer shadow-sm flex items-center gap-1 uppercase"
                          >
                            <Link className="w-2.5 h-2.5" />
                            Link
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Lower Synced state Controls */}
                    {isConnected && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100/80 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 font-bold italic">
                          {tool.syncInfo}
                        </span>
                        
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400 font-semibold uppercase tracking-wide">Auto Sync</span>
                          <button 
                            onClick={() => handleToggleSync(tool.id, tool.name)}
                            className="focus:outline-none cursor-pointer"
                          >
                            {tool.isSynced ? (
                              <ToggleRight className="w-7 h-7 text-emerald-500" />
                            ) : (
                              <ToggleLeft className="w-7 h-7 text-slate-300" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Custom Tool Integration Box */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl p-4.5 text-white border border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <Sparkles className="w-16 h-16 text-indigo-400" />
            </div>

            <h4 className="text-xs font-black uppercase tracking-widest text-indigo-300 flex items-center gap-1.5 mb-1">
              <Bot className="w-4 h-4 text-indigo-400 animate-bounce" />
              Integrate Google Workspace via AI
            </h4>
            <p className="text-[10px] text-slate-300 font-medium leading-relaxed mb-3">
              Request other Google Workspace apps (like Google Slides, Meet, Tasks, or Keep) and the Synergy AI Agent will instantly map dependencies, map scopes, and establish sandbox channels.
            </p>

            {aiIntegrating ? (
              <div className="space-y-3 bg-slate-950/40 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                  <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">
                    AI HANDSHAKE STEP {aiStep}/4
                  </span>
                </div>
                <div className="space-y-1.5 font-mono text-[9px] text-slate-400">
                  {aiLogs.map((log, index) => (
                    <div key={index} className="flex items-start gap-1">
                      <span className="text-emerald-500">✓</span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <form onSubmit={handleAiIntegrateSubmit} className="flex gap-2">
                <input 
                  type="text" 
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="e.g. Integrate Google Keep notes or Slides..."
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold placeholder-slate-500 focus:outline-none focus:border-indigo-500 flex-1"
                />
                <button 
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-3 py-2 flex items-center justify-center transition-all cursor-pointer shadow-lg hover:shadow-indigo-500/20"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
          
          <div className="p-3.5 bg-indigo-50/40 border border-indigo-100 rounded-2xl flex gap-2.5">
            <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-[10px] text-indigo-950 font-bold leading-normal">
              <span className="uppercase block font-extrabold text-indigo-600 mb-0.5">Pre-Integrated Architecture</span>
              All API configurations and oauth client applications are securely initialized beforehand. When you link any tool, our system dynamically requests the requested permissions for instantaneous activation.
            </div>
          </div>
        </div>

        {/* Privacy & Purge options */}
        <div className="bg-slate-900 rounded-[32px] p-6 text-white flex flex-col justify-between min-h-[160px] border border-slate-800">
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-2">Privacy & Local Storage</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Your active deadline metadata is stored locally to maintain zero leaks. Resetting purges all custom milestones and tasks.
            </p>
          </div>
          <button 
            onClick={() => {
              if (window.confirm("Are you sure you want to purge all local schedule data? This cannot be undone.")) {
                onClearData();
                showToastMsg("All local storage memory has been purged!");
              }
            }}
            className="w-full bg-red-950/40 border border-red-900 text-red-400 hover:bg-red-950/70 rounded-xl py-3 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Purge All Schedule Memory
          </button>
        </div>

      </div>

      {/* Real-time Interactive Checkout & Sandbox Drawer (Fully Responsive Bottom-sheet on mobile, Slide-out on desktop) */}
      {activePreviewTool && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 flex justify-end items-end md:items-stretch transition-opacity duration-300">
          {/* Dismiss Back-backdrop trigger */}
          <div 
            className="absolute inset-0 cursor-pointer" 
            onClick={() => setActivePreviewTool(null)}
          />

          {/* Drawer container */}
          <div className="relative bg-white w-full md:w-[480px] h-[85vh] md:h-screen rounded-t-[32px] md:rounded-t-none md:rounded-l-[32px] shadow-2xl border-t md:border-t-0 md:border-l border-slate-100 flex flex-col overflow-hidden animate-slideUp md:animate-slideLeft z-10 font-sans text-slate-800">
            
            {/* Drawer Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{activePreviewTool.icon}</span>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                    {activePreviewTool.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                    <span className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-wider">
                      LIVE INTEGRATION SYNCED
                    </span>
                  </div>
                </div>
              </div>

              {/* Close Drawer */}
              <button 
                onClick={() => setActivePreviewTool(null)}
                className="p-2 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-full transition-colors cursor-pointer"
                aria-label="Close Checkout"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Action Checkout Controls */}
            <div className="px-5 sm:px-6 py-4 bg-indigo-50/50 border-b border-indigo-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3.5">
              <div>
                <span className="text-[10px] font-black uppercase text-indigo-500 tracking-wider block">Off-Platform Checkout</span>
                <p className="text-[11px] text-slate-600 font-bold mt-0.5">View and manage raw files or records directly on the official host.</p>
              </div>
              <a 
                href={getExternalUrl(activePreviewTool.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md hover:shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <ExternalLink className="w-4 h-4" />
                Launch Live Site
              </a>
            </div>

            {/* Scrollable Live Sandbox Content */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 scrollbar-thin">
              
              {/* Google Calendar Sandbox */}
              {activePreviewTool.id === 'g-calendar' && (
                <div className="space-y-5">
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-3">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      Add Mock Calendar Event (Real-Time Sync)
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] uppercase font-extrabold text-slate-400 block mb-1">Event Title</label>
                        <input 
                          type="text"
                          value={newEventTitle}
                          onChange={(e) => setNewEventTitle(e.target.value)}
                          placeholder="e.g. Critical Board Overcommit Mitigation"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-[10px] uppercase font-extrabold text-slate-400 block mb-1">Time Slot</label>
                          <input 
                            type="text"
                            value={newEventTime}
                            onChange={(e) => setNewEventTime(e.target.value)}
                            placeholder="e.g. 03:00 PM"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-extrabold text-slate-400 block mb-1">Priority</label>
                          <select 
                            value={newEventPriority}
                            onChange={(e) => setNewEventPriority(e.target.value as any)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-2 py-2 text-xs font-bold focus:outline-none focus:border-indigo-500"
                          >
                            <option value="High">🔴 High Priority</option>
                            <option value="Medium">🟡 Medium Priority</option>
                            <option value="Low">⚪ Low Priority</option>
                          </select>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          handleAddMockEvent(newEventTitle, newEventTime, newEventPriority);
                          setNewEventTitle("");
                        }}
                        className="w-full h-10 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm mt-1"
                      >
                        <Plus className="w-4 h-4" />
                        Sync Event Block
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Synced Calendar Slots</h4>
                    {mockEvents.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No calendar events synced. Use the form above to add some.</p>
                    ) : (
                      <div className="space-y-2">
                        {mockEvents.map(event => (
                          <div key={event.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center gap-2 hover:bg-slate-100/60 transition-colors">
                            <div className="flex items-start gap-2.5">
                              <Calendar className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                              <div>
                                <p className="text-xs font-black text-slate-800">{event.title}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[9px] text-slate-400 font-bold">{event.time} ({event.duration})</span>
                                  <span className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded-full border ${
                                    event.priority === 'High' ? 'bg-red-50 text-red-600 border-red-100' :
                                    event.priority === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                    'bg-slate-100 text-slate-500 border-slate-200'
                                  }`}>
                                    {event.priority}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <button 
                              onClick={() => handleDeleteMockEvent(event.id)}
                              className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Gmail Priorities Sandbox */}
              {activePreviewTool.id === 'g-gmail' && (
                <div className="space-y-4">
                  <div className="p-3 bg-amber-50 border border-amber-200 text-amber-950 rounded-2xl flex gap-2.5">
                    <AlertCircle className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-[10px] font-bold leading-relaxed">
                      Gmail metadata triggers automatic focus recommendations. Clicking action links can snooze notifications or request priority briefings.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Analyzed Priority Emails</h4>
                    <div className="space-y-2.5">
                      {mockEmails.map(mail => (
                        <div 
                          key={mail.id} 
                          className={`p-3.5 rounded-2xl border transition-all ${
                            mail.actioned 
                              ? 'bg-slate-50 border-slate-100 opacity-60' 
                              : 'bg-indigo-50/10 border-indigo-100/50 hover:bg-indigo-50/20'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex items-center gap-2.5">
                              <Mail className={`w-4 h-4 shrink-0 ${mail.actioned ? 'text-slate-400' : 'text-indigo-500 animate-pulse'}`} />
                              <span className="text-xs font-black text-slate-800">{mail.from}</span>
                            </div>
                            <span className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded-full ${
                              mail.priority === 'High' ? 'bg-red-100 text-red-700' :
                              mail.priority === 'Normal' ? 'bg-slate-100 text-slate-700' :
                              'bg-indigo-100 text-indigo-700'
                            }`}>
                              {mail.priority}
                            </span>
                          </div>
                          
                          <p className="text-xs font-bold text-slate-800 mt-1.5">{mail.subject}</p>
                          <p className="text-[10px] text-slate-400 font-medium leading-relaxed mt-0.5">{mail.snippet}</p>

                          <div className="mt-3 pt-2.5 border-t border-slate-100/80 flex justify-between items-center">
                            <span className="text-[9px] text-slate-400 font-semibold uppercase">
                              Status: {mail.actioned ? '✓ Actioned / Synced' : '⚠️ Pending AI Action'}
                            </span>
                            <button 
                              onClick={() => handleActionMockEmail(mail.id, mail.subject)}
                              className={`px-2 py-1 text-[9px] font-black rounded-lg transition-colors cursor-pointer ${
                                mail.actioned 
                                  ? 'bg-slate-200 text-slate-600 hover:bg-slate-300' 
                                  : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm'
                              }`}
                            >
                              {mail.actioned ? 'Re-open' : 'Mark Actioned'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Google Drive Sandbox */}
              {activePreviewTool.id === 'g-drive' && (
                <div className="space-y-5">
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-3">
                      <Folder className="w-3.5 h-3.5 text-indigo-500" />
                      Sync Document Metadata
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] uppercase font-extrabold text-slate-400 block mb-1">Document Name</label>
                        <input 
                          type="text"
                          value={newFileName}
                          onChange={(e) => setNewFileName(e.target.value)}
                          placeholder="e.g. Q4_Board_Pitch_Fatigue_V3.pdf"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-extrabold text-slate-400 block mb-1">File Size</label>
                        <input 
                          type="text"
                          value={newFileSize}
                          onChange={(e) => setNewFileSize(e.target.value)}
                          placeholder="e.g. 1.5 MB"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <button 
                        onClick={() => {
                          handleAddMockFile(newFileName, newFileSize);
                          setNewFileName("");
                        }}
                        className="w-full h-10 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm mt-1"
                      >
                        <Plus className="w-4 h-4" />
                        Sync New File
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Synced Documents</h4>
                    {mockFiles.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No files synchronized. Use the form above to add some.</p>
                    ) : (
                      <div className="space-y-2">
                        {mockFiles.map(file => (
                          <div key={file.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center gap-2 hover:bg-slate-100/60 transition-colors">
                            <div className="flex items-center gap-3">
                              <span className="text-xl shrink-0">
                                {file.type === 'spreadsheet' ? '📊' : file.type === 'pdf' ? '📕' : '📄'}
                              </span>
                              <div>
                                <p className="text-xs font-black text-slate-800">{file.name}</p>
                                <p className="text-[9px] text-slate-400 font-bold">Size: {file.size} • Synced {file.lastModified}</p>
                              </div>
                            </div>
                            <button 
                              onClick={() => handleDeleteMockFile(file.id)}
                              className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Google Sheets Sandbox */}
              {(activePreviewTool.id === 'g-sheets' || activePreviewTool.id === 'g-docs') && (
                <div className="space-y-5">
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-3">
                      <FileText className="w-3.5 h-3.5 text-indigo-500" />
                      Append Row to Workspace Spreadsheet
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] uppercase font-extrabold text-slate-400 block mb-1">Task / Goal Name</label>
                        <input 
                          type="text"
                          value={newSheetTask}
                          onChange={(e) => setNewSheetTask(e.target.value)}
                          placeholder="e.g. Implement checkout external links"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-[10px] uppercase font-extrabold text-slate-400 block mb-1">Effort Estimate</label>
                          <input 
                            type="text"
                            value={newSheetEffort}
                            onChange={(e) => setNewSheetEffort(e.target.value)}
                            placeholder="e.g. 2h"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-extrabold text-slate-400 block mb-1">Status</label>
                          <select 
                            value={newSheetStatus}
                            onChange={(e) => setNewSheetStatus(e.target.value as any)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-2 py-2 text-xs font-bold focus:outline-none focus:border-indigo-500"
                          >
                            <option value="Done">🟢 Done</option>
                            <option value="In Progress">🟡 In Progress</option>
                            <option value="Pending">⚪ Pending</option>
                          </select>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          handleAddMockRow(newSheetTask, newSheetEffort, newSheetStatus);
                          setNewSheetTask("");
                        }}
                        className="w-full h-10 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm mt-1"
                      >
                        <Plus className="w-4 h-4" />
                        Append Sheet Row
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Synced Spreadsheet Rows</h4>
                    {mockSheetRows.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No spreadsheet rows synced. Use the form above to add some.</p>
                    ) : (
                      <div className="border border-slate-100 rounded-xl overflow-x-auto shadow-xs">
                        <table className="w-full text-left text-xs text-slate-600">
                          <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 border-b border-slate-100">
                            <tr>
                              <th className="p-3">Task Goal</th>
                              <th className="p-3">Effort</th>
                              <th className="p-3">Status</th>
                              <th className="p-3 text-center">Delete</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {mockSheetRows.map(row => (
                              <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-3 font-bold text-slate-800">{row.task}</td>
                                <td className="p-3 font-medium text-slate-400">{row.effort}</td>
                                <td className="p-3">
                                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                    row.status === 'Done' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                    row.status === 'In Progress' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                    'bg-slate-100 text-slate-600 border border-slate-200'
                                  }`}>
                                    {row.status}
                                  </span>
                                </td>
                                <td className="p-3 text-center">
                                  <button 
                                    onClick={() => handleDeleteMockRow(row.id)}
                                    className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 mx-auto" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Default Fallback Custom Sandbox */}
              {activePreviewTool.id !== 'g-calendar' && 
               activePreviewTool.id !== 'g-gmail' && 
               activePreviewTool.id !== 'g-drive' && 
               activePreviewTool.id !== 'g-sheets' && 
               activePreviewTool.id !== 'g-docs' && (
                <div className="space-y-5 text-center py-6">
                  <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto border border-slate-100">
                    <Globe className="w-8 h-8 text-indigo-500 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-wide">Sync State Active</h4>
                    <p className="text-xs text-slate-400 font-bold mt-1 max-w-sm mx-auto leading-relaxed">
                      Handshake secure protocol validated. Automatic data packet optimization will capture alerts and buffer events live.
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left font-mono text-[9px] text-slate-400 space-y-1">
                    <p className="text-indigo-600 font-bold">// SECURE CONNECTION LOGS</p>
                    <p>SSL_Handshake: Completed successfully</p>
                    <p>OAuth2_BearerToken: Set in secure cookie</p>
                    <p>Endpoint_Ping: 42ms (Highly optimized)</p>
                    <p>Continuous_Sync: Listening on WebSocket</p>
                  </div>
                </div>
              )}

            </div>

            {/* Footer lock indicator */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 text-center flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5 text-indigo-500" />
              Secure Least-Privilege Sandbox Channel
            </div>

          </div>
        </div>
      )}

    </div>
  );
}


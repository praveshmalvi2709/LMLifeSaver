import React, { useState, useEffect, useMemo } from "react";
import { AlertTriangle, CheckSquare, Clock, ShieldCheck, TrendingUp, Play, Zap, Coffee, ArrowRight, CheckCircle2, ChevronRight, RefreshCw, Plus, Lightbulb, Mail, Calendar, Cloud } from "lucide-react";
import { Task, Milestone, ActivityLog } from "../types";

interface CommandCenterProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onToggleMilestone: (taskId: string, milestoneId: string) => void;
  onAddTaskMilestones: (taskId: string, milestones: Milestone[]) => void;
  onResolveTask: (taskId: string) => void;
}

export default function CommandCenter({
  tasks,
  onToggleTask,
  onToggleMilestone,
  onAddTaskMilestones,
  onResolveTask
}: CommandCenterProps) {
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("02:15:00");
  const [isFocusActive, setIsFocusActive] = useState<boolean>(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(8100); // 2h 15m
  const [isBreakingDown, setIsBreakingDown] = useState<boolean>(false);
  const [selectedRiskTask, setSelectedRiskTask] = useState<Task | null>(null);
  const [breathingStep, setBreathingStep] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [breathingCycle, setBreathingCycle] = useState<number>(4);

  // Derive activeTask reactively from tasks prop and activeTaskId
  const activeTask = tasks.find(t => t.id === activeTaskId) || null;

  // Set initial active task ID
  useEffect(() => {
    const taskExists = tasks.some(t => t.id === activeTaskId);
    if (tasks.length > 0 && (!activeTaskId || !taskExists)) {
      const urgentOrInProgress = tasks.find(t => t.priority === 'URGENT' && t.status !== 'COMPLETED') || 
                                tasks.find(t => t.status === 'IN_PROGRESS') ||
                                tasks.find(t => t.status !== 'COMPLETED');
      if (urgentOrInProgress) {
        setActiveTaskId(urgentOrInProgress.id);
      } else {
        setActiveTaskId(tasks[0].id);
      }
    }
  }, [tasks, activeTaskId]);

  // Auto-switch to another incomplete task when the current active task is completed
  useEffect(() => {
    if (activeTask && activeTask.status === "COMPLETED") {
      const nextIncomplete = tasks.find(t => t.id !== activeTaskId && t.status !== 'COMPLETED' && t.priority === 'URGENT') ||
                             tasks.find(t => t.id !== activeTaskId && t.status !== 'COMPLETED' && t.status === 'IN_PROGRESS') ||
                             tasks.find(t => t.id !== activeTaskId && t.status !== 'COMPLETED');
      if (nextIncomplete) {
        // Automatically switch focus and reset the timer to the new task's estimated time
        setActiveTaskId(nextIncomplete.id);
        setSecondsLeft(nextIncomplete.estimatedHours * 3600);
      }
    }
  }, [tasks, activeTaskId, activeTask]);

  // Focus Session Countdown Timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isFocusActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            setIsFocusActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isFocusActive, secondsLeft]);

  // Convert seconds to HH:MM:SS
  useEffect(() => {
    const hours = Math.floor(secondsLeft / 3600);
    const minutes = Math.floor((secondsLeft % 3600) / 60);
    const seconds = secondsLeft % 60;
    
    const formatted = [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');
    
    setTimeRemaining(formatted);
  }, [secondsLeft]);

  // Guided breathing loops for cognitive fatigue break
  useEffect(() => {
    const timer = setInterval(() => {
      setBreathingStep(prev => {
        if (prev === 'Inhale') return 'Hold';
        if (prev === 'Hold') return 'Exhale';
        return 'Inhale';
      });
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleStartFocus = () => {
    setIsFocusActive(!isFocusActive);
  };

  const handleSnooze = () => {
    setSecondsLeft(prev => prev + 300); // Add 5 minutes
  };

  // Trigger server-side AI Breakdown for the currently selected task
  const handleAiBreakdownSelectedTask = async () => {
    if (!activeTask) return;
    setIsBreakingDown(true);
    try {
      const response = await fetch("/api/breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: activeTask.title,
          description: activeTask.description
        })
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      
      onAddTaskMilestones(activeTask.id, data.milestones);
    } catch (err) {
      console.error("AI breakdown failed, rendering custom items");
    } finally {
      setIsBreakingDown(false);
    }
  };

  // High risk deadlines
  const riskTasks = tasks.filter(t => t.status !== 'COMPLETED' && t.riskLevel !== 'LOW');

  const totalCount = tasks.length;
  const completedCount = tasks.filter(t => t.status === 'COMPLETED').length;
  const completedMilestones = tasks.reduce((sum, t) => sum + (t.milestones?.filter(m => m.completed).length || 0), 0);
  const totalMilestones = tasks.reduce((sum, t) => sum + (t.milestones?.length || 0), 0);
  
  // Calculate dynamic Focus Score based on real tasks/milestones
  const focusScore = useMemo(() => {
    if (totalCount === 0) return 75; // Baseline default if empty
    const taskWeight = completedCount / totalCount;
    const milestoneWeight = totalMilestones > 0 ? completedMilestones / totalMilestones : 0.5;
    const calculated = Math.round(50 + (taskWeight * 30) + (milestoneWeight * 20));
    return Math.min(100, Math.max(10, calculated));
  }, [tasks, completedCount, totalCount, completedMilestones, totalMilestones]);

  const focusTrend = useMemo(() => {
    const activeTasksCount = tasks.filter(t => t.status !== 'COMPLETED').length;
    if (activeTasksCount === 0) {
      return { pct: 15, msg: "All tasks completed! Your focus efficiency is at its peak. Keep resting and recharge." };
    }
    const ratio = completedCount / totalCount;
    if (ratio > 0.7) {
      return { pct: 18, msg: "Excellent momentum. AI suggests a 5-min micro-break to maintain high visual focus." };
    } else if (ratio > 0.3) {
      return { pct: 8, msg: "Steady progress. Pacing is key to preventing late afternoon fatigue peaks." };
    } else {
      return { pct: -5, msg: "Low task progression. Switch to lightweight tasks or activate Focus Resonance." };
    }
  }, [tasks, completedCount, totalCount]);

  const dailyInsight = useMemo(() => {
    const highRisk = tasks.find(t => t.status !== 'COMPLETED' && t.riskLevel === 'HIGH');
    const mediumRisk = tasks.find(t => t.status !== 'COMPLETED' && t.riskLevel === 'MONITORING');
    const completedRatio = tasks.length > 0 ? completedCount / totalCount : 1;

    if (tasks.length === 0) {
      return {
        title: "Co-Pilot Baseline",
        sub: "Cognitive peak tracking",
        text: "Daily queue is currently empty. Define goals or tasks in the planner to allow AI co-pilot workload tuning."
      };
    }
    if (completedRatio === 1) {
      return {
        title: "Peak Optimization",
        sub: "Rest & recovery active",
        text: "All active tasks are cleared! Your cognitive fatigue index has dropped by 45%. Take this time to recharge your mental bandwidth."
      };
    }
    if (highRisk) {
      return {
        title: "Dynamic Priority Alert",
        sub: "Immediate Focus Directed",
        text: `Urgent task "${highRisk.title}" has elevated conflict risk. Concentrating on its milestones now prevents late day pacing collapse.`
      };
    }
    if (mediumRisk) {
      return {
        title: "Workload Calibration",
        sub: "Mid-day balance adjusted",
        text: `Progressing "${mediumRisk.title}" will balance your cognitive fatigue. It's safe to tackle before the afternoon session.`
      };
    }
    return {
      title: "Optimal Routine",
      sub: "Pacing active",
      text: "Your work cycles show high compliance. Take a 5-minute deep focus breathing session after completing your next milestone."
    };
  }, [tasks, completedCount, totalCount]);

  const rescueStats = useMemo(() => {
    const atRiskTotal = tasks.filter(t => t.riskLevel !== 'LOW').length;
    const atRiskCompleted = tasks.filter(t => t.riskLevel !== 'LOW' && t.status === 'COMPLETED').length;
    
    // Calculate dynamic success rate
    let successRate = 90; // default baseline if no historical risks
    if (atRiskTotal > 0) {
      const ratio = atRiskCompleted / atRiskTotal;
      successRate = Math.round(70 + (ratio * 30));
    } else {
      if (totalCount > 0) {
        successRate = Math.round(80 + ((completedCount / totalCount) * 20));
      }
    }
    
    successRate = Math.min(100, Math.max(40, successRate));
    
    let text = `AI rescued ${atRiskCompleted} crucial deadline${atRiskCompleted !== 1 ? 's' : ''} this week by anticipating resource overlaps.`;
    if (atRiskTotal === 0) {
      text = `Currently 0 high-friction deadlines detected. AI routine pacing is actively running.`;
    } else if (atRiskCompleted === 0) {
      text = `Pacing calibration required. Solve pending ${atRiskTotal} high-friction deadlines to elevate rescue index.`;
    }

    return {
      rate: successRate,
      text
    };
  }, [tasks, completedCount, totalCount]);

  return (
    <div id="command-center-root" className="grid grid-cols-12 gap-5 flex-grow w-full max-w-7xl mx-auto font-sans text-slate-800">
      
      {/* 1. Critical Rescue Card (The Hero Focus Card) - Span 7 Columns, Span 4 Rows */}
      <section id="hero-rescue-card" className="col-span-12 lg:col-span-7 bg-white rounded-[32px] border border-orange-100 shadow-xl shadow-orange-50/50 p-6 sm:p-8 flex flex-col relative overflow-hidden min-h-[420px]">
        {/* Priority Badge */}
        <div className="absolute top-6 right-6 hidden sm:block">
          <span className="bg-orange-100 text-orange-700 text-xs font-extrabold px-3.5 py-1.5 rounded-full uppercase tracking-wider">
            Crisis Rescue Priority
          </span>
        </div>

        {/* Focus Header */}
        <div className="mt-4">
          <div className="sm:hidden mb-3">
            <span className="inline-block bg-orange-100 text-orange-700 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
              Crisis Rescue Priority
            </span>
          </div>
          <h2 className="text-slate-400 font-extrabold uppercase text-xs tracking-widest mb-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
            Current Focus Session
          </h2>
          {activeTask ? (
            <>
              <h3 className="text-3xl sm:text-4xl font-black leading-tight text-slate-900 mb-4">
                {activeTask.title}
                {activeTask.project && (
                  <span className="block text-sm font-bold text-slate-500 mt-1 uppercase tracking-wider">
                    Project: {activeTask.project}
                  </span>
                )}
              </h3>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-md">
                {activeTask.description || "No description provided."} 
                <span className="block mt-2 text-slate-500 text-sm font-medium border-l-2 border-orange-500 pl-3">
                  AI estimation: You require <span className="text-orange-600 font-bold">{activeTask.estimatedHours} hours buffer</span> to finish with high reliability.
                </span>
              </p>
            </>
          ) : (
            <div className="py-8 text-center text-slate-400">
              <p className="font-bold">No active rescue focus sessions today.</p>
              <p className="text-sm mt-1">Excellent job! All deadlines have safe buffers.</p>
            </div>
          )}
        </div>
        
        {/* Active Timer and Rescue Action Controls */}
        {activeTask && (
          <div className="mt-auto pt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 z-10">
            <div className="flex gap-2.5">
              <button 
                onClick={handleStartFocus}
                className={`flex-grow sm:flex-grow-0 px-4 py-3 sm:px-8 sm:py-4.5 rounded-2xl font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2.5 shadow-lg ${
                  isFocusActive 
                    ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200' 
                    : 'bg-orange-600 text-white hover:bg-orange-500 shadow-orange-100'
                }`}
              >
                {isFocusActive ? (
                  <>
                    <Clock className="w-4.5 h-4.5 animate-spin" />
                    Focus ({timeRemaining})
                  </>
                ) : (
                  <>
                    <Play className="w-4.5 h-4.5 fill-current" />
                    Start Action
                  </>
                )}
              </button>
              <button 
                onClick={handleSnooze}
                className="px-3.5 py-3 sm:px-5 sm:py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-xs sm:text-sm transition-colors"
                title="Snooze warning notifications by 5 minutes"
              >
                Snooze 5m
              </button>
            </div>

            <div className="flex flex-col">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Estimated Completion</span>
              <span className="text-xl font-bold text-green-500 flex items-center gap-1.5">
                98% Probability
                <span className="text-xs font-medium text-slate-400">if started now</span>
              </span>
            </div>
          </div>
        )}
        
        {/* Background decorative styling */}
        <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-orange-100/50 rounded-full blur-3xl pointer-events-none"></div>
      </section>

      {/* 2. Early Warning System (Risk Analysis) - Span 5 Columns */}
      <section id="warning-system-card" className="col-span-12 lg:col-span-5 bg-slate-900 rounded-[32px] p-6 text-white flex flex-col min-h-[420px]">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Early Warning System</h3>
            <p className="text-xs text-slate-500 mt-1">Autonomous threat analysis</p>
          </div>
          <span className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700 shadow-inner">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
          </span>
        </div>
        
        <div className="space-y-3.5 flex-grow overflow-y-auto max-h-[250px] pr-1 scrollbar-thin">
          {riskTasks.length > 0 ? (
            riskTasks.map((task) => (
              <div 
                key={task.id}
                onClick={() => setSelectedRiskTask(selectedRiskTask?.id === task.id ? null : task)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedRiskTask?.id === task.id 
                    ? 'bg-slate-800 border-orange-500/50' 
                    : 'bg-white/5 hover:bg-white/10 border-white/5'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <p className="font-bold text-slate-100">{task.title}</p>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    task.riskLevel === 'HIGH' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'
                  }`}>
                    {task.riskLevel} RISK
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-normal line-clamp-2">
                  {task.riskReason || "Underestimated hours or upcoming overlapping meetings detected."}
                </p>
                {selectedRiskTask?.id === task.id && (
                  <div className="mt-3 pt-3 border-t border-slate-800 flex flex-col gap-2">
                    <p className="text-xs text-orange-300 font-semibold bg-orange-950/20 p-2 rounded-xl border border-orange-900/30">
                      Rescue Action Suggested: Spend 15-20 minutes tackling immediate milestones to lower crisis status.
                    </p>
                    <div className="flex gap-2 self-end">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onResolveTask(task.id);
                          setSelectedRiskTask(null);
                        }}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-[11px] font-bold transition-colors"
                      >
                        Mark Completed
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTaskId(task.id);
                          setSecondsLeft(task.estimatedHours * 3600);
                          setSelectedRiskTask(null);
                        }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-lg text-[11px] font-bold transition-colors border border-slate-700"
                      >
                        Set as Active
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-slate-500">
              <p className="text-sm font-bold">No tasks at risk</p>
              <p className="text-[11px] mt-1">Excellent pacing. Safe deadlines buffers.</p>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col sm:flex-row gap-2 justify-between sm:items-center text-xs">
          <span className="text-slate-500">AI Risk Tracker: {riskTasks.length} active risks</span>
          <span className="text-orange-400 font-bold self-start sm:self-auto">Secure Protocol Encrypted</span>
        </div>
      </section>

      {/* 3. Smart Breakdown Card - Span 5 Columns */}
      <section id="smart-breakdown-card" className="col-span-12 lg:col-span-5 bg-[#E9ECEF] rounded-[32px] p-6 flex flex-col min-h-[350px]">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">AI Task Breakdown</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Focus sequence planning</p>
          </div>
          {activeTask && activeTask.milestones && activeTask.milestones.length > 0 && (
            <span className="text-xs bg-slate-200 text-slate-600 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              {activeTask.milestones.length} Milestones
            </span>
          )}
        </div>

        {/* Task Selector with overall completion status */}
        <div className="mb-4 bg-white p-3.5 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-2.5">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              Selected Target Task
            </label>
            <select
              value={activeTaskId || ""}
              onChange={(e) => {
                const selectedId = e.target.value;
                setActiveTaskId(selectedId);
                const task = tasks.find((t) => t.id === selectedId);
                if (task) {
                  setSecondsLeft(task.estimatedHours * 3600);
                }
              }}
              className="w-full bg-[#F8F9FA] border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-800 font-bold shadow-sm"
            >
              <option value="" disabled>-- Select a task to break down --</option>
              {tasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.title} {task.status === "COMPLETED" ? "✓" : ""}
                </option>
              ))}
            </select>
          </div>

          {activeTask && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  activeTask.status === 'COMPLETED' ? 'bg-green-500' : 'bg-orange-400 animate-pulse'
                }`}></span>
                <span className="text-[11px] font-bold text-slate-600">
                  Status: <span className="uppercase text-slate-800">{activeTask.status}</span>
                </span>
              </div>
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={activeTask.status === "COMPLETED"}
                  onChange={() => {
                    onToggleTask(activeTask.id);
                  }}
                  className="w-4 h-4 rounded border-slate-300 text-green-600 focus:ring-green-500 cursor-pointer"
                />
                <span className="text-[11px] font-bold text-slate-700">Completed</span>
              </label>
            </div>
          )}
        </div>
        
        {/* Milestones Checklist */}
        <div className="space-y-2.5 flex-grow overflow-y-auto max-h-[180px] pr-1">
          {activeTask && activeTask.milestones && activeTask.milestones.length > 0 ? (
            activeTask.milestones.map((milestone, idx) => (
              <div 
                key={milestone.id}
                onClick={() => onToggleMilestone(activeTask.id, milestone.id)}
                className="flex items-center gap-3 bg-white p-3.5 rounded-2xl shadow-sm border border-slate-100 hover:border-slate-300 cursor-pointer transition-all"
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 ${
                  milestone.completed 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {milestone.completed ? '✓' : `0${idx + 1}`}
                </div>
                <div className="flex-grow min-w-0">
                  <p className={`text-sm font-bold truncate ${milestone.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                    {milestone.text}
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-0.5">
                    {milestone.durationMin} mins • {milestone.focusType}
                  </p>
                </div>
                <input 
                  type="checkbox" 
                  checked={milestone.completed}
                  onChange={() => onToggleMilestone(activeTask.id, milestone.id)}
                  className="w-5 h-5 rounded-full border-slate-300 text-orange-600 focus:ring-orange-500 shrink-0 cursor-pointer"
                />
              </div>
            ))
          ) : activeTask ? (
            <div className="py-8 text-center text-slate-400 flex flex-col justify-center items-center">
              <p className="text-xs font-semibold">No milestones generated yet.</p>
              <button
                onClick={handleAiBreakdownSelectedTask}
                disabled={isBreakingDown}
                className="mt-3 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-colors mx-auto shadow-sm"
              >
                {isBreakingDown ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Generating AI Breakdowns...
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 fill-current text-amber-400" />
                    Break Down with AI
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400">
              <p className="text-xs font-semibold">No task selected.</p>
              <p className="text-[10px] mt-1">Select an existing task above to view or break down.</p>
            </div>
          )}
        </div>
      </section>

      {/* FOCUS SCORE Card - Span 3 Columns */}
      <section id="focus-score-card" className="col-span-12 md:col-span-6 lg:col-span-3 bg-slate-950 text-white rounded-[32px] border border-slate-900 p-6 flex flex-col justify-between h-auto">
        <div>
          <h3 className="text-center text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-6">Focus Score</h3>
          <div className="relative flex items-center justify-center">
            {/* Circular Gauge */}
            <svg className="w-40 h-40 transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="54"
                className="stroke-slate-800"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="80"
                cy="80"
                r="54"
                className="stroke-cyan-400 transition-all duration-1000 ease-out"
                strokeWidth="8"
                strokeDasharray="339.3"
                strokeDashoffset={(339.3 * (1 - focusScore / 100)).toFixed(1)}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-white tracking-tight">{focusScore}</span>
              <span className={`text-[10px] font-extrabold tracking-widest uppercase mt-0.5 ${
                focusScore >= 85 ? "text-cyan-400" : focusScore >= 70 ? "text-emerald-400" : focusScore >= 50 ? "text-amber-400" : "text-rose-500"
              }`}>
                {focusScore >= 85 ? "Excellent" : focusScore >= 70 ? "Good" : focusScore >= 50 ? "Average" : "Critical"}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-300 leading-relaxed max-w-[200px] mx-auto">
            You are <span className={`${focusTrend.pct >= 0 ? "text-green-400" : "text-rose-400"} font-bold`}>{Math.abs(focusTrend.pct)}% {focusTrend.pct >= 0 ? "more focused" : "less active"}</span> than yesterday. {focusTrend.msg}
          </p>
        </div>
      </section>

      {/* DAILY INSIGHT Card - Span 3 Columns */}
      <section id="daily-insight-card" className="col-span-12 md:col-span-6 lg:col-span-3 bg-slate-900 text-white rounded-[32px] border border-slate-850 p-6 flex flex-col justify-between h-auto">
        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-700/50 shadow-inner">
              <Lightbulb className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-300">{dailyInsight.title}</h3>
              <p className="text-[10px] text-slate-500 font-medium">{dailyInsight.sub}</p>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-950/40 p-4 rounded-2xl border border-slate-800/60 font-medium">
            "{dailyInsight.text}"
          </p>
        </div>
      </section>

      {/* 4. Rescue Rate Stats Card - Span 3 Columns */}
      <section id="stats-card" className="col-span-12 md:col-span-6 lg:col-span-3 bg-indigo-600 rounded-[32px] p-6 text-white flex flex-col justify-between shadow-xl shadow-indigo-100 h-auto">
        <div>
          <p className="text-xs font-bold uppercase opacity-65 tracking-widest mb-1">Rescue Success Rate</p>
          <p className="text-5xl font-black mb-3">{rescueStats.rate}%</p>
          <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
            <div className="bg-white h-full rounded-full transition-all" style={{ width: `${rescueStats.rate}%` }}></div>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-[10px] opacity-75 leading-relaxed italic flex items-center gap-1.5 font-medium">
            <TrendingUp className="w-3.5 h-3.5 shrink-0" />
            {rescueStats.text}
          </p>
        </div>
      </section>

      {/* 5. Contextual Fatigue / Suggestion Card - Span 3 Columns */}
      <section id="fatigue-break-card" className="col-span-12 md:col-span-6 lg:col-span-3 bg-emerald-50 rounded-[32px] border border-emerald-100 p-6 flex flex-col justify-center items-center text-center h-auto">
        <div className="relative mb-3 flex items-center justify-center">
          {/* Animated pulsing circle */}
          <div className="absolute w-14 h-14 bg-emerald-100 rounded-full animate-ping opacity-30"></div>
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 relative">
            <Coffee className="w-6 h-6 animate-pulse" />
          </div>
        </div>
        <p className="text-sm font-bold text-emerald-950 mb-1">Paced Breathing Cycle</p>
        <p className="text-xs text-emerald-700 leading-normal max-w-xs mb-2">
          High focus pacing detected. Take a 4-second breather to restore optimal cognitive response:
        </p>
        {/* Animated breathing feedback */}
        <div className="bg-white px-4 py-1.5 rounded-full border border-emerald-100 text-xs font-bold text-emerald-800 tracking-wider flex items-center gap-1.5 shadow-sm uppercase animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          {breathingStep}...
        </div>
      </section>

    </div>
  );
}

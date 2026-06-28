import React, { useState } from "react";
import { 
  ShieldCheck, 
  Heart, 
  Target, 
  ChevronLeft, 
  ChevronRight, 
  Activity, 
  Smile, 
  Dumbbell, 
  BookOpen, 
  AlertCircle, 
  X, 
  Plus, 
  SlidersHorizontal, 
  Zap, 
  Sparkles,
  CheckCircle2
} from "lucide-react";
import { Goal, Habit } from "../types";

interface GoalsHabitsProps {
  goals: Goal[];
  habits: Habit[];
  onToggleHabit: (habitId: string, dateStr: string) => void;
  onAddGoal?: (title: string, category: string, target: string, progress: number) => void;
  onUpdateGoalProgress?: (id: string, progress: number) => void;
}

export default function GoalsHabits({
  goals,
  habits,
  onToggleHabit,
  onAddGoal,
  onUpdateGoalProgress
}: GoalsHabitsProps) {
  const [currentMonth, setCurrentMonth] = useState("June");
  const [currentYear, setCurrentYear] = useState("2026");
  const [isAllGoalsOpen, setIsAllGoalsOpen] = useState(false);
  
  // Create New Goal form states
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalCategory, setNewGoalCategory] = useState("MENTAL");
  const [newGoalTarget, setNewGoalTarget] = useState("");
  const [newGoalProgress, setNewGoalProgress] = useState(50);

  // AI Recommended Milestones state
  const [recommendedMilestones, setRecommendedMilestones] = useState<{[goalId: string]: string[]}>({});
  const [completedMilestones, setCompletedMilestones] = useState<{[key: string]: boolean}>({});

  // Heatmap helpers
  const totalDays = 30;
  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);

  const handleDayClick = (habitId: string, dayNum: number) => {
    const dateStr = `2026-06-${dayNum.toString().padStart(2, '0')}`;
    onToggleHabit(habitId, dateStr);
  };

  const getHabitIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("hydrate") || lower.includes("water")) return <Activity className="w-5 h-5 text-sky-500" />;
    if (lower.includes("read") || lower.includes("book")) return <BookOpen className="w-5 h-5 text-amber-500" />;
    if (lower.includes("workout") || lower.includes("gym") || lower.includes("stretch")) return <Dumbbell className="w-5 h-5 text-emerald-500" />;
    return <Smile className="w-5 h-5 text-indigo-500" />;
  };

  const getCategoryStyles = (category: string) => {
    const cat = category.toLowerCase();
    if (cat === "physical") return { stroke: "#0ea5e9", text: "text-sky-600 bg-sky-50 border-sky-100", bg: "bg-sky-500", raw: "sky" };
    if (cat === "finance") return { stroke: "#10b981", text: "text-emerald-600 bg-emerald-50 border-emerald-100", bg: "bg-emerald-500", raw: "emerald" };
    if (cat === "mental") return { stroke: "#d946ef", text: "text-fuchsia-600 bg-fuchsia-50 border-fuchsia-100", bg: "bg-fuchsia-500", raw: "fuchsia" };
    return { stroke: "#6366f1", text: "text-indigo-600 bg-indigo-50 border-indigo-100", bg: "bg-indigo-500", raw: "indigo" }; // work / default
  };

  const handleCreateGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim() || !newGoalTarget.trim()) return;
    if (onAddGoal) {
      onAddGoal(newGoalTitle, newGoalCategory, newGoalTarget, newGoalProgress);
      // Reset form fields
      setNewGoalTitle("");
      setNewGoalTarget("");
      setNewGoalProgress(50);
    }
  };

  const triggerAiMilestones = (goalId: string, goalTitle: string) => {
    const lower = goalTitle.toLowerCase();
    let steps = [
      "Set daily micro-commitment thresholds (10m slot)",
      "Sync daily alert triggers with the AI co-pilot channel",
      "Evaluate progress friction points at weekend review"
    ];
    if (lower.includes("meditate") || lower.includes("mind") || lower.includes("mental") || lower.includes("calm")) {
      steps = [
        "Designate a quiet sanctuary corner with zero physical noise triggers",
        "Calibrate a consistent 10-minute morning breathing window at 7:30 AM",
        "Perform a subjective mental fatigue audit and log results weekly"
      ];
    } else if (lower.includes("marathon") || lower.includes("physical") || lower.includes("run") || lower.includes("cardio")) {
      steps = [
        "Establish baseline weekend distance run with comfortable pace targets",
        "Configure active hydration and electrolyte markers before focus sessions",
        "Integrate core stability stretching drills post daily task checklists"
      ];
    } else if (lower.includes("invest") || lower.includes("finance") || lower.includes("save") || lower.includes("money")) {
      steps = [
        "Automate fixed monthly direct deposit routing to investment accounts",
        "Audit credit accounts and isolate lifestyle creep triggers",
        "Recalibrate passive wealth portfolio assets during the end-of-month sprint"
      ];
    } else if (lower.includes("client") || lower.includes("work") || lower.includes("success") || lower.includes("sales")) {
      steps = [
        "Isolate top 5 high-impact team stakeholders for alignment checks",
        "Define strict objective-and-key-result (OKR) checkpoints for key milestones",
        "Publish progress briefs to executive channels for visibility"
      ];
    }
    
    setRecommendedMilestones(prev => ({
      ...prev,
      [goalId]: steps
    }));
  };

  const toggleMilestoneCheck = (goalId: string, idx: number) => {
    const key = `${goalId}-${idx}`;
    setCompletedMilestones(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div id="goals-habits-root" className="grid grid-cols-12 gap-5 w-full max-w-7xl mx-auto font-sans text-slate-800">
      
      {/* LEFT COLUMN - Primary Objectives list (6 columns) */}
      <div className="col-span-12 lg:col-span-6 flex flex-col gap-5">
        
        {/* Streak Protection Status */}
        <div className="bg-orange-50 border border-orange-100 rounded-[24px] p-5 flex gap-3.5 items-start">
          <span className="w-10 h-10 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-extrabold text-sm text-orange-950">Streak Protection Shield Active</p>
              <span className="text-[9px] bg-orange-600 text-white font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Automated
              </span>
            </div>
            <p className="text-xs text-orange-800 mt-1 leading-relaxed">
              AI suggestion: Rescheduled 'Evening Reading' to 7:00 AM because your calendar contains late evening project deployments.
            </p>
          </div>
        </div>

        {/* Primary Objectives Grid */}
        <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Primary Objectives</h3>
            <span 
              onClick={() => setIsAllGoalsOpen(true)}
              className="text-xs text-indigo-600 font-extrabold flex items-center gap-1 cursor-pointer hover:text-indigo-500 transition-colors group"
            >
              View All Goals
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {goals.map((goal) => {
              const styles = getCategoryStyles(goal.category);
              return (
                <div key={goal.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center gap-4 hover:shadow-sm transition-all group relative overflow-hidden">
                  <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none translate-x-1 translate-y-1">
                    <Target className="w-16 h-16 text-slate-900" />
                  </div>
                  
                  {/* Visual Circular percentage ring */}
                  <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      {/* Background circle */}
                      <circle cx="28" cy="28" r="24" stroke="#e2e8f0" strokeWidth="4" fill="transparent" />
                      {/* Foreground circle with dynamic color based on category */}
                      <circle 
                        cx="28" 
                        cy="28" 
                        r="24" 
                        stroke={styles.stroke} 
                        strokeWidth="4" 
                        fill="transparent" 
                        strokeDasharray="150"
                        strokeDashoffset={150 - (150 * goal.progress) / 100}
                        className="transition-all duration-500"
                      />
                    </svg>
                    <span className="absolute text-xs font-black text-slate-800">{goal.progress}%</span>
                  </div>
                  
                  <div className="z-10">
                    <span className={`text-[8px] font-extrabold px-2.5 py-0.5 rounded-full uppercase border ${styles.text}`}>
                      {goal.category}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 mt-1.5 leading-snug group-hover:text-indigo-600 transition-colors">{goal.title}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-semibold leading-tight">
                      Goal: {goal.target} • {goal.current}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN - Habit Heatmap Calendars (6 columns) */}
      <div className="col-span-12 lg:col-span-6 bg-slate-900 rounded-[32px] p-6 text-white flex flex-col justify-between min-h-[460px]">
        
        <div>
          {/* Calendar Header */}
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Habit Heatmap Grid</h3>
              <p className="text-[10px] text-slate-500 mt-1">Active monthly consistency logs</p>
            </div>
            
            <div className="flex items-center gap-2 border border-slate-800 rounded-xl px-2.5 py-1.5 bg-slate-950/60 text-xs">
              <button className="p-0.5 hover:text-orange-400 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-bold">{currentMonth} {currentYear}</span>
              <button className="p-0.5 hover:text-orange-400 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List of Habits with Grid map inside each card */}
          <div className="space-y-5">
            {habits.map((habit) => (
              <div key={habit.id} className="bg-white/5 border border-white/5 rounded-2xl p-4 hover:bg-white/10 transition-colors">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2.5">
                    {getHabitIcon(habit.name)}
                    <h4 className="font-bold text-sm text-slate-100">{habit.name}</h4>
                  </div>
                  <span className="text-[10px] font-extrabold text-orange-400 bg-orange-950/30 px-2.5 py-0.5 rounded-full border border-orange-900/30">
                    {habit.streak} Day Streak
                  </span>
                </div>

                {/* Heatmap Grid map (30 slots) */}
                <div className="grid grid-cols-10 gap-1.5">
                  {daysArray.map((dayNum) => {
                    const dateStr = `2026-06-${dayNum.toString().padStart(2, '0')}`;
                    const isCompleted = !!habit.history[dateStr];
                    
                    return (
                      <div 
                        key={dayNum}
                        onClick={() => handleDayClick(habit.id, dayNum)}
                        title={`Day ${dayNum}: ${isCompleted ? 'Completed' : 'Missed (click to toggle)'}`}
                        className={`aspect-square rounded-md cursor-pointer transition-all flex items-center justify-center text-[8px] font-bold shadow-inner ${
                          isCompleted 
                            ? 'bg-sky-500 text-white font-black scale-105' 
                            : 'bg-white/10 hover:bg-white/15 text-slate-500'
                        }`}
                      >
                        {dayNum}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Streak Protection overview */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-ping"></span>
            <span className="text-slate-400 font-bold">12 Days Consistency Target</span>
          </div>
          <span className="text-sky-400 font-extrabold italic uppercase tracking-wider">Top 5% Productive User</span>
        </div>

      </div>

      {/* FULL OBJECTIVES PORTFOLIO DIALOG / DRAWER - VIEW ALL GOALS FEATURE */}
      {isAllGoalsOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-[32px] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-100">
            
            {/* Modal Header */}
            <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <div className="flex items-center gap-3">
                <span className="p-2.5 bg-indigo-50 rounded-2xl text-indigo-600">
                  <Target className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-black text-lg text-slate-950 flex items-center gap-2">
                    Calibrated Objectives Portfolio
                    <span className="text-[10px] bg-indigo-600 text-white font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Live Sync
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 font-bold">Formulate, track, and optimize your high-level milestones</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAllGoalsOpen(false)}
                className="p-2 hover:bg-slate-200/60 rounded-xl transition-colors text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content Scroll Area */}
            <div className="p-8 overflow-y-auto flex-grow grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Form: Goal Formulation Engine */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <Plus className="w-4 h-4 text-emerald-500" />
                    Formulate Goal
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Set a fresh aspiration across different facets of your life to generate tracking indices.
                  </p>
                </div>

                <form onSubmit={handleCreateGoalSubmit} className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                      Objective Title
                    </label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Daily Zen Meditation"
                      value={newGoalTitle}
                      onChange={(e) => setNewGoalTitle(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                        Focus Domain
                      </label>
                      <select
                        value={newGoalCategory}
                        onChange={(e) => setNewGoalCategory(e.target.value)}
                        className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-2.5 py-2.5 text-xs text-slate-800 outline-none transition-all"
                      >
                        <option value="MENTAL">Mental</option>
                        <option value="PHYSICAL">Physical</option>
                        <option value="FINANCE">Finance</option>
                        <option value="WORK">Work</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                        Target Goal
                      </label>
                      <input 
                        type="text"
                        required
                        placeholder="e.g. 30 sessions"
                        value={newGoalTarget}
                        onChange={(e) => setNewGoalTarget(e.target.value)}
                        className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                        Initial Progress
                      </label>
                      <span className="text-xs font-bold text-slate-700">{newGoalProgress}%</span>
                    </div>
                    <input 
                      type="range"
                      min="0"
                      max="100"
                      value={newGoalProgress}
                      onChange={(e) => setNewGoalProgress(parseInt(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 mt-2 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Deploy Objective
                  </button>
                </form>
              </div>

              {/* Right List: Interactive Calibrator & Milestone Recommender */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <SlidersHorizontal className="w-4 h-4 text-indigo-500" />
                    Calibrate Active Targets
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Slide targets to update current outcomes. Click the auto-plan button to trigger the smart AI agent to prepare step checklists.
                  </p>
                </div>

                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                  {goals.map((goal) => {
                    const styles = getCategoryStyles(goal.category);
                    const milestones = recommendedMilestones[goal.id] || [];
                    
                    return (
                      <div 
                        key={goal.id} 
                        className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col gap-4 shadow-sm"
                      >
                        {/* Upper Header portion */}
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`text-[8px] font-black px-2.5 py-0.5 rounded-full uppercase border ${styles.text}`}>
                                {goal.category}
                              </span>
                              <span className="text-[10px] text-slate-400 font-extrabold tracking-tight">
                                Target: {goal.target}
                              </span>
                            </div>
                            <h5 className="font-black text-sm text-slate-900 mt-1 leading-snug">{goal.title}</h5>
                            <p className="text-[10px] text-indigo-600 font-bold mt-0.5">
                              Status: {goal.current} achieved
                            </p>
                          </div>

                          <button 
                            onClick={() => triggerAiMilestones(goal.id, goal.title)}
                            className="text-[10px] bg-white border border-slate-200 hover:border-orange-500 text-slate-700 hover:text-orange-600 font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
                            title="Generate recommended milestones"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                            Auto-Plan
                          </button>
                        </div>

                        {/* Slide Adjuster */}
                        <div className="bg-white p-3 rounded-xl border border-slate-200/60">
                          <div className="flex justify-between items-center mb-1 text-[10px] text-slate-400 font-bold">
                            <span>RECALIBRATE CURRENT VALUE</span>
                            <span className="font-black text-slate-800">{goal.progress}%</span>
                          </div>
                          <input 
                            type="range"
                            min="0"
                            max="100"
                            value={goal.progress}
                            onChange={(e) => onUpdateGoalProgress && onUpdateGoalProgress(goal.id, parseInt(e.target.value))}
                            className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg"
                          />
                        </div>

                        {/* Interactive Milestone Checkboxes (If Auto-Planned) */}
                        {milestones.length > 0 && (
                          <div className="bg-orange-50/50 p-3.5 rounded-xl border border-orange-100/50 flex flex-col gap-2">
                            <span className="text-[9px] font-extrabold text-orange-600 uppercase tracking-widest flex items-center gap-1">
                              <Zap className="w-3 h-3 fill-current" />
                              AI Actionable Roadmaps
                            </span>
                            <div className="space-y-1.5">
                              {milestones.map((step, idx) => {
                                const mKey = `${goal.id}-${idx}`;
                                const isChecked = !!completedMilestones[mKey];
                                return (
                                  <div 
                                    key={idx}
                                    onClick={() => toggleMilestoneCheck(goal.id, idx)}
                                    className="flex items-start gap-2 cursor-pointer group text-[11px]"
                                  >
                                    <span className="mt-0.5 shrink-0 transition-colors">
                                      {isChecked ? (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                      ) : (
                                        <div className="w-3.5 h-3.5 rounded border border-slate-300 group-hover:border-slate-400 bg-white" />
                                      )}
                                    </span>
                                    <span className={`text-slate-600 leading-snug transition-all ${isChecked ? 'line-through text-slate-400' : ''}`}>
                                      {step}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-slate-500 text-xs shrink-0 font-bold">
              <span className="flex items-center gap-1.5 text-slate-400">
                <ShieldCheck className="w-4 h-4 text-slate-300" />
                Durable Local Storage Sync Active
              </span>
              <button 
                onClick={() => setIsAllGoalsOpen(false)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all"
              >
                Done Calibrating
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

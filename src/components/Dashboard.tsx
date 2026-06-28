import React, { useMemo } from "react";
import { 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Sparkles, 
  Activity, 
  ArrowUpRight, 
  Zap, 
  HelpCircle,
  Award,
  Users,
  Flame,
  Shield,
  Target,
  Trophy
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import { Task, Goal, Habit, AIProposal, AutonomySettings } from "../types";

interface DashboardProps {
  tasks: Task[];
  goals: Goal[];
  habits: Habit[];
  proposals: AIProposal[];
  settings: AutonomySettings;
  onNavigate: (tab: "dashboard" | "command" | "tasks" | "goals" | "settings" | "profile" | "quick-assist" | "abstract" | "arena") => void;
}

export default function Dashboard({ 
  tasks, 
  goals, 
  habits, 
  proposals, 
  settings,
  onNavigate 
}: DashboardProps) {
  
  // Memoized stats calculation
  const stats = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === "COMPLETED").length;
    const inProgressTasks = tasks.filter(t => t.status === "IN_PROGRESS").length;
    const pendingTasks = tasks.filter(t => t.status === "TODO").length;
    
    // High risk tasks are warning states that require rescue
    const atRiskTasks = tasks.filter(t => t.riskLevel === "HIGH" || t.riskLevel === "MONITORING").length;

    // AI-Assisted Tasks: completed tasks where user applied AI proposals, or tasks having "High Focus" or specific milestones
    // Let's calculate a simulated yet logical AI involvement score
    const acceptedProposals = proposals.filter(p => p.applied).length;
    const totalProposals = proposals.length;
    
    // Let's create a realistic "AI Dependence & Synergy Quotient"
    // Dependency increases with: Autonomy settings level, applied proposals, and optimization aggression
    const autonomyWeight = settings.level === "Autopilot" ? 95 : settings.level === "Co-Pilot" ? 65 : 30;
    const proposalWeight = totalProposals > 0 ? (acceptedProposals / totalProposals) * 100 : 50;
    const synergyScore = Math.round((autonomyWeight * 0.4) + (settings.optimizationAggression * 0.3) + (proposalWeight * 0.3));

    // Tasks completed by User alone vs AI Assisted
    // We assume Completed tasks with priority "URGENT" or "HIGH" have been AI-optimized or rescued
    const aiRescuedCount = tasks.filter(t => t.status === "COMPLETED" && (t.priority === "URGENT" || t.priority === "HIGH")).length;
    const userOnlyCompletedCount = Math.max(0, completedTasks - aiRescuedCount);

    // Goal stats
    const averageGoalProgress = goals.length > 0 
      ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length) 
      : 0;

    // Habit completion counts
    const activeHabitsCount = habits.length;
    const totalStreaks = habits.reduce((sum, h) => sum + h.streak, 0);
    const averageStreak = activeHabitsCount > 0 ? Math.round(totalStreaks / activeHabitsCount) : 0;

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      atRiskTasks,
      acceptedProposals,
      totalProposals,
      synergyScore,
      aiRescuedCount,
      userOnlyCompletedCount,
      averageGoalProgress,
      averageStreak,
      activeHabitsCount
    };
  }, [tasks, goals, habits, proposals, settings]);

  // Recharts color palettes
  const COLORS = {
    user: "#f97316", // orange-500
    ai: "#06b6d4",   // cyan-500
    neutral: "#64748b", // slate-500
    success: "#10b981", // emerald-500
    warning: "#eab308", // yellow-500
    danger: "#ef4444",  // rose-500
    indigo: "#6366f1"   // indigo-500
  };

  // 1. Task breakdown data for Pie Chart
  const taskBreakdownData = [
    { name: "Completed (User Only)", value: stats.userOnlyCompletedCount, color: COLORS.user },
    { name: "AI Assisted & Rescued", value: stats.aiRescuedCount, color: COLORS.ai },
    { name: "In Progress Blocks", value: stats.inProgressTasks, color: COLORS.indigo },
    { name: "Pending Queue", value: stats.pendingTasks, color: COLORS.neutral }
  ].filter(item => item.value > 0);

  // Fallback if empty
  const finalTaskBreakdownData = taskBreakdownData.length > 0 
    ? taskBreakdownData 
    : [{ name: "No Tasks", value: 1, color: COLORS.neutral }];

  // 2. Goal Progress data for Bar Chart
  const goalsData = goals.map(g => ({
    name: g.title.length > 20 ? g.title.substring(0, 18) + "..." : g.title,
    "Progress %": g.progress,
    category: g.category
  }));

  // 3. User vs AI Synergy Over Time (Simulation of weekly hours saved & load)
  const synergyHistoryData = [
    { day: "Mon", "User Tasks Completed": 2, "AI Interventions": 1, "Cognitive Score": 85 },
    { day: "Tue", "User Tasks Completed": 4, "AI Interventions": 3, "Cognitive Score": 92 },
    { day: "Wed", "User Tasks Completed": 3, "AI Interventions": 2, "Cognitive Score": 88 },
    { day: "Thu", "User Tasks Completed": 5, "AI Interventions": 4, "Cognitive Score": 94 },
    { day: "Fri", "User Tasks Completed": 6, "AI Interventions": 5, "Cognitive Score": 96 },
    { day: "Sat", "User Tasks Completed": 2, "AI Interventions": 1, "Cognitive Score": 90 },
    { day: "Sun", "User Tasks Completed": 3, "AI Interventions": 2, "Cognitive Score": 95 }
  ];

  // 4. Habit Consistency Rating
  const habitConsistencyData = habits.map(h => ({
    name: h.name.length > 15 ? h.name.substring(0, 13) + "..." : h.name,
    Streak: h.streak,
    category: h.category
  }));

  // 5. 7-day Productivity Trend: Completed Tasks vs AI-Assisted Milestones
  const productivityTrendData = useMemo(() => {
    // Dynamically model user productivity vs AI assisted progress across the week
    const baseCompleted = [2, 4, 3, 5, 6, 2, stats.completedTasks || 3];
    const baseAI = [1, 3, 2, 4, 5, 1, stats.acceptedProposals || 2];
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    
    return days.map((day, i) => ({
      day,
      "Completed Tasks": baseCompleted[i],
      "AI-Assisted Milestones": baseAI[i],
    }));
  }, [stats.completedTasks, stats.acceptedProposals]);

  // 6. Dynamic Mastery Badges list based on user & AI accomplishments
  const badgesList = useMemo(() => {
    return [
      {
        id: "deep-work",
        title: "Deep Work Guru",
        description: "Complete at least 3 high-priority tasks in the planner.",
        icon: Flame,
        color: "text-amber-500 bg-amber-50 border-amber-200/60 dark:bg-amber-950/20 dark:border-amber-900/30",
        target: 3,
        current: stats.completedTasks,
        unlocked: stats.completedTasks >= 3
      },
      {
        id: "ai-synergy",
        title: "AI Synergy Pro",
        description: "Successfully apply 2 or more AI-recommended optimization actions.",
        icon: Sparkles,
        color: "text-cyan-500 bg-cyan-50 border-cyan-200/60 dark:bg-cyan-950/20 dark:border-cyan-900/30",
        target: 2,
        current: stats.acceptedProposals,
        unlocked: stats.acceptedProposals >= 2
      },
      {
        id: "consistency-titan",
        title: "Consistency Titan",
        description: "Reach an average streak of at least 3 days in your self-care habits.",
        icon: Award,
        color: "text-emerald-500 bg-emerald-50 border-emerald-200/60 dark:bg-emerald-950/20 dark:border-emerald-900/30",
        target: 3,
        current: stats.averageStreak,
        unlocked: stats.averageStreak >= 3
      },
      {
        id: "resilience-master",
        title: "Resilience Master",
        description: "Have AI assist/rescue at least 1 high-risk block.",
        icon: Zap,
        color: "text-orange-500 bg-orange-50 border-orange-200/60 dark:bg-orange-950/20 dark:border-orange-900/30",
        target: 1,
        current: stats.aiRescuedCount,
        unlocked: stats.aiRescuedCount >= 1
      }
    ];
  }, [stats]);

  return (
    <div className="space-y-6 md:space-y-8 animate-fadeIn">
      
      {/* Intro Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 border border-slate-800 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-2xl relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-xs font-bold text-orange-400">
            <Sparkles className="w-4 h-4 animate-pulse" />
            AI-Human Synergy Metrics
          </div>
          <h2 className="text-2xl md:text-3.5xl font-black tracking-tight leading-tight">
            How effectively are you and your AI Companion collaborating?
          </h2>
          <p className="text-xs md:text-sm text-slate-300 font-medium leading-relaxed">
            Track active task resolution cycles, warning rescues, goal velocity, and monitor your overall dependency on automated decision co-pilots.
          </p>
        </div>
      </div>

      {/* Grid: High Level Synergy & Dependency Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        
        {/* Core Synergy Meter (AI Dependency) */}
        <div className="bg-white border border-slate-200/60 rounded-3xl p-5 md:p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">AI Dependency Index</span>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stats.synergyScore}%</h3>
            </div>
            <div className="p-3 bg-cyan-50 rounded-2xl text-cyan-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-orange-500 to-cyan-500 h-full rounded-full transition-all duration-1000"
                style={{ width: `${stats.synergyScore}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-bold">
              <span>Sovereign (0%)</span>
              <span>Fully Guided (100%)</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 font-semibold mt-3 leading-relaxed">
            Your setting is currently <span className="text-cyan-600 font-bold">{settings.level}</span> with <span className="font-bold">{settings.optimizationAggression}%</span> auto-aggression.
          </p>
        </div>

        {/* Task Completion Velocity */}
        <div className="bg-white border border-slate-200/60 rounded-3xl p-5 md:p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Completion Velocity</span>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                {stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%
              </h3>
            </div>
            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex gap-2.5 items-center">
            <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">
              {stats.completedTasks} Resolved
            </span>
            <span className="text-xs text-slate-400 font-bold">
              / {stats.totalTasks} Total tasks
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-semibold mt-3 leading-relaxed">
            {stats.inProgressTasks} active blocks in queue. AI optimized {stats.aiRescuedCount} critical warning thresholds.
          </p>
        </div>

        {/* Saved & Optimized Blocks */}
        <div className="bg-white border border-slate-200/60 rounded-3xl p-5 md:p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Rescues & Actions</span>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                {stats.aiRescuedCount} <span className="text-xs text-slate-400 font-medium">blocks</span>
              </h3>
            </div>
            <div className="p-3 bg-orange-50 rounded-2xl text-orange-600">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-700 font-bold">
            <TrendingUp className="w-4 h-4 text-orange-500" />
            <span>{stats.acceptedProposals} AI recommendations applied</span>
          </div>
          <p className="text-[10px] text-slate-500 font-semibold mt-3 leading-relaxed">
            Automated reschedule warnings triggered by calendar conflicts have been mitigated safely.
          </p>
        </div>

        {/* Average Milestone Velocity */}
        <div className="bg-white border border-slate-200/60 rounded-3xl p-5 md:p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Goal Progress Index</span>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                {stats.averageGoalProgress}% <span className="text-xs text-emerald-500 font-black">↑ Peak</span>
              </h3>
            </div>
            <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex gap-2 items-center">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span className="text-xs font-bold text-slate-700">{goals.length} Goals Registered</span>
          </div>
          <p className="text-[10px] text-slate-500 font-semibold mt-3 leading-relaxed">
            Habits are maintained at an average streak of <span className="font-bold text-slate-700">{stats.averageStreak} days</span>.
          </p>
        </div>

      </div>

      {/* Grid: Charts & Visualizers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chart 1: Synergy History & Cognitive Energy Over Time */}
        <div className="bg-white border border-slate-200/60 rounded-3xl p-5 md:p-6 shadow-sm lg:col-span-8 flex flex-col justify-between min-h-[380px]">
          <div>
            <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-start mb-4">
              <div>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-indigo-500" />
                  Productivity Synergy Over Time
                </h4>
                <p className="text-[11px] text-slate-400 font-bold">Comparing user completion cycles against automated AI intervention levels.</p>
              </div>
              <div className="flex flex-wrap gap-2.5 text-[9px] font-black uppercase tracking-wider">
                <span className="flex items-center gap-1 text-orange-500">
                  <span className="w-2 h-2 rounded-full bg-orange-500" /> User Tasks
                </span>
                <span className="flex items-center gap-1 text-cyan-500">
                  <span className="w-2 h-2 rounded-full bg-cyan-500" /> AI Assists
                </span>
              </div>
            </div>
            
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={synergyHistoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorUser" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.user} stopOpacity={0.2}/>
                      <stop offset="95%" stopColor={COLORS.user} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorAi" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.ai} stopOpacity={0.2}/>
                      <stop offset="95%" stopColor={COLORS.ai} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fontWeight: "bold", fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fontWeight: "bold", fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#0f172a", border: "none", borderRadius: "12px", color: "#fff", fontSize: "11px" }}
                    labelStyle={{ fontWeight: "bold", color: "#f97316" }}
                    itemStyle={{ color: "#cbd5e1" }}
                  />
                  <Area type="monotone" dataKey="User Tasks Completed" stroke={COLORS.user} strokeWidth={2.5} fillOpacity={1} fill="url(#colorUser)" name="User Completed" />
                  <Area type="monotone" dataKey="AI Interventions" stroke={COLORS.ai} strokeWidth={2.5} fillOpacity={1} fill="url(#colorAi)" name="AI Rescues/Assists" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-[10px] text-slate-500 font-semibold">
            <span>💡 Notice: Deep focus Alpha Wave sessions are highly correlated with rapid user task closure.</span>
            <button 
              onClick={() => onNavigate("quick-assist")}
              className="text-cyan-600 font-bold hover:underline flex items-center gap-0.5"
            >
              Analyze with Quick Assist AI <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Chart 2: Task Allocation breakdown (Pie Chart) */}
        <div className="bg-white border border-slate-200/60 rounded-3xl p-5 md:p-6 shadow-sm lg:col-span-4 flex flex-col justify-between min-h-[380px]">
          <div>
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-orange-500" />
              Task State Allocation
            </h4>
            <p className="text-[11px] text-slate-400 font-bold mb-4">Breakdown of the daily paced priority queue.</p>
            
            <div className="h-56 w-full flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={finalTaskBreakdownData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {finalTaskBreakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#0f172a", border: "none", borderRadius: "12px", color: "#fff", fontSize: "11px" }}
                    labelStyle={{ fontWeight: "bold", color: "#f97316" }}
                    itemStyle={{ color: "#cbd5e1" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Absolutes in center */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-slate-900 leading-none">{stats.totalTasks}</span>
                <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider mt-1">Total Registry</span>
              </div>
            </div>
          </div>

          {/* Custom Legends */}
          <div className="space-y-1.5">
            {finalTaskBreakdownData.map((item, i) => (
              <div key={i} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2 text-slate-600 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                </div>
                <span className="font-black text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Grid: Goals Velocities and Habit Streaks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Goal Milestone Progress */}
        <div className="bg-white border border-slate-200/60 rounded-3xl p-5 md:p-6 shadow-sm flex flex-col justify-between min-h-[340px]">
          <div>
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5 mb-1">
              <CheckCircle2 className="w-4 h-4 text-indigo-500" />
              Goal Momentum & Completion Rate
            </h4>
            <p className="text-[11px] text-slate-400 font-bold mb-4">Milestone progress mapped across professional and personal targets.</p>
            
            {goals.length > 0 ? (
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={goalsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: "bold", fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fontWeight: "bold", fill: "#94a3b8" }} domain={[0, 100]} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#0f172a", border: "none", borderRadius: "12px", color: "#fff", fontSize: "11px" }}
                      labelStyle={{ fontWeight: "bold", color: "#f97316" }}
                      itemStyle={{ color: "#cbd5e1" }}
                    />
                    <Bar dataKey="Progress %" radius={[6, 6, 0, 0]}>
                      {goalsData.map((entry, index) => {
                        return (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS.user} 
                          />
                        );
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-56 flex flex-col items-center justify-center text-center bg-slate-50 rounded-2xl p-4">
                <p className="text-xs text-slate-400 font-bold">No active goals found in registry.</p>
                <button 
                  onClick={() => onNavigate("goals")}
                  className="mt-2 text-xs font-black text-orange-500 hover:underline"
                >
                  Create your first goal now
                </button>
              </div>
            )}
          </div>
          
          <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row gap-2 justify-between sm:items-center text-[10px] text-slate-500 font-bold">
            <span>Overall Goal Velocity index is {stats.averageGoalProgress}%</span>
            <button 
              onClick={() => onNavigate("goals")}
              className="text-orange-500 hover:underline flex items-center gap-0.5"
            >
              Add Milestones <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Habit Consistency Streaks */}
        <div className="bg-white border border-slate-200/60 rounded-3xl p-5 md:p-6 shadow-sm flex flex-col justify-between min-h-[340px]">
          <div>
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Habit Consistency Streaks
            </h4>
            <p className="text-[11px] text-slate-400 font-bold mb-4">Continuous daily streak performance showing self-care consistency.</p>
            
            {habits.length > 0 ? (
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={habitConsistencyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: "bold", fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fontWeight: "bold", fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#0f172a", border: "none", borderRadius: "12px", color: "#fff", fontSize: "11px" }}
                      labelStyle={{ fontWeight: "bold", color: "#f97316" }}
                      itemStyle={{ color: "#cbd5e1" }}
                    />
                    <Bar dataKey="Streak" radius={[6, 6, 0, 0]}>
                      {habitConsistencyData.map((entry, index) => {
                        const isPersonal = entry.category === "Personal" || entry.category === "Mental";
                        return (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={isPersonal ? COLORS.ai : COLORS.success} 
                          />
                        );
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-56 flex flex-col items-center justify-center text-center bg-slate-50 rounded-2xl p-4">
                <p className="text-xs text-slate-400 font-bold">No active habits logged yet.</p>
                <button 
                  onClick={() => onNavigate("goals")}
                  className="mt-2 text-xs font-black text-orange-500 hover:underline"
                >
                  Track your first habit
                </button>
              </div>
            )}
          </div>
          
          <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row gap-2 justify-between sm:items-center text-[10px] text-slate-500 font-bold">
            <span>Average streak duration: {stats.averageStreak} consecutive days</span>
            <button 
              onClick={() => onNavigate("goals")}
              className="text-emerald-500 hover:underline flex items-center gap-0.5"
            >
              Log Daily Streak <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Synergy Arena Interactive Callout Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950 border border-slate-800 rounded-3xl p-6 text-white relative overflow-hidden shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase text-amber-400 tracking-wider">
            <Trophy className="w-3.5 h-3.5" />
            Competitive Arena Active
          </div>
          <h3 className="text-lg font-black tracking-tight">Enter the Synergy Arena & Claim Ranks</h3>
          <p className="text-xs text-slate-300 font-medium leading-relaxed">
            You are currently ranked <span className="text-amber-400 font-black">#{(stats.completedTasks * 15 + stats.acceptedProposals * 20 + stats.averageStreak * 10 >= 145) ? 1 : (stats.completedTasks * 15 + stats.acceptedProposals * 20 + stats.averageStreak * 10 >= 105) ? 2 : (stats.completedTasks * 15 + stats.acceptedProposals * 20 + stats.averageStreak * 10 >= 75) ? 3 : 4}</span> in the Synergy League. Complete co-op daily quests, win achievement badges, and climb past global contenders!
          </p>
        </div>
        <button 
          onClick={() => onNavigate("arena")}
          className="w-full md:w-auto shrink-0 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase px-5 py-3 rounded-xl shadow-lg shadow-amber-500/10 transition-all flex items-center justify-center gap-1.5"
        >
          Enter Arena
          <ArrowUpRight className="w-4 h-4 stroke-[3px]" />
        </button>
      </div>

      {/* Warning Rescue Insights Dashboard Bottom */}
      <div className={`border rounded-3xl p-5 md:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors duration-300 ${
        stats.atRiskTasks > 0 
          ? "bg-slate-50 border-slate-200/50" 
          : "bg-emerald-50/60 border-emerald-100/80"
      }`}>
        <div className="flex items-start sm:items-center gap-3.5">
          <div className={`p-3 rounded-2xl shrink-0 mt-0.5 sm:mt-0 transition-colors duration-300 ${
            stats.atRiskTasks > 0 
              ? "bg-orange-100 text-orange-600" 
              : "bg-emerald-100 text-emerald-600"
          }`}>
            {stats.atRiskTasks > 0 ? (
              <AlertCircle className="w-5 h-5" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
          </div>
          <div className="space-y-1">
            <h5 className="text-xs font-black uppercase tracking-wide text-slate-800">
              Active Prevention Diagnostics
            </h5>
            <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
              {stats.atRiskTasks > 0 ? (
                <>
                  Your co-pilot has identified <span className="text-red-500 font-bold">{stats.atRiskTasks} high-friction calendar blocks</span>. Access the rescue hub to initiate active focus or snooze.
                </>
              ) : (
                <>
                  Your co-pilot has identified <span className="text-emerald-600 font-bold">0 high-friction calendar blocks</span>. Your scheduled routines are running optimally and safely.
                </>
              )}
            </p>
          </div>
        </div>
        <button 
          onClick={() => stats.atRiskTasks > 0 && onNavigate("command")}
          disabled={stats.atRiskTasks === 0}
          className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
            stats.atRiskTasks > 0 
              ? "bg-slate-950 hover:bg-slate-900 text-white cursor-pointer active:scale-[0.98]" 
              : "bg-slate-200 text-slate-400 cursor-not-allowed opacity-60"
          }`}
        >
          Open Action Rescue Hub
        </button>
      </div>

    </div>
  );
}

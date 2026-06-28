import React, { useMemo, useState } from "react";
import { 
  Trophy, 
  Award, 
  Sparkles, 
  Flame, 
  Zap, 
  TrendingUp, 
  Lightbulb, 
  CheckCircle2, 
  Compass, 
  Gamepad2, 
  Star,
  Users,
  Target,
  ArrowUpRight,
  ChevronRight,
  Info,
  X
} from "lucide-react";
import { Task, Goal, Habit, AIProposal, AutonomySettings } from "../types";

interface SynergyArenaProps {
  tasks: Task[];
  goals: Goal[];
  habits: Habit[];
  proposals: AIProposal[];
  settings: AutonomySettings;
  onNavigate: (tab: "dashboard" | "command" | "tasks" | "goals" | "settings" | "profile" | "quick-assist" | "abstract" | "arena") => void;
}

export default function SynergyArena({ 
  tasks, 
  goals, 
  habits, 
  proposals, 
  settings,
  onNavigate 
}: SynergyArenaProps) {
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isBadgesHelpOpen, setIsBadgesHelpOpen] = useState(false);
  const [isQuestsHelpOpen, setIsQuestsHelpOpen] = useState(false);
  
  // Calculate stats for gamification
  const stats = useMemo(() => {
    const completedTasks = tasks.filter(t => t.status === "COMPLETED").length;
    const acceptedProposals = proposals.filter(p => p.applied).length;
    const activeHabitsCount = habits.length;
    const totalStreaks = habits.reduce((sum, h) => sum + h.streak, 0);
    const averageStreak = activeHabitsCount > 0 ? Math.round(totalStreaks / activeHabitsCount) : 0;
    
    // Dynamic XP Scoring System
    // Each completed task = 15 XP
    // Each applied AI co-pilot recommendation = 20 XP
    // Average habit streak multiplier = averageStreak * 10 XP
    const userXP = (completedTasks * 15) + (acceptedProposals * 20) + (averageStreak * 10);
    
    // Calculate Synergy level based on XP
    const level = Math.floor(userXP / 100) + 1;
    const nextLevelXP = level * 100;
    const prevLevelXP = (level - 1) * 100;
    const levelProgressPercent = Math.min(100, Math.round(((userXP - prevLevelXP) / (nextLevelXP - prevLevelXP)) * 100));

    return {
      completedTasks,
      acceptedProposals,
      averageStreak,
      userXP,
      level,
      nextLevelXP,
      levelProgressPercent
    };
  }, [tasks, goals, habits, proposals]);

  // Leaders list including user
  const leaderboardList = useMemo(() => {
    const baseList = [
      { id: "aria", name: "Aria Sterling (Co-Pilot Pro)", score: 145, tasks: 9, proposals: 3, isUser: false },
      { id: "marcus", name: "Marcus Thorne (Autopilot)", score: 105, tasks: 6, proposals: 2, isUser: false },
      { id: "you", name: "You (Pravesh)", score: stats.userXP || 15, tasks: stats.completedTasks, proposals: stats.acceptedProposals, isUser: true },
      { id: "clara", name: "Clara Vance (Self-Sovereign)", score: 75, tasks: 5, proposals: 1, isUser: false },
      { id: "devon", name: "Devon Reynolds (Cadet)", score: 45, tasks: 3, proposals: 1, isUser: false },
      { id: "elena", name: "Elena Rostova (Hybrid)", score: 30, tasks: 2, proposals: 0, isUser: false }
    ];
    return [...baseList].sort((a, b) => b.score - a.score);
  }, [stats]);

  // Find user rank
  const userRank = useMemo(() => {
    return leaderboardList.findIndex(item => item.isUser) + 1;
  }, [leaderboardList]);

  // Mastery Badges definitions
  const badges = useMemo(() => {
    return [
      {
        id: "deep-work",
        title: "Deep Work Guru",
        description: "Complete 3 or more high-priority tasks in your paced queue.",
        icon: Flame,
        color: "text-amber-500 bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/30",
        target: 3,
        current: stats.completedTasks,
        unlocked: stats.completedTasks >= 3
      },
      {
        id: "ai-synergy",
        title: "AI Synergy Pro",
        description: "Successfully apply at least 2 AI-recommended optimization proposals.",
        icon: Sparkles,
        color: "text-cyan-500 bg-cyan-50 border-cyan-200 dark:bg-cyan-950/20 dark:border-cyan-900/30",
        target: 2,
        current: stats.acceptedProposals,
        unlocked: stats.acceptedProposals >= 2
      },
      {
        id: "consistency-titan",
        title: "Consistency Titan",
        description: "Maintain an average consecutive streak of 3 days across active habits.",
        icon: Award,
        color: "text-emerald-500 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/30",
        target: 3,
        current: stats.averageStreak,
        unlocked: stats.averageStreak >= 3
      },
      {
        id: "resilience-master",
        title: "Resilience Master",
        description: "Unlock an optimization safety net or rescue a high-risk conflict.",
        icon: Zap,
        color: "text-orange-500 bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-900/30",
        target: 1,
        current: proposals.length > 0 ? 1 : 0,
        unlocked: proposals.length > 0
      }
    ];
  }, [stats, proposals]);

  // Dynamic gamified suggestions on how to climb the leaderboard & unlock next badges
  const arenaSuggestions = useMemo(() => {
    const list = [];
    
    // Check next rank threshold
    if (userRank > 1) {
      const competitorAbove = leaderboardList[userRank - 2];
      const xpDifference = competitorAbove.score - stats.userXP;
      list.push({
        type: "climb",
        title: `Overtake ${competitorAbove.name.split(" ")[0]}`,
        text: `You are only ${xpDifference} XP behind rank #${userRank - 1}. Complete ${Math.ceil(xpDifference / 15)} high-priority tasks to climb!`,
        action: "Go to Daily Queue",
        tab: "tasks" as const
      });
    }

    // Badge specific guidance
    const lockedBadges = badges.filter(b => !b.unlocked);
    if (lockedBadges.length > 0) {
      const nextBadge = lockedBadges[0];
      const gap = nextBadge.target - nextBadge.current;
      
      let badgeActionLabel = "View Progress";
      let badgeTargetTab: "tasks" | "goals" | "command" = "tasks";
      
      if (nextBadge.id === "deep-work") {
        badgeActionLabel = "Resolve Tasks";
        badgeTargetTab = "tasks";
      } else if (nextBadge.id === "ai-synergy") {
        badgeActionLabel = "Apply AI Action";
        badgeTargetTab = "command";
      } else if (nextBadge.id === "consistency-titan") {
        badgeActionLabel = "Track Habits";
        badgeTargetTab = "goals";
      }

      list.push({
        type: "badge",
        title: `Unlock: ${nextBadge.title}`,
        text: `You need ${gap} more units to claim this milestone. ${nextBadge.description}`,
        action: badgeActionLabel,
        tab: badgeTargetTab
      });
    }

    // Fallback or productivity multiplier tip
    list.push({
      type: "tip",
      title: "Activate Deep Focus Shield",
      text: "Turn on the Focus Noise Shield & lock a 25-minute block inside the Abstract Resonance module. Muting interruptions gives you a critical productivity edge.",
      action: "Enter Focus Chamber",
      tab: "abstract" as const
    });

    return list;
  }, [userRank, leaderboardList, stats, badges]);

  // Daily Co-Op Quests / Challenges with the AI
  const dailyQuests = [
    {
      title: "Reschedule Conflict Resolution",
      reward: "+25 XP",
      progress: stats.acceptedProposals >= 1 ? 100 : 0,
      description: "Resolve at least one high-risk block using an automated co-pilot proposal.",
      completed: stats.acceptedProposals >= 1
    },
    {
      title: "Triple Strike Task Speedrun",
      reward: "+35 XP",
      progress: Math.min(100, Math.round((stats.completedTasks / 3) * 100)),
      description: "Complete 3 tasks in the daily queue to boost physical synergy.",
      completed: stats.completedTasks >= 3
    },
    {
      title: "Self-Care Continuous Loop",
      reward: "+20 XP",
      progress: stats.averageStreak >= 1 ? 100 : 0,
      description: "Register or log a streak on any of your active habits.",
      completed: stats.averageStreak >= 1
    }
  ];

  return (
    <div className="space-y-6 md:space-y-8 animate-fadeIn">
      
      {/* Synergy Arena Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 border border-slate-800 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="max-w-xl space-y-3">
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-2 bg-amber-500/10 backdrop-blur-md border border-amber-500/20 px-3 py-1 rounded-full text-xs font-bold text-amber-400">
                <Gamepad2 className="w-4 h-4 animate-bounce" />
                Synergy Arena
              </div>
              <button 
                onClick={() => setIsInfoOpen(true)}
                className="p-1.5 bg-white/5 hover:bg-white/15 border border-white/10 rounded-full text-slate-300 hover:text-amber-400 transition-all cursor-pointer flex items-center justify-center"
                title="View Scoring & Leaderboard Rules"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
            <h2 className="text-2xl md:text-3.5xl font-black tracking-tight leading-tight">
              Level Up Your Human-AI Collaboration
            </h2>
            <p className="text-xs md:text-sm text-slate-300 font-medium leading-relaxed">
              Earn XP for resolving tasks, optimizing workflows with your AI co-pilot, and maintaining consistent habits. Complete daily quests to climb the season leaderboard!
            </p>
          </div>

          {/* Current Level Circle Display */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl flex items-center gap-4 shrink-0 w-full md:w-auto">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="32" cy="32" r="28" className="stroke-slate-800" strokeWidth="4" fill="transparent" />
                <circle cx="32" cy="32" r="28" className="stroke-amber-400 transition-all duration-300" strokeWidth="4" fill="transparent" strokeDasharray="175.8" strokeDashoffset={175.8 - (175.8 * stats.levelProgressPercent) / 100} strokeLinecap="round" />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-xl font-black text-amber-400">{stats.level}</span>
                <span className="text-[7px] uppercase font-bold text-slate-400">Level</span>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Total Progress</span>
              <div className="text-sm font-black text-white">{stats.userXP} XP</div>
              <p className="text-[9px] text-slate-300 font-semibold">{stats.nextLevelXP - stats.userXP} XP to Level {stats.level + 1}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gamified Core Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Leaderboard & Dynamic Suggestions (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Synergy League Leaderboard */}
          <div className="bg-white border border-slate-200/60 rounded-3xl p-5 md:p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  Synergy League Leaderboard
                  <button 
                    onClick={() => setIsInfoOpen(true)}
                    className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-indigo-600 transition-all cursor-pointer inline-flex items-center justify-center"
                    title="View Scoring Rules"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </h4>
                <p className="text-[11px] text-slate-400 font-bold">Compete with other users. Ranks update with daily completions.</p>
              </div>
              <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md uppercase tracking-wider">
                Rank #{userRank}
              </span>
            </div>

            <div className="space-y-2.5">
              {leaderboardList.map((leader, index) => {
                const rank = index + 1;
                const isGold = rank === 1;
                const isSilver = rank === 2;
                const isBronze = rank === 3;
                
                return (
                  <div 
                    key={leader.id}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                      leader.isUser 
                        ? "bg-gradient-to-r from-amber-500/10 to-orange-500/5 border-amber-300 shadow-sm font-bold scale-[1.01]" 
                        : "bg-slate-50/50 border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Rank Badge */}
                      <div className={`w-7 h-7 flex items-center justify-center rounded-xl font-black text-xs ${
                        isGold ? "bg-amber-100 text-amber-700" :
                        isSilver ? "bg-slate-200 text-slate-700" :
                        isBronze ? "bg-orange-100 text-orange-800" :
                        "bg-slate-100 text-slate-500"
                      }`}>
                        {rank}
                      </div>

                      {/* Name & Title */}
                      <div>
                        <span className={`text-xs block ${leader.isUser ? "text-slate-900 font-extrabold" : "text-slate-700 font-semibold"}`}>
                          {leader.name} {leader.isUser && "👑"}
                        </span>
                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-2 mt-0.5">
                          <span>{leader.tasks} tasks completed</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span>{leader.proposals} AI assists</span>
                        </div>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-right">
                      <span className="text-xs font-black text-slate-900">{leader.score}</span>
                      <span className="block text-[8px] uppercase font-bold text-slate-400">XP Points</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gamified Suggestions & Strategic Guidance */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 text-white space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-orange-400 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-orange-400 animate-pulse" />
              Strategic Optimization Advice
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {arenaSuggestions.map((suggestion, i) => (
                <div 
                  key={i} 
                  className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between hover:bg-white/80 transition-all duration-300 hover:text-slate-900 group"
                >
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-black uppercase text-amber-400 group-hover:text-amber-600 tracking-wider">
                      {suggestion.type === "climb" ? "🏆 Leaderboard Climb" : suggestion.type === "badge" ? "🏅 Badge Track" : "💡 Focus Strategy"}
                    </span>
                    <h5 className="text-xs font-black text-white group-hover:text-slate-900 leading-tight">
                      {suggestion.title}
                    </h5>
                    <p className="text-[10px] text-slate-300 group-hover:text-slate-600 font-medium leading-relaxed">
                      {suggestion.text}
                    </p>
                  </div>
                  <button 
                    onClick={() => onNavigate(suggestion.tab)}
                    className="mt-3.5 self-start inline-flex items-center gap-1 px-3 py-1.5 bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase group-hover:bg-slate-900 group-hover:text-white transition-all"
                  >
                    {suggestion.action}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Mastery Badges & Daily Co-Op Challenges (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Dynamic Mastery Badges Section */}
          <div className="bg-white border border-slate-200/60 rounded-3xl p-5 md:p-6 shadow-sm">
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5 mb-1">
              <Award className="w-4 h-4 text-amber-500" />
              Mastery Badges
              <button 
                onClick={() => setIsBadgesHelpOpen(true)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-indigo-600 transition-all cursor-pointer inline-flex items-center justify-center ml-1.5"
                title="How to unlock badges"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            </h4>
            <p className="text-[11px] text-slate-400 font-bold mb-4">Milestone awards for high productivity and co-pilot co-operation.</p>
            
            <div className="space-y-3.5">
              {badges.map((badge) => {
                const Icon = badge.icon;
                const percent = Math.min(100, Math.round((badge.current / badge.target) * 100)) || 0;
                return (
                  <div 
                    key={badge.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      badge.unlocked 
                        ? "bg-slate-50 border-slate-200" 
                        : "bg-slate-50/40 border-slate-100 opacity-70"
                    }`}
                  >
                    <div className="flex gap-3 items-start">
                      <div className={`p-2.5 rounded-xl border shrink-0 ${badge.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-grow space-y-1">
                        <div className="flex justify-between items-center">
                          <h5 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                            {badge.title}
                            {badge.unlocked && (
                              <span className="text-[8px] bg-emerald-100 text-emerald-800 border border-emerald-200 font-black px-1.5 py-0.25 rounded-full uppercase tracking-wider animate-pulse">
                                Active
                              </span>
                            )}
                          </h5>
                          <span className="text-[10px] font-mono font-bold text-slate-400">
                            {badge.current}/{badge.target}
                          </span>
                        </div>
                        
                        <p className="text-[10px] text-slate-500 font-semibold leading-normal">
                          {badge.description}
                        </p>

                        {/* Progress Bar for Locked */}
                        {!badge.unlocked && (
                          <div className="mt-2.5">
                            <div className="w-full bg-slate-200/60 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className="bg-slate-400 h-full rounded-full transition-all duration-500"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Daily Quests / Co-Op Challenges */}
          <div className="bg-white border border-slate-200/60 rounded-3xl p-5 md:p-6 shadow-sm">
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5 mb-1">
              <Star className="w-4 h-4 text-orange-500 animate-pulse" />
              Daily Co-Op Quests
              <button 
                onClick={() => setIsQuestsHelpOpen(true)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-indigo-600 transition-all cursor-pointer inline-flex items-center justify-center ml-1.5"
                title="How to complete quests"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            </h4>
            <p className="text-[11px] text-slate-400 font-bold mb-4">Complete these tasks before midnight to claim instant XP rewards.</p>
            
            <div className="space-y-3">
              {dailyQuests.map((quest, i) => (
                <div 
                  key={i} 
                  className={`p-3.5 rounded-2xl border transition-all ${
                    quest.completed 
                      ? "bg-emerald-50/50 border-emerald-100" 
                      : "bg-slate-50/40 border-slate-100"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h5 className={`text-xs font-black ${quest.completed ? "text-emerald-800 line-through" : "text-slate-800"}`}>
                        {quest.title}
                      </h5>
                      <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                        {quest.description}
                      </p>
                    </div>
                    <span className="text-[10px] font-black text-slate-950 font-mono shrink-0">
                      {quest.reward}
                    </span>
                  </div>

                  {/* Progress indicators */}
                  <div className="mt-2.5 flex items-center justify-between gap-3 text-[9px] text-slate-400 font-bold">
                    <div className="flex-grow bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${quest.completed ? "bg-emerald-500" : "bg-orange-400"}`}
                        style={{ width: `${quest.progress}%` }}
                      />
                    </div>
                    <span className={quest.completed ? "text-emerald-600 font-black" : ""}>
                      {quest.completed ? "COMPLETED" : `${quest.progress}%`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Gamification System Guide (Footer Explanation) */}
      <div className="bg-slate-50 border border-slate-200/50 rounded-3xl p-5 md:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl shrink-0 mt-0.5 sm:mt-0">
            <Compass className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h5 className="text-xs font-black uppercase tracking-wide text-slate-800">
              Synergy Arena Scoring Rules
            </h5>
            <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
              Ranks reset at the end of each monthly Season. Earn <span className="font-bold text-slate-700">15 XP</span> for client tasks, <span className="font-bold text-slate-700">20 XP</span> for applying AI optimizers, and a <span className="font-bold text-slate-700">10 XP multiplier</span> for daily habit consistency.
            </p>
          </div>
        </div>
        <button 
          onClick={() => onNavigate("tasks")}
          className="w-full sm:w-auto px-5 py-2.5 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
        >
          Daily Queue
        </button>
      </div>

      {/* Informational Rules Modal */}
      {isInfoOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-[32px] max-w-lg w-full p-6 md:p-8 text-white relative shadow-2xl space-y-6">
            
            {/* Header */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight">Synergy Leaderboard Rules</h3>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">How your score is calculated</p>
                </div>
              </div>
              <button 
                onClick={() => setIsInfoOpen(false)}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Explanation Content */}
            <div className="space-y-4 text-xs font-semibold leading-relaxed text-slate-300">
              <p>
                The <span className="text-amber-400 font-extrabold">Synergy League</span> measures active, consistent, and collaborative productivity. Your rank is dynamically updated as you complete real tasks, handle stress with AI, and stick to self-care loops.
              </p>

              <div className="space-y-3 bg-slate-950/50 p-4 rounded-2xl border border-slate-800/80">
                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">XP Weighting System:</h4>
                
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-indigo-500/15 rounded-lg text-indigo-400 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-white font-extrabold">Task Completion (+15 XP per task)</span>
                    <span className="text-[10px] text-slate-400">Completing items in your Paced Queue drives your core productivity score.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 bg-cyan-500/15 rounded-lg text-cyan-400 shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-white font-extrabold">AI Co-Pilot Optimizer (+20 XP per milestone)</span>
                    <span className="text-[10px] text-slate-400">Successfully applying an AI-recommended safety net or reschedule proposal counts as collaborative success.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 bg-emerald-500/15 rounded-lg text-emerald-400 shrink-0 mt-0.5">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-white font-extrabold">Consistency Streak Multiplier (+10 XP per average day streak)</span>
                    <span className="text-[10px] text-slate-400">Maintaining consecutive loops on active self-care habits acts as a powerful overall multiplier.</span>
                  </div>
                </div>
              </div>

              {/* Pro-Tips block */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5" />
                  Strategic Leaderboard Pro-Tips:
                </h4>
                <ul className="list-disc pl-4 space-y-1.5 text-slate-400 text-[11px]">
                  <li>To overtake leaders, log in daily and record your habits. Streaks degrade rapidly if forgotten.</li>
                  <li>In times of high conflict, use the <span className="text-white font-bold">Action Rescue Hub</span> to let the AI co-pilot take safety measures. Applying proposals is highly rewarded.</li>
                  <li>Need a boost? Activate the <span className="text-white font-bold">Deep Focus Noise Shield</span> inside the Abstract Resonance module. It locks your screen and protects focus time, helping you finish tasks faster.</li>
                </ul>
              </div>
            </div>

            {/* Action Footer */}
            <button
              onClick={() => setIsInfoOpen(false)}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-orange-500/10 cursor-pointer"
            >
              Let's Climb!
            </button>
          </div>
        </div>
      )}

      {/* Mastery Badges Help Modal */}
      {isBadgesHelpOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-[32px] max-w-lg w-full p-6 md:p-8 text-white relative shadow-2xl space-y-6">
            
            {/* Header */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400">
                  <Award className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight">Mastery Badges Guide</h3>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">How to unlock each milestone award</p>
                </div>
              </div>
              <button 
                onClick={() => setIsBadgesHelpOpen(false)}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Badges details list */}
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              
              <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400">
                    <Flame className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-black text-white uppercase">1. Deep Work Guru</h4>
                </div>
                <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
                  <strong className="text-amber-400">Requirements:</strong> Complete 3 or more high-priority tasks in your queue.
                </p>
                <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                  <strong className="text-slate-300 font-bold">Action Plan:</strong> Navigate to the <span className="text-slate-200 underline cursor-pointer" onClick={() => { setIsBadgesHelpOpen(false); onNavigate("tasks"); }}>Daily Queue</span>. Add at least three tasks with <span className="text-amber-400 font-bold">HIGH</span> or <span className="text-red-400 font-bold">URGENT</span> priority and mark them completed.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-cyan-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-black text-white uppercase">2. AI Synergy Pro</h4>
                </div>
                <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
                  <strong className="text-cyan-400">Requirements:</strong> Apply at least 2 AI-recommended optimization proposals.
                </p>
                <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                  <strong className="text-slate-300 font-bold">Action Plan:</strong> Use the AI chat drawer or look for pending optimization ideas under the <span className="text-slate-200 underline cursor-pointer" onClick={() => { setIsBadgesHelpOpen(false); onNavigate("tasks"); }}>Action Proposals</span> section. Click <span className="text-cyan-400 font-bold">"Apply Plan"</span> on at least two proposals to clear the goal.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
                    <Award className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-black text-white uppercase">3. Consistency Titan</h4>
                </div>
                <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
                  <strong className="text-emerald-400">Requirements:</strong> Maintain an average consecutive streak of 3 days across active habits.
                </p>
                <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                  <strong className="text-slate-300 font-bold">Action Plan:</strong> Open the <span className="text-slate-200 underline cursor-pointer" onClick={() => { setIsBadgesHelpOpen(false); onNavigate("goals"); }}>Goals & Habits</span> tab, log your physical & mental habits every day without skipping to keep your average streaks above 3 days.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-orange-500/10 border border-orange-500/20 rounded-lg text-orange-400">
                    <Zap className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-black text-white uppercase">4. Resilience Master</h4>
                </div>
                <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
                  <strong className="text-orange-400">Requirements:</strong> Resolve at least one high-risk schedule conflict.
                </p>
                <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                  <strong className="text-slate-300 font-bold">Action Plan:</strong> When tasks are marked with <span className="text-red-400 font-bold">HIGH RISK</span> due to deadlines, click <span className="text-orange-400 font-bold">"Optimize Actionable Plans"</span> inside the task item, or tell the AI co-pilot "Optimize my schedule" to implement a safety buffer.
                </p>
              </div>

            </div>

            {/* Action Footer */}
            <button
              onClick={() => setIsBadgesHelpOpen(false)}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-orange-500/10 cursor-pointer"
            >
              Understand Badges
            </button>
          </div>
        </div>
      )}

      {/* Daily Quests Help Modal */}
      {isQuestsHelpOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-[32px] max-w-lg w-full p-6 md:p-8 text-white relative shadow-2xl space-y-6">
            
            {/* Header */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-2xl text-orange-400">
                  <Star className="w-6 h-6 animate-spin-slow" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight">Daily Co-Op Quests Guide</h3>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">How to complete each daily co-op challenge</p>
                </div>
              </div>
              <button 
                onClick={() => setIsQuestsHelpOpen(false)}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quests details list */}
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              
              <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-white uppercase">1. Reschedule Conflict Resolution</h4>
                  <span className="text-[10px] font-mono font-black text-orange-400">+25 XP</span>
                </div>
                <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
                  <strong className="text-orange-400">Requirements:</strong> Resolve at least one conflict using an automated proposal.
                </p>
                <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                  <strong className="text-slate-300 font-bold">How to achieve:</strong> Go to the <span className="text-slate-200 underline cursor-pointer" onClick={() => { setIsQuestsHelpOpen(false); onNavigate("tasks"); }}>Daily Queue</span>. Look at the "Action Proposals" at the top and click <span className="text-orange-400 font-bold">"Apply Plan"</span>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-white uppercase">2. Triple Strike Task Speedrun</h4>
                  <span className="text-[10px] font-mono font-black text-orange-400">+35 XP</span>
                </div>
                <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
                  <strong className="text-orange-400">Requirements:</strong> Complete 3 tasks in the daily queue today.
                </p>
                <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                  <strong className="text-slate-300 font-bold">How to achieve:</strong> Head to the <span className="text-slate-200 underline cursor-pointer" onClick={() => { setIsQuestsHelpOpen(false); onNavigate("tasks"); }}>Daily Queue</span>. Click the checkbox next to any 3 tasks to resolve them and instantly earn your XP reward.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-white uppercase">3. Self-Care Continuous Loop</h4>
                  <span className="text-[10px] font-mono font-black text-orange-400">+20 XP</span>
                </div>
                <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
                  <strong className="text-orange-400">Requirements:</strong> Register or log a streak on any of your active habits.
                </p>
                <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                  <strong className="text-slate-300 font-bold">How to achieve:</strong> Navigate to the <span className="text-slate-200 underline cursor-pointer" onClick={() => { setIsQuestsHelpOpen(false); onNavigate("goals"); }}>Goals & Habits</span> tab. Click on a habit's status checklist block for today to mark it done.
                </p>
              </div>

            </div>

            {/* Action Footer */}
            <button
              onClick={() => setIsQuestsHelpOpen(false)}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-orange-500/10 cursor-pointer"
            >
              Get Quests Done
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

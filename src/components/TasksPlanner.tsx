import React, { useState, useEffect } from "react";
import { Search, Plus, SlidersHorizontal, ArrowUpDown, Calendar, Clock, AlertCircle, Sparkles, Check, CheckCircle2, ChevronRight, Play, Trash2, HelpCircle } from "lucide-react";
import { Task, AIProposal } from "../types";

interface TasksPlannerProps {
  tasks: Task[];
  proposals: AIProposal[];
  routines: any[];
  onAddTask: (title: string, priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW', description: string, dueDate: string) => void;
  onToggleTask: (id: string) => void;
  onApplyProposal: (id: string) => void;
  onApplyAllProposals: () => void;
  onDeleteTask?: (id: string) => void;
  onAddRoutine: (title: string, duration: string) => void;
  onToggleRoutine: (id: string) => void;
  onDeleteRoutine: (id: string) => void;
}

export default function TasksPlanner({
  tasks,
  proposals,
  routines,
  onAddTask,
  onToggleTask,
  onApplyProposal,
  onApplyAllProposals,
  onDeleteTask,
  onAddRoutine,
  onToggleRoutine,
  onDeleteRoutine
}: TasksPlannerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [showWaveInfo, setShowWaveInfo] = useState(false);
  
  // New task modal states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW'>("HIGH");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskDue, setNewTaskDue] = useState("2026-06-24T18:00:00");

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    onAddTask(newTaskTitle, newTaskPriority, newTaskDesc, newTaskDue);
    
    // Reset
    setNewTaskTitle("");
    setNewTaskPriority("HIGH");
    setNewTaskDesc("");
    setShowAddForm(false);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (task.project && task.project.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPriority = filterPriority === "ALL" || task.priority === filterPriority;
    const matchesStatus = filterStatus === "ALL" || 
                          (filterStatus === "COMPLETED" && task.status === "COMPLETED") || 
                          (filterStatus === "PENDING" && task.status !== "COMPLETED");
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const [isAddingRoutine, setIsAddingRoutine] = useState(false);
  const [newRoutineTitle, setNewRoutineTitle] = useState("");
  const [newRoutineDuration, setNewRoutineDuration] = useState("15 min");

  const toggleRoutine = (id: string) => {
    onToggleRoutine(id);
  };

  const handleAddRoutineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoutineTitle.trim()) return;
    onAddRoutine(newRoutineTitle.trim(), newRoutineDuration.trim() || "15 min");
    setNewRoutineTitle("");
    setIsAddingRoutine(false);
  };

  const handleDeleteRoutine = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent toggling complete state
    onDeleteRoutine(id);
  };

  // 1. Calculate real-time dynamic cognitive wave values based on current tasks and routines
  const getDynamicEnergyPoints = () => {
    // base energy profile at hours: 8, 10, 12, 14, 16, 18, 20
    const baseEnergy = [60, 85, 75, 40, 70, 55, 30]; 
    const hours = [8, 10, 12, 14, 16, 18, 20];
    
    const activeTasksList = tasks.filter(t => t.status !== 'COMPLETED');
    const completedTasksList = tasks.filter(t => t.status === 'COMPLETED');
    const activeRoutinesList = routines.filter(r => !r.done);
    const completedRoutinesList = routines.filter(r => r.done);

    // Dynamic scale factors: completions lift mood and energy, active loads create strain or modify shape
    const taskLoadPenalty = activeTasksList.length * 3;
    const taskCompletionBonus = completedTasksList.length * 5;
    const routineLoadPenalty = activeRoutinesList.length * 2;
    const routineCompletionBonus = completedRoutinesList.length * 4;

    const netOffset = taskCompletionBonus + routineCompletionBonus - taskLoadPenalty - routineLoadPenalty;

    return baseEnergy.map((val, idx) => {
      let finalVal = val + netOffset;
      const hour = hours[idx];

      // Tasks with URGENT or HIGH priority spike the required concentration wave around their due dates
      activeTasksList.forEach(task => {
        let taskHour = 12;
        if (task.dueDate) {
          try {
            taskHour = new Date(task.dueDate).getHours();
          } catch (e) {
            // ignore
          }
        }
        const diff = Math.abs(taskHour - hour);
        if (diff <= 2) {
          if (task.priority === 'URGENT') {
            finalVal += 20 / (diff + 1); // higher demand
          } else if (task.priority === 'HIGH') {
            finalVal += 12 / (diff + 1);
          }
        }
      });

      // Bound between 10 (fatigued) and 95 (hyper-focused)
      return Math.min(Math.max(finalVal, 10), 95);
    });
  };

  const energyPoints = getDynamicEnergyPoints();
  const svgPoints = energyPoints.map((energy, idx) => {
    const x = (idx / 6) * 100;
    const y = 25 - (energy / 100) * 18; // scale nicely into 0-30 SVG grid
    return { x, y, energy };
  });

  const getPathD = (points: { x: number; y: number }[]) => {
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 2;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (p1.x - p0.x) / 2;
      const cpY2 = p1.y;
      d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const curveD = getPathD(svgPoints);
  const fillD = `${curveD} L 100 25 L 0 25 Z`;

  // Find the exact maximum focus hour dynamically
  const maxEnergy = Math.max(...energyPoints);
  const peakIdx = energyPoints.indexOf(maxEnergy);
  const peakHourVal = [8, 10, 12, 14, 16, 18, 20][peakIdx];
  const peakHourStr = ["08:00 AM", "10:00 AM", "12:00 PM", "02:00 PM", "04:00 PM", "06:00 PM", "08:00 PM"][peakIdx];

  const getEnergyStatusBadge = (hour: number) => {
    if (hour <= 10) return "Morning Peak Focus";
    if (hour <= 12) return "Midday Flow State";
    if (hour <= 14) return "Restorative Triage";
    if (hour <= 16) return "Afternoon Vitality";
    return "Late-Day Momentum";
  };

  const activeTasksCount = tasks.filter(t => t.status !== 'COMPLETED').length;
  const activeTasksList = tasks.filter(t => t.status !== 'COMPLETED');
  const highestPriorityTask = activeTasksList.find(t => t.priority === 'URGENT') ||
                              activeTasksList.find(t => t.priority === 'HIGH') ||
                              activeTasksList.find(t => t.priority === 'MEDIUM') ||
                              activeTasksList[0];
  const priorityLabel = highestPriorityTask ? `'${highestPriorityTask.title}'` : "your focus goals";

  // Dynamic recommendations
  const activeRoutines = routines.filter(r => !r.done);
  const lowestEnergy = Math.min(...energyPoints);
  const lowestIdx = energyPoints.indexOf(lowestEnergy);
  const lowestHourStr = ["08:00 AM", "10:00 AM", "12:00 PM", "02:00 PM", "04:00 PM", "06:00 PM", "08:00 PM"][lowestIdx];

  const recommendationText = activeRoutines.length > 0
    ? `Rescheduling Recommended: Shift '${activeRoutines[0].title}' to ${lowestHourStr} to align with your predicted cognitive dip.`
    : activeTasksList.length > 0
    ? `Fully Calibrated: Focus peak matches ${priorityLabel} beautifully.`
    : `Awaiting Input: Add tasks or routines to begin automatic cognitive optimization.`;

  return (
    <div id="tasks-planner-root" className="grid grid-cols-12 gap-5 w-full max-w-7xl mx-auto font-sans text-slate-800">
      
      {/* LEFT COLUMN - Tasks Management Shell (8 columns) */}
      <div className="col-span-12 lg:col-span-8 flex flex-col gap-5">
        
        {/* Header Controls */}
        <div className="bg-white rounded-[24px] border border-slate-100 p-5 shadow-sm flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              Optimize Actionable Plans
              <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
                {tasks.length} total
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">Calibrated schedules based on deadline urgency buffers</p>
          </div>
          
          <button 
            onClick={() => setShowAddForm(true)}
            className="px-5 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-extrabold shadow-md shadow-orange-100 flex items-center justify-center gap-2 transition-all self-end sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            New Rescue Task
          </button>
        </div>

        {/* Add Task Modal overlay */}
        {showAddForm && (
          <div className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 text-slate-800">
              <h3 className="font-extrabold text-lg text-slate-900 mb-4">Add Task to Crisis Monitor</h3>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Task Title</label>
                  <input 
                    type="text"
                    required
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="e.g., Draft Q4 Report"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Priority Calibre</label>
                  <select 
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="URGENT">URGENT (Immediate AI warnings)</option>
                    <option value="HIGH">HIGH Priority</option>
                    <option value="MEDIUM">MEDIUM Priority</option>
                    <option value="LOW">LOW Priority</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Due Deadline</label>
                  <input 
                    type="datetime-local"
                    value={newTaskDue}
                    onChange={(e) => setNewTaskDue(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-xl px-4 py-3 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Task Description / Details</label>
                  <textarea 
                    value={newTaskDesc}
                    onChange={(e) => setNewTaskDesc(e.target.value)}
                    rows={3}
                    placeholder="Add key objectives or notes to assist the AI Breakdown sequence..."
                    className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <button 
                    type="button" 
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-extrabold shadow-md shadow-orange-100 transition-colors"
                  >
                    Activate Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Search, Filter bar */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col md:flex-row gap-3">
          <div className="relative flex-grow">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tasks, projects, or tags..."
              className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-800"
            />
          </div>
          <div className="flex gap-2 shrink-0 overflow-x-auto">
            <select 
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-600 focus:outline-none"
            >
              <option value="ALL">All Priorities</option>
              <option value="URGENT">Urgent Actions</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-600 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending Tasks</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-3.5 flex-grow">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <div 
                key={task.id}
                className={`bg-white rounded-[24px] border transition-all p-5 shadow-sm hover:shadow-md ${
                  task.status === "COMPLETED" 
                    ? 'border-slate-100 opacity-65' 
                    : task.priority === "URGENT" 
                      ? 'border-orange-200' 
                      : 'border-slate-100'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <button 
                      onClick={() => onToggleTask(task.id)}
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 mt-1 transition-all ${
                        task.status === "COMPLETED" 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : 'border-slate-300 hover:border-orange-500'
                      }`}
                    >
                      {task.status === "COMPLETED" && <Check className="w-4 h-4" />}
                    </button>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full tracking-wider uppercase ${
                          task.priority === "URGENT" 
                            ? 'bg-red-100 text-red-700' 
                            : task.priority === "HIGH" 
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-slate-100 text-slate-600'
                        }`}>
                          {task.priority}
                        </span>
                        {task.project && (
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">
                            {task.project}
                          </span>
                        )}
                      </div>
                      <h3 className={`font-bold text-base mt-2 ${task.status === "COMPLETED" ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 max-w-xl">{task.description}</p>
                      )}
                      
                      <div className="flex items-center gap-4 mt-3 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Due: {new Date(task.dueDate).toLocaleDateString()} at {new Date(task.dueDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Buffer: {task.estimatedHours} hrs
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 shrink-0">
                    {task.riskLevel !== 'LOW' && task.status !== "COMPLETED" && (
                      <div className="bg-orange-50 text-orange-700 p-2.5 rounded-2xl border border-orange-100/40 text-right max-w-[150px] hidden sm:block">
                        <p className="text-[9px] font-extrabold uppercase tracking-widest text-orange-500">Overcommit Threat</p>
                        <p className="text-[10px] font-semibold mt-1 leading-relaxed">Risk analyzed: High collision</p>
                      </div>
                    )}
                    
                    <button 
                      onClick={() => onDeleteTask && onDeleteTask(task.id)}
                      className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                      title="Delete Task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 border-dashed">
              <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="font-bold text-slate-500 mt-3">No matching tasks found</p>
              <p className="text-xs text-slate-400 mt-1">Refine your search or clear filters to see your dynamic queue.</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN - Energy Forecast & Optimizer (4 columns) */}
      <div className="col-span-12 lg:col-span-4 flex flex-col gap-5">
        
        {/* 1. Energy Forecast Chart (Custom SVG bar representation) */}
        <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm flex flex-col justify-between transition-all duration-300 relative overflow-hidden">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Cognitive Wave</h3>
                <button 
                  onClick={() => setShowWaveInfo(!showWaveInfo)}
                  className="p-1 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                  title="How is this optimized?"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-[10px] bg-indigo-50 text-indigo-600 font-bold px-2 py-0.5 rounded-full uppercase">
                {getEnergyStatusBadge(peakHourVal)}
              </span>
            </div>

            {showWaveInfo && (
              <div className="mb-4 bg-indigo-50/80 border border-indigo-100 p-3.5 rounded-2xl text-[10px] text-indigo-950 leading-relaxed space-y-2">
                <p className="font-bold text-xs text-indigo-900">How LM Optimizes Your Day</p>
                <div className="space-y-1.5">
                  <p>🟢 <strong className="font-bold">Circadian Rhythm:</strong> Models your natural energy peaks (e.g. 10:00 AM) and lunch-time dips (e.g. 2:00 PM).</p>
                  <p>⚡ <strong className="font-bold">Task Urgency Spikes:</strong> High & Urgent tasks boost focal demand around their due dates, shifting active priority focus hours.</p>
                  <p>📥 <strong className="font-bold">Routine Offloading:</strong> Automates routine checklist scheduling. It recommends shifting low-intensity routines to your energy valleys to prevent creative cognitive fatigue.</p>
                </div>
                <button 
                  onClick={() => setShowWaveInfo(false)}
                  className="text-xs font-bold text-indigo-600 hover:underline pt-1 cursor-pointer block"
                >
                  Got it, close
                </button>
              </div>
            )}
            
            <p className="text-sm font-bold text-slate-800 leading-normal mb-4">
              Your focus peak spikes at <span className="text-indigo-600 font-bold">{peakHourStr}</span>. LM suggests prioritizing {priorityLabel} now.
            </p>
            
            {/* Custom SVG Line Chart representation of Energy Wave */}
            <div className="w-full h-24 relative mb-4">
              <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible">
                {/* Gradient Fill */}
                <defs>
                  <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                  </linearGradient>
                </defs>
                
                {/* Grid guidelines */}
                <line x1="0" y1="25" x2="100" y2="25" stroke="#f1f5f9" strokeWidth="0.5" />
                <line x1="0" y1="12" x2="100" y2="12" stroke="#f8fafc" strokeWidth="0.5" />
                
                {/* Shaded Area */}
                <path 
                  d={fillD} 
                  fill="url(#energyGrad)" 
                  className="transition-all duration-500 ease-in-out"
                />
                
                {/* Curve Line */}
                <path 
                  d={curveD} 
                  fill="none" 
                  stroke="#4f46e5" 
                  strokeWidth="1.5" 
                  strokeLinecap="round"
                  className="transition-all duration-500 ease-in-out"
                />

                {/* Pulse Peak node at dynamic coordinates */}
                <circle 
                  cx={svgPoints[peakIdx]?.x || 40} 
                  cy={svgPoints[peakIdx]?.y || 5} 
                  r="2.5" 
                  fill="#e11d48" 
                  className="animate-ping" 
                  style={{ transformOrigin: `${svgPoints[peakIdx]?.x || 40}px ${svgPoints[peakIdx]?.y || 5}px` }} 
                />
                <circle 
                  cx={svgPoints[peakIdx]?.x || 40} 
                  cy={svgPoints[peakIdx]?.y || 5} 
                  r="1.5" 
                  fill="#e11d48" 
                />
              </svg>
              
              {/* Timeline markers */}
              <div className="flex justify-between text-[8px] text-slate-400 font-bold tracking-wider mt-1 px-1">
                <span>08:00</span>
                <span>12:00</span>
                <span>16:00</span>
                <span>20:00</span>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
              {recommendationText}
            </p>
          </div>
        </div>

        {/* 2. Routine Workflow checklist */}
        <div className="bg-[#E9ECEF] rounded-[32px] p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Routine Workflow</h3>
              <button 
                onClick={() => setIsAddingRoutine(!isAddingRoutine)}
                className="p-1.5 text-slate-500 hover:text-slate-900 bg-white/40 rounded-lg hover:bg-white transition-colors flex items-center justify-center cursor-pointer"
                title="Add Routine Item"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {isAddingRoutine && (
              <form onSubmit={handleAddRoutineSubmit} className="mb-3 bg-white/80 p-3 rounded-2xl border border-slate-200/50 flex flex-col gap-2">
                <div>
                  <label className="block text-[9px] font-bold uppercase text-slate-400 mb-0.5">Routine Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Inbox Review, Asset Backup..." 
                    value={newRoutineTitle} 
                    onChange={e => setNewRoutineTitle(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-slate-400"
                    autoFocus
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-[9px] font-bold uppercase text-slate-400 mb-0.5">Duration</label>
                    <input 
                      type="text" 
                      placeholder="e.g., 15 min, 1 hr" 
                      value={newRoutineDuration} 
                      onChange={e => setNewRoutineDuration(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-slate-400"
                    />
                  </div>
                  <div className="flex items-end gap-1">
                    <button 
                      type="button" 
                      onClick={() => setIsAddingRoutine(false)}
                      className="px-2.5 py-1.5 bg-slate-200 text-slate-700 font-bold text-[10px] rounded-xl hover:bg-slate-300 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="px-3 py-1.5 bg-orange-500 text-white font-bold text-[10px] rounded-xl hover:bg-orange-600 transition-colors cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </form>
            )}

            <div className="space-y-2">
              {routines.length > 0 ? (
                routines.map((routine) => (
                  <div 
                    key={routine.id}
                    onClick={() => toggleRoutine(routine.id)}
                    className="flex items-center justify-between bg-white/70 p-3 rounded-xl border border-slate-200/40 cursor-pointer hover:bg-white transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${routine.done ? 'bg-slate-300' : 'bg-orange-500 animate-pulse'}`}></span>
                      <p className={`text-xs font-bold ${routine.done ? 'line-through text-slate-400' : 'text-slate-800'}`}>{routine.title}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[9px] font-extrabold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        {routine.duration}
                      </span>
                      
                      <button 
                        onClick={(e) => handleDeleteRoutine(routine.id, e)}
                        className="p-1 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all cursor-pointer"
                        title="Delete Routine"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400 bg-white/40 rounded-xl border border-dashed border-slate-300">
                  <p className="text-xs font-bold">No routine chores scheduled.</p>
                  <p className="text-[10px] mt-0.5">Click the plus icon to set up daily low-intensity tasks.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. AI Optimizer Suggested Changes */}
        <div className="bg-slate-900 rounded-[32px] p-6 text-white flex flex-col justify-between">
          {routines.length > 0 ? (
            <>
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">AI Optimizer</h3>
                  <span className="text-[9px] bg-orange-500/20 text-orange-400 font-extrabold px-2 py-0.5 rounded-full">
                    {proposals.filter(p => !p.applied).length} changes
                  </span>
                </div>
                
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {proposals.filter(p => !p.applied).length > 0 ? (
                    proposals.filter(p => !p.applied).map((proposal) => (
                      <div key={proposal.id} className="bg-white/5 border border-white/5 p-3 rounded-2xl flex flex-col justify-between hover:bg-white/10 transition-colors">
                        <div>
                          <p className="text-xs font-bold text-slate-100">{proposal.title}</p>
                          <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{proposal.description}</p>
                        </div>
                        <button 
                          onClick={() => onApplyProposal(proposal.id)}
                          className="text-[10px] font-bold text-orange-400 hover:text-orange-300 underline self-end mt-2 flex items-center gap-1"
                        >
                          Apply Change
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-slate-500">
                      <CheckCircle2 className="w-6 h-6 text-green-500 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-300">All proposals applied</p>
                      <p className="text-[10px] text-slate-400">Schedule optimized perfectly!</p>
                    </div>
                  )}
                </div>
              </div>
              
              {proposals.filter(p => !p.applied).length > 0 && (
                <button 
                  onClick={onApplyAllProposals}
                  className="w-full mt-4 bg-orange-600 hover:bg-orange-500 text-white rounded-xl py-3.5 text-xs font-extrabold tracking-wider transition-colors shadow-lg shadow-orange-950/40 flex items-center justify-center gap-2"
                >
                  Apply All Changes
                </button>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500 h-full my-auto">
              <Sparkles className="w-6 h-6 text-slate-500 mb-2 animate-pulse" />
              <p className="text-xs font-bold text-slate-300">AI Optimizer Idle</p>
              <p className="text-[10px] text-slate-500 max-w-[180px] mx-auto mt-1 leading-relaxed">Add routine tasks above to enable AI-guided scheduling & focus optimization.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

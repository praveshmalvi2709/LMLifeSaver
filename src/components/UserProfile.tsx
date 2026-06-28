import React, { useState, useRef } from "react";
import { 
  User, 
  Mail, 
  Phone, 
  Globe, 
  Shield, 
  Award, 
  Clock, 
  CheckSquare, 
  Cpu, 
  AlertTriangle, 
  TrendingUp, 
  MapPin, 
  Zap, 
  Edit2, 
  Check, 
  X,
  CreditCard,
  Sparkles,
  Camera
} from "lucide-react";
import { Task, ProfileData } from "../types";

interface UserProfileProps {
  tasks: Task[];
  habitsCount: number;
  goalsCount: number;
  profile: ProfileData;
  onUpdateProfile: (p: ProfileData) => void;
}

export default function UserProfile({ tasks, habitsCount, goalsCount, profile, onUpdateProfile }: UserProfileProps) {
  // Extract profile properties with safe fallbacks
  const {
    name = "Alex Mercer",
    role = "Principal Crisis Coordinator at Global Tech",
    location = "San Francisco, CA",
    avatarUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250&h=250",
    email = "alex.mercer@globaltech.com",
    phone = "+1 (555) 092-4412",
    timezone = "Pacific Standard Time (PST)",
    twoFactorEnabled = true,
    subscriptionTier = "Priority Executive"
  } = profile || {};

  const [isUrgentMode, setIsUrgentMode] = useState(true);

  // Dynamic Saved Avatars List (Max 4)
  const [avatarsList, setAvatarsList] = useState<string[]>(() => {
    const saved = localStorage.getItem("lm_custom_avatars");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // use default below
      }
    }
    return [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250&h=250",
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250&h=250",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250&h=250",
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250&h=250"
    ];
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"error" | "success">("success");

  const showToast = (message: string, type: "error" | "success" = "success") => {
    setToastMessage(message);
    setToastType(type);
    // Hide toast after 3 seconds
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 3000);
    return timer;
  };

  const updateAvatarsList = (newList: string[]) => {
    setAvatarsList(newList);
    localStorage.setItem("lm_custom_avatars", JSON.stringify(newList));
  };

  const handleRemoveAvatar = (urlToRemove: string) => {
    const newList = avatarsList.filter((url) => url !== urlToRemove);
    updateAvatarsList(newList);
    if (tempAvatarUrl === urlToRemove) {
      setTempAvatarUrl(newList[0] || "");
    }
    showToast("Avatar removed successfully.", "success");
  };

  // Modals visibility states
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);

  // Temporary Edit Form states (which are filled when the modal opens)
  const [tempName, setTempName] = useState(name);
  const [tempRole, setTempRole] = useState(role);
  const [tempLocation, setTempLocation] = useState(location);
  const [tempAvatarUrl, setTempAvatarUrl] = useState(avatarUrl);
  const [tempEmail, setTempEmail] = useState(email);
  const [tempPhone, setTempPhone] = useState(phone);
  const [tempTimezone, setTempTimezone] = useState(timezone);
  const [tempTwoFactorEnabled, setTempTwoFactorEnabled] = useState(twoFactorEnabled);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Workspace Dynamic Stats
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
  const hoursRecovered = (124.5 + completedTasks * 2.5).toFixed(1);
  const totalTasksSaved = 1842 + completedTasks;
  const decisionsAutomated = 412 + (completedTasks * 3) + (habitsCount * 2);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempName.trim()) return;

    let finalAvatarUrl = tempAvatarUrl;

    // Auto-save the new custom avatar to our saved list if not present
    if (finalAvatarUrl && !avatarsList.includes(finalAvatarUrl)) {
      if (avatarsList.length >= 4) {
        showToast("You need to remove an image to add another. Max 4 avatars allowed.", "error");
        return;
      }
      const newList = [...avatarsList, finalAvatarUrl];
      updateAvatarsList(newList);
    }
    
    onUpdateProfile({
      name: tempName,
      role: tempRole,
      location: tempLocation,
      avatarUrl: finalAvatarUrl,
      email: tempEmail,
      phone: tempPhone,
      timezone: tempTimezone,
      twoFactorEnabled: tempTwoFactorEnabled,
      subscriptionTier
    });
    
    setIsEditProfileModalOpen(false);
    showToast("Profile updated successfully!", "success");
  };

  return (
    <div id="user-profile-root" className="w-full max-w-7xl mx-auto font-sans text-slate-800 flex flex-col gap-6 relative">
      
      {/* Profile Header Card */}
      <div className="bg-white border border-slate-200/80 rounded-[28px] p-6 lg:p-8 shadow-sm flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none"></div>

        {/* Profile Card details */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 relative z-10 pr-0 xl:pr-12 w-full xl:w-auto">
          {/* Avatar Photo Frame */}
          <div className="relative group shrink-0">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-1000"></div>
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-cyan-400/80 bg-white flex items-center justify-center shadow-md">
              <img 
                src={avatarUrl} 
                alt={`${name} Avatar`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250&h=250";
                }}
              />
            </div>
          </div>

          <div className="text-center sm:text-left mt-2 sm:mt-0 flex-grow w-full">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 w-full">
              <div className="space-y-1">
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
                  {name}
                </h2>
                <p className="text-slate-500 text-sm">
                  {role}
                </p>
              </div>

              {/* EDIT PROFILE BUTTON */}
              <button 
                onClick={() => {
                  setTempName(name || "");
                  setTempRole(role || "");
                  setTempLocation(location || "");
                  setTempAvatarUrl(avatarUrl || "");
                  setTempEmail(email || "");
                  setTempPhone(phone || "");
                  setTempTimezone(timezone || "Pacific Standard Time (PST)");
                  setTempTwoFactorEnabled(!!twoFactorEnabled);
                  setIsEditProfileModalOpen(true);
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-xl transition-all text-slate-600 hover:text-cyan-600 shadow-sm text-xs font-extrabold w-full sm:w-auto shrink-0 cursor-pointer"
                title="Edit Profile Details"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-4">
              <button 
                onClick={() => setIsUrgentMode(!isUrgentMode)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-300 border ${
                  isUrgentMode 
                    ? "bg-amber-50 border-amber-200 text-amber-700 shadow-sm" 
                    : "bg-slate-50 border-slate-200 text-slate-400"
                }`}
                title="Click to Toggle Urgent Mode"
              >
                <Zap className={`w-3.5 h-3.5 ${isUrgentMode ? "animate-pulse fill-current text-amber-500" : ""}`} />
                {isUrgentMode ? "Urgent Mode Enabled" : "Urgent Mode Disabled"}
              </button>
              
              <span className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-bold text-slate-600 bg-slate-50 border border-slate-200">
                <MapPin className="w-3 h-3 text-cyan-600" />
                {location}
              </span>
            </div>
          </div>
        </div>

        {/* Subscription Panel */}
        <div className="w-full xl:w-auto bg-slate-50 border border-slate-200/60 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between xl:justify-start gap-4 sm:gap-6 shadow-sm shrink-0 relative z-10 xl:self-center">
          <div className="flex items-center gap-3.5">
            <span className="w-11 h-11 bg-cyan-50 text-cyan-600 rounded-xl border border-cyan-100 flex items-center justify-center shadow-inner">
              <Award className="w-6 h-6" />
            </span>
            <div>
              <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Subscription Tier</p>
              <p className="text-sm font-black text-slate-900">{subscriptionTier}</p>
            </div>
          </div>

          <button 
            onClick={() => setIsPlanModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold transition-all text-cyan-700 shadow-sm text-center"
          >
            Manage Plan
          </button>
        </div>

      </div>

      {/* METRICS GRID ROW */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 relative z-10">
        
        {/* AI Hours Recovered (Double-wide) */}
        <div className="md:col-span-2 bg-white border border-slate-200/80 rounded-[24px] p-5 hover:bg-slate-50/50 transition-colors flex flex-col justify-between shadow-sm group">
          <div className="flex justify-between items-start gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Hours Recovered by AI</p>
              <div className="flex items-baseline gap-2 mt-3">
                <span className="text-4xl font-black text-slate-950 tracking-tight">{hoursRecovered}</span>
                <span className="text-xs font-black text-amber-600 flex items-center gap-0.5 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
                  <TrendingUp className="w-3.5 h-3.5" />
                  +12%
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-semibold mt-1">from last month</p>
            </div>
            
            {/* Separate clock icon container on the right side */}
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shrink-0 self-center shadow-inner">
              <Clock className="w-8 h-8 text-cyan-600" />
            </div>
          </div>

          <div className="w-full bg-slate-200 h-1.5 rounded-full mt-6 overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full w-[72%] rounded-full"></div>
          </div>
        </div>

        {/* Total Tasks Saved */}
        <div className="bg-white border border-slate-200/80 rounded-[24px] p-5 hover:bg-slate-50/50 transition-colors shadow-sm group flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center mb-4 shadow-sm">
              <CheckSquare className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Tasks Saved</p>
            <p className="text-2xl font-black text-slate-950 mt-1">{totalTasksSaved.toLocaleString()}</p>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 font-semibold">Lifetime total actions</p>
        </div>

        {/* Decisions Automated */}
        <div className="bg-white border border-slate-200/80 rounded-[24px] p-5 hover:bg-slate-50/50 transition-colors shadow-sm group flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-100 flex items-center justify-center mb-4 shadow-sm">
              <Cpu className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Decisions Automated</p>
            <p className="text-2xl font-black text-slate-950 mt-1">{decisionsAutomated}</p>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 font-semibold">Crisis reduction metric</p>
        </div>

      </div>

      {/* TWO COLUMN DETAILS SECTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
        
        {/* Personal Details Panel */}
        <div className="bg-white border border-slate-200/80 rounded-[28px] p-6 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-5 border-b border-slate-200/60 pb-3">
            Personal Details
          </h3>
          
          <div className="space-y-4">
            
            {/* Email */}
            <div className="flex justify-between items-center bg-white border border-slate-200/60 p-3.5 rounded-xl shadow-sm">
              <div className="flex items-center gap-3">
                <span className="p-2 bg-slate-100 rounded-lg text-slate-500">
                  <Mail className="w-4 h-4" />
                </span>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Email Address</p>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">{email}</p>
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="flex justify-between items-center bg-white border border-slate-200/60 p-3.5 rounded-xl shadow-sm">
              <div className="flex items-center gap-3">
                <span className="p-2 bg-slate-100 rounded-lg text-slate-500">
                  <Phone className="w-4 h-4" />
                </span>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Emergency Contact</p>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">{phone}</p>
                </div>
              </div>
            </div>

            {/* Timezone */}
            <div className="flex justify-between items-center bg-white border border-slate-200/60 p-3.5 rounded-xl shadow-sm">
              <div className="flex items-center gap-3">
                <span className="p-2 bg-slate-100 rounded-lg text-slate-500">
                  <Globe className="w-4 h-4" />
                </span>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Global Sync Timezone</p>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">{timezone}</p>
                </div>
              </div>
            </div>

            {/* 2FA */}
            <div className="flex justify-between items-center bg-white border border-slate-200/60 p-3.5 rounded-xl shadow-sm">
              <div className="flex items-center gap-3">
                <span className="p-2 bg-slate-100 rounded-lg text-slate-500">
                  <Shield className="w-4 h-4" />
                </span>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Two-Factor Auth</p>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">
                    {twoFactorEnabled ? "Enabled (Authenticator App)" : "Disabled (Not Secure)"}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* System Performance Panel */}
        <div className="bg-white border border-slate-200/80 rounded-[28px] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-5 border-b border-slate-200/60 pb-3">
              System Performance
            </h3>

            <div className="space-y-4">
              
              {/* Metric 1 */}
              <div>
                <div className="flex justify-between items-center mb-1.5 text-xs">
                  <span className="text-slate-500 font-bold">AI Response Accuracy</span>
                  <span className="font-black text-cyan-600">98.2%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full" style={{ width: '98.2%' }}></div>
                </div>
              </div>

              {/* Metric 2 */}
              <div>
                <div className="flex justify-between items-center mb-1.5 text-xs">
                  <span className="text-slate-500 font-bold">Deadline Reliability</span>
                  <span className="font-black text-amber-600">94.0%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '94%' }}></div>
                </div>
              </div>

              {/* Metric 3 */}
              <div>
                <div className="flex justify-between items-center mb-1.5 text-xs">
                  <span className="text-slate-500 font-bold">Crisis Prevention Rate</span>
                  <span className="font-black text-emerald-600">82.0%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '82%' }}></div>
                </div>
              </div>

            </div>
          </div>

          {/* Alert Box */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 items-start mt-6">
            <span className="text-amber-600 shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </span>
            <p className="text-xs text-amber-800 font-medium leading-relaxed">
              Subscription renewal in 3 days. Ensure payment methods are updated.
            </p>
          </div>

        </div>

      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditProfileModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-6 my-8 shadow-2xl text-slate-800 relative max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-6 shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-600" />
                <h4 className="font-black text-lg text-slate-950">Edit Profile Credentials</h4>
              </div>
              <button 
                onClick={() => setIsEditProfileModalOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5 overflow-y-auto pr-1 flex-grow">
              
              {/* Preset Avatars Selection Row */}
              <div>
                <label className="block text-xs font-black uppercase text-slate-400 tracking-wider mb-2.5">
                  Saved Avatars (Max 4)
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {avatarsList.map((url, index) => {
                    const isSelected = tempAvatarUrl === url;
                    return (
                      <div key={url} className="relative group aspect-square">
                        <button
                          type="button"
                          onClick={() => setTempAvatarUrl(url)}
                          className={`relative w-full h-full rounded-xl overflow-hidden border-2 transition-all ${
                            isSelected ? "border-cyan-500 scale-105 shadow-md" : "border-slate-200 hover:border-slate-300"
                          }`}
                          title={`Saved Avatar ${index + 1}`}
                        >
                          <img src={url} alt={`Saved Avatar ${index + 1}`} className="w-full h-full object-cover" />
                          {isSelected && (
                            <div className="absolute inset-0 bg-cyan-600/10 flex items-center justify-center text-white">
                              <span className="p-1 bg-cyan-600 rounded-full">
                                <Check className="w-3 h-3 text-white stroke-[3]" />
                              </span>
                            </div>
                          )}
                        </button>
                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveAvatar(url);
                          }}
                          className="absolute -top-1.5 -right-1.5 p-1 bg-rose-500 hover:bg-rose-600 text-white rounded-full transition-all shadow-md hover:scale-110 active:scale-95 z-20 cursor-pointer"
                          title="Remove Avatar"
                        >
                          <X className="w-2.5 h-2.5 stroke-[3]" />
                        </button>
                      </div>
                    );
                  })}
                  {avatarsList.length === 0 && (
                    <div className="col-span-4 py-4 text-center border border-dashed border-slate-200 rounded-xl">
                      <p className="text-xs font-bold text-slate-400">No saved avatars. Upload an image below!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Custom Image Preview Container */}
              {tempAvatarUrl && !avatarsList.includes(tempAvatarUrl) && (
                <div className="p-3 bg-cyan-50/50 border border-cyan-100 rounded-2xl flex items-center gap-3 animate-fade-in shrink-0">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-cyan-500 shrink-0 shadow-sm">
                    <img src={tempAvatarUrl} alt="Pending Preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-[11px] font-black text-slate-800 truncate">Custom Avatar Preview</p>
                    <p className="text-[9px] text-cyan-600 font-bold leading-normal">This image will be saved to your avatar list when you click Save.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTempAvatarUrl(avatarsList[0] || "")}
                    className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    title="Clear Custom Preview"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Profile Image Source */}
              <div className="space-y-3">
                <label className="block text-xs font-black uppercase text-slate-400 tracking-wider">
                  Profile Image Source
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* File Uploader Container */}
                  <div 
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file && file.type.startsWith("image/")) {
                        if (avatarsList.length >= 4) {
                          showToast("You need to remove an image to add another. Max 4 avatars allowed.", "error");
                          return;
                        }
                        const reader = new FileReader();
                        reader.onload = () => {
                          if (typeof reader.result === "string") {
                            setTempAvatarUrl(reader.result);
                            showToast("Image loaded preview. Save profile to add to list.", "success");
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                      isDragging 
                        ? "border-cyan-500 bg-cyan-50/40 text-cyan-600" 
                        : "border-slate-200 hover:border-slate-300 text-slate-400"
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (avatarsList.length >= 4) {
                            showToast("You need to remove an image to add another. Max 4 avatars allowed.", "error");
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = () => {
                            if (typeof reader.result === "string") {
                              setTempAvatarUrl(reader.result);
                              showToast("Image loaded preview. Save profile to add to list.", "success");
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      accept="image/*" 
                      className="hidden" 
                    />
                    <Camera className="w-6 h-6 mb-1 text-slate-400" />
                    <p className="text-[11px] font-bold text-slate-700">Upload from Device</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">Drag & drop or click to browse</p>
                  </div>

                  {/* URL Input Container */}
                  <div className="flex flex-col justify-center">
                    <p className="text-[10px] font-bold text-slate-500 mb-1.5">Or Paste Image URL</p>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <Globe className="w-3.5 h-3.5" />
                      </span>
                      <input
                        type="url"
                        value={(typeof tempAvatarUrl === "string" && tempAvatarUrl.startsWith("data:")) ? "" : (tempAvatarUrl || "")}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val && !avatarsList.includes(val) && avatarsList.length >= 4) {
                            showToast("You need to remove an image to add another. Max 4 avatars allowed.", "error");
                            return;
                          }
                          setTempAvatarUrl(val);
                        }}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-inner"
                      />
                    </div>
                    {typeof tempAvatarUrl === "string" && tempAvatarUrl.startsWith("data:") && (
                      <p className="text-[9px] text-cyan-600 font-bold mt-1.5 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Custom uploaded file active
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Name & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none transition-all shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 tracking-wider mb-1.5">
                    Professional Role
                  </label>
                  <input
                    type="text"
                    required
                    value={tempRole}
                    onChange={(e) => setTempRole(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* Location & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 tracking-wider mb-1.5">
                    Location
                  </label>
                  <input
                    type="text"
                    required
                    value={tempLocation}
                    onChange={(e) => setTempLocation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none transition-all shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={tempEmail}
                    onChange={(e) => setTempEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* Phone & Timezone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 tracking-wider mb-1.5">
                    Emergency Contact
                  </label>
                  <input
                    type="text"
                    required
                    value={tempPhone}
                    onChange={(e) => setTempPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none transition-all shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 tracking-wider mb-1.5">
                    Global Timezone
                  </label>
                  <select
                    value={tempTimezone}
                    onChange={(e) => setTempTimezone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none transition-all shadow-inner"
                  >
                    <option value="Pacific Standard Time (PST)">PST (UTC-8)</option>
                    <option value="Eastern Standard Time (EST)">EST (UTC-5)</option>
                    <option value="Coordinated Universal Time (UTC)">UTC</option>
                    <option value="Central European Time (CET)">CET (UTC+1)</option>
                    <option value="Indian Standard Time (IST)">IST (UTC+5.5)</option>
                  </select>
                </div>
              </div>

              {/* Security Settings */}
              <div className="border-t border-slate-100 pt-4">
                <label className="block text-xs font-black uppercase text-slate-400 tracking-wider mb-2.5">
                  Security Settings
                </label>
                <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-3 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-4 h-4 text-cyan-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">Two-Factor Authentication</p>
                      <p className="text-[10px] text-slate-400">Secure your session with an authenticator app</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTempTwoFactorEnabled(!tempTwoFactorEnabled)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      tempTwoFactorEnabled ? 'bg-cyan-600' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        tempTwoFactorEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="mt-6 flex gap-3 justify-end text-xs pt-2">
                <button 
                  type="button"
                  onClick={() => setIsEditProfileModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-black rounded-xl transition-all shadow-md shadow-cyan-950/20"
                >
                  Save Credentials
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* PLAN MANAGEMENT MODAL */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 shadow-2xl text-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-cyan-600" />
                <h4 className="font-black text-base text-slate-950">Billing & Plan Matrix</h4>
              </div>
              <button 
                onClick={() => setIsPlanModalOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Manage your high-priority decision tier configuration. Updates reflect on global scheduling thresholds.
            </p>

            <div className="space-y-3">
              {/* Priority Executive Plan */}
              <div className="bg-cyan-50/50 border border-cyan-200 p-4 rounded-xl flex justify-between items-center">
                <div>
                  <span className="text-[9px] bg-cyan-600 text-white font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Current Active
                  </span>
                  <h5 className="font-bold text-sm text-slate-950 mt-1.5">Priority Executive</h5>
                  <p className="text-[10px] text-slate-500 mt-0.5">Unlimited automated conflict rescue • 24/7 client dispatch</p>
                </div>
                <span className="text-sm font-black text-slate-950">$49<span className="text-[10px] text-slate-500">/mo</span></span>
              </div>

              {/* Standard Tier */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex justify-between items-center hover:bg-slate-100/50 hover:border-slate-300 transition-all cursor-pointer">
                <div>
                  <h5 className="font-bold text-sm text-slate-700">Autopilot Associate</h5>
                  <p className="text-[10px] text-slate-500 mt-0.5">15 rescued deadlines • Weekly diagnostic analysis reports</p>
                </div>
                <span className="text-sm font-black text-slate-700">$19<span className="text-[10px] text-slate-500">/mo</span></span>
              </div>
            </div>

            <div className="mt-6 flex gap-3 justify-end text-xs">
              <button 
                onClick={() => setIsPlanModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors font-bold text-slate-700"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  onUpdateProfile({
                    ...profile,
                    subscriptionTier: "Priority Executive"
                  });
                  setIsPlanModalOpen(false);
                }}
                className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-black rounded-xl transition-all shadow-md shadow-cyan-950/20"
              >
                Sync Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Alert */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-2.5 px-4 py-3 rounded-2xl border shadow-2xl transition-all duration-300 animate-bounce ${
          toastType === "error" 
            ? "bg-rose-50 border-rose-100 text-rose-900 shadow-rose-950/5" 
            : "bg-cyan-50 border-cyan-100 text-cyan-900 shadow-cyan-950/5"
        }`}>
          <AlertTriangle className={`w-4 h-4 ${toastType === "error" ? "text-rose-600" : "text-cyan-600"}`} />
          <span className="text-xs font-black">{toastMessage}</span>
        </div>
      )}

    </div>
  );
}

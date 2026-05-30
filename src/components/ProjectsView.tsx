import React, { useState, useEffect } from "react";
import { useMeetLog } from "../context/MeetingContext";
import { Folder, FolderPlus, Trash2, Tag, Clock, Calendar, ChevronRight, X, Sparkles, TrendingUp, Smile, Heart, Brain, AlertCircle, Sparkle, FileUp, Plus } from "lucide-react";
import { Project, Meeting } from "../types";

export default function ProjectsView() {
  const { projects, meetings, addProject, deleteProject, setSelectedMeetingId, handleDirectAudioImport } = useMeetLog();

  // Create Project Folder Form
  const [newProjName, setNewProjName] = useState("");
  const [newProjColor, setNewProjColor] = useState("amber");
  const [newProjDesc, setNewProjDesc] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // Filter/Browsing state
  const [browsingProjectName, setBrowsingProjectName] = useState<string | null>(null);
  const [synthesisMode, setSynthesisMode] = useState<"executive" | "psychology">("executive");
  const [isCbtActive, setIsCbtActive] = useState<boolean>(true);

  useEffect(() => {
    if (!browsingProjectName) {
      setIsCbtActive(false);
      return;
    }
    const cbtEnabled = localStorage.getItem("meetlog-cbt-enabled") !== "false";
    const savedProjectsStr = localStorage.getItem("meetlog-cbt-projects");
    const cbtProjects = savedProjectsStr ? JSON.parse(savedProjectsStr) : ["Personal"];
    
    const active = cbtEnabled && cbtProjects.includes(browsingProjectName);
    setIsCbtActive(active);
    
    if (!active && synthesisMode === "psychology") {
      setSynthesisMode("executive");
    }
  }, [browsingProjectName]);

  const getMeetingsForProject = (projName: string) => {
    return meetings.filter((m) => m.project === projName);
  };

  const getAccumulatedDuration = (projMeetings: Meeting[]) => {
    const totalSec = projMeetings.reduce((acc, curr) => acc + curr.durationSec, 0);
    const totalMin = Math.round(totalSec / 60);
    return `${totalMin}m`;
  };

  const COLOR_OPTIONS = [
    { id: "amber", label: "Clay", class: "bg-[#c2b29f]" },
    { id: "violet", label: "Purple", class: "bg-violet-500" },
    { id: "pink", label: "Pink", class: "bg-pink-500" },
    { id: "cyan", label: "Teal", class: "bg-cyan-500" },
    { id: "bone", label: "Bone", class: "bg-brand-cream border border-stone-300" }
  ];

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim()) return;

    const newProject: Project = {
      id: `proj_${Date.now()}`,
      name: newProjName.trim(),
      color: newProjColor,
      description: newProjDesc.trim() || undefined
    };

    addProject(newProject);
    setNewProjName("");
    setNewProjDesc("");
    setShowAddForm(false);
  };

  const handleDeleteProj = (id: string, name: string) => {
    if (name === "General Discussions") {
      alert("The General folder is pre-locked by default and cannot be deleted.");
      return;
    }
    const filteredMeetingsCount = getMeetingsForProject(name).length;
    if (filteredMeetingsCount > 0) {
      if (!confirm(`This project is associated with ${filteredMeetingsCount} meeting(s). Deleting this folder keeps meetings safe but moves them to default directories. Continue?`)) {
        return;
      }
    }
    deleteProject(id);
  };

  const getProjectBorderColor = (color: string) => {
    const bordersMap: Record<string, string> = {
      amber: "border-l-[#c2b29f]",
      emerald: "border-l-[#c2b29f]",
      violet: "border-l-violet-500",
      pink: "border-l-pink-500",
      cyan: "border-l-cyan-500",
      bone: "border-l-brand-cream",
    };
    return bordersMap[color] || "border-l-brand-gold";
  };

  const onFileImportClick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !browsingProjectName) return;
    await handleDirectAudioImport(file, browsingProjectName);
  };

  return (
    <div className="pb-28 pt-4 px-4 max-w-xl mx-auto space-y-6" id="projects-manager-view">
      {/* View Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-brand-green dark:text-[#EEF0EA]">
            Parley <span className="text-brand-green dark:text-brand-gold-bright">Folders</span>
          </h1>
          <p className="text-xs text-brand-green/70 dark:text-brand-cream/60 mt-0.5">
            Organize recordings cleanly by client or topic scope
          </p>
        </div>

        {!browsingProjectName && !showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            id="proj-create-trigger-btn"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-brand-cream hover:bg-[#eae0d2] text-stone-900 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer border border-stone-300"
          >
            <FolderPlus size={14} /> Create Folder
          </button>
        )}
      </div>

      {showAddForm && (
        /* Create Project Folder Form Box */
        <div className="bg-white dark:bg-brand-green-dark/80 border border-brand-green/10 dark:border-brand-gold/15 rounded-2xl p-4 space-y-4" id="proj-add-form-container">
          <div className="flex items-center justify-between pb-2 border-b border-brand-green/10 dark:border-brand-gold/10">
            <h3 className="text-xs uppercase font-extrabold tracking-widest text-brand-green dark:text-[#EEF0EA]">New Group Folder</h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-brand-green/40 hover:text-brand-green dark:text-brand-cream/40 dark:hover:text-brand-cream transition-colors"
            >
              <X size={15} />
            </button>
          </div>

          <form onSubmit={handleCreateProject} className="space-y-3.5">
            {/* Folder Name */}
            <div className="space-y-1">
              <label htmlFor="folder-name-input" className="text-xs font-medium text-brand-green/70 dark:text-brand-cream/70">Folder Name</label>
              <input
                id="folder-name-input"
                type="text"
                placeholder="e.g. Design Tokens, Quarter Syncs"
                value={newProjName}
                onChange={(e) => setNewProjName(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs bg-white/70 dark:bg-brand-green-dark/60 border border-brand-green/10 dark:border-brand-gold/15 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-gold text-brand-green dark:text-[#EEF0EA] font-medium"
              />
            </div>

            {/* Folder Description */}
            <div className="space-y-1">
              <label htmlFor="folder-desc-input" className="text-xs font-medium text-brand-green/70 dark:text-brand-cream/70">Brief Overview (Optional)</label>
              <input
                id="folder-desc-input"
                type="text"
                placeholder="e.g. Weekly client reviews and draft design assets discussions"
                value={newProjDesc}
                onChange={(e) => setNewProjDesc(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white/70 dark:bg-brand-green-dark/60 border border-brand-green/10 dark:border-brand-gold/15 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-gold text-brand-green dark:text-[#EEF0EA] font-medium"
              />
            </div>

            {/* Accent Theme Selection */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-brand-green/70 dark:text-brand-cream/70">Accent Color Label</label>
              <div className="flex gap-2.5 pt-1">
                {COLOR_OPTIONS.map((col) => (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => setNewProjColor(col.id)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${col.class} ${
                      newProjColor === col.id ? "ring-2 ring-brand-gold scale-110 shadow-md" : "opacity-70 hover:opacity-100"
                    }`}
                  >
                    {newProjColor === col.id && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-4 py-2 text-xs font-extrabold bg-brand-cream hover:bg-[#eae0d2] text-stone-900 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer border border-stone-300"
              >
                Create Group
              </button>
            </div>
          </form>
        </div>
      )}

      {browsingProjectName ? (
        /* BROWSING SPECIFIC PROJECT VIEW LIST with AI Synthesis Hub */
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-brand-green/10 dark:border-brand-gold/10 pb-3">
            <button
               onClick={() => setBrowsingProjectName(null)}
               className="flex items-center gap-1 text-xs text-brand-green/60 dark:text-brand-cream/60 hover:text-brand-green dark:hover:text-brand-cream font-bold cursor-pointer"
            >
              <X size={14} /> Cancel browsing
            </button>
            <span className="text-xs font-extrabold tracking-tight text-stone-900 dark:text-stone-900 bg-brand-cream px-3 py-1 rounded-full border border-stone-300 shadow-sm">
              Active: {browsingProjectName}
            </span>
          </div>

          {/* Direct File Upload to Folder */}
          <div className="border border-dashed border-brand-green/15 dark:border-brand-gold/20 p-4 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 bg-white/30 dark:bg-brand-green-dark/40 shadow-sm print:hidden animate-fadeIn" id="audio-importer-folder-direct">
            <div className="p-2.5 rounded-full bg-brand-cream text-stone-800 dark:text-brand-cream border border-stone-300">
              <FileUp size={16} />
            </div>
            <div>
              <h5 className="text-xs font-extrabold text-brand-green dark:text-[#EEF0EA]">Import recording to this folder</h5>
              <p className="text-[10px] text-brand-green/60 dark:text-brand-cream/60 leading-relaxed max-w-xs mt-0.5">
                Load search-ready meeting records straight into <strong className="font-bold text-brand-green dark:text-brand-cream">"{browsingProjectName}"</strong> for immediate transcription and AI insights.
              </p>
            </div>
            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-green hover:bg-[#152a1b] dark:bg-brand-cream dark:hover:bg-[#eae0d2] text-brand-cream dark:text-stone-900 rounded-xl text-[10px] font-black tracking-wide uppercase transition-colors cursor-pointer select-none">
              <Plus size={11} className="stroke-[3]" />
              <span>Choose Audio File</span>
              <input
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={onFileImportClick}
                id="import-meeting-audio-input-folder"
              />
            </label>
          </div>

          {/* FOLDER SYNTHESIS BENTO CONTAINER */}
          {getMeetingsForProject(browsingProjectName).length > 0 ? (
            <div className="bg-white dark:bg-brand-green-dark/80 border border-brand-green/10 dark:border-brand-gold/15 rounded-3xl p-5 space-y-4 shadow-sm" id="folder-synthesis-hub">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-brand-green/10 dark:border-brand-gold/10">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Sparkles size={15} className="text-brand-gold animate-pulse" />
                    <h3 className="text-xs uppercase font-extrabold tracking-widest text-brand-green dark:text-[#EEF0EA]">
                      Folder AI Synthesis Hub
                    </h3>
                  </div>
                  <p className="text-[10px] text-brand-green/60 dark:text-brand-cream/60">Cross-meeting trends, sentiment, & relational dynamics</p>
                </div>

                {/* Sub-tab Switchers - Executive vs CBT Therapist */}
                {isCbtActive && (
                  <div className="flex bg-brand-green/5 dark:bg-brand-green-dark/60 p-0.5 rounded-xl border border-brand-green/10 dark:border-brand-gold/10 shrink-0">
                    <button
                      onClick={() => setSynthesisMode("executive")}
                      className={`px-3 py-1 text-[10px] uppercase font-extrabold rounded-lg transition-all ${
                        synthesisMode === "executive"
                          ? "bg-white dark:bg-brand-green-dark text-stone-900 dark:text-brand-cream shadow-sm"
                          : "text-brand-green/60 hover:text-brand-green dark:text-brand-cream/50 dark:hover:text-brand-cream"
                      }`}
                    >
                      Executive Trends
                    </button>
                    <button
                      onClick={() => setSynthesisMode("psychology")}
                      className={`px-3 py-1 text-[10px] uppercase font-extrabold rounded-lg transition-all flex items-center gap-1 ${
                        synthesisMode === "psychology"
                          ? "bg-white dark:bg-brand-green-dark text-[#c2b29f] dark:text-brand-cream shadow-sm font-black"
                          : "text-brand-green/60 hover:text-[#c2b29f] dark:text-brand-cream/50"
                      }`}
                    >
                      <Brain size={11} /> CBT Therapist
                    </button>
                  </div>
                )}
              </div>

              {synthesisMode === "executive" ? (
                /* EXECUTIVE SYNC TREND PANEL */
                <div className="space-y-4 animate-fadeIn" id="folder-executive-trends">
                  {/* Metric Block */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-white dark:bg-brand-green-dark/50 p-3.5 rounded-2xl border border-brand-green/10 dark:border-brand-gold/10 space-y-2">
                       <span className="text-[9px] font-mono tracking-wider font-extrabold text-brand-green/50 dark:text-brand-cream/50 uppercase">Alignment Level</span>
                       <div className="flex items-baseline gap-1.5">
                         <span className="text-2xl font-black text-brand-green dark:text-[#EEF0EA]">84%</span>
                         <span className="text-[10px] text-brand-green/60 dark:text-brand-cream/60 font-bold">Stable Convergence</span>
                       </div>
                       <div className="w-full h-1.5 bg-brand-green/10 dark:bg-brand-green-dark/60 rounded-full overflow-hidden">
                         <div className="h-full bg-brand-gold rounded-full" style={{ width: "84%" }} />
                       </div>
                    </div>

                    <div className="bg-white dark:bg-brand-green-dark/50 p-3.5 rounded-2xl border border-brand-green/10 dark:border-brand-gold/10 space-y-2">
                      <span className="text-[9px] font-mono tracking-wider font-extrabold text-brand-green/50 dark:text-brand-cream/50 uppercase">Aggregated Sentiment</span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-black text-brand-gold dark:text-brand-cream">Optimal</span>
                        <span className="text-[10px] text-brand-green/60 dark:text-brand-cream/60 font-bold">Collaborative Warmth</span>
                      </div>
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className={`h-1.5 flex-1 rounded-full ${i < 4 ? "bg-brand-gold" : "bg-brand-green/10 dark:bg-brand-green-dark/60"}`} />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Vocal Tone Shifts section */}
                  <div className="space-y-2 p-3.5 bg-white dark:bg-brand-green-dark/40 rounded-2xl border border-brand-green/10 dark:border-brand-gold/10">
                    <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-brand-green dark:text-[#EEF0EA] flex items-center gap-1.5">
                      <TrendingUp size={12} className="text-brand-gold" />
                      Vocal Tone Over-Time Evolution
                    </h4>
                    <p className="text-xs text-brand-green/70 dark:text-brand-cream/70 leading-relaxed font-normal">
                      Vocal pitch checks show a notable stabilizing shift. In early sessions of this directory, we detected average vocal tempo at <strong>148 words per minute (WPM) with higher micro-frequency volume spikes</strong> (indicative of subtle conversational interrupts, timeline pressure and stress). Recent recordings show deceleration to a calm, secure <strong>122 WPM with elongated pauses, matching mutual agreement nodes</strong>.
                    </p>
                  </div>

                  {/* Inter-session strategic misalignments */}
                  <div className="space-y-2.5 p-3.5 bg-white dark:bg-brand-green-dark/40 rounded-2xl border border-brand-green/10 dark:border-brand-gold/10">
                    <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-brand-green dark:text-[#EEF0EA] flex items-center gap-1.5">
                      <AlertCircle size={12} className="text-rose-500" />
                      Strategic Misalignments Plotted
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 bg-brand-green/5 dark:bg-brand-green-dark/60 rounded-xl border-l-2 border-brand-gold font-semibold text-brand-green dark:text-[#EEF0EA]">
                        <div className="text-[9px] text-brand-gold uppercase tracking-wider font-mono">Velocity vs Burnout Threshold</div>
                        Sarah prioritizes fast operational iteration (35% speak share emphasizing timelines), whereas physical fatigue and social recharge barriers were flagged on John's side.
                      </div>
                      <div className="p-2.5 bg-brand-green/5 dark:bg-brand-green-dark/60 rounded-xl border-l-2 border-brand-gold font-semibold text-brand-green dark:text-[#EEF0EA]">
                        <div className="text-[9px] text-brand-gold uppercase tracking-wider font-mono">External Boundaring Anxiety</div>
                        Friction points are triggered during family appointment scheduling delays, revealing minor unshared assumptions about how leisure time should be ring-fenced.
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* COGNITIVE BEHAVIORAL THERAPIST/PSYCHOLOGIST FOLDER EVALUATION */
                <div className="space-y-4 animate-fadeIn" id="folder-psychology-trends">
                  {/* Relational Summary */}
                  <div className="bg-brand-gold/5 border border-brand-gold/20 dark:border-brand-gold/15 p-4 rounded-2xl space-y-2">
                    <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-brand-gold dark:text-brand-cream flex items-center gap-1.5 font-mono">
                      <Heart size={12} />
                      Therapist's Aggregate Directory Diagnosis
                    </h4>
                    <p className="text-xs text-brand-green/80 dark:text-brand-cream/80 leading-relaxed italic pr-2 font-medium">
                      "Analyzing the combined language in this folder reveals a highly cooperative dyad that is vulnerable to burnout. A core pattern manifests where both parties adopt an 'All-or-Nothing' frame when discussing resource allocation. Underneath scheduling stress lies a subtle fearful-avoidant loop: John deflects via intellectual scheduling logic, while Sarah over-steps boundaries to enforce safety. The core therapeutic prescription is practicing the 'Emotional Safety Hold'—slowing conversational momentum and validating the underlying emotional exhaustion before attempting logistics."
                    </p>
                  </div>

                  {/* Interpersonal Distortions Grid */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-mono tracking-wider font-bold text-brand-green/50 dark:text-brand-cream/50 uppercase">Prevalent Interaction Traps</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                      <div className="bg-white dark:bg-brand-green-dark/50 p-3 rounded-xl border border-brand-green/10 dark:border-brand-gold/10">
                        <span className="font-extrabold text-brand-gold dark:text-brand-cream">1. Polarized Timelines</span>
                        <p className="text-[10px] text-brand-green/60 dark:text-brand-cream/60 mt-1 leading-normal">
                          Configuring schedules as either "entirely ruined" or "completely perfect". Ignores middle-tier compromise levels.
                        </p>
                      </div>
                      <div className="bg-white dark:bg-brand-green-dark/50 p-3 rounded-xl border border-brand-green/10 dark:border-brand-gold/10">
                        <span className="font-extrabold text-brand-gold dark:text-brand-cream">2. Deflective Intellectualization</span>
                        <p className="text-[10px] text-brand-green/60 dark:text-brand-cream/60 mt-1 leading-normal">
                          Retreating into calendar analytics or project metrics as a defense mechanism to avoid stating direct feelings of exhaustion.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Attachment Styles Plotted */}
                  <div className="flex items-center justify-between p-3.5 bg-white dark:bg-brand-green-dark/40 rounded-xl border border-brand-green/10 dark:border-brand-gold/10 text-xs">
                    <div>
                      <span className="text-[9px] font-mono text-brand-green/50 dark:text-brand-cream/50 uppercase block">dyad attachment pattern</span>
                      <span className="font-extrabold text-brand-green dark:text-[#EEF0EA]">Secure co-regulation (under strain)</span>
                    </div>
                    <span className="text-[10px] bg-brand-cream text-stone-900 border border-stone-300 px-2.5 py-0.5 rounded-full font-bold">
                      Resilient
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-brand-gold/5 border border-brand-gold/15 dark:border-brand-gold/10 rounded-2xl p-5 text-center space-y-2 animate-fadeIn">
              <Sparkle size={18} className="text-brand-gold mx-auto animate-spin" />
              <p className="text-xs text-brand-green/70 dark:text-brand-cream/70 italic font-medium">
                Awaiting folder conversations to initiate psychological trend mapping. Once session recordings are category-allocated here, our AI synthesis engine will plot long-term trends!
              </p>
            </div>
          )}

          {/* SESSIONS DIRECTORY LIST */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-extrabold tracking-widest text-brand-green/60 dark:text-brand-cream/60">
              Meetings in Folder ({getMeetingsForProject(browsingProjectName).length})
            </h4>

            <div className="space-y-3.5">
              {getMeetingsForProject(browsingProjectName).length > 0 ? (
                getMeetingsForProject(browsingProjectName).map((mt) => (
                  <div
                    key={mt.id}
                    onClick={() => setSelectedMeetingId(mt.id)}
                    className="flex justify-between items-center p-3 border border-brand-green/10 dark:border-brand-gold/15 bg-white dark:bg-brand-green-dark/80 rounded-xl hover:shadow-sm hover:border-brand-green/25 dark:hover:border-brand-gold/30 transition-all cursor-pointer"
                  >
                    <div className="space-y-1 max-w-[80%]">
                      <h4 className="text-xs md:text-sm font-bold text-brand-green dark:text-[#EEF0EA] truncate">
                        {mt.title}
                      </h4>
                      <p className="text-[11px] text-brand-green/50 dark:text-brand-cream/50 flex items-center gap-3">
                        <span>{new Date(mt.date).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{Math.round(mt.durationSec / 60)} min track duration</span>
                      </p>
                    </div>
                    <ChevronRight size={16} className="text-brand-green/40 dark:text-brand-cream/40" />
                  </div>
                ))
              ) : (
                <p className="text-xs text-brand-green/50 dark:text-brand-cream/50 italic py-8 text-center bg-brand-green/5 dark:bg-brand-green-dark/60 rounded-2xl border border-dashed border-brand-green/10 dark:border-brand-gold/15">No meeting recordings categorized under this folder yet.</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* OVERVIEW DASHBOARD FOLDERS Bento List */
        <div className="grid grid-cols-1 gap-4" id="projects-bento">
          {projects.map((proj) => {
            const projMeetings = getMeetingsForProject(proj.name);
            const totalCount = projMeetings.length;
            const durationAcc = getAccumulatedDuration(projMeetings);

            return (
              <div
                key={proj.id}
                className={`bg-white dark:bg-brand-green-dark/80 border border-brand-green/10 dark:border-brand-gold/15 p-4 rounded-3xl flex justify-between items-start gap-4 hover:shadow-md transition-all border-l-4 ${getProjectBorderColor(
                  proj.color
                )}`}
              >
                <div className="space-y-2 flex-grow">
                  <div className="flex items-center gap-2">
                    <Folder className={`${
                      proj.color === "amber" ? "text-[#c2b29f]" :
                      proj.color === "violet" ? "text-violet-500" :
                      proj.color === "pink" ? "text-pink-500" :
                      proj.color === "cyan" ? "text-cyan-500" :
                      "text-brand-gold"
                    } stroke-[2.3px]`} size={18} />
                    <h3 className="text-sm font-extrabold text-brand-green dark:text-[#EEF0EA]">{proj.name}</h3>
                  </div>

                  {proj.description && (
                    <p className="text-[11px] text-brand-green/60 dark:text-brand-cream/60 leading-snug line-clamp-2">
                      {proj.description}
                    </p>
                  )}

                  <div className="flex gap-4 pt-1 text-[11px] text-brand-green/60 dark:text-brand-cream/60 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} className="text-brand-green/40 dark:text-brand-cream/40" />
                      {totalCount} Note{totalCount !== 1 ? "s" : ""}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} className="text-brand-green/40 dark:text-brand-cream/40" />
                      {durationAcc} total recording time
                    </span>
                  </div>
                </div>

                {/* Open/Delete utility action buttons */}
                <div className="flex flex-col items-end gap-2.5 print:hidden shrink-0">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setBrowsingProjectName(proj.name)}
                      className="px-2.5 py-1.5 text-[10px] font-black tracking-wide uppercase text-brand-cream bg-brand-green hover:bg-[#152a1b] dark:bg-brand-cream dark:hover:bg-[#eae0d2] dark:text-stone-900 rounded-lg transition-colors active:scale-95 cursor-pointer"
                    >
                      Browse
                    </button>
                    
                    <label className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-black tracking-wide uppercase text-brand-green/70 bg-brand-green/5 hover:bg-brand-green/10 dark:bg-brand-green-dark/60 dark:text-brand-cream/70 dark:hover:bg-brand-green-dark/80 rounded-lg transition-colors cursor-pointer select-none">
                      <FileUp size={11} className="stroke-[2.5]" />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="audio/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            await handleDirectAudioImport(file, proj.name);
                          }
                        }}
                      />
                    </label>
                  </div>

                  <button
                    onClick={() => handleDeleteProj(proj.id, proj.name)}
                    className="p-1 rounded text-brand-green/30 hover:text-red-500 dark:text-brand-cream/30 dark:hover:text-red-400 transition-colors self-end mr-1"
                    title="Delete group folder"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import React, { useState } from "react";
import { useMeetLog } from "../context/MeetingContext";
import { Folder, FolderPlus, Trash2, Tag, Clock, Calendar, ChevronRight, X, Sparkles, TrendingUp, FileUp, Plus, Users, CheckSquare, ArrowLeft, MessageSquare } from "lucide-react";
import { Project, Meeting } from "../types";

/**
 * Dedicated AI Synthesis sub-page for a folder. Everything here is computed
 * live from the folder's real meetings — participants, tags, action items,
 * decisions, conversation types, collected insights. No placeholder content.
 * Kept off the main folder view so it doesn't crowd the UI while we learn
 * whether it earns its place.
 */
function FolderSynthesisPage({
  folderName,
  meetings,
  onBack,
  onOpenMeeting,
}: {
  folderName: string;
  meetings: Meeting[];
  onBack: () => void;
  onOpenMeeting: (id: string) => void;
}) {
  const conversationCount = meetings.length;
  const totalMin = Math.round(meetings.reduce((a, m) => a + (m.durationSec || 0), 0) / 60);

  const peopleMap = new Map<string, number>();
  meetings.forEach((m) =>
    (m.participantsInfo || []).forEach((p) => {
      const n = (p.name || "").trim();
      if (!n || (p.role || "").toLowerCase() === "owner") return;
      peopleMap.set(n, (peopleMap.get(n) || 0) + 1);
    })
  );
  const people = [...peopleMap.entries()].sort((a, b) => b[1] - a[1]);

  const tagMap = new Map<string, number>();
  meetings.forEach((m) => (m.tags || []).forEach((t) => tagMap.set(t, (tagMap.get(t) || 0) + 1)));
  const topTags = [...tagMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
  const maxTag = topTags.length ? topTags[0][1] : 1;

  let openAI = 0;
  let doneAI = 0;
  meetings.forEach((m) => (m.actionItems || []).forEach((a) => (a.completed ? doneAI++ : openAI++)));
  const totalAI = openAI + doneAI;

  const decisionsCount = meetings.reduce((a, m) => a + (m.decisions?.length || 0), 0);

  const typeMap = new Map<string, number>();
  meetings.forEach((m) => {
    const t = m.classification?.primary;
    if (t) typeMap.set(t, (typeMap.get(t) || 0) + 1);
  });
  const types = [...typeMap.entries()].sort((a, b) => b[1] - a[1]);

  const insights = meetings.flatMap((m) => (m.insights || []).map((text) => ({ text, title: m.title, id: m.id })));

  const stat = (label: string, value: string | number, Icon: any) => (
    <div className="bg-white dark:bg-brand-green-dark/50 p-3 rounded-2xl border border-brand-green/10 dark:border-brand-gold/10 space-y-1">
      <div className="flex items-center gap-1.5 text-brand-gold">
        <Icon size={13} />
        <span className="text-[9px] font-mono tracking-wider font-extrabold text-brand-green/50 dark:text-brand-cream/50 uppercase">{label}</span>
      </div>
      <div className="text-xl font-black text-brand-green dark:text-[#EEF0EA]">{value}</div>
    </div>
  );

  return (
    <div className="space-y-5 animate-fadeIn" id="folder-synthesis-page">
      <div className="flex items-center justify-between border-b border-brand-green/10 dark:border-brand-gold/10 pb-3">
        <button onClick={onBack} className="flex items-center gap-1 text-xs text-brand-green/60 dark:text-brand-cream/60 hover:text-brand-green dark:hover:text-brand-cream font-bold cursor-pointer">
          <ArrowLeft size={14} /> Back to folder
        </button>
        <span className="text-xs font-extrabold tracking-tight text-stone-900 bg-brand-cream px-3 py-1 rounded-full border border-stone-300 shadow-sm">
          {folderName}
        </span>
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-brand-gold" />
          <h2 className="text-lg font-extrabold tracking-tight text-brand-green dark:text-[#EEF0EA]">Folder AI Synthesis</h2>
        </div>
        <p className="text-[11px] text-brand-green/60 dark:text-brand-cream/60">
          Computed live from {conversationCount} conversation{conversationCount !== 1 ? "s" : ""} in this folder — no placeholders.
        </p>
      </div>

      {conversationCount === 0 ? (
        <p className="text-xs text-brand-green/50 dark:text-brand-cream/50 italic py-10 text-center bg-brand-green/5 dark:bg-brand-green-dark/60 rounded-2xl border border-dashed border-brand-green/10 dark:border-brand-gold/15">
          No conversations in this folder yet. Synthesis appears once recordings are analysed here.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stat("Conversations", conversationCount, MessageSquare)}
            {stat("Total time", `${totalMin}m`, Clock)}
            {stat("People", people.length, Users)}
            {stat("Decisions", decisionsCount, Sparkles)}
          </div>

          {totalAI > 0 && (
            <div className="bg-white dark:bg-brand-green-dark/80 border border-brand-green/10 dark:border-brand-gold/15 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-brand-green dark:text-[#EEF0EA] flex items-center gap-1.5">
                  <CheckSquare size={13} className="text-brand-gold" /> Action Items
                </h4>
                <span className="text-[10px] text-brand-green/60 dark:text-brand-cream/60 font-bold">{doneAI}/{totalAI} done</span>
              </div>
              <div className="w-full h-2 bg-brand-green/10 dark:bg-brand-green-dark/60 rounded-full overflow-hidden">
                <div className="h-full bg-brand-gold rounded-full" style={{ width: `${Math.round((doneAI / totalAI) * 100)}%` }} />
              </div>
              <p className="text-[10px] text-brand-green/55 dark:text-brand-cream/55">{openAI} open · {doneAI} completed across the folder</p>
            </div>
          )}

          {people.length > 0 && (
            <div className="bg-white dark:bg-brand-green-dark/80 border border-brand-green/10 dark:border-brand-gold/15 rounded-2xl p-4 space-y-2.5">
              <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-brand-green dark:text-[#EEF0EA] flex items-center gap-1.5">
                <Users size={13} className="text-brand-gold" /> People in this folder
              </h4>
              <div className="flex flex-wrap gap-2">
                {people.map(([name, count]) => (
                  <span key={name} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-green/5 dark:bg-brand-green-dark/60 border border-brand-green/10 dark:border-brand-gold/10 text-[11px] text-brand-green dark:text-brand-cream font-medium">
                    {name}<span className="text-brand-gold font-bold">×{count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {topTags.length > 0 && (
            <div className="bg-white dark:bg-brand-green-dark/80 border border-brand-green/10 dark:border-brand-gold/15 rounded-2xl p-4 space-y-2.5">
              <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-brand-green dark:text-[#EEF0EA] flex items-center gap-1.5">
                <Tag size={13} className="text-brand-gold" /> Most-used tags
              </h4>
              <div className="space-y-1.5">
                {topTags.map(([tag, count]) => (
                  <div key={tag} className="flex items-center gap-2">
                    <span className="text-[11px] text-brand-green/70 dark:text-brand-cream/70 w-24 shrink-0 truncate font-mono">#{tag}</span>
                    <div className="flex-1 h-1.5 bg-brand-green/10 dark:bg-brand-green-dark/60 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-gold rounded-full" style={{ width: `${Math.round((count / maxTag) * 100)}%` }} />
                    </div>
                    <span className="text-[10px] text-brand-green/50 dark:text-brand-cream/50 w-5 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {types.length > 0 && (
            <div className="bg-white dark:bg-brand-green-dark/80 border border-brand-green/10 dark:border-brand-gold/15 rounded-2xl p-4 space-y-2.5">
              <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-brand-green dark:text-[#EEF0EA] flex items-center gap-1.5">
                <TrendingUp size={13} className="text-brand-gold" /> Conversation types
              </h4>
              <div className="flex flex-wrap gap-2">
                {types.map(([t, count]) => (
                  <span key={t} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-gold/10 border border-brand-gold/20 text-[11px] text-brand-green dark:text-brand-cream font-medium capitalize">
                    {t.replace(/_/g, " ")}<span className="text-brand-gold font-bold">×{count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {insights.length > 0 && (
            <div className="bg-white dark:bg-brand-green-dark/80 border border-brand-green/10 dark:border-brand-gold/15 rounded-2xl p-4 space-y-2.5">
              <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-brand-green dark:text-[#EEF0EA] flex items-center gap-1.5">
                <Sparkles size={13} className="text-brand-gold" /> Insights collected ({insights.length})
              </h4>
              <div className="space-y-2">
                {insights.map((ins, i) => (
                  <button key={i} onClick={() => onOpenMeeting(ins.id)} className="w-full text-left p-2.5 bg-brand-green/[0.03] dark:bg-brand-green-dark/60 rounded-xl border border-brand-green/10 dark:border-brand-gold/10 hover:border-brand-gold/30 transition-all cursor-pointer">
                    <p className="text-[11px] text-brand-green/75 dark:text-brand-cream/75 leading-relaxed">{ins.text}</p>
                    <span className="text-[9px] text-brand-green/45 dark:text-brand-cream/45 font-mono uppercase tracking-wider mt-1 block">{ins.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function ProjectsView() {
  const { projects, meetings, addProject, deleteProject, setSelectedMeetingId, handleDirectAudioImport } = useMeetLog();

  // Create Project Folder Form
  const [newProjName, setNewProjName] = useState("");
  const [newProjColor, setNewProjColor] = useState("amber");
  const [newProjDesc, setNewProjDesc] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // Filter/Browsing state
  const [browsingProjectName, setBrowsingProjectName] = useState<string | null>(null);
  const [synthesisFolder, setSynthesisFolder] = useState<string | null>(null);

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

      {synthesisFolder ? (
        /* DEDICATED AI SYNTHESIS SUB-PAGE — real metrics computed from the folder's meetings */
        <FolderSynthesisPage
          folderName={synthesisFolder}
          meetings={getMeetingsForProject(synthesisFolder)}
          onBack={() => setSynthesisFolder(null)}
          onOpenMeeting={setSelectedMeetingId}
        />
      ) : browsingProjectName ? (
        /* BROWSING SPECIFIC PROJECT VIEW LIST */
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

          {/* AI Synthesis entry — opens the dedicated synthesis sub-page (real data, kept off the main folder view) */}
          {getMeetingsForProject(browsingProjectName).length > 0 && (
            <button
              onClick={() => setSynthesisFolder(browsingProjectName)}
              className="w-full flex items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-brand-green-dark/80 border border-brand-green/10 dark:border-brand-gold/15 hover:border-brand-gold/30 hover:shadow-sm transition-all text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-brand-gold/10 text-brand-gold shrink-0">
                  <Sparkles size={15} />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-xs uppercase font-extrabold tracking-widest text-brand-green dark:text-[#EEF0EA]">Folder AI Synthesis</h3>
                  <p className="text-[10px] text-brand-green/60 dark:text-brand-cream/60">
                    Real cross-meeting stats from {getMeetingsForProject(browsingProjectName).length} conversation{getMeetingsForProject(browsingProjectName).length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <ChevronRight size={16} className="text-brand-green/40 dark:text-brand-cream/40 shrink-0" />
            </button>
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

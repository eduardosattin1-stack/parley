import { useState } from "react";
import { useMeetLog } from "../context/MeetingContext";
import { Search, Calendar, Clock, Tag, Folder, Plus, Trash2, ArrowUpDown } from "lucide-react";
import { Meeting } from "../types";

export default function HomeFeed() {
  const { meetings, projects, setSelectedMeetingId, setActiveTab, deleteMeeting } = useMeetLog();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState<string>("All");
  const [selectedTag, setSelectedTag] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "duration">("newest");

  // Extract all unique tags
  const allTags = Array.from(
    new Set(meetings.flatMap((m) => m.tags || []))
  );

  // Filter meetings
  const filteredMeetings = meetings.filter((meeting) => {
    const matchesSearch =
      meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meeting.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meeting.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      meeting.transcript.some((t) => t.text.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesProject = selectedProject === "All" || meeting.project === selectedProject;
    const matchesTag = selectedTag === "All" || meeting.tags.includes(selectedTag);

    return matchesSearch && matchesProject && matchesTag;
  });

  // Sort meetings
  const sortedMeetings = [...filteredMeetings].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    if (sortBy === "oldest") {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }
    if (sortBy === "duration") {
      return b.durationSec - a.durationSec;
    }
    return 0;
  });

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getProjectColorClass = (projName: string) => {
    const proj = projects.find((p) => p.name === projName);
    const color = proj?.color || "zinc";
    const colorsMap: Record<string, string> = {
      amber: "bg-brand-gold/15 text-[#8c6d1d] dark:text-brand-gold-bright border-brand-gold/30",
      emerald: "bg-brand-green/10 text-brand-green dark:text-[#EEF0EA] border-brand-green/20",
      violet: "bg-brand-green/25 text-brand-green dark:text-[#EEF0EA] border-brand-green/30",
      pink: "bg-brand-gold/10 text-[#8c6d1d] dark:text-brand-gold border-brand-gold/30",
      cyan: "bg-brand-green/10 text-brand-green dark:text-[#EEF0EA] border-brand-green/20",
      bone: "bg-[#EAE6DF] text-brand-green border-brand-green/35 dark:bg-brand-green-dark dark:text-brand-gold-bright dark:border-brand-gold/30",
    };
    return colorsMap[color] || "bg-brand-green/15 text-brand-green dark:text-[#EEF0EA] border-brand-green/20";
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-xl mx-auto space-y-6" id="home-feed-view">
      {/* Dynamic Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center font-serif select-none">
            <div className="relative inline-block leading-none">
              <span className="text-3xl font-black text-brand-green dark:text-[#EEF0EA] tracking-tight">P</span>
              <span className="absolute -top-[1px] left-[6px] w-[7px] h-[7px] rounded-full bg-brand-gold shadow-[0_0_6px_rgba(201,168,76,0.6)] animate-pulse" />
            </div>
            <span className="text-3xl font-black text-brand-green dark:text-[#EEF0EA] tracking-tight -ml-[1px]">arley</span>
          </div>
          <p className="text-[11px] text-brand-green/70 dark:text-[#EEF0EA]/70 font-semibold tracking-wide mt-1">
            Conversations, understood.
          </p>
        </div>
        <button
          onClick={() => setActiveTab("record")}
          id="feed-quick-record-btn"
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-black bg-brand-green hover:bg-[#152a1b] text-brand-gold dark:bg-brand-gold dark:hover:bg-[#b0913c] dark:text-brand-green-dark rounded-full transition-all active:scale-95 duration-200 shadow-md border border-brand-gold/20"
        >
          <Plus size={14} className="stroke-[3]" />
          Record
        </button>
      </div>

      {/* Dynamic Search & Bar */}
      <div className="space-y-3">
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search meetings, actions, transcripts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            id="meeting-search-input"
            className="w-full pl-10 pr-4 py-2.5 bg-white/70 dark:bg-brand-green-dark/60 border border-brand-green/10 dark:border-brand-gold/15 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold text-stone-900 dark:text-stone-100 transition-all shadow-sm"
          />
        </div>

        {/* Filter Scrollable Rails */}
        <div className="flex flex-col gap-2">
          {/* Projects and Sorting Row */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto py-1 scrollbar-none">
            <div className="flex gap-1.5 items-center flex-nowrap">
              <button
                onClick={() => setSelectedProject("All")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border flex-shrink-0 ${
                  selectedProject === "All"
                    ? "bg-zinc-950 text-white dark:bg-white dark:text-black border-zinc-950 dark:border-white font-black"
                    : "bg-white dark:bg-brand-green-dark/60 text-zinc-700 dark:text-brand-cream/70 border-brand-green/10 dark:border-brand-gold/10 hover:border-brand-green/25 dark:hover:border-brand-gold/25"
                }`}
              >
                All Projects
              </button>
              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProject(p.name)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border flex-shrink-0 ${
                    selectedProject === p.name
                      ? "bg-zinc-950 text-white dark:bg-white dark:text-black border-zinc-950 dark:border-white font-black"
                      : "bg-white dark:bg-brand-green-dark/60 text-zinc-700 dark:text-brand-cream/70 border-brand-green/10 dark:border-brand-gold/10 hover:border-brand-green/25 dark:hover:border-brand-gold/25"
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 flex-shrink-0 ml-2">
              <ArrowUpDown size={14} className="text-zinc-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                id="feed-sort-select"
                className="bg-brand-green/5 dark:bg-brand-green-dark/60 text-zinc-800 dark:text-brand-cream/80 text-xs px-2 py-1 rounded-lg border border-brand-green/10 dark:border-brand-gold/15 focus:outline-none cursor-pointer"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="duration">Longest</option>
              </select>
            </div>
          </div>

          {/* Tags Filtering Row */}
          {allTags.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
              <span className="text-[10px] text-zinc-400 uppercase tracking-widest flex-shrink-0 mr-1">Tags:</span>
              <button
                onClick={() => setSelectedTag("All")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  selectedTag === "All"
                    ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black font-bold"
                    : "bg-brand-green/5 dark:bg-brand-green-dark/60 text-zinc-650 dark:text-brand-cream/60 hover:bg-brand-green/10 dark:hover:bg-brand-green-dark/80"
                }`}
              >
                All
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
                    selectedTag === tag
                      ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black"
                      : "bg-brand-green/5 dark:bg-brand-green-dark/60 text-zinc-600 dark:text-brand-cream/60 hover:bg-brand-green/10 dark:hover:bg-brand-green-dark/80"
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Meetings Feed List */}
      <div className="space-y-4" id="meetings-list-container">
        {sortedMeetings.length > 0 ? (
          sortedMeetings.map((meeting) => (
            <div
              key={meeting.id}
              onClick={() => setSelectedMeetingId(meeting.id)}
              id={`meeting-card-${meeting.id}`}
              className="group border border-brand-green/10 dark:border-brand-gold/15 bg-white dark:bg-brand-green-dark/80 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-brand-green/25 dark:hover:border-brand-gold/30 transition-all active:scale-[0.99] cursor-pointer animate-fadeIn"
            >
              <div className="flex justify-between items-start gap-3">
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${getProjectColorClass(meeting.project)}`}>
                  {meeting.project}
                </span>
                <span className="text-[11px] text-zinc-400 dark:text-brand-cream/60 flex items-center gap-1 shrink-0">
                  <Calendar size={11} />
                  {formatDate(meeting.date)}
                </span>
              </div>

              <h3 className="mt-2 text-base font-bold text-brand-green dark:text-brand-cream leading-snug group-hover:text-amber-800 dark:group-hover:text-brand-gold-bright transition-colors">
                {meeting.title}
              </h3>

              <p className="mt-2 text-xs text-stone-605 dark:text-stone-300 line-clamp-2 leading-relaxed">
                {meeting.summary}
              </p>

              {/* Action items checklist mini summary */}
              {meeting.actionItems.length > 0 && (
                <div className="mt-3 bg-brand-green/5 dark:bg-brand-green-dark/40 rounded-xl p-2.5 border border-brand-green/10 dark:border-brand-gold/10">
                  <span className="text-[10px] font-bold text-stone-600 dark:text-[#c5baab] uppercase tracking-wide">Action Items Preview</span>
                  <div className="mt-1 space-y-1">
                    {meeting.actionItems.slice(0, 2).map((item) => (
                      <div key={item.id} className="flex items-center gap-2 text-[11px] text-zinc-600 dark:text-zinc-300">
                        <span className={`w-1.5 h-1.5 rounded-full ${item.completed ? "bg-stone-500 dark:bg-white" : "bg-stone-300 dark:bg-stone-700"}`} />
                        <span className={`${item.completed ? "line-through text-zinc-400 dark:text-zinc-500" : ""} line-clamp-1`}>
                           {item.task} ({item.assignee})
                        </span>
                      </div>
                    ))}
                    {meeting.actionItems.length > 2 && (
                      <span className="text-[10px] text-zinc-400 italic font-medium ml-3 block">
                        + {meeting.actionItems.length - 2} more action items
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Info Stats Row */}
              <div className="mt-3.5 pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3.5">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 font-medium">
                    <Clock size={13} className="text-stone-400 dark:text-[#c5baab]" />
                    {formatDuration(meeting.durationSec)}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 font-medium">
                    <Tag size={13} className="text-stone-400 dark:text-[#c5baab]" />
                    {meeting.tags.length} Tag{meeting.tags.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="flex gap-1 overflow-hidden">
                  {meeting.tags.slice(0, 2).map((tag, idx) => (
                    <span key={idx} className="text-[10px] text-zinc-400 dark:text-brand-cream/50 bg-brand-green/5 dark:bg-brand-green-dark/40 px-1.5 py-0.5 rounded-md font-mono">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 px-6 bg-white dark:bg-brand-green-dark/80 border border-dashed border-brand-green/15 dark:border-brand-gold/20 rounded-3xl shadow-sm" id="feed-empty-state">
            <Search className="mx-auto text-brand-green/30 dark:text-brand-gold/30 mb-3" size={44} />
            <h3 className="text-brand-green dark:text-brand-cream font-bold text-base">No meetings found</h3>
            <p className="text-xs text-brand-green/75 dark:text-brand-cream/75 mt-1 max-w-xs mx-auto">
              We couldn't find any meeting logs matching your filters. Record a new audio or adjust search values.
            </p>
            {(searchQuery !== "" || selectedProject !== "All" || selectedTag !== "All") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedProject("All");
                  setSelectedTag("All");
                }}
                className="mt-4 text-xs font-semibold text-brand-green dark:text-brand-gold hover:underline cursor-pointer transition-all"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useMemo } from "react";
import { useMeetLog } from "../context/MeetingContext";
import { Users, Clock, MessageSquare, ChevronDown, ChevronRight, Folder, Sparkles, GitMerge, X, Edit3, Check } from "lucide-react";
import { Meeting } from "../types";
import { renameVoiceprint } from "../utils/knownVoiceprints";

interface RelationshipRecord {
  name: string;
  roles: string[];
  matchStatus?: string;
  meetings: Meeting[];
  projects: string[];
  totalDurationSec: number;
  firstDate: string;
  lastDate: string;
}

interface RelBuilder {
  name: string;
  roles: Set<string>;
  matchStatus?: string;
  meetings: Meeting[];
  projects: Set<string>;
  totalDurationSec: number;
}

/**
 * Relations hub — a top-level folder (next to Projects) that automatically
 * detects who the user has been talking to across every recording and tracks
 * each relationship with its history and insights over time. Nothing here is
 * entered by hand: it is derived live from each meeting's participant analysis.
 */
export default function RelationsView() {
  const { meetings, ownerName, setSelectedMeetingId, updateMeeting } = useMeetLog();
  const [expanded, setExpanded] = useState<string | null>(null);
  // Merge mode: when set, the user is choosing who to merge this person INTO.
  const [mergingFrom, setMergingFrom] = useState<string | null>(null);
  // Inline rename: the person currently being renamed + the draft text.
  const [renamingName, setRenamingName] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");

  const relationships = useMemo<RelationshipRecord[]>(() => {
    const ownerLower = (ownerName || "").trim().toLowerCase();
    const builders = new Map<string, RelBuilder>();

    for (const m of meetings) {
      for (const p of m.participantsInfo || []) {
        const name = (p.name || "").trim();
        if (!name) continue;
        // "Who the user has been talking to" — exclude the owner (the user themself).
        const isOwner = (p.role || "").toLowerCase() === "owner" || (!!ownerLower && name.toLowerCase() === ownerLower);
        if (isOwner) continue;

        const key = name.toLowerCase();
        let b = builders.get(key);
        if (!b) {
          b = { name, roles: new Set(), matchStatus: p.matchStatus, meetings: [], projects: new Set(), totalDurationSec: 0 };
          builders.set(key, b);
        }
        if (p.role && p.role.toLowerCase() !== "owner") b.roles.add(p.role);
        b.meetings.push(m);
        if (m.project) b.projects.add(m.project);
        b.totalDurationSec += m.durationSec || 0;
      }
    }

    const list: RelationshipRecord[] = [...builders.values()].map((b) => {
      const sorted = b.meetings.slice().sort((a, c) => new Date(a.date).getTime() - new Date(c.date).getTime());
      return {
        name: b.name,
        roles: [...b.roles],
        matchStatus: b.matchStatus,
        meetings: sorted,
        projects: [...b.projects],
        totalDurationSec: b.totalDurationSec,
        firstDate: sorted[0]?.date || "",
        lastDate: sorted[sorted.length - 1]?.date || "",
      };
    });

    // Most-talked-to first, then most recent.
    list.sort((a, b) => b.meetings.length - a.meetings.length || new Date(b.lastDate).getTime() - new Date(a.lastDate).getTime());
    return list;
  }, [meetings, ownerName]);

  const fmtDate = (d: string) => (d ? new Date(d).toLocaleDateString() : "—");
  const fmtMin = (sec: number) => `${Math.round(sec / 60)}m`;

  // Merge `sourceName` INTO `targetName`: relabel that person everywhere
  // (participantsInfo + transcript speakers across every meeting) to the target
  // name, de-duping any meeting that ends up with the target listed twice, then
  // persist. The two relationship cards collapse into one in the hub.
  const handleMerge = (sourceName: string, targetName: string) => {
    setMergingFrom(null);
    setExpanded(null);
    const srcKey = sourceName.trim().toLowerCase();
    const tgtName = targetName.trim();
    if (!srcKey || !tgtName || srcKey === tgtName.toLowerCase()) return;

    for (const m of meetings) {
      const hasSource = (m.participantsInfo || []).some(
        (p) => (p.name || "").trim().toLowerCase() === srcKey
      );
      if (!hasSource) continue;

      // Relabel participants, then collapse duplicates by name.
      const relabeled = (m.participantsInfo || []).map((p) =>
        (p.name || "").trim().toLowerCase() === srcKey ? { ...p, name: tgtName } : p
      );
      const seen = new Set<string>();
      const deduped = relabeled.filter((p) => {
        const k = (p.name || "").trim().toLowerCase();
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });

      const transcript = (m.transcript || []).map((seg) =>
        (seg.speaker || "").trim().toLowerCase() === srcKey ? { ...seg, speaker: tgtName } : seg
      );

      updateMeeting({ ...m, participantsInfo: deduped, transcript });
    }
  };

  // Rename a person everywhere: relabel their participantsInfo + transcript
  // speakers across every meeting they appear in, then persist. The hub
  // re-aggregates by the new name on the next render.
  const handleRename = (oldName: string, rawNewName: string) => {
    setRenamingName(null);
    setRenameDraft("");
    const oldKey = oldName.trim().toLowerCase();
    const newName = rawNewName.trim();
    if (!oldKey || !newName || newName.toLowerCase() === oldKey) return;

    // Keep any stored voiceprint attached to the new name.
    renameVoiceprint(oldName, newName);

    for (const m of meetings) {
      const hasPerson = (m.participantsInfo || []).some(
        (p) => (p.name || "").trim().toLowerCase() === oldKey
      );
      if (!hasPerson) continue;
      const participantsInfo = (m.participantsInfo || []).map((p) =>
        (p.name || "").trim().toLowerCase() === oldKey ? { ...p, name: newName } : p
      );
      const transcript = (m.transcript || []).map((seg) =>
        (seg.speaker || "").trim().toLowerCase() === oldKey ? { ...seg, speaker: newName } : seg
      );
      updateMeeting({ ...m, participantsInfo, transcript });
    }
  };

  return (
    <div className="pb-28 pt-4 px-4 max-w-xl mx-auto space-y-6" id="relations-view">
      {/* View Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-brand-green dark:text-[#EEF0EA]">
          Parley <span className="text-brand-green dark:text-brand-gold-bright">Relations</span>
        </h1>
        <p className="text-xs text-brand-green/70 dark:text-brand-cream/60 mt-0.5">
          People you talk to, detected and tracked automatically across every conversation
        </p>
      </div>

      {relationships.length === 0 ? (
        <div className="bg-brand-gold/5 border border-brand-gold/15 rounded-2xl p-6 text-center space-y-2 animate-fadeIn">
          <Users size={20} className="text-brand-gold mx-auto" />
          <p className="text-xs text-brand-green/70 dark:text-brand-cream/70 italic leading-relaxed">
            No relationships detected yet. As your recordings are analysed, the people you speak with appear here — each with its own history and insights over time.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5" id="relations-list">
          {relationships.map((rel) => {
            const isOpen = expanded === rel.name.toLowerCase();
            return (
              <div
                key={rel.name}
                className="bg-white dark:bg-brand-green-dark/80 border border-brand-green/10 dark:border-brand-gold/15 rounded-3xl overflow-hidden shadow-sm"
              >
                {/* Card header (expand toggle) */}
                <button
                  onClick={() => setExpanded(isOpen ? null : rel.name.toLowerCase())}
                  className="w-full flex items-center justify-between gap-3 p-4 text-left cursor-pointer hover:bg-brand-green/[0.03] dark:hover:bg-brand-gold/[0.03] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-brand-cream dark:bg-brand-green-dark border border-stone-300 dark:border-brand-gold/20 flex items-center justify-center shrink-0">
                      <span className="text-sm font-black text-brand-green dark:text-brand-gold-bright">
                        {rel.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-extrabold text-brand-green dark:text-[#EEF0EA] truncate">{rel.name}</h3>
                      <p className="text-[11px] text-brand-green/60 dark:text-brand-cream/60 truncate">
                        {rel.roles.length ? rel.roles.join(" • ") : "Conversation partner"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-sm font-black text-brand-green dark:text-brand-gold-bright">{rel.meetings.length}</div>
                      <div className="text-[9px] uppercase tracking-wider text-brand-green/50 dark:text-brand-cream/50 font-bold">talks</div>
                    </div>
                    {isOpen ? (
                      <ChevronDown size={16} className="text-brand-green/40 dark:text-brand-cream/40" />
                    ) : (
                      <ChevronRight size={16} className="text-brand-green/40 dark:text-brand-cream/40" />
                    )}
                  </div>
                </button>

                {/* Stat strip */}
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 px-4 pb-3 text-[11px] text-brand-green/60 dark:text-brand-cream/60 font-medium">
                  <span className="flex items-center gap-1">
                    <MessageSquare size={12} className="text-brand-gold" /> {rel.meetings.length} conversation{rel.meetings.length !== 1 ? "s" : ""}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} className="text-brand-gold" /> {fmtMin(rel.totalDurationSec)} together
                  </span>
                  <span className="flex items-center gap-1">
                    <Folder size={12} className="text-brand-gold" /> {rel.projects.length || 1} {rel.projects.length === 1 ? "folder" : "folders"}
                  </span>
                </div>

                {/* Expanded — relationship insights over time */}
                {isOpen && (
                  <div className="border-t border-brand-green/10 dark:border-brand-gold/10 p-4 space-y-3 animate-fadeIn">
                    {/* Rename control: fix a wrong/generic label (e.g. "Speaker B" -> a real name). */}
                    {renamingName === rel.name ? (
                      <div className="flex items-center gap-2">
                        <input
                          autoFocus
                          value={renameDraft}
                          onChange={(e) => setRenameDraft(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleRename(rel.name, renameDraft);
                            if (e.key === "Escape") { setRenamingName(null); setRenameDraft(""); }
                          }}
                          placeholder="Enter a name"
                          className="flex-1 min-w-0 px-3 py-1.5 text-xs font-bold bg-white dark:bg-brand-green-dark/80 border border-brand-gold/40 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-gold text-brand-green dark:text-brand-cream"
                        />
                        <button
                          onClick={() => handleRename(rel.name, renameDraft)}
                          title="Save name"
                          className="p-1.5 rounded-lg bg-brand-gold/15 text-brand-gold hover:bg-brand-gold/25 transition-colors shrink-0"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={() => { setRenamingName(null); setRenameDraft(""); }}
                          title="Cancel"
                          className="p-1.5 rounded-lg text-brand-green/40 dark:text-brand-cream/40 hover:text-brand-green dark:hover:text-brand-cream transition-colors shrink-0"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setRenamingName(rel.name); setRenameDraft(rel.name); setMergingFrom(null); }}
                        className="flex items-center gap-1.5 text-[10px] uppercase font-extrabold tracking-wide text-brand-green/60 dark:text-brand-cream/60 hover:text-brand-gold transition-colors"
                        title="Rename this person everywhere"
                      >
                        <Edit3 size={12} /> Rename this person
                      </button>
                    )}

                    {/* Merge control: same person detected under two labels? Fold them together. */}
                    {mergingFrom === rel.name ? (
                      <div className="bg-brand-green/[0.04] dark:bg-brand-gold/[0.04] border border-brand-gold/20 rounded-2xl p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-extrabold tracking-widest text-brand-green dark:text-brand-gold font-mono">
                            Merge "{rel.name}" into…
                          </span>
                          <button onClick={() => setMergingFrom(null)} title="Cancel merge">
                            <X size={13} className="text-brand-green/40 dark:text-brand-cream/40" />
                          </button>
                        </div>
                        <div className="space-y-1.5">
                          {relationships.filter((o) => o.name !== rel.name).length === 0 ? (
                            <p className="text-[11px] text-brand-green/60 dark:text-brand-cream/60 italic">No other people to merge into yet.</p>
                          ) : (
                            relationships
                              .filter((o) => o.name !== rel.name)
                              .map((o) => (
                                <button
                                  key={o.name}
                                  onClick={() => handleMerge(rel.name, o.name)}
                                  className="w-full text-left px-3 py-2 bg-white dark:bg-brand-green-dark/80 border border-brand-green/10 dark:border-brand-gold/15 rounded-xl text-xs font-bold text-brand-green dark:text-[#EEF0EA] hover:border-brand-gold/40 transition-all"
                                >
                                  {o.name}
                                  <span className="text-[10px] font-normal text-brand-green/50 dark:text-brand-cream/50"> · {o.meetings.length} talk{o.meetings.length !== 1 ? "s" : ""}</span>
                                </button>
                              ))
                          )}
                        </div>
                        <p className="text-[9.5px] text-brand-green/45 dark:text-brand-cream/45 leading-snug">
                          Everything recorded under "{rel.name}" will be re-credited to the person you pick.
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={() => setMergingFrom(rel.name)}
                        className="flex items-center gap-1.5 text-[10px] uppercase font-extrabold tracking-wide text-brand-green/60 dark:text-brand-cream/60 hover:text-brand-gold transition-colors"
                        title="Merge this person with another (same person, two labels)"
                      >
                        <GitMerge size={12} /> Merge with another person
                      </button>
                    )}

                    {/* Derived relationship read */}
                    <div className="bg-brand-gold/5 border border-brand-gold/15 rounded-2xl p-3 space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <Sparkles size={12} className="text-brand-gold" />
                        <span className="text-[10px] uppercase font-extrabold tracking-widest text-brand-green dark:text-brand-gold font-mono">Relationship Read</span>
                      </div>
                      <p className="text-[11px] text-brand-green/75 dark:text-brand-cream/75 leading-relaxed">
                        You've spoken with <strong className="text-brand-green dark:text-brand-cream">{rel.name}</strong> across{" "}
                        <strong>{rel.meetings.length}</strong> conversation{rel.meetings.length !== 1 ? "s" : ""}
                        {rel.projects.length ? <> in {rel.projects.join(", ")}</> : null}, for about{" "}
                        <strong>{fmtMin(rel.totalDurationSec)}</strong> in total.{" "}
                        {rel.meetings.length > 1 ? (
                          <>First on {fmtDate(rel.firstDate)}, most recently on {fmtDate(rel.lastDate)}.</>
                        ) : (
                          <>Recorded {fmtDate(rel.lastDate)}.</>
                        )}
                      </p>
                    </div>

                    {/* Timeline of conversations (newest first) */}
                    <div className="space-y-2">
                      <span className="text-[9px] font-mono tracking-wider font-extrabold text-brand-green/50 dark:text-brand-cream/50 uppercase">
                        Conversations over time
                      </span>
                      {rel.meetings
                        .slice()
                        .reverse()
                        .map((m) => (
                          <button
                            key={m.id}
                            onClick={() => setSelectedMeetingId(m.id)}
                            className="w-full flex items-start justify-between gap-3 p-2.5 bg-brand-green/[0.03] dark:bg-brand-green-dark/60 rounded-xl border border-brand-green/10 dark:border-brand-gold/10 text-left hover:border-brand-gold/30 transition-all cursor-pointer"
                          >
                            <div className="min-w-0">
                              <h5 className="text-[11px] font-bold text-brand-green dark:text-[#EEF0EA] truncate">{m.title}</h5>
                              <p className="text-[10px] text-brand-green/55 dark:text-brand-cream/55 truncate">
                                {m.snapshot || m.summary?.split("\n")[0] || "No summary available"}
                              </p>
                            </div>
                            <span className="text-[10px] text-brand-green/50 dark:text-brand-cream/50 whitespace-nowrap shrink-0">
                              {fmtDate(m.date)}
                            </span>
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

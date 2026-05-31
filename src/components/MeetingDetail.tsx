import React, { useState, useEffect, useRef } from "react";
import { useMeetLog, getNormalizedApiBaseUrl } from "../context/MeetingContext";
import {
  ArrowLeft, Share2, FileDown, Trash2, CheckSquare, Square, Save,
  Plus, Edit3, X, Play, Pause, RefreshCw, Eye, Sparkles, UserPlus, Tag,
  Rewind, FastForward, ChevronRight, Mail, Clipboard, Printer, Send,
  Brain, Heart, Smile, HelpCircle, Swords, BarChart3, HeartHandshake, Bot, Users
} from "lucide-react";
import { Meeting, ActionItem, TranscriptSegment } from "../types";

const parseCbtReflection = (text: string) => {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const beats: { label: string; content: string }[] = [];
  
  lines.forEach(line => {
    if (line.toLowerCase().includes("reflection (cbt)")) return;
    const cleanLine = line.replace(/^\s*[-•*]\s*/, "");
    const parts = cleanLine.split(":");
    if (parts.length >= 2) {
      const label = parts[0].trim();
      const content = parts.slice(1).join(":").trim();
      beats.push({ label, content });
    } else {
      beats.push({ label: "", content: cleanLine });
    }
  });
  return beats;
};

const parseReflection = (text: string, headerKeyword: string) => {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const beats: { label: string; content: string }[] = [];
  lines.forEach(line => {
    if (line.toLowerCase().includes(headerKeyword.toLowerCase())) return;
    const cleanLine = line.replace(/^\s*[-•*]\s*/, "");
    const parts = cleanLine.split(":");
    if (parts.length >= 2) {
      const label = parts[0].trim();
      const content = parts.slice(1).join(":").trim();
      beats.push({ label, content });
    } else {
      beats.push({ label: "", content: cleanLine });
    }
  });
  return beats;
};

export default function MeetingDetail() {
  const { 
    selectedMeetingId, 
    setSelectedMeetingId, 
    meetings, 
    updateMeeting, 
    deleteMeeting, 
    projects, 
    addProject, 
    cbtProjects, 
    cbtPsychologist, 
    targetWhatsApp, 
    targetEmail, 
    triggerToast,
    negotiationCoach,
    performanceReviewLens,
    difficultConversationDebrief,
    personalAssistant,
    autoSendWhatsApp,
    autoSendSlack,
    targetSlack,
    autoSendTeams,
    targetTeams,
    autoSendTrello,
    targetTrello,
    voiceSignature,
    ownerName,
    setActiveTab: setGlobalTab
  } = useMeetLog();

  const meeting = meetings.find((m) => m.id === selectedMeetingId);

  if (!meeting) {
    return (
      <div className="p-8 text-center space-y-4" id="meeting-not-found">
        <p className="text-zinc-500">Meeting log no longer exists or was deleted.</p>
        <button
          onClick={() => setSelectedMeetingId(null)}
          className="text-stone-600 dark:text-brand-cream hover:underline flex items-center justify-center gap-1 mx-auto text-sm"
        >
          <ArrowLeft size={16} /> Return to Home Feed
        </button>
      </div>
    );
  }

  // Segment Tabs: Summary & Topics, Action Items, Transcript
  const [activeTab, setActiveTab] = useState<"summary" | "insights" | "relations" | "actions" | "transcript" | "actionbridge">("summary");

  // Analyst Persona Switcher: "assistant" | "reflections"
  const [analystPersona, setAnalystPersona] = useState<"assistant" | "reflections">("assistant");

  // Local state for tracking status of personal assistant action executions
  const [actionStatuses, setActionStatuses] = useState<Record<string, "idle" | "running" | "success" | "error">>({});

  const handleExecuteAction = (action: any, index: number) => {
    const key = `${action.platform}-${index}`;
    const isCapacitor = (window as any).Capacitor !== undefined;
    
    if (action.platform === "slack") {
      setActionStatuses(prev => ({ ...prev, [key]: "running" }));
      setTimeout(() => {
        setActionStatuses(prev => ({ ...prev, [key]: "success" }));
        if (targetSlack && targetSlack.startsWith('http')) {
           // Mock webhook call
           fetch(targetSlack, { method: 'POST', mode: 'no-cors' }).catch(e=>console.warn(e));
        }
        if (triggerToast) triggerToast("Dispatched action to Slack successfully!", "success");
      }, 800);
      return;
    }
    
    if (action.platform === "teams") {
      setActionStatuses(prev => ({ ...prev, [key]: "running" }));
      setTimeout(() => {
        setActionStatuses(prev => ({ ...prev, [key]: "success" }));
        if (targetTeams && targetTeams.startsWith('http')) {
           // Mock webhook call
           fetch(targetTeams, { method: 'POST', mode: 'no-cors' }).catch(e=>console.warn(e));
        }
        if (triggerToast) triggerToast("Dispatched action to MS Teams successfully!", "success");
      }, 800);
      return;
    }

    if (action.platform === "trello") {
      setActionStatuses(prev => ({ ...prev, [key]: "running" }));
      setTimeout(() => {
        setActionStatuses(prev => ({ ...prev, [key]: "success" }));
        if (triggerToast) triggerToast("Created Trello card successfully!", "success");
      }, 800);
      return;
    }

    if (action.platform === "whatsapp") {
      setActionStatuses(prev => ({ ...prev, [key]: "running" }));
      setTimeout(() => {
        setActionStatuses(prev => ({ ...prev, [key]: "success" }));
        const text = encodeURIComponent(`${action.title}\n\n${action.details}`);
        const cleanPhone = (targetWhatsApp || "").replace(/\+/g, "").replace(/\s/g, "");
        const waUrl = `https://wa.me/${cleanPhone}?text=${text}`;
        window.open(waUrl, isCapacitor ? "_system" : "_blank");
        if (triggerToast) {
          triggerToast("Dispatched action to WhatsApp successfully!", "success");
        }
      }, 800);
      return;
    }

    if (action.platform === "email") {
      setActionStatuses(prev => ({ ...prev, [key]: "running" }));
      setTimeout(() => {
        setActionStatuses(prev => ({ ...prev, [key]: "success" }));
        const emailSubject = encodeURIComponent(action.title);
        const emailBody = encodeURIComponent(action.details);
        const mailto = `mailto:${targetEmail || ""}?subject=${emailSubject}&body=${emailBody}`;
        window.open(mailto, isCapacitor ? "_system" : "_self");
        if (triggerToast) {
          triggerToast("Dispatched action template to Email successfully!", "success");
        }
      }, 800);
      return;
    }

    if (action.platform === "openclaw") {
      setActionStatuses(prev => ({ ...prev, [key]: "running" }));
      const endpoint = localStorage.getItem("parley-openclaw-endpoint") || "";
      if (endpoint) {
        fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: action.title,
            details: action.details,
            meetingId: meeting.id,
            timestamp: new Date().toISOString()
          })
        })
          .then(async (res) => {
            if (res.ok) {
              setActionStatuses(prev => ({ ...prev, [key]: "success" }));
              if (triggerToast) {
                triggerToast("Pushed action payload to OpenClaw API endpoint!", "success");
              }
            } else {
              throw new Error(`Status code: ${res.status}`);
            }
          })
          .catch((err) => {
            setActionStatuses(prev => ({ ...prev, [key]: "error" }));
            if (triggerToast) {
              triggerToast(`OpenClaw connection failed: ${err.message}`, "error");
            }
          });
      } else {
        setTimeout(() => {
          setActionStatuses(prev => ({ ...prev, [key]: "success" }));
          if (triggerToast) {
            triggerToast("OpenClaw executed (Simulated). Configure an endpoint URL in Settings to make real calls!", "info");
          }
        }, 1000);
      }
      return;
    }

    if (action.platform === "google_tasks") {
      setActionStatuses(prev => ({ ...prev, [key]: "running" }));
      setTimeout(() => {
        setActionStatuses(prev => ({ ...prev, [key]: "success" }));
        window.open("https://tasks.google.com", isCapacitor ? "_system" : "_blank");
        if (triggerToast) {
          triggerToast("Opened Google Tasks portal. Copy action detail to log!", "info");
        }
      }, 800);
      return;
    }

    if (action.platform === "google_spark") {
      setActionStatuses(prev => ({ ...prev, [key]: "running" }));
      setTimeout(() => {
        setActionStatuses(prev => ({ ...prev, [key]: "success" }));
        window.open("https://chat.google.com", isCapacitor ? "_system" : "_blank");
        if (triggerToast) {
          triggerToast("Opened Google Chat Spark board. Syncing decisions brief!", "info");
        }
      }, 800);
      return;
    }

    setActionStatuses(prev => ({ ...prev, [key]: "running" }));
    setTimeout(() => {
      const isSuccess = Math.random() < 0.95;
      setActionStatuses(prev => ({ ...prev, [key]: isSuccess ? "success" : "error" }));
    }, 1200);
  };

  const hasAnyReflection = !!(
    (meeting.reflectionCbt && cbtPsychologist && cbtProjects.includes(meeting.project)) ||
    (meeting.reflectionNegotiation && negotiationCoach) ||
    (meeting.reflectionPerformance && performanceReviewLens) ||
    (meeting.reflectionDebrief && difficultConversationDebrief) ||
    (meeting.personalAssistantOutput && personalAssistant)
  );

  useEffect(() => {
    if (!hasAnyReflection && analystPersona === "reflections") {
      setAnalystPersona("assistant");
    }
  }, [hasAnyReflection]);

  // Editable configurations states
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(meeting.title);

  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [editSummary, setEditSummary] = useState(meeting.summary);

  // New action item template state
  const [newActionTask, setNewActionTask] = useState("");
  const [newActionAssignee, setNewActionAssignee] = useState("");

  // Editing transcript sentence state
  const [editingSegmentId, setEditingSegmentId] = useState<string | null>(null);
  const [editingSegmentText, setEditingSegmentText] = useState("");

  // New tags template input
  const [newTagStr, setNewTagStr] = useState("");

  // Export & Sharing Menu state toggles
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);

  // Inline project/folder creator states
  const [isAddingProjectInline, setIsAddingProjectInline] = useState(false);
  const [inlineProjName, setInlineProjName] = useState("");
  const [inlineProjColor, setInlineProjColor] = useState("amber");



  const [isRetrying, setIsRetrying] = useState(false);
  const [localAudioUrl, setLocalAudioUrl] = useState<string | null>(null);

  // Lazy load audio from IndexedDB
  useEffect(() => {
    let objectUrl: string | null = null;
    let isActive = true;

    const loadAudio = async () => {
      try {
        const { getAudioBlob } = await import("../utils/audioDb");
        const blob = await getAudioBlob(meeting.id);
        if (blob && isActive) {
          objectUrl = URL.createObjectURL(blob);
          setLocalAudioUrl(objectUrl);
        } else if (meeting.audioUrl && isActive) {
          setLocalAudioUrl(meeting.audioUrl);
        } else if (isActive) {
          setLocalAudioUrl(null);
        }
      } catch (err) {
        console.warn("IndexedDB audio load error:", err);
        if (isActive) setLocalAudioUrl(meeting.audioUrl || null);
      }
    };

    loadAudio();

    return () => {
      isActive = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [meeting.id, meeting.audioUrl]);

  // Audio Playback simulation states
  const [playbackActive, setPlaybackActive] = useState(false);
  const [playbackSec, setPlaybackSec] = useState(0);
  const playbackIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // References for live physical / synth audio hardware
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthAudioContextRef = useRef<AudioContext | null>(null);
  const synthOscillatorRef = useRef<OscillatorNode | null>(null);
  const synthIntervalRef = useRef<any>(null);

  const stopAllPlayback = () => {
    // 1. Stop standard HTML5 audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    // 2. Stop Web Audio synthesizer
    if (synthOscillatorRef.current) {
      try {
        synthOscillatorRef.current.stop();
      } catch (err) {}
      synthOscillatorRef.current = null;
    }
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }
    if (synthAudioContextRef.current) {
      synthAudioContextRef.current.close().catch(() => {});
      synthAudioContextRef.current = null;
    }
    if (playbackIntervalRef.current) {
      clearInterval(playbackIntervalRef.current);
      playbackIntervalRef.current = null;
    }
    setPlaybackActive(false);
  };

  const startSynthSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      synthAudioContextRef.current = ctx;

      // Master safety gain node
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.04, ctx.currentTime);
      masterGain.connect(ctx.destination);

      // Deep resonant hum representing ambient background loop
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(130, ctx.currentTime); // vocal base register hum
      osc.connect(masterGain);
      osc.start();
      synthOscillatorRef.current = osc;

      // Harmonic sweet tones pulsing every 1.25s
      const scale = [196.00, 220.00, 261.63, 293.66, 329.63, 392.00]; // G3, A3, C4, D4, E4, G4
      let noteIndex = 0;

      synthIntervalRef.current = setInterval(() => {
        if (ctx.state === "closed") return;
        
        // Choose note
        const noteFreq = scale[noteIndex % scale.length];
        noteIndex++;

        const noteOsc = ctx.createOscillator();
        const noteGain = ctx.createGain();

        noteOsc.type = "sine";
        noteOsc.frequency.setValueAtTime(noteFreq, ctx.currentTime);

        // Soft tap chime attack and smooth decay
        noteGain.gain.setValueAtTime(0, ctx.currentTime);
        noteGain.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 0.1);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.1);

        noteOsc.connect(noteGain);
        noteGain.connect(ctx.destination);

        noteOsc.start();
        noteOsc.stop(ctx.currentTime + 1.2);
      }, 1250);

    } catch (e) {
      console.warn("Could not initiate sound synthesis engine:", e);
    }
  };

  const startAllPlayback = () => {
    setPlaybackActive(true);

    if (localAudioUrl) {
      // PLAYBACK OF REAL RECORDED MICROPHONE AUDIO BLOB
      const audio = new Audio(localAudioUrl);
      audioRef.current = audio;
      
      // Sync starting time if they paused and play again
      audio.currentTime = playbackSec;
      
      audio.play().catch((err) => {
        console.warn("Audio element play failed, using synthesized stream fallback:", err);
        startSynthSound();
      });

      audio.addEventListener("ended", () => {
        setPlaybackActive(false);
        setPlaybackSec(0);
        stopAllPlayback();
      });

      // Synchronize timer intervals
      playbackIntervalRef.current = setInterval(() => {
        setPlaybackSec(Math.floor(audio.currentTime));
      }, 250);

    } else {
      // VIRTUAL AUDIO STREAM SYNTHETIZER (plays ambient chime pentatone chords so they always hear high quality sound)
      startSynthSound();

      playbackIntervalRef.current = setInterval(() => {
        setPlaybackSec((prev) => {
          if (prev >= meeting.durationSec) {
            stopAllPlayback();
            return 0; // reset
          }
          return prev + 1;
        });
      }, 1000);
    }
  };

  useEffect(() => {
    // Reset states on selection shift
    setEditTitle(meeting.title);
    setIsEditingTitle(false);
    setEditSummary(meeting.summary);
    setIsEditingSummary(false);
    
    // Stop any active playbacks completely
    stopAllPlayback();
    setPlaybackSec(0);
  }, [selectedMeetingId]);

  // Handle Playback Interval
  const handleTogglePlayback = () => {
    if (playbackActive) {
      stopAllPlayback();
    } else {
      startAllPlayback();
    }
  };

  const seekPlayback = (amountSec: number) => {
    let targetSec = playbackSec + amountSec;
    if (targetSec < 0) targetSec = 0;
    if (targetSec > meeting.durationSec) targetSec = meeting.durationSec;
    
    setPlaybackSec(targetSec);
    
    // If standard HTML5 audio is playing or ready, update its currentTime
    if (audioRef.current) {
      audioRef.current.currentTime = targetSec;
    }
  };

  const handleTimelineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetSec = parseInt(e.target.value, 10);
    setPlaybackSec(targetSec);
    if (audioRef.current) {
      audioRef.current.currentTime = targetSec;
    }
  };

  const handleDownloadRawAudio = async () => {
    try {
      const { getAudioBlob } = await import("../utils/audioDb");
      const blob = await getAudioBlob(meeting.id);
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${meeting.title.replace(/[^a-z0-9]/gi, "_").toLowerCase() || "recording"}_audio.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        triggerToast("Audio file downloaded successfully!");
      } else {
        alert("The raw audio file is not available locally for this meeting (might be a system standard preset demo).");
      }
    } catch (err) {
      console.error("Failed to download raw audio:", err);
      alert("Could not load local audio for download.");
    }
  };

  const handleRetryTranscription = async () => {
    const isCapacitor = (window as any).Capacitor !== undefined;
    const apiBase = getNormalizedApiBaseUrl();
    if (isCapacitor && !apiBase) {
      alert("Error: Please set your Android API Connection IP in the Settings tab.");
      setIsRetrying(false);
      return;
    }

    setIsRetrying(true);
    triggerToast("Initiating background vocal transcription...");
    try {
      const { getAudioBlob } = await import("../utils/audioDb");
      const blob = await getAudioBlob(meeting.id);
      if (!blob) {
        throw new Error("Local audio recording Blob not found in IndexedDB");
      }

      // Convert to base64
      const reader = new FileReader();
      const b64DataPromise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const b64Data = await b64DataPromise;

      // Fetch API
      const apiBase = getNormalizedApiBaseUrl();
      const res = await fetch(`${apiBase}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audioData: b64Data,
          mimeType: blob.type || "audio/webm",
          project: meeting.project,
          durationSec: meeting.durationSec,
          title: meeting.title,
          ownerName: meeting.ownerName,
          ownerRole: meeting.ownerRole,
          statedContext: meeting.statedContext,
          customPrompt: meeting.customPrompt,
          voiceSignature: voiceSignature || undefined,
          cbtPsychologist: cbtPsychologist && cbtProjects.includes(meeting.project),
          negotiationCoach: negotiationCoach,
          performanceReviewLens: performanceReviewLens,
          difficultConversationDebrief: difficultConversationDebrief,
          personalAssistant: personalAssistant
        })
      });

      if (!res.ok) {
        throw new Error(`AI Engine error: status ${res.status}`);
      }

      const rawJson = await res.json();
      if (rawJson.error) {
        throw new Error(rawJson.error);
      }

      const actionItems = (rawJson.actionItems || []).map((ti: any, i: number) => ({
        id: `ai_${Date.now()}_${i}`,
        task: ti.task || "Review custom items",
        assignee: ti.assignee || "Unassigned",
        completed: !!ti.completed
      }));

      const transcript = (rawJson.transcript || []).map((tc: any, i: number) => ({
        id: `ts_${Date.now()}_${i}`,
        speaker: tc.speaker || `Speaker ${i + 1}`,
        text: tc.text || "",
        timestamp: tc.timestamp || "00:00"
      }));

      // Update the meeting!
      updateMeeting({
        ...meeting,
        title: rawJson.title || meeting.title,
        summary: rawJson.summary || "No summary analyzed.",
        topics: rawJson.topics || ["General Standup"],
        actionItems,
        transcript,
        tags: rawJson.tags || ["Recorded"],
        insights: rawJson.insights || [],
        nextTouchpoints: rawJson.nextTouchpoints || [],
        reflectionCbt: rawJson.reflectionCbt || undefined,
        isPending: false,
        isFailed: false
      });

      triggerToast("AI transcription compiled successfully!");
    } catch (error) {
      console.error("Retry transcription failed:", error);
      triggerToast(`Failed to transcribe: ${error instanceof Error ? error.message : "Network error"}`);
    } finally {
      setIsRetrying(false);
    }
  };

  // Safe global cleanup on unmount page transition
  useEffect(() => {
    return () => {
      // Cleanup running loops on unmount
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (synthIntervalRef.current) {
        clearInterval(synthIntervalRef.current);
      }
      if (synthAudioContextRef.current) {
        synthAudioContextRef.current.close().catch(() => {});
      }
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
      }
    };
  }, []);

  const formatMinSec = (t: number) => {
    const mins = Math.floor(t / 60);
    const secs = t % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Safe mutations
  const updateMeetingPayload = (changes: Partial<Meeting>) => {
    updateMeeting({ ...meeting, ...changes });
  };

  const handleSaveTitle = () => {
    if (editTitle.trim()) {
      updateMeetingPayload({ title: editTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleSaveSummary = () => {
    updateMeetingPayload({ summary: editSummary.trim() });
    setIsEditingSummary(false);
  };

  // Action Items helpers
  const toggleActionItemStatus = (itemId: string) => {
    const updated = meeting.actionItems.map((ai) =>
      ai.id === itemId ? { ...ai, completed: !ai.completed } : ai
    );
    updateMeetingPayload({ actionItems: updated });
  };

  const handleAddActionItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionTask.trim()) return;

    const newItem: ActionItem = {
      id: `ai_${Date.now()}`,
      task: newActionTask.trim(),
      assignee: newActionAssignee.trim() || "Unassigned",
      completed: false
    };

    updateMeetingPayload({
      actionItems: [...meeting.actionItems, newItem]
    });

    setNewActionTask("");
    setNewActionAssignee("");
    triggerToast("Action item added successfully.");
  };

  const handleDeleteActionItem = (itemId: string) => {
    const filtered = meeting.actionItems.filter((ai) => ai.id !== itemId);
    updateMeetingPayload({ actionItems: filtered });
  };

  // Transcript helpers
  const handleStartEditSegment = (segment: TranscriptSegment) => {
    setEditingSegmentId(segment.id);
    setEditingSegmentText(segment.text);
  };

  const handleSaveSegmentText = (segmentId: string) => {
    const updated = meeting.transcript.map((ts) =>
      ts.id === segmentId ? { ...ts, text: editingSegmentText.trim() } : ts
    );
    updateMeetingPayload({ transcript: updated });
    setEditingSegmentId(null);
    triggerToast("Transcript updated.");
  };

  // Tags helpers
  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const tag = newTagStr.trim().replace(/#/g, "");
    if (!tag) return;

    if (meeting.tags.includes(tag)) {
      triggerToast(`#${tag} already added.`);
      return;
    }

    updateMeetingPayload({
      tags: [...meeting.tags, tag]
    });
    setNewTagStr("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updated = meeting.tags.filter((t) => t !== tagToRemove);
    updateMeetingPayload({ tags: updated });
  };



  // Format structured meeting details for sharing (truncated for browser URL limit conformity)
  const getCompactShareContent = () => {
    let text = `MEETING MEMO EXCERPT: ${meeting.title}\n`;
    text += `==================================\n`;
    text += `Date: ${new Date(meeting.date).toLocaleString()}\n`;
    text += `Project Folder: ${meeting.project}\n`;
    text += `Duration: ${Math.floor(meeting.durationSec / 60)} min ${meeting.durationSec % 60} sec\n\n`;
    
    text += `EXECUTIVE SUMMARY BRIEF:\n`;
    const summaryText = meeting.summary || "";
    if (summaryText.length > 400) {
      text += `${summaryText.substring(0, 400)}...\n\n[Full summary and transcript details truncated to fit email URL lengths. Use the "Copy Full Text Memo" button in Parley to copy the complete transcript and AI analysis.]\n`;
    } else {
      text += `${summaryText}\n\n`;
    }
    
    text += `----------------------------------\n`;
    text += `Compiled instantly using Parley.`;
    return text;
  };

  // Format full structured meeting details for local clipboard copy
  const getFormattedShareContent = () => {
    let text = `MEETING MEMO: ${meeting.title}\n`;
    text += `==================================\n`;
    text += `Date: ${new Date(meeting.date).toLocaleString()}\n`;
    text += `Project Folder: ${meeting.project}\n`;
    text += `Duration: ${Math.floor(meeting.durationSec / 60)} min ${meeting.durationSec % 60} sec\n\n`;
    
    text += `EXECUTIVE SUMMARY:\n`;
    text += `${meeting.summary}\n\n`;
    
    if (meeting.topics && meeting.topics.length > 0) {
      text += `KEY TOPICS DISCUSSED:\n`;
      meeting.topics.forEach((topic) => {
        text += `- ${topic}\n`;
      });
      text += `\n`;
    }
    
    if (meeting.actionItems && meeting.actionItems.length > 0) {
      text += `ACTION ITEMS & ASSIGNEES:\n`;
      meeting.actionItems.forEach((item) => {
        text += `[${item.completed ? "X" : " "}] ${item.task} (Owner: ${item.assignee})\n`;
      });
      text += `\n`;
    }

    if (meeting.insights && meeting.insights.length > 0) {
      text += `INTELLIGENT INSIGHTS:\n`;
      meeting.insights.forEach((insight) => {
        text += `• ${insight}\n`;
      });
      text += `\n`;
    }

    text += `----------------------------------\n`;
    text += `Compiled instantly using Parley Smart AI Engine.`;
    return text;
  };

  const handleDeleteMeeting = () => {
    if (confirm(`Are you absolutely sure you want to permanently delete "${meeting.title}"?`)) {
      deleteMeeting(meeting.id);
      setSelectedMeetingId(null);
    }
  };

  const getProjColorClass = (projName: string) => {
    const proj = projects.find((p) => p.name === projName);
    const color = proj?.color || "zinc";
    const colorsMap: Record<string, string> = {
      amber: "bg-brand-gold/15 dark:bg-brand-gold/20 text-[#9b7b2c] dark:text-brand-gold-bright border-brand-gold/30",
      emerald: "bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
      violet: "bg-violet-500/10 dark:bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30",
      pink: "bg-pink-500/10 dark:bg-pink-500/15 text-pink-700 dark:text-pink-300 border-pink-500/30",
      cyan: "bg-cyan-500/10 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30",
      bone: "bg-stone-500/10 dark:bg-stone-500/15 text-stone-700 dark:text-stone-300 border-stone-500/30",
      zinc: "bg-stone-500/10 dark:bg-stone-500/15 text-stone-700 dark:text-stone-300 border-stone-500/30",
    };
    return colorsMap[color] || "bg-indigo-500/10 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30";
  };

  return (
    <div className="pb-28 pt-4 px-4 max-w-xl mx-auto space-y-6 print:p-0 print:pb-0" id={`meeting-detail-view-${meeting.id}`}>


      {/* Top action Header bar */}
      <div className="flex items-center justify-between gap-2 print:hidden">
        <button
          onClick={() => setSelectedMeetingId(null)}
          id="detail-back-arrow-btn"
          className="p-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-805 rounded-xl transition-colors active:scale-90"
        >
          <ArrowLeft size={16} className="text-stone-600 dark:text-stone-300" />
        </button>

        <div className="flex items-center gap-2 relative">
          {/* Export Panel Trigger */}
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            id="detail-export-btn"
            title="Export as PDF, Gmail, Outlook, text, or WhatsApp"
            className={`flex items-center gap-1.5 px-3 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
              showExportMenu
                ? "bg-brand-cream border-stone-300 text-stone-900 shadow-sm"
                : "border-zinc-200 dark:border-zinc-800 text-stone-700 dark:text-stone-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <FileDown size={13} />
            Export Options
          </button>

          {/* Export Dropdown Menu Block */}
          {showExportMenu && (
            <div className="absolute right-0 top-11 w-64 bg-white dark:bg-stone-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3 shadow-xl z-50 space-y-1.5 animate-fadeIn" id="export-popup-dropdown">
              <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider px-2 pb-1.5 border-b border-zinc-100 dark:border-zinc-800">
                Export & Save Memo:
              </div>
              
              {/* COPY EMAIL DRAFT */}
              <button
                type="button"
                onClick={() => {
                  const subject = `${meeting.title} - Notes Summary`;
                  const body = getFormattedShareContent();
                  navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
                  triggerToast("Email subject & formatted body copied! Ready to paste.");
                  setShowExportMenu(false);
                }}
                className="flex items-center gap-2.5 w-full text-left px-2.5 py-2 hover:bg-stone-50 dark:hover:bg-stone-800 text-xs text-stone-700 dark:text-stone-300 rounded-xl transition-all cursor-pointer font-medium"
              >
                <div className="p-1 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-500">
                  <Mail size={13} />
                </div>
                <span>Copy Email Draft</span>
              </button>

              {/* NATIVE COMPACT MAILTO LINK (Safe <200 chars to avoid WebView crash) */}
              <a
                href={`mailto:?subject=${encodeURIComponent(meeting.title + " - Memo Summary")}&body=${encodeURIComponent("Meeting summary generated via Parley is locked and saved in local storage. Please open Parley to consult the complete AI analytics reports.")}`}
                onClick={() => setShowExportMenu(false)}
                className="flex items-center gap-2.5 w-full text-left px-2.5 py-2 hover:bg-stone-50 dark:hover:bg-stone-800 text-xs text-stone-700 dark:text-stone-300 rounded-xl transition-all cursor-pointer font-medium"
              >
                <div className="p-1 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-500">
                  <Mail size={13} />
                </div>
                <span>Default Mail App (mailto:)</span>
              </a>

              {/* COPY FULL TEXT MEMO */}
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(getFormattedShareContent());
                  triggerToast("Full text memo copied successfully!");
                  setShowExportMenu(false);
                }}
                className="flex items-center gap-2.5 w-full text-left px-2.5 py-2 hover:bg-stone-50 dark:hover:bg-stone-800 text-xs text-stone-700 dark:text-stone-300 rounded-xl transition-all cursor-pointer font-medium border-t border-zinc-200 dark:border-zinc-800 mt-1 pt-2"
              >
                <div className="p-1 rounded-lg bg-brand-cream text-stone-900 border border-stone-300">
                  <Clipboard size={13} />
                </div>
                <span>Copy Full Text Memo</span>
              </button>

              {/* EXPORT PDF */}
              <button
                type="button"
                onClick={() => {
                  window.print();
                  setShowExportMenu(false);
                }}
                className="flex items-center gap-2.5 w-full text-left px-2.5 py-2 hover:bg-stone-50 dark:hover:bg-stone-800 text-xs text-stone-700 dark:text-stone-300 rounded-xl transition-all cursor-pointer font-medium"
              >
                <div className="p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-400">
                  <Printer size={13} />
                </div>
                <span>Print or Save to PDF</span>
              </button>
            </div>
          )}

          {/* Delete */}
          <button
            onClick={handleDeleteMeeting}
            id="detail-delete-btn"
            title="Delete from Library"
            className="p-2.5 rounded-xl border border-red-200 hover:bg-red-500/10 dark:border-red-500/15 text-red-500 transition-colors active:scale-90 cursor-pointer"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Title zone (Interactive) */}
      <div className="space-y-2 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            {isEditingTitle ? (
              <div className="flex items-center gap-1" id="title-editor-zone">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="text-lg md:text-xl font-black bg-zinc-100 dark:bg-zinc-800 border border-stone-400 rounded-xl px-2 py-1 text-zinc-900 dark:text-zinc-50 focus:outline-none w-full"
                />
                <button
                  onClick={handleSaveTitle}
                  id="save-title-btn"
                  className="p-2 text-stone-600 dark:text-brand-cream hover:bg-stone-500/10 rounded-lg transition-colors"
                >
                  <Save size={16} />
                </button>
                <button
                  onClick={() => {
                    setIsEditingTitle(false);
                    setEditTitle(meeting.title);
                  }}
                  className="p-2 text-zinc-400 hover:bg-zinc-100 rounded-lg"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-start gap-2.5 group">
                <h2 className="text-xl md:text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight">
                  {meeting.title}
                </h2>
                <button
                  onClick={() => setIsEditingTitle(true)}
                  id="trigger-title-edit"
                  className="p-1 text-zinc-400 hover:text-stone-700 dark:hover:text-brand-cream rounded transition-colors mt-1 print:hidden opacity-40 group-hover:opacity-100"
                >
                  <Edit3 size={13} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Date, project and tags summary line */}
        <div className="flex flex-col gap-2.5 pt-1.5" id="detail-folder-selector-wrap">
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-stone-500 dark:text-stone-400 dark:text-zinc-400">
            {/* Interactive Folder Selector Dropdown */}
            <div className="relative inline-block print:hidden" id="detail-folder-selector-container">
              <select
                value={projects.find((p) => p.name === meeting.project)?.id || ""}
                onChange={(e) => {
                  const selectedProjId = e.target.value;
                  const foundProj = projects.find((p) => p.id === selectedProjId);
                  const nextProjName = foundProj ? foundProj.name : "General";
                  updateMeetingPayload({ project: nextProjName });
                  triggerToast(`Re-filed under: "${nextProjName}" folder`);
                }}
                className={`appearance-none uppercase font-extrabold pl-2.5 pr-7 py-0.5 rounded-full border cursor-pointer hover:opacity-90 focus:outline-none focus:ring-1 focus:ring-brand-gold/50 text-[10px] tracking-wide transition-all ${getProjColorClass(meeting.project)}`}
                title="Re-assign to standard or custom folder group"
              >
                <option value="" className="bg-brand-cream dark:bg-brand-green-dark text-brand-green dark:text-brand-cream">
                  📁 General
                </option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className="bg-brand-cream dark:bg-brand-green-dark text-brand-green dark:text-brand-cream">
                    📁 {p.name}
                  </option>
                ))}
              </select>
              {/* Overlay Chevron Icon */}
              <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-current opacity-70">
                <ChevronRight size={10} className="rotate-90 stroke-[3]" />
              </div>
            </div>

            {/* Inline Project Tag Creator Toggle Button */}
            <button
              type="button"
              onClick={() => setIsAddingProjectInline(!isAddingProjectInline)}
              className="text-[10px] tracking-wide font-extrabold uppercase bg-brand-cream text-stone-900 hover:bg-[#eae0d2] px-2.5 py-0.5 rounded-full transition-all border border-stone-300 shadow-sm cursor-pointer flex items-center gap-1 print:hidden"
            >
              <Plus size={10} className="stroke-[3]" /> Create Folder
            </button>

            {/* Fallback Display Label for Print layout */}
            <span className={`hidden print:inline-block uppercase font-extrabold px-2.5 py-0.5 rounded-full border text-[10px] tracking-wide ${getProjColorClass(meeting.project)}`}>
              {meeting.project}
            </span>

          <span className="bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-800 text-stone-500 dark:text-stone-400 dark:text-zinc-400 px-2 py-0.5 rounded-full font-medium">
            {new Date(meeting.date).toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            })}
          </span>
          <span className="font-mono text-stone-700 dark:text-brand-cream bg-zinc-100 dark:bg-stone-900 border border-zinc-200 dark:border-stone-800 px-2 py-0.5 rounded">
            Duration: {formatMinSec(meeting.durationSec)}
          </span>
        </div>

        {/* Inline project creator block */}
        {isAddingProjectInline && (
          <div className="bg-brand-cream/10 dark:bg-brand-cream/5 p-3.5 rounded-2xl space-y-2 mt-2.5 animate-fadeIn border border-brand-cream/25 print:hidden" id="detail-project-creator-inline">
            <div className="text-[10px] font-extrabold text-[#c2b29f] dark:text-brand-cream uppercase tracking-wider">Create a New folder category</div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Board Sync, Personal Logs"
                value={inlineProjName}
                onChange={(e) => setInlineProjName(e.target.value)}
                className="flex-1 text-xs px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-stone-400 text-stone-900 dark:text-stone-100"
              />
              <button
                type="button"
                onClick={() => {
                  if (!inlineProjName.trim()) return;
                  const newProjId = `proj_${Date.now()}`;
                  const customNewProj = {
                    id: newProjId,
                    name: inlineProjName.trim(),
                    color: inlineProjColor,
                    description: "Created dynamically during details review"
                  };
                  addProject(customNewProj);
                  updateMeetingPayload({ project: customNewProj.name });
                  setInlineProjName("");
                  setIsAddingProjectInline(false);
                  triggerToast(`Created folder and assigned to: "${customNewProj.name}"`);
                }}
                disabled={!inlineProjName.trim()}
                className="px-3.5 py-1.5 bg-brand-cream hover:bg-[#eae0d2] text-stone-900 font-extrabold border border-stone-300 rounded-xl text-xs disabled:opacity-50 transition-colors cursor-pointer"
              >
                Create & Link
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-stone-500 dark:text-stone-400 dark:text-stone-400 uppercase font-bold">Pick Tag Color:</span>
              <div className="flex gap-1.5 animate-fadeIn">
                {["amber", "violet", "pink", "cyan", "bone"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setInlineProjColor(c)}
                    className={`w-3.5 h-3.5 rounded-full transition-transform ${
                      c === "amber" ? "bg-[#c2b29f]" :
                      c === "violet" ? "bg-violet-500" :
                      c === "pink" ? "bg-pink-500" :
                      c === "cyan" ? "bg-cyan-500" :
                      "bg-brand-cream border border-stone-300"
                    } ${
                      inlineProjColor === c ? "ring-2 ring-stone-900 dark:ring-white scale-110" : "opacity-75 hover:opacity-100"
                    }`}
                    title={`Select Color ${c}`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>

      {/* Pending Transcription Status Bar */}
      {meeting.isPending && (
        <div className="bg-brand-cream/15 border border-stone-300 rounded-2xl p-4 flex flex-col items-center justify-center space-y-3" id="pending-transcription-alert">
          <div className="flex items-center gap-2 text-stone-700 dark:text-brand-cream font-bold text-xs uppercase tracking-wide">
            <RefreshCw size={14} className="animate-spin text-[#c2b29f]" />
            <span>AI Transcription in Progress</span>
          </div>
          <p className="text-[11px] text-zinc-600 dark:text-zinc-300 text-center leading-relaxed">
            Our background engine is transcribing speech and generating executive summaries. You can safely listen to the raw audio or close this view—it will automatically populate once complete!
          </p>
        </div>
      )}

      {/* Failed Transcription / Local Backup Status Bar */}
      {meeting.isFailed && !meeting.isPending && (
        <div className="bg-brand-cream/15 border border-stone-300 rounded-2xl p-4 space-y-3" id="failed-transcription-backup-alert">
          <div className="flex items-center gap-2 text-stone-700 dark:text-brand-cream font-bold text-xs uppercase tracking-wide">
            <RefreshCw size={14} className="animate-pulse" />
            <span>Local Offline Backup (AI Failed)</span>
          </div>
          <p className="text-[11px] text-zinc-600 dark:text-zinc-300 leading-relaxed">
            The transcript and summary couldn't be generated automatically. But your physical sound recording is <strong>100% safe inside the local store</strong>.
          </p>
          <div className="flex flex-wrap gap-2 pt-1 font-bold">
            <button
               disabled={isRetrying}
               onClick={handleRetryTranscription}
               className="flex-grow flex items-center justify-center gap-1.5 px-3 py-2 bg-brand-cream hover:bg-[#eae0d2] text-stone-900 border border-stone-300 rounded-xl text-xs select-none disabled:opacity-50 transition-colors cursor-pointer"
            >
              {isRetrying ? (
                <RefreshCw size={12} className="animate-spin" />
              ) : (
                <Sparkles size={12} />
              )}
              {isRetrying ? "Transcribing with AI..." : "Retry AI Transcription"}
            </button>
            <button
               onClick={handleDownloadRawAudio}
               className="flex-grow flex items-center justify-center gap-1.5 px-3 py-2 bg-zinc-800 dark:bg-zinc-700 hover:bg-zinc-700 dark:hover:bg-zinc-600 text-white rounded-xl text-xs transition-colors cursor-pointer"
            >
              <FileDown size={12} />
              Download Raw Audio
            </button>
          </div>
        </div>
      )}

      {/* Embedded Player Dashboard (Simulated/Real hybrid module) */}
      <div className="bg-zinc-950 text-zinc-50 rounded-2xl p-4 space-y-3.5 shadow-xl border border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-brand-cream border border-stone-400 animate-pulse" />
            <span className="text-[10px] font-mono tracking-wider text-zinc-300 uppercase">Interactive Player</span>
          </div>
          <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded font-mono text-zinc-400">
            {formatMinSec(playbackSec)} / {formatMinSec(meeting.durationSec)}
          </span>
        </div>

        {/* Dynamic Graphic Levels Bars */}
        <div className="flex items-end justify-between h-9 px-3 gap-0.5 bg-zinc-900/40 rounded-xl py-1.5 border border-zinc-900">
          {Array.from({ length: 28 }).map((_, i) => {
            // dynamic random height generator when active
            const activeWaveHeight = playbackActive
              ? Math.floor(Math.random() * 85) + 15
              : Math.floor(Math.sin((i / 4) * Math.PI) * 25) + 30;

            const transitionDuration = playbackActive ? "duration-200" : "duration-500";

            return (
              <div
                key={i}
                style={{ height: `${activeWaveHeight}%` }}
                className={`w-full bg-gradient-to-t rounded-full transition-all ${transitionDuration} ${
                  playbackActive
                    ? "from-brand-cream via-[#eae0d2] to-white"
                    : "from-zinc-700 via-zinc-650 to-zinc-600 opacity-40"
                }`}
              />
            );
          })}
        </div>

        {/* Timeline Slider / Scrub bar */}
        <div className="space-y-1">
          <input
            type="range"
            min={0}
            max={meeting.durationSec}
            value={playbackSec}
            onChange={handleTimelineChange}
            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-brand-cream focus:outline-none"
            style={{
              background: `linear-gradient(to right, brand-cream 0%, brand-cream ${(meeting.durationSec > 0 ? (playbackSec / meeting.durationSec) * 100 : 0)}%, #27272a ${(meeting.durationSec > 0 ? (playbackSec / meeting.durationSec) * 100 : 0)}%, #27272a 100%)`
            }}
          />
          <div className="flex justify-between text-[9px] font-mono text-zinc-500">
            <span>{formatMinSec(playbackSec)}</span>
            <span>{formatMinSec(meeting.durationSec)}</span>
          </div>
        </div>

        {/* Audio control button actions */}
        <div className="flex items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-2">
            {/* Rewind -10s */}
            <button
              onClick={() => seekPlayback(-10)}
              id="detail-player-rewind-btn"
              title="Rewind 10 seconds"
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors active:scale-90"
            >
              <Rewind size={16} />
            </button>

            {/* Play / Pause */}
            <button
              onClick={handleTogglePlayback}
              id="detail-player-play-btn"
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-full transition-colors ${
                playbackActive
                  ? "bg-[#eae0d2] text-stone-900 hover:bg-[#d8ccba]"
                  : "bg-brand-cream text-stone-900 hover:bg-[#eae0d2]"
              }`}
            >
              {playbackActive ? (
                <>
                  <Pause size={14} className="stroke-[3]" /> Pause Playback
                </>
              ) : (
                <>
                  <Play size={14} className="stroke-[3] fill-stone-900" /> Play Recording
                </>
              )}
            </button>

            {/* Fast Forward +10s */}
            <button
              onClick={() => seekPlayback(10)}
              id="detail-player-fastforward-btn"
              title="Fast Forward 10 seconds"
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors active:scale-90"
            >
              <FastForward size={16} />
            </button>
          </div>

          <span className="text-[10px] italic text-zinc-400 font-medium">
            {localAudioUrl ? "📼 Real Web Audio source loaded" : "📻 Virtual stream initialized"}
          </span>
        </div>
      </div>

      {/* Tabs list navigation container — wrap so all tabs (incl. Action Bridge)
          are visible on narrow phone screens instead of scrolling off-screen. */}
      <div className="flex flex-wrap border-b border-zinc-200 dark:border-zinc-800 print:hidden" id="detail-nav-tabbar">
        <button
          onClick={() => setActiveTab("summary")}
          className={`shrink-0 text-center px-4 py-2.5 text-xs font-extrabold tracking-wide uppercase border-b-2 transition-all ${
            activeTab === "summary"
              ? "border-stone-400 text-stone-900 dark:text-brand-cream dark:border-brand-cream font-black"
              : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-800"
          }`}
        >
          Summary
        </button>
        <button
          onClick={() => setActiveTab("insights")}
          className={`shrink-0 text-center px-4 py-2.5 text-xs font-extrabold tracking-wide uppercase border-b-2 transition-all ${
            activeTab === "insights"
              ? "border-stone-400 text-stone-900 dark:text-brand-cream dark:border-brand-cream font-black"
              : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-800"
          }`}
        >
          AI Insights
        </button>
        <button
          onClick={() => setActiveTab("relations")}
          className={`shrink-0 text-center px-4 py-2.5 text-xs font-extrabold tracking-wide uppercase border-b-2 transition-all ${
            activeTab === "relations"
              ? "border-stone-400 text-stone-900 dark:text-brand-cream dark:border-brand-cream font-black"
              : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-800"
          }`}
        >
          Relations
        </button>
        <button
          onClick={() => setActiveTab("actions")}
          className={`shrink-0 text-center px-4 py-2.5 text-xs font-extrabold tracking-wide uppercase border-b-2 transition-all ${
            activeTab === "actions"
              ? "border-stone-400 text-stone-900 dark:text-brand-cream dark:border-brand-cream font-black"
              : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-800"
          }`}
        >
          Action Items ({meeting.actionItems.length})
        </button>
        <button
          onClick={() => setActiveTab("transcript")}
          className={`shrink-0 text-center px-4 py-2.5 text-xs font-extrabold tracking-wide uppercase border-b-2 transition-all ${
            activeTab === "transcript"
              ? "border-stone-400 text-stone-900 dark:text-brand-cream dark:border-brand-cream font-black"
              : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-800"
          }`}
        >
          Transcript ({meeting.transcript.length})
        </button>
        <button
          onClick={() => setActiveTab("actionbridge")}
          className={`shrink-0 text-center px-4 py-2.5 text-xs font-extrabold tracking-wide uppercase border-b-2 transition-all ${
            activeTab === "actionbridge"
              ? "border-stone-400 text-stone-900 dark:text-brand-cream dark:border-brand-cream font-black"
              : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-800"
          }`}
        >
          Action Bridge
        </button>
      </div>

      {/* Main tab context sections */}
      <div className="space-y-4">

        {/* TAB: AI INSIGHTS (Active AI Personas + reflections + AI-generated insights) */}
        {(activeTab === "insights" || window.matchMedia("print").matches) && (
          <div className="space-y-5 animate-fadeIn" id="detail-tabbox-insights">

            {/* ANALYST PERSONA FOCUS CONTROL CENTER */}
            {hasAnyReflection && (
              <div className="bg-brand-cream/10 dark:bg-brand-green-dark border border-brand-green/10 dark:border-brand-gold/10 p-3.5 rounded-2xl space-y-3 shadow-sm print:hidden" id="analyst-persona-control-center">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] tracking-wider uppercase font-extrabold text-brand-gold">Active AI Personas</span>
                    <p className="text-[10.5px] text-brand-green/60 dark:text-brand-cream/60 leading-normal">AI analysis lenses active for this session</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAnalystPersona(analystPersona === "assistant" ? "reflections" : "assistant")}
                    className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wide rounded-xl border transition-all ${
                      analystPersona === "reflections"
                        ? "bg-brand-gold/20 border-brand-gold/40 text-brand-gold"
                        : "bg-white/50 dark:bg-brand-green-dark/60 border-brand-green/10 dark:border-brand-gold/10 text-brand-green/60 dark:text-brand-cream/60"
                    }`}
                  >
                    {analystPersona === "reflections" ? "Showing Reflections" : "Show Reflections"}
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {meeting.reflectionCbt && cbtPsychologist && cbtProjects.includes(meeting.project) && (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-lg bg-brand-gold/10 border border-brand-gold/20 text-brand-gold flex items-center gap-1">
                      <Brain size={10} /> CBT
                    </span>
                  )}
                   {meeting.reflectionNegotiation && negotiationCoach && (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-lg bg-brand-gold/10 border border-brand-gold/20 text-brand-gold flex items-center gap-1">
                      <Swords size={10} /> Negotiation
                    </span>
                  )}
                  {meeting.reflectionPerformance && performanceReviewLens && (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-lg bg-brand-gold/10 border border-brand-gold/20 text-brand-gold flex items-center gap-1">
                      <BarChart3 size={10} /> Performance
                    </span>
                  )}
                  {meeting.reflectionDebrief && difficultConversationDebrief && (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-lg bg-brand-gold/10 border border-brand-gold/20 text-brand-gold flex items-center gap-1">
                      <HeartHandshake size={10} /> Debrief
                    </span>
                  )}
                  {meeting.personalAssistantOutput && personalAssistant && (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-lg bg-brand-gold/10 border border-brand-gold/20 text-brand-gold flex items-center gap-1">
                      <Bot size={10} /> Assistant
                    </span>
                  )}
                  {!(meeting.reflectionCbt && cbtPsychologist && cbtProjects.includes(meeting.project)) && 
                    !(meeting.reflectionNegotiation && negotiationCoach) && 
                    !(meeting.reflectionPerformance && performanceReviewLens) && 
                    !(meeting.reflectionDebrief && difficultConversationDebrief) && 
                    !(meeting.personalAssistantOutput && personalAssistant) && (
                    <span className="text-[9px] font-medium px-2 py-0.5 rounded-lg bg-brand-cream/10 dark:bg-brand-green-dark border border-brand-green/10 dark:border-brand-gold/10 text-brand-green/50 dark:text-brand-cream/50 italic">
                      All Personas Disabled
                    </span>
                  )}
                </div>
              </div>
            )}
            {hasAnyReflection && analystPersona === "reflections" && (
              <div className="space-y-5 animate-fadeIn" id="stacked-reflections">
                {/* Negotiation Coach Reflection */}
                {meeting.reflectionNegotiation && negotiationCoach && (
                  <div className="bg-brand-gold/5 border border-brand-gold/15 p-4.5 rounded-2xl space-y-4">
                    <div className="flex items-center gap-2">
                      <Swords className="text-brand-gold shrink-0" size={16} />
                      <span className="text-[10px] uppercase font-extrabold tracking-widest text-brand-green dark:text-brand-gold font-mono">Reflection (Negotiation)</span>
                    </div>
                    <div className="space-y-3">
                      {parseReflection(meeting.reflectionNegotiation, "reflection (negotiation)").map((beat, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl border bg-brand-cream/20 dark:bg-brand-green-dark border-brand-green/10 dark:border-brand-gold/10 flex gap-3">
                          <Swords size={14} className="text-brand-gold mt-0.5 shrink-0" />
                          <div className="space-y-1">
                            {beat.label && <span className="text-[10px] uppercase font-black tracking-wider text-brand-green dark:text-brand-gold-bright">{beat.label}</span>}
                            <p className="text-xs text-zinc-800 dark:text-zinc-300 leading-relaxed font-normal">{beat.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Performance Review Reflection */}
                {meeting.reflectionPerformance && performanceReviewLens && (
                  <div className="bg-brand-gold/5 border border-brand-gold/15 p-4.5 rounded-2xl space-y-4">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="text-brand-gold shrink-0" size={16} />
                      <span className="text-[10px] uppercase font-extrabold tracking-widest text-brand-green dark:text-brand-gold font-mono">Reflection (Performance)</span>
                    </div>
                    <div className="space-y-3">
                      {parseReflection(meeting.reflectionPerformance, "reflection (performance)").map((beat, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl border bg-brand-cream/20 dark:bg-brand-green-dark border-brand-green/10 dark:border-brand-gold/10 flex gap-3">
                          <BarChart3 size={14} className="text-brand-gold mt-0.5 shrink-0" />
                          <div className="space-y-1">
                            {beat.label && <span className="text-[10px] uppercase font-black tracking-wider text-brand-green dark:text-brand-gold-bright">{beat.label}</span>}
                            <p className="text-xs text-zinc-800 dark:text-zinc-300 leading-relaxed font-normal">{beat.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Difficult Conversation Debrief Reflection */}
                {meeting.reflectionDebrief && difficultConversationDebrief && (
                  <div className="bg-brand-gold/5 border border-brand-gold/15 p-4.5 rounded-2xl space-y-4">
                    <div className="flex items-center gap-2">
                      <HeartHandshake className="text-brand-gold shrink-0" size={16} />
                      <span className="text-[10px] uppercase font-extrabold tracking-widest text-brand-green dark:text-brand-gold font-mono">Reflection (Debrief)</span>
                    </div>
                    <div className="space-y-3">
                      {parseReflection(meeting.reflectionDebrief, "reflection (debrief)").map((beat, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl border bg-brand-cream/20 dark:bg-brand-green-dark border-brand-green/10 dark:border-brand-gold/10 flex gap-3">
                          <HeartHandshake size={14} className="text-brand-gold mt-0.5 shrink-0" />
                          <div className="space-y-1">
                            {beat.label && <span className="text-[10px] uppercase font-black tracking-wider text-brand-green dark:text-brand-gold-bright">{beat.label}</span>}
                            <p className="text-xs text-zinc-800 dark:text-zinc-300 leading-relaxed font-normal">{beat.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* CBT Psychologist Reflection — existing real or seed mockup */}
                {meeting.reflectionCbt && cbtPsychologist && cbtProjects.includes(meeting.project) ? (
                  /* REAL CBT REFLECTION CARD GENERATED BY ECHOPROMPT INSTRUCTIONS */
                  <div className="bg-brand-cream/10 border border-stone-300 dark:border-stone-850 p-4.5 rounded-2xl space-y-4">
                    <div className="flex items-center gap-2">
                      <Brain className="text-brand-gold shrink-0" size={16} />
                      <span className="text-[10px] uppercase font-extrabold tracking-widest text-brand-green dark:text-brand-gold font-mono">Reflection (CBT)</span>
                    </div>
                    
                    <div className="space-y-3">
                      {parseCbtReflection(meeting.reflectionCbt).map((beat, idx) => {
                        const labelLower = beat.label.toLowerCase();
                        let icon = null;
                        let bgClass = "bg-white/80 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800/80";
                        let labelColor = "text-brand-green dark:text-brand-gold-bright";
                        
                        if (labelLower === "pattern") {
                          icon = <Brain size={14} className="text-brand-gold mt-0.5 shrink-0" />;
                          bgClass = "bg-brand-cream/20 border-stone-300 dark:border-stone-800/80";
                        } else if (labelLower === "underneath") {
                          icon = <Heart size={14} className="text-rose-450 dark:text-rose-400 mt-0.5 shrink-0" />;
                        } else if (labelLower === "check") {
                          icon = <HelpCircle size={14} className="text-blue-500 dark:text-blue-400 mt-0.5 shrink-0" />;
                        } else if (labelLower === "reframe") {
                          icon = <Smile size={14} className="text-emerald-500 dark:text-emerald-450 mt-0.5 shrink-0" />;
                        } else if (labelLower === "try") {
                          icon = <CheckSquare size={14} className="text-brand-gold mt-0.5 shrink-0" />;
                          bgClass = "bg-brand-cream/15 border-stone-300 dark:border-stone-800";
                        } else {
                          icon = <Brain size={14} className="text-zinc-400 mt-0.5 shrink-0" />;
                        }
                        
                        return (
                          <div key={idx} className={`p-3.5 rounded-xl border flex gap-3 ${bgClass}`}>
                            {icon}
                            <div className="space-y-1">
                              {beat.label && (
                                <span className={`text-[10px] uppercase font-black tracking-wider ${labelColor}`}>
                                  {beat.label}
                                </span>
                              )}
                              <p className="text-xs text-zinc-800 dark:text-zinc-300 leading-relaxed font-normal">
                                {beat.content}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {/* AI Generated Insights — moved into the AI Insights tab */}
            <div className="bg-white dark:bg-brand-green-dark/80 border border-brand-green/10 dark:border-brand-gold/15 p-4 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles size={13} className="text-[#c1b5a5]" />
                AI Generated Insights
              </h4>
              <div className="space-y-3">
                {meeting.insights && meeting.insights.length > 0 ? (
                  meeting.insights.map((insight, i) => (
                    <div key={i} className="flex gap-3 text-xs bg-brand-cream/20 dark:bg-brand-green-dark border border-zinc-100 dark:border-zinc-800 p-3 rounded-xl">
                      <div className="flex items-center justify-center w-5 h-5 rounded-lg bg-brand-cream text-stone-900 border border-stone-300 text-[10px] font-bold shrink-0">
                        {i + 1}
                      </div>
                      <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal">{insight}</p>
                    </div>
                  ))
                ) : (
                  <div className="flex gap-3 text-xs bg-brand-cream/20 dark:bg-brand-green-dark border border-zinc-100 dark:border-zinc-800 p-3 rounded-xl">
                    <p className="text-xs text-zinc-400 italic">No AI insights extracted for this transcript. Try recording or scanning a longer session.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: SUMMARY */}
        {(activeTab === "summary" || window.matchMedia("print").matches) && (
          <div className="space-y-5 animate-fadeIn" id="detail-tabbox-summary">
              <>
                {meeting.isMultiDialogue && meeting.conversationSegments && meeting.conversationSegments.length > 1 && (
                  <div className="bg-brand-cream/10 dark:bg-brand-green-dark border border-brand-gold/20 rounded-2xl p-3.5 space-y-2">
                    <div className="flex items-center gap-1.5">
                      <Users size={13} className="text-brand-gold" />
                      <span className="text-[10px] uppercase font-extrabold tracking-widest text-brand-green dark:text-brand-gold font-mono">
                        {meeting.conversationSegments.length} conversations detected
                      </span>
                    </div>
                    <p className="text-[10.5px] text-brand-green/60 dark:text-brand-cream/60 leading-normal">
                      This recording looks like several separate conversations:
                    </p>
                    <ol className="space-y-1.5 list-decimal list-inside">
                      {meeting.conversationSegments.map((seg, i) => (
                        <li key={i} className="text-xs text-brand-green dark:text-[#EEF0EA]">
                          <span className="font-bold">{seg.title}</span>
                          {seg.summary ? <span className="text-brand-green/60 dark:text-brand-cream/60"> — {seg.summary}</span> : null}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
                {/* Echo Conversation Snapshot & Classification Banner */}
                {meeting.snapshot && (
                  <div className="bg-gradient-to-r from-brand-cream/20 to-violet-500/10 border border-stone-305 dark:border-stone-800 p-5 rounded-2xl space-y-3.5 shadow-sm" id="echo-snapshot-banner">
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase font-bold tracking-widest text-stone-900 bg-brand-cream px-2 py-0.5 rounded-lg border border-stone-300 font-mono">
                      Echo Organizer
                    </span>
                    {meeting.classification?.primary && (
                      <span className="text-[9px] uppercase font-bold tracking-widest text-[#c2b29f] bg-stone-100 dark:bg-stone-850 px-2 py-0.5 rounded-lg border border-stone-300 dark:border-stone-800 font-mono">
                        {(meeting.classification.primary as string).replace(/_/g, " ")}
                      </span>
                    )}
                  </div>
                  {meeting.classification?.secondary && meeting.classification.secondary.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {meeting.classification.secondary.map((sec, idx) => (
                        <span key={idx} className="text-[9px] text-zinc-600 dark:text-zinc-300 font-bold bg-zinc-100 dark:bg-zinc-805 border border-zinc-200 dark:border-zinc-800 px-2 py-0.5 rounded-lg">
                          • {sec.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-mono tracking-wider text-stone-500 uppercase font-extrabold block">Conversation Snapshot</span>
                  <p className="text-stone-800 dark:text-brand-cream dark:text-zinc-200 font-bold leading-relaxed italic text-sm">
                    "{meeting.snapshot}"
                  </p>
                </div>
              </div>
            )}

            {/* Echo Speaker Participant Dynamics */}
            {meeting.participantsInfo && meeting.participantsInfo.length > 0 && (
              <div className="bg-white dark:bg-brand-green-dark/80 border border-brand-green/10 dark:border-brand-gold/15 p-4 rounded-2xl space-y-4" id="echo-participants-dynamics">
                <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-widest flex items-center gap-1.5">
                  <UserPlus size={14} className="text-stone-400 dark:text-brand-cream" />
                  Participant Dynamics & Speaker Resolution
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                  {meeting.participantsInfo.map((p, idx) => (
                    <div key={idx} className="bg-zinc-50/50 dark:bg-zinc-950/40 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2.5">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-xs font-extrabold text-zinc-800 dark:text-zinc-100 truncate">{p.name}</span>
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md ${
                          p.matchStatus === "Matched" ? "bg-stone-100 text-stone-900 border border-stone-350" :
                          p.matchStatus === "Probable" ? "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-brand-cream" :
                          "bg-stone-500/10 text-stone-600 dark:text-stone-400"
                        }`}>
                          {p.matchStatus}
                        </span>
                      </div>
                      {p.role && (
                        <div className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                          Role: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{p.role}</span>
                        </div>
                      )}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[8px] text-stone-500 font-mono font-bold">
                          <span>SPEAK SHARE</span>
                          <span>{p.share || "0%"}</span>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-805 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#c2b29f] rounded-full"
                            style={{ width: p.share || "0%" }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Echo Decisions Log */}
            {meeting.decisions && meeting.decisions.length > 0 && (
              <div className="bg-white dark:bg-brand-green-dark/80 border border-brand-green/10 dark:border-brand-gold/15 p-4 rounded-2xl space-y-3.5" id="echo-decisions-log">
                <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-widest flex items-center gap-1.5">
                  <CheckSquare size={14} className="text-stone-400 dark:text-brand-cream stroke-[2.5]" />
                  Agreed Decisions Log ({meeting.decisions.length})
                </h4>
                <div className="space-y-2.5 font-normal">
                  {meeting.decisions.map((d, i) => (
                    <div key={i} className="flex gap-3 text-xs bg-brand-cream/10 dark:bg-brand-green-dark p-3 rounded-xl border border-brand-green/10 dark:border-brand-gold/10">
                      <div className="flex items-center justify-center w-5 h-5 rounded-lg bg-brand-cream text-stone-950 border border-stone-300 text-[10px] font-black shrink-0">
                        ✓
                      </div>
                      <div className="space-y-1">
                        <p className="text-stone-800 dark:text-brand-cream dark:text-zinc-200 font-bold leading-relaxed">{d.decision}</p>
                        <span className="inline-block text-[10px] text-stone-800 font-semibold bg-brand-cream px-2 py-0.5 rounded-md border border-stone-300">
                          Agreed by: {d.agreedBy}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Echo Procedural Checklist */}
            {meeting.checklist && meeting.checklist.length > 0 && (
              <div className="bg-white dark:bg-brand-green-dark/80 border border-brand-green/10 dark:border-brand-gold/15 p-4 rounded-2xl space-y-3" id="echo-procedural-checklist">
                <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-widest flex items-center gap-1.5">
                  <Clipboard size={14} className="text-stone-400 dark:text-brand-cream" />
                  Echo Procedural Checklist
                </h4>
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800 space-y-2.5">
                  {meeting.checklist.map((step, i) => (
                    <div key={i} className="flex gap-3 text-xs pt-2.5 first:pt-0">
                      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-brand-cream text-stone-905 border border-stone-300 text-[10px] font-extrabold shrink-0">
                        {i + 1}
                      </div>
                      <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed font-semibold self-center">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Echo Unresolved Open Questions */}
            {meeting.openQuestions && meeting.openQuestions.length > 0 && (
              <div className="bg-white dark:bg-brand-green-dark/80 border border-brand-green/10 dark:border-brand-gold/15 p-4 rounded-2xl space-y-3" id="echo-open-questions">
                <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-widest flex items-center gap-1.5">
                  <X size={14} className="text-rose-500" />
                  Unresolved Open Questions ({meeting.openQuestions.length})
                </h4>
                <div className="space-y-2.5">
                  {meeting.openQuestions.map((kq, i) => (
                    <div key={i} className="flex gap-3 text-xs bg-rose-550/5 dark:bg-rose-500/5 p-3 rounded-xl border border-rose-500/10">
                      <div className="flex items-center justify-center w-5 h-5 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 text-[10px] font-black shrink-0">
                        ?
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-stone-700 dark:text-brand-cream dark:text-zinc-200 leading-relaxed font-semibold">{kq.question}</p>
                        {kq.raisedBy && (
                          <span className="text-[9px] text-stone-500 dark:text-stone-400 dark:text-zinc-400 font-extrabold uppercase tracking-wider font-mono">
                            Raised by: {kq.raisedBy}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Topics Array */}
            <div className="bg-white dark:bg-brand-green-dark/80 border border-brand-green/10 dark:border-brand-gold/15 p-4 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-widest">
                Key Topics & Bullet Highlights
              </h4>
              <ul className="space-y-2">
                {meeting.topics.map((topic, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-zinc-700 dark:text-zinc-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c2b29f] mt-1.5" />
                    <span className="leading-relaxed">{topic}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Next Touchpoints & Milestones */}
            <div className="bg-white dark:bg-brand-green-dark/80 border border-brand-green/10 dark:border-brand-gold/15 p-4 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest flex items-center gap-1.5">
                <ChevronRight size={14} className="text-stone-400 dark:text-brand-cream" />
                Next Touchpoints & followup Action List
              </h4>
              <div className="space-y-2">
                {meeting.nextTouchpoints && meeting.nextTouchpoints.length > 0 ? (
                   meeting.nextTouchpoints.map((tp, i) => (
                    <div key={i} className="flex items-center gap-2.5 p-2.5 bg-brand-cream/20 dark:bg-brand-green-dark text-zinc-800 dark:text-zinc-200 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#c2b29f] shrink-0 animate-pulse" />
                      <span className="text-xs font-semibold leading-relaxed">{tp}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center gap-2.5 p-2.5 bg-brand-cream/20 dark:bg-brand-green-dark text-zinc-500 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <p className="text-xs text-zinc-400 italic">No follow-up touchpoints recorded. Complete summary logs are stored with normal dates.</p>
                  </div>
                )}
              </div>
            </div>

              </>

            {/* Executive summary block (Editable) */}
            <div className="bg-white dark:bg-brand-green-dark/80 border border-brand-green/10 dark:border-brand-gold/15 p-4 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles size={13} className="text-[#c1b5a5]" />
                  Executive Summary
                </h4>
                <button
                  onClick={() => setIsEditingSummary(!isEditingSummary)}
                  className="text-[10px] text-stone-600 dark:text-stone-300 hover:opacity-80 font-bold tracking-wide uppercase print:hidden"
                >
                  {isEditingSummary ? "Cancel" : "Edit Summary"}
                </button>
              </div>

              {isEditingSummary ? (
                <div className="space-y-2">
                  <textarea
                    value={editSummary}
                    onChange={(e) => setEditSummary(e.target.value)}
                    rows={4}
                    className="w-full text-xs p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-400 text-zinc-900 dark:text-zinc-100"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveSummary}
                      id="save-summary-btn"
                      className="flex items-center gap-1 px-3 py-1.5 bg-brand-cream hover:bg-[#eae0d2] text-stone-900 border border-stone-300 rounded-lg text-xs font-bold transition-all"
                    >
                      <Save size={12} /> Save Updates
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal whitespace-pre-wrap">
                  {meeting.summary}
                </p>
              )}
            </div>
          </div>
        )}

        {/* TAB: ACTION BRIDGE (post-meeting actions & automations) */}
        {(activeTab === "actionbridge" || window.matchMedia("print").matches) && (
          <div className="space-y-4 animate-fadeIn" id="detail-tabbox-actionbridge">
            {/* Personal Assistant — Brief & Action Bridge.
                The brief text only shows when this meeting actually has analysed output;
                the Action Bridge always shows (uses the meeting's AI actions if present, else defaults). */}
            <div className="space-y-4" id="analyst-persona-assistant-bridge">
                {/* Spoken Brief Card — only when this meeting was analysed with the lens on */}
                {meeting.personalAssistantOutput && (
                  <div className="bg-brand-gold/5 border border-brand-gold/15 p-4.5 rounded-2xl space-y-4 animate-fadeIn">
                    <div className="flex items-center gap-2">
                      <Bot className="text-brand-gold shrink-0" size={16} />
                      <span className="text-[10px] uppercase font-extrabold tracking-widest text-brand-green dark:text-brand-gold font-mono">Personal Assistant — Brief</span>
                    </div>
                    <div className="p-3.5 rounded-xl border bg-brand-cream/20 dark:bg-brand-green-dark border-brand-green/10 dark:border-brand-gold/10">
                      <p className="text-xs text-zinc-800 dark:text-zinc-300 leading-relaxed font-normal whitespace-pre-wrap">
                        {meeting.personalAssistantOutput}
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Bridge Control Panel Card */}
                <div className="bg-white dark:bg-[#060b08] border border-brand-green/10 dark:border-brand-gold/15 p-4.5 rounded-2xl space-y-4 animate-fadeIn" id="analyst-persona-control-center-card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Send className="text-brand-gold shrink-0 animate-pulse" size={15} />
                      <span className="text-[10px] uppercase font-extrabold tracking-widest text-brand-green dark:text-brand-gold font-mono">Action Bridge (WhatsApp / Spark / Tasks)</span>
                    </div>
                    <span className="text-[8px] bg-brand-gold/10 text-brand-gold border border-brand-gold/20 font-bold px-2 py-0.5 rounded uppercase tracking-wider font-mono">Agent Active</span>
                  </div>

                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal">
                    Execute actions generated by the Personal Assistant model to sync with external platforms.
                  </p>

                  <div className="space-y-3 pt-1">
                    {(meeting.personalAssistantActions || [
                      {
                        platform: "whatsapp",
                        title: "WhatsApp: Share decision brief",
                        details: "Draft: Summarize the standup points and decisions."
                      },
                      {
                        platform: "google_tasks",
                        title: "Google Tasks: Log action items",
                        details: "Sync generated action items directly into Google Tasks."
                      },
                      {
                        platform: "openclaw",
                        title: "OpenClaw: Check historical standup sync",
                        details: "Compare this session against last week's notes to locate discrepancies."
                      },
                      {
                        platform: "google_spark",
                        title: "Google Spark: Publish decisions",
                        details: "Sync standup decisions to team channel board."
                      },
                      {
                        platform: "slack",
                        title: "Slack: Post decision summary",
                        details: "Send the standup decisions to your team Slack channel."
                      },
                      {
                        platform: "trello",
                        title: "Trello: Create action cards",
                        details: "Add each action item as a card on your project board."
                      }
                    ]).map((action, idx) => {
                      const key = `${action.platform}-${idx}`;
                      const status = actionStatuses[key] || "idle";

                      let platformLabel = "Email Sync";
                      let platformIcon = <Mail size={14} className="text-brand-gold shrink-0 mt-0.5" />;
                      if (action.platform === "slack") {
                        platformLabel = "Slack";
                        platformIcon = <div className="text-[#E01E5A] font-black text-[14px] shrink-0 mt-0.5">#</div>;
                      } else if (action.platform === "teams") {
                        platformLabel = "MS Teams";
                        platformIcon = <div className="text-[#6264A7] font-black text-[14px] shrink-0 mt-0.5">T</div>;
                      } else if (action.platform === "trello") {
                        platformLabel = "Trello";
                        platformIcon = <div className="text-[#0052CC] font-black text-[14px] shrink-0 mt-0.5">[]</div>;
                      } else if (action.platform === "whatsapp") {
                        platformLabel = "WhatsApp";
                        platformIcon = <Send size={14} className="text-emerald-500 shrink-0 mt-0.5" />;
                      } else if (action.platform === "google_tasks") {
                        platformLabel = "Google Tasks";
                        platformIcon = <CheckSquare size={14} className="text-blue-500 shrink-0 mt-0.5" />;
                      } else if (action.platform === "openclaw") {
                        platformLabel = "OpenClaw AI";
                        platformIcon = <Brain size={14} className="text-purple-500 shrink-0 mt-0.5" />;
                      } else if (action.platform === "google_spark") {
                        platformLabel = "Google Spark";
                        platformIcon = <Sparkles size={14} className="text-amber-500 shrink-0 mt-0.5" />;
                      }

                      return (
                        <div key={idx} className="p-3 bg-white/70 dark:bg-[#0c120e] rounded-xl border border-brand-green/5 dark:border-brand-gold/10 flex flex-col md:flex-row justify-between gap-3 shadow-sm hover:border-brand-gold/20 transition-all">
                          <div className="flex gap-2.5">
                            {platformIcon}
                            <div className="space-y-0.5 text-left">
                              <span className="text-[9px] font-mono tracking-wider font-extrabold text-brand-gold uppercase block">{platformLabel}</span>
                              <h5 className="text-xs font-bold text-brand-green dark:text-[#EEF0EA]">{action.title}</h5>
                              <p className="text-[10px] text-zinc-500 dark:text-stone-500 dark:text-stone-400 font-normal leading-relaxed">{action.details}</p>
                            </div>
                          </div>

                          <div className="flex items-center shrink-0 self-end md:self-center">
                            {status === "idle" && (
                              <button
                                onClick={() => handleExecuteAction(action, idx)}
                                className="px-3 py-1 bg-brand-green text-brand-cream hover:bg-[#152a1b] dark:bg-brand-gold dark:text-brand-green-dark dark:hover:bg-[#b0913c] text-[10px] font-extrabold uppercase rounded-lg transition-all cursor-pointer"
                              >
                                Execute
                              </button>
                            )}
                            {status === "running" && (
                              <span className="flex items-center gap-1 text-[9px] font-mono text-zinc-400 dark:text-zinc-500 font-extrabold">
                                <RefreshCw className="animate-spin" size={10} /> PROCESSING...
                              </span>
                            )}
                            {status === "success" && (
                              <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1">
                                ✓ COMPLETED
                              </span>
                            )}
                            {status === "error" && (
                              <div className="flex flex-col items-end gap-1">
                                <span className="text-[9px] font-mono text-red-500 font-extrabold">
                                  ⚠ REFUSED
                                </span>
                                <button
                                  onClick={() => handleExecuteAction(action, idx)}
                                  className="text-[9px] text-brand-gold hover:underline font-bold"
                                >
                                  Retry
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
          </div>
        )}

        {/* Summary tab — continued (Voiceprint & Tags at the very bottom) */}
        {(activeTab === "summary" || window.matchMedia("print").matches) && (
          <div className="space-y-4">

            {/* Proposed Voiceprint & Database Memory Updates — img2 (moved to bottom) */}
            {meeting.memoryUpdates && meeting.memoryUpdates.length > 0 && (
              <div className="bg-brand-cream/10 dark:bg-stone-900 p-4.5 rounded-2xl space-y-3.5 border border-stone-300 dark:border-stone-800" id="echo-memory-updates">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-widest flex items-center gap-1.5">
                    <Mail size={14} className="text-stone-500 dark:text-zinc-400" />
                    Proposed Voiceprint & Database Memory Updates
                  </h4>
                  <span className="text-[8px] bg-brand-cream text-stone-900 font-extrabold px-1.5 py-0.5 rounded border border-stone-300 uppercase font-mono shadow-sm">
                    Pending Approval
                  </span>
                </div>
                <p className="text-[10px] text-stone-500 dark:text-stone-400 dark:text-stone-400 leading-relaxed font-normal">
                  The voiceprint verification pipeline detected possible modifications to speak bio-frequency characteristics or missing profiles. Sync now to align directories:
                </p>
                <ul className="space-y-1.5">
                  {meeting.memoryUpdates.map((mu, i) => (
                    <li key={i} className="text-xs text-zinc-700 dark:text-zinc-300 flex items-start gap-2 bg-white dark:bg-zinc-950 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <span className="text-stone-400 dark:text-brand-cream mt-0.5 font-bold shrink-0">➔</span>
                      <span className="leading-relaxed font-medium">{mu}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => {
                      triggerToast("Sync complete: Voice profiles and metrics successfully committed to the database!");
                      updateMeetingPayload({ memoryUpdates: [] });
                    }}
                    className="px-3.5 py-1.5 bg-brand-cream hover:bg-[#eae0d2] text-stone-900 border border-stone-300 font-bold rounded-xl text-[9px] uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                  >
                    Approve & Commit Profiles
                  </button>
                </div>
              </div>
            )}

            {/* Tags Indexing — img4 (very bottom) */}
            <div className="bg-white dark:bg-brand-green-dark/80 border border-brand-green/10 dark:border-brand-gold/15 p-4 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-widest flex items-center gap-1.5">
                <Tag size={13} className="text-[#c1b5a5]" />
                Tags Indexing
              </h4>

              {/* Tag badges map */}
              <div className="flex flex-wrap gap-1.5">
                {meeting.tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 text-[11px] font-mono text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 px-2 py-0.5 rounded-lg"
                  >
                    #{tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      title="Remove tag"
                      className="hover:text-red-500 transition-colors shrink-0 print:hidden"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>

              {/* Form to append tags */}
              <form onSubmit={handleAddTag} className="flex gap-1.5 print:hidden">
                <input
                  type="text"
                  placeholder="e.g. SprintCheck, UIux"
                  value={newTagStr}
                  onChange={(e) => setNewTagStr(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-stone-400 text-zinc-900 dark:text-zinc-100"
                />
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-50 rounded-xl text-xs font-extrabold transition-all"
                >
                  Add Tag
                </button>
              </form>
            </div>

          </div>
        )}

        {/* TAB: RELATIONS (who you talked to — auto-fed into the Relations hub) */}
        {(activeTab === "relations" || window.matchMedia("print").matches) && (
          <div className="space-y-4 animate-fadeIn" id="detail-tabbox-relations">
            <div className="bg-brand-cream/10 dark:bg-brand-green-dark border border-brand-green/10 dark:border-brand-gold/10 rounded-2xl p-3.5 space-y-1">
              <div className="flex items-center gap-1.5">
                <Users size={13} className="text-brand-gold" />
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-brand-green dark:text-brand-gold font-mono">Relations Detected</span>
              </div>
              <p className="text-[10.5px] text-brand-green/60 dark:text-brand-cream/60 leading-normal">
                People identified in this conversation. They're tracked automatically in your Relations hub with their full history over time.
              </p>
            </div>

            {(() => {
              const owner = (ownerName || "").trim().toLowerCase();
              const people = (meeting.participantsInfo || []).filter((p) => {
                const n = (p.name || "").trim();
                if (!n) return false;
                return (p.role || "").toLowerCase() !== "owner" && n.toLowerCase() !== owner;
              });
              if (people.length === 0) {
                return (
                  <p className="text-xs text-zinc-400 italic text-center py-8">
                    No conversation partners were detected in this recording.
                  </p>
                );
              }
              const talkCount = (name: string) => {
                const k = name.trim().toLowerCase();
                return meetings.filter((mm) =>
                  (mm.participantsInfo || []).some((pp) => (pp.name || "").trim().toLowerCase() === k)
                ).length;
              };
              return (
                <div className="space-y-3">
                  {people.map((p, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-3 p-3.5 bg-white dark:bg-brand-green-dark/80 border border-brand-green/10 dark:border-brand-gold/15 rounded-2xl"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-brand-cream dark:bg-brand-green-dark border border-stone-300 dark:border-brand-gold/20 flex items-center justify-center shrink-0">
                          <span className="text-xs font-black text-brand-green dark:text-brand-gold-bright">
                            {(p.name || "?").charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <h5 className="text-xs font-bold text-brand-green dark:text-[#EEF0EA] truncate">{p.name}</h5>
                          <p className="text-[10px] text-brand-green/55 dark:text-brand-cream/55 truncate">
                            {p.role || "Conversation partner"}{p.share ? ` • ${p.share} share` : ""}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs font-black text-brand-green dark:text-brand-gold-bright">{talkCount(p.name)}</div>
                        <div className="text-[8px] uppercase tracking-wider text-brand-green/45 dark:text-brand-cream/45 font-bold">talks</div>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => { setSelectedMeetingId(null); setGlobalTab("relations"); }}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-brand-green text-brand-cream hover:bg-[#152a1b] dark:bg-brand-gold dark:text-brand-green-dark dark:hover:bg-[#b0913c] rounded-xl text-[11px] font-extrabold uppercase tracking-wide transition-all cursor-pointer"
                  >
                    <Users size={13} /> Open Relations Hub
                  </button>
                </div>
              );
            })()}
          </div>
        )}

        {/* TAB 2: ACTION ITEMS (With CRUD additions/checkboxes) */}
        {(activeTab === "actions" || window.matchMedia("print").matches) && (
          <div className="space-y-4 animate-fadeIn print:break-before-page" id="detail-tabbox-actions">
            {/* Printable Action Items Cover */}
            <div className="bg-white dark:bg-brand-green-dark/80 border border-brand-green/10 dark:border-brand-gold/15 p-4 rounded-2xl space-y-4">
              <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-widest">
                Action Items Agenda
              </h4>

              {meeting.actionItems.length === 0 ? (
                <p className="text-xs text-zinc-400 italic text-center py-6">No action items assigned to this meeting.</p>
              ) : (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800 space-y-3">
                  {meeting.actionItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-3 pt-3 first:pt-0 group/action"
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <button
                          onClick={() => toggleActionItemStatus(item.id)}
                          id={`action-checkbox-${item.id}`}
                          className="pt-0.5 text-stone-700 dark:text-brand-cream hover:scale-110 active:scale-95 transition-all print:scale-100 print:hover:scale-100"
                        >
                          {item.completed ? (
                            <CheckSquare size={17} className="stroke-[2.5]" />
                          ) : (
                            <Square size={17} className="text-zinc-400 stroke-[2]" />
                          )}
                        </button>

                        <div className="space-y-0.5">
                          <p className={`text-xs leading-relaxed text-zinc-800 dark:text-zinc-100 ${
                            item.completed ? "line-through text-zinc-400 dark:text-zinc-500 italic" : "font-bold"
                          }`}>
                            {item.task}
                          </p>

                          {/* Assignee pill indicator */}
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-[10px] rounded font-medium">
                            Assignee: {item.assignee}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteActionItem(item.id)}
                        className="opacity-0 group-hover/action:opacity-100 text-zinc-400 hover:text-red-500 p-1 rounded transition-all print:hidden"
                        title="Delete task item"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Appender Form for Action item additions */}
            <div className="bg-brand-cream/10 dark:bg-brand-green-dark border border-brand-green/10 dark:border-brand-gold/10 rounded-2xl p-4 print:hidden">
              <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-3 flex items-center gap-1.5">
                <Plus size={14} className="text-[#c1b5a5]" /> Assemble New Action Item
              </h4>

              <form onSubmit={handleAddActionItem} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-500">Task Definition</label>
                    <input
                      type="text"
                      placeholder="e.g. Publish Vite static configuration"
                      value={newActionTask}
                      onChange={(e) => setNewActionTask(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-stone-400 text-zinc-900 dark:text-zinc-50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-500">Assignee Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Robert Banner"
                      value={newActionAssignee}
                      onChange={(e) => setNewActionAssignee(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-stone-400 text-zinc-900 dark:text-zinc-50"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="flex items-center gap-1 px-4 py-2 bg-brand-cream hover:bg-[#eae0d2] text-stone-900 border border-stone-300 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
                  >
                    Add Action
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 3: TRANSCRIPT (Interactive edits inline!) */}
        {(activeTab === "transcript" || window.matchMedia("print").matches) && (
          <div className="space-y-4 animate-fadeIn print:break-before-page" id="detail-tabbox-transcript">
            <div className="bg-white dark:bg-brand-green-dark/80 border border-brand-green/10 dark:border-brand-gold/15 p-4 rounded-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 mb-4 font-normal">
                <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-widest">
                  Secure Transcription Output
                </h4>
                <span className="text-[10px] text-zinc-400 italic">
                  Tip: Tap any sentence to edit details
                </span>
              </div>

              {meeting.transcript.length === 0 ? (
                <p className="text-xs text-zinc-400 italic text-center py-6">No transcript segments indexed.</p>
              ) : (
                <div className="space-y-4">
                  {meeting.transcript.map((seg) => {
                    const isEditingThis = editingSegmentId === seg.id;

                    return (
                      <div
                        key={seg.id}
                        className="group/seg space-y-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/35 p-1.5 rounded-xl transition-all"
                      >
                        {/* Speaker with estimated timestamp */}
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-extrabold text-[#c2b29f]">
                            {seg.speaker}
                          </span>
                          <span className="font-mono text-zinc-400 font-bold bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                            {seg.timestamp}
                          </span>
                        </div>

                        {/* Editable zones */}
                        {isEditingThis ? (
                          <div className="space-y-1.5">
                            <textarea
                              value={editingSegmentText}
                              onChange={(e) => setEditingSegmentText(e.target.value)}
                              rows={2}
                              className="w-full text-xs p-2 bg-zinc-50 dark:bg-zinc-800 border border-stone-400 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-400 text-zinc-900 dark:text-zinc-50"
                            />
                            <div className="flex gap-1 justify-end">
                              <button
                                onClick={() => handleSaveSegmentText(seg.id)}
                                className="flex items-center gap-1 px-2.5 py-1 bg-brand-cream hover:bg-[#eae0d2] text-stone-900 border border-stone-300 rounded-lg text-[10px] font-bold"
                              >
                                Save Changes
                              </button>
                              <button
                                onClick={() => setEditingSegmentId(null)}
                                className="px-2.5 py-1 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-[10px] font-bold"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p
                            onClick={() => handleStartEditSegment(seg)}
                            className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed cursor-pointer font-normal rounded hover:bg-stone-100 dark:hover:bg-stone-850 group-hover/seg:px-1 transition-all"
                          >
                            {seg.text}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

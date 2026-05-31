import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { Meeting, Project, ActiveTab, ActionItem, TranscriptSegment } from "../types";
import { deleteAudioBlob, saveAudioBlob } from "../utils/audioDb";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, doc, onSnapshot, setDoc, deleteDoc, writeBatch, serverTimestamp, getDocs } from "firebase/firestore";
import { auth, db, signInWithGoogle, logoutUser, handleFirestoreError, OperationType } from "../utils/firebase";

interface MeetingContextType {
  meetings: Meeting[];
  projects: Project[];
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedMeetingId: string | null;
  setSelectedMeetingId: (id: string | null) => void;
  theme: "light" | "dark" | "chic";
  setTheme: (theme: "light" | "dark" | "chic") => void;
  toggleTheme: () => void;
  wakeLockSupported: boolean;
  wakeLockActive: boolean;
  toggleWakeLock: (force?: boolean) => Promise<boolean>;
  keepAliveSupported: boolean;
  keepAliveActive: boolean;
  toggleKeepAlive: (force?: boolean) => void;
  addMeeting: (meeting: Meeting) => void;
  updateMeeting: (meeting: Meeting) => void;
  deleteMeeting: (id: string) => void;
  addProject: (project: Project) => void;
  deleteProject: (id: string) => void;

  // AI Usage Credit Limits
  aiUsageLimitMinutes: number;
  aiUsageUsedSeconds: number;
  refillAiBalance: () => void;

  // Firebase Authentication & Remote Sync State
  user: User | null;
  authLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  syncLocalToCloud: () => Promise<void>;
  isSyncing: boolean;

  // Persistent background recording parameters
  isRecording: boolean;
  isProcessing: boolean;
  processingStatus: string;
  duration: number;
  title: string;
  setTitle: (t: string) => void;
    selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
  initialTagsStr: string;
  setInitialTagsStr: (t: string) => void;
  audioSource: "mic" | "mixed";
  setAudioSource: (src: "mic" | "mixed") => void;
  recordingStream: MediaStream | null;
  handleStartRecord: () => Promise<void>;
  handleStopRecord: () => Promise<void>;
  handleAudioFileImport: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleDirectAudioImport: (file: File, customProjectName?: string) => Promise<void>;
  resetRecordingState: () => void;
  // Non-blocking Toast Alerts for standard and mobile UX
  toast: { message: string; type: "info" | "success" | "warning" | "error" } | null;
  triggerToast: (message: string, type?: "info" | "success" | "warning" | "error") => void;

  // AI Context and Custom Prompts metadata states
  ownerName: string;
  setOwnerName: (n: string) => void;
  voiceSignature: string;
  setVoiceSignature: (s: string) => void;
  ownerRole: string;
  setOwnerRole: (r: string) => void;
  statedContext: string;
  setStatedContext: (c: string) => void;
  customPrompt: string;
  setCustomPrompt: (p: string) => void;
  cbtPsychologist: boolean;
  setCbtPsychologist: (v: boolean) => void;
  cbtProjects: string[];
  setCbtProjects: (projects: string[]) => void;
  negotiationCoach: boolean;
  setNegotiationCoach: (v: boolean) => void;
  performanceReviewLens: boolean;
  setPerformanceReviewLens: (v: boolean) => void;
  difficultConversationDebrief: boolean;
  setDifficultConversationDebrief: (v: boolean) => void;
  personalAssistant: boolean;
  setPersonalAssistant: (v: boolean) => void;

  // Audio routing and recording triggers
  audioDevices: MediaDeviceInfo[];
  selectedAudioDeviceId: string;
  setSelectedAudioDeviceId: (id: string) => void;
  preferBluetooth: boolean;
  setPreferBluetooth: (val: boolean) => void;
  showInputSource: boolean;
  setShowInputSource: (val: boolean) => void;
  voiceCommandEnabled: boolean;
  setVoiceCommandEnabled: (val: boolean) => void;
  voicePhrase: string;
  setVoicePhrase: (phrase: string) => void;
  voiceSensitivity: "low" | "medium" | "high";
  setVoiceSensitivity: (sens: "low" | "medium" | "high") => void;
  activeInputLabel: string;
  activeCodec: string;
  voiceStatus: string;
  autoSendEmail: boolean;
  setAutoSendEmail: (val: boolean) => void;
  autoSendWhatsApp: boolean;
  setAutoSendWhatsApp: (val: boolean) => void;
  targetEmail: string;
  setTargetEmail: (val: string) => void;
  targetWhatsApp: string;
  setTargetWhatsApp: (val: string) => void;
}

const MeetingContext = createContext<MeetingContextType | undefined>(undefined);

async function ensureStoragePersisted(): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.storage && navigator.storage.persist) {
    try {
      const isPersisted = await navigator.storage.persisted();
      if (!isPersisted) {
        return await navigator.storage.persist();
      }
      return isPersisted;
    } catch (e) {
      console.warn("Storage persist check failed:", e);
    }
  }
  return false;
}

async function hasSpaceFor(requiredBytes: number): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.storage && navigator.storage.estimate) {
    try {
      const { quota, usage } = await navigator.storage.estimate();
      if (quota !== undefined && usage !== undefined) {
        const remaining = quota - usage;
        return remaining > requiredBytes;
      }
    } catch (e) {
      console.warn("Storage estimate failed:", e);
    }
  }
  return true;
}

const DEFAULT_PROJECTS: Project[] = [
  { id: "proj-alpha", name: "Alpha Web", color: "amber", description: "Vite React and mobile PWA developments" },
  { id: "proj-personal", name: "Personal", color: "pink", description: "Personal logistical support and family chats" }
];

// Real data only — no seeded/mock meetings. The app starts empty and fills
// with the user's own analysed recordings.
const DEFAULT_MEETINGS: Meeting[] = [];

// One-time cleanup: drop the old seeded/demo meetings that earlier builds
// persisted into localStorage, so existing installs also lose the mock data.
const stripSeedMeetings = (list: Meeting[]): Meeting[] =>
  Array.isArray(list) ? list.filter((m) => !(m && typeof m.id === "string" && m.id.startsWith("seed-"))) : [];

export function MeetingProvider({ children }: { children: ReactNode }) {
  // Theme state
  const [theme, setTheme] = useState<"light" | "dark" | "chic">(() => {
    const saved = localStorage.getItem("parley-theme") || localStorage.getItem("meetlog-theme");
    if (saved === "light") return "light";
    if (saved === "chic") return "chic";
    return "dark"; // Default is Dark Theme for Parley elite branding
  });

  // AI Usage Credit Limits
  const [aiUsageLimitMinutes] = useState<number>(60);
  const [aiUsageUsedSeconds, setAiUsageUsedSeconds] = useState<number>(() => {
    const saved = localStorage.getItem("parley-ai-used-seconds") || localStorage.getItem("meetlog-ai-used-seconds");
    return saved ? Number(saved) : 0;
  });

  const refillAiBalance = () => {
    setAiUsageUsedSeconds(0);
    localStorage.setItem("parley-ai-used-seconds", "0");
    triggerToast("AI processing credits successfully refilled to 60 minutes!", "success");
  };

  // AI Context and Custom Prompts metadata states
  const [ownerName, setOwnerName] = useState<string>("");
  const [voiceSignature, setVoiceSignature] = useState<string>(() => {
    return localStorage.getItem("parley-voice-signature") || "";
  });
  const [ownerRole, setOwnerRole] = useState<string>("");
  const [statedContext, setStatedContext] = useState<string>("");
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [cbtPsychologist, setCbtPsychologist] = useState<boolean>(() => {
    return localStorage.getItem("parley-cbt-psychologist") === "true";
  });
  const [cbtProjects, setCbtProjects] = useState<string[]>(() => {
    const saved = localStorage.getItem("parley-cbt-projects") || localStorage.getItem("meetlog-cbt-projects");
    return saved ? JSON.parse(saved) : ["Personal"];
  });
  useEffect(() => {
    localStorage.setItem("parley-cbt-projects", JSON.stringify(cbtProjects));
  }, [cbtProjects]);
  const [negotiationCoach, setNegotiationCoach] = useState<boolean>(() => {
    return localStorage.getItem("parley-negotiation-coach") === "true";
  });
  const [performanceReviewLens, setPerformanceReviewLens] = useState<boolean>(() => {
    return localStorage.getItem("parley-performance-review") === "true";
  });
  const [difficultConversationDebrief, setDifficultConversationDebrief] = useState<boolean>(() => {
    return localStorage.getItem("parley-difficult-debrief") === "true";
  });
  const [personalAssistant, setPersonalAssistant] = useState<boolean>(() => {
    return localStorage.getItem("parley-personal-assistant") === "true";
  });

  const [activeTab, setActiveTabState] = useState<ActiveTab>("home");
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);

  // WakeLock State
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const [wakeLockObj, setWakeLockObj] = useState<any | null>(null);
  const [wakeLockSupported, setWakeLockSupported] = useState(false);
  const wakeLockIntentRef = useRef(false);

  // Keep-alive Audio State
  const [keepAliveActive, setKeepAliveActive] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [keepAliveSupported] = useState(true); // Browsers generally support Audio Element loops

  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState("");
  const [duration, setDuration] = useState(0);

  const [title, setTitle] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState(() => {
    const savedProjects = localStorage.getItem("parley-projects-v2") || localStorage.getItem("meetlog-projects-v2");
    const projs = savedProjects ? JSON.parse(savedProjects) : DEFAULT_PROJECTS;
    return projs[0]?.id || "";
  });
  const [initialTagsStr, setInitialTagsStr] = useState("");
  const [audioSource, setAudioSource] = useState<"mic" | "mixed">("mic");
  const [recordingStream, setRecordingStream] = useState<MediaStream | null>(null);

  // Audio routing and recording triggers
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedAudioDeviceId, setSelectedAudioDeviceId] = useState<string>(() => {
    return localStorage.getItem("parley-selected-audio-device-id") || "default";
  });
  const [preferBluetooth, setPreferBluetooth] = useState<boolean>(() => {
    return localStorage.getItem("parley-prefer-bluetooth") === "true";
  });
  const [showInputSource, setShowInputSource] = useState<boolean>(() => {
    return localStorage.getItem("parley-show-input-source") !== "false"; // default true
  });
  const [voiceCommandEnabled, setVoiceCommandEnabled] = useState<boolean>(() => {
    return localStorage.getItem("parley-voice-command-enabled") === "true";
  });
  const [voicePhrase, setVoicePhrase] = useState<string>(() => {
    return localStorage.getItem("parley-voice-phrase") || "hey parley record";
  });
  const [voiceSensitivity, setVoiceSensitivity] = useState<"low" | "medium" | "high">(() => {
    return (localStorage.getItem("parley-voice-sensitivity") as "low" | "medium" | "high") || "medium";
  });
  const [activeInputLabel, setActiveInputLabel] = useState<string>("Default Microphone");
  const [activeCodec, setActiveCodec] = useState<string>("Standard Mono");
  const [voiceStatus, setVoiceStatus] = useState<string>("idle");
  const [autoSendEmail, setAutoSendEmail] = useState<boolean>(() => {
    return localStorage.getItem("parley-auto-send-email") === "true";
  });
  const [autoSendWhatsApp, setAutoSendWhatsApp] = useState<boolean>(() => {
    return localStorage.getItem("parley-auto-send-whatsapp") === "true";
  });
  const [targetEmail, setTargetEmail] = useState<string>(() => {
    return localStorage.getItem("parley-target-email") || "";
  });
  const [targetWhatsApp, setTargetWhatsApp] = useState<string>(() => {
    return localStorage.getItem("parley-target-whatsapp") || "";
  });

  useEffect(() => {
    localStorage.setItem("parley-cbt-psychologist", String(cbtPsychologist));
  }, [cbtPsychologist]);
  useEffect(() => {
    localStorage.setItem("parley-negotiation-coach", String(negotiationCoach));
  }, [negotiationCoach]);
  useEffect(() => {
    localStorage.setItem("parley-performance-review", String(performanceReviewLens));
  }, [performanceReviewLens]);
  useEffect(() => {
    localStorage.setItem("parley-difficult-debrief", String(difficultConversationDebrief));
  }, [difficultConversationDebrief]);
  useEffect(() => {
    localStorage.setItem("parley-personal-assistant", String(personalAssistant));
  }, [personalAssistant]);

  useEffect(() => {
    localStorage.setItem("parley-auto-send-email", String(autoSendEmail));
  }, [autoSendEmail]);
  useEffect(() => {
    localStorage.setItem("parley-auto-send-whatsapp", String(autoSendWhatsApp));
  }, [autoSendWhatsApp]);
  useEffect(() => {
    localStorage.setItem("parley-target-email", targetEmail);
  }, [targetEmail]);
  useEffect(() => {
    localStorage.setItem("parley-target-whatsapp", targetWhatsApp);
  }, [targetWhatsApp]);

  // Persistent recording and triggers preferences
  useEffect(() => {
    localStorage.setItem("parley-selected-audio-device-id", selectedAudioDeviceId);
  }, [selectedAudioDeviceId]);
  useEffect(() => {
    localStorage.setItem("parley-prefer-bluetooth", String(preferBluetooth));
  }, [preferBluetooth]);
  useEffect(() => {
    localStorage.setItem("parley-show-input-source", String(showInputSource));
  }, [showInputSource]);
  useEffect(() => {
    localStorage.setItem("parley-voice-command-enabled", String(voiceCommandEnabled));
  }, [voiceCommandEnabled]);
  useEffect(() => {
    localStorage.setItem("parley-voice-phrase", voicePhrase);
  }, [voicePhrase]);
  useEffect(() => {
    localStorage.setItem("parley-voice-sensitivity", voiceSensitivity);
  }, [voiceSensitivity]);

  // Audio input device enumeration effect
  useEffect(() => {
    const updateDevices = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;
        const devices = await navigator.mediaDevices.enumerateDevices();
        const inputs = devices.filter(d => d.kind === "audioinput");
        setAudioDevices(inputs);
      } catch (err) {
        console.warn("Failed enumerating audio input devices:", err);
      }
    };

    updateDevices();
    if (navigator.mediaDevices && navigator.mediaDevices.addEventListener) {
      navigator.mediaDevices.addEventListener("devicechange", updateDevices);
      return () => {
        navigator.mediaDevices.removeEventListener("devicechange", updateDevices);
      };
    }
  }, []);

  // Refs to prevent stale closures in SpeechRecognition handlers
  const voiceCommandEnabledRef = useRef(voiceCommandEnabled);
  const isRecordingRef = useRef(isRecording);
  const isProcessingRef = useRef(isProcessing);
  const voicePhraseRef = useRef(voicePhrase);
  const voiceSensitivityRef = useRef(voiceSensitivity);

  useEffect(() => {
    voiceCommandEnabledRef.current = voiceCommandEnabled;
    isRecordingRef.current = isRecording;
    isProcessingRef.current = isProcessing;
    voicePhraseRef.current = voicePhrase;
    voiceSensitivityRef.current = voiceSensitivity;
  });

  const recognitionRef = useRef<any>(null);
  const recognitionActiveRef = useRef<boolean>(false);
  const wakeNotificationRef = useRef<any>(null);

  // Background speech recognition wake-word effect
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      if (voiceCommandEnabled) {
        triggerToast("Voice Activation Wake Command is not supported on this device/browser.", "warning");
        setVoiceCommandEnabled(false);
      }
      setVoiceStatus("idle");
      return;
    }

    if (voiceCommandEnabled && !isRecording && !isProcessing) {
      if (!recognitionRef.current) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onstart = () => {
          recognitionActiveRef.current = true;
          if (!voiceCommandEnabledRef.current) {
            try {
              recognition.stop();
            } catch (err) {}
            recognitionActiveRef.current = false;
            setVoiceStatus("idle");
            if (wakeNotificationRef.current) {
              try { wakeNotificationRef.current.close(); } catch (err) {}
              wakeNotificationRef.current = null;
            }
            return;
          }
          setVoiceStatus("listening");
          console.log("Background wake-word speech recognition active.");

          // Instantiate a background active notification so the app shows in the background tray
          if ("Notification" in window && Notification.permission === "granted") {
            try {
              // Close any old wake notification
              if (wakeNotificationRef.current) {
                wakeNotificationRef.current.close();
              }
              const notif = new Notification("Parley Wake Word Active", {
                body: "Parley is listening in the background for your wake phrase.",
                tag: "parley-wake-active",
                requireInteraction: true,
                silent: true
              });
              wakeNotificationRef.current = notif;
            } catch (err) {
              console.warn("Failed standard Wake Notification instantiation:", err);
            }
          }
        };

        recognition.onresult = (event: any) => {
          if (!voiceCommandEnabledRef.current || isRecordingRef.current || isProcessingRef.current) {
            return;
          }
          const results = event.results;
          for (let i = event.resultIndex; i < results.length; i++) {
            const rawText = results[i][0].transcript;
            const transcript = rawText.toLowerCase().trim();
            const confidence = results[i][0].confidence;
            
            setVoiceStatus(`hearing: "${rawText}"`);
            console.log(`Speech recognition output: "${transcript}" (confidence: ${confidence})`);
            
            const sensitivity = voiceSensitivityRef.current;
            const phrase = voicePhraseRef.current.toLowerCase().trim();
            const threshold = sensitivity === "low" ? 0.9 : sensitivity === "high" ? 0.6 : 0.75;
            
            if (transcript.includes(phrase) || 
                transcript.includes("hey parley") || 
                transcript.includes("start recording")) {
              
              if (confidence >= threshold) {
                console.log("Wake-word triggered! Starting recording...");
                setVoiceStatus("triggered");
                
                if ("vibrate" in navigator) {
                  navigator.vibrate([100, 50, 100]);
                }
                
                try {
                  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
                  if (AudioCtx) {
                    const ctx = new AudioCtx();
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.type = "sine";
                    osc.frequency.setValueAtTime(523.25, ctx.currentTime);
                    osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
                    osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
                    gain.gain.setValueAtTime(0.15, ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
                    osc.start();
                    osc.stop(ctx.currentTime + 0.4);
                  }
                } catch (e) {
                  console.warn("Chime playback failed", e);
                }

                handleStartRecord();
                break;
              }
            }
          }
        };

        recognition.onerror = (e: any) => {
          console.error("Speech recognition error:", e.error);
          setVoiceStatus("idle");
          if (wakeNotificationRef.current) {
            try { wakeNotificationRef.current.close(); } catch (err) {}
            wakeNotificationRef.current = null;
          }
          console.error("Analysis failed:", e.error);
          triggerToast(`Failed to transcribe: ${e.error instanceof Error ? e.error.message : "Network error"}`, "error");
          if (e.error === "not-allowed") {
            triggerToast("Speech recognition not allowed. Please grant microphone permission.", "error");
            setVoiceCommandEnabled(false);
          }
        };

        recognition.onend = () => {
          recognitionActiveRef.current = false;
          setVoiceStatus("idle");
          if (wakeNotificationRef.current) {
            try { wakeNotificationRef.current.close(); } catch (err) {}
            wakeNotificationRef.current = null;
          }
          if (voiceCommandEnabledRef.current && !isRecordingRef.current && !isProcessingRef.current) {
            try {
              recognition.start();
            } catch (err) {
              console.warn("Speech recognition restart failed:", err);
            }
          }
        };

        recognitionRef.current = recognition;
      }

      if (!recognitionActiveRef.current) {
        try {
          recognitionRef.current.start();
        } catch (err) {
          console.warn("Speech recognition start failed:", err);
        }
      }
    } else {
      if (recognitionRef.current && recognitionActiveRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (err) {
          console.warn("Speech recognition stop failed:", err);
        }
        recognitionActiveRef.current = false;
      }
      setVoiceStatus("idle");
      if (wakeNotificationRef.current) {
        try { wakeNotificationRef.current.close(); } catch (err) {}
        wakeNotificationRef.current = null;
      }
    }

    return () => {
      if (recognitionRef.current && recognitionActiveRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (err) {}
        recognitionActiveRef.current = false;
      }
      setVoiceStatus("idle");
      if (wakeNotificationRef.current) {
        try { wakeNotificationRef.current.close(); } catch (err) {}
        wakeNotificationRef.current = null;
      }
    };
  }, [voiceCommandEnabled, isRecording, isProcessing]);

  // Track deleted IDs to prevent snapshot race-re-additions
  const deletedIdsRef = useRef<Set<string>>(new Set());

  // Non-blocking toast state
  const [toast, setToast] = useState<{ message: string; type: "info" | "success" | "warning" | "error" } | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Expose toast trigger function
  const triggerToast = (message: string, type: "info" | "success" | "warning" | "error" = "info") => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToast({ message, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
      toastTimeoutRef.current = null;
    }, 5000);
  };

  // Background Notification tracker
  const notificationRef = useRef<any>(null);

  // Projects State
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem("parley-projects-v2") || localStorage.getItem("meetlog-projects-v2");
    return saved ? JSON.parse(saved) : DEFAULT_PROJECTS;
  });

  // Meetings State
  const [meetings, setMeetings] = useState<Meeting[]>(() => {
    const saved = localStorage.getItem("parley-meetings-v2") || localStorage.getItem("meetlog-meetings-v2");
    if (saved) {
      try {
        const list: Meeting[] = stripSeedMeetings(JSON.parse(saved));
        return list.map(m => m.isPending ? { ...m, isPending: false, isFailed: true, summary: "The transcription analysis was interrupted (the app might have been closed or suspended). Play the audio or click 'Retry AI Transcription' below." } : m);
      } catch (e) {
        console.error("Failed to parse saved meetings", e);
      }
    }
    return DEFAULT_MEETINGS;
  });

  // UI Navigation states

  // Recording audio refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recordingStartTimeRef = useRef<number | null>(null);
  
  const micStreamRef = useRef<MediaStream | null>(null);
  const displayStreamRef = useRef<MediaStream | null>(null);
  const mixedContextRef = useRef<AudioContext | null>(null);
  const finalDurationRef = useRef<number>(0);

  // Keep selectedProjectId synchronized when project list changes or loads
  useEffect(() => {
    if (projects.length > 0 && (!selectedProjectId || !projects.some(p => p.id === selectedProjectId))) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  // Initialize and check wake lock eligibility
  useEffect(() => {
    if (typeof window !== "undefined") {
      setWakeLockSupported("wakeLock" in navigator);
    }
  }, []);

  // Firebase Authentication states
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Sync state to LocalStorage (only when not logged in)
  useEffect(() => {
    localStorage.setItem("parley-theme", theme);
    const html = document.documentElement;
    html.classList.remove("dark", "chic");
    if (theme === "dark") {
      html.classList.add("dark");
    } else if (theme === "chic") {
      html.classList.add("chic");
    }
  }, [theme]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem("parley-projects-v2", JSON.stringify(projects));
    }
  }, [projects, user]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem("parley-meetings-v2", JSON.stringify(meetings));
    }
  }, [meetings, user]);

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (currentUser) {
        if (currentUser.displayName) {
          setOwnerName(currentUser.displayName);
        }
      } else {
        // Fallback to local storage on signout
        const savedProjects = localStorage.getItem("parley-projects-v2") || localStorage.getItem("meetlog-projects-v2");
        const savedMeetings = localStorage.getItem("parley-meetings-v2") || localStorage.getItem("meetlog-meetings-v2");
        setProjects(savedProjects ? JSON.parse(savedProjects) : DEFAULT_PROJECTS);
        if (savedMeetings) {
          try {
            const list: Meeting[] = stripSeedMeetings(JSON.parse(savedMeetings));
            setMeetings(list.map(m => m.isPending ? { ...m, isPending: false, isFailed: true, summary: "The transcription analysis was interrupted (the app might have been closed or suspended). Play the audio or click 'Retry AI Transcription' below." } : m));
          } catch (e) {
            setMeetings(DEFAULT_MEETINGS);
          }
        } else {
          setMeetings(DEFAULT_MEETINGS);
        }
        setOwnerName("");
      }
    });
    return () => unsubscribe();
  }, []);

  // Remote Firestore data sync
  useEffect(() => {
    if (!user) return;

    const uid = user.uid;
    const projectsPath = `users/${uid}/projects`;
    const meetingsPath = `users/${uid}/meetings`;

    // Real-time listener for user projects
    const unsubProjects = onSnapshot(
      collection(db, "users", uid, "projects"),
      (snapshot) => {
        const cloudProjects: Project[] = [];
        snapshot.forEach((docSnap) => {
          cloudProjects.push(docSnap.data() as Project);
        });
        
        setProjects(prev => {
          // Keep local projects not yet present in firestore
          const localOnly = prev.filter(local => 
            !cloudProjects.some(cloud => cloud.id === local.id)
          );
          const merged = [...cloudProjects];
          localOnly.forEach(local => {
            if (!merged.some(p => p.id === local.id)) {
              merged.push(local);
            }
          });
          return merged.length > 0 ? merged : DEFAULT_PROJECTS;
        });
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, projectsPath);
      }
    );

    // Real-time listener for user meetings
    const unsubMeetings = onSnapshot(
      collection(db, "users", uid, "meetings"),
      (snapshot) => {
        const cloudMeetings: Meeting[] = [];
        snapshot.forEach((docSnap) => {
          const m = docSnap.data() as Meeting;
          const isStalePending = m.isPending && (Date.now() - new Date(m.date).getTime() > 120000);
          if (isStalePending) {
            cloudMeetings.push({
              ...m,
              isPending: false,
              isFailed: true,
              summary: "The transcription analysis timed out. Play the audio or click 'Retry AI Transcription' below."
            });
          } else {
            cloudMeetings.push(m);
          }
        });
        cloudMeetings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        setMeetings(prev => {
          // Keep local pending or unsynced meetings (unless explicitly deleted)
          const localOnly = prev.filter(local => 
            !deletedIdsRef.current.has(local.id) &&
            (local.isPending || !cloudMeetings.some(cloud => cloud.id === local.id))
          ).map(local => {
            const isStalePending = local.isPending && (Date.now() - new Date(local.date).getTime() > 120000);
            if (isStalePending) {
              return {
                ...local,
                isPending: false,
                isFailed: true,
                summary: "The transcription analysis timed out. Play the audio or click 'Retry AI Transcription' below."
              };
            }
            return local;
          });
          const merged = [...cloudMeetings];
          localOnly.forEach(local => {
            if (!merged.some(m => m.id === local.id)) {
              merged.push(local);
            }
          });
          merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          return merged;
        });
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, meetingsPath);
      }
    );

    return () => {
      unsubProjects();
      unsubMeetings();
    };
  }, [user]);

  const loginWithGoogle = async () => {
    try {
      await signInWithGoogle();
    } catch (e) {
      console.error("Google Auth failure:", e);
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.error("Logout failure:", e);
    }
  };

  const syncLocalToCloud = async () => {
    if (!user) return;
    setIsSyncing(true);
    try {
      const uid = user.uid;
      const batch = writeBatch(db);

      const savedProjects = localStorage.getItem("parley-projects-v2") || localStorage.getItem("meetlog-projects-v2");
      const savedMeetings = localStorage.getItem("parley-meetings-v2") || localStorage.getItem("meetlog-meetings-v2");
      const localProjs: Project[] = savedProjects ? JSON.parse(savedProjects) : DEFAULT_PROJECTS;
      const localMeets: Meeting[] = savedMeetings ? stripSeedMeetings(JSON.parse(savedMeetings)) : DEFAULT_MEETINGS;

      // Batch upload projects
      for (const proj of localProjs) {
        const ref = doc(db, "users", uid, "projects", proj.id);
        batch.set(ref, {
          ...proj,
          userId: uid,
          createdAt: new Date().toISOString()
        });
      }

      // Batch upload meetings
      for (const meet of localMeets) {
        const ref = doc(db, "users", uid, "meetings", meet.id);
        batch.set(ref, {
          ...meet,
          userId: uid,
          createdAt: new Date().toISOString()
        });
      }

      await batch.commit();
      console.log("Cloud Backup write complete!");
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}/batch-sync`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Re-acquire wake lock on visibility transition if lock is intended to be active
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        if (wakeLockIntentRef.current && wakeLockSupported && !wakeLockActive) {
          try {
            console.log("Re-acquiring screen wake lock on foreground tab visibility return.");
            const lock = await (navigator as any).wakeLock.request("screen");
            setWakeLockObj(lock);
            setWakeLockActive(true);

            lock.addEventListener("release", () => {
              // Only clear state if we didn't intend to keep it active
              if (!wakeLockIntentRef.current) {
                setWakeLockActive(false);
                setWakeLockObj(null);
              }
            });
          } catch (e) {
            console.warn("Failed to automatic re-acquire screen wake lock:", e);
          }
        }
      }
    };

    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }
    return () => {
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      }
    };
  }, [wakeLockSupported, wakeLockActive]);

  const toggleTheme = () => {
    setTheme(prev => {
      if (prev === "light") return "dark";
      if (prev === "dark") return "chic";
      return "light";
    });
  };

  // Safe navigation setter (clears selected meeting if moving tabs)
  const setActiveTab = (tab: ActiveTab) => {
    setActiveTabState(tab);
    if (tab !== "home" && tab !== "record") {
      setSelectedMeetingId(null);
    }
  };

  // Wake Lock implementation
  const toggleWakeLock = async (force?: boolean): Promise<boolean> => {
    if (!wakeLockSupported) return false;

    const requestActive = force !== undefined ? force : !wakeLockActive;
    wakeLockIntentRef.current = requestActive;

    if (requestActive) {
      try {
        if (wakeLockObj) {
          try { await wakeLockObj.release(); } catch(e){}
        }
        const lock = await (navigator as any).wakeLock.request("screen");
        setWakeLockObj(lock);
        setWakeLockActive(true);

        // Auto release event handler
        lock.addEventListener("release", () => {
          if (!wakeLockIntentRef.current) {
            setWakeLockActive(false);
            setWakeLockObj(null);
          }
        });

        return true;
      } catch (err) {
        console.error("Wake Lock request failed:", err);
        setWakeLockActive(false);
        return false;
      }
    } else {
      wakeLockIntentRef.current = false;
      if (wakeLockObj) {
        try {
          await wakeLockObj.release();
        } catch(e){}
        setWakeLockActive(false);
        setWakeLockObj(null);
      }
      return false;
    }
  };

  // Background Audio Keep-Alive using a robust silent looping MP3 bitstream
  const toggleKeepAlive = (force?: boolean) => {
    const triggerActive = force !== undefined ? force : !keepAliveActive;

    if (triggerActive) {
      try {
        if (audioElement) {
          audioElement.pause();
        }
        // Create an audio element playing a verified 1-second silent MP3 bitstream chunk
        const audio = new Audio();
        audio.src = "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGFtZTMuOTguNFVVTVVVVVVVVVVVVVVV//uQZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAANAAC7gAALCwsLCwsLCwsLCwsNCwsNCwsNCwsNCx8fHx8fHx8fHx8fHx9FRUVFRUVFRUVFRUVFSEhISEhISEhISEhISFpaWlpaWlpaWlpaWlpvbm5vbm5vbm5vbm5vbn9/f39/f39/f39/f39/f8LCwsLCwsLCwsLCwsL////////////////////////////////6mAAAD8AAABFAAAAnEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/+//uQZHgAAAnEAAAnEAAA3YAAA3YAAAlRQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUVGMU85MS4xAAqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqVGMU85MS4xAAqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqVGMU85MS4xAAqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq";
        audio.loop = true;
        audio.play().catch(e => console.warn("Background keepalive silent loop requires active click start context:", e));
        setAudioElement(audio);
        setKeepAliveActive(true);
      } catch (err) {
        console.error("Keep-Alive audio setup error:", err);
        setKeepAliveActive(false);
      }
    } else {
      if (audioElement) {
        audioElement.pause();
        setAudioElement(null);
      }
      setKeepAliveActive(false);
    }
  };

  // Mutators for Meetings
  const addMeeting = async (meeting: Meeting) => {
    // Optimistic UI updates to secure immediate transition and detail loading
    setMeetings(prev => {
      if (prev.some(m => m.id === meeting.id)) return prev;
      return [meeting, ...prev];
    });

    if (user) {
      const path = `users/${user.uid}/meetings/${meeting.id}`;
      try {
        await setDoc(doc(db, "users", user.uid, "meetings", meeting.id), {
          ...meeting,
          userId: user.uid,
          createdAt: new Date().toISOString()
        });
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, path);
      }
    }
  };

  const updateMeeting = async (updated: Meeting) => {
    // Optimistic UI updates
    setMeetings(prev => prev.map(m => (m.id === updated.id ? updated : m)));

    if (user) {
      const path = `users/${user.uid}/meetings/${updated.id}`;
      try {
        const cleaned = { ...updated, userId: user.uid };
        await setDoc(doc(db, "users", user.uid, "meetings", updated.id), cleaned, { merge: true });
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, path);
      }
    }
  };

  const deleteMeeting = async (id: string) => {
    // Keep track of locally deleted IDs in our ref so snapshot listener doesn't re-create them
    deletedIdsRef.current.add(id);
    
    // Optimistic UI updates
    setMeetings(prev => prev.filter(m => m.id !== id));

    if (user) {
      const path = `users/${user.uid}/meetings/${id}`;
      try {
        await deleteDoc(doc(db, "users", user.uid, "meetings", id));
      } catch (e) {
        handleFirestoreError(e, OperationType.DELETE, path);
      }
    }
    deleteAudioBlob(id).catch(e => console.warn("Failed to delete matching local audio blob:", e));
    if (selectedMeetingId === id) {
      setSelectedMeetingId(null);
    }
  };

  // Mutators for Projects
  const addProject = async (project: Project) => {
    // Optimistic UI updates
    setProjects(prev => {
      if (prev.some(p => p.id === project.id)) return prev;
      return [...prev, project];
    });

    if (user) {
      const path = `users/${user.uid}/projects/${project.id}`;
      try {
        await setDoc(doc(db, "users", user.uid, "projects", project.id), {
          ...project,
          userId: user.uid,
          createdAt: new Date().toISOString()
        });
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, path);
      }
    }
  };

  const deleteProject = async (id: string) => {
    // Optimistic UI updates
    setProjects(prev => prev.filter(p => p.id !== id));

    if (user) {
      const path = `users/${user.uid}/projects/${id}`;
      try {
        await deleteDoc(doc(db, "users", user.uid, "projects", id));
      } catch (e) {
        handleFirestoreError(e, OperationType.DELETE, path);
      }
    }
  };

  // Helper methods for persistent background recording

  const resetRecordingState = () => {
    setDuration(0);
    setTitle("");
    setInitialTagsStr("");
    setRecordingStream(null);
  };

  const convertBlobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const resultStr = reader.result as string;
        const base64Content = resultStr.split(",")[1];
        resolve(base64Content);
      };
      reader.readAsDataURL(blob);
    });
  };

  const formatMinSec = (t: number) => {
    const mins = Math.floor(t / 60);
    const secs = t % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const openSystemUrl = (url: string, targetDefault: "_self" | "_blank" = "_self") => {
    const isCapacitor = (window as any).Capacitor !== undefined;
    if (isCapacitor) {
      window.open(url, "_system");
    } else {
      window.open(url, targetDefault);
    }
  };

  const handleAnalyzeOutput = async () => {
    const isCapacitor = (window as any).Capacitor !== undefined;
    const apiBase = getNormalizedApiBaseUrl();
    if (isCapacitor && !apiBase) {
      triggerToast("Error: Please set your Android API Connection IP in the Settings tab.", "error");
      setIsProcessing(false);
      resetRecordingState();
      return;
    }

    setIsProcessing(true);
    setProcessingStatus("Isolating ambient vocal tracks...");

    const meetingId = `meet_${Date.now()}`;
    const activeProjectName = projects.find(p => p.id === selectedProjectId)?.name || "General";
    const recordTitleInput = title.trim() || `Meeting on ${new Date().toLocaleDateString()}`;
    const finalDur = finalDurationRef.current || 25;

    let audioBlob: Blob | null = null;
    let b64Data = "";
    let mimeType = "audio/webm";

    if (audioChunksRef.current.length > 0) {
      audioBlob = new Blob(audioChunksRef.current, { type: audioChunksRef.current[0].type });
      mimeType = audioBlob.type;
      try {
        b64Data = await convertBlobToBase64(audioBlob);
      } catch (err) {
        console.error("Error converting audio to Base64:", err);
      }
    }

    // Check credit limits before starting processing (bypass in dev mode / localhost)
    const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    const isDevMode = localStorage.getItem("parley-dev-mode") === "true" || isLocalhost;
    const remainingSeconds = (aiUsageLimitMinutes * 60) - aiUsageUsedSeconds;
    if (!isDevMode && remainingSeconds < finalDur) {
      triggerToast("AI Processing Credits Depleted! Upgrade or refill in settings.", "error");
      setIsProcessing(false);
      resetRecordingState();
      
      const initialMeeting: Meeting = {
        id: meetingId,
        title: recordTitleInput,
        date: new Date().toISOString(),
        durationSec: finalDur,
        project: activeProjectName,
        summary: "AI processing aborted: Insufficient credits. Please refill your credits in the settings menu.",
        topics: ["Credits Depleted"],
        actionItems: [],
        transcript: [],
        tags: initialTagsStr.split(",").map(t => t.trim()).filter(Boolean).concat("Recorded", "No-Credits"),
        insights: [],
        nextTouchpoints: [],
        audioUrl: audioBlob ? URL.createObjectURL(audioBlob) : undefined,
        isPending: false,
        isFailed: true
      };
      addMeeting(initialMeeting);
      setSelectedMeetingId(meetingId);
      setActiveTab("home");
      return;
    }

    // 1. IMMEDIATELY SAVE THE BLOB IN INDEXEDDB SO IT'S NEVER LOST!
    if (audioBlob) {
      try {
        await ensureStoragePersisted();
        if (!(await hasSpaceFor(audioBlob.size))) {
          triggerToast("Low device storage — free up space soon so recordings keep saving.", "warning");
        }
        await saveAudioBlob(meetingId, audioBlob);
        console.log("Recorded sound chunk saved successfully inside local IndexedDB:", meetingId);
      } catch (e) {
        console.warn("Could not write record blob to IndexedDB:", e);
        triggerToast("Couldn't save audio locally (storage full). Analysis will still run.", "error");
      }
    }

    // 2. CREATE AN IMMEDIATE PENDING MEETING OBJECT IN LOCAL STORAGE
    const initialMeeting: Meeting = {
      id: meetingId,
      title: recordTitleInput,
      date: new Date().toISOString(),
      durationSec: finalDur,
      project: activeProjectName,
      summary: "AI speech transcription is compiling... Hang tight!",
      topics: ["Vocal stream decoding"],
      actionItems: [],
      transcript: [],
      tags: initialTagsStr.split(",").map(t => t.trim()).filter(Boolean).concat("Recorded"),
      insights: [],
      nextTouchpoints: [],
      audioUrl: audioBlob ? URL.createObjectURL(audioBlob) : undefined,
      isPending: true,
      isFailed: false,
      ownerName: ownerName || undefined,
      ownerRole: ownerRole || undefined,
      statedContext: statedContext || undefined,
      customPrompt: customPrompt || undefined,
      cbtPsychologist: cbtPsychologist || undefined,
      negotiationCoach: negotiationCoach || undefined,
      performanceReviewLens: performanceReviewLens || undefined,
      difficultConversationDebrief: difficultConversationDebrief || undefined,
      personalAssistant: personalAssistant || undefined
    };

    // Save immediate pending record
    addMeeting(initialMeeting);
    setSelectedMeetingId(meetingId);
    setActiveTab("home");

    try {
      await new Promise(r => setTimeout(r, 600));
      setProcessingStatus("Synthesizing speech with Gemini API...");

      // Call Express Back-end proxy API
      const apiBase = getNormalizedApiBaseUrl();
      const res = await fetch(`${apiBase}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audioData: b64Data || undefined,
          mimeType: mimeType,
          project: activeProjectName,
          durationSec: finalDur,
          title: recordTitleInput,
          ownerName,
          ownerRole,
          voiceSignature: voiceSignature || undefined,
          statedContext,
          customPrompt,
          cbtPsychologist: cbtPsychologist && cbtProjects.includes(activeProjectName),
          negotiationCoach,
          performanceReviewLens,
          difficultConversationDebrief,
          personalAssistant
        })
      });

      if (!res.ok) {
        throw new Error(`Back-end respond error with status code: ${res.status}`);
      }

      const rawJson = await res.json();
      if (rawJson.error) {
        throw new Error(rawJson.error);
      }

      const actionItems: ActionItem[] = (rawJson.actionItems || []).map((ti: any, i: number) => ({
        id: `ai_${Date.now()}_${i}`,
        task: ti.task || "Review custom items",
        assignee: ti.assignee || "Unassigned",
        completed: !!ti.completed
      }));

      const transcript: TranscriptSegment[] = (rawJson.transcript || []).map((tc: any, i: number) => ({
        id: `ts_${Date.now()}_${i}`,
        speaker: tc.speaker || `Speaker ${i + 1}`,
        text: tc.text || "",
        timestamp: tc.timestamp || formatMinSec(Math.min(finalDur, i * 4))
      }));

      // Deduct credits
      if (!isDevMode) {
        const newUsed = aiUsageUsedSeconds + finalDur;
        setAiUsageUsedSeconds(newUsed);
        localStorage.setItem("parley-ai-used-seconds", String(newUsed));
      }

      updateMeeting({
        ...initialMeeting,
        title: rawJson.title || recordTitleInput,
        summary: rawJson.summary || "No summary analyzed.",
        topics: rawJson.topics || ["General Standup"],
        actionItems,
        transcript,
        tags: rawJson.tags || ["Recorded"],
        insights: rawJson.insights || [],
        nextTouchpoints: rawJson.nextTouchpoints || [],
        reflectionCbt: rawJson.reflectionCbt || undefined,
        reflectionNegotiation: rawJson.reflectionNegotiation || undefined,
        reflectionPerformance: rawJson.reflectionPerformance || undefined,
        reflectionDebrief: rawJson.reflectionDebrief || undefined,
        personalAssistantOutput: rawJson.personalAssistantOutput || undefined,
        personalAssistantActions: rawJson.personalAssistantActions || undefined,
        conversationSegments: rawJson.conversationSegments || [],
        isMultiDialogue: !!rawJson.isMultiDialogue,
        isPending: false,
        isFailed: false
      });

      // Post-meeting automated routines
      const finalTitle = rawJson.title || recordTitleInput;
      const finalSummary = rawJson.summary || "No summary analyzed.";
      
      if (autoSendEmail) {
        const emailSubject = `${finalTitle} - Parley Memo Notes`;
        const emailBody = `Meeting Summary:\n\n${finalSummary}\n\nGenerated securely via Parley.`;
        const mailto = `mailto:${targetEmail || ""}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        openSystemUrl(mailto, "_self");
      }
      
      if (autoSendWhatsApp) {
        const waText = `*${finalTitle}*\n\n${finalSummary}`;
        const cleanPhone = targetWhatsApp.replace(/\+/g, "").replace(/\s/g, "");
        const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waText)}`;
        openSystemUrl(waUrl, "_blank");
      }
    } catch (e) {
      console.error("Error in AI analysis flow:", e);
      const detail = e instanceof Error ? e.message : String(e);
      const usedBase = getNormalizedApiBaseUrl() || "(same-origin)";
      triggerToast(`AI transcription failed: ${detail}`, "error");
      updateMeeting({
        ...initialMeeting,
        summary: `The automated speech-to-text transcription could not be completed.\n\nReason: ${detail}\nEndpoint: ${usedBase}/api/analyze\n\nThis usually means the phone could not reach the backend (wrong or unreachable API URL, offline, or a server error). Play the backup audio inside, or tap 'Retry AI Transcription' to try again.`,
        isPending: false,
        isFailed: true
      });
    } finally {
      setIsProcessing(false);
      resetRecordingState();
    }
  };

  const stopRecordingTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleStopRecord = async () => {
    setIsRecording(false);
    stopRecordingTimer();

    // Release active notification if present
    if (notificationRef.current) {
      try {
        notificationRef.current.close();
      } catch (e) {}
      notificationRef.current = null;
    }

    // Post a saved confirmation notification
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        new Notification("Parley: Recording Saved", {
          body: "Speech insights are compiling... Hang tight!",
          tag: "parley-saved"
        });
      } catch (err) {}
    }

    // Release wake lock and audio keep-alive to save client battery
    toggleWakeLock(false).catch(e => {});
    toggleKeepAlive(false);

    // Save final duration synchronously in ref and state, capped at 1 hour (3600 seconds)
    const finalDiff = recordingStartTimeRef.current
      ? Math.min(3600, Math.floor((Date.now() - recordingStartTimeRef.current) / 1000))
      : 0;
    finalDurationRef.current = finalDiff;
    setDuration(finalDiff);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch (err) {
        console.warn("Failed standard recorder stop, doing direct analyze fallback:", err);
        handleAnalyzeOutput();
      }
    } else {
      // Pure simulation stop triggers analyze
      handleAnalyzeOutput();
    }
  };

  const startRecordingTimer = () => {
    setDuration(0);
    recordingStartTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      if (recordingStartTimeRef.current) {
        const elapsed = Math.floor((Date.now() - recordingStartTimeRef.current) / 1000);
        if (elapsed >= 3600) {
          setDuration(3600);
          handleStopRecord();
        } else {
          setDuration(elapsed);
        }
      }
    }, 250);
  };

  const handleStartRecord = async () => {
    // Acquire WakeLock & KeepAlive audio playing if requested
    toggleWakeLock(true).catch(e => console.warn("Failed wake-lock activate. Skipping."));
    toggleKeepAlive(true);

    // Prompt user and trigger background notification if supported
    if ("Notification" in window) {
      let permission = Notification.permission;
      if (permission === "default") {
        try {
          permission = await Notification.requestPermission();
        } catch (err) {
          console.warn("Failed requesting notification permission:", err);
        }
      }
      if (permission === "granted") {
        try {
          const notif = new Notification("Parley Recording Active", {
            body: "Parley is securely capturing your conversation in the background.",
            tag: "parley-recording",
            requireInteraction: true,
            silent: true
          });
          notificationRef.current = notif;
        } catch (err) {
          console.warn("Failed standard Notification instantiation:", err);
        }
      }
    }

    audioChunksRef.current = [];

    try {
      let stream: MediaStream;
      let constraints: MediaStreamConstraints = { audio: true };

      // Heuristic device mapping
      let targetDeviceId = selectedAudioDeviceId;
      if (preferBluetooth) {
        const btDevice = audioDevices.find(d => {
          const lbl = d.label.toLowerCase();
          return lbl.includes("bluetooth") || lbl.includes("buds") || lbl.includes("headset") || lbl.includes("hands-free") || lbl.includes("hfp") || lbl.includes("sco") || lbl.includes("sony") || lbl.includes("bose") || lbl.includes("airpods");
        });
        if (btDevice) {
          targetDeviceId = btDevice.deviceId;
          console.log("Auto-selected Bluetooth device ID:", targetDeviceId, btDevice.label);
        }
      }

      // When an external mic is explicitly selected (USB conference puck, wired
      // lavalier, Bluetooth headset, etc.), turn OFF the browser's near-field
      // voice-call DSP. Echo-cancellation / noise-suppression / auto-gain are
      // tuned for a single close talker and gate out distant speakers in an
      // open-room recording. Also request full-band stereo so the capture isn't
      // silently down-sampled. (These are treated as "ideal" hints, so they
      // never cause getUserMedia to fail if the device can't honour them.)
      if (targetDeviceId && targetDeviceId !== "default") {
        constraints = {
          audio: {
            deviceId: { exact: targetDeviceId },
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
            channelCount: 2,
            sampleRate: 48000
          }
        };
      }

      if (audioSource === "mixed") {
        try {
          if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
            throw new Error("Display capture API is not supported on this browser.");
          }

          // 1. Get speaker / system tab audio stream via display media
          const displayStream = await navigator.mediaDevices.getDisplayMedia({
            video: {
              width: { ideal: 160 },
              height: { ideal: 90 },
              frameRate: { ideal: 5 }
            },
            audio: true
          });
          displayStreamRef.current = displayStream;

          // 2. Get hardware physical microphone
          const micStream = await navigator.mediaDevices.getUserMedia(constraints);
          micStreamRef.current = micStream;

          // 3. Setup core mixer Audio Context graph
          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioCtx) {
            const audioCtx = new AudioCtx();
            mixedContextRef.current = audioCtx;
            const dest = audioCtx.createMediaStreamDestination();

            // Connect Microphone source
            const micSource = audioCtx.createMediaStreamSource(micStream);
            micSource.connect(dest);

            // Connect display standard sounds
            const displayAudioTracks = displayStream.getAudioTracks();
            if (displayAudioTracks.length > 0) {
              const displaySource = audioCtx.createMediaStreamSource(displayStream);
              displaySource.connect(dest);
            } else {
              console.warn("User did not toggle system speaker sound allocation checkbox.");
            }

            stream = dest.stream;
          } else {
            // Mixed fallback simply uses microphone
            stream = micStream;
          }
        } catch (mixedErr) {
          console.warn("Mixed screen sounds acquisition dropped, falling back to clean microphone only:", mixedErr);
          triggerToast("Could not activate desktop capture. Falling back to Microphone Only.", "warning");
          setAudioSource("mic");

          // Cleanup any open streams
          if (displayStreamRef.current) {
            displayStreamRef.current.getTracks().forEach(t => t.stop());
            displayStreamRef.current = null;
          }
          if (micStreamRef.current) {
            micStreamRef.current.getTracks().forEach(t => t.stop());
            micStreamRef.current = null;
          }

          // Fallback user media stream capture
          stream = await navigator.mediaDevices.getUserMedia(constraints);
        }
      } else {
        // Microphone Only stream selection
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      }

      // Detect track settings to set active device label and active codec.
      // Pick an encode bitrate that matches the source quality: telephone-grade
      // Bluetooth (SCO, 8-16 kHz mono) can't benefit from a high bitrate, but
      // anything full-band gets 64 kbps for noticeably better far-field /
      // multi-speaker transcription quality.
      let targetBitrate = 64000;
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        const trackLabel = audioTrack.label || "Default Microphone";
        setActiveInputLabel(trackLabel);
        const isBluetooth = trackLabel.toLowerCase().includes("bluetooth") || 
                            trackLabel.toLowerCase().includes("buds") || 
                            trackLabel.toLowerCase().includes("headset") ||
                            trackLabel.toLowerCase().includes("hands-free") ||
                            trackLabel.toLowerCase().includes("hfp") ||
                            trackLabel.toLowerCase().includes("sco");
        if (isBluetooth) {
          const sampleRate = audioTrack.getSettings().sampleRate;
          if (sampleRate && sampleRate >= 24000) {
            setActiveCodec(`LC3 / BLE Audio (${sampleRate / 1000}kHz HD)`);
          } else {
            setActiveCodec("SCO / Mono (8-16kHz Dial-in)");
            targetBitrate = 24000; // band-limited source — don't waste storage
          }
        } else {
          const sampleRate = audioTrack.getSettings().sampleRate;
          setActiveCodec(`AAC / Opus Standard (${sampleRate ? sampleRate / 1000 : 48}kHz Stereo)`);
        }
      }

      const options = { 
        mimeType: "audio/webm",
        audioBitsPerSecond: targetBitrate
      };
      let recorder: MediaRecorder;
      try {
        recorder = new MediaRecorder(stream, options);
      } catch (err) {
        try {
          recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
        } catch (e) {
          recorder = new MediaRecorder(stream); // fallback to standard defaults
        }
      }

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        // Stop all track indicators dynamically
        stream.getTracks().forEach((track) => track.stop());
        if (micStreamRef.current) {
          micStreamRef.current.getTracks().forEach((track) => track.stop());
          micStreamRef.current = null;
        }
        if (displayStreamRef.current) {
          displayStreamRef.current.getTracks().forEach((track) => track.stop());
          displayStreamRef.current = null;
        }
        if (mixedContextRef.current) {
          mixedContextRef.current.close().catch(() => {});
          mixedContextRef.current = null;
        }

        handleAnalyzeOutput();
      };

      recorder.start();
      setIsRecording(true);
      setRecordingStream(stream);
      startRecordingTimer();

    } catch (error) {
      console.warn("Unable to open hardware microphone stream. Using elegant off-line testing mode simulation instead.", error);
      // Run fallback simulation of live visual animations
      setIsRecording(true);
      setRecordingStream(null);
      startRecordingTimer();
    }
  };

  const handleDirectAudioImport = async (file: File, customProjectName?: string) => {
    const isCapacitor = (window as any).Capacitor !== undefined;
    const apiBase = getNormalizedApiBaseUrl();
    if (isCapacitor && !apiBase) {
      triggerToast("Error: Please set your Android API Connection IP in the Settings tab.", "error");
      setIsProcessing(false);
      resetRecordingState();
      return;
    }

    setIsProcessing(true);
    setProcessingStatus("Reading file binary streams...");

    const meetingId = `meet_${Date.now()}`;
    const activeProjectName = customProjectName || projects.find(p => p.id === selectedProjectId)?.name || "General";
    
    const cleanFileName = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[_-]/g, " ");
    const importTitle = title.trim() || `Imported: ${cleanFileName}`;

    try {
      await ensureStoragePersisted();
      if (!(await hasSpaceFor(file.size))) {
        triggerToast("Low device storage — free up space soon so recordings keep saving.", "warning");
      }
      await saveAudioBlob(meetingId, file);
      console.log("Imported sound file saved locally inside IndexedDB:", meetingId);
    } catch (err) {
      console.warn("Could not save imported file to IndexedDB:", err);
      triggerToast("Couldn't save audio locally (storage full). Analysis will still run.", "error");
    }

    let approximateDuration = 60;
    try {
      const audioUrl = URL.createObjectURL(file);
      const audioObj = new Audio(audioUrl);
      approximateDuration = await new Promise<number>((resolve) => {
        audioObj.addEventListener("loadedmetadata", () => {
          resolve(Math.round(audioObj.duration) || 60);
          URL.revokeObjectURL(audioUrl);
        });
        audioObj.addEventListener("error", () => {
          resolve(60);
          URL.revokeObjectURL(audioUrl);
        });
        setTimeout(() => resolve(60), 3000);
      });
    } catch (err) {
      console.warn("Approximating duration from audio elements failed:", err);
    }

    // Check credit limits before starting processing (bypass in dev mode / localhost)
    const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    const isDevMode = localStorage.getItem("parley-dev-mode") === "true" || isLocalhost;
    const remainingSeconds = (aiUsageLimitMinutes * 60) - aiUsageUsedSeconds;
    if (!isDevMode && remainingSeconds < approximateDuration) {
      triggerToast("AI Processing Credits Depleted! Upgrade or refill in settings.", "error");
      setIsProcessing(false);
      
      const initialMeeting: Meeting = {
        id: meetingId,
        title: importTitle,
        date: new Date().toISOString(),
        durationSec: approximateDuration,
        project: activeProjectName,
        summary: "AI processing aborted: Insufficient credits. Please refill your credits in the settings menu.",
        topics: ["Credits Depleted"],
        actionItems: [],
        transcript: [],
        tags: initialTagsStr.split(",").map(t => t.trim()).filter(Boolean).concat("Imported", "No-Credits"),
        insights: [],
        nextTouchpoints: [],
        audioUrl: URL.createObjectURL(file),
        isPending: false,
        isFailed: true
      };
      addMeeting(initialMeeting);
      setSelectedMeetingId(meetingId);
      setActiveTab("home");
      return;
    }

    // Save immediate pending record
    const initialMeeting: Meeting = {
      id: meetingId,
      title: importTitle,
      date: new Date().toISOString(),
      durationSec: approximateDuration,
      project: activeProjectName,
      summary: "Imported speech transcription is compiling... Hang tight!",
      topics: ["Vocal file processing"],
      actionItems: [],
      transcript: [],
      tags: initialTagsStr.split(",").map(t => t.trim()).filter(Boolean).concat("Imported"),
      insights: [],
      nextTouchpoints: [],
      audioUrl: URL.createObjectURL(file),
      isPending: true,
      isFailed: false,
      ownerName: ownerName || undefined,
      ownerRole: ownerRole || undefined,
      statedContext: statedContext || undefined,
      customPrompt: customPrompt || undefined,
      cbtPsychologist: cbtPsychologist || undefined,
      negotiationCoach: negotiationCoach || undefined,
      performanceReviewLens: performanceReviewLens || undefined,
      difficultConversationDebrief: difficultConversationDebrief || undefined,
      personalAssistant: personalAssistant || undefined
    };

    addMeeting(initialMeeting);
    setSelectedMeetingId(meetingId);
    setActiveTab("home");

    try {
      const b64Data = await convertBlobToBase64(file);
      const apiBase = getNormalizedApiBaseUrl();
      const res = await fetch(`${apiBase}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audioData: b64Data,
          mimeType: file.type || "audio/webm",
          project: activeProjectName,
          durationSec: approximateDuration,
          title: importTitle,
          ownerName,
          ownerRole,
          voiceSignature: voiceSignature || undefined,
          statedContext,
          customPrompt,
          cbtPsychologist: cbtPsychologist && cbtProjects.includes(activeProjectName),
          negotiationCoach,
          performanceReviewLens,
          difficultConversationDebrief,
          personalAssistant
        })
      });

      if (!res.ok) {
        throw new Error(`Analyze API returned status code ${res.status}`);
      }

      const rawJson = await res.json();
      if (rawJson.error) {
        throw new Error(rawJson.error);
      }

      const actionItems: ActionItem[] = (rawJson.actionItems || []).map((ti: any, i: number) => ({
        id: `ai_${Date.now()}_${i}`,
        task: ti.task || "Review custom items",
        assignee: ti.assignee || "Unassigned",
        completed: !!ti.completed
      }));

      const transcript: TranscriptSegment[] = (rawJson.transcript || []).map((tc: any, i: number) => ({
        id: `ts_${Date.now()}_${i}`,
        speaker: tc.speaker || `Speaker ${i + 1}`,
        text: tc.text || "",
        timestamp: tc.timestamp || formatMinSec(Math.min(approximateDuration, i * 4))
      }));

      // Deduct credits
      if (!isDevMode) {
        const newUsed = aiUsageUsedSeconds + approximateDuration;
        setAiUsageUsedSeconds(newUsed);
        localStorage.setItem("parley-ai-used-seconds", String(newUsed));
      }

      updateMeeting({
        ...initialMeeting,
        title: rawJson.title || importTitle,
        summary: rawJson.summary || "No summary analyzed.",
        topics: rawJson.topics || ["General Standup"],
        actionItems,
        transcript,
        tags: rawJson.tags || ["Imported"],
        insights: rawJson.insights || [],
        nextTouchpoints: rawJson.nextTouchpoints || [],
        reflectionCbt: rawJson.reflectionCbt || undefined,
        reflectionNegotiation: rawJson.reflectionNegotiation || undefined,
        reflectionPerformance: rawJson.reflectionPerformance || undefined,
        reflectionDebrief: rawJson.reflectionDebrief || undefined,
        personalAssistantOutput: rawJson.personalAssistantOutput || undefined,
        personalAssistantActions: rawJson.personalAssistantActions || undefined,
        conversationSegments: rawJson.conversationSegments || [],
        isMultiDialogue: !!rawJson.isMultiDialogue,
        isPending: false,
        isFailed: false
      });
    } catch (error) {
      console.error("Analysis for imported file failed:", error);
      const detail = error instanceof Error ? error.message : String(error);
      const usedBase = getNormalizedApiBaseUrl() || "(same-origin)";
      triggerToast(`AI transcription failed: ${detail}`, "error");
      updateMeeting({
        ...initialMeeting,
        summary: `The speech-to-text transcript couldn't be generated automatically.\n\nReason: ${detail}\nEndpoint: ${usedBase}/api/analyze\n\nYour imported file is saved securely on this device. Tap 'Retry AI Transcription' to process it again.`,
        isPending: false,
        isFailed: true
      });
    } finally {
      setIsProcessing(false);
      resetRecordingState();
    }
  };

  const handleAudioFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await handleDirectAudioImport(file);
  };

  useEffect(() => {
    return () => {
      stopRecordingTimer();
      if (recordingStream) {
        recordingStream.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  return (
    <MeetingContext.Provider
      value={{
        meetings,
        projects,
        activeTab,
        setActiveTab,
        selectedMeetingId,
        setSelectedMeetingId,
        theme,
        setTheme,
        toggleTheme,
        wakeLockSupported,
        wakeLockActive,
        toggleWakeLock,
        keepAliveSupported,
        keepAliveActive,
        toggleKeepAlive,
        addMeeting,
        updateMeeting,
        deleteMeeting,
        addProject,
        deleteProject,

        // AI limits
        aiUsageLimitMinutes,
        aiUsageUsedSeconds,
        refillAiBalance,

        // Firebase Auth and sync
        user,
        authLoading,
        loginWithGoogle,
        logout,
        syncLocalToCloud,
        isSyncing,

        // Background recording parameters
        isRecording,
        isProcessing,
        processingStatus,
        duration,
        title,
        setTitle,
        selectedProjectId,
        setSelectedProjectId,
        initialTagsStr,
        setInitialTagsStr,
        audioSource,
        setAudioSource,
        recordingStream,
        handleStartRecord,
        handleStopRecord,
        handleAudioFileImport,
        handleDirectAudioImport,
        resetRecordingState,
        // Toast notifications
        toast,
        triggerToast,

        // AI Context and Custom Prompts metadata states
        ownerName,
        setOwnerName,
        voiceSignature,
        setVoiceSignature,
        ownerRole,
        setOwnerRole,
        statedContext,
        setStatedContext,
        customPrompt,
        setCustomPrompt,
        cbtPsychologist,
        setCbtPsychologist,
        cbtProjects,
        setCbtProjects,
        negotiationCoach,
        setNegotiationCoach,
        performanceReviewLens,
        setPerformanceReviewLens,
        difficultConversationDebrief,
        setDifficultConversationDebrief,
        personalAssistant,
        setPersonalAssistant,

        audioDevices,
        selectedAudioDeviceId,
        setSelectedAudioDeviceId,
        preferBluetooth,
        setPreferBluetooth,
        showInputSource,
        setShowInputSource,
        voiceCommandEnabled,
        setVoiceCommandEnabled,
        voicePhrase,
        setVoicePhrase,
        voiceSensitivity,
        setVoiceSensitivity,
        activeInputLabel,
        activeCodec,
        voiceStatus,
        autoSendEmail,
        setAutoSendEmail,
        autoSendWhatsApp,
        setAutoSendWhatsApp,
        targetEmail,
        setTargetEmail,
        targetWhatsApp,
        setTargetWhatsApp
      }}
    >
      {children}
    </MeetingContext.Provider>
  );
}

export function useMeetLog() {
  const context = useContext(MeetingContext);
  if (!context) {
    throw new Error("useMeetLog must be used within a MeetingProvider");
  }
  return context;
}

export function getNormalizedApiBaseUrl(): string {
  let url = localStorage.getItem("meetlog-api-base") || "";
  if (!url) return "";
  url = url.trim().replace(/\/+$/, "");
  const isLocal = /^(https?:\/\/)?(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|localhost)(:\d+)?$/i.test(url);
  if (isLocal) {
    url = url.replace(/^https:\/\//i, "http://");
    if (!url.startsWith("http://")) {
      url = "http://" + url;
    }
  } else if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "http://" + url;
  }
  return url;
}

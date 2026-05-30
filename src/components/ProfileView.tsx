import React, { useState } from "react";
import { useMeetLog } from "../context/MeetingContext";
import { User, Shield, HardDrive, RefreshCw, Sun, Moon, Info, HelpCircle, Coins, Database, Cpu, Layers, Lock, Check, Sparkles, AlertCircle, Brain, Heart, Folder, Mic, Bluetooth, Mail, Swords, BarChart3, HeartHandshake, Bot } from "lucide-react";

export default function ProfileView() {
  const {
    theme,
    setTheme,
    toggleTheme,
    meetings,
    projects,
    wakeLockSupported,
    wakeLockActive,
    toggleWakeLock,
    keepAliveActive,
    toggleKeepAlive,
    user,
    authLoading,
    loginWithGoogle,
    logout,
    syncLocalToCloud,
    isSyncing,
    aiUsageLimitMinutes,
    aiUsageUsedSeconds,
    refillAiBalance,

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
    autoSendEmail,
    setAutoSendEmail,
    autoSendWhatsApp,
    setAutoSendWhatsApp,
    targetEmail,
    setTargetEmail,
    targetWhatsApp,
    setTargetWhatsApp,
    ownerName,
    voiceSignature,
    setVoiceSignature,

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
    setPersonalAssistant
  } = useMeetLog();

  // CBT state settings
  const [cbtEnabled, setCbtEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem("parley-cbt-enabled") || localStorage.getItem("meetlog-cbt-enabled");
    return saved !== "false"; // default is enabled
  });

  const [openClawEndpoint, setOpenClawEndpoint] = useState<string>(() => {
    return localStorage.getItem("parley-openclaw-endpoint") || "";
  });

  const [devModeActive, setDevModeActive] = useState<boolean>(() => {
    const saved = localStorage.getItem("parley-dev-mode") || localStorage.getItem("meetlog-dev-mode");
    return saved === "true"; // default is disabled for standard user UI, but toggleable for our custom assessment!
  });

  // Android API base URL configuration
  const [apiBaseUrl, setApiBaseUrl] = useState<string>(() => {
    return localStorage.getItem("meetlog-api-base") || "";
  });

  // Pricing & GDPR Estimator Hub state variables
  const [estHours, setEstHours] = useState<number>(15);
  const [estTier, setEstTier] = useState<"spark" | "core" | "anchor">("core");
  const [estimatorTab, setEstimatorTab] = useState<"plans" | "calculator" | "gdpr">("plans");

  // Voice signature training states
  const [isRecordingSignature, setIsRecordingSignature] = useState(false);
  const [signatureSeconds, setSignatureSeconds] = useState(0);
  const [signatureBlob, setSignatureBlob] = useState<Blob | null>(null);
  const [isTrainingSignature, setIsTrainingSignature] = useState(false);

  const signatureRecorderRef = React.useRef<MediaRecorder | null>(null);
  const signatureChunksRef = React.useRef<Blob[]>([]);
  const signatureTimerRef = React.useRef<any>(null);

  const startSignatureRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const options = { mimeType: "audio/webm", audioBitsPerSecond: 24000 };
      let recorder: MediaRecorder;
      try {
        recorder = new MediaRecorder(stream, options);
      } catch (e) {
        recorder = new MediaRecorder(stream);
      }

      signatureChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          signatureChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(signatureChunksRef.current, { type: signatureChunksRef.current[0]?.type || "audio/webm" });
        setSignatureBlob(blob);
        await trainSignature(blob);
      };

      signatureRecorderRef.current = recorder;
      recorder.start();
      setIsRecordingSignature(true);
      setSignatureSeconds(0);

      signatureTimerRef.current = setInterval(() => {
        setSignatureSeconds((prev) => {
          if (prev >= 9) {
            stopSignatureRecording();
            return 10;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      alert("Microphone access is required to train your voice profile.");
    }
  };

  const stopSignatureRecording = () => {
    if (signatureRecorderRef.current && signatureRecorderRef.current.state !== "inactive") {
      signatureRecorderRef.current.stop();
    }
    if (signatureTimerRef.current) {
      clearInterval(signatureTimerRef.current);
    }
    setIsRecordingSignature(false);
  };

  const trainSignature = async (blob: Blob) => {
    setIsTrainingSignature(true);
    try {
      const reader = new FileReader();
      const b64DataPromise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      const b64Data = await b64DataPromise;
      const apiBase = localStorage.getItem("meetlog-api-base") || "";
      const normalizedApiBase = apiBase.trim().replace(/\/+$/, "");
      
      const res = await fetch(`${normalizedApiBase}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audioData: b64Data,
          mimeType: blob.type || "audio/webm",
          project: "General",
          durationSec: 10,
          title: "Voice Signature Calibration"
        })
      });

      if (!res.ok) throw new Error("Acoustic calibration failed.");
      const rawJson = await res.json();
      
      const segmentsText = (rawJson.transcript || []).map((t: any) => t.text).join(" ") || rawJson.summary || "";
      if (!segmentsText.trim() || segmentsText.toLowerCase().includes("no spoken words")) {
        throw new Error("Whisper returned empty calibration signature.");
      }

      localStorage.setItem("parley-voice-signature", segmentsText);
      setVoiceSignature(segmentsText);
      alert("Acoustic voice signature calibrated and active!");
    } catch (e: any) {
      console.error(e);
      alert(`Voice profile training failed: ${e.message}`);
    } finally {
      setIsTrainingSignature(false);
    }
  };

  const handleResetStorage = () => {
    if (confirm("Confirm: This will clear your custom browser storage, sign you out of cloud sync, and restore default demo files. Proceed?")) {
      // Clear Parley keys
      localStorage.removeItem("parley-meetings-v2");
      localStorage.removeItem("parley-projects-v2");
      localStorage.removeItem("parley-theme");
      localStorage.removeItem("parley-cbt-enabled");
      localStorage.removeItem("parley-cbt-projects");
      localStorage.removeItem("parley-dev-mode");
      // Clear legacy MeetLog keys
      localStorage.removeItem("meetlog-meetings-v2");
      localStorage.removeItem("meetlog-projects-v2");
      localStorage.removeItem("meetlog-theme");
      localStorage.removeItem("meetlog-cbt-enabled");
      localStorage.removeItem("meetlog-cbt-projects");
      localStorage.removeItem("meetlog-dev-mode");
      window.location.reload();
    }
  };

  const handleTestEmail = () => {
    if (!targetEmail) {
      alert("Please enter a target email address first.");
      return;
    }
    const testTitle = "Test Meeting - Parley Integration Check";
    const testSummary = "This is a test notification from the Parley App. Your automated post-meeting email integration is working correctly!";
    const emailSubject = `${testTitle} - Parley Memo Notes`;
    const emailBody = `Meeting Summary:\n\n${testSummary}\n\nGenerated securely via Parley.`;
    const mailto = `mailto:${targetEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    const isCapacitor = (window as any).Capacitor !== undefined;
    window.open(mailto, isCapacitor ? "_system" : "_self");
  };

  const handleTestWhatsApp = () => {
    if (!targetWhatsApp) {
      alert("Please enter a target WhatsApp phone number first.");
      return;
    }
    const testTitle = "Test Meeting - Parley Integration Check";
    const testSummary = "This is a test notification from the Parley App. Your automated post-meeting WhatsApp integration is working correctly!";
    const waText = `*${testTitle}*\n\n${testSummary}`;
    const cleanPhone = targetWhatsApp.replace(/\+/g, "").replace(/\s/g, "");
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waText)}`;
    const isCapacitor = (window as any).Capacitor !== undefined;
    window.open(waUrl, isCapacitor ? "_system" : "_blank");
  };

  return (
    <div className="pb-28 pt-4 px-4 max-w-xl mx-auto space-y-6" id="profile-settings-view">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-brand-green-dark dark:text-white tracking-tight">
          System <span className="text-brand-green dark:text-brand-gold-bright font-black">Settings</span>
        </h1>
        <p className="text-xs text-brand-green/75 dark:text-brand-cream/75 mt-0.5">
          Manage standalone behavior, themes, and client persistence
        </p>
      </div>

      {/* User Information Profile Box - Dynamic with Google Auth */}
      {authLoading ? (
        <div className="bg-white dark:bg-brand-green-dark/80 border border-brand-green/10 dark:border-brand-gold/15 p-6 rounded-3xl flex items-center justify-center gap-2">
          <RefreshCw className="animate-spin text-brand-gold" size={18} />
          <span className="text-brand-green/60 dark:text-brand-cream/60 font-mono text-xs">Authenticating user portal...</span>
        </div>
      ) : user ? (
        <div className="space-y-3">
          <div className="bg-white dark:bg-brand-green-dark/80 border border-brand-green/10 dark:border-brand-gold/15 p-4 rounded-3xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 overflow-hidden">
              {/* Profile Avatar */}
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  referrerPolicy="no-referrer"
                  alt={user.displayName || "Avatar"}
                  className="w-14 h-14 rounded-full border border-brand-gold shrink-0 object-cover"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-brand-green text-brand-gold border border-brand-gold/25 flex items-center justify-center font-black text-lg shrink-0">
                  {user.displayName ? user.displayName.substring(0, 2).toUpperCase() : "PL"}
                </div>
              )}

              <div className="space-y-0.5 overflow-hidden">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="font-extrabold text-sm md:text-base text-brand-green dark:text-brand-cream truncate">
                    {user.displayName || "Google Identity"}
                  </h3>
                  <span className="bg-brand-gold/10 text-brand-gold dark:text-brand-gold-bright text-[8px] font-black tracking-wider uppercase px-1.5 py-0.5 rounded border border-brand-gold/20 shadow-sm">
                    ACTIVE SYNC
                  </span>
                </div>

                <p className="text-xs text-brand-green/70 dark:text-brand-cream/70 truncate font-mono">
                  {user.email || "No email"}
                </p>

                <p className="text-[9px] text-brand-gold font-mono">
                  Cloud backup enabled for Google Play Launch
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              className="px-3 py-1.5 text-[10px] uppercase font-extrabold bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl transition-all"
            >
              Sign Out
            </button>
          </div>

          {/* Sync Local Data to Cloud Helper */}
          <div className="bg-brand-gold/5 border border-brand-gold/20 rounded-2xl p-3 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-[9px] font-black text-brand-gold tracking-wide uppercase font-mono block">Data Relocation</span>
              <h4 className="text-xs font-black text-brand-green dark:text-brand-cream">Push standalone records to cloud</h4>
              <p className="text-[10px] text-brand-green/80 dark:text-brand-cream/80">Merge any offline recordings stored on this browser into your Google cloud account.</p>
            </div>
            <button
              onClick={syncLocalToCloud}
              disabled={isSyncing}
              className="px-3 py-2 bg-brand-gold hover:bg-[#b0913c] text-brand-green-dark text-[11px] font-black tracking-wide uppercase rounded-xl transition-all flex items-center gap-1 shrink-0 disabled:opacity-50"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="animate-spin" size={12} /> Syncing...
                </>
              ) : (
                <>
                  <Database size={12} /> Push Backup
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-brand-green-dark/80 border border-brand-green/10 dark:border-brand-gold/15 p-5 rounded-3xl space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-green/10 dark:bg-brand-gold/10 text-brand-green dark:text-brand-gold flex items-center justify-center font-bold shrink-0">
              <Lock size={18} />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-sm text-brand-green-dark dark:text-brand-cream">
                Cloud Sync & Google Play Readiness
              </h3>
              <p className="text-xs text-brand-green/80 dark:text-brand-cream/85 leading-relaxed">
                Connect your Google Account to automatically sync projects, directory folders, transcripts, and AI-generated checklists in real-time. Unlocks access across multiple devices.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center pt-2">
            <button
              onClick={loginWithGoogle}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-green hover:bg-[#152a1b] text-brand-gold dark:bg-brand-gold dark:hover:bg-[#b0913c] dark:text-brand-green-dark text-xs font-bold rounded-2xl shadow-sm border border-brand-gold/20 transition-all cursor-pointer"
            >
              {/* Google Play Styled Brand Icon */}
              <svg className="w-4 h-4 mr-1 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign In with Google Account
            </button>
          </div>
        </div>
      )}

      {/* Interface configurations */}
      <div className="bg-white dark:bg-brand-green-dark/80 border border-brand-green/10 dark:border-brand-gold/15 rounded-2xl p-4 space-y-4">
        <h3 className="text-xs font-bold text-brand-green dark:text-brand-cream uppercase tracking-widest border-b border-brand-green/10 dark:border-brand-gold/10 pb-2">
          Interface Visual Preference
        </h3>

        {/* Theme select */}
        <div className="space-y-3">
          <div className="flex flex-col gap-1">
            <h4 className="text-xs font-bold text-brand-green dark:text-brand-cream">Visual Theme Canvas</h4>
            <p className="text-[10px] text-zinc-500 dark:text-brand-cream/70">Switch color layout aesthetics dynamically</p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setTheme("light")}
              className={`px-3 py-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                theme === "light"
                  ? "bg-brand-green text-brand-cream border-brand-green shadow-sm"
                  : "bg-white/70 dark:bg-[#060b08]/50 border-brand-green/10 dark:border-brand-gold/10 text-brand-green dark:text-brand-cream hover:bg-brand-green/5"
              }`}
            >
              <Sun size={13} />
              <span>Forest</span>
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`px-3 py-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                theme === "dark"
                  ? "bg-brand-green dark:bg-brand-gold dark:text-brand-green-dark text-brand-cream border-brand-green dark:border-brand-gold shadow-sm"
                  : "bg-white/70 dark:bg-[#060b08]/50 border-brand-green/10 dark:border-brand-gold/10 text-brand-green dark:text-brand-cream hover:bg-brand-green/5"
              }`}
            >
              <Moon size={13} />
              <span>Charcoal</span>
            </button>
            <button
              onClick={() => setTheme("chic")}
              className={`px-3 py-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                theme === "chic"
                  ? "bg-[#3D2314] text-[#FAF4EE] border-[#3D2314] shadow-sm font-black"
                  : "bg-white/70 dark:bg-[#060b08]/50 border-brand-green/10 dark:border-brand-gold/10 text-brand-green dark:text-brand-cream hover:bg-brand-green/5"
              }`}
            >
              <Sparkles size={13} className="text-[#C5A059]" />
              <span>Chic</span>
            </button>
          </div>
        </div>

        {/* API Server Base URL Override */}
        <div className="space-y-2 pt-2.5 border-t border-brand-green/10 dark:border-brand-gold/10">
          <div className="flex flex-col gap-1">
            <h4 className="text-xs font-bold text-brand-green dark:text-brand-cream">Android API Connection</h4>
            <p className="text-[10px] text-zinc-500 dark:text-brand-cream/70">Specify host PC IP for mobile recording sync (e.g. http://192.168.1.15:3000)</p>
          </div>
          <input
            type="text"
            placeholder="http://192.168.x.x:3000"
            value={apiBaseUrl}
            onChange={(e) => {
              setApiBaseUrl(e.target.value);
              localStorage.setItem("meetlog-api-base", e.target.value);
            }}
            className="w-full bg-brand-green/5 dark:bg-brand-green-dark/40 border border-brand-green/10 dark:border-brand-gold/15 rounded-xl px-3 py-2 text-xs font-mono text-brand-green dark:text-brand-cream focus:outline-none focus:border-brand-gold"
          />
        </div>
      </div>

      {/* API Key Processing Credits Panel */}
      <div className="bg-white dark:bg-brand-green-dark/80 border border-brand-green/10 dark:border-brand-gold/15 rounded-2xl p-4 space-y-4">
        <h3 className="text-xs font-bold text-brand-green dark:text-brand-cream uppercase tracking-widest border-b border-brand-green/10 dark:border-brand-gold/10 pb-2 flex items-center gap-1.5">
          <Coins size={14} className="text-brand-gold" /> API Processing Credits
        </h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs">
            <div>
              <span className="font-bold text-brand-green dark:text-brand-cream">Remaining Free Usage Limit</span>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Usage cost is covered by Parley developer API Key</p>
            </div>
            <div className="text-right">
              <span className="text-sm font-mono font-black text-brand-green dark:text-brand-gold-bright">
                {Math.max(0, aiUsageLimitMinutes - Math.ceil(aiUsageUsedSeconds / 60))}m
              </span>
              <span className="text-[10px] text-zinc-400"> / {aiUsageLimitMinutes}m</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-brand-green/5 dark:bg-brand-green-dark/40 rounded-full overflow-hidden">
            <div 
              style={{ width: `${Math.max(0, Math.min(100, ((aiUsageLimitMinutes * 60 - aiUsageUsedSeconds) / (aiUsageLimitMinutes * 60)) * 100))}%` }}
              className={`h-full rounded-full transition-all duration-300 ${
                (aiUsageLimitMinutes * 60 - aiUsageUsedSeconds) <= 300 
                  ? "bg-red-500" 
                  : "bg-brand-gold"
              }`}
            />
          </div>

          <div className="flex justify-between items-center pt-2 flex-wrap gap-2">
            <span className="text-[9.5px] text-zinc-400 italic">Limits avoid abuse and secure token budgeting.</span>
            <button
              onClick={refillAiBalance}
              className="px-3 py-1.5 text-[10px] font-black uppercase bg-brand-green/10 hover:bg-brand-green/20 dark:bg-brand-gold/10 dark:hover:bg-brand-gold/20 text-brand-green dark:text-brand-gold border border-brand-green/15 dark:border-brand-gold/15 rounded-xl transition-all cursor-pointer"
            >
              Refill Credits (+60m)
            </button>
          </div>
        </div>
      </div>

      {/* Active AI Personas Configuration */}
      <div className="bg-white dark:bg-brand-green-dark/80 border border-brand-green/10 dark:border-brand-gold/15 rounded-2xl p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-brand-green/10 dark:border-brand-gold/10 pb-2">
          <h3 className="text-xs font-bold text-brand-green dark:text-brand-cream uppercase tracking-widest flex items-center gap-1.5 font-sans">
            <Brain size={14} className="text-brand-gold" /> Active AI Personas
          </h3>
        </div>

        <div className="space-y-4 font-normal text-xs text-brand-green/85 dark:text-brand-cream/85">
          {/* CBT Psychologist Mode */}
          <div className="space-y-3 p-2 rounded-xl bg-brand-green/5 dark:bg-brand-gold/5 border border-brand-green/10 dark:border-brand-gold/15">
            <button
              type="button"
              onClick={() => setCbtPsychologist(!cbtPsychologist)}
              className="w-full flex items-center justify-between text-left cursor-pointer"
            >
              <div className="space-y-0.5 max-w-[80%]">
                <div className="font-bold text-brand-green dark:text-brand-cream flex items-center gap-1.5">
                  <Brain size={13} className="text-brand-gold" /> Cognitive Behavioral Psychologist
                </div>
                <p className="text-[10px] text-zinc-500 dark:text-brand-cream/70 leading-normal font-normal">
                  Analyzes communication styles, stress triggers, and flags cognitive distortions.
                </p>
              </div>
              <div
                className={`w-10 h-6 flex items-center rounded-full p-1 transition-all duration-300 shrink-0 ${
                  cbtPsychologist ? "bg-brand-green dark:bg-brand-gold" : "bg-zinc-200 dark:bg-zinc-800"
                }`}
              >
                <div
                  className={`bg-white dark:bg-brand-green-dark w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                    cbtPsychologist ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </div>
            </button>

            {cbtPsychologist && (
              <div className="pt-2.5 border-t border-dashed border-brand-green/10 dark:border-brand-gold/15 space-y-2 animate-fadeIn">
                <span className="text-[9px] font-mono tracking-wider font-extrabold text-brand-gold uppercase block mb-1">
                  Linked Recording Folders
                </span>
                <p className="text-[10px] text-brand-green/75 dark:text-brand-cream/75 leading-relaxed pb-1">
                  Associate the psychologist model only with chosen folders. You can keep business folders unchecked to ensure strict factual focus.
                </p>

                <div className="grid grid-cols-1 gap-2">
                  {projects.map((proj) => {
                    const isLinked = cbtProjects.includes(proj.name);
                    return (
                      <div 
                        key={proj.id} 
                        onClick={() => {
                          const updated = isLinked
                            ? cbtProjects.filter(p => p !== proj.name)
                            : [...cbtProjects, proj.name];
                          setCbtProjects(updated);
                          localStorage.setItem("parley-cbt-projects", JSON.stringify(updated));
                        }}
                        className="flex items-center justify-between p-2 rounded-xl bg-brand-green/5 hover:bg-brand-green/10 dark:bg-brand-gold/5 dark:hover:bg-brand-gold/10 border border-brand-green/10 dark:border-brand-gold/15 cursor-pointer text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <Folder size={12} className="text-brand-green dark:text-brand-gold" />
                          <span className="font-extrabold text-brand-green dark:text-brand-cream">{proj.name}</span>
                          {proj.name === "Personal" ? (
                            <span className="bg-brand-gold/15 border border-brand-gold/25 text-brand-green dark:text-brand-gold font-bold text-[8.5px] px-1.5 py-0.5 rounded">
                              Support Scope
                            </span>
                          ) : (
                            <span className="text-[8.5px] text-brand-green/60 dark:text-brand-cream/60 font-normal">Business</span>
                          )}
                        </div>
                        <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                          isLinked
                            ? "bg-brand-green dark:bg-brand-gold text-brand-gold dark:text-brand-green-dark border-brand-gold/30"
                            : "border-brand-green/20 dark:border-brand-gold/20"
                        }`}>
                          {isLinked && <Check size={11} className="stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Negotiation Coach Mode */}
          <button
            type="button"
            onClick={() => setNegotiationCoach(!negotiationCoach)}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-brand-green/5 hover:bg-brand-green/10 dark:bg-brand-gold/5 dark:hover:bg-brand-gold/10 border border-brand-green/10 dark:border-brand-gold/15 text-left transition-colors cursor-pointer"
          >
            <div className="space-y-0.5 max-w-[80%]">
              <div className="font-bold text-brand-green dark:text-brand-cream flex items-center gap-1.5">
                <Swords size={13} className="text-brand-gold" /> Negotiation Coach
              </div>
              <p className="text-[10px] text-zinc-500 dark:text-brand-cream/70 leading-normal font-normal">
                Analyzes concessions, leverage, win-win alignment, and BATNA tactics.
              </p>
            </div>
            <div
              className={`w-10 h-6 flex items-center rounded-full p-1 transition-all duration-300 shrink-0 ${
                negotiationCoach ? "bg-brand-green dark:bg-brand-gold" : "bg-zinc-200 dark:bg-zinc-800"
              }`}
            >
              <div
                className={`bg-white dark:bg-brand-green-dark w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                  negotiationCoach ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </div>
          </button>

          {/* Performance Review Lens Mode */}
          <button
            type="button"
            onClick={() => setPerformanceReviewLens(!performanceReviewLens)}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-brand-green/5 hover:bg-brand-green/10 dark:bg-brand-gold/5 dark:hover:bg-brand-gold/10 border border-brand-green/10 dark:border-brand-gold/15 text-left transition-colors cursor-pointer"
          >
            <div className="space-y-0.5 max-w-[80%]">
              <div className="font-bold text-brand-green dark:text-brand-cream flex items-center gap-1.5">
                <BarChart3 size={13} className="text-brand-gold" /> Performance Review Lens
              </div>
              <p className="text-[10px] text-zinc-500 dark:text-brand-cream/70 leading-normal font-normal">
                Rates corporate competency milestones, leadership quality, and growth feedback.
              </p>
            </div>
            <div
              className={`w-10 h-6 flex items-center rounded-full p-1 transition-all duration-300 shrink-0 ${
                performanceReviewLens ? "bg-brand-green dark:bg-brand-gold" : "bg-zinc-200 dark:bg-zinc-800"
              }`}
            >
              <div
                className={`bg-white dark:bg-brand-green-dark w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                  performanceReviewLens ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </div>
          </button>

          {/* Difficult Conversation Debrief Mode */}
          <button
            type="button"
            onClick={() => setDifficultConversationDebrief(!difficultConversationDebrief)}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-brand-green/5 hover:bg-brand-green/10 dark:bg-brand-gold/5 dark:hover:bg-brand-gold/10 border border-brand-green/10 dark:border-brand-gold/15 text-left transition-colors cursor-pointer"
          >
            <div className="space-y-0.5 max-w-[80%]">
              <div className="font-bold text-brand-green dark:text-brand-cream flex items-center gap-1.5">
                <HeartHandshake size={13} className="text-brand-gold" /> Difficult Conversation Debrief
              </div>
              <p className="text-[10px] text-zinc-500 dark:text-brand-cream/70 leading-normal font-normal">
                Audits emotional pacing, conflict triggers, active listening, and relationship repair.
              </p>
            </div>
            <div
              className={`w-10 h-6 flex items-center rounded-full p-1 transition-all duration-300 shrink-0 ${
                difficultConversationDebrief ? "bg-brand-green dark:bg-brand-gold" : "bg-zinc-200 dark:bg-zinc-800"
              }`}
            >
              <div
                className={`bg-white dark:bg-brand-green-dark w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                  difficultConversationDebrief ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </div>
          </button>

          {/* Personal Assistant Mode */}
          <div className="space-y-3.5 p-2 rounded-xl bg-brand-green/5 dark:bg-brand-gold/5 border border-brand-green/10 dark:border-brand-gold/15">
            <button
              type="button"
              onClick={() => setPersonalAssistant(!personalAssistant)}
              className="w-full flex items-center justify-between text-left cursor-pointer"
            >
              <div className="space-y-0.5 max-w-[80%]">
                <div className="font-bold text-brand-green dark:text-brand-cream flex items-center gap-1.5">
                  <Bot size={13} className="text-brand-gold" /> Personal Assistant Mode
                </div>
                <p className="text-[10px] text-zinc-500 dark:text-brand-cream/70 leading-normal font-normal">
                  Generates spoken briefs, schedules calendars, drafts mail/WhatsApp messages.
                </p>
              </div>
              <div
                className={`w-10 h-6 flex items-center rounded-full p-1 transition-all duration-300 shrink-0 ${
                  personalAssistant ? "bg-brand-green dark:bg-brand-gold" : "bg-zinc-200 dark:bg-zinc-800"
                }`}
              >
                <div
                  className={`bg-white dark:bg-brand-green-dark w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                    personalAssistant ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </div>
            </button>

            <div className="space-y-3.5 pt-3.5 border-t border-dashed border-brand-green/10 dark:border-brand-gold/15 animate-fadeIn" id="personal-assistant-config-panel">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-zinc-500 dark:text-brand-cream/70 block uppercase tracking-wider">
                  OpenClaw API Endpoint URL
                </label>
                <input
                  type="url"
                  placeholder="e.g. http://192.168.1.100:8000/v1/action"
                  value={openClawEndpoint}
                  onChange={(e) => {
                    setOpenClawEndpoint(e.target.value);
                    localStorage.setItem("parley-openclaw-endpoint", e.target.value);
                  }}
                  className="w-full bg-brand-green/5 dark:bg-brand-green-dark/40 border border-brand-green/10 dark:border-brand-gold/15 rounded-xl px-3 py-2 text-xs text-brand-green dark:text-brand-cream focus:outline-none focus:border-brand-gold"
                />
                <p className="text-[9px] text-stone-500 dark:text-stone-400 dark:text-brand-cream/50 leading-relaxed font-normal">
                  Enter the REST API endpoint of your custom OpenClaw instance to dispatch task structures directly.
                </p>
              </div>
              
              <div className="space-y-1.5">
                <span className="text-[9px] font-bold text-zinc-500 dark:text-brand-cream/70 block uppercase tracking-wider">
                  Post-Meeting Automation Defaults
                </span>
                <div className="text-[9.5px] text-brand-green/80 dark:text-brand-cream/80 space-y-1 bg-brand-green/5 dark:bg-brand-green-dark/50 p-2.5 rounded-xl border border-brand-green/5 dark:border-brand-gold/10 font-normal leading-relaxed">
                  <div>• <strong>Auto-forwarding:</strong> Emails auto-drafted via client intents.</div>
                  <div>• <strong>WhatsApp:</strong> Pre-filled text templates sent straight to your selected contact number.</div>
                  <div>• <strong>Integrations Status:</strong> Action items can be manually pushed to Spark channel logs or Google Tasks panels using the <em>Execute</em> buttons inside notes.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Audio Input & Recording Triggers */}
      <div className="bg-white dark:bg-brand-green-dark/80 border border-brand-green/10 dark:border-brand-gold/15 rounded-2xl p-4 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-brand-green/10 dark:border-brand-gold/10 pb-2">
          <h3 className="text-xs font-bold text-brand-green dark:text-brand-cream uppercase tracking-widest flex items-center gap-1.5 font-sans">
            <Mic size={14} className="text-brand-gold" /> Audio Input & Recording Triggers
          </h3>
        </div>

        <div className="space-y-4 font-normal text-xs text-brand-green/85 dark:text-brand-cream/85">
          {/* Microphone Selector */}
          <div className="space-y-1.5">
            <label className="font-bold flex items-center justify-between">
              <span>Audio Input Source</span>
              <button 
                onClick={async () => {
                  try {
                    // Trigger permissions request to query label details
                    await navigator.mediaDevices.getUserMedia({ audio: true });
                    // Trigger custom event or wait for state refresh
                    window.location.reload(); // reload or refresh simply
                  } catch (e) {
                    console.warn(e);
                  }
                }}
                className="text-[9px] uppercase font-black text-brand-gold hover:underline cursor-pointer flex items-center gap-1"
              >
                <RefreshCw size={10} className="animate-spin-hover" /> Request Permissions
              </button>
            </label>
            <div className="relative">
              <select
                value={selectedAudioDeviceId}
                onChange={(e) => setSelectedAudioDeviceId(e.target.value)}
                className="w-full bg-brand-green/5 dark:bg-brand-green-dark/40 border border-brand-green/10 dark:border-brand-gold/15 rounded-xl px-3 py-2 text-xs text-brand-green dark:text-brand-cream focus:outline-none focus:border-brand-gold appearance-none cursor-pointer"
              >
                <option value="default" className="dark:bg-brand-green-dark dark:text-brand-cream">Default Microphone</option>
                {audioDevices.map((device, idx) => (
                  <option 
                    key={device.deviceId || idx} 
                    value={device.deviceId}
                    className="dark:bg-brand-green-dark dark:text-brand-cream"
                  >
                    {device.label || `Microphone ${idx + 1} (${device.deviceId.slice(0, 5)}...)`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Prefer Bluetooth */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-brand-green/5 dark:bg-brand-gold/5 border border-brand-green/10 dark:border-brand-gold/15">
            <div className="space-y-0.5 max-w-[80%]">
              <div className="flex items-center gap-1.5 font-bold text-brand-green dark:text-brand-cream">
                <Bluetooth size={12} className="text-brand-gold" /> Prefer Bluetooth Device
              </div>
              <p className="text-[10px] text-zinc-500 dark:text-brand-cream/70 leading-tight">
                Automatically route audio input through connected Bluetooth accessories (e.g. Galaxy Buds, Sony headphones) when available.
              </p>
            </div>
            <button
              onClick={() => setPreferBluetooth(!preferBluetooth)}
              className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 ${
                preferBluetooth ? "bg-brand-green dark:bg-brand-gold" : "bg-zinc-200 dark:bg-zinc-800"
              }`}
            >
              <div
                className={`bg-white dark:bg-brand-green-dark w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                  preferBluetooth ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Show Input Source Badge */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-brand-green/5 dark:bg-brand-gold/5 border border-brand-green/10 dark:border-brand-gold/15">
            <div className="space-y-0.5 max-w-[80%]">
              <div className="font-bold text-brand-green dark:text-brand-cream flex items-center gap-1.5">
                Show Input Source In Record Screen
              </div>
              <p className="text-[10px] text-zinc-500 dark:text-brand-cream/70 leading-tight">
                Display the active microphone label and audio codec specifications during recording sessions.
              </p>
            </div>
            <button
              onClick={() => setShowInputSource(!showInputSource)}
              className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 ${
                showInputSource ? "bg-brand-green dark:bg-brand-gold" : "bg-zinc-200 dark:bg-zinc-800"
              }`}
            >
              <div
                className={`bg-white dark:bg-brand-green-dark w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                  showInputSource ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Recording Triggers Divider */}
          <div className="pt-2 border-t border-dashed border-brand-green/10 dark:border-brand-gold/15">
            <span className="text-[9px] font-mono tracking-wider font-extrabold text-brand-gold uppercase block mb-2">
              Recording Triggers
            </span>
          </div>

          {/* Voice Command Wake Word Trigger */}
          <div className="space-y-3 p-2 rounded-xl bg-brand-green/5 dark:bg-brand-gold/5 border border-brand-green/10 dark:border-brand-gold/15">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 max-w-[80%]">
                <div className="font-bold text-brand-green dark:text-brand-cream flex items-center gap-1.5">
                  Voice Activation Wake Command
                </div>
                <p className="text-[10px] text-zinc-500 dark:text-brand-cream/70 leading-tight">
                  Always-listening background service. Trigger recording using a specific phrase.
                </p>
              </div>
              <button
                onClick={() => setVoiceCommandEnabled(!voiceCommandEnabled)}
                className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 shrink-0 ${
                  voiceCommandEnabled ? "bg-brand-green dark:bg-brand-gold" : "bg-zinc-200 dark:bg-zinc-800"
                }`}
              >
                <div
                  className={`bg-white dark:bg-brand-green-dark w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                    voiceCommandEnabled ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {voiceCommandEnabled && (
              <div className="space-y-3 pt-2.5 border-t border-brand-green/10 dark:border-brand-gold/10 animate-fadeIn">
                <div className="grid grid-cols-2 gap-3">
                  {/* Select Voice Phrase */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 dark:text-brand-cream/70 block">
                      Wakephrase Command
                    </label>
                    <select
                      value={voicePhrase}
                      onChange={(e) => setVoicePhrase(e.target.value)}
                      className="w-full bg-brand-green/5 dark:bg-brand-green-dark/60 border border-brand-green/10 dark:border-brand-gold/15 rounded-lg px-2.5 py-1.5 text-[11px] text-brand-green dark:text-brand-cream focus:outline-none focus:border-brand-gold cursor-pointer"
                    >
                      <option value="hey parley record" className="dark:bg-brand-green-dark">"Hey Parley, record"</option>
                      <option value="hey meetlog record" className="dark:bg-brand-green-dark">"Hey MeetLog, record"</option>
                      <option value="start logging" className="dark:bg-brand-green-dark">"Start logging"</option>
                      <option value="record this" className="dark:bg-brand-green-dark">"Record this"</option>
                      <option value="parley listen" className="dark:bg-brand-green-dark">"Parley, listen"</option>
                    </select>
                  </div>

                  {/* Sensitivity */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 dark:text-brand-cream/70 block">
                      Detection Sensitivity
                    </label>
                    <div className="flex bg-brand-green/5 dark:bg-brand-green-dark p-0.5 rounded-lg border border-brand-green/10 dark:border-brand-gold/15">
                      {(["low", "medium", "high"] as const).map((sens) => (
                        <button
                          key={sens}
                          type="button"
                          onClick={() => setVoiceSensitivity(sens)}
                          className={`flex-1 text-[9px] uppercase font-bold py-1 rounded transition-all cursor-pointer ${
                            voiceSensitivity === sens
                              ? "bg-brand-green text-brand-cream dark:bg-brand-gold dark:text-brand-green-dark font-black"
                              : "text-brand-green/50 dark:text-brand-cream/50"
                          }`}
                        >
                          {sens}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-[9.5px] text-brand-green/75 dark:text-brand-cream/75 leading-relaxed bg-brand-green/5 dark:bg-brand-gold/5 p-2 rounded-lg border border-brand-green/5 dark:border-brand-gold/10">
                  <span className="font-bold text-brand-gold">ℹ️ Background Note:</span> Continuous listening consumes approximately 2-4% additional battery. Speech recognition stops automatically while recording is active to save resources.
                </div>
                
                <div className="text-[9.5px] text-brand-green/75 dark:text-brand-cream/75 leading-relaxed bg-brand-green/5 dark:bg-brand-gold/5 p-2.5 rounded-lg border border-brand-green/5 dark:border-brand-gold/10 font-normal space-y-1.5">
                  <div>
                    <span className="font-bold text-brand-gold block mb-0.5">🔋 Android Background Guide:</span>
                    To prevent Android OS from freezing the microphone wake-word listener when the screen is locked:
                  </div>
                  <ol className="list-decimal pl-3.5 space-y-1">
                    <li>Long-press the Parley app icon on your home screen and tap <strong>App Info</strong> (or <strong>i</strong> symbol).</li>
                    <li>Navigate to <strong>Battery</strong> or <strong>Battery Usage</strong>.</li>
                    <li>Select <strong>Unrestricted</strong> (instead of Optimized or Restricted). This lets WebView SpeechRecognition run persistently in the background.</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Voice Recognition & Acoustic Signature Calibration */}
      <div className="bg-white dark:bg-brand-green-dark/80 border border-brand-green/10 dark:border-brand-gold/15 rounded-2xl p-4 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-brand-green/10 dark:border-brand-gold/10 pb-2">
          <h3 className="text-xs font-bold text-brand-green dark:text-brand-cream uppercase tracking-widest flex items-center gap-1.5 font-sans">
            <Bot size={14} className="text-brand-gold" /> AI Speaker Voice Profile
          </h3>
        </div>

        <div className="space-y-4 font-normal text-xs text-brand-green/85 dark:text-brand-cream/85">
          <p className="text-[10px] text-zinc-500 dark:text-brand-cream/70 leading-relaxed font-normal">
            Calibrate a secure acoustic voice signature. This teaches the AI your speaking style, vocabulary baselines, and phrasing phrasing, allowing it to identify and match your name (<strong>{ownerName || "the Owner"}</strong>) in multi-speaker transcripts with maximum precision.
          </p>

          {voiceSignature ? (
            <div className="bg-brand-green/5 dark:bg-brand-gold/5 border border-brand-green/10 dark:border-brand-gold/15 p-3 rounded-xl space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono tracking-wider font-extrabold text-brand-gold uppercase block">
                  ✓ ACTIVE ACOUSTIC SIGNATURE
                </span>
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to permanently clear your trained voice signature?")) {
                      localStorage.removeItem("parley-voice-signature");
                      setVoiceSignature("");
                    }
                  }}
                  className="text-[9px] uppercase font-red font-bold text-red-500 hover:underline cursor-pointer"
                >
                  Clear Signature
                </button>
              </div>
              <div className="p-2.5 rounded-lg bg-white dark:bg-[#060b08]/50 border border-zinc-200 dark:border-zinc-800 text-[10.5px] italic text-stone-600 dark:text-stone-300 font-medium leading-relaxed max-h-24 overflow-y-auto font-sans">
                "{voiceSignature}"
              </div>
            </div>
          ) : (
            <div className="bg-brand-green/5 border border-dashed border-brand-green/20 dark:border-brand-gold/15 p-4 rounded-xl text-center space-y-3" id="voice-training-empty">
              <p className="text-[10px] text-zinc-500 dark:text-brand-cream/60 leading-normal">
                No voice signature profile detected on this device. Train one now by completing a short 10-second calibration.
              </p>

              {isRecordingSignature ? (
                <div className="bg-zinc-950 text-zinc-50 p-3 rounded-xl border border-zinc-800 space-y-2.5 animate-fadeIn">
                  <div className="flex items-center justify-between text-[10px] font-mono text-brand-gold">
                    <span className="flex items-center gap-1"><Mic size={11} className="animate-pulse" /> RECORDING SIGNATURE...</span>
                    <span>00:{signatureSeconds.toString().padStart(2, "0")} / 00:10</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-zinc-900 text-xs leading-relaxed font-bold italic text-zinc-200 text-center border border-zinc-850">
                    "I am training my Parley AI voice profile. This is my signature recording to help Parley recognize my voice in all future transcripts."
                  </div>
                  <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${(signatureSeconds / 10) * 100}%` }}
                      className="h-full bg-brand-gold transition-all duration-1000 ease-linear"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={stopSignatureRecording}
                    className="px-3.5 py-1.5 w-full bg-red-500 hover:bg-red-600 text-white font-extrabold rounded-lg text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Stop & Calibrate
                  </button>
                </div>
              ) : isTrainingSignature ? (
                <div className="bg-brand-green/5 p-4 rounded-xl border border-brand-green/10 flex flex-col items-center justify-center space-y-2 animate-fadeIn">
                  <RefreshCw size={20} className="animate-spin text-brand-gold" />
                  <span className="text-[10px] uppercase font-bold text-zinc-500">Calibrating acoustic fingerprint...</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={startSignatureRecording}
                  className="px-4 py-2.5 bg-brand-cream hover:bg-[#eae0d2] text-stone-900 border border-stone-300 font-extrabold rounded-2xl text-[10.5px] uppercase tracking-wider transition-all cursor-pointer shadow-sm active:scale-95 inline-flex items-center gap-1.5"
                >
                  <Mic size={12} className="stroke-[3]" /> Train AI Voice signature
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Automated Post-Meeting Routines */}
      <div className="bg-white dark:bg-brand-green-dark/80 border border-brand-green/10 dark:border-brand-gold/15 rounded-2xl p-4 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-brand-green/10 dark:border-brand-gold/10 pb-2">
          <h3 className="text-xs font-bold text-brand-green dark:text-brand-cream uppercase tracking-widest flex items-center gap-1.5 font-sans">
            <Mail size={14} className="text-brand-gold" /> Automated Post-Meeting Routines
          </h3>
        </div>

        <div className="space-y-4 font-normal text-xs text-brand-green/85 dark:text-brand-cream/85">
          <p className="text-[10px] text-zinc-500 dark:text-brand-cream/70 leading-tight mb-2">
            Configure automatic forwarding actions that trigger immediately after a meeting's AI analysis finishes.
          </p>

          {/* Auto forward to Email */}
          <div className="space-y-3 p-2 rounded-xl bg-brand-green/5 dark:bg-brand-gold/5 border border-brand-green/10 dark:border-brand-gold/15">
            <button
              type="button"
              onClick={() => setAutoSendEmail(!autoSendEmail)}
              className="w-full flex items-center justify-between text-left cursor-pointer"
            >
              <div className="space-y-0.5 max-w-[80%]">
                <div className="font-bold text-brand-green dark:text-brand-cream flex items-center gap-1.5">
                  Auto-forward to Email (Gmail)
                </div>
                <p className="text-[10px] text-zinc-500 dark:text-brand-cream/70 leading-tight font-normal">
                  Automatically pop open your mail app with a drafted summary when analysis is complete.
                </p>
              </div>
              <div
                className={`w-10 h-6 flex items-center rounded-full p-1 transition-all duration-300 shrink-0 ${
                  autoSendEmail ? "bg-brand-green dark:bg-brand-gold" : "bg-zinc-200 dark:bg-zinc-800"
                }`}
              >
                <div
                  className={`bg-white dark:bg-brand-green-dark w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                    autoSendEmail ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </div>
            </button>

            <div className="space-y-1.5 pt-2 border-t border-dashed border-brand-green/10 dark:border-brand-gold/10 animate-fadeIn">
              <label className="text-[10px] font-bold text-zinc-500 dark:text-brand-cream/70 block">
                Target Gmail Address
              </label>
              <input
                type="email"
                placeholder="your-email@gmail.com"
                value={targetEmail}
                onChange={(e) => setTargetEmail(e.target.value)}
                className="w-full bg-brand-green/5 dark:bg-brand-green-dark/40 border border-brand-green/10 dark:border-brand-gold/15 rounded-xl px-3 py-2 text-xs text-brand-green dark:text-brand-cream focus:outline-none focus:border-brand-gold"
              />
              <button
                type="button"
                onClick={handleTestEmail}
                className="mt-2 w-full py-1.5 px-3 bg-brand-green/10 hover:bg-brand-green/20 dark:bg-brand-gold/10 dark:hover:bg-brand-gold/20 text-brand-green dark:text-brand-gold border border-brand-green/15 dark:border-brand-gold/15 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
              />
            </div>
          </div>

          {/* Auto forward to WhatsApp */}
          <div className="space-y-3 p-2 rounded-xl bg-brand-green/5 dark:bg-brand-gold/5 border border-brand-green/10 dark:border-brand-gold/15">
            <button
              type="button"
              onClick={() => setAutoSendWhatsApp(!autoSendWhatsApp)}
              className="w-full flex items-center justify-between text-left cursor-pointer"
            >
              <div className="space-y-0.5 max-w-[80%]">
                <div className="font-bold text-brand-green dark:text-brand-cream flex items-center gap-1.5">
                  Auto-forward to WhatsApp
                </div>
                <p className="text-[10px] text-zinc-500 dark:text-brand-cream/70 leading-tight font-normal">
                  Automatically direct to WhatsApp with the formatted summary text pre-filled.
                </p>
              </div>
              <div
                className={`w-10 h-6 flex items-center rounded-full p-1 transition-all duration-300 shrink-0 ${
                  autoSendWhatsApp ? "bg-brand-green dark:bg-brand-gold" : "bg-zinc-200 dark:bg-zinc-800"
                }`}
              >
                <div
                  className={`bg-white dark:bg-brand-green-dark w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                    autoSendWhatsApp ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </div>
            </button>

            {autoSendWhatsApp && (
              <div className="space-y-1.5 pt-2 border-t border-dashed border-brand-green/10 dark:border-brand-gold/10 animate-fadeIn">
                <label className="text-[10px] font-bold text-zinc-500 dark:text-brand-cream/70 block">
                  Target WhatsApp Number (include country code, e.g. +447123456789)
                </label>
                <input
                  type="text"
                  placeholder="+447123456789"
                  value={targetWhatsApp}
                  onChange={(e) => setTargetWhatsApp(e.target.value)}
                  className="w-full bg-brand-green/5 dark:bg-brand-green-dark/40 border border-brand-green/10 dark:border-brand-gold/15 rounded-xl px-3 py-2 text-xs text-brand-green dark:text-brand-cream focus:outline-none focus:border-brand-gold"
                />
                <button
                  type="button"
                  onClick={handleTestWhatsApp}
                  className="mt-2 w-full py-1.5 px-3 bg-brand-green/10 hover:bg-brand-green/20 dark:bg-brand-gold/10 dark:hover:bg-brand-gold/20 text-brand-green dark:text-brand-gold border border-brand-green/15 dark:border-brand-gold/15 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  Send Test WhatsApp Forward
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Developer Cost & Compliance Planner control */}
      <div className="bg-brand-green-dark/5 dark:bg-brand-green-dark/60 border border-dashed border-brand-green/20 dark:border-brand-gold/25 p-4 rounded-2xl flex items-center justify-between shadow-sm">
        <div className="space-y-0.5">
          <span className="text-[9px] uppercase font-mono text-brand-green/60 dark:text-brand-cream/60 font-bold block">Developer & Owner Portal</span>
          <h4 className="text-xs font-black text-brand-green dark:text-brand-cream">Platform Unit-Economics Hub</h4>
          <p className="text-[9.5px] text-brand-green/75 dark:text-brand-cream/70 leading-snug">Review server bills, Firestore quotas, storage margins, & GDPR logs</p>
        </div>
        <button
          onClick={() => {
            const active = !devModeActive;
            setDevModeActive(active);
            localStorage.setItem("parley-dev-mode", JSON.stringify(active));
          }}
          className={`px-3 py-1.5 text-xs font-extrabold rounded-xl border transition-all shrink-0 ${
            devModeActive
              ? "bg-brand-gold text-brand-green-dark border-brand-gold/30 font-black shadow-sm"
              : "bg-brand-green/10 hover:bg-brand-green/20 dark:bg-brand-green-dark text-brand-green dark:text-brand-cream border-brand-green/15 dark:border-brand-gold/15"
          }`}
        >
          {devModeActive ? "Hide Owner Hub" : "Show Owner Hub"}
        </button>
      </div>

      {devModeActive && (
        /* GDPR & SUBSCRIPTION ESTIMATOR HUB */
        <div className="bg-white dark:bg-brand-green-dark/85 border border-brand-green/15 dark:border-brand-gold/20 rounded-3xl p-5 space-y-4 shadow-sm animate-fadeIn" id="gdpr-estimator-hub">
          
          {/* Hub Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-green/10 dark:border-brand-gold/10 pb-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <Shield className="text-brand-gold" size={14} />
                <h3 className="text-xs uppercase font-extrabold tracking-widest text-brand-green dark:text-brand-cream font-sans">
                  GDPR & Pricing Planner
                </h3>
              </div>
              <p className="text-[10px] text-brand-green/70 dark:text-brand-cream/70">Tier margins, cloud storage parameters, & EU residency rules</p>
            </div>

            {/* Tab Switcher */}
            <div className="flex bg-brand-green/5 dark:bg-brand-green-dark p-0.5 rounded-xl border border-brand-green/10 dark:border-brand-gold/10 shrink-0">
              <button
                onClick={() => setEstimatorTab("plans")}
                className={`px-3 py-1 text-[9px] uppercase font-extrabold rounded-lg transition-all ${
                  estimatorTab === "plans"
                    ? "bg-brand-green text-brand-gold dark:bg-brand-gold dark:text-brand-green-dark shadow-sm font-black"
                    : "text-brand-green/70 dark:text-brand-cream/70 hover:text-brand-green dark:hover:text-brand-gold-bright"
                }`}
              >
                Plans
              </button>
              <button
                onClick={() => setEstimatorTab("calculator")}
                className={`px-3 py-1 text-[9px] uppercase font-extrabold rounded-lg transition-all ${
                  estimatorTab === "calculator"
                    ? "bg-brand-green text-brand-gold dark:bg-brand-gold dark:text-brand-green-dark shadow-sm font-black"
                    : "text-brand-green/70 dark:text-brand-cream/70 hover:text-brand-green dark:hover:text-brand-gold-bright"
                }`}
              >
                Calculator
              </button>
              <button
                onClick={() => setEstimatorTab("gdpr")}
                className={`px-3 py-1 text-[9px] uppercase font-extrabold rounded-lg transition-all ${
                  estimatorTab === "gdpr"
                    ? "bg-brand-green text-brand-gold dark:bg-brand-gold dark:text-brand-green-dark shadow-sm font-black"
                    : "text-brand-green/70 dark:text-brand-cream/70 hover:text-brand-green dark:hover:text-brand-gold-bright"
                }`}
              >
                GDPR Shield
              </button>
            </div>
          </div>

          {estimatorTab === "plans" && (
            /* THREE-TIER SUBSCRIPTION MODELS */
            <div className="space-y-4 animate-fadeIn" id="estimator-subplans">
              <div className="grid grid-cols-1 gap-3.5">
                
                {/* Plan 1: Echo Spark */}
                <div 
                  onClick={() => { setEstTier("spark"); setEstimatorTab("calculator"); }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                    estTier === "spark" 
                      ? "bg-brand-gold/10 border-brand-gold shadow-sm" 
                      : "bg-brand-green/5 dark:bg-brand-green-dark/50 border-brand-green/10 dark:border-brand-gold/10 hover:bg-brand-green/10 dark:hover:bg-brand-green-dark"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[9px] font-mono tracking-wider font-extrabold text-brand-gold uppercase">Base Tier</span>
                      <h4 className="text-xs font-extrabold text-brand-green dark:text-[#EEF0EA] mt-0.5">Echo Spark (Light Sync)</h4>
                      <p className="text-[10px] text-brand-green/75 dark:text-brand-cream/75 mt-1 leading-normal pr-5">
                        Designed for casual reflection. Fully automated transcripts, basic mood and sentiment tracking, stored securely in regional Frankfurt servers.
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-extrabold text-brand-green dark:text-brand-gold-bright">€9</span>
                      <span className="text-[9px] text-brand-gold block">/ month</span>
                    </div>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-dashed border-brand-green/10 dark:border-brand-gold/15 flex items-center justify-between text-[9px] font-bold text-brand-green/70 dark:text-brand-cream/75">
                    <span>5 Recording Hours / Month</span>
                    <span className="text-brand-gold text-[10px]">Select & Simulate Plan →</span>
                  </div>
                </div>

                {/* Plan 2: Echo Core */}
                <div 
                  onClick={() => { setEstTier("core"); setEstimatorTab("calculator"); }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                    estTier === "core" 
                      ? "bg-brand-gold/10 border-brand-gold shadow-sm" 
                      : "bg-brand-green/5 dark:bg-brand-green-dark/50 border-brand-green/10 dark:border-brand-gold/10 hover:bg-brand-green/10 dark:hover:bg-brand-green-dark"
                  }`}
                >
                  <div className="absolute top-0 right-0 bg-brand-gold text-brand-green-dark text-[8px] font-black uppercase px-2 py-0.5 rounded-bl-lg">
                    Most Popular
                  </div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[9px] font-mono tracking-wider font-extrabold text-brand-gold uppercase">Professional Level</span>
                      <h4 className="text-xs font-extrabold text-brand-green dark:text-[#EEF0EA] mt-0.5">Echo Core (Interpersonal Depth)</h4>
                      <p className="text-[10px] text-brand-green/75 dark:text-brand-cream/75 mt-1 leading-normal pr-5">
                        The core analytical experience. Standard emotional coregulation insights, vocal cadence shift tracking, strategic misalignments alerts, and unlimited memory logs.
                      </p>
                    </div>
                    <div className="text-right shrink-0 pt-2">
                      <span className="text-sm font-extrabold text-brand-green dark:text-brand-gold-bright">€19</span>
                      <span className="text-[9px] text-brand-gold block">/ month</span>
                    </div>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-dashed border-brand-green/10 dark:border-brand-gold/15 flex items-center justify-between text-[9px] font-bold text-brand-green/70 dark:text-brand-cream/75">
                    <span>25 Recording Hours / Month</span>
                    <span className="text-brand-gold text-[10px]">Select & Simulate Plan →</span>
                  </div>
                </div>

                {/* Plan 3: Echo Anchor */}
                <div 
                  onClick={() => { setEstTier("anchor"); setEstimatorTab("calculator"); }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                    estTier === "anchor" 
                      ? "bg-brand-gold/10 border-brand-gold shadow-sm" 
                      : "bg-brand-green/5 dark:bg-brand-green-dark/50 border-brand-green/10 dark:border-brand-gold/10 hover:bg-brand-green/10 dark:hover:bg-brand-green-dark"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[9px] font-mono tracking-wider font-extrabold text-brand-gold uppercase">Executive Relational</span>
                      <h4 className="text-xs font-extrabold text-brand-green dark:text-[#EEF0EA] mt-0.5">Echo Anchor (Dyadic Presence)</h4>
                      <p className="text-[10px] text-brand-green/75 dark:text-brand-cream/75 mt-1 leading-normal pr-5">
                        Fully unlocked therapist persona. Triggers complete cognitive behavioral reports, attachment style tracking, defensive coping checklists, and cooperative dialogue draft scripts.
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-extrabold text-brand-green dark:text-brand-gold-bright">€29</span>
                      <span className="text-[9px] text-brand-gold block">/ month</span>
                    </div>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-dashed border-brand-green/10 dark:border-brand-gold/15 flex items-center justify-between text-[9px] font-bold text-brand-green/70 dark:text-brand-cream/75">
                    <span>100 Recording Hours / Month</span>
                    <span className="text-brand-gold text-[10px]">Select & Simulate Plan →</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-brand-green/5 dark:bg-brand-green-dark/60 rounded-xl border border-dashed border-brand-green/10 dark:border-brand-gold/15 text-[10px] text-brand-green/75 dark:text-brand-cream/70 line-normal">
                <Coins size={12} className="text-brand-gold shrink-0" />
                <span>Payments handled natively via standard App Store Subscriptions, conforming instantly with micro-invoice EU privacy mandates.</span>
              </div>
            </div>
          )}

          {estimatorTab === "calculator" && (() => {
            // Dynamic pricing variables calculations
            const pricingPlans = { spark: 9, core: 19, anchor: 29 };
            const basePrice = pricingPlans[estTier];
            
            // Cost items estimation
            const storageGB = (estHours * 4.34 * 12) / 1024;
            const gcsCost = Math.max(0.01, storageGB * 0.023 * 2); // Double replicate safety budget

            // Firestore cost per user
            const firestoreCost = 0.08 + (estHours * 0.005); 

            // Gemini API model tokens cost estimate (€0.075/1M input tokens baseline)
            const modelCostPerHour = ((12000 * 0.000000075) + (2500 * 0.0000003)); 
            const geminiCost = estHours * 4.34 * modelCostPerHour;

            // Operating expenditure summary
            const combinedOpEx = gcsCost + firestoreCost + geminiCost;
            const platformProfit = basePrice - combinedOpEx;
            const marginPercent = Math.max(0, Math.min(100, Math.round((platformProfit / basePrice) * 100)));

            return (
              <div className="space-y-4 animate-fadeIn" id="estimator-interactive-panel">
                <div className="bg-brand-gold/5 dark:bg-brand-green-dark/40 p-4 rounded-2xl border border-brand-green/10 dark:border-brand-gold/15 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-mono uppercase font-bold text-brand-green/70 dark:text-brand-cream/70">Active Simulation Tier</span>
                      <h4 className="text-xs font-bold text-brand-green dark:text-brand-cream capitalize">{estTier} Plan (€{basePrice}/mo)</h4>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-mono uppercase font-bold text-brand-green/70 dark:text-brand-cream/70 block">forecast margin</span>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{marginPercent}% Profit Margin</span>
                    </div>
                  </div>

                  {/* SLIDER FOR USER WEEKLY LOGGING HOURS */}
                  <div className="space-y-1.5 pt-2 border-t border-brand-green/15 dark:border-brand-gold/15">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-green dark:text-brand-cream font-sans">Weekly Call Hours logged:</span>
                      <span className="text-xs font-extrabold text-brand-gold font-mono">{estHours} Hours / Week</span>
                    </div>
                    <input 
                      type="range"
                      min="1"
                      max="40"
                      value={estHours}
                      onChange={(e) => setEstHours(parseInt(e.target.value))}
                      className="w-full accent-brand-gold cursor-pointer"
                    />
                    <div className="flex justify-between text-[8px] font-mono text-brand-green/60 dark:text-brand-cream/60 uppercase">
                      <span>1 hr/wk</span>
                      <span>Heavy (20 hr/wk)</span>
                      <span>Max (40 hr/wk)</span>
                    </div>
                  </div>

                  <div className="text-[10px] text-brand-green/70 dark:text-brand-cream/70 italic">
                    * Heavy call loggers logging 20 hours/week generate an average infrastructure cost of €{(gcsCost + firestoreCost + (20 * 4.34 * modelCostPerHour)).toFixed(2)}/month. Netting €{(basePrice - (gcsCost + firestoreCost + (20 * 4.34 * modelCostPerHour))).toFixed(2)}/month in surplus pool.
                  </div>
                </div>

                {/* ESTIMATIONS REPORT GRID */}
                <div className="space-y-2">
                  <span className="text-[9px] font-mono tracking-wider font-extrabold text-brand-gold uppercase">Unit-Economic Projections</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    
                    {/* Item 1: GCS Storage */}
                    <div className="bg-brand-green/5 dark:bg-brand-green-dark/40 p-3 rounded-xl border border-brand-green/10 dark:border-brand-gold/15 space-y-1">
                      <div className="flex items-center gap-1 text-brand-green/80 dark:text-brand-cream/80">
                        <HardDrive size={11} className="text-brand-gold" />
                        <span className="text-[10px] font-bold uppercase tracking-tight">Audio Cloud</span>
                      </div>
                      <div className="text-xs font-bold text-brand-green dark:text-brand-cream">€{gcsCost.toFixed(3)}</div>
                      <span className="text-[8.5px] text-brand-green/60 dark:text-brand-cream/60 block font-normal">GCS {storageGB.toFixed(1)} GB standard Frankfurt</span>
                    </div>

                    {/* Item 2: Firestore DB */}
                    <div className="bg-brand-green/5 dark:bg-brand-green-dark/40 p-3 rounded-xl border border-brand-green/10 dark:border-brand-gold/15 space-y-1">
                      <div className="flex items-center gap-1 text-brand-green/80 dark:text-brand-cream/80">
                        <Database size={11} className="text-brand-gold" />
                        <span className="text-[10px] font-bold uppercase tracking-tight">Firestore DB</span>
                      </div>
                      <div className="text-xs font-bold text-brand-green dark:text-brand-cream">€{firestoreCost.toFixed(3)}</div>
                      <span className="text-[8.5px] text-brand-green/60 dark:text-brand-cream/60 block font-normal">Overhead doc sync security reads</span>
                    </div>

                    {/* Item 3: Gemini Model */}
                    <div className="bg-brand-green/5 dark:bg-brand-green-dark/40 p-3 rounded-xl border border-brand-green/10 dark:border-brand-gold/15 space-y-1">
                      <div className="flex items-center gap-1 text-brand-green/80 dark:text-brand-cream/80">
                        <Cpu size={11} className="text-brand-gold" />
                        <span className="text-[10px] font-bold uppercase tracking-tight">Gemini LLM</span>
                      </div>
                      <div className="text-xs font-bold text-brand-green dark:text-brand-cream">€{geminiCost.toFixed(2)}</div>
                      <span className="text-[8.5px] text-brand-green/60 dark:text-brand-cream/60 block font-normal">{(estHours * 4.34 * 15).toFixed(0)}k text tokens/mo</span>
                    </div>
                  </div>
                </div>

                {/* Operating Expenditure Summary bar */}
                <div className="flex items-center justify-between p-3.5 bg-brand-gold/10 border border-brand-gold/20 rounded-2xl text-xs font-sans">
                  <div>
                    <span className="text-[9px] font-mono text-brand-green/60 dark:text-brand-cream/60 uppercase block">Projected cost of goods (COGS)</span>
                    <p className="font-extrabold text-brand-green dark:text-brand-cream text-[11px]">
                      Total cost of goods: €{combinedOpEx.toFixed(2)} / user / month
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-mono text-brand-green/60 dark:text-brand-cream/60 uppercase block">net platform yield</span>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                      +€{platformProfit.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}

          {estimatorTab === "gdpr" && (
            /* BULLETPROOF GDPR Shield EXPLAINER Drawer */
            <div className="space-y-4 animate-fadeIn" id="estimator-gdpr-rules">
              <span className="text-[9.5px] font-mono tracking-wider font-extrabold text-brand-gold uppercase block mb-1">
                EU-Sovereign Data Storage Laws & Rules
              </span>

              <div className="space-y-3 font-normal">
                {/* Point 1 */}
                <div className="flex gap-2.5 items-start text-xs border-b border-brand-green/10 dark:border-brand-gold/10 pb-2.5">
                  <div className="w-5 h-5 rounded-full bg-brand-green/10 dark:bg-brand-gold/10 text-brand-green dark:text-brand-gold flex items-center justify-center shrink-0 font-bold font-mono text-[9px] border border-brand-green/20 dark:border-brand-gold/20">
                    01
                  </div>
                  <div>
                    <h5 className="font-bold text-brand-green dark:text-brand-cream">Regional Vault Sovereignty (Europe-West3)</h5>
                    <p className="text-[10.5px] text-brand-green/75 dark:text-brand-cream/75 leading-normal mt-0.5">
                      Audio uploads and metadata fields are bound exclusively and permanently to Google Cloud Storage and Firestore clusters in <strong>Frankfurt, Germany (`europe-west3`)</strong>. Customer file routing is locked so files are guaranteed to never migrate across European borders.
                    </p>
                  </div>
                </div>

                {/* Point 2 */}
                <div className="flex gap-2.5 items-start text-xs border-b border-brand-green/10 dark:border-brand-gold/10 pb-2.5">
                  <div className="w-5 h-5 rounded-full bg-brand-green/10 dark:bg-brand-gold/10 text-brand-green dark:text-brand-gold flex items-center justify-center shrink-0 font-bold font-mono text-[9px] border border-brand-green/20 dark:border-brand-gold/20">
                    02
                  </div>
                  <div>
                    <h5 className="font-bold text-brand-green dark:text-brand-cream">Zero-Knowledge Token Decryption</h5>
                    <p className="text-[10.5px] text-brand-green/75 dark:text-[#EEF0EA]/75 leading-normal mt-0.5">
                      Each recording undergoes AES-256 segment transcoding inside local browser worker threads using customer google auth tokens before transport. The platform operator maintains zero keys to decrypt raw files manually, making audit databases bulletproof.
                    </p>
                  </div>
                </div>

                {/* Point 3 */}
                <div className="flex gap-2.5 items-start text-xs border-b border-brand-green/10 dark:border-brand-gold/10 pb-2.5">
                  <div className="w-5 h-5 rounded-full bg-brand-green/10 dark:bg-brand-gold/10 text-brand-green dark:text-brand-gold flex items-center justify-center shrink-0 font-bold font-mono text-[9px] border border-brand-green/20 dark:border-brand-gold/20">
                    03
                  </div>
                  <div>
                    <h5 className="font-bold text-brand-green dark:text-brand-cream">Right-to-be-Forgotten Lifecycles</h5>
                    <p className="text-[10.5px] text-brand-green/75 dark:text-[#EEF0EA]/75 leading-normal mt-0.5">
                      GCS objects leverage bucket lifecycle parameters configured to wipe raw voice records immediately after Gemini generates verified embeddings. Users can opt to clear all local backup traces with a single click.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-brand-green/5 dark:bg-brand-green-dark/50 rounded-2xl border border-brand-green/10 dark:border-brand-gold/15 flex items-center gap-2.5">
                <Lock size={14} className="text-brand-gold shrink-0" />
                <div className="text-[10px] text-brand-green/75 dark:text-brand-cream/70 leading-normal">
                  Configured Firestore Security Rules enforce document isolation checks, restricting cross-user access via user identity assertions.
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Troubleshooting and Help guide */}
      <div className="bg-brand-green/5 dark:bg-brand-green-dark/80 border border-brand-green/10 dark:border-brand-gold/15 rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-bold text-brand-green dark:text-brand-cream uppercase tracking-widest flex items-center gap-1.5 pb-2 border-b border-brand-green/10 dark:border-brand-gold/10">
          <Info size={14} className="text-brand-gold" />
          Troubleshooting & Application Scope
        </h3>

        <div className="text-[11px] text-brand-green/80 dark:text-brand-cream/80 space-y-2 leading-relaxed font-normal">
          <p>
            <strong>Local Storage Bounds:</strong> Transcripts and checklist assets are processed under strict client-side sandbox isolation. Sound files and recording databases are kept offline inside Google and Android-backed container parameters.
          </p>
          <p>
            <strong>Off-line Notice:</strong> Real-time high-fidelity transcription and AI semantic audits require network connections to communicate with backend models. No recording buffers are leaked publicly or stored permanently outside your local device storage.
          </p>
          <p>
            <strong>Print and Exports:</strong> PDF export leverages responsive media stylesheets. Turn on "Background graphics" in print options for maximum quality color cards inside exports.
          </p>
        </div>
      </div>

      {/* Storage wipes */}
      <div className="bg-white dark:bg-brand-green-dark/85 border border-brand-green/15 dark:border-brand-gold/20 rounded-2xl p-4 space-y-4">
        <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest border-b border-brand-green/10 dark:border-brand-gold/10 pb-2">
          Danger Zone
        </h3>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-brand-green dark:text-brand-cream">Reset Local Database Cache</h4>
            <p className="text-[10px] text-brand-green/75 dark:text-[#EEF0EA]/70">Wipes custom user-loaded recordings and folder links from browser cache. Pre-packaged factory demo files and templates will remain loadable.</p>
          </div>

          <button
            onClick={handleResetStorage}
            id="profile-wipe-storage-btn"
            className="flex items-center gap-1 px-3 py-1.5 bg-red-650 hover:bg-red-750 text-white text-xs font-extrabold rounded-xl transition-all active:scale-95 cursor-pointer"
          >
            Reset App
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useRef, useEffect } from "react";
import { useMeetLog } from "../context/MeetingContext";
import { Mic, Square, Sparkles, FolderPlus, Compass, ShieldAlert, Check, HelpCircle, Laptop, Volume2, Info, PhoneCall, Plus, FileUp, Brain, Swords, BarChart3, HeartHandshake, Bot } from "lucide-react";

export default function RecordView() {
  const {
    projects,
    setActiveTab,
    wakeLockSupported,
    wakeLockActive,
    toggleWakeLock,
    keepAliveSupported,
    keepAliveActive,
    toggleKeepAlive,
    addProject,
    theme,

    // Elevated persistent background recording parameters
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

    // AI Context and Custom Prompts metadata states
    ownerName,
    setOwnerName,
    ownerRole,
    setOwnerRole,
    statedContext,
    setStatedContext,
    customPrompt,
    setCustomPrompt,
    cbtPsychologist,
    setCbtPsychologist,
    negotiationCoach,
    setNegotiationCoach,
    performanceReviewLens,
    setPerformanceReviewLens,
    difficultConversationDebrief,
    setDifficultConversationDebrief,
    personalAssistant,
    setPersonalAssistant,
    aiUsageLimitMinutes,
    aiUsageUsedSeconds,
    showInputSource,
    activeInputLabel,
    activeCodec
  } = useMeetLog();

  // Dynamic visualizers variables
  const waveOffsetRef = useRef(0);
  const themeRef = useRef(theme);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Inline dynamic Folder Creator states
  const [isAddingProjectInline, setIsAddingProjectInline] = useState(false);
  const [inlineProjName, setInlineProjName] = useState("");
  const [inlineProjColor, setInlineProjColor] = useState("amber");
  
  // AI Context collapsible panel state
  const [showAiSettings, setShowAiSettings] = useState(false);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  // Handle visual wave rendering on recording activation/stream change
  useEffect(() => {
    if (isRecording) {
      startCanvasAnimation(recordingStream);
    } else {
      stopCanvasAnimation();
    }
    return () => {
      stopCanvasAnimation();
    };
  }, [isRecording, recordingStream]);

  const startCanvasAnimation = (sourceStream: MediaStream | null) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set up real Web Audio API frequency & time domain analysis
    let dataArray = new Uint8Array(256);
    let hasRealAudio = false;

    if (sourceStream) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          const analyser = audioCtx.createAnalyser();
          // Increase fftSize to 512 for nice high density wavelength detailing
          analyser.fftSize = 512;
          const source = audioCtx.createMediaStreamSource(sourceStream);
          source.connect(analyser);
          
          analyserRef.current = analyser;
          audioContextRef.current = audioCtx;
          dataArray = new Uint8Array(analyser.fftSize);
          hasRealAudio = true;
        }
      } catch (e) {
        console.warn("Could not initiate dynamic Web Audio analyser context, falling back to simulated visuals.", e);
      }
    }

    const draw = () => {
      if (!canvas) return;
      const width = canvas.width;
      const height = canvas.height;
      const isDark = themeRef.current === "dark";
      
      // Clean canvas with a subtle grid-like dark background to represent technical soundboards
      ctx.fillStyle = isDark ? "rgba(9, 9, 11, 1)" : "rgba(245, 245, 247, 1)";
      ctx.fillRect(0, 0, width, height);
      
      // Draw grid lines for high-fidelity technical aesthetic
      ctx.strokeStyle = isDark ? "rgba(39, 39, 42, 0.2)" : "rgba(214, 211, 209, 0.4)";
      ctx.lineWidth = 1;
      const gridSize = 20;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      let soundIntensity = 0.0;
      if (hasRealAudio && analyserRef.current) {
        analyserRef.current.getByteTimeDomainData(dataArray);
        
        // Calculate root mean square (RMS) deviation from flat reference (128)
        let sumSquaredDiffs = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const val = dataArray[i];
          const diff = val - 128;
          sumSquaredDiffs += diff * diff;
        }
        const rms = Math.sqrt(sumSquaredDiffs / dataArray.length);
        // Normalize RMS to standard signal percentage factor
        soundIntensity = rms / 128.0; 
      } else {
        // Falling back to beautiful simulated talking wave if recording is active
        if (isRecording) {
          const wordPeriod = Date.now() / 1200;
          // Simulates speech cadence (speaking, pauses, syllables)
          const talkCycle = Math.max(0, Math.sin(wordPeriod) * Math.cos(wordPeriod * 2.2));
          soundIntensity = 0.02 + talkCycle * 0.18 + (Math.sin(Date.now() / 80) * 0.015);
          
          // Generate pseudo-data for simulated oscilloscope wavelength plotting
          for (let i = 0; i < dataArray.length; i++) {
            const angle = (i / dataArray.length) * Math.PI * 12 + (Date.now() / 150);
            const noise = Math.sin(angle * 1.5) * Math.cos(angle * 0.4);
            dataArray[i] = 128 + Math.floor(noise * soundIntensity * 128);
          }
        } else {
          soundIntensity = 0.0;
          for (let i = 0; i < dataArray.length; i++) {
            dataArray[i] = 128;
          }
        }
      }

      // 1. Draw Wavelength Oscilloscope Curves
      ctx.lineWidth = 2.0;
      waveOffsetRef.current += 1.5; // shift wavelength phase

      // Multi-layer visual depth: Draw background glow waves, and then the main crisp foreground wavelength shape
      const wavesCount = isRecording ? 3 : 1;
      
      for (let w = 0; w < wavesCount; w++) {
        ctx.beginPath();
        
        // Setup styled stroke gradations
        const grad = ctx.createLinearGradient(0, 0, width, 0);
        if (w === 0) {
          // Main high-precision front wavelength
          if (isDark) {
            grad.addColorStop(0, "rgba(52, 211, 153, 0.3)"); // Emerald 400
            grad.addColorStop(0.5, "rgba(52, 211, 153, 0.95)");
            grad.addColorStop(1, "rgba(52, 211, 153, 0.3)");
          } else {
            // Elegant premium light theme clay/sand blend
            grad.addColorStop(0, "rgba(194, 178, 159, 0.35)"); // Clay (#c2b29f)
            grad.addColorStop(0.5, "rgba(131, 117, 101, 0.95)"); // Deep warm clay accent text color
            grad.addColorStop(1, "rgba(194, 178, 159, 0.35)");
          }
          ctx.lineWidth = 2.5;
        } else if (w === 1) {
          if (isDark) {
            grad.addColorStop(0, "rgba(34, 197, 94, 0.1)"); // Green 500 back-wave
            grad.addColorStop(0.5, "rgba(59, 130, 246, 0.5)"); // Blue 500 mix
            grad.addColorStop(1, "rgba(34, 197, 94, 0.1)");
          } else {
            grad.addColorStop(0, "rgba(194, 178, 159, 0.1)");
            grad.addColorStop(0.5, "rgba(168, 162, 158, 0.55)"); // Warm stone back-wave
            grad.addColorStop(1, "rgba(194, 178, 159, 0.1)");
          }
          ctx.lineWidth = 1.5;
        } else {
          if (isDark) {
            grad.addColorStop(0, "rgba(168, 85, 247, 0.05)"); // Purple 500 back-shimmer
            grad.addColorStop(0.5, "rgba(168, 85, 247, 0.35)");
            grad.addColorStop(1, "rgba(168, 85, 247, 0.05)");
          } else {
            grad.addColorStop(0, "rgba(231, 229, 228, 0.08)");
            grad.addColorStop(0.5, "rgba(214, 211, 209, 0.4)");
            grad.addColorStop(1, "rgba(231, 229, 228, 0.08)");
          }
          ctx.lineWidth = 1.0;
        }
        
        ctx.strokeStyle = grad;

        const sliceWidth = width / dataArray.length;
        let x = 0;

        for (let i = 0; i < dataArray.length; i++) {
          const val = dataArray[i];
          const v = val / 128.0; // scale around 1.0 baselines
          
          // Wave offsets and noise layers
          const indexOffset = Math.floor(i + waveOffsetRef.current * (1 + w * 0.5)) % dataArray.length;
          const targetVal = dataArray[indexOffset] / 128.0 - 1.0;
          
          // Compute Y positions
          const y = height / 2 + (targetVal * (height * 0.45) * (1 - w * 0.2));

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }
        ctx.stroke();
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
  };

  const stopCanvasAnimation = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(e => {});
      audioContextRef.current = null;
    }
  };

  const formatMinSec = (t: number) => {
    const mins = Math.floor(t / 60);
    const secs = t % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCreateProjectInline = () => {
    if (!inlineProjName.trim()) return;
    const newProjId = `proj_${Date.now()}`;
    const newProject = {
      id: newProjId,
      name: inlineProjName.trim(),
      color: inlineProjColor,
      description: "Created dynamically during recording setup"
    };
    addProject(newProject);
    setSelectedProjectId(newProjId);
    setInlineProjName("");
    setIsAddingProjectInline(false);
  };

  return (
    <div className="pb-28 pt-4 px-4 max-w-xl mx-auto space-y-6" id="recorder-view">
      {/* View Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-brand-green-dark dark:text-white tracking-tight">
          Record <span className="text-brand-green dark:text-brand-gold-bright font-black">Conversation</span>
        </h1>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
          Real-time speech capturing with foreground media wake locks
        </p>
      </div>

      {/* AI Processing Credits indicator */}
      <div className="flex items-center justify-between p-3.5 bg-white dark:bg-[#060b08]/50 border border-brand-green/10 dark:border-brand-gold/15 rounded-2xl text-xs select-none shadow-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="text-brand-gold shrink-0 animate-pulse" size={13} />
          <span className="font-bold text-brand-green dark:text-brand-cream">AI Transcription Credits</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`font-mono font-bold ${
            (aiUsageLimitMinutes - Math.ceil(aiUsageUsedSeconds / 60)) <= 5 
              ? "text-red-500 font-extrabold animate-pulse" 
              : "text-brand-green dark:text-brand-gold-bright"
          }`}>
            {Math.max(0, aiUsageLimitMinutes - Math.ceil(aiUsageUsedSeconds / 60))}m remaining
          </span>
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500">/ {aiUsageLimitMinutes}m limit</span>
        </div>
      </div>

      {isProcessing ? (
        /* Processing AI Loading Screen */
        <div className="flex flex-col items-center justify-center py-16 px-6 bg-brand-green/5 border border-brand-green/20 dark:border-brand-gold/20 rounded-3xl space-y-6 animate-fadeIn" id="analyzer-processing-indicator">
          <div className="relative flex items-center justify-center">
            {/* Spinning double rings */}
            <div className="absolute w-20 h-20 border-4 border-brand-green/10 dark:border-brand-gold/10 rounded-full animate-ping" />
            <div className="w-16 h-16 border-4 border-t-brand-green border-r-brand-gold/30 border-b-brand-green border-l-brand-gold/30 rounded-full animate-spin" />
            <Sparkles size={24} className="absolute text-brand-gold animate-pulse" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-extrabold text-brand-green dark:text-brand-cream">Generating AI Insights</h3>
            <p className="text-xs text-brand-green dark:text-[#EEF0EA] font-mono tracking-wide px-2 py-1 rounded-lg bg-brand-green/10 dark:bg-brand-cream/10 animate-pulse">
              {processingStatus}
            </p>
          </div>
          <div className="text-[10px] text-zinc-400 max-w-xs text-center leading-relaxed">
            Please keep this tab open. Our server model is analyzing audio tracks to generate searchable transcripts, structured task bullet points, and speaker classifications.
          </div>
        </div>
      ) : (
        /* Standard Recording Form and Buttons */
        <div className="space-y-5">
          {/* Audio Canvas Stage */}
          <div className="relative overflow-hidden bg-brand-cream/30 dark:bg-zinc-950/90 rounded-3xl border border-brand-green/15 dark:border-brand-gold/15 h-44 flex flex-col justify-between p-4 shadow-md dark:shadow-xl backdrop-blur-sm">
            {/* Top Indicator badging */}
            <div className="flex justify-between items-center w-full z-10">
              <span className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-brand-green/80 dark:text-brand-gold/80 tracking-wider font-mono">
                <span className={`w-2 h-2 rounded-full ${isRecording ? "bg-red-500 animate-pulse" : "bg-brand-green/30 dark:bg-brand-gold/30"}`} />
                {isRecording ? "Live Transcribe Capturing" : "Soundboard System Ready"}
              </span>

              {/* Keep alive stats */}
              {isRecording && (
                <span className="bg-brand-green dark:bg-brand-gold text-brand-cream dark:text-stone-950 text-[10px] font-bold px-2 py-0.5 rounded-full border border-brand-green/30 dark:border-brand-gold/30 animate-pulse font-mono font-medium">
                  Mic Active
                </span>
              )}
            </div>

            {/* Simulated wave canvas element */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none opacity-90"
              width={400}
              height={176}
            />

            {/* Central Clock */}
            <div className="w-full flex flex-col items-center justify-center z-10 my-auto text-center">
              <span className={`text-5xl font-extrabold font-sans tracking-tight transition-colors ${isRecording ? "text-brand-green dark:text-brand-gold-bright" : "text-brand-green/40 dark:text-brand-gold/30"}`}>
                {formatMinSec(duration)}
              </span>
              <p className="text-[10px] text-brand-green/60 dark:text-brand-cream/50 tracking-widest font-mono font-semibold uppercase mt-1">
                {isRecording ? "RECORDING RUNNING IN BACKGROUND" : "WAITING TO RECORD"}
              </p>
            </div>

            {/* Wake lock and battery stats bottom bar */}
            <div className="flex justify-between items-center w-full z-10 text-[9px] text-brand-green/70 dark:text-brand-cream/60 font-mono tracking-wide">
              {showInputSource && isRecording && activeInputLabel ? (
                <span className="flex items-center gap-1.5 text-brand-gold dark:text-brand-gold-bright font-black">
                  <Mic size={10} className="stroke-[2.5]" />
                  <span>{activeInputLabel} ({activeCodec})</span>
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Compass size={11} className="text-brand-green/60 dark:text-brand-gold/60" />
                  Browser: Android Standard PWA compatible
                </span>
              )}
              <span className="font-semibold">
                Limit: 1 Hour max track
              </span>
            </div>
          </div>

          {" "}
          {/* Trigger Play Buttons Zone */}
          <div className="flex justify-center items-center py-2">
            {!isRecording ? (
              <button
                onClick={handleStartRecord}
                id="mic-record-button-idle"
                className="group relative flex items-center justify-center w-20 h-20 bg-brand-green hover:bg-[#152a1b] text-brand-gold border border-brand-gold/30 active:scale-95 duration-200 rounded-full shadow-lg cursor-pointer transform transition-all hover:scale-105"
              >
                <div className="absolute inset-0 bg-[#C9A84C] opacity-20 rounded-full animate-ping group-hover:block" />
                <Mic size={32} className="text-brand-gold relative z-10" />
              </button>
            ) : (
              <button
                onClick={handleStopRecord}
                id="mic-record-button-active"
                className="group relative flex items-center justify-center w-20 h-20 bg-red-500 hover:bg-red-650 active:scale-95 duration-200 rounded-full shadow-lg cursor-pointer transform transition-all hover:scale-105"
              >
                <div className="absolute inset-0 bg-red-500 opacity-25 rounded-full animate-ping" />
                <Square size={28} className="text-white relative z-10 rounded-sm fill-white" />
              </button>
            )}
          </div>

          {/* AI Context & Prompts Collapsible Panel */}
          <div className="bg-white dark:bg-brand-green-dark/80 border border-brand-green/10 dark:border-brand-gold/15 rounded-2xl p-4 space-y-4">
            <button
              type="button"
              onClick={() => setShowAiSettings(!showAiSettings)}
              className="w-full flex items-center justify-between font-bold text-xs uppercase tracking-widest text-brand-green dark:text-brand-gold focus:outline-none cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-brand-gold group-hover:scale-110 transition-transform" />
                <span>AI Context & Prompts</span>
              </div>
              <span className="text-zinc-400 dark:text-zinc-500 font-mono text-[10px]">
                {showAiSettings ? "Hide Settings" : "Configure Settings"}
              </span>
            </button>

            {showAiSettings && (
              <div className="space-y-4 pt-2 border-t border-brand-green/10 dark:border-brand-gold/10 animate-fadeIn">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="owner-name" className="text-xs font-semibold text-zinc-700 dark:text-zinc-350">
                      Owner Name
                    </label>
                    <input
                      id="owner-name"
                      type="text"
                      placeholder="e.g. Bruno"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white/70 dark:bg-brand-green-dark/60 border border-brand-green/10 dark:border-brand-gold/15 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-gold text-zinc-900 dark:text-zinc-100 font-medium transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="owner-role" className="text-xs font-semibold text-zinc-700 dark:text-zinc-350">
                      Owner Role
                    </label>
                    <input
                      id="owner-role"
                      type="text"
                      placeholder="e.g. Psychologist"
                      value={ownerRole}
                      onChange={(e) => setOwnerRole(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white/70 dark:bg-brand-green-dark/60 border border-brand-green/10 dark:border-brand-gold/15 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-gold text-zinc-900 dark:text-zinc-100 font-medium transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="stated-context" className="text-xs font-semibold text-zinc-700 dark:text-zinc-350">
                    Stated Context
                  </label>
                  <textarea
                    id="stated-context"
                    placeholder="e.g. Discussing stress management strategies..."
                    value={statedContext}
                    onChange={(e) => setStatedContext(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white/70 dark:bg-brand-green-dark/60 border border-brand-green/10 dark:border-brand-gold/15 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-gold text-zinc-900 dark:text-zinc-100 font-medium min-h-[60px] resize-y transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="custom-prompt" className="text-xs font-semibold text-zinc-700 dark:text-zinc-350 flex items-center justify-between">
                    <span>Custom AI Instructions</span>
                    <span className="text-[9px] text-brand-gold font-mono lowercase">Overrides defaults</span>
                  </label>
                  <textarea
                    id="custom-prompt"
                    placeholder="e.g. Format action items as user-focused tasks and analyze using CBT framework..."
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white/70 dark:bg-brand-green-dark/60 border border-brand-green/10 dark:border-brand-gold/15 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-gold text-zinc-900 dark:text-zinc-100 font-medium min-h-[60px] resize-y transition-colors"
                  />
                </div>

                {/* CBT Psychologist Mode Toggle */}
                <div className="flex items-center justify-between p-3 bg-brand-green/5 dark:bg-brand-green-dark border border-brand-green/10 dark:border-brand-gold/10 rounded-xl mt-3">
                  <div className="space-y-0.5 pr-2">
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <Brain size={13} className="text-brand-gold" />
                      CBT Psychologist
                    </span>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-normal">
                      Focused CBT-informed reflection on your own thinking in this session.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCbtPsychologist(!cbtPsychologist)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      cbtPsychologist ? "bg-brand-green dark:bg-brand-gold" : "bg-zinc-200 dark:bg-zinc-800"
                    }`}
                    role="switch"
                    aria-checked={cbtPsychologist}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        cbtPsychologist ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Negotiation Coach Mode Toggle */}
                <div className="flex items-center justify-between p-3 bg-brand-green/5 dark:bg-brand-green-dark border border-brand-green/10 dark:border-brand-gold/10 rounded-xl mt-2">
                  <div className="space-y-0.5 pr-2">
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <Swords size={13} className="text-brand-gold" />
                      Negotiation Coach
                    </span>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-normal">
                      Analyze deal dynamics — anchoring, concessions, leverage, and next moves.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNegotiationCoach(!negotiationCoach)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      negotiationCoach ? "bg-brand-green dark:bg-brand-gold" : "bg-zinc-200 dark:bg-zinc-800"
                    }`}
                    role="switch"
                    aria-checked={negotiationCoach}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        negotiationCoach ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Performance Review Lens Toggle */}
                <div className="flex items-center justify-between p-3 bg-brand-green/5 dark:bg-brand-green-dark border border-brand-green/10 dark:border-brand-gold/10 rounded-xl mt-2">
                  <div className="space-y-0.5 pr-2">
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <BarChart3 size={13} className="text-brand-gold" />
                      Performance Review
                    </span>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-normal">
                      Rate your communication — strongest moments, patterns, and audience read.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPerformanceReviewLens(!performanceReviewLens)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      performanceReviewLens ? "bg-brand-green dark:bg-brand-gold" : "bg-zinc-200 dark:bg-zinc-800"
                    }`}
                    role="switch"
                    aria-checked={performanceReviewLens}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        performanceReviewLens ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Difficult Conversation Debrief Toggle */}
                <div className="flex items-center justify-between p-3 bg-brand-green/5 dark:bg-brand-green-dark border border-brand-green/10 dark:border-brand-gold/10 rounded-xl mt-2">
                  <div className="space-y-0.5 pr-2">
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <HeartHandshake size={13} className="text-brand-gold" />
                      Difficult Conversation
                    </span>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-normal">
                      Debrief emotional conversations — what landed, what didn't, repair steps.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDifficultConversationDebrief(!difficultConversationDebrief)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      difficultConversationDebrief ? "bg-brand-green dark:bg-brand-gold" : "bg-zinc-200 dark:bg-zinc-800"
                    }`}
                    role="switch"
                    aria-checked={difficultConversationDebrief}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        difficultConversationDebrief ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Personal Assistant Mode Toggle */}
                <div className="flex items-center justify-between p-3 bg-brand-green/5 dark:bg-brand-green-dark border border-brand-green/10 dark:border-brand-gold/10 rounded-xl mt-2">
                  <div className="space-y-0.5 pr-2">
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <Bot size={13} className="text-brand-gold" />
                      Personal Assistant
                    </span>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-normal">
                      Generate spoken briefs, draft emails, and action manifests from your session.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPersonalAssistant(!personalAssistant)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      personalAssistant ? "bg-brand-green dark:bg-brand-gold" : "bg-zinc-200 dark:bg-zinc-800"
                    }`}
                    role="switch"
                    aria-checked={personalAssistant}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        personalAssistant ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Recording Options Card */}
          <div className="bg-white dark:bg-brand-green-dark/80 border border-brand-green/10 dark:border-brand-gold/15 rounded-2xl p-4 space-y-4">
            <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-widest border-b border-brand-green/10 dark:border-brand-gold/10 pb-2 flex items-center justify-between">
              <span>Recording Parameters</span>
              <span className="text-[10px] text-zinc-400 font-normal italic lowercase">Optional values</span>
            </h3>

            {/* Custom Manual Title */}
            <div className="space-y-1">
              <label htmlFor="record-title" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Meeting Title Prefix
              </label>
              <input
                id="record-title"
                type="text"
                placeholder="e.g. Daily Standup, Core UI Brainstorm"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white/70 dark:bg-brand-green-dark/60 border border-brand-green/10 dark:border-brand-gold/15 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-400 text-stone-900 dark:text-stone-105 font-medium"
              />
            </div>

            {/* Audio Input Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <span>Audio Input Source</span>
                <HelpCircle size={12} className="text-zinc-400" title="Choose to capture only your physical voice, or both you and speaker sound (for virtual calls like Zoom or Google Meet)." />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAudioSource("mic")}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    audioSource === "mic"
                      ? "bg-brand-cream border-stone-400 text-stone-900 font-bold dark:bg-brand-gold/20 dark:border-brand-gold/40 dark:text-brand-gold"
                      : "bg-white/50 dark:bg-brand-green-dark border-brand-green/10 dark:border-brand-gold/10 text-zinc-500 dark:text-brand-cream/60"
                  }`}
                >
                  <Mic size={14} className={audioSource === "mic" ? "text-stone-700 dark:text-zinc-200" : "text-zinc-400"} />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold">Microphone Only</span>
                    <span className="text-[9px] text-zinc-400">Physical Voice Only</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setAudioSource("mixed")}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    audioSource === "mixed"
                      ? "bg-brand-cream border-stone-400 text-stone-900 font-bold dark:bg-brand-gold/20 dark:border-brand-gold/40 dark:text-brand-gold"
                      : "bg-white/50 dark:bg-brand-green-dark border-brand-green/10 dark:border-brand-gold/10 text-zinc-500 dark:text-brand-cream/60"
                  }`}
                >
                  <Laptop size={14} className={audioSource === "mixed" ? "text-stone-700 dark:text-zinc-200" : "text-zinc-400"} />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold">Mic + Speakers</span>
                    <span className="text-[9px] text-zinc-400">Captures Webinar/Calls</span>
                  </div>
                </button>
              </div>

              {/* Mobile Phone Call & Speaker Mode Help Guide */}
              <div className="mt-2.5 bg-brand-cream/10 dark:bg-zinc-805/30 border border-stone-300 dark:border-stone-800 rounded-2xl p-3.5 space-y-2.5">
                <div className="flex items-center gap-1.5 text-stone-700 dark:text-brand-cream">
                  <PhoneCall size={13} className="shrink-0 animate-bounce" />
                  <span className="text-xs font-bold uppercase tracking-wider">How to record Phone Calls / Zoom on Mobile</span>
                </div>
                <p className="text-[11px] text-zinc-650 dark:text-zinc-350 leading-relaxed font-normal">
                  Mobile devices (Android & iOS) strictly block other apps' internal audio streams (like standard calls, WhatsApp, Google Meet, or Zoom) due to deep sandbox security constraints. This is why <strong>"Mic + Speakers"</strong> triggers a fallback.
                </p>
                <div className="space-y-2 border-t border-stone-200 dark:border-stone-800 pt-2.5 text-[11px] text-zinc-700 dark:text-zinc-300">
                  <div className="flex items-start gap-1.5">
                    <span className="flex items-center justify-center w-4 h-4 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-900 dark:text-brand-cream text-[10px] font-bold shrink-0 mt-0.5">1</span>
                    <span>Set this selector to <strong className="font-semibold text-zinc-900 dark:text-zinc-105">"Microphone Only"</strong> mode.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="flex items-center justify-center w-4 h-4 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-900 dark:text-brand-cream text-[10px] font-bold shrink-0 mt-0.5">2</span>
                    <span>Turn up your phone's speaker volume and put your call/meeting on <strong className="font-semibold text-zinc-900 dark:text-zinc-105">"Loudspeaker" (Speaker mode)</strong>.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="flex items-center justify-center w-4 h-4 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-900 dark:text-brand-cream text-[10px] font-bold shrink-0 mt-0.5">3</span>
                    <span>Start recording. Your phone's high-gain mic will pick up both your voice and the loudspeaker audio perfectly, allowing Gemini to analyze everything beautifully!</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter projects layout */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between pb-0.5">
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 dark:text-zinc-300">
                  Aggregate Project Group
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddingProjectInline(!isAddingProjectInline)}
                  className="text-[10px] text-stone-700 dark:text-stone-300 hover:opacity-80 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={10} /> {isAddingProjectInline ? "Cancel" : "New Folder"}
                </button>
              </div>

              {isAddingProjectInline && (
                <div className="bg-brand-green/5 dark:bg-brand-green-dark border border-brand-green/10 dark:border-brand-gold/10 rounded-xl p-3 space-y-2.5 animate-fadeIn" id="inline-project-creator">
                  <div>
                    <input
                      type="text"
                      placeholder="Folder name (e.g. Sales Calls)"
                      value={inlineProjName}
                      onChange={(e) => setInlineProjName(e.target.value)}
                      className="w-full text-xs p-2 bg-white/70 dark:bg-brand-green-dark/60 border border-brand-green/10 dark:border-brand-gold/15 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-400 text-zinc-900 dark:text-zinc-100 transition-colors"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1.5">
                      {["amber", "violet", "pink", "cyan", "bone"].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setInlineProjColor(c)}
                          className={`w-4 h-4 rounded-full flex items-center justify-center transition-all border ${
                            c === "amber" ? "bg-[#c2b29f] border-stone-400" :
                            c === "violet" ? "bg-violet-500 border-violet-600" :
                            c === "pink" ? "bg-pink-500 border-pink-600" :
                            c === "cyan" ? "bg-cyan-500 border-cyan-550" :
                            "bg-brand-cream border-stone-300"
                          } ${
                            inlineProjColor === c ? "ring-2 ring-zinc-800 dark:ring-white scale-110" : "opacity-75 hover:opacity-105"
                          }`}
                          title={`Select Color ${c}`}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={handleCreateProjectInline}
                      disabled={!inlineProjName.trim()}
                      className="px-3 py-1 bg-brand-cream hover:bg-[#eae0d2] text-stone-900 border border-stone-300 rounded-lg text-[10px] font-bold uppercase disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      Save Folder
                    </button>
                  </div>
                </div>
              )}

              {projects.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {projects.map((proj) => (
                    <button
                      key={proj.id}
                      type="button"
                      onClick={() => setSelectedProjectId(proj.id)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                        selectedProjectId === proj.id
                          ? "bg-brand-cream border-stone-400 text-stone-900 font-bold dark:bg-brand-gold/20 dark:border-brand-gold/40 dark:text-brand-gold"
                          : "bg-white/50 dark:bg-brand-green-dark/60 border-brand-green/10 dark:border-brand-gold/10 text-stone-700 dark:text-brand-cream/90 font-medium hover:border-brand-green/20 dark:hover:border-brand-gold/20"
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full border border-stone-300 ${
                        proj.color === "amber" ? "bg-[#c2b29f]" :
                        proj.color === "violet" ? "bg-violet-500" :
                        proj.color === "pink" ? "bg-pink-500" :
                        proj.color === "cyan" ? "bg-cyan-500" :
                        "bg-brand-cream"
                      }`} />
                      <span className="text-xs truncate">{proj.name}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-stone-700 dark:text-zinc-300 text-xs p-3.5 bg-brand-green/5 dark:bg-brand-green-dark border border-brand-green/10 dark:border-brand-gold/10 rounded-xl leading-relaxed">
                  No custom folders created yet. You can create folder groups in the <button type="button" onClick={() => setActiveTab("projects")} className="text-stone-700 dark:text-stone-300 font-bold hover:underline cursor-pointer">Folders tab</button>. Your track will be filed under <strong className="font-bold text-stone-700 dark:text-stone-300 dark:text-zinc-300">"General"</strong> by default.
                </div>
              )}
            </div>

            {/* Offline/PWA audio file importer */}
            <div className="border border-dashed border-brand-green/15 dark:border-brand-gold/20 p-4 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 bg-white/30 dark:bg-brand-green-dark/40" id="audio-file-importer-zone">
              <div className="p-2.5 rounded-full bg-brand-cream text-stone-800 dark:text-brand-cream border border-stone-300">
                <FileUp size={16} />
              </div>
              <div>
                <h5 className="text-xs font-extrabold text-zinc-800 dark:text-zinc-200">Import an existing recording?</h5>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs mt-0.5">
                  Load any standard smartphone audio file from your device. We will archive it locally and analyze meeting outcomes instantly!
                </p>
              </div>
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white rounded-xl text-[10px] font-black tracking-wide uppercase transition-colors cursor-pointer select-none">
                <Plus size={11} className="stroke-[3]" />
                <span>Choose Audio File</span>
                <input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={handleAudioFileImport}
                  id="import-meeting-audio-input"
                />
              </label>
            </div>
          </div>


        </div>
      )}
    </div>
  );
}

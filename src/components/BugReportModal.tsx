import { useState, useEffect } from "react";
import { Bug, X, Clipboard, Mail, Check, AlertTriangle } from "lucide-react";

interface BugReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BugReportModal({ isOpen, onClose }: BugReportModalProps) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [severity, setSeverity] = useState("medium");
  const [copied, setCopied] = useState(false);
  const [systemContext, setSystemContext] = useState({
    userAgent: "",
    screenWidth: 0,
    screenHeight: 0,
    utcTime: "",
    appUrl: "",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSystemContext({
        userAgent: navigator.userAgent,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        utcTime: new Date().toUTCString(),
        appUrl: window.location.href,
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const email = "carbonbridge.tech@gmail.com";

  const getReportPayload = () => {
    return `### PARLEY BUG REPORT
**Subject:** ${title || "No subject provided"}
**Severity:** ${severity.toUpperCase()}
**Timestamp:** ${systemContext.utcTime}
**URL Context:** ${systemContext.appUrl}

#### Description / Steps to Reproduce:
${desc || "No description provided."}

#### Environment info:
- User Agent: ${systemContext.userAgent}
- Screen Resolution: ${systemContext.screenWidth}x${systemContext.screenHeight} px
- Platform Context: Web sandbox PWA
`;
  };

  const handleCopy = () => {
    const text = getReportPayload();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendEmail = () => {
    const subject = `Parley Bug: ${title || "Issue Report"}`;
    const body = getReportPayload();
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="fixed inset-0 bg-black/80 dark:bg-black/90 flex items-center justify-center p-4 z-50 animate-fadeIn backdrop-blur-sm">
      <div 
        className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl transition-all"
        id="bug-report-modal-dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/40">
          <div className="flex items-center gap-2">
            <Bug className="text-red-500 stroke-[2.5]" size={16} />
            <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-widest">
              Report a bug
            </h3>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-1 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
              Issue Headline *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Recorder interface freezes on browser lock"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-90 w-full text-zinc-900 dark:text-zinc-50 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                Severity Level
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-900 text-zinc-900 dark:text-zinc-50 font-medium cursor-pointer"
              >
                <option value="low">Low (UI detail)</option>
                <option value="medium">Medium (Annoyance)</option>
                <option value="high">High (Feature fails)</option>
                <option value="critical">Critical (Data loss)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                Reporter Target
              </label>
              <div className="w-full px-3 py-2 text-xs bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-500 dark:text-zinc-400 font-mono truncate">
                {email}
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
              What happened? (Steps to reproduce) *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Describe the bug, and how we can reproduce it. Include potential actions taken right before the bug occurred."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-900 text-zinc-900 dark:text-zinc-50 font-medium"
            />
          </div>

          {/* System Telemetry Check */}
          <div className="bg-zinc-50 dark:bg-zinc-900/60 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-900 space-y-1.5">
            <div className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase text-zinc-500 dark:text-zinc-400 block">
              <AlertTriangle size={11} className="text-zinc-400" />
              <span>Diagnostic parameters appended:</span>
            </div>
            <div className="font-mono text-[9px] text-zinc-500 dark:text-zinc-400 leading-normal space-y-0.5">
              <div>Resolution: {systemContext.screenWidth}x{systemContext.screenHeight} px</div>
              <div className="truncate">Browser: {systemContext.userAgent}</div>
              <div>Time (UTC): {systemContext.utcTime}</div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/40 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-xl transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check size={13} className="text-emerald-500 stroke-[3]" />
                Copied Report!
              </>
            ) : (
              <>
                <Clipboard size={13} />
                Copy Report Code
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleSendEmail}
            className="flex items-center gap-1.5 px-4 py-2 text-[11px] font-black bg-zinc-900 hover:bg-zinc-950 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-950 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <Mail size={13} />
            Compose Email
          </button>
        </div>
      </div>
    </div>
  );
}

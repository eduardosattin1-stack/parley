/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { MeetingProvider, useMeetLog } from "./context/MeetingContext";
import BottomNav from "./components/BottomNav";
import HomeFeed from "./components/HomeFeed";
import RecordView from "./components/RecordView";
import ProjectsView from "./components/ProjectsView";
import RelationsView from "./components/RelationsView";
import AnalyticsView from "./components/AnalyticsView";
import ProfileView from "./components/ProfileView";
import MeetingDetail from "./components/MeetingDetail";
import BugReportModal from "./components/BugReportModal";
import { Bug, X, Mic } from "lucide-react";

function ParleyAppContent() {
  const {
    activeTab,
    selectedMeetingId,
    toast,
    triggerToast,
    voiceStatus
  } = useMeetLog();
  const [showBugModal, setShowBugModal] = useState(false);

  // If a meeting detail is requested, render details (acting as a dynamic screen overlay)
  const renderMainView = () => {
    if (selectedMeetingId) {
      return <MeetingDetail />;
    }

    switch (activeTab) {
      case "home":
        return <HomeFeed />;
      case "record":
        return <RecordView />;
      case "projects":
        return <ProjectsView />;
      case "relations":
        return <RelationsView />;
      case "analytics":
        return <AnalyticsView />;
      case "profile":
        return <ProfileView />;
      default:
        return <HomeFeed />;
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans pb-16 transition-colors duration-200" style={{ backgroundImage: 'radial-gradient(circle at 100% 0%, rgba(31, 63, 40, 0.15), transparent), radial-gradient(circle at 0% 100%, rgba(201, 168, 76, 0.05), transparent)' }}>
      {/* Archival Utility Top Status Band */}
      <div className="w-full max-w-xl mx-auto flex items-center justify-between px-4 py-2 bg-canvas/80 border-b border-line text-[10px] text-ink-muted font-mono tracking-wider sticky top-0 z-40 backdrop-blur-md transition-colors">
        <div className="flex items-center gap-1.5 font-bold">
          <span className={`w-1.5 h-1.5 rounded-full ${voiceStatus && voiceStatus !== "idle" && voiceStatus !== "triggered" ? "bg-emerald-500 animate-ping" : "bg-accent animate-pulse"}`} />
          <span className="tracking-widest flex items-center gap-1.5">
            {voiceStatus && voiceStatus !== "idle" && voiceStatus !== "triggered" ? (
              <span className="text-accent-strong flex items-center gap-1">
                <Mic size={10} className="animate-pulse shrink-0" />
                <span>{voiceStatus.toUpperCase()}</span>
              </span>
            ) : (
              "PARLEY SECURE CONVERSATION RECORDER"
            )}
          </span>
        </div>
        <button
          onClick={() => setShowBugModal(true)}
          className="flex items-center justify-center text-accent hover:text-accent-strong border border-accent/25 p-1 bg-accent/5 hover:bg-accent/10 transition-colors rounded-md cursor-pointer shrink-0"
          title="Report application bug to carbonbridge.tech@gmail.com"
        >
          <Bug size={13} className="stroke-[2.2]" />
        </button>
      </div>

      {/* Floating toast notification banner */}
      {toast && (
        <div className="fixed top-12 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-sm px-4 animate-fadeIn">
          <div className={`p-3.5 rounded-2xl border shadow-lg flex items-center gap-3 select-none backdrop-blur-md transition-all ${
            toast.type === "success" 
              ? "bg-[#1E3A27] border-emerald-500/30 text-emerald-200" 
              : toast.type === "warning" 
              ? "bg-[#C9A84C]/95 border-[#d9bf73]/30 text-stone-900 font-semibold" 
              : toast.type === "error" 
              ? "bg-red-950/95 border-red-500/30 text-red-200" 
              : "bg-stone-900/95 border-stone-800 text-stone-100"
          }`}>
            <div className="text-xs leading-relaxed flex-1">
              {toast.message}
            </div>
            <button 
              onClick={() => triggerToast("", "info")} 
              className="text-stone-400 hover:text-stone-300 transition-colors p-1"
            >
              <X size={14} className="stroke-[2.5]" />
            </button>
          </div>
        </div>
      )}

      {/* Scrollable Main body viewport */}
      <main className="mx-auto w-full max-w-xl relative print:pb-0">
        {renderMainView()}
      </main>

      {/* Persistent Bottom sticky navigation (hidden in print style screens) */}
      <div className="print:hidden">
        <BottomNav />
      </div>

      {/* Bug Report Popup Modal */}
      <BugReportModal isOpen={showBugModal} onClose={() => setShowBugModal(false)} />
    </div>
  );
}

export default function App() {
  return (
    <MeetingProvider>
      <ParleyAppContent />
    </MeetingProvider>
  );
}


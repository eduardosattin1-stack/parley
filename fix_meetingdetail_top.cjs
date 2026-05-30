const fs = require('fs');

let content = fs.readFileSync('src/components/MeetingDetail.tsx', 'utf8');

const anchorPoint = '  // Segment Tabs: Summary & Topics, Action Items, Transcript';
const anchorIndex = content.indexOf(anchorPoint);

if (anchorIndex === -1) {
  console.error("Could not find anchor point");
  process.exit(1);
}

const correctTop = `import React, { useState, useEffect, useRef } from "react";
import { useMeetLog, getNormalizedApiBaseUrl } from "../context/MeetingContext";
import {
  ArrowLeft, Share2, FileDown, Trash2, CheckSquare, Square, Save,
  Plus, Edit3, X, Play, Pause, RefreshCw, Eye, Sparkles, UserPlus, Tag,
  Rewind, FastForward, ChevronRight, Mail, Clipboard, Printer, Send,
  Brain, Heart, Smile, HelpCircle, Swords, BarChart3, HeartHandshake, Bot
} from "lucide-react";
import { Meeting, ActionItem, TranscriptSegment } from "../types";

const parseCbtReflection = (text: string) => {
  const lines = text.split("\\n").map(l => l.trim()).filter(Boolean);
  const beats: { label: string; content: string }[] = [];
  
  lines.forEach(line => {
    if (line.toLowerCase().includes("reflection (cbt)")) return;
    const cleanLine = line.replace(/^\\s*[-•*]\\s*/, "");
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
  const lines = text.split("\\n").map(l => l.trim()).filter(Boolean);
  const beats: { label: string; content: string }[] = [];
  lines.forEach(line => {
    if (line.toLowerCase().includes(headerKeyword.toLowerCase())) return;
    const cleanLine = line.replace(/^\\s*[-•*]\\s*/, "");
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
    targetTrello
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

`;

content = correctTop + content.substring(anchorIndex);
fs.writeFileSync('src/components/MeetingDetail.tsx', content);
console.log("Fixed MeetingDetail.tsx top successfully!");

const fs = require('fs');

let content = fs.readFileSync('src/components/MeetingDetail.tsx', 'utf8');

// 1. Update destructuring
const destructureTarget = `    targetEmail, 
    triggerToast,
    negotiationCoach,`;
const destructureReplacement = `    targetEmail, 
    triggerToast,
    negotiationCoach,
    autoSendWhatsApp,
    autoSendSlack,
    targetSlack,
    autoSendTeams,
    targetTeams,
    autoSendTrello,
    targetTrello,`;
content = content.replace(destructureTarget, destructureReplacement);

// 2. Update handleExecuteAction
const executeTarget = `    if (action.platform === "whatsapp") {`;
const executeReplacement = `    if (action.platform === "slack") {
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

    if (action.platform === "whatsapp") {`;
content = content.replace(executeTarget, executeReplacement);

// 3. Update the Personal Assistant Actions map and array
const arrayTarget = `                        {(meeting.personalAssistantActions || [
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
                          }
                        ]).map((action, idx) => {`;

const arrayReplacement = `                        {(meeting.personalAssistantActions || [
                          {
                            platform: "whatsapp",
                            title: "WhatsApp: Share decision brief",
                            details: "Draft: Summarize the standup points and decisions."
                          },
                          {
                            platform: "slack",
                            title: "Slack: Share summary",
                            details: "Push meeting summary and actions to the team Slack channel."
                          },
                          {
                            platform: "teams",
                            title: "MS Teams: Push minutes",
                            details: "Sync standup decisions to MS Teams."
                          },
                          {
                            platform: "trello",
                            title: "Trello: Log action items",
                            details: "Create cards on Trello for the generated action items."
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
                          }
                        ]).filter(action => {
                           if (action.platform === "whatsapp") return autoSendWhatsApp;
                           if (action.platform === "slack") return autoSendSlack;
                           if (action.platform === "teams") return autoSendTeams;
                           if (action.platform === "trello") return autoSendTrello;
                           return true; // keep others visible by default for now
                        }).map((action, idx) => {`;
content = content.replace(arrayTarget, arrayReplacement);

// 4. Update the icon/label switch case
const iconTarget = `                          if (action.platform === "whatsapp") {`;
const iconReplacement = `                          if (action.platform === "slack") {
                            platformLabel = "Slack";
                            platformIcon = <div className="text-[#E01E5A] font-black text-[14px] shrink-0 mt-0.5">#</div>;
                          } else if (action.platform === "teams") {
                            platformLabel = "MS Teams";
                            platformIcon = <div className="text-[#6264A7] font-black text-[14px] shrink-0 mt-0.5">T</div>;
                          } else if (action.platform === "trello") {
                            platformLabel = "Trello";
                            platformIcon = <div className="text-[#0052CC] font-black text-[14px] shrink-0 mt-0.5">[]</div>;
                          } else if (action.platform === "whatsapp") {`;
content = content.replace(iconTarget, iconReplacement);

fs.writeFileSync('src/components/MeetingDetail.tsx', content);
console.log("Updated MeetingDetail successfully!");

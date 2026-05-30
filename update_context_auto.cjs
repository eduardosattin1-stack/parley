const fs = require('fs');

let content = fs.readFileSync('src/context/MeetingContext.tsx', 'utf8');

// 1. Add to interface
const interfaceTarget = `  autoSendWhatsApp: boolean;
  setAutoSendWhatsApp: (val: boolean) => void;`;
const interfaceReplacement = `  autoSendWhatsApp: boolean;
  setAutoSendWhatsApp: (val: boolean) => void;
  autoSendSlack: boolean;
  setAutoSendSlack: (val: boolean) => void;
  autoSendTeams: boolean;
  setAutoSendTeams: (val: boolean) => void;
  autoSendTrello: boolean;
  setAutoSendTrello: (val: boolean) => void;`;
content = content.replace(interfaceTarget, interfaceReplacement);

// 2. Add state
const stateTarget = `  const [autoSendWhatsApp, setAutoSendWhatsApp] = useState<boolean>(() => {
    return localStorage.getItem("parley-auto-send-whatsapp") === "true";
  });`;
const stateReplacement = `  const [autoSendWhatsApp, setAutoSendWhatsApp] = useState<boolean>(() => {
    return localStorage.getItem("parley-auto-send-whatsapp") === "true";
  });
  const [autoSendSlack, setAutoSendSlack] = useState<boolean>(() => {
    return localStorage.getItem("parley-auto-send-slack") === "true";
  });
  const [autoSendTeams, setAutoSendTeams] = useState<boolean>(() => {
    return localStorage.getItem("parley-auto-send-teams") === "true";
  });
  const [autoSendTrello, setAutoSendTrello] = useState<boolean>(() => {
    return localStorage.getItem("parley-auto-send-trello") === "true";
  });`;
content = content.replace(stateTarget, stateReplacement);

// 3. Add useEffects
const effectTarget = `  useEffect(() => {
    localStorage.setItem("parley-auto-send-whatsapp", String(autoSendWhatsApp));
  }, [autoSendWhatsApp]);`;
const effectReplacement = `  useEffect(() => {
    localStorage.setItem("parley-auto-send-whatsapp", String(autoSendWhatsApp));
  }, [autoSendWhatsApp]);
  useEffect(() => {
    localStorage.setItem("parley-auto-send-slack", String(autoSendSlack));
  }, [autoSendSlack]);
  useEffect(() => {
    localStorage.setItem("parley-auto-send-teams", String(autoSendTeams));
  }, [autoSendTeams]);
  useEffect(() => {
    localStorage.setItem("parley-auto-send-trello", String(autoSendTrello));
  }, [autoSendTrello]);`;
content = content.replace(effectTarget, effectReplacement);

// 4. Add to context value
const valueTarget = `        autoSendWhatsApp,
        setAutoSendWhatsApp,`;
const valueReplacement = `        autoSendWhatsApp,
        setAutoSendWhatsApp,
        autoSendSlack,
        setAutoSendSlack,
        autoSendTeams,
        setAutoSendTeams,
        autoSendTrello,
        setAutoSendTrello,`;
content = content.replace(valueTarget, valueReplacement);

fs.writeFileSync('src/context/MeetingContext.tsx', content);
console.log("Updated context successfully!");

const fs = require('fs');

let content = fs.readFileSync('src/context/MeetingContext.tsx', 'utf8');

// 1. Add to interface
const interfaceTarget = `  targetWhatsApp: string;
  setTargetWhatsApp: (val: string) => void;`;
const interfaceReplacement = `  targetWhatsApp: string;
  setTargetWhatsApp: (val: string) => void;
  targetSlack: string;
  setTargetSlack: (val: string) => void;
  targetTeams: string;
  setTargetTeams: (val: string) => void;
  targetTrello: string;
  setTargetTrello: (val: string) => void;`;

content = content.replace(interfaceTarget, interfaceReplacement);

// 2. Add state
const stateTarget = `  const [targetWhatsApp, setTargetWhatsApp] = useState<string>(() => {
    return localStorage.getItem("parley-target-whatsapp") || "";
  });`;
const stateReplacement = `  const [targetWhatsApp, setTargetWhatsApp] = useState<string>(() => {
    return localStorage.getItem("parley-target-whatsapp") || "";
  });
  const [targetSlack, setTargetSlack] = useState<string>(() => {
    return localStorage.getItem("parley-target-slack") || "";
  });
  const [targetTeams, setTargetTeams] = useState<string>(() => {
    return localStorage.getItem("parley-target-teams") || "";
  });
  const [targetTrello, setTargetTrello] = useState<string>(() => {
    return localStorage.getItem("parley-target-trello") || "";
  });`;

content = content.replace(stateTarget, stateReplacement);

// 3. Add useEffects
const effectTarget = `  useEffect(() => {
    localStorage.setItem("parley-target-whatsapp", targetWhatsApp);
  }, [targetWhatsApp]);`;
const effectReplacement = `  useEffect(() => {
    localStorage.setItem("parley-target-whatsapp", targetWhatsApp);
  }, [targetWhatsApp]);
  useEffect(() => {
    localStorage.setItem("parley-target-slack", targetSlack);
  }, [targetSlack]);
  useEffect(() => {
    localStorage.setItem("parley-target-teams", targetTeams);
  }, [targetTeams]);
  useEffect(() => {
    localStorage.setItem("parley-target-trello", targetTrello);
  }, [targetTrello]);`;

content = content.replace(effectTarget, effectReplacement);

// 4. Add to context value
const valueTarget = `        targetWhatsApp,
        setTargetWhatsApp,`;
const valueReplacement = `        targetWhatsApp,
        setTargetWhatsApp,
        targetSlack,
        setTargetSlack,
        targetTeams,
        setTargetTeams,
        targetTrello,
        setTargetTrello,`;

content = content.replace(valueTarget, valueReplacement);

fs.writeFileSync('src/context/MeetingContext.tsx', content);
console.log("Updated context successfully!");

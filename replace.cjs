const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

// Add import
content = content.replace(
  'import { GoogleGenAI, Type } from "@google/genai";',
  'import { GoogleGenAI, Type } from "@google/genai";\nimport OpenAI from "openai";'
);

// Replace Gemini generation block
const geminiBlockStart = 'const response = await ai.models.generateContent({';
const geminiBlockEnd = '    });\n\n    const responseText = response.text;';

const startIndex = content.indexOf(geminiBlockStart);
if (startIndex === -1) {
    console.error("Could not find start index");
    process.exit(1);
}

const endIndex = content.indexOf(geminiBlockEnd, startIndex);
if (endIndex === -1) {
    console.error("Could not find end index");
    process.exit(1);
}

const openaiBlock = `    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    let responseText = "";
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "MY_OPENAI_API_KEY" && process.env.OPENAI_API_KEY.trim() !== "") {
      console.log("[Server] Using OpenAI GPT-4o-mini for analysis...");
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: \`RAW TRANSCRIPT TO ANALYZE:\\n\${transcriptTextForLlm}\\n\\n\${inputContract}\\n\\n\${promptText}\` }
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "MeetingAnalysis",
            strict: false,
            schema: {
              type: "object",
              properties: {
                title: { type: "string" },
                summary: { type: "string" },
                snapshot: { type: "string" },
                classification: {
                  type: "object",
                  properties: {
                    primary: { type: "string" },
                    secondary: { type: "array", items: { type: "string" } }
                  },
                  required: ["primary", "secondary"]
                },
                participantsInfo: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      role: { type: "string" },
                      share: { type: "string" },
                      matchStatus: { type: "string" }
                    },
                    required: ["name", "share", "matchStatus"]
                  }
                },
                decisions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      decision: { type: "string" },
                      agreedBy: { type: "string" }
                    },
                    required: ["decision", "agreedBy"]
                  }
                },
                checklist: { type: "array", items: { type: "string" } },
                openQuestions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      question: { type: "string" },
                      raisedBy: { type: "string" }
                    },
                    required: ["question", "raisedBy"]
                  }
                },
                topics: { type: "array", items: { type: "string" } },
                actionItems: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      task: { type: "string" },
                      assignee: { type: "string" },
                      completed: { type: "boolean" }
                    },
                    required: ["task", "assignee", "completed"]
                  }
                },
                transcript: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      speaker: { type: "string" },
                      text: { type: "string" },
                      timestamp: { type: "string" }
                    },
                    required: ["speaker", "text"]
                  }
                },
                tags: { type: "array", items: { type: "string" } },
                insights: { type: "array", items: { type: "string" } },
                nextTouchpoints: { type: "array", items: { type: "string" } },
                memoryUpdates: { type: "array", items: { type: "string" } },
                reflectionCbt: { type: "string" },
                reflectionNegotiation: { type: "string" },
                reflectionPerformance: { type: "string" },
                reflectionDebrief: { type: "string" },
                personalAssistantOutput: { type: "string" },
                personalAssistantActions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      platform: { type: "string" },
                      title: { type: "string" },
                      details: { type: "string" }
                    },
                    required: ["platform", "title", "details"]
                  }
                }
              },
              required: [
                "title", "summary", "snapshot", "classification", "participantsInfo",
                "decisions", "checklist", "openQuestions", "topics", "actionItems",
                "transcript", "tags", "insights", "nextTouchpoints", "memoryUpdates",
                "reflectionCbt", "reflectionNegotiation", "reflectionPerformance", "reflectionDebrief", "personalAssistantOutput", "personalAssistantActions"
              ]
            }
          }
        }
      });
      responseText = response.choices[0].message.content || "";
    } else {
      console.log("[Server] Using Gemini 3.5 Flash for analysis...");
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json"
        }
      });
      responseText = response.text || "";
    }

    if (!responseText) {
      throw new Error("Empty response text from AI API.");
    }`;

content = content.substring(0, startIndex) + openaiBlock + content.substring(endIndex + geminiBlockEnd.length - `\n    const responseText = response.text;`.length);

fs.writeFileSync('server.ts', content);
console.log("Replaced successfully!");

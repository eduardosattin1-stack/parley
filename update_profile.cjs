const fs = require('fs');

let content = fs.readFileSync('src/components/ProfileView.tsx', 'utf8');

// 1. Add to destructuring
const destructureTarget = `    targetWhatsApp,
    setTargetWhatsApp,`;
const destructureReplacement = `    targetWhatsApp,
    setTargetWhatsApp,
    autoSendSlack,
    setAutoSendSlack,
    autoSendTeams,
    setAutoSendTeams,
    autoSendTrello,
    setAutoSendTrello,
    targetSlack,
    setTargetSlack,
    targetTeams,
    setTargetTeams,
    targetTrello,
    setTargetTrello,`;
content = content.replace(destructureTarget, destructureReplacement);

// 2. Add UI blocks
const uiTarget = `                  Send Test WhatsApp Forward
                </button>
              </div>
            )}
          </div>
        </div>
      </div>`;

const slackBlock = `
          {/* Auto forward to Slack */}
          <div className="space-y-3 p-2 rounded-xl bg-brand-green/5 dark:bg-brand-gold/5 border border-brand-green/10 dark:border-brand-gold/15">
            <button
              type="button"
              onClick={() => setAutoSendSlack(!autoSendSlack)}
              className="w-full flex items-center justify-between text-left cursor-pointer"
            >
              <div className="space-y-0.5 max-w-[80%]">
                <div className="font-bold text-brand-green dark:text-brand-cream flex items-center gap-1.5">
                  Auto-forward to Slack
                </div>
                <p className="text-[10px] text-zinc-500 dark:text-brand-cream/70 leading-tight font-normal">
                  Automatically push summary to a Slack channel via Webhook.
                </p>
              </div>
              <div
                className={\`w-10 h-6 flex items-center rounded-full p-1 transition-all duration-300 shrink-0 \${
                  autoSendSlack ? "bg-brand-green dark:bg-brand-gold" : "bg-zinc-200 dark:bg-zinc-800"
                }\`}
              >
                <div
                  className={\`bg-white dark:bg-brand-green-dark w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 \${
                    autoSendSlack ? "translate-x-4" : "translate-x-0"
                  }\`}
                />
              </div>
            </button>
            {autoSendSlack && (
              <div className="space-y-1.5 pt-2 border-t border-dashed border-brand-green/10 dark:border-brand-gold/10 animate-fadeIn">
                <label className="text-[10px] font-bold text-zinc-500 dark:text-brand-cream/70 block">
                  Slack Webhook URL
                </label>
                <input
                  type="url"
                  placeholder="https://hooks.slack.com/services/..."
                  value={targetSlack}
                  onChange={(e) => setTargetSlack(e.target.value)}
                  className="w-full bg-brand-green/5 dark:bg-brand-green-dark/40 border border-brand-green/10 dark:border-brand-gold/15 rounded-xl px-3 py-2 text-xs text-brand-green dark:text-brand-cream focus:outline-none focus:border-brand-gold"
                />
              </div>
            )}
          </div>`;

const teamsBlock = `
          {/* Auto forward to Microsoft Teams */}
          <div className="space-y-3 p-2 rounded-xl bg-brand-green/5 dark:bg-brand-gold/5 border border-brand-green/10 dark:border-brand-gold/15">
            <button
              type="button"
              onClick={() => setAutoSendTeams(!autoSendTeams)}
              className="w-full flex items-center justify-between text-left cursor-pointer"
            >
              <div className="space-y-0.5 max-w-[80%]">
                <div className="font-bold text-brand-green dark:text-brand-cream flex items-center gap-1.5">
                  Auto-forward to MS Teams
                </div>
                <p className="text-[10px] text-zinc-500 dark:text-brand-cream/70 leading-tight font-normal">
                  Automatically push summary to a Teams channel via Webhook.
                </p>
              </div>
              <div
                className={\`w-10 h-6 flex items-center rounded-full p-1 transition-all duration-300 shrink-0 \${
                  autoSendTeams ? "bg-brand-green dark:bg-brand-gold" : "bg-zinc-200 dark:bg-zinc-800"
                }\`}
              >
                <div
                  className={\`bg-white dark:bg-brand-green-dark w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 \${
                    autoSendTeams ? "translate-x-4" : "translate-x-0"
                  }\`}
                />
              </div>
            </button>
            {autoSendTeams && (
              <div className="space-y-1.5 pt-2 border-t border-dashed border-brand-green/10 dark:border-brand-gold/10 animate-fadeIn">
                <label className="text-[10px] font-bold text-zinc-500 dark:text-brand-cream/70 block">
                  MS Teams Webhook URL
                </label>
                <input
                  type="url"
                  placeholder="https://your-domain.webhook.office.com/webhookb2/..."
                  value={targetTeams}
                  onChange={(e) => setTargetTeams(e.target.value)}
                  className="w-full bg-brand-green/5 dark:bg-brand-green-dark/40 border border-brand-green/10 dark:border-brand-gold/15 rounded-xl px-3 py-2 text-xs text-brand-green dark:text-brand-cream focus:outline-none focus:border-brand-gold"
                />
              </div>
            )}
          </div>`;

const trelloBlock = `
          {/* Auto forward to Trello */}
          <div className="space-y-3 p-2 rounded-xl bg-brand-green/5 dark:bg-brand-gold/5 border border-brand-green/10 dark:border-brand-gold/15">
            <button
              type="button"
              onClick={() => setAutoSendTrello(!autoSendTrello)}
              className="w-full flex items-center justify-between text-left cursor-pointer"
            >
              <div className="space-y-0.5 max-w-[80%]">
                <div className="font-bold text-brand-green dark:text-brand-cream flex items-center gap-1.5">
                  Auto-forward to Trello
                </div>
                <p className="text-[10px] text-zinc-500 dark:text-brand-cream/70 leading-tight font-normal">
                  Automatically create a Trello card with the summary.
                </p>
              </div>
              <div
                className={\`w-10 h-6 flex items-center rounded-full p-1 transition-all duration-300 shrink-0 \${
                  autoSendTrello ? "bg-brand-green dark:bg-brand-gold" : "bg-zinc-200 dark:bg-zinc-800"
                }\`}
              >
                <div
                  className={\`bg-white dark:bg-brand-green-dark w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 \${
                    autoSendTrello ? "translate-x-4" : "translate-x-0"
                  }\`}
                />
              </div>
            </button>
            {autoSendTrello && (
              <div className="space-y-1.5 pt-2 border-t border-dashed border-brand-green/10 dark:border-brand-gold/10 animate-fadeIn">
                <label className="text-[10px] font-bold text-zinc-500 dark:text-brand-cream/70 block">
                  Trello Board Email Address (or API details)
                </label>
                <input
                  type="text"
                  placeholder="user+board+list@boards.trello.com"
                  value={targetTrello}
                  onChange={(e) => setTargetTrello(e.target.value)}
                  className="w-full bg-brand-green/5 dark:bg-brand-green-dark/40 border border-brand-green/10 dark:border-brand-gold/15 rounded-xl px-3 py-2 text-xs text-brand-green dark:text-brand-cream focus:outline-none focus:border-brand-gold"
                />
              </div>
            )}
          </div>`;

const uiReplacement = `                  Send Test WhatsApp Forward
                </button>
              </div>
            )}
          </div>
${slackBlock}
${teamsBlock}
${trelloBlock}
        </div>
      </div>`;

content = content.replace(uiTarget, uiReplacement);

fs.writeFileSync('src/components/ProfileView.tsx', content);
console.log("Updated ProfileView successfully!");

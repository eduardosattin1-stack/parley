# Recruiting beta testers for Parley on Reddit

A practical playbook for finding real users to test and debug Parley
(offline-first AI meeting recorder, Android + web).

---

## 1. Before you post — checklist

Reddit posts die within hours. Have everything ready **before** posting so you
can convert interest immediately.

- [ ] **A shareable build.** Easiest options:
  - **Google Play closed testing** link (best: auto-updates, crash reports in Play Console), or
  - **Firebase App Distribution** invite link (you already use Firebase), or
  - A hosted **web URL** if the web build is usable standalone.
- [ ] **A one-line pitch.** Suggested: *"Parley records your meetings, works
  fully offline, and uses AI to transcribe and summarize them."*
- [ ] **A feedback channel.** The in-app `BugReportModal` is the primary one —
  verify it works end-to-end on a clean install. Add a fallback (Google Form
  or a Discord invite) for people who hit crashes before they can open the modal.
- [ ] **Crash/error reporting enabled** (Crashlytics or similar) so a tester
  saying "it crashed" is actionable without back-and-forth.
- [ ] **A short intake question set** (put it in the signup form):
  - Device model + Android version
  - How often do you record meetings / conversations?
  - What do you currently use (Otter, Plaud, voice memos, nothing)?
- [ ] **Privacy answers ready.** Recording apps get asked this immediately on
  Reddit: Where is audio stored? Is it sent to a server? (Offline-first is
  your best selling point — lead with it.) Also expect questions about
  consent/recording laws; recommend users follow local law.
- [ ] **A Reddit account with some history.** Brand-new accounts get filtered
  or removed in most subreddits. Ideally the account is >30 days old with
  some karma from normal participation. Spend a week commenting genuinely in
  the target subreddits first.

## 2. Where to post

### Tier 1 — subreddits built for exactly this (post here first)

| Subreddit | Notes |
|---|---|
| r/alphaandbetausers | Made for beta recruitment. Follow their title format: platform + short description. |
| r/betatests | Same purpose, smaller. Fine to post the same offer (reworded). |
| r/TestMyApp | Small but targeted. |
| r/androidapps | Self-promo only in the weekly **"Self Promotion Saturday"** thread — read the sidebar rules first. Good audience quality. |

### Tier 2 — maker/startup communities (feedback-framed posts)

| Subreddit | Notes |
|---|---|
| r/SideProject | Friendly to "I built this, roast it / try it" posts. |
| r/startups | Self-promo only in the pinned **"Share Your Startup"** thread. |
| r/roastmystartup | Frame as "roast Parley" — you get brutal but useful UX feedback. |
| r/indiehackers / r/IMadeThis | Show-and-tell friendly. |

### Tier 3 — target-audience subreddits (highest value, strictest rules)

People who record meetings live here: r/productivity, r/consulting, r/sales,
r/GradSchool, r/Journalism, r/projectmanagement. **Most of these ban direct
self-promotion.** Do not drop a recruitment post. Instead:

- Participate genuinely; answer questions about note-taking/recording workflows.
- Mention Parley only when someone asks "what tool do you use?" or in
  designated weekly promo threads if the sub has one.
- Reddit's informal rule of thumb: at most 1 in 10 of your contributions
  should be self-promotional.

### General rules that get posts removed

- Don't post identical text to multiple subs at the same time (spam filter +
  mods notice). Space posts out over days and reword each one.
- Read each sub's rules in the sidebar before posting — several require flairs
  or specific title formats.
- Reply to every comment quickly for the first 2–3 hours; engagement keeps
  the post visible.

## 3. Post drafts

### Draft A — r/alphaandbetausers / r/betatests

**Title:** `[Android] Parley — offline-first meeting recorder with AI transcription & summaries — looking for beta testers`

> Hi all — I've been building **Parley**, a meeting/conversation recorder
> that works fully offline and uses AI to transcribe and summarize your
> recordings afterwards.
>
> **What it does:**
> - Record meetings even with no connection (offline-first by design)
> - AI transcription + automatic summaries and action items
> - Organize recordings by project and contact
>
> **What I'm looking for:** ~20–30 testers who actually record meetings or
> conversations regularly. I especially need coverage across different
> Android devices and versions.
>
> **What I need from you:** use it for a real meeting or two, and report
> anything broken via the in-app bug report (or reply here). Rough edges
> expected — that's the point.
>
> **Privacy:** recordings stay on your device; [explain exactly what is sent
> to the server for transcription/summarization and what isn't].
>
> Sign up / download: [LINK]
>
> Happy to answer anything in the comments.

### Draft B — short version for weekly promo threads (r/androidapps Saturday, r/startups)

> **Parley** — offline-first meeting recorder with AI transcription and
> summaries (Android). Looking for beta testers who record meetings
> regularly; all feedback welcome, especially bugs on less common devices.
> [LINK]

### Draft C — feedback-framed for r/SideProject / r/roastmystartup

**Title:** `I built an offline-first AI meeting recorder — tear it apart`

> Solo project: **Parley**. It records meetings fully offline, then
> transcribes and summarizes with AI. I think the offline-first angle
> matters (planes, client sites with bad wifi, privacy), but I've been
> staring at it too long to see the flaws.
>
> What's confusing? What would stop you from using it over Otter or your
> voice memo app? Try it here: [LINK] — and if you hit a bug, the in-app
> report button sends it straight to me.

## 4. Running the beta

- **Cap the first cohort at ~20–30.** More testers than you can respond to
  personally = wasted goodwill. Open a second wave after fixing the first
  round of bugs.
- **Message each tester once, personally**, within a day of signup: thank
  them, tell them the one flow you most want tested (e.g. record → transcribe
  → summary), and where to report bugs.
- **Close the loop publicly.** When a tester's bug gets fixed, reply on the
  original Reddit thread/comment: "fixed in build X, thanks u/whoever."
  This is the single best way to keep a thread alive and attract more testers.
- **Track everything** in a simple table (GitHub issues works): reporter,
  device, Android version, repro steps, status.
- **Incentive (optional):** free lifetime/extended access to paid features
  for active beta testers is the standard offer and works better than gift
  cards.

## 5. Suggested sequence

1. **Week 0:** finish the checklist in §1; start commenting genuinely in
   target subs from your account.
2. **Day 1:** post Draft A to r/alphaandbetausers.
3. **Day 3:** post Draft C to r/SideProject.
4. **Saturday:** Draft B in r/androidapps Self Promotion Saturday.
5. **Ongoing:** monthly Share Your Startup thread on r/startups; answer
   workflow questions in Tier 3 subs.
6. **After first fixes ship:** go back to every thread and post an update —
   updates are also allowed as fresh posts in most Tier 1/2 subs
   ("Update: fixed the 12 bugs you found").

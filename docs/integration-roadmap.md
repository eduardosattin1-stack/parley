# Parley 2.0 — Meeting-Platform Integration Roadmap

*Assessment date: July 2026. API details below reflect platform capabilities as of mid-2026 and should be re-verified before each build.*

## 1. Current state

### Processing pipeline (this repo)

Everything downstream of "an audio file or transcript exists" already works and should be reused by every new integration:

- **Capture**: `src/components/RecordView.tsx` — mic or mixed (mic + speakers) capture; native far-field capture via `android/.../FarFieldRecorder.java`.
- **Ingestion/analysis**: `server.ts` `POST /api/analyze` — AssemblyAI transcription + diarization (fallback: OpenAI `gpt-4o-transcribe`, Gemini), pyannote.ai voiceprint speaker identification (`/api/voiceprint`), "Echo" LLM analysis producing summary, decisions, action items, insights, memory updates.
- **Storage/UI**: Firestore `/users/{uid}/meetings/{id}` + IndexedDB audio cache → `src/components/MeetingDetail.tsx`.

**Design principle for all integrations below: each one only needs to deliver an audio file (or a ready transcript) into this pipeline.** New inbound routes should live under `/api/integrations/*` in `server.ts` and converge on the same analysis path as `/api/analyze`.

### Existing integrations

All current integrations are **outbound** (post-meeting dispatch), none inbound:

- WhatsApp send via `wa.me` deep links (`src/context/MeetingContext.tsx`)
- Email drafts via client intents
- OpenClaw custom REST endpoint (`src/components/ProfileView.tsx`)
- Google Tasks / Spark "Execute" buttons — **UI-only today, not wired to real APIs**
- Platform enum: `AssistantAction.platform` in `src/types.ts` (`openclaw | google_spark | email | whatsapp | google_tasks`)

### Microsoft Teams flow — external to this repo

The working Teams integration (transcribed meetings the user is invited to → recording + AI insights in the app) has **no code in this repository** — no Graph API, MSAL, or webhook code exists here. It runs in an external flow/service. **Action item: document how that flow works (auth, triggers, where it posts into Parley) so it isn't tribal knowledge, and so new integrations can follow the same posting contract.**

## 2. Per-platform feasibility

| Platform | Teams-style integration possible? | Path | Gates |
|---|---|---|---|
| Google Meet | **Yes** (Workspace-hosted meetings only) | Meet REST API v2 + Workspace Events API + Drive API | Host must be on paid Workspace with recording enabled; media lives in organizer's Drive; restricted-scope OAuth |
| Zoom | **Yes** | `recording.completed` / `recording.transcript_completed` webhooks + recordings API | Host on Pro+ with cloud recording on; Marketplace review only if published publicly |
| Webex | **Yes** | Recordings + transcripts APIs, webhooks | Per-user access to own recordings; org-wide needs admin/compliance setup |
| WhatsApp calls | **No official path** | — | Consumer calls E2E-encrypted, zero API; Android blocks third-party call-audio capture; Play banned accessibility-based recording (2022) |
| Slack huddles | No official API | Bot infra (e.g. Recall.ai) or desktop capture | — |
| Discord / FaceTime | No official API | Unofficial voice-receive bots (fragile) / desktop capture | — |
| **Any of the above via meeting bot** | **Yes — universal** | Recall.ai (or MeetingBaaS, Skribby): one API, bot joins Meet/Zoom/Teams/Webex/Slack Huddles | ~$0.50–0.65/recording-hour; visible bot participant; hosts can deny entry |

### Google Meet (native) — details

- **Notification**: Google Workspace Events API pushes (via Cloud Pub/Sub) events such as `conference.v2.ended`, `recording.v2.fileGenerated`, transcript file-generated.
- **Fetch**: Meet REST API v2 `conferenceRecords.recordings` / `conferenceRecords.transcripts` return *references*; the MP4 lives in the **organizer's Drive** (download via Drive API), transcripts as Google Docs or structured `transcripts.entries` (entries expire 30 days post-meeting).
- **Constraints**:
  - Recording/transcription exists only on paid Workspace editions — **consumer @gmail.com hosts cannot record at all**, so there is nothing to fetch for consumer-hosted meetings.
  - Drive ACLs govern media download: a mere attendee often cannot pull the recording unless the organizer shares it.
  - Scopes (`meetings.space.readonly` + Drive) are sensitive/restricted — fine for a personal/internal OAuth app, heavy verification for a public one.
  - Since April 2026, Meet shows explicit participant-consent prompts for recordings/transcripts/Gemini notes.
- **Net**: closest analog to the Teams flow, but only covers Workspace-hosted meetings that were actually recorded.

### Zoom (native) — details

Webhook subscription (`recording.completed`, `recording.transcript_completed`) → `GET /meetings/{id}/recordings` → download MP4/M4A + VTT transcript (download token expires 24 h). Server-to-Server OAuth is sufficient for personal/single-account use; publishing to the Zoom Marketplace triggers a security review. Nothing is captured if the host doesn't cloud-record.

### WhatsApp — honest assessment

- **Consumer calls**: no API, no compliant workaround. Android blocked third-party call-audio access (Android 10) and Google Play banned accessibility-service call recording (May 2022). iOS: impossible without jailbreak.
- **What works today**: speakerphone + Parley's existing mic / far-field capture. Recommended: add a one-tap **"Phone/WhatsApp call" capture preset** in `RecordView.tsx` (speakerphone guidance, mixed audio source, auto-classification of the meeting as a call).
- **Desktop route (future)**: WhatsApp Desktop call + a desktop companion app doing system-audio capture (Granola approach) — also unlocks Slack huddles, Discord, FaceTime.
- **WhatsApp Business Calling API**: only relevant for business-number call-center scenarios where the business terminates SIP/WebRTC media on its own infra and records its own leg. Different product shape; not applicable to personal calls.

## 3. Recommended roadmap (prioritized)

1. **Meeting-bot ingestion (Recall.ai)** — *highest leverage.* One `POST /api/integrations/bot-webhook` endpoint receives recording + transcript for **Meet, Zoom, Teams, Webex, and Slack Huddles**, regardless of host plan, recording settings, or whether the user is host or attendee. Feeds the existing analyze pipeline. Cost ~$0.50/recording-hour. This is "Teams parity everywhere" in one integration.
2. **Google Calendar** — detect upcoming meetings, auto-schedule the bot (or prompt to record), and attach attendee names/emails to the meeting record. Directly improves pyannote speaker identification and the Relations view. Low gating, high UX value.
3. **Google Meet native** (Workspace Events + Meet REST + Drive) — zero-marginal-cost capture for Workspace-hosted meetings that already record; complements the bot (no bot in the call when a native recording exists).
4. **Zoom native webhooks** — same shape as #3, add when demand exists.
5. **WhatsApp/phone call preset** — package today's mic capture as a one-tap call-recording flow with speakerphone guidance (no new APIs; pure UX).
6. **Wire outbound integrations for real** — implement actual Google Tasks / Google Calendar push for action items behind the existing "Execute" buttons.
7. **Desktop companion app** (bigger bet) — macOS (Core Audio taps/ScreenCaptureKit) + Windows (WASAPI loopback) system-audio capture; covers everything bots can't reach, including WhatsApp Desktop calls. Consider Recall.ai's Desktop Recording SDK instead of building from scratch.

### Architecture sketch

- Add `Meeting.source: 'mic' | 'teams' | 'bot' | 'meet' | 'zoom' | 'import'` to `src/types.ts` (display badge in `MeetingDetail.tsx` / `HomeFeed.tsx`).
- Inbound routes in `server.ts`: `/api/integrations/bot-webhook`, later `/api/integrations/meet/events`, `/api/integrations/zoom/webhook` — verify signatures, resolve the Parley user, download media/transcript, then invoke the shared analysis path used by `/api/analyze`.
- Settings surface in `ProfileView.tsx`: connect/disconnect per integration, auto-record toggle, bot display name.
- Secrets (Recall API key, Google OAuth tokens, Zoom secret token) in Cloud Run env / per-user tokens in Firestore — never in the client.

## 4. Consent & compliance (first-class requirement)

- **US**: ~13 states (CA, FL, IL, MD, MA, MI, MT, NH, NV, PA, WA, CT, DE) require **all-party consent**. A bot appearing in the participant list is not by itself sufficient consent — provide audible/visible notice.
- **EU/GDPR**: lawful-basis analysis needed (consent is weak in employment contexts); notice + legitimate-interest assessment is the norm; DPAs with AI vendors (AssemblyAI, pyannote, LLM providers) including no-training clauses.
- **Platform trend**: Google's Apr-2026 explicit consent prompts in Meet, Zoom consent banners, WhatsApp Business Calling partner terms — all point the same way.
- **Product implication**: ship consent workflows (pre-meeting notice, in-meeting announcement, per-region config) alongside any auto-record feature, not after it.

<div align="center">

<br />

<img src="https://raw.createusercontent.com/1f7298f6-3ca8-4a69-854d-b4c25677ab9f/" width="96" height="96" style="border-radius: 22px;" />

<br /><br />

# Enhance It

### AI-powered text enhancement — built for real people, real use cases.

Enhance It automatically detects whether your text is a **message**, **email**, **AI prompt**, or **general writing** — and rewrites it to be clearer, sharper, and more effective. No configuration. No templates. Just paste and enhance.

<br />

<img src="https://img.shields.io/badge/React%20Native-Expo-000000?style=flat&logo=expo&logoColor=white" />
<img src="https://img.shields.io/badge/AI-Gemini%202.5%20Flash-4285F4?style=flat&logo=google&logoColor=white" />
<img src="https://img.shields.io/badge/Platform-iOS%20%7C%20Android-lightgrey?style=flat" />
<img src="https://img.shields.io/badge/License-MIT-green?style=flat" />
<img src="https://img.shields.io/badge/Status-Active-brightgreen?style=flat" />

<br /><br />

</div>

---

## Screenshots

<div align="center">

| Enhance | Result | History | Clipboard Flow |
|:---:|:---:|:---:|:---:|
| <img src="https://raw.createusercontent.com/6cd97ce8-f730-42e9-856b-1ab7a5e0cd18/" width="200" /> | <img src="https://raw.createusercontent.com/7efcb9b0-1958-4646-8012-00649f6ad4fc/" width="200" /> | <img src="https://raw.createusercontent.com/f65c6f0c-46d8-439a-9f40-a9089df985f9/" width="200" /> | <img src="https://raw.createusercontent.com/ba01af4a-ac52-49da-9a22-caa3c41c3ae3/" width="200" /> |
| Type or paste your text | Context-aware AI output | All past enhancements | Copy from any app |

</div>

<br />

---

## Features

### Smart Context Detection

The AI reads your text and automatically identifies what kind of writing it is — no dropdowns, no mode switching needed. Detection is powered by Gemini itself, not fragile keyword rules.

| Context | Trigger Signals | Output Format |
|---|---|---|
| Message | Short text, informal tone, under 300 chars | Natural, warm, conversational |
| Email | "Dear", "Best regards", "Subject:", professional requests | Subject line + greeting + body + sign-off |
| AI Prompt | "You are", "Act as", "Generate", imperative commands | Engineer-grade structured prompt |
| General | Long-form, notes, blog posts | Improved clarity, structure, and flow |

<br />

### Clipboard Enhancement — Enhance From Any App

Enhance text from any app on your phone — WhatsApp, Gmail, Safari, Notes, ChatGPT — without leaving your workflow.

    Step 1 — Select and copy text in any app
    Step 2 — Switch to Enhance It
    Step 3 — Tap the auto-detected Paste banner
    Step 4 — Choose your tone, tap Enhance, copy back

When you return to Enhance It after copying text, a smart banner slides in with a one-tap paste button. A 30-second cooldown prevents the banner from re-triggering too often.

<br />

### Tone Modes

| Tone | Best For |
|---|---|
| Auto | AI selects the best tone for the detected context |
| Casual | Texts, DMs, informal messages |
| Professional | Work emails, LinkedIn, formal documents |
| Concise | Slack messages, quick replies, TL;DRs |
| Detailed | Technical docs, proposals, thorough emails |
| Creative | Content, social posts, storytelling |

When set to Auto, the result card shows a badge revealing which tone the AI actually chose.

<br />

### Before / After Toggle

Tap the toggle icon on any result card to instantly flip between the original text and the enhanced version — side by side, no extra screens needed.

<br />

### Word Count Delta

Every result shows a word count badge — for example "+12 words" or "-3 words" — so you can immediately see how much was added or trimmed.

<br />

### Enhancement History

Every enhancement is automatically saved. The History tab refreshes in real-time the moment a new enhancement completes — no manual pull-to-refresh needed.

- Search across all enhancements by keyword, context type, or subject line
- Skeleton loading cards while data fetches
- One-tap copy of full email (subject + body) or plain text
- Swipe to delete individual items or clear all at once

<br />

### Dark and Light Mode

Full system-wide dark and light theme. Toggled from Settings and persisted across app restarts using AsyncStorage.

<br />

### Onboarding Flow

First-time users see a 3-step swipeable onboarding that explains the clipboard flow, context detection, and tone modes. Shown once and never again.

<br />

### Share Button

After enhancing, tap the share icon on the result card to open the native iOS or Android share sheet — send the enhanced text anywhere without copying.

<br />

### Haptic Feedback

- Success vibration when enhancement completes
- Light tap when copying text
- Light tap when deleting from history

<br />

### Input Safety

- 2000 character limit on input with a live counter
- Counter turns amber when you approach the limit
- Enforced on both frontend and backend to prevent API timeouts

<br />

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native — Expo Managed Workflow |
| Routing | Expo Router v3 — file-based |
| AI Engine | Google Gemini 2.5 Flash |
| Backend | Node.js Serverless API Routes |
| Animations | Moti + React Native Animated |
| Database | PostgreSQL via Neon Serverless |
| Icons | Lucide React Native |
| Clipboard | Expo Clipboard + AppState listener |
| Haptics | Expo Haptics |
| Storage | AsyncStorage — theme + tone preferences |
| Share | React Native Share API |

<br />

---

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI — `npm install -g expo-cli`
- iOS Simulator, Android Emulator, or Expo Go on a physical device

### Installation

    git clone https://github.com/patil-shubham-dev/Enhance-It.git
    cd Enhance-It
    npm install
    npx expo start

Then press `i` for iOS simulator, `a` for Android emulator, or scan the QR code with Expo Go.

### Environment Variables

Create a `.env` file at the project root:

    DATABASE_URL=postgresql://user:password@host/dbname

<br />

---

## Project Structure

    Enhance-It/
    +-- apps/
    |   +-- mobile/
    |   |   +-- src/
    |   |       +-- app/
    |   |       |   +-- _layout.jsx              Root stack — ThemeProvider + QueryClient + onboarding gate
    |   |       |   +-- index.jsx                Redirect to (tabs)
    |   |       |   +-- onboarding.jsx           3-step first-launch onboarding
    |   |       |   +-- (tabs)/
    |   |       |       +-- _layout.jsx          Tab bar — theme-aware colors
    |   |       |       +-- index.jsx            Enhance screen — input, tone, result, clipboard banner
    |   |       |       +-- history.jsx          History — search, skeletons, real-time refresh
    |   |       |       +-- settings.jsx         Settings — dark mode toggle, tone, guide, data
    |   |       +-- utils/
    |   |           +-- theme.jsx                ThemeContext — dark/light color system
    |   |           +-- enhanceEvents.js         Event emitter — history auto-refresh
    |   +-- web/
    |       +-- src/
    |           +-- app/
    |               +-- api/
    |                   +-- enhance/
    |                   |   +-- route.js         POST — Gemini enhancement + DB save
    |                   +-- history/
    |                   |   +-- route.js         GET / DELETE — history CRUD
    |                   +-- utils/
    |                       +-- sql.js           Neon DB connection
    +-- LICENSE.txt
    +-- README.md

<br />

---

## How the AI Works

The enhancement engine sends your text to Gemini 2.5 Flash with a context-aware system prompt that:

1. Detects context — Gemini itself classifies the writing type using linguistic reasoning, not keyword matching
2. Applies format rules — email gets Subject + sign-off, AI prompts get role + constraints + output format instructions
3. Respects your tone — the model is constrained to your selected tone while preserving your original intent
4. Reports the tone it used — when set to Auto, `toneApplied` is returned so the UI can show the user what was chosen
5. Returns structured JSON — subject lines, explanations, and body text are all separate fields for clean rendering

Example response for an email enhancement:

    {
      "detectedContext": "EMAIL",
      "enhancedText": "Dear James,\n\nI hope this message finds you well...",
      "subject": "Follow-up: Project Proposal Review — Action Required",
      "toneApplied": "professional",
      "explanation": "Restructured as a formal email with a compelling subject line and clear call to action"
    }

<br />

---

## Changelog

### v1.0.0 — Current

- AI-powered context detection — Message, Email, AI Prompt, General
- Clipboard detection with smart banner and 30-second cooldown
- 6 tone modes — Auto, Casual, Professional, Concise, Detailed, Creative
- Before / After toggle on result card
- Word count delta badge
- Tone confidence badge — shows which tone Auto selected
- Native share sheet on result card
- Real-time history refresh via event emitter
- Search across all history items
- Skeleton loading cards in history
- Dark and light mode with AsyncStorage persistence
- Default tone setting with AsyncStorage persistence
- 3-step swipeable onboarding — shown once on first launch
- Haptic feedback on enhance, copy, and delete
- 2000 character input limit with live counter
- Retry button on error state

<br />

---

## Roadmap

- [ ] Custom tone profiles — user-defined system prompts
- [ ] Multi-language support
- [ ] Native Android Share intent filter
- [ ] Native iOS Share Extension
- [ ] iCloud and Google Drive history sync
- [ ] Home screen widget — quick paste-and-enhance

<br />

---

## Contributing

Contributions, issues, and feature requests are welcome.

1. Fork the repository
2. Create your feature branch — `git checkout -b feat/amazing-feature`
3. Commit your changes — `git commit -m 'feat: add amazing feature'`
4. Push to the branch — `git push origin feat/amazing-feature`
5. Open a Pull Request

Please follow Conventional Commits for commit messages — https://www.conventionalcommits.org/

<br />

---

## License

This project is licensed under the MIT License — free to use, modify, and distribute.

<br />

<details>
<summary>View full MIT License text</summary>

<pre>
MIT License

Copyright (c) 2026 Shubham Patil

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>

</details>

See the full [LICENSE.txt](LICENSE.txt) file for details.

<br />

---

<div align="center">

<img src="https://raw.createusercontent.com/1f7298f6-3ca8-4a69-854d-b4c25677ab9f/" width="48" height="48" style="border-radius: 12px;" />

<br /><br />

Built with passion by [Shubham Patil](https://github.com/patil-shubham-dev)

<br />

<sub>If this project helped you, consider giving it a star on GitHub</sub>

</div>

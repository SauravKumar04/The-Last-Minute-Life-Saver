# Aegis Priority Defense Agent 🛡️

Aegis is an elite, autonomous priority-defense operating dashboard built with React 18, Express, and Google's Gemini LLM. It transforms static task lists into active tactical defense cards, calculating dynamic priority index scores and automatically deploying AI "Rescue Playbooks" when deadlines approach critical thresholds.

---

## 🚨 The Problem

Traditional todo lists and task trackers are **fundamentally broken**:
1. **Static Prioritization**: High/Medium/Low tags are static. A "Low" priority task due in 2 hours is far more urgent than a "High" priority task due in 3 weeks.
2. **Missing Risk Signals**: Teams fail to recognize the temporal decay of their safety buffers until a boundary is breached.
3. **Rescue Friction**: When a critical deadline breaches its temporal safety limit, valuable minutes are lost to panic, draft drafting, and planning.

---

## ⚡ The Solution

Aegis implements an active **Temporal Risk Index** to mitigate project failures dynamically.

### 1. The Priority Engine (Background Core)
- Calculates a dynamic risk score from **0% to 100%** based on remaining time and raw weight.
- Operates a server-side background worker loop that refreshes status logs and system metrics continuously.
- Visualizes health indexes in real time with high-contrast indicator tracks.

### 2. Autonomous AI Rescue
- When a task drops below the **12-hour temporal safe buffer**, Aegis transitions the task status to **Rescued**.
- The server instantly engages Gemini to compile custom **Mitigation Blueprints** (e.g. extension templates, task-delegation lists, and recovery check-lists).

### 3. Voice Co-Pilot
- Allows hands-free operation in high-stress environments.
- Use speech-to-text input to dictate new task boundaries.
- Uses text-to-speech synthesis to read mitigation blueprints aloud.

### 4. Resilient LLM Defensive Engineering
- **Intelligent Endpoint Cache**: Stores recommendations and schedules with fingerprint checks (`task_id:status`).
- **Quota Circuit Breaker**: Gracefully catches `429 (Too Many Requests)` rate-limiting anomalies, automatically falling back to a structured static mitigation generator.

---

## 🏗️ Architecture & Stack

Aegis is implemented as a cohesive full-stack Node.js application:

```
┌────────────────────────────────────────────────────────┐
│                      Web Browser                       │
│  ┌──────────────────┐  ┌────────────────────────────┐  │
│  │   Landing Page   │  │   Active Dashboard UI      │  │
│  │  (System Guide)  │  │  (Charts, Scenarios, TTS)  │  │
│  └────────┬─────────┘  └─────────────┬──────────────┘  │
└───────────┼──────────────────────────┼─────────────────┘
            │                          │ (HTTP/JSON API)
            ▼                          ▼
┌────────────────────────────────────────────────────────┐
│                   Express Server                       │
│  ┌──────────────────────────────────────────────────┐  │
│  │                 API Controllers                  │  │
│  │  (Recommendation, Habit, Agent, Task Controllers)│  │
│  └────────┬──────────────────────────────────┬──────┘  │
│           │                                  │         │
│           ▼                                  ▼         │
│  ┌──────────────────┐            ┌──────────────────┐  │
│  │  Priority Engine │            │  Local DB Store  │  │
│  │ (Background Loop)│            │    (db.json)     │  │
│  └────────┬─────────┘            └──────────────────┘  │
└───────────┼────────────────────────────────────────────┘
            │
            ▼
┌────────────────────────────────────────────────────────┐
│                       Gemini API                       │
│        (gemini-3.5-flash / gemini-3.1-flash-lite)      │
└────────────────────────────────────────────────────────┘
```

### Frontend (SPA)
- **Framework**: React 18 with Vite.
- **Styling**: Tailwind CSS (with highly polished dark typography pairings and clean spacing).
- **Icons**: Lucide React.
- **Animations**: `motion` layout and micro-transitions.

### Backend (Server)
- **Framework**: Node.js + Express with `tsx` development runner.
- **Background Worker**: `PriorityEngine.ts` maintains a background interval loop that processes calculations and updates dynamic score properties.
- **Database**: File-based pristine JSON database (`db.json`) powered by robust model wrappers (`Task.ts`, `AgentLog.ts`, etc.) to guarantee seamless persistent mutations.
- **API Clients**: Built using the modern `@google/genai` TypeScript SDK.

---

## 🛠️ Installation & Execution

### Environment Variables
Setup your credentials in `.env.example`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

### Production Bundle
```bash
npm run build
npm start
```
---
*Protected by Aegis Autonomous Priority Defense System.*

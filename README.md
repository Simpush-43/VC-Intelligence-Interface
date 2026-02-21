<div align="center">
  <div p-4>
    <img src="https://img.icons8.com/fluency/96/000000/radar.png" alt="Radar Icon" width="64" height="64" />
  </div>
  <h1>🧭 VC Scout Intelligence</h1>
  <p><strong>A precision AI scouting interface built for Venture Capital funds.</strong></p>
  
  <p>
    <a href="YOUR_VERCEL_LINK_HERE"><strong>View Live Deployment</strong></a> · 
    <a href="#-local-setup"><strong>Read the Docs</strong></a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Tailwind_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
    <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
    <img src="https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI" />
  </p>
</div>

---

## 📖 Overview

VC Scout is a high-density, Harmonic-style discovery platform designed to transform thesis-driven sourcing. It allows investors to seamlessly search companies, filter by stage/sector, and instantly enrich profiles with live, AI-extracted signals scraped directly from public web data.

> **Note on the "Core Test":** This application strictly adheres to the security requirement of the assignment. The `GEMINI_API_KEY` is never exposed to the client. All scraping and LLM extraction happens securely on the backend via a Vercel Serverless Function (`/api/enrich`).

![App Screenshot ](screenshots/Discovery.png)

---

## ✨ Core Workflows & Features

### 🔍 Discovery & Profiling
* **High-Density Data Table:** Sortable headers, stage/sector filtering, and active pagination tailored for fast scanning.
* **Live AI Enrichment:** Click "Live Enrich" to trigger a secure serverless function that fetches live HTML, sanitizes the DOM, and uses **Google Gemini 2.5 Flash** to extract:
  * 1-2 sentence business summaries.
  * Bulleted "What they do" breakdowns.
  * Derived VC signals mapped to a visual timeline.
  * Extracted SaaS keywords.
* **Thesis Management:** Build target lists, toggle saved states, and write persistent Analyst Notes.
* **Data Export:** Instantly download curated lists as `.csv` or `.json` payloads.

### ⚡ Premium UX (Power-User Touches)
* **`⌘+K` Global Search:** A custom, blurred modal accessible anywhere in the app for instant navigation.
* **Aggressive Client Caching:** AI reports, notes, and lists are cached locally using custom `useLocalStorage` hooks for zero-latency reloads.
* **Custom Toast Context:** Animated, dark-mode success/error states built entirely from scratch without external libraries.
* **Graceful Fallbacks:** Custom `404` routing and a global React `<ErrorBoundary />` to prevent "white screen" crashes.

---

## 🏗️ Architecture 

```text
├── api/                # Vercel Serverless Functions (Node.js)
│   └── enrich.js       # Cheerio Scraper + Gemini AI Integration
├── src/
│   └── assets 
│   ├── components/     # Reusable UI (GlobalSearch, ErrorBoundary, Sidebar)
│   ├── contexts/  
│   └── hooks/      
│   ├── pages/          # React Router Views (Discovery, Profile, Lists)
│   └── App.css
│   └── App.jsx
│   └── index.css
│   └── main.jsx
│   └── mockData.js    # Seeded JSON dataset
├── vercel.json         # Route rewrites for React Router SPA
└── vite.config.js      # Frontend build configuration
## 💻 Local Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/Simpush-43/VC-Intelligence-Interface](https://github.com/Simpush-43/VC-Intelligence-Interface.git)
   cd vc-scout```
2. **Install dependencies:**
   ```npm install```
3. **Configure Environment Variables:
Create a .env.local file in the root directory and add your Google AI Studio key:**
   ```Code snippet
   GEMINI_API_KEY=your_google_ai_studio_key_here```
4. **Run the Development Server:
Because this project uses Vercel Serverless API routes, use the Vercel CLI to run the frontend and backend simultaneously:**
```bash
npm i -g vercel
vercel dev```
The app will be live at http://localhost:3000.
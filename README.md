# 🏎️ F1 Career Simulator & Analyzer

A full‑stack **Formula 1 Career Mode Simulator** that allows players to
simulate seasons, race weekends, driver careers, and championship
battles.\
The platform combines **a Node.js simulation backend**, **React + Vite
frontend**, and **AI-assisted narrative commentary** using **Ollama
models**.

The goal of the project is to recreate a **cinematic F1 career
universe** similar to Drive‑to‑Survive storytelling, with dynamic race
simulation, standings tracking, commentary generation, and player career
progression.

------------------------------------------------------------------------

# 🚀 Features

### 🎮 Career Simulation

-   Player career management
-   Team selection and career progression
-   Season‑based championship tracking
-   Race weekend simulation

### 🏁 Race Simulation Engine

-   Grid and result simulation
-   Championship point calculation
-   Season calendar management
-   Race recap generation

### 📊 Championship & Standings

-   Driver standings
-   Constructor standings
-   Season summaries
-   Historical season memory

### 🎙️ AI Commentary (Ollama Powered)

-   Dynamic race commentary
-   Narrative generation for events
-   AI generated storyline summaries
-   Driver rivalry commentary

### 📡 Full Stack Architecture

-   **Backend:** Node.js + Express + Sequelize
-   **Database:** PostgreSQL
-   **Frontend:** React + Vite
-   **AI:** Ollama local models

------------------------------------------------------------------------

# 🧠 AI Integration

This project integrates **Ollama models** to generate:

-   Race commentary
-   Narrative storytelling
-   Season summaries
-   Dynamic player career storylines

Example usage:

    Ollama → commentaryService.js
    Ollama → narrativeService.js
    Ollama → legacyNarrativeService.js

This allows the simulator to produce **Drive‑to‑Survive style
storytelling automatically**.

------------------------------------------------------------------------

# 🏗️ Project Architecture

    F1-25-GAME-SIMULATOR---ANALYSER
    │
    ├── f1-career-backend
    │
    └── f1-career-frontend

------------------------------------------------------------------------

# 🔧 Backend (Node.js / Express)

Backend handles **simulation logic, API endpoints, and AI
integrations**.

## Folder Structure

    f1-career-backend
    │
    ├── config
    │   └── config.js
    │
    ├── migrations
    │
    ├── seeders
    │   ├── seed-teams.js
    │   ├── seed-drivers.js
    │   └── seed-tracks.js
    │
    ├── src
    │
    │   ├── controllers
    │   │   ├── authController.js
    │   │   ├── careerController.js
    │   │   ├── driverController.js
    │   │   ├── playerCareerController.js
    │   │   ├── raceController.js
    │   │   ├── seasonController.js
    │   │   ├── seasonSummaryController.js
    │   │   ├── standingController.js
    │   │   └── teamController.js
    │
    │   ├── middleware
    │   │   ├── auth.js
    │   │   └── errorHandler.js
    │
    │   ├── models
    │   │   ├── career.js
    │   │   ├── commentary.js
    │   │   ├── driver.js
    │   │   ├── driverLegacy.js
    │   │   ├── playerCareer.js
    │   │   ├── raceResult.js
    │   │   ├── raceWeekend.js
    │   │   ├── season.js
    │   │   ├── seasonCalendar.js
    │   │   ├── seasonMemory.js
    │   │   ├── team.js
    │   │   ├── teamLegacy.js
    │   │   └── user.js
    │
    │   ├── routes
    │   │   ├── auth.js
    │   │   ├── careers.js
    │   │   ├── drivers.js
    │   │   ├── playerCareerRoutes.js
    │   │   ├── races.js
    │   │   ├── seasons.js
    │   │   ├── standingRoutes.js
    │   │   └── teams.js
    │
    │   ├── services
    │   │   ├── simulation
    │   │   ├── aiService.js
    │   │   ├── cacheService.js
    │   │   ├── championshipService.js
    │   │   ├── championshipSummaryService.js
    │   │   ├── commentaryContextService.js
    │   │   ├── dynastyService.js
    │   │   ├── legacyNarrativeService.js
    │   │   ├── legacyService.js
    │   │   ├── narrativeService.js
    │   │   └── seasonFinalizer.js
    │
    │   └── utils
    │       ├── pointsCalculator.js
    │       └── index.js
    │
    ├── .env
    ├── package.json
    └── package-lock.json

------------------------------------------------------------------------

# 🎨 Frontend (React + Vite)

Frontend provides the **career dashboard, race controls, standings UI,
and simulation interface**.

## Folder Structure

    f1-career-frontend
    │
    ├── public
    │
    ├── src
    │
    │   ├── assets
    │   │   ├── F1_theme.mp3
    │   │   ├── f1Drive.mp3
    │   │   └── transition-music.mp3
    │
    │   ├── components
    │   │
    │   │   ├── background
    │   │   │   └── F1Background.jsx
    │   │
    │   │   └── ui
    │   │       ├── Counter.jsx
    │   │       ├── GlassCard.jsx
    │   │       ├── GlassCard.css
    │   │       ├── Sidebar.jsx
    │   │       ├── Sidebar.css
    │   │       ├── TopBar.jsx
    │   │       ├── TopBar.css
    │   │       └── TypewriterText.jsx
    │
    │   ├── context
    │
    │   ├── hooks
    │   │   ├── useBackgroundAudio.js
    │   │   └── useRevealSequence.js
    │
    │   ├── layouts
    │   │   ├── MainLayout.jsx
    │   │   └── layout.css
    │
    │   ├── pages
    │   │   ├── Auth
    │   │   ├── Championship
    │   │   ├── Commentary
    │   │   ├── Constructors
    │   │   ├── Dashboard
    │   │   ├── Drivers
    │   │   ├── ModeSelect
    │   │   ├── Player
    │   │   ├── Race
    │   │   ├── RaceControl
    │   │   ├── RaceRecap
    │   │   ├── SeasonSummary
    │   │   ├── Standings
    │   │   └── Timeline
    │
    │   ├── services
    │   │   ├── api.js
    │   │   ├── authService.js
    │   │   ├── careerService.js
    │   │   ├── championshipService.js
    │   │   ├── commentaryService.js
    │   │   ├── driverService.js
    │   │   ├── playerCareerService.js
    │   │   ├── raceService.js
    │   │   ├── seasonService.js
    │   │   ├── standingsService.js
    │   │   └── teamService.js
    │
    │   ├── theme
    │
    │   ├── utils
    │   │   ├── commentaryVoices.js
    │   │   ├── rivalryDetector.js
    │   │   └── seasonPhase.js
    │
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    │
    ├── .env
    ├── index.html
    ├── package.json
    └── vite.config.js

------------------------------------------------------------------------

# ⚙️ Installation

## 1️⃣ Clone Repository

    git clone https://github.com/yourusername/f1-career-simulator.git

------------------------------------------------------------------------

## 2️⃣ Install Backend

    cd f1-career-backend
    npm install

Run migrations and seeders:

    npx sequelize db:migrate
    npx sequelize db:seed:all

Start server:

    npm start

------------------------------------------------------------------------

## 3️⃣ Install Frontend

    cd f1-career-frontend
    npm install
    npm run dev

------------------------------------------------------------------------

# 🔑 Environment Variables

Example backend `.env`

    PORT=5000
    DB_HOST=localhost
    DB_USER=postgres
    DB_PASSWORD= your password
    DB_NAME=f1career
    JWT_SECRET=your_secret
    OLLAMA_URL=http://localhost:11434

------------------------------------------------------------------------

# 🏎️ Core Simulation Modules

  Module                Purpose
  --------------------- --------------------------------
  ChampionshipService   Driver & constructor standings
  SeasonFinalizer       Handles season completion
  DynastyService        Long term team legacy
  NarrativeService      Story generation
  CommentaryService     AI commentary
  Simulation Engine     Race logic

------------------------------------------------------------------------

# 🧪 Future Features

Planned expansions:

-   👥 **Duo Career Mode**
-   🌍 Multiplayer Career Universe
-   📊 Advanced telemetry analytics
-   🎥 Full race cinematic commentary
-   📜 Historic driver databases
-   🏎️ Dynamic driver market / transfers

------------------------------------------------------------------------

# 🤖 AI Storytelling Vision

The simulator aims to evolve into a **fully AI driven motorsport
narrative engine** where:

-   Every race has commentary
-   Rivalries evolve dynamically
-   Drivers build legacy careers
-   Seasons create story arcs

------------------------------------------------------------------------

## ⚠️ Disclaimer

This project is a **non-commercial fan-made simulator** created for educational and entertainment purposes.

All trademarks, team names, driver names, championship branding, and related intellectual property belong to their **respective owners**.

This project is **not affiliated with, endorsed by, or associated with Formula One Group, FIA, or any official F1 teams**.

---

## 🎵 Audio & Media Credits

Audio tracks used in this project are for **demonstration and UI immersion purposes only**.

All soundtracks, audio clips, and related media assets belong to their **respective copyright owners**.

If you are the copyright holder of any media used here and would like it removed or credited differently, please contact the repository owner.

---

## 🏎 Motorsport Data Disclaimer

Driver names, teams, and motorsport-related references used in this simulator are based on publicly available motorsport information.

All rights related to **Formula 1 teams, drivers, logos, and championships** belong to their respective organizations and rights holders.

This project does **not claim ownership of any real-world motorsport data or branding**.

---

## 🤖 AI Generated Content

Race commentary, narrative events, and storyline content are generated using **local AI models via Ollama**.
Generated content is fictional and created for simulation storytelling purposes.

---

## 📜 License

This project’s **source code** is licensed under the **MIT License**.

Third-party assets, trademarks, audio, and motorsport references remain the property of their respective owners.

------------------------------------------------------------------------

# 👨‍💻 Author

**Yash Mishra**

Software Developer\
Motorsport Simulation Enthusiast

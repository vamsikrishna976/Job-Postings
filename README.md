# 🚀 Job Portal Web Application

A full-stack Job Portal that aggregates job listings from multiple public job APIs and delivers a clean, fast, and responsive user experience.  
Built with **React + Vite**, **TailwindCSS**, and a custom backend using **Node.js + Express**.  
Deployed on **Vercel** (frontend) and **Render** (backend).

---

## ⭐ Features

### 🔹 Job Aggregation (ArbeitNow + TheMuse)
- Fetches real jobs from both APIs
- Normalizes fields (title, company, description, date, location)
- Merges and sorts job posts by newest date

### 🔹 Frontend Features
- Keyword search (title, company, description)
- Source filter (ArbeitNow / TheMuse / Both)
- “Only Today” date filter
- Pagination (6 / 9 / 12 per page)
- Dark & Light theme toggle
- Real-time results count
- Fully responsive UI
- Loading state + fallback UI

### 🔹 Backend Features
- Node.js + Express server
- Server-side caching (5-minute TTL)
- No-store cache headers → always fresh data
- Health endpoint (`/`) for uptime checks
- Error-safe normalization and fallback responses

---

## 🏗 Architecture

**Frontend**
- React (Hooks, useEffect, useMemo)
- Vite
- TailwindCSS  
- Axios

**Backend**
- Node.js
- Express
- node-fetch

**Deployment**
- Vercel (frontend)
- Render (backend)
- UptimeRobot for keep-alive

---

## 📡 API Endpoints

### `GET /`
Returns health status:
```json
{ "ok": true, "time": "2025-11-19T12:00:00.000Z" }

GET /jobs

Returns merged normalized job array:

json

[
  {
    "id": "...",
    "title": "Software Engineer",
    "company": "Example",
    "location": "Remote",
    "source": "ArbeitNow"
  }
]

## 🛠 Setup Instructions

**Backend**

cd server
npm install
npm start


**Frontend**

cd frontend
npm install
npm run dev


🚀 Deployment

Frontend → Vercel

Backend → Render

Add UptimeRobot ping to prevent backend sleep




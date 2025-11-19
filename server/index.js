// server/index.js
// Pure Node backend using Express — No Vercel issues

const express = require('express');
const fetch = (...args) => import('node-fetch').then(m => m.default(...args));
const cors = require('cors');

const app = express();
app.use(cors());

const ARBEIT_URL = 'https://www.arbeitnow.com/api/job-board-api';
const MUSE_URL = 'https://www.themuse.com/api/public/jobs?page=1';

// simple in-memory cache for combined jobs
let jobsCache = { data: null, expiresAt: 0 };
const CACHE_MS = 5 * 60 * 1000; // 5 minutes

function stripHTML(str) {
  return (str || "").replace(/<[^>]+>/g, "").slice(0, 500);
}

function normalizeDate(d) {
  if (!d) return null;
  if (typeof d === "number") {
    // handle unix seconds vs ms
    if (d < 1e12) return new Date(d * 1000).toISOString();
    return new Date(d).toISOString();
  }
  try { return new Date(d).toISOString(); } catch { return null; }
}

// ArbeitNow fetch
async function fetchArbeitNow() {
  try {
    const res = await fetch(ARBEIT_URL);
    const json = await res.json();
    const arr = json.data || [];
    return arr.map((j, i) => ({
      id: j.slug || `arbeit-${i}`,
      title: j.title,
      company: j.company_name || j.company || "",
      location: j.location || "Remote",
      url: j.url,
      description: stripHTML(j.description),
      date: normalizeDate(j.created_at),
      source: "ArbeitNow"
    }));
  } catch (err) {
    console.log("ArbeitNow error:", err && err.message ? err.message : err);
    return [];
  }
}

// TheMuse fetch
async function fetchTheMuse() {
  try {
    const res = await fetch(MUSE_URL);
    const json = await res.json();
    const arr = json.results || [];
    return arr.map((j, i) => ({
      id: j.id || `muse-${i}`,
      title: j.name || j.title,
      company: j.company?.name || "",
      location: j.locations?.map(x => x.name).join(", ") || "Unknown",
      url: j.refs?.landing_page || "",
      description: stripHTML(j.contents),
      date: normalizeDate(j.publication_date),
      source: "TheMuse"
    }));
  } catch (err) {
    console.log("TheMuse error:", err && err.message ? err.message : err);
    return [];
  }
}

// Combined fetch with server-side caching
async function getCombinedJobs() {
  const now = Date.now();
  if (jobsCache.data && now < jobsCache.expiresAt) {
    // return cached copy
    console.log(`[jobs cache] hit — items=${jobsCache.data.length}`);
    return jobsCache.data;
  }

  console.log("[jobs cache] miss — fetching external APIs");
  const [arbeit, muse] = await Promise.all([fetchArbeitNow(), fetchTheMuse()]);
  let jobs = [...arbeit, ...muse];

  // sort newest first
  jobs.sort((a, b) => {
    const da = a.date ? new Date(a.date).getTime() : 0;
    const db = b.date ? new Date(b.date).getTime() : 0;
    return db - da;
  });

  // fallback if empty
  if (!jobs || jobs.length === 0) {
    jobs = [{
      id: "fallback",
      title: "No jobs",
      company: "N/A",
      location: "N/A",
      description: "No jobs available right now",
      date: new Date().toISOString(),
      source: "Fallback"
    }];
  }

  jobsCache = {
    data: jobs,
    expiresAt: now + CACHE_MS
  };

  console.log(`[jobs cache] stored — items=${jobs.length} expiresInMs=${CACHE_MS}`);
  return jobs;
}

// Health endpoint — good for pingers / keepalive
app.get("/", (req, res) => {
  res.set("Cache-Control", "no-store");
  res.json({ ok: true, time: new Date().toISOString() });
});

app.get('/jobs', async (req, res) => {
  // Prevent browser caching of the /jobs response
  res.set("Cache-Control", "no-store");

  try {
    const jobs = await getCombinedJobs();
    res.json(jobs);
  } catch (err) {
    console.error("[/jobs] error:", err && err.message ? err.message : err);
    // Return fallback to ensure frontend always gets a valid array
    res.json([{
      id: "error",
      title: "Service temporarily unavailable",
      company: "N/A",
      location: "N/A",
      description: "Unable to load jobs at the moment.",
      date: new Date().toISOString(),
      source: "Error"
    }]);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});

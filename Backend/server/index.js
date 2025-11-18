// server/index.js
// Pure Node backend using Express — No Vercel issues

const express = require('express');
const fetch = (...args) => import('node-fetch').then(m => m.default(...args));
const cors = require('cors');

const app = express();
app.use(cors());

const ARBEIT_URL = 'https://www.arbeitnow.com/api/job-board-api';
const MUSE_URL = 'https://www.themuse.com/api/public/jobs?page=1';

function stripHTML(str) {
  return (str || "").replace(/<[^>]+>/g, "").slice(0, 500);
}

function normalizeDate(d) {
  if (!d) return null;
  if (typeof d === "number") {
    if (d < 1e12) return new Date(d * 1000).toISOString();
    return new Date(d).toISOString();
  }a
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
    console.log("ArbeitNow error:", err.message);
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
    console.log("TheMuse error:", err.message);
    return [];
  }
}

app.get('/jobs', async (req, res) => {
  const [arbeit, muse] = await Promise.all([
    fetchArbeitNow(), fetchTheMuse()
  ]);

  let jobs = [...arbeit, ...muse];

  if (jobs.length === 0) {
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

  res.json(jobs);
});

// app.listen(5000, () => {
//   console.log("Backend running at http://localhost:5000");
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});


// src/utils/api.js
import axios from "axios";

// keep this WITHOUT trailing slash
const API_URL = import.meta.env.VITE_API_URL || "https://job-postings.onrender.com";

export async function fetchJobs() {
  try {
    // use URL() to avoid accidental double-slashes
    const url = new URL("/jobs", API_URL).toString();
    console.info("[API] Calling:", url);

    const res = await axios.get(url, { timeout: 15000 });

    console.info("[API] full response:", res);
    const data = res?.data;

    // normalization so front-end never breaks
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    if (data && Array.isArray(data.jobs)) return data.jobs;
    if (data && typeof data === "object") {
      const arr = Object.values(data).find(v => Array.isArray(v));
      if (arr) return arr;
    }

    console.warn("[API] fetchJobs: response not an array, returning []");
    return [];
  } catch (err) {
    console.error("[API ERROR] fetchJobs:", err && err.message ? err.message : err);
    return [];
  }
}
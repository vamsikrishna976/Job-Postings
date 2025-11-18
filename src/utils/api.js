import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "https://job-postings.onrender.com";

export async function fetchJobs() {
  try {
    const url = `${API_URL}/jobs`;
    // keep logs small; esbuild/Vite will handle them
    console.info("[API] Calling:", url);
    const res = await axios.get(url, { timeout: 15000 });

    // normalize common payload shapes into an array
    const data = res && res.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    if (data && Array.isArray(data.jobs)) return data.jobs;
    if (data && typeof data === "object") {
      const arr = Object.values(data).find(v => Array.isArray(v));
      if (arr) return arr;
    }

    return [];
  } catch (err) {
    console.error("[API ERROR] fetchJobs:", err && err.message ? err.message : err);
    return [];
  }
}

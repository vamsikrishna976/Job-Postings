// src/utils/api.js
import axios from "axios";

// keep this WITHOUT trailing slash
const API_URL = import.meta.env.VITE_API_URL || "https://job-postings.onrender.com";

/**
 * fetchJobs(source)
 * - source: optional string ('both' | 'arbeitnow' | 'remotive' etc.)
 * - returns: Array of job objects (never undefined)
 */
export async function fetchJobs(source = "both") {
  const attempts = 3;
  const baseDelayMs = 600;

  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      // Build URL with optional source query param
      const url = new URL("/jobs", API_URL);
      if (source && source !== "both") url.searchParams.set("source", source);

      // Add a cache-buster on retries to force fresh responses
      if (attempt > 0) url.searchParams.set("_t", String(Date.now()));

      const urlStr = url.toString();
      console.info(`[API] Calling (attempt ${attempt + 1}/${attempts}):`, urlStr);

      const res = await axios.get(urlStr, {
        timeout: 15000,
        headers: {
          // request-side hint — server needs to return no-store for full effect
          "Cache-Control": "no-store",
        },
        // Optionally skip any axios caching layers (axios has none by default)
        // validateStatus: status => status >= 200 && status < 500
      });

      console.info("[API] full response:", res && { status: res.status, dataShape: Array.isArray(res.data) ? "Array" : typeof res.data });

      const data = res?.data;

      // normalization so front-end never breaks
      let payload = [];
      if (Array.isArray(data)) payload = data;
      else if (data && Array.isArray(data.data)) payload = data.data;
      else if (data && Array.isArray(data.jobs)) payload = data.jobs;
      else if (data && typeof data === "object") {
        const arr = Object.values(data).find(v => Array.isArray(v));
        if (arr) payload = arr;
      }

      // if we got items, return immediately
      if (payload.length > 0) {
        console.info(`[API] fetchJobs succeeded (attempt ${attempt + 1}), items=${payload.length}`);
        return payload;
      }

      // payload empty — warn and retry
      console.warn(`[API] fetchJobs: empty payload on attempt ${attempt + 1}`);
    } catch (err) {
      // if last attempt, rethrow/log and return empty below
      console.warn(`[API ERROR] fetchJobs attempt ${attempt + 1}:`, err && err.message ? err.message : err);
      if (attempt === attempts - 1) {
        console.error("[API ERROR] fetchJobs: final attempt failed");
      }
    }

    // backoff delay before next attempt
    await new Promise(r => setTimeout(r, baseDelayMs * (attempt + 1)));
  }

  // after retries, return empty array so UI can handle gracefully
  console.warn("[API] fetchJobs: returning [] after retries");
  return [];
}

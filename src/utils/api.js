// src/utils/api.js
import axios from 'axios';

// prefer env, but force https fallback (production must be https)
const BASE = (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.startsWith('http'))
  ? import.meta.env.VITE_API_URL
  : 'https://job-postings.onrender.com';

export async function fetchJobs(source = 'both') {
  const res = await axios.get(${BASE}/jobs);
  return res.data || [];
}
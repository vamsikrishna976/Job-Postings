import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function fetchJobs(source = "both") {
  const res = await axios.get(`${BASE}/jobs`);
  return res.data || [];
}
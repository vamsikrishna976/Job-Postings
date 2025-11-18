// api/jobs.js
// Robust multi-source job proxy: ArbeitNow + TheMuse (Remotive optional)
// Returns normalized job objects, cached in-memory (dev)

const fetch = (...args) => import('node-fetch').then(m => m.default(...args));

const ARBEIT_URL = 'https://www.arbeitnow.com/api/job-board-api';
const MUSE_URL = 'https://www.themuse.com/api/public/jobs?page=1';
const TTL = 60 * 1000; // 1 minute cache

const CACHE = global.__JOB_CACHE || (global.__JOB_CACHE = {});

function normalizeDate(d) {
  if (!d) return null;
  // many sources use unix timestamp numbers or ISO strings
  if (typeof d === 'number') {
    // ArbeitNow gave created_at as unix seconds in your sample
    // if it's seconds, convert to ms
    if (d < 1e12) return new Date(d * 1000).toISOString();
    return new Date(d).toISOString();
  }
  try { return new Date(d).toISOString(); } catch { return null; }
}

async function fetchArbeitNow() {
  try {
    const res = await fetch(ARBEIT_URL);
    if (!res.ok) throw new Error(`ArbeitNow: ${res.status}`);
    const json = await res.json();
    const arr = json.data || json.jobs || [];
    const jobs = (arr || []).map((j, i) => ({
      id: j.slug || j.id || `arbeit-${i}`,
      title: j.title || j.position || '',
      company: j.company_name || j.company || (j.company && j.company.name) || '',
      location: j.location || j.city || (j.remote ? 'Remote' : '') || 'Remote',
      url: j.url || j.apply_url || '',
      description: (j.description || j.contents || '').replace(/<[^>]+>/g, '').slice(0, 800),
      date: normalizeDate(j.created_at || j.publication_date || j.date || j.created_at),
      source: 'ArbeitNow'
    }));
    console.log(`[api] ArbeitNow returned ${jobs.length}`);
    return jobs;
  } catch (err) {
    console.error('[api] ArbeitNow error:', err && err.message ? err.message : err);
    return [];
  }
}

async function fetchTheMuse() {
  try {
    const res = await fetch(MUSE_URL);
    if (!res.ok) throw new Error(`TheMuse: ${res.status}`);
    const json = await res.json();
    const arr = json.results || json || [];
    const jobs = (arr || []).map((j, i) => ({
      id: j.id || `muse-${i}`,
      title: j.name || j.title || '',
      company: (j.company && j.company.name) || j.organization || '',
      location: (j.locations && j.locations.length) ? j.locations.map(l => l.name).join(', ') : 'Not specified',
      url: (j.refs && j.refs.landing_page) || '',
      description: (j.contents || '').replace(/<[^>]+>/g, '').slice(0, 800),
      date: normalizeDate(j.publication_date || j.posted_at),
      source: 'TheMuse'
    }));
    console.log(`[api] TheMuse returned ${jobs.length}`);
    return jobs;
  } catch (err) {
    console.error('[api] TheMuse error:', err && err.message ? err.message : err);
    return [];
  }
}

module.exports = async (req, res) => {
  try {
    const key = 'jobs:combined';
    const now = Date.now();
    if (CACHE[key] && (now - CACHE[key].ts) < TTL) {
      res.setHeader('x-cache', 'HIT');
      return res.json(CACHE[key].data);
    }

    // Fetch both in parallel
    const [arbeitRes, museRes] = await Promise.allSettled([fetchArbeitNow(), fetchTheMuse()]);
    let jobs = [];
    if (arbeitRes.status === 'fulfilled' && Array.isArray(arbeitRes.value)) jobs = jobs.concat(arbeitRes.value);
    if (museRes.status === 'fulfilled' && Array.isArray(museRes.value)) jobs = jobs.concat(museRes.value);

    // dedupe by id (simple)
    const seen = new Map();
    const deduped = [];
    jobs.forEach(j => {
      const keyId = j.id || (j.title + '|' + j.company);
      if (!seen.has(keyId)) {
        seen.set(keyId, true);
        deduped.push(j);
      }
    });

    // sort newest first (if date available)
    deduped.sort((a, b) => {
      const da = a.date ? Date.parse(a.date) : 0;
      const db = b.date ? Date.parse(b.date) : 0;
      return db - da;
    });

    console.log(`[api] Combined jobs after dedupe: ${deduped.length}`);

    // fallback if empty
    const out = (deduped.length === 0) ? [{
      id: 'fallback-1',
      title: 'No Jobs Found Right Now',
      company: 'Job Portal',
      location: 'N/A',
      url: '',
      description: 'No jobs available from external sources at the moment. Try again later.',
      date: new Date().toISOString(),
      source: 'Fallback'
    }] : deduped;

    CACHE[key] = { ts: now, data: out };
    res.setHeader('x-cache', 'MISS');
    res.setHeader('cache-control', 'public, max-age=60');
    return res.json(out);
  } catch (err) {
    console.error('[api] unexpected error:', err && err.message ? err.message : err);
    res.statusCode = 502;
    return res.json({ error: err && err.message ? err.message : String(err) });
  }
};

import React, {useEffect, useState, useMemo} from 'react'
import { Analytics } from "@vercel/analytics/next"
import Header from './components/Header'
import JobCard from './components/JobCard'
import Pagination from './components/Pagination'
import { fetchJobs } from './utils/api'
import dayjs from 'dayjs'

export default function App(){
  const [source, setSource] = useState('both')
  const [keyword, setKeyword] = useState('')
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(9)
  const [theme, setTheme] = useState('dark')

  useEffect(()=>{
    document.documentElement.classList.toggle('light', theme === 'light')
  }, [theme])

  useEffect(()=>{ loadJobs() }, [source])

  async function loadJobs(){
    setLoading(true)
    try{
      const data = await fetchJobs(source)
      const normalized = (data || []).map(j=> ({...j, parsedDate: j.date ? new Date(j.date).toISOString() : null}))
      normalized.sort((a,b)=> (new Date(b.parsedDate||0) - new Date(a.parsedDate||0)))
      setJobs(normalized)
      setPage(1)
    }catch(e){
      console.error(e)
      setJobs([])
    }finally{ setLoading(false) }
  }

  const [filterToday, setFilterToday] = useState(false)

  const filtered = useMemo(()=> {
    const kw = keyword.trim().toLowerCase()
    return jobs.filter(j=>{
      if(filterToday){
        if(!j.parsedDate) return false
        if(!dayjs(j.parsedDate).isSame(dayjs(), 'day')) return false
      }
      if(!kw) return true
      return (j.title||'').toLowerCase().includes(kw) || (j.company||'').toLowerCase().includes(kw) || (j.description||'').toLowerCase().includes(kw)
    })
  }, [jobs, keyword, filterToday])

  const pages = Math.max(1, Math.ceil(filtered.length / perPage))
  const visible = filtered.slice((page-1)*perPage, (page-1)*perPage + perPage)

  return (
    <div className="min-h-screen p-6 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-6xl mx-auto">
        <Header
          source={source} setSource={setSource}
          keyword={keyword} setKeyword={setKeyword}
          onRefresh={loadJobs}
          theme={theme} toggleTheme={()=>setTheme(t=> t==='dark'?'light':'dark')}
          filterToday={filterToday} setFilterToday={setFilterToday}
        />

        <main className="mt-6">
          <div className="flex items-center justify-between">
            <div className="text-slate-400">Results: <span className="font-medium text-slate-100">{filtered.length}</span></div>
            <div className="flex items-center gap-3">
              <label className="text-sm text-slate-400 flex items-center gap-2">
                <input type="checkbox" checked={filterToday} onChange={e=>setFilterToday(e.target.checked)} />
                <span>Only Today</span>
              </label>
              <select value={perPage} onChange={e=>setPerPage(Number(e.target.value))} className="bg-slate-800 px-2 py-1 rounded">
                <option value={6}>6 / page</option>
                <option value={9}>9 / page</option>
                <option value={12}>12 / page</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="mt-6 text-slate-400">Loading jobs…</div>
          ) : null}

          {!loading && visible.length === 0 ? (
            <div className="mt-6 p-6 rounded border border-dashed border-slate-700 text-slate-400">No jobs found. Try changing source, keyword or turn off the 'Only Today' filter.</div>
          ) : null}

          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {visible.map(j=> <JobCard key={j.id} job={j} />)}
          </section>

          <div className="mt-6">
            <Pagination page={page} setPage={setPage} pages={pages} />
          </div>
        </main>

        <footer className="mt-12 text-slate-500 text-sm">
          Built with Remotive & ArbeitNow.
        </footer>
      </div>
    </div>
  )
}

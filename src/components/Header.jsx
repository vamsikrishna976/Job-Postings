import React from 'react'

export default function Header({onRefresh, source, setSource, keyword, setKeyword, theme, toggleTheme, filterToday, setFilterToday}){
  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold">Jobs Portal</h1>
        <p className="text-slate-400 mt-1">Latest job postings </p>
      </div>

      <div className="flex gap-2 items-center w-full sm:w-auto">
        <select value={source} onChange={e=>setSource(e.target.value)} className="bg-slate-800 px-3 py-2 rounded">
          <option value="both">Both</option>
          <option value="remotive">Remote</option>
          <option value="arbeitnow">Hybrid</option>
        </select>

        <input value={keyword} onChange={e=>setKeyword(e.target.value)} placeholder="Search (frontend, backend, react...)" className="flex-1 sm:flex-none min-w-0 bg-slate-800 px-3 py-2 rounded" />

        <button onClick={onRefresh} className="px-3 py-2 rounded bg-emerald-400 text-slate-900 font-semibold">Refresh</button>

        <button onClick={toggleTheme} title="Toggle theme" className="px-2 py-2 rounded bg-slate-800" aria-label="toggle theme">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  )
}

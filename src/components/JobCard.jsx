import React from 'react'

export default function JobCard({job}){
  return (
    <article className="bg-gradient-to-b from-slate-800 to-slate-900 p-4 rounded-lg shadow ring-1 ring-slate-700">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs text-slate-400">{job.source} • {job.location || 'Remote'}</div>
          <h3 className="text-lg font-semibold mt-1">{job.title}</h3>
          <div className="text-sm text-slate-300">{job.company || 'Unknown company'}</div>
        </div>
        <div className="text-xs text-slate-400">{job.parsedDate ? new Date(job.parsedDate).toLocaleDateString() : '—'}</div>
      </div>

      <p className="text-slate-400 mt-3 text-sm line-clamp-4">{job.description}</p>

      <div className="mt-4 flex items-center justify-between">
        <a className="px-3 py-1 rounded border border-slate-700" href={job.url || '#'} target="_blank" rel="noreferrer">View Job</a>
        <div className="text-xs text-slate-500">{job.location ? job.location : 'Remote'}</div>
      </div>
    </article>
  )
}

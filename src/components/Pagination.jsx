import React from 'react'
export default function Pagination({page, setPage, pages}){
  return (
    <div className="flex items-center justify-center gap-2">
      <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="px-3 py-1 bg-slate-800 rounded">Prev</button>
      <div className="px-3 py-1 bg-slate-800 rounded">{page} / {pages}</div>
      <button onClick={()=>setPage(p=>Math.min(pages,p+1))} disabled={page===pages} className="px-3 py-1 bg-slate-800 rounded">Next</button>
    </div>
  )
}

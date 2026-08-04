import { useEffect, useState } from 'react'

function App() {
  const [status, setStatus] = useState('Connecting to backend...')

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/health')
      .then((res) => res.json())
      .then((data) => setStatus(data.message))
      .catch(() => setStatus('Backend connection failed!'))
  }, [])

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl space-y-4">
        <h1 className="text-2xl font-bold text-indigo-400">Booksy Hardware Hub</h1>
        <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-700/50">
          <p className="text-sm text-slate-400 mb-1">System Status</p>
          <p className="text-lg font-semibold text-emerald-400">{status}</p>
        </div>
      </div>
    </div>
  )
}

export default App
import React from "react"
import Link from "next/link"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-black text-slate-200 selection:bg-indigo-500/30">
      
      {/* Glassmorphic Sidebar */}
      <aside className="w-64 flex flex-col border-r border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <span className="text-xl font-bold tracking-tighter text-white">Veri<span className="text-indigo-400">Field</span></span>
          <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-white/10 text-white/70">SUPER</span>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            Dashboard
          </Link>
          <Link href="/map" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            Live Map
          </Link>
          <Link href="/tenants" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)] transition-all">
            Tenants & Config
          </Link>
          <Link href="/audit-log" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            Audit Trail
          </Link>
        </nav>
        
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white shadow-lg">
              SA
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">Super Admin</span>
              <span className="text-xs text-slate-500">System Owner</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Subtle Ambient Background Glows */}
        <div className="absolute top-0 left-0 w-full h-[500px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />
        
        <header className="h-16 flex items-center px-8 border-b border-white/10 bg-black/40 backdrop-blur-md z-10 sticky top-0">
          <h1 className="text-lg font-semibold text-white">Tenant Management</h1>
        </header>

        <div className="flex-1 overflow-auto p-8 z-10">
          {children}
        </div>
      </main>
    </div>
  )
}

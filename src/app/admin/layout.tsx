import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950">
      <header className="bg-gray-900 border-b border-gray-800 px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-sm">Q</span>
              </div>
              <span className="text-white font-bold hidden md:block">QueueFlow</span>
            </a>
            <nav className="flex gap-1">
              {[
                { href: "/admin", label: "📊 Dashboard" },
                { href: "/admin/reservations", label: "📋 การจอง" },
                { href: "/admin/tables", label: "🪑 โต๊ะ" },
              ].map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="text-gray-400 hover:text-white hover:bg-gray-800 px-3 py-2 rounded-lg text-sm transition"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
          <Link
            href="/booking"
            target="_blank"
            className="text-xs bg-violet-600 text-white px-3 py-1.5 rounded-lg hover:bg-violet-500 transition"
          >
            หน้าจอง ↗
          </Link>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">{children}</main>
    </div>
  );
}
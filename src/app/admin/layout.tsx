import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-stone-100">
      <header className="bg-stone-800 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 className="font-semibold">QueueFlow Admin</h1>
          <nav className="flex gap-4 text-sm">
            <Link href="/admin" className="text-stone-300 hover:text-white transition">
              Dashboard
            </Link>
            <Link href="/admin/reservations" className="text-stone-300 hover:text-white transition">
              การจอง
            </Link>
            <Link href="/admin/tables" className="text-stone-300 hover:text-white transition">
              โต๊ะ
            </Link>
          </nav>
        </div>
        <Link href="/" className="text-sm text-stone-400 hover:text-white transition">
          ออกจากระบบ
        </Link>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-stone-800 mb-4">QueueFlow</h1>
        <p className="text-stone-500 mb-8">ระบบจองโต๊ะร้านอาหารออนไลน์</p>
        <Link
          href="/booking"
          className="bg-stone-800 text-white px-8 py-3 rounded-lg hover:bg-stone-700 transition"
        >
          จองโต๊ะเลย
        </Link>
      </div>
    </main>
  );
}
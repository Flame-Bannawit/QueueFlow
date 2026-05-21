import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 md:px-12">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-violet-600 font-black text-sm">Q</span>
          </div>
          <span className="text-white font-bold text-lg">QueueFlow</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="text-white/70 hover:text-white text-sm transition"
          >
            Admin
          </Link>
          <Link
            href="/booking"
            className="bg-white text-violet-600 px-4 py-2 rounded-full text-sm font-semibold hover:bg-violet-50 transition"
          >
            จองโต๊ะ
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 pt-16 pb-24 md:pt-24">
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          <span className="text-white/90 text-xs font-medium">พร้อมรับการจองแล้ววันนี้</span>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight">
          จองโต๊ะง่ายๆ
          <br />
          <span className="text-yellow-300">ไม่ต้องรอคิว</span>
        </h1>

        <p className="text-white/70 text-lg md:text-xl max-w-xl mb-10 leading-relaxed">
          ระบบจองโต๊ะออนไลน์ที่ทันสมัย เลือกโต๊ะ เลือกเวลา
          ชำระมัดจำผ่าน Stripe ได้เลยครับ
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/booking"
            className="bg-yellow-300 text-gray-900 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-yellow-200 transition shadow-lg shadow-yellow-300/30"
          >
            จองโต๊ะเลย 🍽️
          </Link>
          <Link
            href="/admin"
            className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white/20 transition"
          >
            เข้าสู่ Admin
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 md:px-12 pb-24">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: "🪑",
              title: "เลือกโต๊ะได้เอง",
              desc: "ดูโต๊ะว่างแบบ Real-time แยกตาม Zone เลือกได้ตามใจ",
            },
            {
              icon: "💳",
              title: "ชำระมัดจำปลอดภัย",
              desc: "ชำระผ่าน Stripe มาตรฐาน PCI DSS รองรับทุกบัตร",
            },
            {
              icon: "✅",
              title: "ยืนยันอัตโนมัติ",
              desc: "รับ Email ยืนยันทันทีหลังชำระ พร้อมรหัสการจอง",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition"
            >
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 md:px-12 pb-24">
        <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8">
          <div className="grid grid-cols-3 gap-6 text-center">
            {[
              { value: "10+", label: "โต๊ะพร้อมให้จอง" },
              { value: "5", label: "โซนนั่งให้เลือก" },
              { value: "24/7", label: "จองได้ตลอดเวลา" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-3xl md:text-4xl font-black text-yellow-300 mb-1">
                  {s.value}
                </div>
                <div className="text-white/60 text-xs md:text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
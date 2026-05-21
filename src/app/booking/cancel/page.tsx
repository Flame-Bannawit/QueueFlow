import Link from "next/link";

export default function CancelPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-900 rounded-3xl p-8 border border-gray-800 text-center">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">❌</span>
          </div>

          <h1 className="text-white font-black text-2xl md:text-3xl mb-2">
            ยกเลิกการชำระเงิน
          </h1>
          <p className="text-gray-400 text-sm mb-8">
            การจองยังไม่สมบูรณ์ครับ กรุณาลองใหม่อีกครั้ง
          </p>

          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-8">
            <p className="text-red-400 text-sm">
              โต๊ะที่คุณเลือกยังไม่ถูกจอง สามารถกลับไปจองใหม่ได้เลยครับ
            </p>
          </div>

          <Link
            href="/booking"
            className="block w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white py-3.5 rounded-2xl font-bold hover:from-violet-500 hover:to-purple-500 transition"
          >
            กลับไปจองใหม่
          </Link>
          <Link
            href="/"
            className="block w-full mt-3 bg-gray-800 text-gray-300 py-3.5 rounded-2xl font-medium hover:bg-gray-700 transition text-sm"
          >
            กลับหน้าแรก
          </Link>
        </div>
      </div>
    </div>
  );
}
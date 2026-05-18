import Link from "next/link";

export default function CancelPage() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm p-10 max-w-md w-full text-center">
        <div className="text-5xl mb-4">❌</div>
        <h1 className="text-2xl font-bold text-stone-800 mb-2">ยกเลิกการชำระเงิน</h1>
        <p className="text-stone-500 mb-8">
          การจองยังไม่สมบูรณ์ กรุณาลองใหม่อีกครั้งครับ
        </p>

        <Link
          href="/booking"
          className="block w-full bg-stone-800 text-white py-3 rounded-xl text-sm hover:bg-stone-700 transition"
        >
          กลับไปจองใหม่
        </Link>
      </div>
    </div>
  );
}
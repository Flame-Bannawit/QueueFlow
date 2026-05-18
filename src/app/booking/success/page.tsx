import Link from "next/link";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm p-10 max-w-md w-full text-center">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-stone-800 mb-2">จองสำเร็จแล้ว!</h1>
        <p className="text-stone-500 mb-6">
          ระบบส่งอีเมลยืนยันให้คุณแล้วครับ
        </p>

        {ref && (
          <div className="bg-stone-100 rounded-xl p-4 mb-6">
            <p className="text-xs text-stone-400 uppercase tracking-wide mb-1">
              รหัสการจอง
            </p>
            <p className="text-xl font-bold text-stone-800 tracking-wider">{ref}</p>
          </div>
        )}

        <p className="text-sm text-stone-400 mb-8 leading-relaxed">
          กรุณาแสดงรหัสนี้เมื่อมาถึงร้าน
          <br />
          หากต้องการยกเลิก กรุณาแจ้งล่วงหน้า 24 ชั่วโมง
        </p>

        <Link
          href="/booking"
          className="block w-full bg-stone-800 text-white py-3 rounded-xl text-sm hover:bg-stone-700 transition"
        >
          จองโต๊ะอีกครั้ง
        </Link>
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";

interface Stats {
  totalToday: number;
  confirmedToday: number;
  pendingToday: number;
  seatedToday: number;
  depositToday: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats);
  }, []);

  const cards = stats
    ? [
        { label: "การจองวันนี้", value: stats.totalToday, color: "bg-stone-800" },
        { label: "ยืนยันแล้ว", value: stats.confirmedToday, color: "bg-green-700" },
        { label: "รอยืนยัน", value: stats.pendingToday, color: "bg-amber-600" },
        { label: "กำลังนั่ง", value: stats.seatedToday, color: "bg-blue-700" },
        {
          label: "มัดจำรวม",
          value: `฿${stats.depositToday.toLocaleString()}`,
          color: "bg-purple-700",
        },
      ]
    : [];

  return (
    <div>
      <h2 className="text-xl font-semibold text-stone-800 mb-6">
        Dashboard — วันนี้
      </h2>

      {stats ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {cards.map((c) => (
            <div key={c.label} className={`${c.color} text-white rounded-xl p-5`}>
              <p className="text-xs opacity-70 uppercase tracking-wide mb-1">
                {c.label}
              </p>
              <p className="text-3xl font-bold">{c.value}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-stone-400 mb-8">กำลังโหลด...</div>
      )}

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold text-stone-800 mb-2">ลิงก์ด่วน</h3>
        <div className="flex gap-3">
          <a
            href="/admin/reservations"
            className="bg-stone-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-stone-700 transition"
          >
            ดูรายการจองทั้งหมด →
          </a>
          <a
            href="/booking"
            target="_blank"
            className="border border-stone-300 text-stone-700 px-4 py-2 rounded-lg text-sm hover:bg-stone-50 transition"
          >
            เปิดหน้าจองโต๊ะ ↗
          </a>
        </div>
      </div>
    </div>
  );
}
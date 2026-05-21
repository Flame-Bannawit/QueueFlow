"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
    fetch("/api/admin/stats").then((r) => r.json()).then(setStats);
  }, []);

  const cards = stats ? [
    { label: "การจองวันนี้", value: stats.totalToday, icon: "📅", color: "from-violet-600 to-purple-600", text: "text-violet-200" },
    { label: "ยืนยันแล้ว", value: stats.confirmedToday, icon: "✅", color: "from-green-600 to-emerald-600", text: "text-green-200" },
    { label: "รอยืนยัน", value: stats.pendingToday, icon: "⏳", color: "from-amber-500 to-orange-500", text: "text-amber-200" },
    { label: "กำลังนั่ง", value: stats.seatedToday, icon: "🪑", color: "from-blue-600 to-cyan-600", text: "text-blue-200" },
    { label: "มัดจำรวม", value: `฿${stats.depositToday.toLocaleString()}`, icon: "💰", color: "from-pink-600 to-rose-600", text: "text-pink-200" },
  ] : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-white font-black text-2xl md:text-3xl">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            {new Date().toLocaleDateString("th-TH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <button
          onClick={() => fetch("/api/admin/stats").then((r) => r.json()).then(setStats)}
          className="bg-gray-800 text-gray-400 hover:text-white px-4 py-2 rounded-xl text-sm transition border border-gray-700"
        >
          🔄 รีเฟรช
        </button>
      </div>

      {stats ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {cards.map((c) => (
            <div key={c.label} className={`bg-gradient-to-br ${c.color} rounded-2xl p-5`}>
              <div className="text-2xl mb-2">{c.icon}</div>
              <div className={`text-xs font-medium mb-1 ${c.text} opacity-80`}>{c.label}</div>
              <div className="text-white font-black text-2xl">{c.value}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-2xl p-5 animate-pulse h-28" />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { href: "/admin/reservations", icon: "📋", title: "รายการจอง", desc: "ดูและจัดการการจองทั้งหมด", color: "hover:border-violet-500" },
          { href: "/admin/tables", icon: "🪑", title: "จัดการโต๊ะ", desc: "เปิด-ปิด แก้ไขโต๊ะ", color: "hover:border-green-500" },
          { href: "/booking", icon: "🔗", title: "หน้าจองโต๊ะ", desc: "เปิดหน้าลูกค้า", color: "hover:border-blue-500", target: "_blank" },
        ].map((card) => (
          <Link
            key={card.href}
            href={card.href}
            target={card.target}
            className={`bg-gray-900 border border-gray-800 ${card.color} rounded-2xl p-6 transition group`}
          >
            <div className="text-3xl mb-3">{card.icon}</div>
            <div className="text-white font-bold mb-1 group-hover:text-violet-400 transition">{card.title}</div>
            <div className="text-gray-500 text-sm">{card.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import { TIME_SLOTS, ZONES, DEPOSIT_PER_PERSON } from "@/lib/constants";
import { Table } from "@/types";

type Step = 1 | 2 | 3;

export default function BookingPage() {
  const [step, setStep] = useState<Step>(1);
  const [date, setDate] = useState("");
  const [time, setTime] = useState(TIME_SLOTS[4]);
  const [partySize, setPartySize] = useState(2);
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [zone, setZone] = useState("ทั้งหมด");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialRequests: "",
    occasion: "",
  });

  const today = new Date().toISOString().split("T")[0];
  const deposit = partySize * DEPOSIT_PER_PERSON;

  const searchTables = async () => {
    if (!date) return alert("กรุณาเลือกวันที่");
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/tables?date=${date}&time=${time}&partySize=${partySize}`);
      const data = await res.json();
      setTables(data.tables);
      setSelectedTable(null);
    } catch {
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  };

  const filteredTables = zone === "ทั้งหมด" ? tables : tables.filter((t) => t.zone === zone);

  const handleSubmit = async () => {
    if (!selectedTable) return;
    if (!form.firstName || !form.email || !form.phone) return alert("กรุณากรอกข้อมูลให้ครบ");
    setLoading(true);
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId: selectedTable.id,
          ...form,
          reservationDate: date,
          reservationTime: time,
          partySize,
        }),
      });
      const data = await res.json();
      if (!res.ok) return alert(data.error);
      window.location.href = data.stripeUrl;
    } catch {
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  };

  const zoneColors: Record<string, string> = {
    Window: "bg-blue-500",
    Garden: "bg-green-500",
    Main: "bg-violet-500",
    Private: "bg-pink-500",
    Banquet: "bg-orange-500",
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-4 md:px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm">Q</span>
            </div>
            <span className="text-white font-bold">QueueFlow</span>
          </a>
          {/* Steps */}
          <div className="hidden md:flex items-center gap-2">
            {[
              { n: 1, label: "เลือกโต๊ะ" },
              { n: 2, label: "ข้อมูล" },
              { n: 3, label: "ชำระเงิน" },
            ].map((s, i) => (
              <div key={s.n} className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition
                  ${step === s.n ? "bg-violet-600 text-white" : step > s.n ? "bg-green-600 text-white" : "bg-gray-800 text-gray-400"}`}>
                  <span>{step > s.n ? "✓" : s.n}</span>
                  <span>{s.label}</span>
                </div>
                {i < 2 && <div className="w-6 h-px bg-gray-700" />}
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <div>
                {/* Search Card */}
                <div className="bg-gray-900 rounded-2xl p-6 mb-6 border border-gray-800">
                  <h2 className="text-white font-bold text-xl mb-5">🔍 ค้นหาโต๊ะว่าง</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="col-span-2 md:col-span-1">
                      <label className="text-gray-400 text-xs uppercase tracking-wide block mb-1.5">วันที่</label>
                      <input
                        type="date"
                        min={today}
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs uppercase tracking-wide block mb-1.5">เวลา</label>
                      <select
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                      >
                        {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs uppercase tracking-wide block mb-1.5">จำนวน</label>
                      <select
                        value={partySize}
                        onChange={(e) => setPartySize(Number(e.target.value))}
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                      >
                        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                          <option key={n} value={n}>{n} ท่าน</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={searchTables}
                        disabled={loading}
                        className="w-full bg-violet-600 hover:bg-violet-500 text-white py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50"
                      >
                        {loading ? "⏳ ค้นหา..." : "ค้นหา"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Zone Filter */}
                {tables.length > 0 && (
                  <div className="flex gap-2 mb-5 flex-wrap">
                    {["ทั้งหมด", ...ZONES].map((z) => (
                      <button
                        key={z}
                        onClick={() => setZone(z)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition
                          ${zone === z ? "bg-violet-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white border border-gray-700"}`}
                      >
                        {z}
                      </button>
                    ))}
                  </div>
                )}

                {/* Tables Grid */}
                {loading ? (
                  <div className="text-center py-16 text-gray-500">กำลังค้นหา...</div>
                ) : filteredTables.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {filteredTables.map((table) => (
                      <div
                        key={table.id}
                        onClick={() => setSelectedTable(table)}
                        className={`relative bg-gray-900 rounded-2xl p-5 cursor-pointer border-2 transition
                          ${selectedTable?.id === table.id
                            ? "border-violet-500 bg-violet-950"
                            : "border-gray-800 hover:border-gray-600"}`}
                      >
                        <div className={`inline-block px-2 py-0.5 rounded-full text-white text-xs font-medium mb-3 ${zoneColors[table.zone] || "bg-gray-600"}`}>
                          {table.zone}
                        </div>
                        <div className="text-white font-bold text-lg mb-1">{table.displayName}</div>
                        <div className="text-gray-400 text-sm">🪑 {table.seats} ที่นั่ง</div>
                        {selectedTable?.id === table.id && (
                          <div className="absolute top-3 right-3 w-6 h-6 bg-violet-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : searched && !loading ? (
                  <div className="text-center py-16">
                    <div className="text-4xl mb-3">😔</div>
                    <div className="text-gray-400">ไม่มีโต๊ะว่างในช่วงเวลานี้</div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="text-4xl mb-3">🔍</div>
                    <div className="text-gray-500">เลือกวันและเวลาแล้วกด ค้นหา ครับ</div>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                <h2 className="text-white font-bold text-xl mb-6">👤 ข้อมูลผู้จอง</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "ชื่อ *", key: "firstName", placeholder: "ชื่อจริง", type: "text" },
                    { label: "นามสกุล", key: "lastName", placeholder: "นามสกุล", type: "text" },
                    { label: "เบอร์โทร *", key: "phone", placeholder: "08x-xxx-xxxx", type: "tel" },
                    { label: "อีเมล *", key: "email", placeholder: "email@example.com", type: "email" },
                    { label: "วาระพิเศษ", key: "occasion", placeholder: "เช่น วันเกิด, ครบรอบ", type: "text" },
                  ].map((f) => (
                    <div key={f.key} className={f.key === "occasion" ? "md:col-span-2" : ""}>
                      <label className="text-gray-400 text-xs uppercase tracking-wide block mb-1.5">{f.label}</label>
                      <input
                        type={f.type}
                        placeholder={f.placeholder}
                        value={form[f.key as keyof typeof form]}
                        onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder-gray-600"
                      />
                    </div>
                  ))}
                  <div className="md:col-span-2">
                    <label className="text-gray-400 text-xs uppercase tracking-wide block mb-1.5">หมายเหตุ</label>
                    <textarea
                      rows={3}
                      placeholder="เช่น อาหารที่แพ้, ความต้องการพิเศษ"
                      value={form.specialRequests}
                      onChange={(e) => setForm({ ...form, specialRequests: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder-gray-600 resize-none"
                    />
                  </div>
                </div>

                <div className="mt-6 bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-4">
                  <p className="text-yellow-300 text-sm font-medium">
                    💳 ชำระมัดจำ ฿{deposit.toLocaleString()} ผ่าน Stripe
                  </p>
                  <p className="text-yellow-300/60 text-xs mt-1">ยกเลิกล่วงหน้า 24 ชม. คืนเงินเต็มจำนวน</p>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 bg-gray-800 text-gray-300 py-3 rounded-xl text-sm font-medium hover:bg-gray-700 transition"
                  >
                    ← ย้อนกลับ
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 text-white py-3 rounded-xl text-sm font-bold hover:from-violet-500 hover:to-purple-500 transition disabled:opacity-50"
                  >
                    {loading ? "⏳ กำลังดำเนินการ..." : `ชำระมัดจำ ฿${deposit.toLocaleString()} →`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 sticky top-4">
              <h3 className="text-white font-bold text-lg mb-5">📋 สรุปการจอง</h3>
              <div className="space-y-3">
                {[
                  { label: "วันที่", value: date || "-" },
                  { label: "เวลา", value: `${time} น.` },
                  { label: "จำนวน", value: `${partySize} ท่าน` },
                  ...(selectedTable ? [
                    { label: "โต๊ะ", value: selectedTable.displayName },
                    { label: "โซน", value: selectedTable.zone },
                  ] : []),
                ].map((r) => (
                  <div key={r.label} className="flex justify-between text-sm">
                    <span className="text-gray-500">{r.label}</span>
                    <span className="text-gray-200 font-medium">{r.value}</span>
                  </div>
                ))}
                <div className="border-t border-gray-800 pt-3 flex justify-between items-center">
                  <span className="text-gray-400 text-sm">มัดจำ ({partySize}×฿{DEPOSIT_PER_PERSON})</span>
                  <span className="text-yellow-300 font-black text-xl">฿{deposit.toLocaleString()}</span>
                </div>
              </div>

              {step === 1 && (
                <button
                  disabled={!selectedTable}
                  onClick={() => setStep(2)}
                  className="w-full mt-5 bg-gradient-to-r from-violet-600 to-purple-600 text-white py-3 rounded-xl text-sm font-bold hover:from-violet-500 hover:to-purple-500 transition disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {selectedTable ? "กรอกข้อมูล →" : "เลือกโต๊ะก่อน"}
                </button>
              )}

              <div className="mt-4 space-y-1.5">
                {["มัดจำหักจากยอดเมื่อมาถึง", "เกิน 15 นาที = No-show", "ชำระผ่าน Stripe (PCI DSS)"].map((t) => (
                  <div key={t} className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="text-violet-500">•</span>
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
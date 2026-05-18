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
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialRequests: "",
    occasion: "",
  });

  const today = new Date().toISOString().split("T")[0];

  const searchTables = async () => {
    if (!date) return alert("กรุณาเลือกวันที่");
    setLoading(true);
    try {
      const res = await fetch(
        `/api/tables?date=${date}&time=${time}&partySize=${partySize}`
      );
      const data = await res.json();
      setTables(data.tables);
      setSelectedTable(null);
    } catch {
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  };

  const filteredTables =
    zone === "ทั้งหมด"
      ? tables
      : tables.filter((t) => t.zone === zone);

  const deposit = partySize * DEPOSIT_PER_PERSON;

  const handleSubmit = async () => {
    if (!selectedTable) return;
    if (!form.firstName || !form.email || !form.phone) {
      return alert("กรุณากรอกข้อมูลให้ครบ");
    }
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
      // Redirect ไป Stripe
      window.location.href = data.stripeUrl;
    } catch {
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-stone-800 text-white py-4 px-6">
        <h1 className="text-xl font-semibold">QueueFlow — จองโต๊ะ</h1>
      </header>

      {/* Steps */}
      <div className="flex justify-center gap-8 py-6 bg-white border-b">
        {[
          { n: 1, label: "เลือกโต๊ะ" },
          { n: 2, label: "ข้อมูล & ชำระมัดจำ" },
          { n: 3, label: "เสร็จสิ้น" },
        ].map((s) => (
          <div key={s.n} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
              ${step === s.n ? "bg-stone-800 text-white" : step > s.n ? "bg-green-600 text-white" : "bg-stone-200 text-stone-500"}`}
            >
              {step > s.n ? "✓" : s.n}
            </div>
            <span className={`text-sm ${step === s.n ? "font-medium text-stone-800" : "text-stone-400"}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {step === 1 && (
            <div>
              {/* Search Bar */}
              <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
                <h2 className="text-lg font-semibold mb-4 text-stone-800">ค้นหาโต๊ะว่าง</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="col-span-2 md:col-span-1">
                    <label className="text-xs text-stone-500 uppercase tracking-wide">วันที่</label>
                    <input
                      type="date"
                      min={today}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full mt-1 border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-stone-500 uppercase tracking-wide">เวลา</label>
                    <select
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full mt-1 border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
                    >
                      {TIME_SLOTS.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-stone-500 uppercase tracking-wide">จำนวนท่าน</label>
                    <select
                      value={partySize}
                      onChange={(e) => setPartySize(Number(e.target.value))}
                      className="w-full mt-1 border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
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
                      className="w-full bg-stone-800 text-white py-2 rounded-lg text-sm hover:bg-stone-700 transition disabled:opacity-50"
                    >
                      {loading ? "กำลังค้นหา..." : "ค้นหา"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Zone Filter */}
              {tables.length > 0 && (
                <div className="flex gap-2 mb-4 flex-wrap">
                  {["ทั้งหมด", ...ZONES].map((z) => (
                    <button
                      key={z}
                      onClick={() => setZone(z)}
                      className={`px-4 py-1.5 rounded-full text-sm transition
                        ${zone === z ? "bg-stone-800 text-white" : "bg-white text-stone-600 border border-stone-200 hover:border-stone-400"}`}
                    >
                      {z}
                    </button>
                  ))}
                </div>
              )}

              {/* Tables Grid */}
              {filteredTables.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredTables.map((table) => (
                    <div
                      key={table.id}
                      onClick={() => setSelectedTable(table)}
                      className={`bg-white p-4 rounded-xl shadow-sm cursor-pointer border-2 transition
                        ${selectedTable?.id === table.id
                          ? "border-stone-800 bg-stone-50"
                          : "border-transparent hover:border-stone-300"}`}
                    >
                      <div className="text-xs text-stone-400 uppercase mb-1">{table.zone}</div>
                      <div className="text-lg font-semibold text-stone-800">{table.displayName}</div>
                      <div className="text-sm text-stone-500">รองรับ {table.seats} ท่าน</div>
                      {selectedTable?.id === table.id && (
                        <div className="text-xs text-stone-800 font-medium mt-2">✓ เลือกแล้ว</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : tables.length === 0 && !loading ? (
                <div className="text-center py-16 text-stone-400">
                  กรุณาค้นหาโต๊ะว่างก่อนครับ
                </div>
              ) : (
                <div className="text-center py-16 text-stone-400">
                  ไม่มีโต๊ะว่างในช่วงเวลานี้
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-lg font-semibold mb-6 text-stone-800">ข้อมูลผู้จอง</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-stone-500 uppercase tracking-wide">ชื่อ *</label>
                  <input
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="w-full mt-1 border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
                    placeholder="ชื่อจริง"
                  />
                </div>
                <div>
                  <label className="text-xs text-stone-500 uppercase tracking-wide">นามสกุล</label>
                  <input
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="w-full mt-1 border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
                    placeholder="นามสกุล"
                  />
                </div>
                <div>
                  <label className="text-xs text-stone-500 uppercase tracking-wide">เบอร์โทร *</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full mt-1 border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
                    placeholder="08x-xxx-xxxx"
                  />
                </div>
                <div>
                  <label className="text-xs text-stone-500 uppercase tracking-wide">อีเมล *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full mt-1 border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
                    placeholder="email@example.com"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-stone-500 uppercase tracking-wide">วาระพิเศษ</label>
                  <input
                    value={form.occasion}
                    onChange={(e) => setForm({ ...form, occasion: e.target.value })}
                    className="w-full mt-1 border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
                    placeholder="เช่น วันเกิด, ครบรอบ"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-stone-500 uppercase tracking-wide">หมายเหตุ</label>
                  <textarea
                    value={form.specialRequests}
                    onChange={(e) => setForm({ ...form, specialRequests: e.target.value })}
                    rows={3}
                    className="w-full mt-1 border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
                    placeholder="เช่น อาหารที่แพ้, ความต้องการพิเศษ"
                  />
                </div>
              </div>

              <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-800">
                  💳 ชำระมัดจำ <strong>฿{deposit.toLocaleString()}</strong> ผ่าน Stripe อย่างปลอดภัย
                  <br />
                  <span className="text-xs">ยกเลิกล่วงหน้า 24 ชม. คืนเงินเต็มจำนวน</span>
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 border border-stone-300 text-stone-700 py-3 rounded-lg text-sm hover:bg-stone-50 transition"
                >
                  ย้อนกลับ
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-stone-800 text-white py-3 rounded-lg text-sm hover:bg-stone-700 transition disabled:opacity-50"
                >
                  {loading ? "กำลังดำเนินการ..." : `ชำระมัดจำ ฿${deposit.toLocaleString()}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm sticky top-4">
            <h3 className="font-semibold text-stone-800 mb-4">สรุปการจอง</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-stone-500">วันที่</span>
                <span className="text-stone-800">{date || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">เวลา</span>
                <span className="text-stone-800">{time} น.</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">จำนวน</span>
                <span className="text-stone-800">{partySize} ท่าน</span>
              </div>
              {selectedTable && (
                <>
                  <div className="flex justify-between">
                    <span className="text-stone-500">โต๊ะ</span>
                    <span className="text-stone-800">{selectedTable.displayName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">โซน</span>
                    <span className="text-stone-800">{selectedTable.zone}</span>
                  </div>
                </>
              )}
              <div className="border-t pt-3 flex justify-between font-medium">
                <span className="text-stone-500">มัดจำ ({partySize}×฿{DEPOSIT_PER_PERSON})</span>
                <span className="text-stone-800 text-lg">฿{deposit.toLocaleString()}</span>
              </div>
            </div>

            {step === 1 && (
              <button
                disabled={!selectedTable}
                onClick={() => setStep(2)}
                className="w-full mt-6 bg-stone-800 text-white py-3 rounded-lg text-sm hover:bg-stone-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {selectedTable ? `ต่อไป →` : "เลือกโต๊ะก่อน"}
              </button>
            )}

            <p className="text-xs text-stone-400 mt-4 leading-relaxed">
              • มัดจำหักจากยอดเมื่อมาถึง<br />
              • เกิน 15 นาทีไม่รอ = No-show<br />
              • ระบบชำระผ่าน Stripe (PCI DSS)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
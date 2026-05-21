"use client";

import { useEffect, useState } from "react";

interface Reservation {
  id: string;
  referenceCode: string;
  reservationDate: string;
  reservationTime: string;
  partySize: number;
  status: string;
  customer: { firstName: string; lastName: string; phone: string; email: string };
  table: { displayName: string; zone: string };
  deposit: { amountSatang: number; paymentStatus: string } | null;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "รอยืนยัน", confirmed: "ยืนยันแล้ว", seated: "กำลังนั่ง",
  completed: "เสร็จสิ้น", cancelled: "ยกเลิก", no_show: "ไม่มาตามนัด",
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-400/20 text-amber-300 border-amber-400/30",
  confirmed: "bg-green-400/20 text-green-300 border-green-400/30",
  seated: "bg-blue-400/20 text-blue-300 border-blue-400/30",
  completed: "bg-gray-400/20 text-gray-400 border-gray-400/30",
  cancelled: "bg-red-400/20 text-red-400 border-red-400/30",
  no_show: "bg-red-400/20 text-red-400 border-red-400/30",
};

export default function AdminReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const fetchReservations = async () => {
    setLoading(true);
    const params = new URLSearchParams({ date, status });
    if (search) params.set("search", search);
    const res = await fetch(`/api/admin/reservations?${params}`);
    const data = await res.json();
    setReservations(data.reservations || []);
    setLoading(false);
  };

  useEffect(() => { fetchReservations(); }, [date, status]);

  const handleCancel = async (id: string) => {
    if (!confirm("ยืนยันการยกเลิก?")) return;
    const res = await fetch(`/api/admin/reservations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel" }),
    });
    const data = await res.json();
    alert(data.refunded ? `ยกเลิกสำเร็จ — คืนเงิน ฿${data.refundedAmount.toLocaleString()}` : "ยกเลิกสำเร็จ");
    fetchReservations();
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    await fetch(`/api/admin/reservations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "updateStatus", status: newStatus }),
    });
    fetchReservations();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-white font-black text-2xl">📋 รายการจอง</h1>
        <span className="bg-violet-600/20 text-violet-300 border border-violet-500/30 px-3 py-1 rounded-full text-sm">
          {reservations.length} รายการ
        </span>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 mb-6 flex flex-wrap gap-3">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
          <option value="all">ทุกสถานะ</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="🔍 ค้นหาชื่อ / เบอร์ / รหัส"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchReservations()}
          className="flex-1 min-w-48 bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder-gray-600"
        />
        <button
          onClick={fetchReservations}
          className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition"
        >
          ค้นหา
        </button>
      </div>

      {/* Table */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                {["รหัส", "ลูกค้า", "วันที่/เวลา", "โต๊ะ", "ท่าน", "มัดจำ", "สถานะ", "จัดการ"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wide font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-16 text-gray-600">⏳ กำลังโหลด...</td></tr>
              ) : reservations.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-16 text-gray-600">ไม่พบรายการจอง</td></tr>
              ) : (
                reservations.map((r) => (
                  <tr key={r.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                    <td className="px-4 py-4 font-mono text-xs text-violet-400">{r.referenceCode}</td>
                    <td className="px-4 py-4">
                      <div className="text-white font-medium">{r.customer.firstName} {r.customer.lastName}</div>
                      <div className="text-gray-500 text-xs">{r.customer.phone}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-gray-200">{new Date(r.reservationDate).toLocaleDateString("th-TH")}</div>
                      <div className="text-gray-500 text-xs">{r.reservationTime} น.</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-gray-200">{r.table.displayName}</div>
                      <div className="text-gray-500 text-xs">{r.table.zone}</div>
                    </td>
                    <td className="px-4 py-4 text-center text-gray-300">{r.partySize}</td>
                    <td className="px-4 py-4 text-gray-300">
                      {r.deposit ? `฿${(r.deposit.amountSatang / 100).toLocaleString()}` : "-"}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_STYLES[r.status]}`}>
                        {STATUS_LABELS[r.status]}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        {r.status === "confirmed" && (
                          <button
                            onClick={() => handleStatusChange(r.id, "seated")}
                            className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition"
                          >
                            Check-in
                          </button>
                        )}
                        {["pending", "confirmed"].includes(r.status) && (
                          <button
                            onClick={() => handleCancel(r.id)}
                            className="text-xs bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 px-3 py-1.5 rounded-lg transition"
                          >
                            ยกเลิก
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
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
  pending: "รอยืนยัน",
  confirmed: "ยืนยันแล้ว",
  seated: "กำลังนั่ง",
  completed: "เสร็จสิ้น",
  cancelled: "ยกเลิก",
  no_show: "ไม่มาตามนัด",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-green-100 text-green-800",
  seated: "bg-blue-100 text-blue-800",
  completed: "bg-stone-100 text-stone-600",
  cancelled: "bg-red-100 text-red-800",
  no_show: "bg-red-100 text-red-800",
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

  useEffect(() => {
    fetchReservations();
  }, [date, status]);

  const handleCancel = async (id: string) => {
    if (!confirm("ยืนยันการยกเลิก?")) return;
    const res = await fetch(`/api/admin/reservations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel" }),
    });
    const data = await res.json();
    if (data.refunded) {
      alert(`ยกเลิกสำเร็จ — คืนเงิน ฿${data.refundedAmount.toLocaleString()}`);
    } else {
      alert("ยกเลิกสำเร็จ (ไม่คืนเงินเนื่องจากยกเลิกกระชั้นชิด)");
    }
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
      <h2 className="text-xl font-semibold text-stone-800 mb-6">รายการจอง</h2>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-6 flex flex-wrap gap-4">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
        >
          <option value="all">ทุกสถานะ</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="ค้นหาชื่อ / เบอร์ / รหัส"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchReservations()}
          className="flex-1 min-w-48 border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
        />
        <button
          onClick={fetchReservations}
          className="bg-stone-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-stone-700 transition"
        >
          ค้นหา
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              {["รหัส", "ลูกค้า", "วันที่/เวลา", "โต๊ะ", "ท่าน", "มัดจำ", "สถานะ", "จัดการ"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs text-stone-500 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-stone-400">
                  กำลังโหลด...
                </td>
              </tr>
            ) : reservations.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-stone-400">
                  ไม่พบรายการจอง
                </td>
              </tr>
            ) : (
              reservations.map((r) => (
                <tr key={r.id} className="border-b border-stone-100 hover:bg-stone-50">
                  <td className="px-4 py-3 font-mono text-xs text-stone-600">
                    {r.referenceCode}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-stone-800">
                      {r.customer.firstName} {r.customer.lastName}
                    </div>
                    <div className="text-xs text-stone-400">{r.customer.phone}</div>
                  </td>
                  <td className="px-4 py-3 text-stone-600">
                    <div>{new Date(r.reservationDate).toLocaleDateString("th-TH")}</div>
                    <div className="text-xs text-stone-400">{r.reservationTime} น.</div>
                  </td>
                  <td className="px-4 py-3 text-stone-600">
                    <div>{r.table.displayName}</div>
                    <div className="text-xs text-stone-400">{r.table.zone}</div>
                  </td>
                  <td className="px-4 py-3 text-center text-stone-600">{r.partySize}</td>
                  <td className="px-4 py-3 text-stone-600">
                    {r.deposit
                      ? `฿${(r.deposit.amountSatang / 100).toLocaleString()}`
                      : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[r.status]}`}>
                      {STATUS_LABELS[r.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {r.status === "confirmed" && (
                        <button
                          onClick={() => handleStatusChange(r.id, "seated")}
                          className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition"
                        >
                          Check-in
                        </button>
                      )}
                      {["pending", "confirmed"].includes(r.status) && (
                        <button
                          onClick={() => handleCancel(r.id)}
                          className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition"
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
  );
}
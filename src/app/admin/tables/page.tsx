"use client";

import { useEffect, useState } from "react";
import { ZONES } from "@/lib/constants";

interface Table {
  id: string;
  tableNumber: string;
  displayName: string;
  seats: number;
  zone: string;
  status: string;
  _count: { reservations: number };
}

const STATUS_LABELS: Record<string, string> = {
  available: "ว่าง",
  reserved: "จองแล้ว",
  maintenance: "ปิดซ่อม",
};

const STATUS_COLORS: Record<string, string> = {
  available: "bg-green-100 text-green-800",
  reserved: "bg-amber-100 text-amber-800",
  maintenance: "bg-red-100 text-red-800",
};

export default function AdminTables() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ seats: 0, zone: "", status: "", displayName: "" });

  const fetchTables = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/tables");
    const data = await res.json();
    setTables(data.tables || []);
    setLoading(false);
  };

  useEffect(() => { fetchTables(); }, []);

  const startEdit = (table: Table) => {
    setEditingId(table.id);
    setEditForm({
      seats: table.seats,
      zone: table.zone,
      status: table.status,
      displayName: table.displayName,
    });
  };

  const saveEdit = async (id: string) => {
    await fetch(`/api/admin/tables/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    setEditingId(null);
    fetchTables();
  };

  const toggleStatus = async (table: Table) => {
    const newStatus = table.status === "available" ? "maintenance" : "available";
    await fetch(`/api/admin/tables/${table.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchTables();
  };

  const grouped = ZONES.reduce((acc, zone) => {
    acc[zone] = tables.filter((t) => t.zone === zone);
    return acc;
  }, {} as Record<string, Table[]>);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-stone-800">จัดการโต๊ะ</h2>
        <div className="text-sm text-stone-500">
          ทั้งหมด {tables.length} โต๊ะ •{" "}
          ว่าง {tables.filter((t) => t.status === "available").length} โต๊ะ
        </div>
      </div>

      {loading ? (
        <div className="text-stone-400">กำลังโหลด...</div>
      ) : (
        <div className="space-y-8">
          {ZONES.map((zone) =>
            grouped[zone]?.length > 0 ? (
              <div key={zone}>
                <h3 className="text-sm font-medium text-stone-500 uppercase tracking-wide mb-3">
                  {zone}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {grouped[zone].map((table) => (
                    <div
                      key={table.id}
                      className="bg-white rounded-xl shadow-sm p-5 border border-stone-100"
                    >
                      {editingId === table.id ? (
                        // Edit Mode
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs text-stone-500 uppercase">ชื่อโต๊ะ</label>
                            <input
                              value={editForm.displayName}
                              onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                              className="w-full mt-1 border border-stone-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs text-stone-500 uppercase">ที่นั่ง</label>
                              <input
                                type="number"
                                value={editForm.seats}
                                onChange={(e) => setEditForm({ ...editForm, seats: Number(e.target.value) })}
                                className="w-full mt-1 border border-stone-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-stone-500 uppercase">โซน</label>
                              <select
                                value={editForm.zone}
                                onChange={(e) => setEditForm({ ...editForm, zone: e.target.value })}
                                className="w-full mt-1 border border-stone-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
                              >
                                {ZONES.map((z) => (
                                  <option key={z} value={z}>{z}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="text-xs text-stone-500 uppercase">สถานะ</label>
                            <select
                              value={editForm.status}
                              onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                              className="w-full mt-1 border border-stone-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
                            >
                              <option value="available">ว่าง</option>
                              <option value="maintenance">ปิดซ่อม</option>
                            </select>
                          </div>
                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={() => saveEdit(table.id)}
                              className="flex-1 bg-stone-800 text-white py-1.5 rounded-lg text-sm hover:bg-stone-700 transition"
                            >
                              บันทึก
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="flex-1 border border-stone-300 text-stone-600 py-1.5 rounded-lg text-sm hover:bg-stone-50 transition"
                            >
                              ยกเลิก
                            </button>
                          </div>
                        </div>
                      ) : (
                        // View Mode
                        <>
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="text-xs text-stone-400 mb-0.5">{table.tableNumber}</div>
                              <div className="font-semibold text-stone-800">{table.displayName}</div>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[table.status]}`}>
                              {STATUS_LABELS[table.status]}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-stone-500 mb-4">
                            <span>🪑 {table.seats} ที่นั่ง</span>
                            <span>📅 จองวันนี้ {table._count.reservations} ครั้ง</span>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => startEdit(table)}
                              className="flex-1 border border-stone-300 text-stone-700 py-1.5 rounded-lg text-xs hover:bg-stone-50 transition"
                            >
                              แก้ไข
                            </button>
                            <button
                              onClick={() => toggleStatus(table)}
                              className={`flex-1 py-1.5 rounded-lg text-xs transition ${
                                table.status === "available"
                                  ? "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                                  : "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                              }`}
                            >
                              {table.status === "available" ? "ปิดซ่อม" : "เปิดใช้งาน"}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : null
          )}
        </div>
      )}
    </div>
  );
}
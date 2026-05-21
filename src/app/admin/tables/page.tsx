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

const ZONE_COLORS: Record<string, string> = {
  Window: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Garden: "bg-green-500/20 text-green-300 border-green-500/30",
  Main: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  Private: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  Banquet: "bg-orange-500/20 text-orange-300 border-orange-500/30",
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
    setEditForm({ seats: table.seats, zone: table.zone, status: table.status, displayName: table.displayName });
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
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-white font-black text-2xl">🪑 จัดการโต๊ะ</h1>
        <div className="flex gap-3">
          <span className="bg-green-500/20 text-green-300 border border-green-500/30 px-3 py-1.5 rounded-full text-sm">
            ✅ ว่าง {tables.filter((t) => t.status === "available").length}
          </span>
          <span className="bg-red-500/20 text-red-300 border border-red-500/30 px-3 py-1.5 rounded-full text-sm">
            🔧 ซ่อม {tables.filter((t) => t.status === "maintenance").length}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-gray-900 rounded-2xl p-5 border border-gray-800 animate-pulse h-40" />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {ZONES.map((zone) =>
            grouped[zone]?.length > 0 ? (
              <div key={zone}>
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${ZONE_COLORS[zone]}`}>
                    {zone}
                  </span>
                  <span className="text-gray-600 text-sm">{grouped[zone].length} โต๊ะ</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {grouped[zone].map((table) => (
                    <div
                      key={table.id}
                      className={`bg-gray-900 rounded-2xl p-5 border transition
                        ${table.status === "maintenance" ? "border-red-500/30 opacity-60" : "border-gray-800"}`}
                    >
                      {editingId === table.id ? (
                        <div className="space-y-3">
                          <div>
                            <label className="text-gray-400 text-xs uppercase block mb-1">ชื่อโต๊ะ</label>
                            <input
                              value={editForm.displayName}
                              onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                              className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-gray-400 text-xs uppercase block mb-1">ที่นั่ง</label>
                              <input
                                type="number"
                                value={editForm.seats}
                                onChange={(e) => setEditForm({ ...editForm, seats: Number(e.target.value) })}
                                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                              />
                            </div>
                            <div>
                              <label className="text-gray-400 text-xs uppercase block mb-1">โซน</label>
                              <select
                                value={editForm.zone}
                                onChange={(e) => setEditForm({ ...editForm, zone: e.target.value })}
                                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                              >
                                {ZONES.map((z) => <option key={z} value={z}>{z}</option>)}
                              </select>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => saveEdit(table.id)}
                              className="flex-1 bg-violet-600 hover:bg-violet-500 text-white py-2 rounded-xl text-sm font-medium transition"
                            >
                              บันทึก
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="flex-1 bg-gray-800 text-gray-400 py-2 rounded-xl text-sm transition hover:bg-gray-700"
                            >
                              ยกเลิก
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="text-gray-500 text-xs mb-0.5">{table.tableNumber}</div>
                              <div className="text-white font-bold text-lg">{table.displayName}</div>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full border font-medium
                              ${table.status === "available"
                                ? "bg-green-500/20 text-green-300 border-green-500/30"
                                : "bg-red-500/20 text-red-300 border-red-500/30"}`}>
                              {table.status === "available" ? "ว่าง" : "ซ่อม"}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-sm mb-4">
                            <span className="text-gray-400">🪑 {table.seats} ที่นั่ง</span>
                            <span className="text-gray-400">📅 {table._count.reservations} จอง</span>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => startEdit(table)}
                              className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2 rounded-xl text-xs font-medium transition border border-gray-700"
                            >
                              ✏️ แก้ไข
                            </button>
                            <button
                              onClick={() => toggleStatus(table)}
                              className={`flex-1 py-2 rounded-xl text-xs font-medium transition border
                                ${table.status === "available"
                                  ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30"
                                  : "bg-green-500/10 hover:bg-green-500/20 text-green-400 border-green-500/30"}`}
                            >
                              {table.status === "available" ? "🔧 ปิดซ่อม" : "✅ เปิดใช้"}
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
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

    const [total, confirmed, pending, seated, depositData] = await Promise.all([
      prisma.reservation.count({
        where: { reservationDate: { gte: today, lt: tomorrow } },
      }),
      prisma.reservation.count({
        where: { reservationDate: { gte: today, lt: tomorrow }, status: "confirmed" },
      }),
      prisma.reservation.count({
        where: { reservationDate: { gte: today, lt: tomorrow }, status: "pending" },
      }),
      prisma.reservation.count({
        where: { reservationDate: { gte: today, lt: tomorrow }, status: "seated" },
      }),
      prisma.deposit.aggregate({
        where: { paymentStatus: "paid" },
        _sum: { amountSatang: true },
      }),
    ]);

    return NextResponse.json({
      totalToday: total,
      confirmedToday: confirmed,
      pendingToday: pending,
      seatedToday: seated,
      depositToday: (depositData._sum.amountSatang ?? 0) / 100,
    });
  } catch (error) {
    console.error("GET /api/admin/stats error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
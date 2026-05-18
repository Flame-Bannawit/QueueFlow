import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const time = searchParams.get("time");
    const partySize = searchParams.get("partySize");

    if (!date || !time || !partySize) {
      return NextResponse.json(
        { error: "กรุณาระบุ date, time และ partySize" },
        { status: 400 }
      );
    }

    const partySizeNum = parseInt(partySize);

    // หาโต๊ะที่ถูกจองในช่วงเวลานั้น
    const reservedTableIds = await prisma.reservation.findMany({
      where: {
        reservationDate: new Date(date),
        status: { notIn: ["cancelled", "no_show"] },
        OR: [
          {
            reservationTime: { lte: time },
            expectedEndTime: { gt: time },
          },
          {
            reservationTime: { lt: addMinutes(time, 90) },
            expectedEndTime: { gte: addMinutes(time, 90) },
          },
          {
            reservationTime: { gte: time },
            expectedEndTime: { lte: addMinutes(time, 90) },
          },
        ],
      },
      select: { tableId: true },
    });

    const reservedIds = reservedTableIds.map((r) => r.tableId);

    // ดึงโต๊ะที่ว่างและรองรับจำนวนคนได้
    const tables = await prisma.restaurantTable.findMany({
      where: {
        status: "available",
        seats: { gte: partySizeNum },
        id: { notIn: reservedIds },
      },
      orderBy: [{ zone: "asc" }, { seats: "asc" }],
    });

    return NextResponse.json({ tables });
  } catch (error) {
    console.error("GET /api/tables error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาด กรุณาลองใหม่" },
      { status: 500 }
    );
  }
}

function addMinutes(time: string, minutes: number): string {
  const [hours, mins] = time.split(":").map(Number);
  const totalMins = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMins / 60);
  const newMins = totalMins % 60;
  return `${String(newHours).padStart(2, "0")}:${String(newMins).padStart(2, "0")}`;
}
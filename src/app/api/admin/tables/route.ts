import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const tables = await prisma.restaurantTable.findMany({
      orderBy: [{ zone: "asc" }, { tableNumber: "asc" }],
      include: {
        _count: {
          select: {
            reservations: {
              where: {
                status: { notIn: ["cancelled", "no_show"] },
                reservationDate: {
                  gte: new Date(new Date().setUTCHours(0, 0, 0, 0)),
                },
              },
            },
          },
        },
      },
    });
    return NextResponse.json({ tables });
  } catch (error) {
    console.error("GET /api/admin/tables error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
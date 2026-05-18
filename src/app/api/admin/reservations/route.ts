import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const reservations = await prisma.reservation.findMany({
      where: {
        ...(date && { reservationDate: new Date(date) }),
        ...(status && status !== "all" && { status }),
        ...(search && {
          OR: [
            { referenceCode: { contains: search, mode: "insensitive" } },
            { customer: { firstName: { contains: search, mode: "insensitive" } } },
            { customer: { lastName: { contains: search, mode: "insensitive" } } },
            { customer: { phone: { contains: search } } },
          ],
        }),
      },
      include: {
        customer: true,
        table: true,
        deposit: true,
      },
      orderBy: [
        { reservationDate: "asc" },
        { reservationTime: "asc" },
      ],
    });

    return NextResponse.json({ reservations });
  } catch (error) {
    console.error("GET /api/admin/reservations error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาด" },
      { status: 500 }
    );
  }
}
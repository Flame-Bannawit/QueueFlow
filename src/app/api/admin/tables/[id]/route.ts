import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const table = await prisma.restaurantTable.update({
      where: { id: params.id },
      data: {
        ...(body.status && { status: body.status }),
        ...(body.seats && { seats: body.seats }),
        ...(body.zone && { zone: body.zone }),
        ...(body.displayName && { displayName: body.displayName }),
      },
    });
    return NextResponse.json({ success: true, table });
  } catch (error) {
    console.error("PATCH /api/admin/tables/[id] error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import {
  DEPOSIT_PER_PERSON_SATANG,
  RESERVATION_DURATION_MINUTES,
} from "@/lib/constants";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const reservationSchema = z.object({
  tableId: z.string().uuid(),
  firstName: z.string().min(1),
  lastName: z.string().optional().default(""),  // ← แก้ตรงนี้
  email: z.string().email(),
  phone: z.string().min(9),
  reservationDate: z.string(),
  reservationTime: z.string(),
  partySize: z.number().min(1).max(20),
  specialRequests: z.string().optional(),
  occasion: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = reservationSchema.parse(body);

    // ตรวจสอบโต๊ะว่างอีกครั้ง (ป้องกัน race condition)
    const endTime = addMinutes(data.reservationTime, RESERVATION_DURATION_MINUTES);

    const conflict = await prisma.reservation.findFirst({
      where: {
        tableId: data.tableId,
        reservationDate: new Date(data.reservationDate),
        status: { notIn: ["cancelled", "no_show"] },
        OR: [
          {
            reservationTime: { lte: data.reservationTime },
            expectedEndTime: { gt: data.reservationTime },
          },
          {
            reservationTime: { lt: endTime },
            expectedEndTime: { gte: endTime },
          },
        ],
      },
    });

    if (conflict) {
      return NextResponse.json(
        { error: "โต๊ะนี้ถูกจองแล้วในช่วงเวลาดังกล่าว" },
        { status: 409 }
      );
    }

    // หาหรือสร้าง Customer
    let customer = await prisma.customer.findUnique({
      where: { email: data.email },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
        },
      });
    }

    // สร้าง Reference Code
    const referenceCode = `RES-${Date.now().toString(36).toUpperCase()}`;

    // สร้าง Reservation
    const reservation = await prisma.reservation.create({
      data: {
        referenceCode,
        customerId: customer.id,
        tableId: data.tableId,
        reservationDate: new Date(data.reservationDate),
        reservationTime: data.reservationTime,
        expectedEndTime: endTime,
        partySize: data.partySize,
        specialRequests: data.specialRequests,
        occasion: data.occasion,
        status: "pending",
      },
    });

    // คำนวณมัดจำ
    const depositAmount = data.partySize * DEPOSIT_PER_PERSON_SATANG;

    // สร้าง Deposit record
    const deposit = await prisma.deposit.create({
      data: {
        reservationId: reservation.id,
        customerId: customer.id,
        amountSatang: depositAmount,
        depositPerPersonSatang: DEPOSIT_PER_PERSON_SATANG,
      },
    });

    // สร้าง Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "thb",
            product_data: {
              name: `มัดจำการจองโต๊ะ ${referenceCode}`,
              description: `${data.partySize} ท่าน — วันที่ ${data.reservationDate} เวลา ${data.reservationTime}`,
            },
            unit_amount: depositAmount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        reservationId: reservation.id,
        depositId: deposit.id,
        referenceCode,
      },
      success_url: `${process.env.NEXTAUTH_URL}/booking/success?ref=${referenceCode}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/booking/cancel?ref=${referenceCode}`,
    });

    // บันทึก Stripe Session ID
    await prisma.deposit.update({
      where: { id: deposit.id },
      data: { stripeSessionId: session.id },
    });

    return NextResponse.json({
      reservationId: reservation.id,
      referenceCode,
      stripeUrl: session.url,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "ข้อมูลไม่ถูกต้อง", details: error.issues },
        { status: 400 }
      );
    }
    console.error("POST /api/reservations error:", error);
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
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { sendRefundEmail } from "@/lib/email";
import { CANCELLATION_HOURS } from "@/lib/constants";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const { action } = body;

    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: { customer: true, deposit: true },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "ไม่พบการจองนี้" },
        { status: 404 }
      );
    }

    // ── Cancel + Refund ──
    if (action === "cancel") {
      const now = new Date();
      const reservationDateTime = new Date(reservation.reservationDate);
      const [hours, mins] = reservation.reservationTime.split(":").map(Number);
      reservationDateTime.setHours(hours, mins);

      const hoursUntilReservation =
        (reservationDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      const shouldRefund =
        hoursUntilReservation >= CANCELLATION_HOURS &&
        reservation.deposit?.paymentStatus === "paid";

      let refundedAmount = 0;

      if (shouldRefund && reservation.deposit) {
        const refund = await stripe.refunds.create({
          payment_intent: reservation.deposit.stripePaymentIntentId!,
          amount: reservation.deposit.amountSatang,
        });

        await prisma.deposit.update({
          where: { id: reservation.deposit.id },
          data: {
            paymentStatus: "refunded",
            refundedAmountSatang: reservation.deposit.amountSatang,
            stripeRefundId: refund.id,
            refundedAt: new Date(),
          },
        });

        refundedAmount = reservation.deposit.amountSatang / 100;

        await sendRefundEmail({
          to: reservation.customer.email,
          firstName: reservation.customer.firstName,
          referenceCode: reservation.referenceCode,
          refundAmount: refundedAmount.toLocaleString(),
        });
      }

      await prisma.reservation.update({
        where: { id },
        data: {
          status: "cancelled",
          cancelledAt: new Date(),
          cancelReason: body.reason || "Cancelled by admin",
        },
      });

      return NextResponse.json({
        success: true,
        refunded: shouldRefund,
        refundedAmount,
      });
    }

    // ── Update Status ──
    if (action === "updateStatus") {
      const updated = await prisma.reservation.update({
        where: { id },
        data: { status: body.status },
      });
      return NextResponse.json({ success: true, reservation: updated });
    }

    return NextResponse.json(
      { error: "action ไม่ถูกต้อง" },
      { status: 400 }
    );
  } catch (error) {
    console.error("PATCH /api/admin/reservations/[id] error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาด" },
      { status: 500 }
    );
  }
}
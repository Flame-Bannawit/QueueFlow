import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { sendConfirmationEmail } from "@/lib/email";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handlePaymentSuccess(session);
        break;
      }
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handlePaymentExpired(session);
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handlePaymentSuccess(session: Stripe.Checkout.Session) {
  const { reservationId, depositId, referenceCode } = session.metadata!;

  // อัปเดต Deposit
  await prisma.deposit.update({
    where: { id: depositId },
    data: {
      paymentStatus: "paid",
      stripePaymentIntentId: session.payment_intent as string,
      paidAt: new Date(),
    },
  });

  // อัปเดต Reservation เป็น confirmed
  const reservation = await prisma.reservation.update({
    where: { id: reservationId },
    data: {
      status: "confirmed",
      confirmedAt: new Date(),
    },
    include: {
      customer: true,
      table: true,
      deposit: true,
    },
  });

  // ส่ง Email ยืนยัน
  await sendConfirmationEmail({
    to: reservation.customer.email,
    firstName: reservation.customer.firstName,
    referenceCode,
    date: reservation.reservationDate.toLocaleDateString("th-TH"),
    time: reservation.reservationTime,
    partySize: reservation.partySize,
    tableName: reservation.table.displayName,
    zone: reservation.table.zone,
    depositAmount: (reservation.deposit!.amountSatang / 100).toLocaleString(),
  });

  console.log(`✅ Reservation ${referenceCode} confirmed`);
}

async function handlePaymentExpired(session: Stripe.Checkout.Session) {
  const { reservationId, depositId } = session.metadata!;

  await prisma.deposit.update({
    where: { id: depositId },
    data: { paymentStatus: "failed" },
  });

  await prisma.reservation.update({
    where: { id: reservationId },
    data: { status: "cancelled", cancelledAt: new Date(), cancelReason: "Payment expired" },
  });

  console.log(`❌ Reservation ${reservationId} cancelled - payment expired`);
}
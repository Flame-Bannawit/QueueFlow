import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? "re_placeholder");
}

interface ConfirmationEmailProps {
  to: string;
  firstName: string;
  referenceCode: string;
  date: string;
  time: string;
  partySize: number;
  tableName: string;
  zone: string;
  depositAmount: string;
}

export async function sendConfirmationEmail(props: ConfirmationEmailProps) {
  const { firstName, referenceCode, date, time, partySize, tableName, zone, depositAmount } = props;
  try {
    await getResend().emails.send({
      from: "onboarding@resend.dev",
      to: "tiwsuphawit@gmail.com",
      subject: `✅ ยืนยันการจอง ${referenceCode}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a1a1a;">ยืนยันการจองโต๊ะ</h2>
          <p>สวัสดีคุณ${firstName},</p>
          <p>การจองของคุณได้รับการยืนยันแล้วครับ</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 12px;">รายละเอียดการจอง</h3>
            <p><strong>รหัสการจอง:</strong> ${referenceCode}</p>
            <p><strong>วันที่:</strong> ${date}</p>
            <p><strong>เวลา:</strong> ${time} น.</p>
            <p><strong>จำนวน:</strong> ${partySize} ท่าน</p>
            <p><strong>โต๊ะ:</strong> ${tableName} (${zone})</p>
            <p><strong>มัดจำที่ชำระ:</strong> ฿${depositAmount}</p>
          </div>
          <p style="color: #666; font-size: 14px;">
            กรุณาแสดงรหัสการจองเมื่อมาถึงร้าน<br/>
            หากต้องการยกเลิก กรุณาแจ้งล่วงหน้าอย่างน้อย 24 ชั่วโมง
          </p>
          <p>ขอบคุณที่ใช้บริการครับ 🙏</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Send email error:", error);
  }
}

interface RefundEmailProps {
  to: string;
  firstName: string;
  referenceCode: string;
  refundAmount: string;
}

export async function sendRefundEmail(props: RefundEmailProps) {
  const { firstName, referenceCode, refundAmount } = props;
  try {
    await getResend().emails.send({
      from: "onboarding@resend.dev",
      to: "tiwsuphawit@gmail.com",
      subject: `การยกเลิกการจอง ${referenceCode}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a1a1a;">ยืนยันการยกเลิกการจอง</h2>
          <p>สวัสดีคุณ${firstName},</p>
          <p>การจอง <strong>${referenceCode}</strong> ถูกยกเลิกเรียบร้อยแล้ว</p>
          <p>ยอดคืนเงิน: <strong>฿${refundAmount}</strong> จะเข้าบัตรภายใน 5-10 วันทำการ</p>
          <p>ขอบคุณครับ 🙏</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Send refund email error:", error);
  }
}
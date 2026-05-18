# QueueFlow — ระบบจองโต๊ะร้านอาหารออนไลน์

ระบบจองโต๊ะร้านอาหารแบบครบวงจร พร้อมการชำระมัดจำผ่าน Stripe และ Admin Dashboard สำหรับจัดการการจอง

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-green)
![Stripe](https://img.shields.io/badge/Payment-Stripe-purple)

## ✨ Features

### ฝั่งลูกค้า

- 🔍 ค้นหาโต๊ะว่างตามวันที่ เวลา และจำนวนคน
- 🪑 เลือกโต๊ะตาม Zone (Window, Garden, Main, Private, Banquet)
- 💳 ชำระมัดจำผ่าน Stripe Checkout (PCI DSS)
- ✅ รับ Email ยืนยันการจองอัตโนมัติ
- ❌ ยกเลิกและรับเงินคืนถ้าแจ้งล่วงหน้า 24 ชั่วโมง

### ฝั่ง Admin

- 📊 Dashboard สรุปยอดการจองและมัดจำประจำวัน
- 📋 รายการจองพร้อม Filter วันที่ / สถานะ / ค้นหา
- ✅ Check-in ลูกค้าเมื่อมาถึง
- 💰 Refund มัดจำผ่าน Stripe โดยตรง
- 🪑 จัดการโต๊ะ — แก้ไข / เปิด-ปิด / ปรับที่นั่ง

## 🛠 Tech Stack

| Layer    | Technology                                        |
| -------- | ------------------------------------------------- |
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend  | Next.js API Routes                                |
| Database | PostgreSQL (Supabase)                             |
| ORM      | Prisma 5                                          |
| Payment  | Stripe Checkout + Webhooks                        |
| Email    | Resend                                            |
| Deploy   | Vercel                                            |

## 🗄 Database Schema

restaurant_tables — โต๊ะในร้าน
customers — ข้อมูลลูกค้า
reservations — การจองโต๊ะ
deposits — มัดจำ + Stripe fields
admins — ผู้ดูแลระบบ

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Supabase)
- Stripe account
- Resend account

### Installation

```bash
# Clone repo
git clone https://github.com/YOUR_USERNAME/queueflow.git
cd queueflow

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# แก้ไข .env ใส่ค่าจริง

# Setup database
npx prisma migrate dev
npm run db:seed

# Run development server
npm run dev
```

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Resend
RESEND_API_KEY="re_..."
```

### Stripe Webhook (Local Development)

```bash
# ติดตั้ง Stripe CLI แล้วรัน
./stripe listen --forward-to localhost:3000/api/webhooks
```

## 📱 Screenshots

### หน้าจองโต๊ะ

- เลือกวันที่ / เวลา / จำนวนคน
- กรองโต๊ะตาม Zone
- สรุปยอดมัดจำใน Sidebar

### Admin Dashboard

- Stats วันนี้ (จอง / ยืนยัน / รอยืนยัน / มัดจำ)
- รายการจองพร้อมปุ่ม Check-in และ Refund
- จัดการโต๊ะแยกตาม Zone

## 💡 Business Logic

- **มัดจำ:** ฿200 / ท่าน ชำระผ่าน Stripe Checkout
- **Webhook:** ยืนยันการจองอัตโนมัติหลังชำระสำเร็จ
- **Refund:** ยกเลิกก่อน 24 ชม. = คืนเต็ม, หลัง = ไม่คืน
- **Race Condition:** ป้องกันการจองโต๊ะซ้ำด้วย conflict check

## 📄 License

MIT License

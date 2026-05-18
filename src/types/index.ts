export type TableStatus = "available" | "reserved" | "maintenance";
export type BookingStatus =
  | "pending"
  | "confirmed"
  | "seated"
  | "completed"
  | "cancelled"
  | "no_show";
export type PaymentStatus = "pending" | "paid" | "refunded" | "failed";

export interface Table {
  id: string;
  tableNumber: string;
  displayName: string;
  seats: number;
  zone: string;
  status: TableStatus;
}

export interface CreateReservationInput {
  tableId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  reservationDate: string;
  reservationTime: string;
  partySize: number;
  specialRequests?: string;
  occasion?: string;
}

export interface ReservationWithDetails {
  id: string;
  referenceCode: string;
  reservationDate: Date;
  reservationTime: string;
  partySize: number;
  status: BookingStatus;
  specialRequests: string | null;
  occasion: string | null;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  table: {
    tableNumber: string;
    displayName: string;
    zone: string;
    seats: number;
  };
  deposit: {
    amountSatang: number;
    paymentStatus: PaymentStatus;
    paidAt: Date | null;
    refundedAmountSatang: number;
  } | null;
}
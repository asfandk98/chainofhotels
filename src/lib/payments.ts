import httpClient from "./httpClient";

export interface InitiatePaymentPayload {
  total: number;
  email: string;
  hotel_id?: string | number;
  room_id?: string | number | null;
  check_in: string;
  check_out: string;
  guests: { adults: number; children: number };
  night_rate: number;
  seasonal_price_id?: string | number | null;
  description: string;
}
export interface VerifyPaymentResponse {
  success: boolean;
  booking_id?: string | number;
  amount?: number | string;
  currency?: string;
  hotel_name?: string;
  room_name?: string;
  check_in?: string;
  check_out?: string;
  nights?: number | string;
  guests?: number | string;
  email?: string;
  subtotal?: number | string;
  tax?: number | string;
  tourism_fee?: number | string;
}

// NOTE: your old code called a relative "/api/payments/verify" (a Next.js
// API route), while initiate was called directly against Laravel per your
// earlier answer. This uses the same direct-to-Laravel pattern as initiate
// for consistency — flag it if verify actually needs to stay server-side.
export async function verifyPayment(orderId: string): Promise<VerifyPaymentResponse> {
  const { data } = await httpClient.get<VerifyPaymentResponse>("/payments/verify", {
    params: { order_id: orderId },
  });
  return data;
}
export interface InitiatePaymentResponse {
  session_id: string;
  mpgs_js: string;
}

// Hits Laravel directly at API_BASE_URL/payments/initiate — httpClient's
// request interceptor already attaches the bearer token from localStorage,
// so no need to pass Authorization manually here.
export async function initiatePayment(
  payload: InitiatePaymentPayload
): Promise<InitiatePaymentResponse> {
  const { data } = await httpClient.post<InitiatePaymentResponse>("/payments/initiate", payload);
  return data;
}
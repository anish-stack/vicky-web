import { request } from "./api";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

function loadScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);

    const el = document.createElement("script");
    el.src = SCRIPT;
    el.async = true;
    el.onload = () => resolve(true);
    el.onerror = () => resolve(false);
    document.body.appendChild(el);
  });
}

/**
 * Opens Razorpay checkout for a trip or a tour booking.
 * The order amount is decided by the API from the stored record — nothing
 * about the price is sent from here.
 */
export async function startRazorpay({
  payload,
  user,
  onSuccess,
  onFailure,
}: {
  payload: { trip?: string; tourBooking?: string };
  user?: any;
  onSuccess: (transaction: any) => void;
  onFailure: (message: string) => void;
}) {
  const ready = await loadScript();
  if (!ready) return onFailure("Could not load the payment window. Check your connection and try again.");

  const { data: order } = await request("post", "/payments/create-order", payload);

  const rzp = new window.Razorpay({
    key: order.key,
    order_id: order.orderId,
    amount: order.amount,
    currency: order.currency,
    name: "TaxiSafar",
    description: "Booking payment",
    prefill: {
      name: order.prefill?.name || user?.name || "",
      email: order.prefill?.email || user?.email || "",
      contact: order.prefill?.contact || user?.phoneNumber || "",
    },
    theme: { color: "#EF3124" },
    handler: async (response: any) => {
      try {
        const { data } = await request("post", "/payments/verify", {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        });
        onSuccess(data.transaction);
      } catch (err: any) {
        onFailure(err.message);
      }
    },
    modal: {
      ondismiss: () => onFailure("Payment was cancelled. Your booking is saved and still unpaid."),
    },
  });

  rzp.on("payment.failed", async (response: any) => {
    await request("post", "/payments/failed", {
      razorpay_order_id: order.orderId,
      reason: response.error?.reason,
      description: response.error?.description,
    }).catch(() => {});
    onFailure(response.error?.description || "Payment failed. Please try another method.");
  });

  rzp.open();
}

import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe-server";
import { TIERS } from "@/lib/config";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  try {
    const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        console.log(`[stripe] Checkout completed: ${session.customer_email} → ${session.metadata?.tier || "unknown"}`);
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        console.log(`[stripe] Subscription canceled: ${sub.customer}`);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe-server";
import { TIERS } from "@/lib/config";

export async function POST(req: NextRequest) {
  const { email, tier } = await req.json();

  if (!email || !tier || !TIERS[tier as keyof typeof TIERS]) {
    return NextResponse.json({ error: "email and valid tier required" }, { status: 400 });
  }

  const tierConfig = TIERS[tier as keyof typeof TIERS];
  if (!tierConfig.priceId) {
    return NextResponse.json({ error: "Free tier does not require checkout" }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [{ price: tierConfig.priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?upgraded=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/#pricing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

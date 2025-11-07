import { NextResponse } from "next/server"

const PAYJP_SECRET_KEY = process.env.PAYJP_SECRET_KEY
const DEFAULT_PLAN_ID = process.env.PAYJP_PLAN_ID

function buildAuthHeader() {
  if (!PAYJP_SECRET_KEY) {
    throw new Error("PAYJP_SECRET_KEY is not configured")
  }
  return `Basic ${Buffer.from(`${PAYJP_SECRET_KEY}:`).toString("base64")}`
}

async function payjpRequest<T = unknown>(path: string, params: Record<string, string>) {
  const response = await fetch(`https://api.pay.jp${path}`, {
    method: "POST",
    headers: {
      Authorization: buildAuthHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(params),
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => undefined)
    const message = errorBody?.error?.message ?? response.statusText
    throw new Error(message)
  }

  return (await response.json()) as T
}

export async function POST(request: Request) {
  try {
    const { tokenId, email, name, plan = "pro", uid } = (await request.json()) as {
      tokenId?: string
      email?: string
      name?: string
      plan?: string
      uid?: string
    }

    if (!tokenId) {
      return NextResponse.json({ error: "tokenId is required" }, { status: 400 })
    }

    if (!PAYJP_SECRET_KEY) {
      return NextResponse.json({ error: "PAY.JP secret key is not configured" }, { status: 500 })
    }

    const planId = DEFAULT_PLAN_ID
    if (!planId) {
      return NextResponse.json({ error: "PAYJP_PLAN_ID is not configured" }, { status: 500 })
    }

    // 1. 顧客を作成
    const customer = await payjpRequest<{ id: string }>("/v1/customers", {
      card: tokenId,
      email: email ?? "",
      description: name ?? "",
    })

    // 2. サブスクリプションを作成
    const subscription = await payjpRequest<{ id: string; status: string }>("/v1/subscriptions", {
      customer: customer.id,
      plan: planId,
      metadata: JSON.stringify({ plan, uid: uid ?? "", email: email ?? "" }),
    })

    return NextResponse.json({
      status: "ok",
      subscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      customerId: customer.id,
    })
  } catch (error) {
    console.error("[payments] Failed to process request", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "決済処理に失敗しました。" },
      { status: 500 },
    )
  }
}

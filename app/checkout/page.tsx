"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, ShieldCheck } from "lucide-react"

declare global {
  interface Window {
    Payjp?: (publicKey: string) => any
  }
}

const PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYJP_PUBLIC_KEY ?? ""

export default function CheckoutPage() {
  const [payjp, setPayjp] = useState<any>(null)
  const [cardElement, setCardElement] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")

  useEffect(() => {
    if (!PUBLIC_KEY) return
    if (typeof window === "undefined") return
    if (window.Payjp && payjp) return
    const existing = document.getElementById("payjp-script")
    const loadScript = () => {
      if (!window.Payjp) return
      const instance = window.Payjp(PUBLIC_KEY)
      setPayjp(instance)
    }
    if (!existing) {
      const script = document.createElement("script")
      script.id = "payjp-script"
      script.src = "https://js.pay.jp/v2/pay.js"
      script.async = true
      script.onload = loadScript
      document.body.appendChild(script)
    } else {
      existing.addEventListener("load", loadScript)
    }
  }, [])

  useEffect(() => {
    if (!payjp) return
    const elements = payjp.elements()
    const card = elements.create("card", {
      style: {
        base: {
          fontSize: "16px",
          color: "#1f2933",
        },
      },
    })
    card.mount("#payjp-card")
    setCardElement(card)
    return () => {
      card.unmount()
    }
  }, [payjp])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!payjp || !cardElement) return
    setSubmitting(true)
    setError(null)
    try {
      const { token, error: tokenError } = await payjp.createToken(cardElement)
      if (tokenError) {
        setError(tokenError.message ?? "カード情報の認証に失敗しました。")
        setSubmitting(false)
        return
      }
      if (!token?.id) {
        setError("カードトークンの生成に失敗しました。入力内容を確認してください。")
        setSubmitting(false)
        return
      }

      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenId: token.id,
          plan: "pro",
          email,
          name,
        }),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body?.error ?? "決済処理に失敗しました。")
      }

      setSuccess(true)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "決済処理に失敗しました。")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-10 px-6 py-16">
      <section>
        <Badge variant="secondary" className="mb-4">
          CHECKOUT
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Pro プランへのアップグレード</h1>
        <p className="mt-2 text-muted-foreground">
          月額 ¥500 で分析回数の制限なし、広告なし、株特化AIチャットなどプロ向け機能をご利用いただけます。
        </p>
      </section>

      <div className="grid gap-8 md:grid-cols-[1.2fr,1fr]">
        <Card className="border-2">
          <CardHeader>
            <CardTitle>お支払い情報</CardTitle>
            <CardDescription>安全な PAY.JP 決済を利用しています。クレジットカード情報は当社サーバーに保存されません。</CardDescription>
          </CardHeader>
          <CardContent>
            {!PUBLIC_KEY ? (
              <Alert variant="destructive">
                <AlertTitle>環境変数が設定されていません</AlertTitle>
                <AlertDescription>
                  NEXT_PUBLIC_PAYJP_PUBLIC_KEY を設定してから再度このページを読み込んでください。
                </AlertDescription>
              </Alert>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid gap-2">
                  <Label htmlFor="name">カード名義</Label>
                  <Input
                    id="name"
                    placeholder="山田 太郎"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">メールアドレス</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label>カード情報</Label>
                  <div
                    id="payjp-card"
                    className="rounded-md border border-dashed border-muted-foreground/40 bg-white p-4"
                  />
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertTitle>エラー</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert>
                    <AlertTitle>決済が完了しました</AlertTitle>
                    <AlertDescription>Pro プランが有効になりました。ダッシュボードに戻って分析を開始しましょう。</AlertDescription>
                  </Alert>
                )}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={submitting || !payjp || !cardElement || success}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      決済処理中...
                    </>
                  ) : (
                    "Pro プランにアップグレード"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <ShieldCheck className="h-4 w-4" />
              <span>PAY.JP により決済情報は安全にトークン化されます。</span>
            </div>
            <p>
              決済完了後は自動的に Pro プランが有効になります。領収書は入力いただいたメールアドレス宛に送信されます。
            </p>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>プランの内容</CardTitle>
            <CardDescription>Pro プランで利用できる機能をまとめました。</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              <li>・分析回数：無制限</li>
              <li>・広告なし、Firestore 保存無制限</li>
              <li>・株特化 AI チャット、優先処理</li>
              <li>・CSV/グラフ/比較ビューでのエクスポート</li>
            </ul>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button asChild variant="outline" className="w-full">
              <Link href="/pricing">プランの詳細を見る</Link>
            </Button>
            <p className="text-xs text-muted-foreground">
              決済は PAY.JP を通じて処理されます。利用規約とプライバシーポリシーをご確認のうえお申し込みください。
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

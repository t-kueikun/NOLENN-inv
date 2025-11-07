import type { Metadata } from "next"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = {
  title: "プランと料金",
  description: "Free / Pro プランの違いと、アップグレードのメリットをご確認ください。",
}

const plans = [
  {
    name: "Free",
    badge: "個人向け",
    price: "¥0",
    description: "趣味や学習で企業情報をチェックしたい方向け。",
    features: [
      "1日9社までの分析",
      "動画視聴で追加 +3 社/日",
      "Firestore 保存：無制限",
      "広告あり（追加枠利用時のみ）",
    ],
    cta: {
      label: "無料で使う",
      href: "/dashboard",
      variant: "outline" as const,
    },
  },
  {
    name: "Pro",
    badge: "おすすめ",
    price: "¥980 / 月",
    description: "業務で意思決定を行うアナリスト・投資家のためのプラン。",
    features: [
      "分析回数：無制限",
      "Firestore 保存：無制限",
      "広告なし",
      "株特化AIチャット付き",
      "高速・優先処理",
      "CSV / グラフ / 比較ビューのエクスポート",
    ],
    cta: {
      label: "今すぐアップグレード",
      href: "/checkout",
      variant: "default" as const,
    },
  },
]

const faqs = [
  {
    question: "支払い方法は？",
    answer: "主要なクレジットカードおよびデビットカードに対応しています。毎月自動更新で、いつでもプラン変更・解約が可能です。",
  },
  {
    question: "チームで利用できますか？",
    answer: "Pro プランでは Firestore に保存したレポートをチームメンバーと共有できます。ご希望に応じてエンタープライズ向けの仕様調整も行えます。",
  },
  {
    question: "AI 分析の上限は変更できますか？",
    answer: "Pro プランの上限を超える分析が必要な場合はお問い合わせください。利用状況に応じたカスタムプランをご提案します。",
  },
]

export default function PricingPage() {
  return (
    <div className="container mx-auto flex max-w-5xl flex-col gap-16 px-6 py-16">
      <section className="text-center">
        <Badge variant="secondary" className="mb-4">
          PLAN & PRICING
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">あなたの分析スタイルに合わせた2つのプラン</h1>
        <p className="mt-4 text-muted-foreground">
          Free プランで基本的な機能を体験し、より高速・高度な分析が必要になったら Pro へアップグレード。
        </p>
      </section>

      <section className="grid gap-8 md:grid-cols-2">
        {plans.map((plan) => (
          <Card key={plan.name} className="flex flex-col border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-semibold">{plan.name}</CardTitle>
                <Badge>{plan.badge}</Badge>
              </div>
              <CardDescription>{plan.description}</CardDescription>
              <p className="text-3xl font-bold">{plan.price}</p>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm leading-relaxed">
                    <span className="mt-1 h-2 w-2 rounded-full bg-primary" aria-hidden />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild variant={plan.cta.variant} className="w-full">
                <Link href={plan.cta.href}>{plan.cta.label}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </section>

      <section>
        <h2 className="text-2xl font-semibold">よくあるご質問</h2>
        <Separator className="my-4" />
        <div className="space-y-6">
          {faqs.map(({ question, answer }) => (
            <div key={question}>
              <h3 className="text-lg font-medium">{question}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{answer}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const features = [
  {
    title: "競合比較を一目で",
    description: "最大3社の強み・課題・見通しをAIが自動生成し、投資判断のヒントを並べて確認できます。",
  },
  {
    title: "日本語で実務的な要約",
    description: "決算やIR情報を踏まえた自然な日本語で、重要ポイントだけを簡潔にサマリー。",
  },
  {
    title: "カスタマイズ可能なワークフロー",
    description: "ロゴや基本指標を揃えて比較できるから、レポート作成や社内共有にもそのまま使えます。",
  },
]

const exampleComparisons = [
  {
    title: "家電量販 × 住設",
    description: "住宅とのシナジー戦略が進む家電量販大手を比較。",
    tickers: ["9831.T", "7419.T", "3048.T"],
    highlight: "住宅リモデルの有無が投資判断を分ける",
    scoreRange: "63 - 72",
  },
  {
    title: "総合商社",
    description: "世界展開と脱炭素戦略が鍵となるメガトレーダー。",
    tickers: ["8058.T", "8053.T", "8031.T"],
    highlight: "資源価格敏感度と事業多角化を比較",
    scoreRange: "66 - 78",
  },
  {
    title: "IT プラットフォーム",
    description: "国内DXを牽引する SaaS / プラットフォーム企業。",
    tickers: ["4755.T", "9418.T", "3923.T"],
    highlight: "サブスク収益と継続率の強さがポイント",
    scoreRange: "60 - 75",
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="flex items-center justify-between max-w-6xl mx-auto px-6 py-5">
          <Link href="/" className="text-xl font-semibold text-gray-900">
            AIDE
          </Link>
          <nav className="flex items-center gap-3">
            <Button variant="ghost" className="font-medium" asChild>
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button className="rounded-full font-medium" asChild>
              <Link href="/sign-up">Sign up</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main>
        <section className="border-b border-gray-200 bg-linear-to-b from-white to-gray-50">
          <div className="max-w-6xl mx-auto grid gap-12 px-6 py-24 md:grid-cols-2 md:items-center">
            <div className="space-y-8">
              <p className="inline-flex items-center rounded-full bg-blue-50 px-4 py-1 text-sm font-medium text-blue-600">
                投資先の比較を、もっと簡単に
              </p>
              <h1 className="text-4xl font-semibold text-gray-900 md:text-5xl">
                企業の強み・リスクをAIが要約。比較と判断をこれ1つで。
              </h1>
              <p className="text-lg leading-8 text-gray-600">
                証券コードを入力するだけで、競合との相対的な立ち位置や押さえるべきポイントを抽出。投資メモづくりやチームでの検討にすぐ活用できます。
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="rounded-full px-6 font-semibold" asChild>
                  <Link href="/sign-up">
                    無料で使ってみる
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="rounded-full px-6 font-semibold" asChild>
                  <Link href="/dashboard">ダッシュボードを見る</Link>
                </Button>
              </div>
            </div>

            <div className="space-y-6 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>比較対象</span>
                <span>ヤマダ電機 / ノジマ / ビックカメラ</span>
              </div>
              <div className="grid gap-4">
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <p className="text-xs font-semibold uppercase text-blue-600">強み</p>
                  <p className="mt-3 text-sm text-gray-700">
                    「住宅×家電」モデルの高付加価値販売が進展。リフォーム・リユース事業の成長が収益を押し上げ。
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <p className="text-xs font-semibold uppercase text-rose-600">課題</p>
                  <p className="mt-3 text-sm text-gray-700">
                    ECシフトへの対応が課題。都市部での店舗網拡充が遅れ、競争激化による利益率低下リスク。
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <p className="text-xs font-semibold uppercase text-emerald-600">見通し</p>
                  <p className="mt-3 text-sm text-gray-700">
                    DX投資とオムニチャネル戦略で改善余地。サービス事業の拡張で売上構成が分散。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-20">
          <div className="mb-12">
            <h2 className="text-3xl font-semibold text-gray-900">AIDE が選ばれる理由</h2>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-gray-600">
              情報収集から比較、チームでの共有まで。投資判断に必要なステップを一つのワークスペースで完結させます。
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-4 text-sm leading-6 text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-gray-200 bg-gray-50">
          <div className="max-w-6xl mx-auto px-6 py-20">
            <div className="mb-12">
              <h2 className="text-3xl font-semibold text-gray-900">人気の比較事例</h2>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-gray-600">
                業界やテーマごとの代表的な比較セットを用意。ボタン一つでダッシュボードに読み込み、すぐに分析結果をチェックできます。
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {exampleComparisons.map((example) => (
                <div key={example.title} className="flex flex-col justify-between rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">Ticker Set</p>
                      <p className="mt-1 text-sm text-gray-500">{example.tickers.join(" / ")}</p>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">{example.title}</h3>
                    <p className="text-sm leading-6 text-gray-700">{example.description}</p>
                    <div className="rounded-2xl bg-gray-50 p-4">
                      <p className="text-xs font-semibold uppercase text-gray-500">注目ポイント</p>
                      <p className="mt-2 text-sm text-gray-700">{example.highlight}</p>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
                    <div>
                      <p className="font-medium text-gray-600">スコア帯</p>
                      <p className="text-gray-500">{example.scoreRange}</p>
                    </div>
                    <Button asChild className="rounded-full px-5 font-semibold">
                      <Link
                        href={{
                          pathname: "/dashboard",
                          query: { tickers: example.tickers.join(",") },
                        }}
                      >
                        ダッシュボードで見る
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-gray-50 border-y border-gray-200">
          <div className="max-w-6xl mx-auto px-6 py-16 text-center">
            <h2 className="text-3xl font-semibold text-gray-900">投資判断をスピードアップしましょう</h2>
            <p className="mt-4 text-lg text-gray-600">
              サインアップしてダッシュボードにアクセス。気になる企業の比較を数分で始められます。
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button size="lg" className="rounded-full px-6 font-semibold" asChild>
                <Link href="/sign-up">今すぐ登録する</Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-6 font-semibold" asChild>
                <Link href="/sign-in">既にアカウントをお持ちの方</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

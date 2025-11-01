"use client"

import Image from "next/image"
import { useCallback, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface CompanyInsight {
  company: string
  ticker: string
  founded: string
  representative: string
  location: string
  capital: string
  strengths: string[]
  risks: string[]
  outlook: string[]
  score: number
  commentary: string
  logo?: string
}

export default function DashboardPage() {
  const searchParams = useSearchParams()
  const [tickers, setTickers] = useState(["", "", ""])
  const [companies, setCompanies] = useState<(CompanyInsight | null)[]>([null, null, null])
  const [loading, setLoading] = useState([false, false, false])
  const [errors, setErrors] = useState(["", "", ""])

  const analyzeCompany = useCallback(async (index: number, providedTicker?: string) => {
    const ticker = (providedTicker ?? tickers[index]).trim()
    if (!ticker) return

    setLoading((prev) => prev.map((l, i) => (i === index ? true : l)))
    setErrors((prev) => prev.map((e, i) => (i === index ? "" : e)))

    try {
      const response = await fetch(`/api/insights?ticker=${encodeURIComponent(ticker)}`)

      if (!response.ok) {
        throw new Error("分析に失敗しました")
      }

      const data = await response.json()

      setCompanies((prev) => prev.map((c, i) => (i === index ? data : c)))
    } catch (err) {
      setErrors((prev) =>
        prev.map((e, i) => (i === index ? (err instanceof Error ? err.message : "分析に失敗しました") : e)),
      )
    } finally {
      setLoading((prev) => prev.map((l, i) => (i === index ? false : l)))
    }
  }, [tickers])

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600"
    return "text-orange-500"
  }

  useEffect(() => {
    const preset = searchParams.get("tickers")
    if (!preset) return

    const tokens = preset
      .split(",")
      .map((token) => token.trim())
      .filter(Boolean)
      .slice(0, 3)

    if (tokens.length === 0) return

    setTickers((prev) => {
      const next = [...prev]
      tokens.forEach((ticker, index) => {
        next[index] = ticker
      })
      for (let i = tokens.length; i < next.length; i += 1) {
        next[i] = ""
      }
      return next
    })

    tokens.forEach((ticker, index) => {
      analyzeCompany(index, ticker)
    })
  }, [analyzeCompany, searchParams])

  const validCompanies = companies.filter((c): c is CompanyInsight => c !== null)

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="flex items-center justify-between max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-900">AIDE</h1>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="font-medium" asChild>
              <a href="/sign-in">Sign in</a>
            </Button>
            <Button className="rounded-full font-medium" asChild>
              <a href="/sign-up">Sign up</a>
            </Button>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 py-16 text-center">
        <h2 className="text-5xl font-semibold text-gray-900 mb-4">企業を比較する。</h2>
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
          証券コードを入力して、AIによる投資判断材料を並べて比較できます。
        </p>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[0, 1, 2].map((index) => (
              <div key={index} className="space-y-2">
                <Input
                  type="text"
                  placeholder="例：9831.T"
                  value={tickers[index]}
                  onChange={(e) => setTickers((prev) => prev.map((t, i) => (i === index ? e.target.value : t)))}
                  onKeyDown={(e) => e.key === "Enter" && analyzeCompany(index)}
                  className="h-12 text-base rounded-full border-gray-300"
                  disabled={loading[index]}
                />
                <Button
                  onClick={() => analyzeCompany(index)}
                  disabled={loading[index] || !tickers[index].trim()}
                  className="w-full h-10 rounded-full bg-blue-600 hover:bg-blue-700 font-medium text-white text-sm"
                >
                  {loading[index] ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      分析中
                    </span>
                  ) : (
                    "分析"
                  )}
                </Button>
                {errors[index] && <p className="text-xs text-red-600">{errors[index]}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {validCompanies.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 pb-24">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
            {companies.map((company, index) => (
              <div key={index} className="flex flex-col items-center gap-6">
                <div
                  className={`inline-flex rounded-full border px-6 py-2 text-sm font-semibold ${
                    company ? "border-gray-300 text-gray-900" : "border-gray-200 bg-gray-50 text-gray-400"
                  }`}
                >
                  {company ? company.company : "未入力"}
                </div>
                <div
                  className={`w-full rounded-3xl border bg-white px-8 py-10 shadow-sm ${
                    company ? "border-gray-300" : "border-dashed border-gray-200"
                  }`}
                >
                  {company ? (
                    <div className="flex flex-col items-center gap-8">
                      <div className="flex h-24 w-full items-center justify-center">
                        {company.logo ? (
                          <Image
                            src={company.logo}
                            alt={`${company.company}のロゴ`}
                            width={160}
                            height={64}
                            className="h-16 w-auto object-contain"
                            unoptimized
                          />
                        ) : (
                          <span className="text-sm text-gray-400">ロゴが見つかりませんでした</span>
                        )}
                      </div>

                      <hr className="w-full border-gray-200" />

                      <div className="w-full space-y-4 text-left text-sm leading-6 text-gray-900">
                        <div>
                          <span className="font-semibold">設立：</span>
                          {company.founded}
                        </div>
                        <div>
                          <span className="font-semibold">代表者名：</span>
                          {company.representative}
                        </div>
                        <div>
                          <span className="font-semibold">所在地：</span>
                          {company.location}
                        </div>
                        <div>
                          <span className="font-semibold">資本金：</span>
                          {company.capital}
                        </div>
                      </div>

                      <hr className="w-full border-gray-200" />

                      <div className="w-full space-y-6 text-left">
                        <section>
                          <h5 className="mb-3 text-base font-semibold text-gray-900">強み</h5>
                          <ul className="space-y-2 text-sm leading-6 text-gray-800">
                            {company.strengths.map((strength, idx) => (
                              <li key={idx} className="relative pl-4">
                                <span className="absolute left-0 top-2 h-1.5 w-1.5 rounded-full bg-gray-400" />
                                {strength}
                              </li>
                            ))}
                          </ul>
                        </section>

                        <section>
                          <h5 className="mb-3 text-base font-semibold text-gray-900">課題</h5>
                          <ul className="space-y-2 text-sm leading-6 text-gray-800">
                            {company.risks.map((risk, idx) => (
                              <li key={idx} className="relative pl-4">
                                <span className="absolute left-0 top-2 h-1.5 w-1.5 rounded-full bg-gray-400" />
                                {risk}
                              </li>
                            ))}
                          </ul>
                        </section>

                        <section>
                          <h5 className="mb-3 text-base font-semibold text-gray-900">見通し</h5>
                          <ul className="space-y-2 text-sm leading-6 text-gray-800">
                            {company.outlook.map((outlook, idx) => (
                              <li key={idx} className="relative pl-4">
                                <span className="absolute left-0 top-2 h-1.5 w-1.5 rounded-full bg-gray-400" />
                                {outlook}
                              </li>
                            ))}
                          </ul>
                        </section>
                      </div>

                      <hr className="w-full border-gray-200" />

                      <div className="w-full text-center">
                        <p className="text-base font-semibold text-gray-900">総合スコア</p>
                        <p className={`text-2xl font-bold ${getScoreColor(company.score)}`}>
                          {company.score}
                          <span className="ml-1 text-sm font-medium text-gray-500">/ 100</span>
                        </p>
                        <p className="mt-2 text-sm text-gray-600">{company.commentary}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex min-h-[420px] flex-col items-center justify-center gap-4 text-sm text-gray-400">
                      <div className="h-20 w-20 rounded-full border border-dashed border-gray-200" />
                      <p className="text-center leading-6">
                        企業を入力すると
                        <br />
                        情報が表示されます
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {validCompanies.length === 0 && (
        <div className="text-center py-24 px-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
            <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">企業を追加して比較を開始</h3>
          <p className="text-base text-gray-600 max-w-md mx-auto leading-relaxed">
            証券コードを入力すると、AIが企業分析を生成します。
          </p>
        </div>
      )}
    </div>
  )
}

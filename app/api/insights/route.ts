import { type NextRequest, NextResponse } from "next/server"

const MOCK_DATA: Record<string, any> = {
  "9831.T": {
    company: "ヤマダホールディングス",
    ticker: "9831.T",
    founded: "1983年9月",
    representative: "山田 昇",
    location: "群馬県高崎市",
    capital: "711億円",
    strengths: ["住宅×家電の連携による高単価販売", "プライベートブランド比率の上昇", "リフォーム・リユース事業の成長"],
    risks: ["家電単体販売の利益率が低い", "ECシフトへの対応が遅れ気味", "都市部での店舗網が限定的"],
    outlook: ["住宅・家電一体モデルの拡大余地", "DX化で在庫・人員源泉が進展", "低価格競争から脱却し収益構造へ"],
    score: 72,
    commentary: "→「成熟×再成長」フェーズ。リフォーム事業が収益を押し上げ。",
  },
  "7419.T": {
    company: "ノジマ",
    ticker: "7419.T",
    founded: "1962年4月",
    representative: "野島 廣司",
    location: "神奈川県横浜市",
    capital: "63億3,050万円",
    strengths: ["通信キャリア販売と家電の相乗効果", "提案型接客による高い顧客満足度", "グループ会社とのDX連携が進む"],
    risks: ["人件費や店舗運営コストの上昇", "非家電領域の収益基盤がまだ弱い", "全国展開スピードが緩やか"],
    outlook: ["通信×家電モデルの深化に期待", "EC併用で営業効率が向上傾向", "成長率は安定も収益性改善がカギ"],
    score: 63,
    commentary: "→顧客接点の強さが武器。利益率改善に向けた再構築期。",
  },
  "3048.T": {
    company: "ビックカメラ",
    ticker: "3048.T",
    founded: "1983年9月1日",
    representative: "秋保 徹",
    location: "東京都豊島区",
    capital: "259億2,900万円",
    strengths: [
      "都市立地＋EC連携による高回転モデル",
      "グループ内仕入・物流の効率化",
      "家電以外（医薬・酒類・玩具）の多角化",
    ],
    risks: ["家電量販業界の競争激化", "粗利率の変動が収益に直結", "地方展開が限定的"],
    outlook: [
      "オムニチャネルで収益安定化が進む",
      "顧客データ活用によりリピート率向上",
      "店舗リニューアルとEC統合の加速",
    ],
    score: 68,
    commentary: "→「都市型ECハイブリッド」の成功モデル。効率改善で上昇余地大。",
  },
}

interface InsightCacheEntry {
  timestamp: number
  data: Record<string, unknown>
}

const CACHE_TTL_MS = 1000 * 60 * 60 * 6
const insightsCache = new Map<string, InsightCacheEntry>()

async function fetchCompanyLogo(ticker: string): Promise<string | null> {
  const apiKey = process.env.FMP_API_KEY
  if (!apiKey) return null

  const variations = [ticker]

  if (ticker.includes(".")) {
    const [base] = ticker.split(".")
    if (base) variations.push(base)
    const [prefix, suffix] = ticker.split(".")
    if (prefix && suffix) {
      variations.push(`${suffix.toUpperCase()}:${prefix}`)
      variations.push(`${suffix.toLowerCase()}:${prefix}`)
    }
  }

  for (const symbol of variations) {
    try {
      const response = await fetch(
        `https://financialmodelingprep.com/api/v3/profile/${encodeURIComponent(symbol)}?apikey=${apiKey}`,
        {
          next: { revalidate: 60 * 60 },
        },
      )

      if (!response.ok) {
        continue
      }

      const profiles = await response.json()
      const profile = Array.isArray(profiles) ? profiles[0] : undefined
      const logo = profile?.image

      if (typeof logo === "string" && logo.startsWith("http")) {
        return logo
      }
    } catch (error) {
      console.error("FMP logo fetch error:", error)
    }
  }

  return null
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const ticker = searchParams.get("ticker")

  if (!ticker) {
    return NextResponse.json({ error: "証券コードを入力してください" }, { status: 400 })
  }

  // Check if mock data exists
  if (MOCK_DATA[ticker]) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500))
    const logo = await fetchCompanyLogo(ticker)
    const data = logo ? { ...MOCK_DATA[ticker], logo } : { ...MOCK_DATA[ticker] }
    insightsCache.set(ticker, { timestamp: Date.now(), data })
    return NextResponse.json(data)
  }

  const cached = insightsCache.get(ticker)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(cached.data)
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini APIキーが設定されていません。環境変数 GEMINI_API_KEY を設定してください。" },
        { status: 500 },
      )
    }

    const prompt = `あなたは金融アナリストAIです。
指定された日本企業の直近決算データ・IR要約（またはニュース概要）から、
投資判断に役立つ「強み」「課題」「見通し」を簡潔に抽出し、スコアを算出します。

証券コード: ${ticker}

以下の条件で出力してください：
- 出力形式は必ず JSON のみ（説明文やMarkdown記号は不要）
- すべての文は中立で事実に基づく
- 各配列の最大要素数は：
  - strengths：3件（各30文字以内）
  - risks：3件（各30文字以内）
  - outlook：3件（各30文字以内）
- スコアは 0〜100 の整数値
- commentary は総合スコアの簡潔な説明（50文字以内）
- 企業情報（設立年、代表者、所在地、資本金）も含める
- 日本語で出力する

出力フォーマット例：
{
  "company": "企業名",
  "ticker": "${ticker}",
  "founded": "1983年9月",
  "representative": "代表者名",
  "location": "所在地（都道府県・市区町村）",
  "capital": "資本金",
  "strengths": ["強み1", "強み2", "強み3"],
  "risks": ["課題1", "課題2", "課題3"],
  "outlook": ["見通し1", "見通し2", "見通し3"],
  "score": 70,
  "commentary": "→スコアの簡潔な説明文。"
}`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
          },
        }),
      },
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Gemini API error:", errorData)
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text ?? "").join("").trim()

    if (!text) {
      throw new Error("AI応答が空です")
    }

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("AI応答の解析に失敗しました")
    }

    const analysis = JSON.parse(jsonMatch[0])

    if (
      !analysis.company ||
      !analysis.founded ||
      !analysis.representative ||
      !analysis.location ||
      !analysis.capital ||
      !analysis.strengths ||
      !analysis.risks ||
      !analysis.outlook ||
      !analysis.commentary ||
      typeof analysis.score !== "number"
    ) {
      throw new Error("AI応答の形式が不正です")
    }

    const logo = await fetchCompanyLogo(ticker)
    const result = logo ? { ...analysis, logo } : analysis
    insightsCache.set(ticker, { timestamp: Date.now(), data: result })
    return NextResponse.json(result)
  } catch (error) {
    console.error("AI analysis error:", error)
    return NextResponse.json({ error: "分析中にエラーが発生しました。もう一度お試しください。" }, { status: 500 })
  }
}

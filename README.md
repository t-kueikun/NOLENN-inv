# NOLENN

NOLENN は、企業の基本情報や市場データ、決算情報をもとに、銘柄の強み・リスク・見通しを日本語で整理し、最大3社を比較する投資分析アプリです。分析結果の保存、銘柄候補の提案、Free / Pro プランにも対応しています。

**アプリを使う:** [https://nolenn.com](https://nolenn.com)

## 主な機能

- 証券コードや企業名から企業情報・AI分析を取得
- 最大3社の分析結果を並べて比較
- 強み、リスク、見通し、スコア、企業概要などを表示
- EDINET の提出書類から代表者・本社所在地・資本金を取得
- 比較履歴、保存済み分析、ダッシュボード設定を利用
- Firebase Authentication によるアカウント管理
- Gemini による関連銘柄候補の提案
- PAY.JP による Pro プラン決済

## 技術スタック

- Next.js 16 / React 19 / TypeScript
- Tailwind CSS 4、Radix UI
- Firebase Authentication / Firestore
- OpenAI API、Google Gemini API
- Yahoo Finance、EDINET API、PAY.JP

## ローカル開発

公開アプリは [nolenn.com](https://nolenn.com) から利用できます。以下は開発に参加する場合の手順です。

### 必要なもの

- Node.js と npm
- Firebase プロジェクト（ログイン機能を利用する場合）
- OpenAI API キー（銘柄分析を利用する場合）

### インストールと起動

```bash
npm ci
```

プロジェクトのルートに `.env.local` を作成し、利用する機能に応じて下記の環境変数を設定します。開発サーバーを起動する場合は次のコマンドを実行します。

```bash
npm run dev
```

開発サーバーは通常 `http://localhost:3000` で起動します。

## 環境変数

`.env.local` に設定します。APIキーや秘密鍵は公開リポジトリへコミットしないでください。

| 変数 | 必須 | 用途 |
| --- | --- | --- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | はい | Firebase クライアント設定 |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | はい | Firebase Authentication |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | はい | Firebase プロジェクト |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | はい | Firebase アプリ |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | 任意 | Firebase Storage 設定 |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | 任意 | Firebase 設定 |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | 任意 | Firebase Analytics 設定 |
| `OPENAI_API_KEY` | 分析に必要 | AI分析と企業名からの銘柄推定 |
| `GEMINI_API_KEY` | 任意 | 関連銘柄候補のAI生成 |
| `SUGGESTION_GEMINI_MODEL` | 任意 | 候補生成モデル。既定値は `gemini-2.5-flash` |
| `EDINET_SUBSCRIPTION_KEY` | 任意 | EDINET API キー。`EDINET_API_KEY` も利用できます |
| `FMP_API_KEY` | 任意 | Financial Modeling Prep の企業ロゴ取得 |
| `NEXT_PUBLIC_PAYJP_PUBLIC_KEY` | Pro決済に必要 | PAY.JP の公開キー |
| `PAYJP_SECRET_KEY` | Pro決済に必要 | PAY.JP の秘密キー（サーバー側） |
| `PAYJP_PLAN_ID` | Pro決済に必要 | PAY.JP の定期課金プランID |

Firebase の設定値は Firebase コンソールから取得してください。サインイン方法でメール/パスワードを有効にし、Firestore を作成してください。決済を使う場合は PAY.JP 側でプランを用意し、公開キー・秘密キー・プランIDを設定します。

Firebase、PAY.JP、Gemini、EDINET、FMP の設定がない場合、一部機能は利用できないか、データを取得できません。銘柄分析には `OPENAI_API_KEY` が必要です。Yahoo Finance の公開エンドポイントを使う市場データ取得には追加キーは不要ですが、取得可否は外部サービスに依存します。

## npm スクリプト

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | 開発サーバーを起動 |
| `npm run build` | 本番用ビルド |
| `npm start` | ビルド済みアプリを起動 |
| `npm run lint` | ESLint を実行 |

## 主な画面・API

- `/` — サービス紹介
- `/dashboard` — 銘柄検索・比較、分析の保存
- `/sign-in`、`/sign-up` — ログイン・アカウント作成
- `/pricing`、`/checkout` — プラン・決済
- `/account` — アカウント設定
- `/api/insights` — 企業分析
- `/api/company-info` — 企業・市場情報
- `/api/suggestions` — 関連銘柄候補
- `/api/payments` — PAY.JP 定期課金

## 注意事項

本アプリが表示する分析・スコアは情報整理を支援するもので、投資助言や将来のリターンを保証するものではありません。投資判断は最新の一次資料やご自身の状況を確認のうえ行ってください。外部データの内容・更新頻度・提供状況は各サービスに依存します。

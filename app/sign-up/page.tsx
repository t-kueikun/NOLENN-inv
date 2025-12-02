"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import type { FirebaseError } from "firebase/app"
import { firebaseApp } from "@/lib/firebase"

export default function SignUpPage() {
  const router = useRouter()
  const auth = getAuth(firebaseApp)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (loading) return
    setError(null)
    setInfo(null)

    const trimmedEmail = email.trim()
    const trimmedName = name.trim()
    const trimmedPassword = password.trim()

    if (!trimmedEmail || !trimmedName || !trimmedPassword) {
      setError("名前・メールアドレス・パスワードを入力してください。")
      return
    }

    setLoading(true)
    try {
      const { user } = await createUserWithEmailAndPassword(auth, trimmedEmail, trimmedPassword)
      await updateProfile(user, { displayName: trimmedName })
      setInfo("アカウントを作成しました。ダッシュボードへ移動します。")
      router.push("/dashboard")
    } catch (err) {
      let message = "アカウント作成に失敗しました。もう一度お試しください。"
      const code = typeof err === "object" && err && "code" in err ? (err as FirebaseError).code : null
      switch (code) {
        case "auth/invalid-email":
          message = "メールアドレスの形式が正しくありません。正しい形式で入力してください。"
          break
        case "auth/email-already-in-use":
          message = "このメールアドレスは既に登録されています。ログインをお試しください。"
          break
        case "auth/weak-password":
          message = "パスワードが安全ではありません。8文字以上で英数字を含めてください。"
          break
        case "auth/operation-not-allowed":
          message = "この認証方法は有効化されていません。管理者に Firebase コンソールで Email/パスワード認証を有効にするよう依頼してください。"
          break
        default:
          if (err instanceof Error && err.message) {
            message = message + ` (${err.message})`
          }
      }
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="px-6 py-16">
        <div className="mx-auto w-full max-w-md rounded-3xl border border-gray-200 bg-white p-10 shadow-sm">
          <h1 className="text-2xl font-semibold text-gray-900">Sign up</h1>
          <p className="mt-3 text-sm text-gray-600">メールアドレスとパスワードでアカウントを作成します。</p>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-700">
                Name
              </label>
              <Input id="name" placeholder="山田 太郎" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="8文字以上"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {info && <p className="text-sm text-green-600">{info}</p>}

            <Button type="submit" className="w-full rounded-full font-semibold" disabled={loading}>
              {loading ? "Creating..." : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            すでにアカウントがありますか？{" "}
            <Link href="/sign-in" className="font-medium text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}

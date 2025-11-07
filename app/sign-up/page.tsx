"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { getAuth, updateProfile, createUserWithEmailAndPassword } from "firebase/auth"
import { firebaseApp } from "@/lib/firebase"

export default function SignUpPage() {
  const router = useRouter()
  const auth = getAuth(firebaseApp)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (loading) return
    setError(null)

    if (!email || !password || !name) {
      setError("すべての項目を入力してください。")
      return
    }

    setLoading(true)
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(user, { displayName: name })
      router.push("/dashboard")
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "アカウント作成に失敗しました。もう一度お試しください。"
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
          <p className="mt-3 text-sm text-gray-600">
            アカウントを作成して、企業比較ダッシュボードと保存機能を利用しましょう。
          </p>

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

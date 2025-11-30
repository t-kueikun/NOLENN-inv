export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16 text-foreground">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Privacy Policy</p>
        <h1 className="text-3xl font-semibold">プライバシーポリシー</h1>
        <p className="text-sm text-muted-foreground">NOLENN（以下、「当サービス」）は、ユーザーの個人情報を適切に取り扱うため、以下の方針を定めます。</p>
      </div>

      <div className="mt-10 space-y-8 text-sm leading-7 text-muted-foreground">
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">1. 取得する情報</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>アカウント登録情報（メールアドレス、氏名などユーザーが入力する内容）</li>
            <li>サービス利用データ（アクセスログ、閲覧・入力したティッカー情報など）</li>
            <li>お問い合わせ時にいただく情報</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">2. 利用目的</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>本サービスの提供・運営・改善のため</li>
            <li>問い合わせ対応や重要なお知らせの送付のため</li>
            <li>不正行為の防止、セキュリティ確保のため</li>
            <li>統計データの作成（個人を特定しない形での分析）</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">3. 第三者提供</h2>
          <p>法令に基づく場合を除き、本人の同意なく個人情報を第三者へ提供しません。</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">4. 委託</h2>
          <p>サービス運営上、業務の一部を外部に委託する場合があります。その際は委託先を適切に監督します。</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">5. 安全管理</h2>
          <p>不正アクセスや紛失、改ざん、漏えいを防止するために必要かつ適切な安全管理措置を講じます。</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">6. 開示・訂正・削除等</h2>
          <p>ユーザーは、保有個人データの開示、訂正、利用停止等を求めることができます。問い合わせ窓口までご連絡ください。</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">7. Cookie 等の利用</h2>
          <p>利便性向上や利用状況の分析のために Cookie や類似技術を利用することがあります。ブラウザの設定で無効化することも可能ですが、一部機能に制限が生じる場合があります。</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">8. 改定</h2>
          <p>本ポリシーは必要に応じて改定することがあります。重要な変更がある場合は、本サービス上で告知します。</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">9. お問い合わせ</h2>
          <p>本ポリシーに関するお問い合わせは、サポート窓口までご連絡ください。</p>
        </section>
      </div>
    </main>
  )
}

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16 text-foreground">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Terms of Service</p>
        <h1 className="text-3xl font-semibold">利用規約</h1>
        <p className="text-sm text-muted-foreground">NOLENN の提供するサービス（以下、「本サービス」）をご利用いただく際の条件を定めるものです。</p>
      </div>

      <div className="mt-10 space-y-8 text-sm leading-7 text-muted-foreground">
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">第1条（適用）</h2>
          <p>本規約は、ユーザーが本サービスを利用する際の一切の行為に適用されます。別途ガイドライン等がある場合、これらも本規約の一部を構成します。</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">第2条（アカウント）</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>登録情報は真実かつ最新の内容を提供してください。</li>
            <li>アカウントの管理責任はユーザー本人にあり、第三者への譲渡・貸与を禁止します。</li>
            <li>不正利用を検知した場合、当サービスはアカウント停止等の措置を取ることがあります。</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">第3条（禁止事項）</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>法令または公序良俗に反する行為</li>
            <li>本サービスの運営を妨げる行為、過度な負荷を与える行為</li>
            <li>他の利用者の情報を不正に収集・利用する行為</li>
            <li>当サービスまたは第三者の知的財産権、プライバシーその他権利を侵害する行為</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">第4条（提供の停止・変更）</h2>
          <p>当サービスは、システム保守や不可抗力等により本サービスの全部または一部を中断・終了する場合があります。その際、可能な範囲で事前に通知します。</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">第5条（免責）</h2>
          <p>本サービスの利用により発生した損害について、当サービスは直接的かつ通常の損害を除き責任を負わないものとします。投資判断等は自己責任で行ってください。</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">第6条（規約の変更）</h2>
          <p>当サービスは、必要に応じて本規約を変更することができます。変更後の内容は本サービス上での掲示または通知後に効力を生じます。</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">第7条（準拠法・裁判管轄）</h2>
          <p>本規約は日本法に準拠し、本サービスに関して紛争が生じた場合、東京地方裁判所を第一審の専属的合意管轄裁判所とします。</p>
        </section>
      </div>
    </main>
  )
}

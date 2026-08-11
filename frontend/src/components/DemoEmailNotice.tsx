interface DemoEmailNoticeProps {
  onClose: () => void
}

export default function DemoEmailNotice({ onClose }: DemoEmailNoticeProps) {
  return (
    <div className="demo-notice-backdrop" role="presentation">
      <section className="demo-notice" role="dialog" aria-modal="true" aria-labelledby="demo-notice-title">
        <div className="demo-notice-icon" aria-hidden="true">!</div>
        <h2 id="demo-notice-title">Projeto demonstrativo</h2>
        <p>
          Não use seu e-mail real. Este projeto não possui integração com Google,
          Gmail ou outros provedores de contas. Use um endereço fictício somente
          para testar o aplicativo.
        </p>
        <button type="button" onClick={onClose} autoFocus>Entendi</button>
      </section>
    </div>
  )
}

import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/join/$code')({
  component: JoinGame,
})

function JoinGame() {
  const { code } = Route.useParams()

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-5xl font-black text-gold-gradient mb-4">جاوب</h1>
        <p className="text-jawwib-text-dim mb-6">انضم للعبة</p>

        <div className="game-card p-6 mb-6">
          <p className="text-jawwib-text-dim text-sm mb-2">كود الغرفة</p>
          <p className="text-3xl font-bold text-gold-gradient tracking-[0.3em]">{code}</p>
        </div>

        <JoinForm code={code} />
      </div>
    </div>
  )
}

function JoinForm({ code }: { code: string }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const name = formData.get('name') as string
        if (name?.trim()) {
          // In production, this connects via WebSocket
          // For demo, redirect to home with join params
          window.location.href = `/?join=${code}&name=${encodeURIComponent(name)}`
        }
      }}
    >
      <input
        name="name"
        type="text"
        placeholder="ادخل اسمك..."
        className="w-full px-4 py-3 rounded-xl bg-jawwib-surface border border-jawwib-border
          text-jawwib-text placeholder:text-jawwib-text-dim/50 focus:border-jawwib-gold
          focus:outline-none transition-colors mb-4"
        maxLength={20}
        required
      />
      <button type="submit" className="btn-gold w-full text-lg py-3">
        انضم! 🚀
      </button>
    </form>
  )
}

import { createFileRoute } from '@tanstack/react-router'
import { GameApp } from '@/components/GameApp'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <ErrorBoundary>
      <GameApp />
    </ErrorBoundary>
  )
}

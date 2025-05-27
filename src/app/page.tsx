import { CommunicationSystem } from '@/components/communication-system'
import { ThemeToggle } from '@/components/theme-toggle'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 bg-background">
      <div className="flex flex-row items-center justify-between w-full max-w-7xl mb-6">
        <h1 className="text-center text-2xl md:text-3xl font-bold">
          A&B Secure
        </h1>
        <ThemeToggle />
      </div>

      <div className="w-full max-w-7xl">
        <CommunicationSystem />
      </div>
    </main>
  )
}

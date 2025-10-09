import React, { useState } from 'react'
import Board from './components/Board'
import RightPanel from './components/RightPanel'
import { useWallet } from './hooks/useWallet'
import { DifficultyKey } from './types'

function calcReward(minutes:number, diff: DifficultyKey){
  const multiplier = diff === 'easy' ? 1 : diff === 'medium' ? 3 : 5
  const base = Math.max(0.001, 0.5 / (1 + minutes))
  return base * multiplier
}

export default function App(){
  // ✅ Lấy thêm provider từ useWallet
  const { address, chainId, connect, disconnect, connecting, error, provider } = useWallet()

  const [earnedReward, setEarnedReward] = useState(0)
  const [lastResult, setLastResult] = useState<'won'|'lost'|'idle'|'playing'>('idle')
  const [seconds, setSeconds] = useState(0)
  const [difficulty, setDifficulty] = useState<DifficultyKey>('easy')

  const onResult = (status:'won'|'lost'|'idle'|'playing', s:number, d:DifficultyKey) => {
    setLastResult(status)
    setSeconds(s)
    setDifficulty(d)
    if(status==='won'){
      const minutes = Math.floor(s/60)
      setEarnedReward(Number(calcReward(minutes, d).toFixed(6)))
    } else {
      setEarnedReward(0)
    }
  }

  return (
    <div className="min-h-screen w-full text-white">
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <img src="/images/logo.png" alt="logo" className="h-7 w-7 rounded" />
            <div className="text-xl font-bold neon-title">ZTC Minesweeper</div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {!address ? (
              <button
                onClick={connect}
                disabled={connecting}
                className="px-3 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50"
              >
                {connecting? 'Connecting...' : 'Connect Wallet'}
              </button>
            ) : (
              <>
                <div className="text-sm text-zinc-300">Chain: {chainId ?? '—'}</div>
                <button
                  onClick={disconnect}
                  className="px-3 py-2 rounded-md bg-zinc-800 hover:bg-zinc-700"
                >
                  Disconnect
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main
        className="mx-auto max-w-7xl px-6 py-6 grid gap-6 items-start"
        style={{ gridTemplateColumns: '1fr 320px' }}
      >
        <section className="overflow-auto">
          <div className="w-fit mx-auto">
            {/* ✅ Truyền provider xuống Board để Claim on-chain */}
            <Board onResult={onResult} canPlay={!!address} provider={provider} />
          </div>
        </section>

        <aside className="space-y-3">
          <RightPanel
            address={address}
            chainId={chainId}
            seconds={seconds}
            lastResult={lastResult}
            difficulty={difficulty}
            earnedReward={earnedReward}
          />
          {error && (
            <div className="mt-3 p-3 rounded-md bg-red-900/40 border border-red-700 text-sm">
              {error}
            </div>
          )}
        </aside>
      </main>
    </div>
  )
}


import React from 'react'
import { DifficultyKey } from '../types'

function shorten(addr?: string | null){
  if(!addr) return '—'
  return addr.slice(0,6) + '...' + addr.slice(-4)
}

export default function RightPanel({
  address, chainId, seconds, lastResult, difficulty, earnedReward
}:{
  address: string | null
  chainId: string | null
  seconds: number
  lastResult: 'won'|'lost'|'idle'|'playing'
  difficulty: DifficultyKey
  earnedReward: number
}){
  return (
    <div className="space-y-3">
      <div className="p-4 rounded-lg border border-zinc-700 bg-zinc-900/80 backdrop-blur-sm neon-card text-white">
        <div className="text-lg font-semibold mb-2">🔗 Wallet & Network</div>
        <div className="text-sm">Wallet: <span className="font-mono">{shorten(address)}</span></div>
        <div className="text-sm">Chain ID: <span className="font-mono">{chainId ?? '—'}</span></div>
      </div>

      <div className="p-4 rounded-lg border border-zinc-700 bg-zinc-900/80 backdrop-blur-sm neon-card text-white">
        <div className="text-lg font-semibold mb-2">⏱ Status</div>
        <div className="text-sm">Play time: <span className="font-mono">{String(Math.floor(seconds/60)).padStart(2,'0')}:{String(seconds%60).padStart(2,'0')}</span></div>
        <div className="text-sm">Difficulty: <span className="font-mono">{difficulty}</span></div>
        <div className="text-sm">Result: <span className="font-mono">{lastResult.toUpperCase()}</span></div>
      </div>

      <div className="p-4 rounded-lg border border-zinc-700 bg-zinc-900/80 backdrop-blur-sm neon-card text-white">
        <div className="text-lg font-semibold mb-2">🏆 Simulated Reward</div>
        {lastResult === 'won' && earnedReward > 0 ? (
          <div className="text-sm">Earned ZTC: <span className="font-mono">{earnedReward.toFixed(6)}</span></div>
        ) : (
          <div className="text-sm text-zinc-400">No reward — you need to WIN.</div>
        )}
      </div>
    </div>
  )
}

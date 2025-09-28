import React from 'react'
import { CellData } from '../utils/minesweeper'

const colors: Record<number, string> = {
  1: 'text-blue-400',
  2: 'text-green-400',
  3: 'text-red-400',
  4: 'text-purple-400',
  5: 'text-yellow-400',
  6: 'text-cyan-400',
  7: 'text-pink-400',
  8: 'text-zinc-200',
}

interface Props {
  data: CellData
  onReveal: () => void
  onToggleFlag: () => void
}

export default function Cell({ data, onReveal, onToggleFlag }: Props){
  const base = 'w-7 h-7 flex items-center justify-center text-sm font-bold select-none m-[1px] rounded'
  const unrevealed = 'bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 cursor-pointer border border-zinc-700 cell-hover'
  const revealed = 'bg-zinc-900 border border-zinc-700 neon-border'
  const flagged = 'bg-zinc-800 border border-zinc-700 neon-border'

  const handleContext = (e: React.MouseEvent) => {
    e.preventDefault()
    onToggleFlag()
  }

  let timer: any = null
  const handleTouchStart = () => {
    timer = setTimeout(()=> onToggleFlag(), 400)
  }
  const cancel = () => {
    if(timer) clearTimeout(timer)
    timer = null
  }

  if(data.revealed){
    return (
      <div className={`${base} ${revealed} ${data.isMine ? 'text-red-400':'text-zinc-200'}`}>
        {data.isMine ? '💣' : (data.adjacent>0 ? <span className={colors[data.adjacent] || ''}>{data.adjacent}</span> : '')}
      </div>
    )
  }

  return (
    <button
      className={`${base} ${data.flagged ? flagged : unrevealed}`}
      onClick={onReveal}
      onContextMenu={handleContext}
      onTouchStart={handleTouchStart}
      onTouchEnd={cancel}
      onTouchCancel={() => { if(timer) clearTimeout(timer) }}
      aria-label={data.flagged ? 'Flagged cell' : 'Hidden cell'}
    >
      {data.flagged ? '🚩' : ''}
    </button>
  )
}
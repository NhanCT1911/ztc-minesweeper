import React, { useEffect, useRef, useState } from 'react'
import Cell from './Cell'
import { BoardState, createEmptyBoard, revealCell, toggleFlag } from '../utils/minesweeper'
import { DifficultyConfig, DifficultyKey } from '../types'

const DIFFICULTIES: Record<DifficultyKey, DifficultyConfig> = {
  easy:   { rows: 9,  cols: 9,  mines: 10, multiplier: 1 },
  medium: { rows: 16, cols: 16, mines: 40, multiplier: 3 },
  hard:   { rows: 16, cols: 30, mines: 99, multiplier: 5 },
}

function formatTime(sec:number){
  const m = Math.floor(sec/60).toString().padStart(2,'0')
  const s = (sec%60).toString().padStart(2,'0')
  return `${m}:${s}`
}

function deepCloneBoard(b: BoardState): BoardState {
  return {
    rows: b.rows,
    cols: b.cols,
    mines: b.mines,
    revealedCount: b.revealedCount,
    flags: b.flags,
    firstClickDone: b.firstClickDone,
    status: b.status,
    mineLocations: new Set<string>(Array.from(b.mineLocations)),
    grid: b.grid.map(row => row.map(cell => ({ ...cell })))
  }
}

function calcReward(minutes:number, diff: DifficultyKey){
  const multiplier = diff === 'easy' ? 1 : diff === 'medium' ? 3 : 5
  const base = Math.max(0.001, 0.5 / (1 + minutes))
  return base * multiplier
}

export default function Board({
  onResult, canPlay
}:{
  onResult:(status:'won'|'lost'|'idle'|'playing', seconds:number, difficulty:DifficultyKey)=>void,
  canPlay:boolean
}){

  const [difficulty, setDifficulty] = useState<DifficultyKey>('easy')
  const [board, setBoard] = useState<BoardState>(() => {
    const d = DIFFICULTIES['easy']
    return createEmptyBoard(d.rows, d.cols, d.mines)
  })
  const [seconds, setSeconds] = useState(0)
  const [showModal, setShowModal] = useState<null | 'won' | 'lost'>(null)
  const timerRef = useRef<number | null>(null)

  // ==== Auto-fit (scale) ====
  const wrapRef = useRef<HTMLDivElement | null>(null)   
  const cardRef = useRef<HTMLDivElement | null>(null)   
  const [scale, setScale] = useState(1)

  const recomputeScale = () => {
    const wrap = wrapRef.current
    const card = cardRef.current
    if(!wrap || !card) return
    card.style.transform = 'scale(1)'
    const available = Math.max(0, wrap.clientWidth - 4)   
    const needed = card.scrollWidth  
    const s = needed > available ? (available / needed) : 1
    card.style.transform = `scale(${s})`
    setScale(s)
  }

  useEffect(() => {
    recomputeScale()
    const onResize = () => recomputeScale()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board.rows, board.cols, difficulty])

  const reset = (dkey: DifficultyKey | null = null) => {
    const key = dkey ?? difficulty
    const d = DIFFICULTIES[key]
    setBoard(createEmptyBoard(d.rows, d.cols, d.mines))
    setSeconds(0)
    setShowModal(null)
    if(timerRef.current){ clearInterval(timerRef.current); timerRef.current = null }
    setTimeout(recomputeScale, 0)
  }

  const handleDifficulty = (key: DifficultyKey) => {
    setDifficulty(key)
    reset(key)
  }

  useEffect(()=>{
    if(board.status==='playing' && !timerRef.current){
      timerRef.current = window.setInterval(()=> setSeconds(s=>s+1), 1000)
    }
    if(board.status==='won' || board.status==='lost'){
      if(timerRef.current){ clearInterval(timerRef.current); timerRef.current = null }
      setShowModal(board.status)
      onResult(board.status, seconds, difficulty)
    }
  }, [board.status])

  const onRevealCell = (r:number,c:number) => {
    if(!canPlay) return
    setBoard(prev => {
      const next: BoardState = deepCloneBoard(prev)
      revealCell(next, r, c)
      return next
    })
  }

  const onFlagCell = (r:number,c:number) => {
    if(!canPlay) return
    setBoard(prev => {
      const next: BoardState = deepCloneBoard(prev)
      toggleFlag(next, r, c)
      return next
    })
  }

  const dconf = DIFFICULTIES[difficulty]
  const remainingMines = Math.max(0, dconf.mines - board.flags)

  return (
    <div className="space-y-3 relative">
      {/* Controls */}
      <div className="flex items-center gap-2">
        <select
          className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-700 px-3 py-2 rounded-md text-white"
          value={difficulty}
          onChange={(e)=> handleDifficulty(e.target.value as DifficultyKey)}
          disabled={!canPlay}
        >
          <option value="easy">Easy — 9x9, 10 mines (x1)</option>
          <option value="medium">Medium — 16x16, 40 mines (x3)</option>
          <option value="hard">Hard — 30x16, 99 mines (x5)</option>
        </select>

        <button
          onClick={()=>reset()}
          className="px-3 py-2 rounded-md bg-zinc-900/80 backdrop-blur-sm hover:bg-zinc-800 border border-zinc-700 disabled:opacity-50 text-white"
          disabled={!canPlay}
        >
          Start / Reset
        </button>

        <div className="ml-auto flex items-center gap-3 text-sm text-white">
          <div>⏱ {formatTime(seconds)}</div>
          <div>💣 Left: {remainingMines}</div>
          <div className="px-2 py-1 rounded bg-zinc-900/80 backdrop-blur-sm border border-zinc-700">
            {board.status.toUpperCase()}
          </div>
        </div>
      </div>
      <div ref={wrapRef} className="w-full overflow-hidden">
        <div
          ref={cardRef}
          className="inline-block bg-zinc-900/80 backdrop-blur-sm p-2 rounded-lg border border-zinc-700 shadow-lg origin-top-left"
          style={{ transform: `scale(${scale})`, lineHeight: 0 }}
        >
          {!canPlay && (
            <div className="absolute inset-0 z-10 bg-zinc-900/85 backdrop-blur-md flex items-center justify-center rounded-lg">
              <div className="text-center text-white">
                <div className="text-xl font-semibold">🔐 Please Connect Wallet to play</div>
                <div className="text-sm text-zinc-300 mt-1">Use the “Connect Wallet” button at the top.</div>
              </div>
            </div>
          )}

          {board.grid.map((row, ri)=>(
            <div key={ri} className="flex">
              {row.map((cell, ci)=>(
                <Cell
                  key={`${ri}-${ci}`}
                  data={cell}
                  onReveal={()=> onRevealCell(ri,ci)}
                  onToggleFlag={()=> onFlagCell(ri,ci)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60">
          <div className="w-80 rounded-xl border border-zinc-700 bg-zinc-900 p-5 shadow-xl text-center text-white">
            {showModal==='won' ? (
              <>
                <div className="text-2xl font-semibold text-green-400">🎉 Congratulations, you win!</div>
                <div className="mt-2 text-sm text-zinc-300">Time: {formatTime(seconds)}</div>
                <div className="mt-1 text-sm text-emerald-400 font-semibold">
                  Simulated ZTC earned: {calcReward(Math.floor(seconds/60), difficulty).toFixed(6)}
                </div>
              </>
            ) : (
              <>
                <div className="text-2xl font-semibold text-red-400">💥 Boom! You hit a mine</div>
                <div className="mt-2 text-sm text-zinc-300">Time: {formatTime(seconds)}</div>
              </>
            )}
            <div className="mt-4 flex gap-2 justify-center">
              <button onClick={()=>setShowModal(null)} className="px-3 py-2 rounded-md bg-zinc-800 hover:bg-zinc-700 border border-zinc-700">Close</button>
              <button onClick={()=>{ setShowModal(null); reset(); }} className="px-3 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500">Play again</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

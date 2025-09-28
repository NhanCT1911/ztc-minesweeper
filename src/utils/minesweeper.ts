
export interface CellData {
  row: number
  col: number
  isMine: boolean
  adjacent: number
  revealed: boolean
  flagged: boolean
}

export type BoardStatus = 'idle' | 'playing' | 'won' | 'lost'

export interface BoardState {
  grid: CellData[][]
  rows: number
  cols: number
  mines: number
  revealedCount: number
  flags: number
  status: BoardStatus
  firstClickDone: boolean
  mineLocations: Set<string>
}

const dirs = [
  [-1,-1],[-1,0],[-1,1],
  [0,-1],        [0,1],
  [1,-1],[1,0],[1,1]
]

const key = (r:number,c:number)=> `${r}:${c}`

export function createEmptyBoard(rows:number, cols:number, mines:number): BoardState {
  const grid: CellData[][] = Array.from({length: rows}, (_,r)=> (
    Array.from({length: cols}, (_,c)=> ({
      row: r, col: c,
      isMine: false,
      adjacent: 0,
      revealed: false,
      flagged: false,
    } as CellData))
  ))
  return {
    grid, rows, cols, mines,
    revealedCount: 0,
    flags: 0,
    status: 'idle',
    firstClickDone: false,
    mineLocations: new Set<string>(),
  }
}

function placeMines(board: BoardState, safeR:number, safeC:number){
  // avoid first click cell and its neighbors
  const forbidden = new Set<string>()
  forbidden.add(key(safeR, safeC))
  for(const [dr,dc] of dirs){
    const nr = safeR + dr, nc = safeC + dc
    if(nr>=0 && nr<board.rows && nc>=0 && nc<board.cols){
      forbidden.add(key(nr,nc))
    }
  }
  let placed = 0
  while(placed < board.mines){
    const r = Math.floor(Math.random()*board.rows)
    const c = Math.floor(Math.random()*board.cols)
    const k = key(r,c)
    if(forbidden.has(k)) continue
    if(board.grid[r][c].isMine) continue
    board.grid[r][c].isMine = true
    board.mineLocations.add(k)
    placed++
  }
  // compute adjacency numbers
  for(let r=0;r<board.rows;r++){
    for(let c=0;c<board.cols;c++){
      if(board.grid[r][c].isMine){ board.grid[r][c].adjacent = -1; continue }
      let count = 0
      for(const [dr,dc] of dirs){
        const nr=r+dr, nc=c+dc
        if(nr>=0&&nr<board.rows&&nc>=0&&nc<board.cols && board.grid[nr][nc].isMine) count++
      }
      board.grid[r][c].adjacent = count
    }
  }
}

export function revealCell(board: BoardState, r:number, c:number): 'lost' | 'continue' | 'won' {
  const cell = board.grid[r][c]
  if(cell.revealed || cell.flagged) return 'continue'

  if(!board.firstClickDone){
    placeMines(board, r, c)
    board.firstClickDone = true
    board.status = 'playing'
  }

  if(cell.isMine){
    // reveal all mines
    for(const loc of board.mineLocations){
      const [rr,cc] = loc.split(':').map(Number)
      board.grid[rr][cc].revealed = true
    }
    cell.revealed = true
    board.status = 'lost'
    return 'lost'
  }

  // flood fill for zeros
  const stack: Array<[number,number]> = [[r,c]]
  while(stack.length){
    const [cr,cc] = stack.pop()!
    const target = board.grid[cr][cc]
    if(target.revealed || target.flagged) continue
    target.revealed = true
    board.revealedCount++
    if(target.adjacent === 0){
      for(const [dr,dc] of dirs){
        const nr=cr+dr, nc=cc+dc
        if(nr>=0&&nr<board.rows&&nc>=0&&nc<board.cols){
          const ncell = board.grid[nr][nc]
          if(!ncell.revealed && !ncell.flagged && !ncell.isMine){
            stack.push([nr,nc])
          }
        }
      }
    }
  }

  const totalSafe = board.rows*board.cols - board.mines
  if(board.revealedCount >= totalSafe){
    board.status = 'won'
    return 'won'
  }
  return 'continue'
}

export function toggleFlag(board: BoardState, r:number, c:number){
  const cell = board.grid[r][c]
  if(cell.revealed) return
  cell.flagged = !cell.flagged
  board.flags += cell.flagged ? 1 : -1
}

export type DifficultyKey = 'easy' | 'medium' | 'hard'

export interface DifficultyConfig {
  rows: number
  cols: number
  mines: number
  multiplier: number
}
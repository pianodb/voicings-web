import type { PitchClassData } from "./types"

export function loadPitchClassCsv(csvData: string): PitchClassData[] {
  const lines = csvData.split('\n')
  const data: PitchClassData[] = lines.slice(1)
    .filter((line: string) => line.trim())
    .map((line: string, idx: number) => {
      const values = line.split(',')
      return {
        frequency: parseInt(values[0]),
        duration: parseFloat(values[1]),
        pcid: parseInt(values[2]),
        rank: idx + 1
      }
    })
  return data
}
import pcidThesaurusData from '../assets/pcid_thesaurus.tsv?raw'
import { calculateIntervalVector, unpackPitchClass } from './pitchClass'

export interface PcidThesaurusEntry {
  forteNumber: string
  carterNumber: number | null
  complement: string
  primePcid: number | null
  rootPcid: number | null
  pcids: number[]
  possibleSpacings: string
}

export interface PcidThesaurusData {
  entries: PcidThesaurusEntry[]

  /**
   * Convert a PCID to its thesaurus entry
   */
  pcidToEntry: Map<number, PcidThesaurusEntry>
}

function parseNumberOrNull(value: string): number | null {
  if (!value || value.trim() === '') return null
  const parsed = parseInt(value.trim())
  return isNaN(parsed) ? null : parsed
}

function parsePcids(pcidsString: string): number[] {
  if (!pcidsString || pcidsString.trim() === '') return []
  return pcidsString.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n))
}

export function loadPcidThesaurus(): PcidThesaurusData {
  const lines = pcidThesaurusData.split('\n')
  const entries: PcidThesaurusEntry[] = []
  const pcidToEntry = new Map<number, PcidThesaurusEntry>()

  // Skip header line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const columns = line.split('\t')
    // if (columns.length < 9) continue

    const entry: PcidThesaurusEntry = {
      forteNumber: columns[0] || '',
      carterNumber: parseNumberOrNull(columns[1]),
      complement: columns[2] || '',
      primePcid: parseNumberOrNull(columns[3]),
      rootPcid: parseNumberOrNull(columns[4]),
      pcids: parsePcids(columns[5]),
      possibleSpacings: columns[6] || '',
      // primeForm: columns[1] || '',
      // intervalVector: columns[2] || '',
      // carterNumber: columns[3] || '',
      // possibleSpacings: columns[4] || '',
      // complement: columns[5] || '',
      // primePcid: parseNumberOrNull(columns[6]),
      // rootPcid: parseNumberOrNull(columns[7]),
      // pcids: parsePcids(columns[8])
    }

    entries.push(entry)

    // Map each PCID to this entry
    entry.pcids.forEach(pcid => {
      pcidToEntry.set(pcid, entry)
    })
  }
  console.log(entries)

  return { entries, pcidToEntry }
}

// Cache the loaded data
let cachedThesaurusData: PcidThesaurusData | null = null

export function getPcidThesaurusData(): PcidThesaurusData {
  if (!cachedThesaurusData) {
    cachedThesaurusData = loadPcidThesaurus()
  }
  return cachedThesaurusData
}

export function getPcidThesaurusEntry(pcid: number): PcidThesaurusEntry | null {
  const data = getPcidThesaurusData()
  return data.pcidToEntry.get(pcid) || null
}

export function getPrimeForm(pcid: number): string | null {
  const entry = getPcidThesaurusEntry(pcid)
  const notes = unpackPitchClass(entry?.primePcid || 0)
  return `[${notes.join(' ')}]`
}

export function getIntervalVector(pcid: number): string | null {
  // const entry = getPcidThesaurusEntry(pcid)
  // const intervals = calculateIntervalVector(entry?.primePcid || 0)

  // should 
  const intervals = calculateIntervalVector(pcid)
  return `<${intervals.join(',')}>`
}

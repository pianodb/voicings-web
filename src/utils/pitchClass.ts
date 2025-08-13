// Utility functions for pitch class operations

export interface PitchClass {
  name: string
  semitone: number
  present: boolean
}

export const PITCH_CLASSES = [
  { name: 'C', semitone: 0 },
  { name: 'Db', semitone: 1 },
  { name: 'D', semitone: 2 },
  { name: 'Eb', semitone: 3 },
  { name: 'E', semitone: 4 },
  { name: 'F', semitone: 5 },
  { name: 'Gb', semitone: 6 },
  { name: 'G', semitone: 7 },
  { name: 'Ab', semitone: 8 },
  { name: 'A', semitone: 9 },
  { name: 'Bb', semitone: 10 },
  { name: 'B', semitone: 11 }
]

// Base64 alphabet for encoding voicing differences
const BASE64_ALPHABET = "1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-._~"

/**
 * Pack notes into base64 string based on differences between consecutive notes
 */
export function packNotes(notes: number[]): string | null {
  let result = ""
  if (!notes || notes.length === 0) {
    return result
  }

  let prev = notes[0]
  for (let i = 1; i < notes.length; i++) {
    const note = notes[i]
    const diff = note - prev
    if (diff <= 0) {
      throw new Error("Notes must be in ascending order")
    }
    if (diff > BASE64_ALPHABET.length) {
      // invalid - gap too large
      return null
    }
    // valid diff is in range 1 to len(BASE64_ALPHABET)
    // need to subtract one for zero-based indexing
    result += BASE64_ALPHABET[diff - 1]
    prev = note
  }
  return result
}

/**
 * Unpack base64 string back to notes array
 */
export function unpackNotes(input: string): number[] {
  let cur = 0
  const result = [0] // start with first note at 0
  
  for (const char of input) {
    const index = BASE64_ALPHABET.indexOf(char)
    if (index === -1) {
      throw new Error(`Invalid character in input: ${char}`)
    }
    const diff = index + 1 // add 1 because we subtracted 1 when packing
    cur += diff
    result.push(cur)
  }
  return result
}

/**
 * Pack a list of pitch classes into an integer
 * Assumes root (0) is always present, so we only encode bits 1-11
 */
export function packPitchClass(notes: number[]): number {
  let packed = 0
  for (const note of notes) {
    if (note < 0 || note > 11) {
      throw new Error("Pitch class must be in range 0-11")
    }
    if (note === 0) {
      continue // skip 0: root is always assumed
    }
    packed |= (1 << (note - 1))
  }
  return packed
}

/**
 * Unpack a PCID integer into a list of pitch classes
 */
export function unpackPitchClass(pcid: number): number[] {
  if (pcid < 0 || pcid > 2047) {
    throw new Error("PCID must be in range 0-2047")
  }
  const notes = [0] // always include root
  for (let i = 1; i < 12; i++) {
    if (pcid & (1 << (i - 1))) {
      notes.push(i)
    }
  }
  return notes
}

// Updated functions using the correct unpacking logic
export function pcidToPitchClasses(pcid: number): PitchClass[] {
  const noteNumbers = unpackPitchClass(pcid)
  const pitchClasses: PitchClass[] = []
  
  for (let i = 0; i < 12; i++) {
    const present = noteNumbers.includes(i)
    pitchClasses.push({
      name: PITCH_CLASSES[i].name,
      semitone: i,
      present
    })
  }
  
  return pitchClasses
}

export function getPresentPitches(pcid: number, prettyPrint=true): string[] {
  const noteNumbers = unpackPitchClass(pcid)
  const pretty = noteNumbers.map(noteNum => PITCH_CLASSES[noteNum].name);

  // Pretty print
  // Use heuristic: if A or G is present, then use F# instead of Gb
  if (prettyPrint && pretty.includes('Gb') && (pretty.includes('A') || pretty.includes('G'))) {
    const index = pretty.indexOf('Gb')
    pretty[index] = 'F#'
  }
  return pretty;
}

export function pcidToBinary(pcid: number): string {
  // Show the actual bit pattern used in the encoding
  // Bit 0 = note 1 (Db), Bit 1 = note 2 (D), etc.
  return pcid.toString(2).padStart(11, '0')
}

export function getChordName(pcid: number): string {
  const pitches = getPresentPitches(pcid)
  if (pitches.length === 0) return 'No pitches'
  if (pitches.length === 1) return pitches[0]
  
  // Simple chord naming - just list the pitches
  return pitches.join(' ')
}

/**
 * Get note names from MIDI note numbers
 */
export function getNoteName(midiNote: number): string {
  const noteNames = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
  const octave = Math.floor(midiNote / 12) - 1
  const noteName = noteNames[midiNote % 12]
  return `${noteName}${octave}`
}

/**
 * Get note information from a digest string
 */
export function getNotesFromDigest(digest: string): {
  notes: number[]
  noteNames: string[]
  pitchClasses: number[]
  lowestNote: number
  highestNote: number
  span: number
} {
  const notes = unpackNotes(digest)
  const noteNames = notes.map(note => getNoteName(note + 12))
  const pitchClasses = [...new Set(notes.map(note => note % 12))].sort((a, b) => a - b)
  const lowestNote = Math.min(...notes)
  const highestNote = Math.max(...notes)
  const span = highestNote - lowestNote
  
  return {
    notes,
    noteNames,
    pitchClasses,
    lowestNote,
    highestNote,
    span
  }
}

/**
 * Get voicing analysis from digest
 */
export function analyzeVoicing(digest: string): {
  noteCount: number
  noteNames: string[]
  pitchClasses: string[]
  span: string
  intervals: number[]
  intervalNames: string[]
} {
  const noteInfo = getNotesFromDigest(digest)
  const intervals = []
  const intervalNames = []
  
  // Calculate intervals between consecutive notes
  for (let i = 1; i < noteInfo.notes.length; i++) {
    const interval = noteInfo.notes[i] - noteInfo.notes[i - 1]
    intervals.push(interval)
    
    // Basic interval naming
    const intervalName = interval === 1 ? 'min2' :
                        interval === 2 ? 'maj2' :
                        interval === 3 ? 'min3' :
                        interval === 4 ? 'maj3' :
                        interval === 5 ? 'P4' :
                        interval === 6 ? 'tritone' :
                        interval === 7 ? 'P5' :
                        interval === 8 ? 'min6' :
                        interval === 9 ? 'maj6' :
                        interval === 10 ? 'min7' :
                        interval === 11 ? 'maj7' :
                        interval === 12 ? 'octave' :
                        `${interval}st`
    intervalNames.push(intervalName)
  }
  
  const pitchClassNames = noteInfo.pitchClasses.map(pc => PITCH_CLASSES[pc].name)
  
  return {
    noteCount: noteInfo.notes.length,
    noteNames: noteInfo.noteNames,
    pitchClasses: pitchClassNames,
    span: `${noteInfo.span} semitones`,
    intervals,
    intervalNames
  }
}

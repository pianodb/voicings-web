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

export interface NoteInfo {
  notes: number[]
  noteNames: string[]
  pitchClasses: number[]
  lowestNote: number
  highestNote: number
  span: number
}

/**
 * Get note information from a digest string
 */
export function getNotesFromDigest(digest: string): NoteInfo {
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
 * Calculate all inversions of a chord given a PCID
 * Returns an array of objects with the new PCID and inversion info
 */
export function calculateInversions(pcid: number): Array<{pcid: number, inversion: number, rootNote: string}> {
  const pitchClasses = unpackPitchClass(pcid)
  const inversions: Array<{pcid: number, inversion: number, rootNote: string}> = []
  
  // For each pitch class in the chord, create an inversion with that note as root
  pitchClasses.forEach((rootPitchClass, index) => {
    // Create new pitch class array with this note as root (0)
    const invertedPitches = pitchClasses.map(pc => {
      let newPc = pc - rootPitchClass
      if (newPc < 0) newPc += 12 // Wrap around the octave
      return newPc
    }).sort((a, b) => a - b)
    
    // Convert back to PCID
    const newPcid = packPitchClass(invertedPitches)
    
    inversions.push({
      pcid: newPcid,
      inversion: index,
      rootNote: PITCH_CLASSES[rootPitchClass].name
    })
  })
  
  return inversions
}


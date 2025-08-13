import { PITCH_CLASSES } from '../utils/pitchClass'

interface PianoKeyProps {
  note: string
  midiNote: number
  isBlack: boolean
  isPressed: boolean
  onPress: (midiNote: number) => void
  style?: React.CSSProperties
}

interface PianoProps {
  octaves?: number
  startOctave?: number
  selectedNotes: Set<number>
  onNotePress: (midiNote: number) => void
  showLabels?: boolean
}

function PianoKey({ note, midiNote, isBlack, isPressed, onPress, style }: PianoKeyProps) {
  return (
    <div
      className={`piano-key ${isBlack ? 'black' : 'white'} ${isPressed ? 'pressed' : ''}`}
      style={style}
      onClick={() => onPress(midiNote)}
    >
      <span className="key-label">{note}</span>
    </div>
  )
}

export function Piano({ 
  octaves = 1, 
  startOctave = 4, 
  selectedNotes, 
  onNotePress, 
  showLabels = true 
}: PianoProps) {
  // Convert semitone and octave to MIDI note number
  const semitoneToMidi = (semitone: number, octave: number): number => {
    return octave * 12 + semitone
  }

  // Generate all keys for the specified number of octaves
  const generateKeys = () => {
    const whiteKeys: React.ReactNode[] = []
    const blackKeys: React.ReactNode[] = []
    
    for (let octave = 0; octave < octaves; octave++) {
      const currentOctave = startOctave + octave
      
      // White keys in order: C, D, E, F, G, A, B
      const whiteKeyOrder = [0, 2, 4, 5, 7, 9, 11]
      whiteKeyOrder.forEach((semitone) => {
        const midiNote = semitoneToMidi(semitone, currentOctave)
        const noteName = showLabels ? 
          `${PITCH_CLASSES[semitone].name}${currentOctave}` : 
          PITCH_CLASSES[semitone].name
        
        whiteKeys.push(
          <PianoKey
            key={midiNote}
            note={noteName}
            midiNote={midiNote}
            isBlack={false}
            isPressed={selectedNotes.has(midiNote)}
            onPress={onNotePress}
          />
        )
      })
      
      // Black keys: Db, Eb, Gb, Ab, Bb
      const blackKeyOrder = [1, 3, 6, 8, 10]
      blackKeyOrder.forEach((semitone) => {
        const midiNote = semitoneToMidi(semitone, currentOctave)
        const noteName = showLabels ? 
          `${PITCH_CLASSES[semitone].name}${currentOctave}` : 
          PITCH_CLASSES[semitone].name
        
        // Calculate position for black keys
        const basePositions = {
          1: 28,   // Db
          3: 70,   // Eb  
          6: 154,  // Gb
          8: 196,  // Ab
          10: 238  // Bb
        }
        
        const position = basePositions[semitone as keyof typeof basePositions] + (octave * 294)
        
        blackKeys.push(
          <PianoKey
            key={midiNote}
            note={noteName}
            midiNote={midiNote}
            isBlack={true}
            isPressed={selectedNotes.has(midiNote)}
            onPress={onNotePress}
            style={{ left: `${position}px` }}
          />
        )
      })
    }
    
    return { whiteKeys, blackKeys }
  }

  const { whiteKeys, blackKeys } = generateKeys()

  return (
    <div className="piano-container">
      <div className="piano" style={{ width: `${octaves * 294 + 32}px` }}>
        <div className="white-keys">
          {whiteKeys}
        </div>
        <div className="black-keys">
          {blackKeys}
        </div>
      </div>
    </div>
  )
}

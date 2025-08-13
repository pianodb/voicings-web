import { useEffect, useRef } from 'react'
import { pcidToPitchClasses, getPresentPitches, unpackPitchClass } from '../utils/pitchClass'

interface MusicNotationProps {
  pcid?: number
  notes?: number[]
  showTitle?: boolean
}

export function VoicingNotation({ pcid, notes, showTitle = false }: MusicNotationProps) {
  const svgRef = useRef<HTMLDivElement>(null)
  
  // Determine which data source to use
  const isNotesMode = notes && notes.length > 0
  const effectivePcid = isNotesMode ? 0 : (pcid ?? 0)
  
  const pitchClasses = isNotesMode ? [] : pcidToPitchClasses(effectivePcid)
  const presentPitches = isNotesMode ? [] : getPresentPitches(effectivePcid)

  useEffect(() => {
    const renderNotation = async () => {
      if (!svgRef.current) return

      try {
        // Dynamic import for VexFlow
        const { Renderer, Stave, StaveNote, Voice, Formatter, Accidental } = await import('vexflow')
        
        // Clear previous content
        svgRef.current.innerHTML = ''

        const pitchNumbers = isNotesMode ? notes! : unpackPitchClass(effectivePcid)
        if (pitchNumbers.length === 0) {
          svgRef.current.innerHTML = '<div class="no-notes">No notes to display</div>'
          return
        }

        // Create renderer
        const width = 150
        const height = 120
        const renderer = new Renderer(svgRef.current, Renderer.Backends.SVG)
        renderer.resize(width, height)
        const context = renderer.getContext()

        // Create stave
        const stave = new Stave(0, 10, width - 20)
        stave.addClef('treble')
        stave.setContext(context).draw()

        // Convert to VexFlow note names
        let noteKeys: string[]
        
        if (isNotesMode) {
          // Convert MIDI notes (0-88) to VexFlow notation
          noteKeys = notes!.map(midiNote => {
            const noteNames = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
            const octave = Math.floor((midiNote + 12) / 12)
            const noteName = noteNames[midiNote % 12]
            return `${noteName}/${octave}`
          })
        } else {
          // Convert pitch classes to VexFlow note names (existing logic)
          noteKeys = pitchNumbers.map(pitchClass => {
            const noteNames = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
            const noteName = noteNames[pitchClass]
            const octave = 4
            return `${noteName}/${octave}`
          })
        }

        // Heuristic: if A or G is present, then use F# instead of Gb
        if (noteKeys.includes('Gb/4')) {
            if (noteKeys.includes('A/4') || noteKeys.includes('G/4')) {
              const index = noteKeys.indexOf('Gb/4')
              noteKeys[index] = 'F#/4'
            }
        }

        if (noteKeys.length === 1) {
          // Single note
          const note = new StaveNote({
            clef: 'treble',
            keys: noteKeys,
            duration: 'w'
          })

          // Add accidentals for flat notes
          if (noteKeys[0].includes('b')) {
            note.addModifier(new Accidental('b'), 0)
          } else if (noteKeys[0].includes('#')) {
            note.addModifier(new Accidental('#'), 0)
          }

          const voice = new Voice({ num_beats: 4, beat_value: 4 })
          voice.addTickable(note)

          new Formatter().joinVoices([voice]).format([voice], width - 40)
          voice.draw(context, stave)
        } else {
          // Chord
          const chord = new StaveNote({
            clef: 'treble',
            keys: noteKeys,
            duration: 'w'
          })

          // Add accidentals for flat notes
          noteKeys.forEach((key, index) => {
            if (key.includes('b')) {
              chord.addModifier(new Accidental('b'), index)
            } else if (key.includes('#')) {
              chord.addModifier(new Accidental('#'), index)
            }
          })

          const voice = new Voice({ num_beats: 4, beat_value: 4 })
          voice.addTickable(chord)

          new Formatter().joinVoices([voice]).format([voice], width - 40)
          voice.draw(context, stave)
        }
      } catch (error) {
        console.error('Error rendering music notation:', error)
        // Fallback to simple visualization
        if (svgRef.current) {
          if (isNotesMode && notes) {
            svgRef.current.innerHTML = `
              <div class="fallback-notation">
                <h4>Notes: ${chordDisplayNames.join(' ')}</h4>
                <div class="notes-list">
                  ${notes.map(note => `
                    <div class="note-item">
                      MIDI ${note}
                    </div>
                  `).join('')}
                </div>
              </div>
            `
          } else {
            svgRef.current.innerHTML = `
              <div class="fallback-notation">
                <h4>Chord: ${presentPitches.join(' ')}</h4>
                <div class="pitch-circle">
                  ${pitchClasses.map((pc, index) => `
                    <div class="pitch-class ${pc.present ? 'present' : 'absent'}" 
                         style="transform: rotate(${index * 30}deg) translate(50px) rotate(-${index * 30}deg)">
                      ${pc.name.split('/')[0]}
                    </div>
                  `).join('')}
                </div>
              </div>
            `
          }
        }
      }
    }

    renderNotation()
  }, [pcid, notes, isNotesMode, effectivePcid])

  // Generate display names for the chord info
  const chordDisplayNames = isNotesMode && notes 
    ? notes.map(midiNote => {
        const noteNames = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
        const noteName = noteNames[midiNote % 12]
        // Heuristic: if A or G is present, then use F# instead of Gb
        if (noteName === 'Gb' && notes.some(n => noteNames[n % 12] === 'A' || noteNames[n % 12] === 'G')) {
          return 'F#'
        }
        return noteName
      })
    : presentPitches

  return (
    <div className="music-notation">
      {showTitle && (<div className="chord-info">
        <h4>{chordDisplayNames.join(' ')}</h4>
      </div>
      )}
      <div ref={svgRef} className="notation-container" />
    
      <style>{`
        .music-notation {
          background: white;
          border-radius: 8px;
          padding: 15px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          text-align: center;
        }

        .chord-info h4 {
          margin: 0 0 10px 0;
          color: #333;
          font-size: 1rem;
          font-weight: 600;
        }

        .notation-container {
          margin: 10px 0;
          min-height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .fallback-notation {
          text-align: center;
        }

        .fallback-notation .pitch-circle {
          position: relative;
          width: 120px;
          height: 120px;
          margin: 10px auto;
        }

        .fallback-notation .pitch-class {
          position: absolute;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 0.8rem;
          top: 50%;
          left: 50%;
          margin: -12px 0 0 -12px;
        }

        .fallback-notation .pitch-class.present {
          background: #007bff;
          color: white;
          box-shadow: 0 2px 4px rgba(0, 123, 255, 0.3);
        }

        .fallback-notation .pitch-class.absent {
          background: #f8f9fa;
          color: #6c757d;
          border: 1px solid #dee2e6;
        }

        .notes-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
          align-items: center;
        }

        .note-item {
          padding: 4px 8px;
          background: #007bff;
          color: white;
          border-radius: 4px;
          font-size: 0.8rem;
        }

        .no-notes {
          color: #6c757d;
          font-style: italic;
          padding: 20px;
        }

        .binary-display {
          margin-top: 15px;
          padding: 10px;
          background: #f8f9fa;
          border-radius: 6px;
        }

        .binary-display p {
          margin: 0 0 8px 0;
          font-family: 'Courier New', monospace;
          color: #495057;
          font-size: 0.85rem;
        }

        .binary-breakdown {
          display: flex;
          justify-content: center;
          gap: 2px;
        }

        .binary-bit {
          display: inline-block;
          width: 18px;
          height: 18px;
          line-height: 18px;
          text-align: center;
          font-family: 'Courier New', monospace;
          font-size: 0.75rem;
          border-radius: 3px;
        }

        .bit-on {
          background: #28a745;
          color: white;
        }

        .bit-off {
          background: #6c757d;
          color: white;
        }

        .bit-labels {
          display: flex;
          justify-content: center;
          gap: 2px;
          margin-top: 4px;
        }

        .bit-label {
          display: inline-block;
          width: 18px;
          text-align: center;
          font-size: 0.65rem;
          color: #6c757d;
        }

        .note-display {
          display: flex;
          justify-content: center;
          gap: 4px;
          flex-wrap: wrap;
        }

        .midi-note {
          display: inline-block;
          padding: 2px 6px;
          background: #007bff;
          color: white;
          border-radius: 3px;
          font-family: 'Courier New', monospace;
          font-size: 0.75rem;
        }
      `}</style>
    </div>
  )
}
